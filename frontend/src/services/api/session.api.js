/**
 * Session API Service
 * Handles session API calls through middleware
 */

import { api, isAuthenticated } from '../../../../middleware/frontend/api/index.js';

/**
 * Get current user's sessions
 * @returns {Promise<Array>} User's sessions
 */
export const getMySessions = async () => {
  if (!isAuthenticated()) {
    return [];
  }
  
  try {
    const response = await api.get('/api/session/my-sessions');
    return response.data.sessions || [];
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Get recent sessions (for recovery)
 * @returns {Promise<Array>} Recent sessions
 */
export const getRecentSessions = async () => {
  try {
    const response = await api.get('/api/session/recent');
    return response.data.sessions || [];
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    return [];
  }
};
