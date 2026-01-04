/**
 * Shared API Configuration
 * Configuration that can be used by both frontend and backend
 */

/**
 * Normalize API URL - remove trailing slashes
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
export const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

/**
 * Get API base URL
 * Frontend: Uses VITE_API_URL
 * Backend: Uses FRONTEND_URL or default
 */
export const getApiBaseUrl = () => {
  // Frontend environment
  if (typeof window !== 'undefined' && import.meta?.env?.VITE_API_URL) {
    return normalizeUrl(import.meta.env.VITE_API_URL);
  }
  
  // Backend environment
  if (typeof process !== 'undefined' && process.env?.FRONTEND_URL) {
    return normalizeUrl(process.env.FRONTEND_URL);
  }
  
  // Defaults
  if (typeof window !== 'undefined') {
    return 'http://localhost:5000'; // Frontend default
  }
  
  return 'http://localhost:3000'; // Backend default
};

/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

