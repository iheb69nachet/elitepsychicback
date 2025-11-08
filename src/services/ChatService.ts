import redisClient from '../redis';
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Room } from "../entities/Room";
import { Server, Socket } from "socket.io";
import { Repository } from "typeorm";
import { UserService } from "./UserService";
import { ChatRequest, ChatRequestStatus } from "../entities/ChatRequest";
import { roomRepository } from "../repositories/RoomRepository";

interface ActiveChat {
  ids: number[];
  totalActiveSessions: number;
  startTime: number;
  rate: number;
  initialBalance: number;
  maxChatTimeSeconds: number;
  timeLeftSeconds: number;
}

export class ChatService {
  private io!: Server;
  private activeChats: Record<number, ActiveChat> = {};

  constructor(
    private messageRepository: Repository<Message>,
    private userRepository: Repository<User>,
    private userService: UserService,
    private chatRequestRepository: Repository<ChatRequest>,
    private roomRepository: Repository<Room>
  ) {}

  init(io: Server) {
    this.io = io;
    this.registerSocketHandlers();
    this.startGlobalTimer();
  }

  /**
   * Socket.IO event registration
   */
  private registerSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("✅ User connected");

      socket.on("join", ({ userId }) => {
        socket.join(userId);
        (socket as any).userId = userId;
        this.userService.setUserOnlineStatus(userId, true);
      });

      socket.on("joinRoom", async ({ roomId }) => {
        socket.join(roomId);
        const messages = await this.getMessages(roomId);
        this.io.emit("roomMessages", messages);
      });

      socket.on("getMessages", async ({ roomId }) => {
        const messages = await this.getMessages(roomId);
        socket.emit("roomMessages", messages);
      });

      socket.on("acceptChat", async ({ requestId }) => {
        const psychicId = (socket as any).userId;
        const chatRequest = await this.chatRequestRepository.findOne({
          where: { id: requestId, psychicId, status: ChatRequestStatus.PENDING },
          relations: ["client", "psychic", "psychic.psychicSetting"],
        });

        if (!chatRequest) return;

        chatRequest.status = ChatRequestStatus.ACCEPTED;
        await this.chatRequestRepository.save(chatRequest);

        const room = this.roomRepository.create({
          client: chatRequest.client,
          psychic: chatRequest.psychic,
        });
        await this.roomRepository.save(room);

        this.io.emit("chatAccepted", {
          psychic: psychicId,
          client: chatRequest.clientId,
          requestId: chatRequest.id,
          roomId: room.id,
        });
      });

      socket.on("rejectChat", async ({ requestId }) => {
        const psychicId = (socket as any).userId;
        const chatRequest = await this.chatRequestRepository.findOne({
          where: { id: requestId, psychicId, status: ChatRequestStatus.PENDING },
        });

        if (!chatRequest) return;

        chatRequest.status = ChatRequestStatus.REJECTED;
        await this.chatRequestRepository.save(chatRequest);

        this.io.emit("chatRejected", {
          psychic: psychicId,
          client: chatRequest.clientId,
          requestId: chatRequest.id,
        });
      });

      socket.on("sendMessage", async (data) => {
        const { senderId, roomId, content } = data;
        const message = await this.createMessage(senderId, roomId, content);
        const messages = await this.getMessages(roomId);

        this.io.emit("receiveMessage", message);
        this.io.emit("roomMessages", messages);
      });

      socket.on("join-chat", async ({ roomId, userId, psychicId }) => {
        console.log("💬 User joined chat:", { roomId, userId, psychicId });

        // If this is the first chat session for the user
        if (!this.activeChats[userId]) {
          const clientBalance = await this.userService.getUserBalance(userId);
          const minuteRate = await this.userService.getPsychicSetting(psychicId)
            .then((setting) => setting.minuteRate);

          const ratePerSecond = minuteRate ;
          const maxChatTimeSeconds = clientBalance > 0
            ? Math.floor(clientBalance / ratePerSecond)
            : 0;

          this.activeChats[userId] = {
            ids: [roomId],
            totalActiveSessions: 1,
            startTime: Date.now(),
            rate: ratePerSecond,
            initialBalance: clientBalance,
            maxChatTimeSeconds,
            timeLeftSeconds: maxChatTimeSeconds,
          };

          console.log(`⏱ Timer started for user ${userId}: ${maxChatTimeSeconds}s`);
          this.io.emit("timer", {
            userId,
            timeLeft: maxChatTimeSeconds,
          });
        } else {
          // Already has an active session
          const chat = this.activeChats[userId];
          if (!chat.ids.includes(roomId)) chat.ids.push(roomId);
          chat.totalActiveSessions += 1;
        }

        socket.join(userId.toString());
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected");
        const userId = (socket as any).userId;
        if (!userId) return;

        this.userService.setUserOnlineStatus(userId, false);

        const chat = this.activeChats[userId];
        if (chat) {
          chat.totalActiveSessions -= 1;
          if (chat.totalActiveSessions <= 0) {
            delete this.activeChats[userId];
            console.log(`🧹 Cleaned up chat session for user ${userId}`);
          }
        }
      });
    });
  }

  /**
   * Global timer that runs every second to decrement timeLeft and push balance updates
   */
  private startGlobalTimer() {
    setInterval(async () => {
      for (const [userId, chat] of Object.entries(this.activeChats)) {
        chat.timeLeftSeconds -= 1;

        if (chat.timeLeftSeconds <= 0) {
          // Chat ended — notify all rooms for this user
          for (const roomId of chat.ids) {
            this.io.to(roomId.toString()).emit("chat-ended", {
              roomId,
              reason: "insufficient_balance",
              message: "Chat ended due to insufficient balance",
            });

            await redisClient.lpush("balance_update_queue", roomId.toString());
          }

          delete this.activeChats[+userId];
          console.log(`🚨 Chat session ended for user ${userId}`);
        } else {
          // Periodic balance update
          for (const roomId of chat.ids) {
            await redisClient.lpush("balance_update_queue", roomId.toString());
          }

        }
      }
    }, 60000);
  }

  /**
   * Chat requests and messaging
   */
  async requestChat(clientId: number, psychicId: number): Promise<ChatRequest> {
    const chatRequest = this.chatRequestRepository.create({
      clientId,
      psychicId,
      status: ChatRequestStatus.PENDING,
    });
    await this.chatRequestRepository.save(chatRequest);

    this.io.emit("chatRequest", { from: clientId, requestId: chatRequest.id, to: psychicId });
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

  async createMessage(senderId: number, roomId: number, content: string): Promise<Message> {
    const sender = await this.userRepository.findOneBy({ id: senderId });
    const room = await this.roomRepository.findOneBy({ id: roomId });

    if (!sender || !room) {
      throw new Error("Sender or room not found");
    }

    const message = new Message();
    message.sender = sender;
    message.room = room;
    message.content = content;

    return this.messageRepository.save(message);
  }
}
