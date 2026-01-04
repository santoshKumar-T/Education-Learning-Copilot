import express from 'express';
import {
  handleLangChainMessage,
  langchainHealth
} from '../../controllers/langchain.controller.js';

const router = express.Router();

/**
 * @route   GET /api/langchain/health
 * @desc    Health check for LangChain service
 * @access  Public
 */
router.get('/health', langchainHealth);

/**
 * @route   POST /api/langchain/message
 * @desc    Send message using LangChain with memory
 * @access  Public
 * @body    { message: string, sessionId: string }
 */
router.post('/message', handleLangChainMessage);


export default router;

