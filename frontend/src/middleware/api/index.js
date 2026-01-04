/**
 * API Middleware Index
 * Central export point for all API middleware
 */

export { api, apiRequest, API_BASE_URL, getApiBaseUrl } from './api.middleware.js';
export {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
  getStoredUser,
  setStoredUser,
} from './auth.middleware.js';

