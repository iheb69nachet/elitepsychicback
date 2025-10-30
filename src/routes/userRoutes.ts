
import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { PsychicController } from "../controllers/PsychicController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";

const router = Router();
const userController = new UserController();
const psychicController = new PsychicController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns a list of users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/users", authMiddleware, userController.getAllUsers);

/**
 * @swagger
 * /api/users/by-role:
 *   get:
 *     summary: Returns a list of users by role names
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roles
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: true
 *         description: The role names
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/users/by-role", authMiddleware, userController.getUsersByRoleNames);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 */
router.get("/users/:id", authMiddleware, userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500: 
 *         description: Some server error
 */
router.post("/users", authMiddleware, userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by id (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
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
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, pending, blocked]
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The user was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: User not found
 */
router.put("/users/:id", authMiddleware, adminMiddleware, userController.updateUser);

/**
 * @swagger
 * /api/psychics:
 *   get:
 *     summary: Returns a list of all psychic users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of psychic users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 */
router.get("/psychics", psychicController.getAllPsychics);

/**
 * @swagger
 * /api/psychics/{id}:
 *   get:
 *     summary: Get a psychic user by id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The psychic user id
 *     responses:
 *       200:
 *         description: The psychic user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The psychic user was not found
 *       500:
 *         description: Some server error
 */
router.get("/psychics/:id", authMiddleware, psychicController.getPsychicById);


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - roleId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         roleId:
 *           type: integer
 *           description: The id of the role
 *       example:
 *         id: 1
 *         name: John Doe
 *         email: john.doe@example.com
 *         roleId: 1
 */

export default router;
