import { Router } from 'express';
import * as AuthController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema } from '@taskhub/shared';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Test123!@#
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Username already exists
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: New access token
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', AuthController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authMiddleware, AuthController.logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, AuthController.me);

/**
 * @swagger
 * /api/v1/auth/2fa/setup:
 *   post:
 *     summary: Setup 2FA
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: QR code and secret generated
 */
router.post('/2fa/setup', authMiddleware, AuthController.setupTwoFactor);

/**
 * @swagger
 * /api/v1/auth/2fa/verify:
 *   post:
 *     summary: Verify 2FA token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 2FA enabled
 */
router.post('/2fa/verify', authMiddleware, AuthController.verifyTwoFactor);

/**
 * @swagger
 * /api/v1/auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: 2FA disabled
 */
router.post('/2fa/disable', authMiddleware, AuthController.disableTwoFactor);

export default router;