import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { ChatService } from "../services/ChatService";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

export default function createChatRoutes(chatService: ChatService): Router {
  const router = Router();
  const chatController = new ChatController(chatService);

  /**
   * @swagger
   * /api/pending-requests/{psychicId}:
   *   get:
   *     summary: Get pending chat requests for a psychic
   *     parameters:
   *       - in: path
   *         name: psychicId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: The ID of the client who sent the request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 clientId:
   *                   type: integer
   */
  router.get(
    "/pending-requests/:psychicId",
    authMiddleware,
    adminMiddleware,
    chatController.getPendingRequests.bind(chatController)
  );

  router.post(
    "/request-chat",
    authMiddleware,
    chatController.requestChat.bind(chatController)
  );

  /**
   * @swagger
   * /api/messages/{senderId}/{receiverId}:
   *   get:
   *     summary: Get chat messages between two users
   *     parameters:
   *       - in: path
   *         name: senderId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: path
   *         name: receiverId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: A list of messages
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Message'
   */
  router.get("/messages/:senderId/:receiverId", (req, res) =>
    chatController.getMessages(req, res)
  );

  /**
   * @swagger
   * /api/rooms/{id}:
   *   get:
   *     summary: Get messages for a specific room
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: A list of messages for the room
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Message'
   */
  router.get(
    "/rooms/:id",
    authMiddleware,
    chatController.getRoomById.bind(chatController)
  );

  return router;
}
