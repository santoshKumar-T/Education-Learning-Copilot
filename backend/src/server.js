import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatbotRoutes from './routes/chatbot/chatbot.routes.js';
import sessionRoutes from './routes/session/session.routes.js';
import langchainRoutes from './routes/langchain/langchain.routes.js';
import authRoutes from './routes/auth/auth.routes.js';
import quizRoutes from './routes/quiz/quiz.routes.js';
import lessonPlanRoutes from './routes/lesson-plan/lesson-plan.routes.js';
import { initializeLangChain } from './services/langchain/langchain-simple.service.js';
import { connectDatabase } from './config/database.js';
import { requestLogger, errorLogger, performanceLogger } from './middleware/logging/index.js';
import { rateLimiter } from './middleware/rate-limiting/index.js';
import { healthCheck, detailedHealthCheck } from './middleware/monitoring/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration
// Normalize FRONTEND_URL to remove trailing slash for exact match
const getFrontendOrigin = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

app.use(cors({
  origin: getFrontendOrigin(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware: Request logging (through middleware)
app.use(requestLogger);

// Middleware: Performance tracking (through middleware)
app.use(performanceLogger);

// Middleware: Rate limiting (through middleware)
// Apply to all routes except health checks
app.use((req, res, next) => {
  if (req.path === '/health' || req.path === '/') {
    return next(); // Skip rate limiting for health checks
  }
  rateLimiter(req, res, next);
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Education & Learning Copilot API',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check routes (using monitoring middleware)
app.get('/health', healthCheck);
app.get('/health/detailed', detailedHealthCheck);

// Chatbot routes
app.use('/api/chatbot', chatbotRoutes);

// Session management routes
app.use('/api/session', sessionRoutes);

// LangChain routes (advanced memory management)
app.use('/api/langchain', langchainRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Quiz routes
app.use('/api/quiz', quizRoutes);

// Lesson Plan routes
app.use('/api/lesson-plan', lessonPlanRoutes);

// Error handling middleware (using logging middleware)
app.use(errorLogger);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Education & Learning Copilot - Backend Server');
  console.log('='.repeat(60));
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Chatbot endpoint: http://localhost:${PORT}/api/chatbot/message`);
  console.log(`🧠 LangChain endpoint: http://localhost:${PORT}/api/langchain/message`);
  console.log(`💾 Session endpoint: http://localhost:${PORT}/api/session/create`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   - Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`   - Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   - Profile: http://localhost:${PORT}/api/auth/me`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('');
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY is not set in .env file');
    console.warn('   Chatbot will not work without a valid API key');
  } else {
    const keyPreview = process.env.OPENAI_API_KEY.substring(0, 15) + '...';
    const keyLength = process.env.OPENAI_API_KEY.length;
    console.log('✅ OpenAI API key configured');
    console.log(`   Key: ${keyPreview} (${keyLength} characters)`);
    console.log(`   Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
  }
  console.log('');
  console.log('📊 Debug logging enabled - you will see detailed logs for each request');
  console.log('💡 Watch this console to see API key usage and OpenAI calls');
  console.log('💾 Session management enabled - conversations are saved');
  console.log('🧠 LangChain enabled - advanced memory management available');
  console.log('='.repeat(60) + '\n');
  
  // Initialize services
  const dbConnection = await connectDatabase(); // Connect to MongoDB (graceful failure)
  if (!dbConnection) {
    console.warn('⚠️  Running without database - some features may not work');
    console.warn('   See MONGODB_SETUP.md for setup instructions');
  }
  initializeLangChain();
});

export default app;

