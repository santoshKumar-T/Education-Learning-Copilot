import express from 'express';
import { register, login, getCurrentUser, verify } from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email: string, password: string, name?: string }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email: string, password: string }
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private (requires authentication)
 */
router.get('/verify', authenticate, verify);

export default router;


