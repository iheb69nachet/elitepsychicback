
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Room } from "../entities/Room";
import { Server } from "socket.io";
import { Repository } from "typeorm";
import { UserService } from "./UserService";
import { ChatRequest, ChatRequestStatus } from "../entities/ChatRequest";
import { roomRepository } from "../repositories/RoomRepository";

interface ChatSession {
  psychicId: number;
  clientId: number;
  duration: number; // in seconds
  initialBalance: number;
  minuteRate: number;
}

export class ChatService {
  private io!: Server;
  private activeTimers = new Map<number, NodeJS.Timeout>();
  private chatSessions = new Map<number, ChatSession>(); // clientId -> ChatSession

  constructor(
    private messageRepository: Repository<Message>,
    private userRepository: Repository<User>,
    private userService: UserService,
    private chatRequestRepository: Repository<ChatRequest>,
    private roomRepository: Repository<Room>
  ) {}

  init(io: Server) {
    this.io = io;
    this.initialize();
  }

  private initialize() {
    this.io.on("connection", (socket) => {
      console.log("a user connected123");

      socket.on("join", ({ userId }) => {
        socket.join(userId);
        (socket as any).userId = userId;
        this.userService.setUserOnlineStatus(userId, true);
      });

      socket.on("joinRoom", async ({ roomId }) => {
        socket.join(roomId);
        const messages = await this.getMessages(roomId);
        this.io.to(roomId.toString()).emit("roomMessages", messages);
      });

      socket.on("getMessages", async ({ roomId }) => {
        const messages = await this.getMessages(roomId);
        console.log(messages);
        
        socket.emit("roomMessages", messages);
      });

      socket.on("acceptChat", async ({ requestId }) => {
        console.log({requestId});
        
        const psychicId = (socket as any).userId;
        const chatRequest = await this.chatRequestRepository.findOne({
          where: { id: requestId, psychicId, status: ChatRequestStatus.PENDING },
          relations: ["client", "psychic", "psychic.psychicSetting"],
        });
        if (!chatRequest) {
          // Handle error: Chat request not found or not pending
          return;
        }
        chatRequest.status = ChatRequestStatus.ACCEPTED;
        await this.chatRequestRepository.save(chatRequest);

        const room = this.roomRepository.create({
          client: chatRequest.client,
          psychic: chatRequest.psychic,
        });
        await this.roomRepository.save(room);

        this.io.emit("chatAccepted", { psychic: psychicId, client: chatRequest.clientId, requestId: chatRequest.id, roomId: room.id });
      });

      socket.on("rejectChat", async ({ requestId }) => {
        const psychicId = (socket as any).userId;
        const chatRequest = await this.chatRequestRepository.findOne({
          where: { id: requestId, psychicId, status: ChatRequestStatus.PENDING },
        });

        if (!chatRequest) {
          // Handle error: Chat request not found or not pending
          return;
        }

        chatRequest.status = ChatRequestStatus.REJECTED;
        await this.chatRequestRepository.save(chatRequest);

        this.io.emit("chatRejected",{ psychic: psychicId, client: chatRequest.clientId,requestId:chatRequest.id });
      });

      socket.on("sendMessage", async (data) => {
        const { senderId, roomId, content } = data;
        const message = await this.createMessage(senderId, roomId, content);
        const messages=await this.getMessages(roomId);
        console.log(messages);
        
        this.io.emit("receiveMessage", message);
        // this.io.emit("roomMessages", messages);

      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
        const userId = (socket as any).userId;
        if (userId) {
          this.userService.setUserOnlineStatus(userId, false);
        }
      });
    });
  }

 


  async requestChat(clientId: number, psychicId: number): Promise<ChatRequest> {
    const chatRequest = this.chatRequestRepository.create({
      clientId,
      psychicId,
      status: ChatRequestStatus.PENDING,
    });
    await this.chatRequestRepository.save(chatRequest);

    this.io.emit("chatRequest", { from: clientId, requestId: chatRequest.id,to:psychicId });
    return chatRequest;
  }

  async getPendingRequests(psychicId: number): Promise<ChatRequest[]> {
    return this.chatRequestRepository.find({
      where: { psychicId, status: ChatRequestStatus.PENDING },
      relations: ["client"], // To get client details if needed
    });
  }

  async getMessages(roomId: number): Promise<Message[]> {
    console.log({roomId});
    
    return this.messageRepository.find({
      where: { room: { id: roomId } },
      order: { createdAt: "ASC" },
      relations: ["sender", "room"],
    });
  }

  async createMessage(
    senderId: number,
    roomId: number,
    content: string
  ): Promise<Message> {
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
