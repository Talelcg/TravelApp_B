import { Router } from 'express';
import authController from "../controllers/authcontroller";
const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: The Authentication API
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/models/User'
 *           example:
 *             username: "john_doe"
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: The newly created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/models/User'
 *           example:
 *             _id: "60c72b1f9e3d3c19e2f4b08c"
 *             username: "john_doe"
 *             email: "john@example.com"
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Logs in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/models/User'
 *           example:
 *             email: "john@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: The access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/models/Tokens'
 *           example:
 *             accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjAwM2RkZWYxY2E5ZDQxYTg1NTUyZjc1MGEiLCJpYXQiOjE2NjY2ODc1NTZ9.NKn-2wFFIu1x6fDxjmZ9ae3x0_oYZjdjx-1TxQNEvxM"
 *             refreshToken: "d5da2dfb5b02310a810bbb083f3d319ae"
 */

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logs out a user
 *     tags: [Auth]
 *     description: Provide the refresh token in the authorization header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout completed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Logout completed successfully"
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Fetches the username by user ID
 *     tags: [Auth]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "john_doe"
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Fetches user details by user ID
 *     tags: [Auth]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The user ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/:id', authController.getUsernameById);

export default router;
