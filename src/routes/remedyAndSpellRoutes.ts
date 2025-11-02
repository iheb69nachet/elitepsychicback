
import { Router } from "express";
import { RemedyAndSpellController } from "../controllers/RemedyAndSpellController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import remedyAndSpellUpload from "../middleware/remedyAndSpellUploadMiddleware";

const router = Router();
const remedyAndSpellController = new RemedyAndSpellController();

/**
 * @swagger
 * tags:
 *   name: Remedies and Spells
 *   description: API for remedies and spells
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RemedyAndSpell:
 *       type: object
 *       required:
 *         - title
 *         - image
 *         - description
 *         - price
 *       properties:
 *         id:
 *           type: number
 *           description: The auto-generated id of the remedy or spell
 *         title:
 *           type: string
 *           description: The title of the remedy or spell
 *         image:
 *           type: string
 *           description: The image of the remedy or spell
 *         description:
 *           type: string
 *           description: The description of the remedy or spell
 *         price:
 *           type: number
 *           description: The price of the remedy or spell
 *       example:
 *         id: 1
 *         title: Love Potion
 *         image: https://example.com/love-potion.jpg
 *         description: A powerful potion to attract love
 *         price: 99.99
 */

// Public routes
/**
 * @swagger
 * /api/remedies-and-spells:
 *   get:
 *     summary: Returns the list of all the remedies and spells
 *     tags: [Remedies and Spells]
 *     responses:
 *       200:
 *         description: The list of the remedies and spells
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RemedyAndSpell'
 */
router.get("/remedies-and-spells", remedyAndSpellController.getAll);

/**
 * @swagger
 * /api/remedies-and-spells/{id}:
 *   get:
 *     summary: Get the remedy or spell by id
 *     tags: [Remedies and Spells]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The remedy or spell id
 *     responses:
 *       200:
 *         description: The remedy or spell description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemedyAndSpell'
 *       404:
 *         description: The remedy or spell was not found
 */
router.get("/remedies-and-spells/:id", remedyAndSpellController.getById);

// Admin routes
/**
 * @swagger
 * /api/remedies-and-spells:
 *   post:
 *     summary: Create a new remedy or spell
 *     tags: [Remedies and Spells]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: The remedy or spell was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemedyAndSpell'
 *       403:
 *         description: Forbidden
 */
router.post("/remedies-and-spells", remedyAndSpellUpload.single('image'), remedyAndSpellController.create);

/**
 * @swagger
 * /api/remedies-and-spells/{id}:
 *   put:
 *     summary: Update the remedy or spell by the id
 *     tags: [Remedies and Spells]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The remedy or spell id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The remedy or spell was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemedyAndSpell'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: The remedy or spell was not found
 */
router.put("/remedies-and-spells/:id", remedyAndSpellUpload.single('image'), remedyAndSpellController.update);

/**
 * @swagger
 * /api/remedies-and-spells/{id}:
 *   delete:
 *     summary: Remove the remedy or spell by id
 *     tags: [Remedies and Spells]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The remedy or spell id
 *     responses:
 *       204:
 *         description: The remedy or spell was deleted
 *       403:
 *         description: Forbidden
 */
router.delete("/remedies-and-spells/:id", remedyAndSpellController.delete);

export default router;
