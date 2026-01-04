import { generateChatResponse, formatConversationHistory } from '../services/openai/chatbot.service.js';
import * as sessionService from '../services/session/session.service.mongodb.js';
const { saveMessage, getConversationHistory, updateSessionActivity } = sessionService;
import { optionalAuthenticate } from '../middleware/auth/auth.middleware.js';

/**
 * Handle chatbot message request
 * POST /api/chatbot/message
 */
export const handleChatMessage = async (req, res) => {
  const requestId = Date.now().toString(36);
  const timestamp = new Date().toISOString();
  
  console.log('\n📨 [REQUEST] New Chatbot Message');
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Timestamp: ${timestamp}`);
  console.log(`   IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
  
  try {
    const { message, conversationHistory = [], sessionId } = req.body;
    
    // Get userId from authenticated user (if logged in)
    const userId = req.userId || null;
    
    // If user is authenticated but no sessionId, get their most recent session
    let actualSessionId = sessionId;
    if (userId && !sessionId) {
      const authService = await import('../services/auth/auth.service.mongodb.js');
      const userSessions = await authService.getUserSessions(userId);
      if (userSessions && userSessions.length > 0) {
        actualSessionId = userSessions[userSessions.length - 1]; // Most recent
        console.log(`   👤 Using user's session: ${actualSessionId}`);
      }
    }
    
    // If sessionId provided, load conversation history from storage
    let storedHistory = [];
    if (actualSessionId) {
      console.log(`   📚 Loading history for session: ${actualSessionId}`);
      storedHistory = await getConversationHistory(actualSessionId);
      updateSessionActivity(actualSessionId);
    }

    console.log(`   📝 Message: "${message?.substring(0, 50)}${message?.length > 50 ? '...' : ''}"`);
    console.log(`   💬 History Length: ${conversationHistory.length} messages`);

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.log('   ❌ Validation Failed: Empty or invalid message');
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    }

    // Merge stored history with provided history (stored takes precedence)
    const mergedHistory = storedHistory.length > 0 
      ? storedHistory.map(msg => ({
          type: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content,
          timestamp: msg.timestamp
        }))
      : conversationHistory;

    // Format conversation history
    const formattedHistory = formatConversationHistory(mergedHistory);

    // Add current user message
    const messages = [
      ...formattedHistory,
      { role: 'user', content: message.trim() }
    ];
    
    // Save user message to session if sessionId provided
    if (actualSessionId) {
      await saveMessage(actualSessionId, 'user', message.trim());
      
      // Link session to user if authenticated
      if (userId) {
        const authService = await import('../services/auth/auth.service.mongodb.js');
        await authService.addSessionToUser(userId, actualSessionId);
      }
    }

    console.log('   🔄 Processing request...');

    // Generate response from OpenAI
    const response = await generateChatResponse(messages);
    
    // Save assistant response to session if sessionId provided
    if (actualSessionId) {
      await saveMessage(actualSessionId, 'assistant', response.message, {
        model: response.model,
        prompt_tokens: response.usage?.prompt_tokens,
        completion_tokens: response.usage?.completion_tokens,
        total_tokens: response.usage?.total_tokens
      });
    }

    console.log(`   ✅ [RESPONSE] Request ${requestId} completed successfully`);
    if (actualSessionId) {
      console.log(`   💾 Saved to session: ${actualSessionId}`);
      if (userId) {
        console.log(`   👤 Linked to user: ${userId}`);
      }
    }
    console.log(`   📤 Sending response to client\n`);

    res.json({
      success: true,
      message: response.message,
      usage: response.usage,
      model: response.model,
      timestamp: timestamp,
      sessionId: actualSessionId || null,
      userId: userId || null,
    });
  } catch (error) {
    console.error(`   ❌ [ERROR] Request ${requestId} failed:`);
    console.error(`   Error: ${error.message}`);
    
    console.error(`   📤 Sending error response to client\n`);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate chatbot response',
      timestamp: timestamp,
    });
  }
};

/**
 * Health check for chatbot service
 * GET /api/chatbot/health
 */
export const chatbotHealth = async (req, res) => {
  try {
    // Simple test to verify OpenAI connection
    const testResponse = await generateChatResponse([
      { role: 'user', content: 'Hello' }
    ]);

    res.json({
      success: true,
      status: 'healthy',
      model: testResponse.model,
      message: 'Chatbot service is operational',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

