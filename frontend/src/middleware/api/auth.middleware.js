/**
 * Authentication Middleware
 * Handles authentication-related API operations
 */

// Re-export from root middleware
export * from '../../../middleware/frontend/api/auth.middleware.js';

/**
 * Get authentication token from storage
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Set authentication token
 */
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove authentication token
 */
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Set user data in storage
 */
export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * API request with automatic authentication
 * This is a wrapper that ensures auth token is included
 */
export const authenticatedRequest = async (config) => {
  if (!isAuthenticated() && !config.skipAuth) {
    throw new Error('User not authenticated');
  }
  return apiRequest(config);
};

