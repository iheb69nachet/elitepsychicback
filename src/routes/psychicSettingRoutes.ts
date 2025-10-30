import { Router } from "express";
import { PsychicSettingController } from "../controllers/PsychicSettingController";
import { adminMiddleware } from "../middleware/adminMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = Router();
const psychicSettingController = new PsychicSettingController();

/**
 * @swagger
 * tags:
 *   name: Psychic Settings
 *   description: API for managing psychic settings
 */

/**
 * @swagger
 * /psychics/{psychicId}/settings:
 *   get:
 *     summary: Get psychic settings
 *     tags: [Psychic Settings]
 *     parameters:
 *       - in: path
 *         name: psychicId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The psychic ID
 *     responses:
 *       200:
 *         description: The psychic settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PsychicSetting'
 */
router.get("/psychics/:psychicId/settings", psychicSettingController.getPsychicSettings);

/**
 * @swagger
 * /psychics/{psychicId}/settings:
 *   put:
 *     summary: Update psychic settings
 *     tags: [Psychic Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: psychicId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The psychic ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               minuteRate:
 *                 type: number
 *     responses:
 *       200:
 *         description: The updated psychic settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PsychicSetting'
 */
router.put("/psychics/:psychicId/settings", upload.single('image'), psychicSettingController.updatePsychicSettings);

export default router;
