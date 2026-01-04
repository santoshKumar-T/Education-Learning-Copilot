/**
 * Request Logger Middleware
 * Logs all incoming HTTP requests with detailed information
 */

export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  
  // Log request
  console.log(`\n🌐 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`   IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
  console.log(`   User-Agent: ${req.get('user-agent') || 'unknown'}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    // Don't log sensitive data or very large payloads
    const sensitivePaths = ['/api/auth/login', '/api/auth/register', '/api/chatbot/message'];
    const shouldLogBody = !sensitivePaths.some(path => req.path.includes(path));
    
    if (shouldLogBody) {
      const bodyStr = JSON.stringify(req.body);
      const preview = bodyStr.length > 200 ? bodyStr.substring(0, 200) + '...' : bodyStr;
      console.log(`   Body: ${preview}`);
    } else {
      console.log(`   Body: [Sensitive data - not logged]`);
    }
  }
  
  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
    console.log(`   ${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

