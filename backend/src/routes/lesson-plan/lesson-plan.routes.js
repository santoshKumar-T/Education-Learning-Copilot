/**
 * Lesson Plan Routes
 * API endpoints for lesson plan generation
 */

import express from 'express';
import { generateLessonPlanFromTopic, generateLessonPlanFromHistory } from '../../controllers/lesson-plan.controller.js';
import { optionalAuthenticate } from '../../middleware/auth/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/lesson-plan/generate
 * @desc    Generate lesson plan from topic
 * @access  Public (optional auth)
 * @body    { topic: string, options?: { duration, level, learningObjectives, includeActivities, includeAssessment } }
 */
router.post('/generate', optionalAuthenticate, generateLessonPlanFromTopic);

/**
 * @route   POST /api/lesson-plan/generate-from-conversation
 * @desc    Generate lesson plan from conversation history
 * @access  Public (optional auth)
 * @body    { sessionId: string, options?: { duration, level, learningObjectives, includeActivities, includeAssessment } }
 */
router.post('/generate-from-conversation', optionalAuthenticate, generateLessonPlanFromHistory);

export default router;

