import { Router } from 'express';
import {
  addPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost, 
   toggleLikePost,  // הוספת הפונקציה החדשה

} from '../controllers/PostController';
import { authMiddleware } from '../controllers/authcontroller';
import upload  from "../routes/uploadfilests";
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PostInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - userId
 *         - location
 *         - rating
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post.
 *         content:
 *           type: string
 *           description: The content of the post.
 *         userId:
 *           type: string
 *           description: The ID of the user who created the post.
 *         location:
 *           type: string
 *           description: The location associated with the post.
 *         rating:
 *           type: number
 *           description: The rating given to the post (1-5).
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs associated with the post.
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the post.
 *         commentsCount:
 *           type: number
 *           description: The count of comments for the post.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the post was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the post was last updated.
 * 
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 * 
 * /posts/{id}:
 *   get:
 *     summary: Get a specific post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *   put:
 *     summary: Update an existing post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInput'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 * 

 * /posts/{id}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to like/unlike
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user liking/unliking the post.
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post liked successfully"
 *                 likes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["userId1", "userId2"]
 * 
 */

//router.post('/', authMiddleware, addPost);
router.post("/",authMiddleware, upload.array("images", 5), addPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

// קריאה ללייק/הסרת לייק לפוסט
router.post('/:id/like', authMiddleware, toggleLikePost);

export default router;
