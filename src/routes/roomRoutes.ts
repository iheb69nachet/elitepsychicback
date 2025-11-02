
import { Router } from "express";
import { RoomController } from "../controllers/RoomController";
import { RoomService } from "../services/RoomService";
import { roomRepository } from "../repositories/RoomRepository";
import { userRepository } from "../repositories/UserRepository";
import { authMiddleware } from "../middleware/authMiddleware";

import { Server } from "socket.io";

export default function createRoomRoutes(io: Server): Router {
  const router = Router();
  const roomService = new RoomService(roomRepository, userRepository);
  const roomController = new RoomController(roomService, io);

  /**
   * @swagger
   * /api/rooms:
   *   post:
   *     summary: Create a new chat room
   *     tags: [Rooms]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               clientId:
   *                 type: integer
   *               psychicId:
   *                 type: integer
   *     responses:
   *       201:
   *         description: The room was successfully created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Room'
   *       400:
   *         description: Client ID and Psychic ID are required
   *       500:
   *         description: Some server error
   */
  router.post("/rooms", authMiddleware, roomController.createRoom.bind(roomController));

  /**
   * @swagger
   * /api/rooms/{id}:
   *   get:
   *     summary: Get a room by id
   *     tags: [Rooms]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The room id
   *     responses:
   *       200:
   *         description: The room description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Room'
   *       404:
   *         description: The room was not found
   */
  router.get("/rooms/:id", authMiddleware, roomController.getRoomById.bind(roomController));

  return router;
}
