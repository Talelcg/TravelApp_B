import { Router } from 'express';
import {
  addComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from '../controllers/CommentController';
import { authMiddleware } from '../controllers/authcontroller';

const router = Router();

router.post('/', authMiddleware, addComment); 
router.put('/:id', authMiddleware, updateComment); 
router.delete('/:id', authMiddleware, deleteComment);
router.get('/:id', authMiddleware, getCommentsByPost);

export default router;



/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Add a new comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is my comment"
 *               postId:
 *                 type: string
 *                 example: "6123456789abcdef01234567"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad request, content and postId are required
 *       401:
 *         description: Unauthorized, userId is required
 */

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update an existing comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the post to get comments for
 *     responses:
 *       200:
 *         description: A list of comments for the specified post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "6123456789abcdef01234567"
 *                   content:
 *                     type: string
 *                     example: "This is a comment"
 *                   userId:
 *                     type: string
 *                     example: "6123456789abcdef01234567"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-05T00:00:00Z"
 *       400:
 *         description: Bad request, postId is required
 *       404:
 *         description: Post not found
 */
