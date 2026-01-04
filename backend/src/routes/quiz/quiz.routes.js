/**
 * Quiz Routes
 * API endpoints for quiz generation and validation
 */

import express from 'express';
import { generateQuizFromTopic, generateQuizFromHistory, validateAnswers } from '../../controllers/quiz.controller.js';
import { optionalAuthenticate } from '../../middleware/auth/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/quiz/generate
 * @desc    Generate quiz from topic
 * @access  Public (optional auth)
 * @body    { topic: string, options?: { numQuestions, difficulty, questionTypes, timeLimit } }
 */
router.post('/generate', optionalAuthenticate, generateQuizFromTopic);

/**
 * @route   POST /api/quiz/generate-from-conversation
 * @desc    Generate quiz from conversation history
 * @access  Public (optional auth)
 * @body    { sessionId: string, options?: { numQuestions, difficulty, questionTypes, timeLimit } }
 */
router.post('/generate-from-conversation', optionalAuthenticate, generateQuizFromHistory);

/**
 * @route   POST /api/quiz/validate
 * @desc    Validate quiz answers
 * @access  Public
 * @body    { quiz: Object, answers: Object }
 */
router.post('/validate', validateAnswers);

export default router;

