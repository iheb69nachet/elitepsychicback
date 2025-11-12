import redisClient from '../redis';
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Room, ChatStatus } from "../entities/Room";
import { Server, Socket } from "socket.io";
import { Repository } from "typeorm";
import { UserService } from "./UserService";
import { ChatRequest, ChatRequestStatus } from "../entities/ChatRequest";
import { PsychicSetting } from '../entities/PsychicSetting'; // Assuming PsychicSetting is needed

interface ActiveChat {
  roomIds: number[];
  activeSessions: number;
  startTime: number;
  ratePerSecond: number;
  initialBalance: number;
  maxChatTimeSeconds: number;
  timeLeftSeconds: number;
}

interface SocketWithUser extends Socket {
  userId?: number;
  userRole?: 'client' | 'psychic';
}

export class ChatService {
  private io!: Server;
  private activeChats = new Map<number, ActiveChat>();
  private readonly TIMER_INTERVAL_MS = 60000; // 1 minute
  private readonly SECONDS_PER_MINUTE = 60;

  constructor(
    private readonly messageRepository: Repository<Message>,
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly chatRequestRepository: Repository<ChatRequest>,
    private readonly roomRepository: Repository<Room>,
    private readonly psychicSettingRepository: Repository<PsychicSetting> // Added
  ) {}

  init(io: Server): void {
    this.io = io;
    this.registerSocketHandlers();
    // this.startGlobalTimer(); // Timer will be started when both join
  }

  // ============================================================================
  // Socket Event Handlers
  // ============================================================================

  private registerSocketHandlers(): void {
    this.io.on("connection", (socket: SocketWithUser) => {
      console.log("✅ User connected");

      socket.on("join", (data) => this.handleJoin(socket, data));
      socket.on("joinRoom", (data) => this.handleJoinRoom(socket, data));
      socket.on("getMessages", (data) => this.handleGetMessages(socket, data));
      socket.on("acceptChat", (data) => this.handleAcceptChat(socket, data));
      socket.on("rejectChat", (data) => this.handleRejectChat(data)); // Changed to accept data directly
      socket.on("sendMessage", (data) => this.handleSendMessage(data));
      socket.on("psychicLeaveChat", (data) => this.handlePsychicLeaveChat(data));
      socket.on("join-chat", (data) => this.handleJoinChat(socket, data));
      socket.on("disconnect", () => this.handleDisconnect(socket));
    });
  }

  private async handleJoin(socket: SocketWithUser, { userId }: { userId: number }): Promise<void> {
    socket.join(userId.toString());
    socket.userId = userId;
    await this.userService.setUserOnlineStatus(userId, true);
  }

  private async handleJoinRoom(socket: Socket, { roomId }: { roomId: number }): Promise<void> {
    socket.join(roomId.toString());
    const messages = await this.getMessages(roomId);
    this.io.emit("roomMessages", messages);
  }

  private async handleGetMessages(socket: Socket, { roomId }: { roomId: number }): Promise<void> {
    const messages = await this.getMessages(roomId);
    socket.emit("roomMessages", messages);
  }

  private async handleAcceptChat(
    socket: SocketWithUser,
    { requestId, psychicId }: { requestId: number; psychicId: number }
  ): Promise<void> {
    console.log({psychicId,requestId});
    
    if (!psychicId) return;

    const chatRequest = await this.findPendingChatRequest(requestId, psychicId);
    if (!chatRequest) return;

    chatRequest.status = ChatRequestStatus.ACCEPTED;
    await this.chatRequestRepository.save(chatRequest);

    // Check if an active room already exists between this client and psychic
    let room = await this.roomRepository.findOne({
      where: {
        client: { id: chatRequest.client.id },
        psychic: { id: chatRequest.psychic.id },
        status: ChatStatus.ACTIVE,
      },
    });

    if (!room) {
      // If no active room exists, create a new one
      room = await this.createRoom(chatRequest.client, chatRequest.psychic);
    } else {
      console.log(`Reusing existing active room ${room.id} for client ${chatRequest.client.id} and psychic ${chatRequest.psychic.id}`);
    }
console.log('chat accepted');

    this.io.emit("chatAccepted", {
      psychic: psychicId,
      client: chatRequest.client.id, // Use client.id
      requestId: chatRequest.id,
      roomId: room.id,
    });
  }

