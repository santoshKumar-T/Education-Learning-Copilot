/**
 * Quiz API Service
 * Handles quiz generation and validation API calls through middleware
 */

import { api } from '../../middleware/api/index.js';

/**
 * Generate quiz from topic
 * @param {string} topic - Topic to generate quiz from
 * @param {Object} options - Quiz options (numQuestions, difficulty, questionTypes, timeLimit)
 * @returns {Promise<Object>} Generated quiz
 */
export const generateQuiz = async (topic, options = {}) => {
  try {
    const response = await api.post('/api/quiz/generate', {
      topic,
      options,
    });

    return response.data;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

/**
 * Generate quiz from conversation history
 * @param {string} sessionId - Session ID to generate quiz from
 * @param {Object} options - Quiz options
 * @returns {Promise<Object>} Generated quiz
 */
export const generateQuizFromConversation = async (sessionId, options = {}) => {
  try {
    const response = await api.post('/api/quiz/generate-from-conversation', {
      sessionId,
      options,
    });

    return response.data;
  } catch (error) {
    console.error('Error generating quiz from conversation:', error);
    throw error;
  }
};

/**
 * Validate quiz answers
 * @param {Object} quiz - Quiz object
 * @param {Object} answers - User answers { questionId: answer }
 * @returns {Promise<Object>} Validation results
 */
export const validateQuizAnswers = async (quiz, answers) => {
  try {
    const response = await api.post('/api/quiz/validate', {
      quiz,
      answers,
    }, { skipAuth: true });

    return response.data;
  } catch (error) {
    console.error('Error validating quiz answers:', error);
    throw error;
  }
};
