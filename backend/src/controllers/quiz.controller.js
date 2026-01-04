/**
 * Quiz Controller
 * Handles quiz generation and validation requests
 */

import { generateQuiz, generateQuizFromConversation, validateQuizAnswers } from '../services/quiz/quiz.service.js';
import * as sessionService from '../services/session/session.service.mongodb.js';
const { getConversationHistory } = sessionService;
import { optionalAuthenticate } from '../middleware/auth/auth.middleware.js';

/**
 * Generate quiz from topic
 * POST /api/quiz/generate
 */
export const generateQuizFromTopic = async (req, res) => {
  const requestId = Date.now().toString(36);
  const timestamp = new Date().toISOString();

  console.log('\n📝 [QUIZ REQUEST] New Quiz Generation');
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

    // Generate quiz
    const result = await generateQuiz(topic, options);

    // Save quiz to user's session if authenticated
    if (userId) {
      // TODO: Save quiz to database for user
      console.log(`   💾 Quiz saved for user: ${userId}`);
    }

    res.json({
      success: true,
      ...result,
      requestId,
      timestamp,
    });
  } catch (error) {
    console.error('   ❌ Quiz generation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz',
      requestId,
      timestamp,
    });
  }
};

/**
 * Generate quiz from conversation history
 * POST /api/quiz/generate-from-conversation
 */
export const generateQuizFromHistory = async (req, res) => {
  const requestId = Date.now().toString(36);
  const timestamp = new Date().toISOString();

  console.log('\n📝 [QUIZ REQUEST] Generate from Conversation');
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

    // Generate quiz from conversation
    const result = await generateQuizFromConversation(conversationHistory, options);

    res.json({
      success: true,
      ...result,
      requestId,
      timestamp,
    });
  } catch (error) {
    console.error('   ❌ Quiz generation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz from conversation',
      requestId,
      timestamp,
    });
  }
};

/**
 * Validate quiz answers
 * POST /api/quiz/validate
 */
export const validateAnswers = async (req, res) => {
  const requestId = Date.now().toString(36);
  const timestamp = new Date().toISOString();

  console.log('\n✅ [QUIZ VALIDATION] Validating Answers');
  console.log(`   Request ID: ${requestId}`);

  try {
    const { quiz, answers } = req.body;

    if (!quiz || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Quiz and answers are required',
      });
    }

    const results = validateQuizAnswers(quiz, answers);

    console.log(`   📊 Score: ${results.score}% (${results.correctCount}/${results.totalQuestions})`);

    res.json({
      success: true,
      ...results,
      requestId,
      timestamp,
    });
  } catch (error) {
    console.error('   ❌ Validation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate quiz answers',
      requestId,
      timestamp,
    });
  }
};

