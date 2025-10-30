import { Router } from "express";
import { BlogController } from "../controllers/BlogController";
import { authMiddleware } from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import blogUpload from "../middleware/blogUploadMiddleware";

const router = Router();
const blogController = new BlogController();

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Returns a list of blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter for published blogs
 *     responses:
 *       200:
 *         description: The list of the blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 */
router.get("/blogs", blogController.getAllBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a blog by id
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The blog id
 *     responses:
 *       200:
 *         description: The blog description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       404:
 *         description: The blog was not found
 */
router.get("/blogs/:id", blogController.getBlogById);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog (Admin only)
 *     tags: [Blogs]
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
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: The blog was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Some server error
 */
router.post("/blogs",  blogUpload.single("image"), blogController.createBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog by id (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The blog id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       200:
 *         description: The blog was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Blog not found
 */
router.put("/blogs/:id",  blogUpload.single("image"), blogController.updateBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog by id (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The blog id
 *     responses:
 *       204:
 *         description: The blog was successfully deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin role required)
 *       404:
 *         description: Blog not found
 */
router.delete("/blogs/:id", authMiddleware, adminMiddleware, blogController.deleteBlog);

export default router;
