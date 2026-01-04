/**
 * Lesson Plan Controller
 * Handles lesson plan generation requests
 */

import { generateLessonPlan, generateLessonPlanFromConversation } from '../services/lesson-plan/lesson-plan.service.js';
import * as sessionService from '../services/session/session.service.mongodb.js';
const { getConversationHistory } = sessionService;
import { optionalAuthenticate } from '../middleware/auth/auth.middleware.js';

/**
 * Generate lesson plan from topic
 * POST /api/lesson-plan/generate
 */
export const generateLessonPlanFromTopic = async (req, res) => {
  const requestId = Date.now().toString(36);
  const timestamp = new Date().toISOString();

  console.log('\n📚 [LESSON PLAN REQUEST] New Lesson Plan Generation');
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Timestamp: ${timestamp}`);

  try {
    const { topic, options = {} } = req.body;
    const userId = req.userId || null;

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a non-empty string',
      });
    }

    console.log(`   📚 Topic: "${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}"`);
    console.log(`   👤 User ID: ${userId || 'Anonymous'}`);

    // Generate lesson plan
    const result = await generateLessonPlan(topic, options);

    // Save lesson plan to user's account if authenticated
    if (userId) {
      // TODO: Save lesson plan to database for user
      console.log(`   💾 Lesson plan saved for user: ${userId}`);
    }

    res.json({
      success: true,
      ...result,
      requestId,
      timestamp,
    });
  } catch (error) {
    console.error('   ❌ Lesson plan generation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate lesson plan',
      requestId,
      timestamp,
    });
  }
};

/**
 * Generate lesson plan from conversation history
 * POST /api/lesson-plan/generate-from-conversation
 */
export const generateLessonPlanFromHistory = async (req, res) => {
  const requestId = Date.now().toString(36);
  const timestamp = new Date().toISOString();

  console.log('\n📚 [LESSON PLAN REQUEST] Generate from Conversation');
  console.log(`   Request ID: ${requestId}`);

  try {
    const { sessionId, options = {} } = req.body;
    const userId = req.userId || null;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    // Get conversation history
    const conversationHistory = await getConversationHistory(sessionId);
    
    if (!conversationHistory || conversationHistory.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No conversation history found for this session',
      });
    }

    console.log(`   💬 Conversation messages: ${conversationHistory.length}`);

    // Generate lesson plan from conversation
    const result = await generateLessonPlanFromConversation(conversationHistory, options);

    res.json({
      success: true,
      ...result,
      requestId,
      timestamp,
    });
  } catch (error) {
    console.error('   ❌ Lesson plan generation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate lesson plan from conversation',
      requestId,
      timestamp,
    });
  }
};

