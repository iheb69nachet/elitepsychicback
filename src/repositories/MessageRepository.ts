
import { AppDataSource } from "../data-source";
import { Message } from "../entities/Message";

export const MessageRepository = AppDataSource.getRepository(Message);
