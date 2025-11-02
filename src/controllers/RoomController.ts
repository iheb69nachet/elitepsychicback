
import { Request, Response } from "express";
import { RoomService } from "../services/RoomService";

import { Server } from "socket.io";

export class RoomController {
  constructor(private roomService: RoomService, private io: Server) {}

  async createRoom(req: Request, res: Response): Promise<void> {
    const { clientId, psychicId } = req.body;

    if (!clientId || !psychicId) {
      res.status(400).json({ message: "Client ID and Psychic ID are required." });
      return;
    }

    try {
      const room = await this.roomService.createRoom(clientId, psychicId, this.io);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getRoomById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    try {
      const room = await this.roomService.getRoomById(id);
      if (room) {
        res.json(room);
      } else {
        res.status(404).json({ message: "Room not found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
