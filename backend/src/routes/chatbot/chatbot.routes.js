import express from 'express';
import { handleChatMessage, chatbotHealth } from '../../controllers/chatbot.controller.js';
import { optionalAuthenticate } from '../../middleware/auth/auth.middleware.js';

const router = express.Router();

// Apply optional authentication to all routes
router.use(optionalAuthenticate);

/**
 * @route   GET /api/chatbot/health
 * @desc    Health check for chatbot service
 * @access  Public
 */
router.get('/health', chatbotHealth);

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to chatbot and get AI response
 * @access  Public
 * @body    { message: string, conversationHistory?: Array }
 */
router.post('/message', handleChatMessage);

export default router;



