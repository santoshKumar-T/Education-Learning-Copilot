/**
 * Error Logger Middleware
 * Centralized error logging and formatting
 */

export const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error('\n❌ [ERROR]', timestamp);
  console.error(`   Method: ${req.method}`);
  console.error(`   Path: ${req.path}`);
  console.error(`   IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
  console.error(`   Error: ${err.message || 'Unknown error'}`);
  
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(`   Stack: ${err.stack}`);
  }
  
  // Log to file or external service if configured
  // TODO: Integrate with external logging service (Sentry, etc.)
  
  next(err);
};

