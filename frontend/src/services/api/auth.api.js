/**
 * Auth API Service
 * Handles authentication API calls through middleware
 */

import { api, setAuthToken, setStoredUser, removeAuthToken, getStoredUser, isAuthenticated } from '../../../../middleware/frontend/api/index.js';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name (optional)
 * @returns {Promise<Object>} User data and token
 */
export const register = async (email, password, name = '') => {
  try {
    console.log('%c🔐 [AUTH] Registering user', 'color: #8b5cf6; font-weight: bold;');
    
    const response = await api.post('/api/auth/register', {
      email,
      password,
      name
    }, { skipAuth: true });

    const data = response.data;
    
    // Save token to localStorage
    if (data.token) {
      setAuthToken(data.token);
      setStoredUser(data.user);
      console.log('%c✅ [AUTH] Registration successful', 'color: #10b981; font-weight: bold;');
      console.log(`   User: ${data.user.email}`);
    }
    
    return data;
  } catch (error) {
    console.error('%c❌ [AUTH] Registration failed:', 'color: #ef4444; font-weight: bold;', error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (email, password) => {
  try {
    console.log('%c🔐 [AUTH] Logging in', 'color: #8b5cf6; font-weight: bold;');
    
    const response = await api.post('/api/auth/login', {
      email,
      password
    }, { skipAuth: true });

    const data = response.data;
    
    // Save token to localStorage
    if (data.token) {
      setAuthToken(data.token);
      setStoredUser(data.user);
      console.log('%c✅ [AUTH] Login successful', 'color: #10b981; font-weight: bold;');
      console.log(`   User: ${data.user.email}`);
    }
    
    return data;
  } catch (error) {
    console.error('%c❌ [AUTH] Login failed:', 'color: #ef4444; font-weight: bold;', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  removeAuthToken();
  localStorage.removeItem('chatbot_session_id');
  console.log('%c🔐 [AUTH] Logged out', 'color: #8b5cf6; font-weight: bold;');
};

/**
 * Get current user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    if (!isAuthenticated()) {
      return null;
    }

    const response = await api.get('/api/auth/me');
    return response.data.user;
  } catch (error) {
    // Token might be invalid, clear it
    if (error.status === 401) {
      logout();
    }
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Verify token
 * @returns {Promise<Object>} Verification result
 */
export const verifyToken = async () => {
  try {
    if (!isAuthenticated()) {
      return { valid: false };
    }

    const response = await api.get('/api/auth/verify');
    return { valid: true, user: response.data.user };
  } catch (error) {
    if (error.status === 401) {
      logout();
      return { valid: false };
    }
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export { isAuthenticated };

/**
 * Get auth token
 * @returns {string|null}
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export { getStoredUser };
