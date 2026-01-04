/**
 * Quiz API Service
 * Handles quiz generation and validation API calls
 */

// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Get authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Generate quiz from topic
 * @param {string} topic - Topic to generate quiz from
 * @param {Object} options - Quiz options (numQuestions, difficulty, questionTypes, timeLimit)
 * @returns {Promise<Object>} Generated quiz
 */
export const generateQuiz = async (topic, options = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        topic,
        options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz/generate-from-conversation`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
    const response = await fetch(`${API_BASE_URL}/api/quiz/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        quiz,
        answers,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating quiz answers:', error);
    throw error;
  }
};

