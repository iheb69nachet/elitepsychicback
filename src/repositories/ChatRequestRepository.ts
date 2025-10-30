import { AppDataSource } from "../data-source";
import { ChatRequest } from "../entities/ChatRequest";

export const ChatRequestRepository = AppDataSource.getRepository(ChatRequest);
