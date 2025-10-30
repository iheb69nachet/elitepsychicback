
import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               role:
 *                 type: string
 *                 description: The name of the role for the user (e.g., "client", "psychic"). Defaults to "client" role if not provided.
 *                 enum: [client, psychic]
 *                 default: client
 *                 nullable: true
 *     responses:
 *       201:
 *         description: The user was successfully created
 *       500:
 *         description: Some server error
 */
router.post("/auth/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post("/auth/login", authController.login);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post("/auth/reset-password", authController.resetPassword);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update a user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: The user was successfully updated
 *       404:
 *         description: The user was not found
 */
import { authMiddleware } from '../middleware/authMiddleware';

router.put("/auth/profile", authMiddleware, authController.updateProfile);
  router.post('/auth/social-login', authController.socialLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user details and a refreshed token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details and a refreshed token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: Refreshed JWT token
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Some server error
 */
router.get("/auth/me", authMiddleware, authController.getMe);

export default router;
