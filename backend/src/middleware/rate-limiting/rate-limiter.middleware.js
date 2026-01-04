/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP/user
 */

const rateLimitStore = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes default
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.firstRequest > windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiter middleware
 */
export const rateLimiter = (req, res, next) => {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  
  // Get identifier (IP address or user ID)
  const identifier = req.userId || req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Get or create rate limit data
  let rateLimitData = rateLimitStore.get(identifier);
  
  if (!rateLimitData) {
    rateLimitData = {
      firstRequest: now,
      requests: [],
    };
    rateLimitStore.set(identifier, rateLimitData);
  }
  
  // Remove requests outside the window
  rateLimitData.requests = rateLimitData.requests.filter(
    timestamp => now - timestamp < windowMs
  );
  
  // Check if limit exceeded
  if (rateLimitData.requests.length >= maxRequests) {
    const resetTime = new Date(rateLimitData.requests[0] + windowMs);
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((rateLimitData.requests[0] + windowMs - now) / 1000),
      resetTime: resetTime.toISOString(),
    });
  }
  
  // Add current request
  rateLimitData.requests.push(now);
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - rateLimitData.requests.length);
  res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
  
  next();
};

/**
 * Get rate limit status for an identifier
 */
export const getRateLimitStatus = (identifier) => {
  const data = rateLimitStore.get(identifier);
  if (!data) {
    return { requests: 0, limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100') };
  }
  
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');
  const now = Date.now();
  const validRequests = data.requests.filter(timestamp => now - timestamp < windowMs);
  
  return {
    requests: validRequests.length,
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    remaining: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100') - validRequests.length,
  };
};

