
import { Router } from "express";
import { PackageController } from "../controllers/PackageController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const packageController = new PackageController();

/**
 * @swagger
 * tags:
 *   name: Packages
 *   description: Package management
 */

/**
 * @swagger
 * /api/packages:
 *   get:
 *     summary: Returns a list of packages
 *     tags: [Packages]
 *     responses:
 *       200:
 *         description: The list of the packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Package'
 */
router.get("/packages", packageController.getAllPackages);

/**
 * @swagger
 * /api/packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Package'
 *     responses:
 *       201:
 *         description: The package was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       500:
 *         description: Some server error
 */
router.post("/packages", packageController.createPackage);


/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
 *       type: object
 *       required:
 *         - name
 *         - duration
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the package
 *         name:
 *           type: string
 *           description: The name of the package
 *         duration:
 *           type: integer
 *           description: The duration of the package in seconds
 *         price:
 *           type: number
 *           description: The price of the package
 *         color:
 *           type: string
 *           description: The color of the package
 *       example:
 *         id: 1
 *         name: 5 minutes
 *         duration: 300
 *         price: 5
 *         color: "#00FF00"
 */

export default router;
