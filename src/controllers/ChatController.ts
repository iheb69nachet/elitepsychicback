
import { Request, Response } from "express";
import { ChatService } from "../services/ChatService";

export class ChatController {
  constructor(private chatService: ChatService) {}

  async getPendingRequests(req: Request, res: Response) {
    const { psychicId } = req.params;
    const pendingRequests = await this.chatService.getPendingRequests(parseInt(psychicId));
    res.json(pendingRequests);
  }

  async getMessages(req: Request, res: Response) {
    const {  roomId } = req.params;
    const messages = await this.chatService.getMessages( parseInt(roomId));
    res.json(messages);
  }

  async requestChat(req: Request, res: Response) {
    const { psychicId } = req.body;
    const clientId = (req as any).user.id; // Assuming user ID is attached to req.user by authMiddleware

    if (!psychicId || !clientId) {
      return res.status(400).json({ message: "Psychic ID and Client ID are required." });
    }
    
    try {
      const id = await this.chatService.requestChat(clientId, psychicId);
      res.status(200).json({ message: "Chat request sent.",id: id.id });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
