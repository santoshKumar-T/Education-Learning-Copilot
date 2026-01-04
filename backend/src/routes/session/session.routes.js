import express from 'express';
import {
  createNewSession,
  getSessionDetails,
  getHistory,
  getUserSessionsList,
  deleteSessionById,
  getStats,
  getRecentSessionsController,
  getMySessions
} from '../../controllers/session.controller.js';
import { optionalAuthenticate } from '../../middleware/auth/auth.middleware.js';

const router = express.Router();

// Apply optional authentication to all routes
router.use(optionalAuthenticate);

/**
 * @route   POST /api/session/create
 * @desc    Create a new chat session
 * @access  Public
 */
router.post('/create', createNewSession);

/**
 * @route   GET /api/session/recent
 * @desc    Get recent sessions (for recovery)
 * @access  Public (returns user's sessions if authenticated)
 */
router.get('/recent', getRecentSessionsController);

/**
 * @route   GET /api/session/my-sessions
 * @desc    Get current user's sessions
 * @access  Private (requires authentication)
 * IMPORTANT: This route must be defined BEFORE /:sessionId to avoid route conflicts
 */
router.get('/my-sessions', getMySessions);

/**
 * @route   GET /api/session/user/:userId
 * @desc    Get all sessions for a user
 * @access  Public (will be protected with auth later)
 */
router.get('/user/:userId', getUserSessionsList);

/**
 * @route   GET /api/session/:sessionId/history
 * @desc    Get conversation history for a session
 * @access  Public
 */
router.get('/:sessionId/history', getHistory);

/**
 * @route   GET /api/session/:sessionId/stats
 * @desc    Get session statistics
 * @access  Public
 */
router.get('/:sessionId/stats', getStats);

/**
 * @route   DELETE /api/session/:sessionId
 * @desc    Delete a session
 * @access  Public
 */
router.delete('/:sessionId', deleteSessionById);

/**
 * @route   GET /api/session/:sessionId
 * @desc    Get session details
 * @access  Public
 * NOTE: This must come AFTER all specific routes to avoid conflicts
 */
router.get('/:sessionId', getSessionDetails);

export default router;
