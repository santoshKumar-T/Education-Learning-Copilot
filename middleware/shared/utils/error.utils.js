/**
 * Shared Error Utilities
 * Error handling utilities that can be used by both frontend and backend
 */

/**
 * Standard error response format
 */
export const createErrorResponse = (error, statusCode = 500) => {
  return {
    success: false,
    error: error.message || 'An error occurred',
    statusCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
};

/**
 * Standard success response format
 */
export const createSuccessResponse = (data, message = null) => {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error) => {
  return (
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.message?.includes('NetworkError') ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT'
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error) => {
  return (
    error.status === 401 ||
    error.statusCode === 401 ||
    error.message?.includes('token') ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('authentication')
  );
};

