/**
 * Lesson Plan API Service
 * Handles lesson plan generation API calls through middleware
 */

import { api } from '../../../../middleware/frontend/api/index.js';

/**
 * Generate lesson plan from topic
 * @param {string} topic - Topic to generate lesson plan from
 * @param {Object} options - Lesson plan options (duration, level, learningObjectives, includeActivities, includeAssessment)
 * @returns {Promise<Object>} Generated lesson plan
 */
export const generateLessonPlan = async (topic, options = {}) => {
  try {
    const response = await api.post('/api/lesson-plan/generate', {
      topic,
      options,
    });

    return response.data;
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error;
  }
};

/**
 * Generate lesson plan from conversation history
 * @param {string} sessionId - Session ID to generate lesson plan from
 * @param {Object} options - Lesson plan options
 * @returns {Promise<Object>} Generated lesson plan
 */
export const generateLessonPlanFromConversation = async (sessionId, options = {}) => {
  try {
    const response = await api.post('/api/lesson-plan/generate-from-conversation', {
      sessionId,
      options,
    });

    return response.data;
  } catch (error) {
    console.error('Error generating lesson plan from conversation:', error);
    throw error;
  }
};

