
import { Router } from 'express';
import { PackageController } from '../controllers/PackageController';
import { StripeController } from '../controllers/StripeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();
const packageController = new PackageController();
const stripeController = new StripeController();

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Stripe payment management
 */

/**
 * @swagger
 * /api/create-stripe-session:
 *   post:
 *     summary: Create a new Stripe checkout session
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageId:
 *                 type: number
 *                 description: The ID of the package to purchase
 *                 example: 1
 *     responses:
 *       200:
 *         description: The Stripe checkout session ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: The ID of the Stripe checkout session
 *       500:
 *         description: Some server error
 */
router.post('/create-stripe-session', authMiddleware, packageController.createStripeSession);

/**
 * @swagger
 * /api/stripe/success:
 *   get:
 *     summary: Handle successful Stripe payment callback
 *     tags: [Stripe]
 *     parameters:
 *       - in: query
 *         name: transactionId
 *         schema:
 *           type: number
 *         required: true
 *         description: The ID of the transaction
 *     responses:
 *       200:
 *         description: Payment successful and transaction updated
 *       500:
 *         description: Some server error
 */
router.get('/stripe/success', stripeController.handleSuccess);

/**
 * @swagger
 * /api/stripe/cancel:
 *   get:
 *     summary: Handle cancelled Stripe payment callback
 *     tags: [Stripe]
 *     parameters:
 *       - in: query
 *         name: transactionId
 *         schema:
 *           type: number
 *         required: true
 *         description: The ID of the transaction
 *     responses:
 *       200:
 *         description: Payment cancelled and transaction updated
 *       500:
 *         description: Some server error
 */
router.get('/stripe/cancel', stripeController.handleCancel);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions (Admin only)
 *     tags: [Stripe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       500:
 *         description: Some server error
 */
router.get('/transactions', authMiddleware, adminMiddleware, stripeController.getAllTransactions);

export default router;
