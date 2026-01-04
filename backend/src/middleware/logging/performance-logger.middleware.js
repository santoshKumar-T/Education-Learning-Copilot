/**
 * Performance Logger Middleware
 * Tracks and logs performance metrics for requests
 */

const performanceMetrics = {
  requests: 0,
  totalDuration: 0,
  minDuration: Infinity,
  maxDuration: 0,
  errors: 0,
};

export const performanceLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Update metrics
    performanceMetrics.requests++;
    performanceMetrics.totalDuration += duration;
    performanceMetrics.minDuration = Math.min(performanceMetrics.minDuration, duration);
    performanceMetrics.maxDuration = Math.max(performanceMetrics.maxDuration, duration);
    
    if (res.statusCode >= 400) {
      performanceMetrics.errors++;
    }
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️  [PERFORMANCE] Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = () => {
  const avgDuration = performanceMetrics.requests > 0
    ? performanceMetrics.totalDuration / performanceMetrics.requests
    : 0;
  
  return {
    ...performanceMetrics,
    avgDuration: Math.round(avgDuration),
    minDuration: performanceMetrics.minDuration === Infinity ? 0 : performanceMetrics.minDuration,
  };
};

/**
 * Reset performance metrics
 */
export const resetPerformanceMetrics = () => {
  performanceMetrics.requests = 0;
  performanceMetrics.totalDuration = 0;
  performanceMetrics.minDuration = Infinity;
  performanceMetrics.maxDuration = 0;
  performanceMetrics.errors = 0;
};

