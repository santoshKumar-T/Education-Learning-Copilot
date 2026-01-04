/**
 * API Middleware
 * Centralized middleware for all API requests
 * Handles authentication, error handling, logging, and request/response transformation
 */

// Import shared utilities from root middleware
import { normalizeUrl, getApiBaseUrl as getSharedApiBaseUrl } from '../../shared/index.js';

// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return normalizeUrl(url); // Use shared utility
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Request Interceptor Middleware
 * Processes requests before sending
 */
const requestInterceptor = (config) => {
  // Normalize URL
  if (config.url.startsWith('/')) {
    config.url = `${API_BASE_URL}${config.url}`;
  } else if (!config.url.startsWith('http')) {
    config.url = `${API_BASE_URL}/${config.url}`;
  }

  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {};
  }

  // Set default Content-Type (but not for FormData - browser will set it with boundary)
  if (!config.headers['Content-Type'] && config.method !== 'GET') {
    // Check if body is FormData - if so, don't set Content-Type (browser will handle it)
    if (!(config.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
  }

  // Add authentication token if available
  const token = localStorage.getItem('auth_token');
  if (token && !config.skipAuth) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add credentials for CORS
  if (config.credentials === undefined) {
    config.credentials = 'include';
  }

  // Generate request ID for tracking
  config.requestId = config.requestId || Date.now().toString(36);

  // Add timestamp
  config.timestamp = new Date().toISOString();

  return config;
};

/**
 * Response Interceptor Middleware
 * Processes responses after receiving
 */
const responseInterceptor = async (response, config) => {
  // Clone response for reading body multiple times if needed
  const clonedResponse = response.clone();

  // Parse JSON response
  let data;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      data = { error: 'Invalid JSON response' };
    }
  } else {
    data = await response.text();
  }

  // Handle non-OK responses
  if (!response.ok) {
    const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.data = data;
    error.config = config;
    error.response = clonedResponse;
    throw error;
  }

  // Return standardized response
  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    config,
  };
};

/**
 * Error Handler Middleware
 * Handles errors consistently
 */
const errorHandler = (error, config) => {
  // Log error
  console.error(`[API Error] ${config?.method || 'GET'} ${config?.url || 'Unknown'}:`, error);

  // Handle specific error types
  if (error.status === 401) {
    // Unauthorized - clear auth and redirect
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    console.warn('Authentication expired. Please log in again.');
  } else if (error.status === 403) {
    console.error('Access forbidden. You may not have permission for this action.');
  } else if (error.status === 404) {
    console.error('Resource not found.');
  } else if (error.status === 500) {
    console.error('Server error. Please try again later.');
  } else if (error.status >= 500) {
    console.error('Server error. Please try again later.');
  }

  // Return error in consistent format
  return {
    success: false,
    error: error.message || 'An error occurred',
    status: error.status,
    data: error.data,
    config,
  };
};

/**
 * Logging Middleware
 * Logs requests and responses for debugging
 */
const loggingMiddleware = (config, response = null, error = null) => {
  if (import.meta.env.DEV || config.enableLogging) {
    if (error) {
      console.error(`%c❌ [API] ${config.method} ${config.url}`, 'color: #ef4444; font-weight: bold;', error);
    } else if (response) {
      console.log(`%c✅ [API] ${config.method} ${config.url}`, 'color: #10b981; font-weight: bold;', {
        status: response.status,
        data: response.data,
      });
    } else {
      console.log(`%c📡 [API] ${config.method} ${config.url}`, 'color: #3b82f6; font-weight: bold;', {
        body: config.body,
        headers: config.headers,
      });
    }
  }
};

/**
 * Main API Request Function
 * Uses middleware chain to process requests
 * @param {Object} config - Request configuration
 * @returns {Promise<Object>} Response data
 */
export const apiRequest = async (config) => {
  const startTime = performance.now();

  try {
    // Apply request interceptor
    const processedConfig = requestInterceptor({ ...config });

    // Log request
    loggingMiddleware(processedConfig);

    // Prepare body - don't stringify FormData
    let requestBody = undefined;
    if (processedConfig.body) {
      if (processedConfig.body instanceof FormData) {
        // FormData should be sent as-is (browser will set Content-Type with boundary)
        requestBody = processedConfig.body;
        // Remove Content-Type header for FormData - browser will set it automatically
        delete processedConfig.headers['Content-Type'];
      } else {
        // JSON data - stringify it
        requestBody = JSON.stringify(processedConfig.body);
      }
    }

    // Make fetch request
    const response = await fetch(processedConfig.url, {
      method: processedConfig.method || 'GET',
      headers: processedConfig.headers,
      body: requestBody,
      credentials: processedConfig.credentials,
    });

    // Apply response interceptor
    const processedResponse = await responseInterceptor(response, processedConfig);

    // Calculate duration
    const duration = Math.round(performance.now() - startTime);
    processedResponse.duration = duration;

    // Log response
    loggingMiddleware(processedConfig, processedResponse);

    return processedResponse;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);

    // Apply error handler
    const errorResponse = errorHandler(error, { ...config, duration });

    // Log error
    loggingMiddleware(config, null, errorResponse);

    // Throw error with consistent format
    const apiError = new Error(errorResponse.error || error.message || 'An error occurred');
    apiError.status = errorResponse.status || error.status;
    apiError.data = errorResponse.data || error.data;
    apiError.config = errorResponse.config || config;
    throw apiError;
  }
};

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (url, config = {}) => apiRequest({ ...config, method: 'GET', url }),
  
  post: (url, body, config = {}) => apiRequest({ ...config, method: 'POST', url, body }),
  
  put: (url, body, config = {}) => apiRequest({ ...config, method: 'PUT', url, body }),
  
  patch: (url, body, config = {}) => apiRequest({ ...config, method: 'PATCH', url, body }),
  
  delete: (url, config = {}) => apiRequest({ ...config, method: 'DELETE', url }),
};

/**
 * Export API base URL for use in other modules
 */
export { API_BASE_URL, getApiBaseUrl };