  private async handleRejectChat(
    { requestId, psychicId }: { requestId: number; psychicId: number } // Changed to accept psychicId directly
  ): Promise<void> {
    const chatRequest = await this.findPendingChatRequest(requestId, psychicId);
    if (!chatRequest) return;

    chatRequest.status = ChatRequestStatus.REJECTED;
    await this.chatRequestRepository.save(chatRequest);

    this.io.emit("chatRejected", {
      psychic: psychicId,
      client: chatRequest.client.id, // Use client.id
      requestId: chatRequest.id,
    });
  }

  private async handleSendMessage(data: {
    senderId: number;
    roomId: number;
    content: string;
  }): Promise<void> {
    const { senderId, roomId, content } = data;
    const message = await this.createMessage(senderId, roomId, content);
    const messages = await this.getMessages(roomId);

    this.io.emit("receiveMessage", message);
    this.io.emit("roomMessages", messages);
  }

  private async handlePsychicLeaveChat({ roomId }: { roomId: number }): Promise<void> {
    console.log(`Psychic leaving chat room: ${roomId}`);

    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["client"],
    });

    if (!room) {
      console.error(`Room ${roomId} not found.`);
      return;
    }

    await this.endRoom(room);
    this.removeRoomFromActiveChat(room.client.id, roomId);

    this.io.emit("chat-ended", {
      roomId,
      reason: "psychic_left",
      message: "Psychic has left the chat.",
    });

    console.log(`Chat room ${roomId} ended by psychic.`);
  }

  private async handleJoinChat(
    socket: SocketWithUser,
    { roomId, userId, psychicId }: { roomId: number; userId: number; psychicId: number }
  ): Promise<void> {
    console.log(`💬 ${userId?'client':'psychic'} joined chat:`, { roomId, userId, psychicId });

    // Determine user role and store it
    socket.userRole = userId ? 'client' : 'psychic';
    socket.userId = userId??psychicId;

    let room = await this.roomRepository.findOne({ where: { id: roomId }, relations: ["client", "psychic"] });

    if (!room) {
      console.error(`Room ${roomId} not found.`);
      return;
    }

    if (socket.userRole === 'client') {
      room.clientJoined = true;
    } else if (socket.userRole === 'psychic') {
      room.psychicJoined = true;
    }
    await this.roomRepository.save(room);

    // Check if both client and psychic have joined and timer hasn't started
    if (room.clientJoined && room.psychicJoined && !room.timerStarted) {
      await this.initializeNewChatSession(room);
    }

    // Add room to existing session if active chat exists for the client
    const existingChat = this.activeChats.get(room.client.id);

    if (existingChat) {
      this.addRoomToExistingSession(existingChat, roomId);
    }

    // socket.join(userId.toString());
    // socket.join(roomId.toString());
  }

  private async handleDisconnect(socket: SocketWithUser): Promise<void> {
    console.log("❌ User disconnected");

    const userId = socket.userId;
    const userRole = socket.userRole;

    if (!userId) return;

    await this.userService.setUserOnlineStatus(userId, false);

    // If disconnecting user is a psychic, end all their active rooms
    if (userRole === 'psychic') {
      await this.handlePsychicDisconnect(userId);
    }

    // Handle client chat cleanup
    const chat = this.activeChats.get(userId);
    if (chat) {
      chat.activeSessions -= 1;
      if (chat.activeSessions <= 0) {
        this.activeChats.delete(userId);
        console.log(`🧹 Cleaned up chat session for user ${userId}`);
      }
    }
  }

  // ============================================================================
  // Psychic Disconnect Handler
  // ============================================================================

  private async handlePsychicDisconnect(psychicId: number): Promise<void> {
    console.log(`🔴 Psychic ${psychicId} disconnected`);

    // Find all active rooms where this psychic is participating
    const activeRooms = await this.roomRepository.find({
      where: { 
        psychic: { id: psychicId },
        status: ChatStatus.ACTIVE 
      },
      relations: ["client", "psychic"],
    });

    if (activeRooms.length === 0) {
      console.log(`No active rooms found for psychic ${psychicId}`);
      return;
    }

    // End all active rooms for this psychic
    for (const room of activeRooms) {
      await this.endRoom(room);
      this.removeRoomFromActiveChat(room.client.id, room.id);

      // Emit chat-ended to the room
      this.io.to(room.id.toString()).emit("chat-ended", {
        roomId: room.id,
        reason: "psychic_disconnected",
        message: "Psychic has disconnected from the chat.",
      });

      console.log(`✅ Ended room ${room.id} for psychic ${psychicId}`);
    }

    console.log(`🧹 Cleaned up ${activeRooms.length} room(s) for psychic ${psychicId}`);
  }

  // ============================================================================
  // Chat Session Management
  // ============================================================================

  private async initializeNewChatSession(room: Room): Promise<void> {
    // Ensure the timer hasn't already started for this room
    if (room.timerStarted) {
      console.log(`Timer already started for room ${room.id}. Skipping initialization.`);
      return;
    }

    // Fetch client and psychic details if not already loaded in the room object
    const client = await this.userRepository.findOne({ where: { id: room.client.id } });
    const psychic = await this.userRepository.findOne({ where: { id: room.psychic.id }, relations: ["psychicSetting"] });

    if (!client || !psychic || !psychic.psychicSetting) {
      console.error(`Failed to initialize chat session for room ${room.id}: client, psychic, or psychic setting not found.`);
      return;
    }

    const clientBalance = await this.userService.getUserBalance(client.id);
    const ratePerSecond = psychic.psychicSetting.minuteRate;

    const maxChatTimeSeconds = clientBalance > 0 ? clientBalance / ratePerSecond : 0;

    this.activeChats.set(client.id, {
      roomIds: [room.id],
      activeSessions: 1,
      startTime: Date.now(),
      ratePerSecond,
      initialBalance: clientBalance,
      maxChatTimeSeconds,
      timeLeftSeconds: maxChatTimeSeconds * this.SECONDS_PER_MINUTE,
    });

    room.timerStarted = true;
    await this.roomRepository.save(room);

    console.log(`⏱ Timer started for room ${room.id} (client ${client.id}): ${maxChatTimeSeconds}s`);
    
    this.io.emit("timer", {
      userId: client.id,
      roomId: room.id, // Emit roomId as well for better client-side handling
      timeLeft: maxChatTimeSeconds * this.SECONDS_PER_MINUTE,
    });
  }

  private addRoomToExistingSession(chat: ActiveChat, roomId: number): void {
    if (!chat.roomIds.includes(roomId)) {
      chat.roomIds.push(roomId);
    }
    chat.activeSessions += 1;
  }

  private removeRoomFromActiveChat(clientId: number, roomId: number): void {
    const chat = this.activeChats.get(clientId);
    if (!chat) return;

    chat.roomIds = chat.roomIds.filter((id) => id !== roomId);
    
    if (chat.roomIds.length === 0) {
      this.activeChats.delete(clientId);
      console.log(`Cleaned up chat session for client ${clientId} as all rooms ended.`);
    }
  }

  // ============================================================================
  // Timer Management
  // ============================================================================

  private startGlobalTimer(): void {
    setInterval(() => this.processActiveChats(), this.TIMER_INTERVAL_MS);
  }

  private async processActiveChats(): Promise<void> {
    for (const [userId, chat] of this.activeChats.entries()) {
      chat.timeLeftSeconds -= 1;

      if (chat.timeLeftSeconds <= 0) {
        await this.endChatSession(userId, chat, "insufficient_balance");
      } else {
        await this.queueBalanceUpdates(chat.roomIds);
      }
    }
  }

  private async endChatSession(
    userId: number,
    chat: ActiveChat,
    reason: string
  ): Promise<void> {
    for (const roomId of chat.roomIds) {
      this.io.to(roomId.toString()).emit("chat-ended", {
        roomId,
        reason,
        message: "Chat ended due to insufficient balance",
      });

      await this.queueBalanceUpdate(roomId);
    }

    this.activeChats.delete(userId);
    console.log(`🚨 Chat session ended for user ${userId}`);
  }

  private async queueBalanceUpdates(roomIds: number[]): Promise<void> {
    const promises = roomIds.map((roomId) => this.queueBalanceUpdate(roomId));
    await Promise.all(promises);
  }

  private async queueBalanceUpdate(roomId: number): Promise<void> {
    await redisClient.lpush("balance_update_queue", roomId.toString());
  }

  // ============================================================================
  // Database Operations
  // ============================================================================

  private async findPendingChatRequest(
    requestId: number,
    psychicId: number
  ): Promise<ChatRequest | null> {
    return this.chatRequestRepository.findOne({
      where: { id: requestId, psychicId, status: ChatRequestStatus.PENDING },
      relations: ["client", "psychic", "psychic.psychicSetting"],
    });
  }

  private async createRoom(client: User, psychic: User): Promise<Room> {
    const room = this.roomRepository.create({ client, psychic });
    return this.roomRepository.save(room);
  }

  private async endRoom(room: Room): Promise<void> {
    room.status = ChatStatus.ENDED;
    await this.roomRepository.save(room);
  }

  // ============================================================================
  // Public API
  // ============================================================================

  async requestChat(clientId: number, psychicId: number): Promise<ChatRequest> {
    console.log(clientId,psychicId);
    
    const chatRequest = this.chatRequestRepository.create({
      clientId,
      psychicId,
      status: ChatRequestStatus.PENDING,
    });
    await this.chatRequestRepository.save(chatRequest);

    const psychic = await this.userRepository.findOneBy({ id: psychicId });
    
    if (psychic && psychic.socketId) {
      console.log(psychic.socketId);
      this.io.to(psychic.socketId).emit("chatRequest", {
        from: clientId,
        requestId: chatRequest.id,
        to: psychicId,
      });
    } else {
      console.warn(`Psychic ${psychicId} not found or does not have an active socketId.`);
      // Optionally, handle cases where psychic is not online or socketId is missing
      // e.g., store notification for later, send email, etc.
    }

    return chatRequest;
  }

  async getPendingRequests(psychicId: number): Promise<ChatRequest[]> {
    return this.chatRequestRepository.find({
      where: { psychicId, status: ChatRequestStatus.PENDING },
      relations: ["client"],
    });
  }

  async getMessages(roomId: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { room: { id: roomId } },
      order: { createdAt: "ASC" },
      relations: ["sender", "room"],
    });
  }

  async getRoomData(roomId: number): Promise<{ room: Room | null; messages: Message[] }> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ["client", "psychic", "psychic.psychicSetting"],
    });
  
    const messages = await this.getMessages(roomId);
  
    return { room, messages };
  }

  async createMessage(senderId: number, roomId: number, content: string): Promise<Message> {
    const sender = await this.userRepository.findOneBy({ id: senderId });
    const room = await this.roomRepository.findOneBy({ id: roomId });

    if (!sender || !room) {
      throw new Error("Sender or room not found");
    }

    const message = this.messageRepository.create({
      sender,
      room,
      content,
    });

    return this.messageRepository.save(message);
  }
}
