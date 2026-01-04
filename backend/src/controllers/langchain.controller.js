import {
  generateLangChainResponse
} from '../services/langchain/langchain-simple.service.js';
import * as sessionService from '../services/session/session.service.mongodb.js';
const { getConversationHistory, saveMessage } = sessionService;

/**
 * Handle chatbot message using LangChain
 * POST /api/langchain/message
 */
export const handleLangChainMessage = async (req, res) => {
  const requestId = Date.now().toString(36);
  const timestamp = new Date().toISOString();
  
  console.log('\n🧠 [LANGCHAIN REQUEST] New Message');
  console.log(`   Request ID: ${requestId}`);
  console.log(`   Timestamp: ${timestamp}`);
  
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string',
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required for LangChain memory management',
      });
    }

    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Get conversation history for context
    const history = await getConversationHistory(sessionId);
    
    // Format messages for LangChain
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant for the Education & Learning Copilot platform. Help with quiz generation, lesson planning, learning paths, RAG technology, LMS integration, YouTube integration, performance tracking, and weak areas detection.`
    };
    
    const formattedMessages = [
      systemMessage,
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message.trim() }
    ];

    // Save user message to session
    await saveMessage(sessionId, 'user', message.trim());

    // Generate response using LangChain
    const response = await generateLangChainResponse(formattedMessages);
    
    // Save assistant response to session
    await saveMessage(sessionId, 'assistant', response.message, {
      model: response.model,
      responseTime: response.responseTime,
      poweredBy: 'LangChain'
    });

    console.log(`   ✅ [RESPONSE] Request ${requestId} completed successfully`);
    console.log(`   💾 Saved to session: ${sessionId}`);
    console.log(`   📤 Sending response to client\n`);

    res.json({
      success: true,
      message: response.message,
      model: response.model,
      responseTime: response.responseTime,
      sessionId: sessionId,
      timestamp: timestamp,
      poweredBy: 'LangChain',
    });
  } catch (error) {
    console.error(`   ❌ [ERROR] Request ${requestId} failed:`);
    console.error(`   Error: ${error.message}`);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate LangChain response',
      timestamp: timestamp,
    });
  }
};

/**
 * Health check for LangChain service
 * GET /api/langchain/health
 */
export const langchainHealth = async (req, res) => {
  try {
    // Test LangChain with a simple message
    const testResponse = await generateLangChainResponse([
      { role: 'user', content: 'Hello' }
    ]);
    
    res.json({
      success: true,
      status: 'healthy',
      message: 'LangChain service is operational',
      model: testResponse.model,
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

