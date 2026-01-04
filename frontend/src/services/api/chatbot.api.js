/**
 * Chatbot API Service
 * Handles chatbot API calls through middleware
 */

import { api } from '../../middleware/api/index.js';

/**
 * Create a new chat session
 * @returns {Promise<Object>} Session data
 */
export const createSession = async () => {
  try {
    const response = await api.post('/api/session/create', {});
    
    console.log('%c💾 [SESSION] Created new session', 'color: #8b5cf6; font-weight: bold;');
    console.log(`   Session ID: ${response.data.sessionId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Get conversation history for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Array>} Conversation history
 */
export const getSessionHistory = async (sessionId) => {
  try {
    const response = await api.get(`/api/session/${sessionId}/history`);
    return response.data.messages || [];
  } catch (error) {
    console.error('Error getting session history:', error);
    return [];
  }
};

/**
 * Send message to chatbot API
 * @param {string} message - User message
 * @param {Array} conversationHistory - Previous conversation messages
 * @param {string} sessionId - Optional session ID for persistence
 * @returns {Promise<Object>} Response from API
 */
export const sendChatMessage = async (message, conversationHistory = [], sessionId = null) => {
  const requestId = Date.now().toString(36);
  const startTime = performance.now();
  
  // Debug logging for browser console
  console.log('%c🤖 [CHATBOT] Sending Message to OpenAI API', 'color: #6366f1; font-weight: bold; font-size: 14px;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1;');
  console.log(`📨 Request ID: ${requestId}`);
  console.log(`💬 User Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
  console.log(`📚 Conversation History: ${conversationHistory.length} previous messages`);
  console.log(`⏱️  Request started at: ${new Date().toLocaleTimeString()}`);
  
  try {
    console.log('📡 Calling backend API through middleware...');
    
    const response = await api.post('/api/chatbot/message', {
      message,
      conversationHistory,
      sessionId,
    }, {
      enableLogging: true,
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    // Detailed success logging
    console.log('%c✅ OpenAI API Response Received', 'color: #10b981; font-weight: bold;');
    console.log(`⏱️  Total Response Time: ${responseTime}ms`);
    console.log(`🤖 Model Used: ${response.data.model || 'N/A'}`);
    
    if (response.data.usage) {
      console.log('%c🎯 Token Usage (Real OpenAI API):', 'color: #8b5cf6; font-weight: bold;');
      console.log(`   📥 Prompt Tokens: ${response.data.usage.prompt_tokens || 0}`);
      console.log(`   📤 Completion Tokens: ${response.data.usage.completion_tokens || 0}`);
      console.log(`   📊 Total Tokens: ${response.data.usage.total_tokens || 0}`);
      console.log(`   💰 Estimated Cost: ~$${((response.data.usage.total_tokens || 0) * 0.000002).toFixed(6)}`);
    }
    
    console.log(`💬 Response Preview: "${response.data.message.substring(0, 100)}${response.data.message.length > 100 ? '...' : ''}"`);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
    
    // Verification indicators
    const isRealOpenAI = response.data.model && response.data.model.includes('gpt') && response.data.usage && response.data.usage.total_tokens > 0;
    if (isRealOpenAI) {
      console.log('%c✅ VERIFIED: Using REAL OpenAI API (Not Mock Data)', 'color: #10b981; font-weight: bold; font-size: 12px; background: #d1fae5; padding: 4px 8px; border-radius: 4px;');
      console.log('   Evidence:');
      console.log('   • Real GPT model:', response.data.model);
      console.log('   • Token usage tracked:', response.data.usage.total_tokens, 'tokens');
      console.log('   • Network latency:', responseTime, 'ms');
    } else {
      console.warn('%c⚠️  WARNING: May not be using real OpenAI API', 'color: #f59e0b; font-weight: bold;');
    }
    
    console.log(''); // Empty line for readability

    return {
      success: true,
      message: response.data.message,
      usage: response.data.usage,
      model: response.data.model,
      requestId,
      responseTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.error('%c❌ Chatbot API Error:', 'color: #ef4444; font-weight: bold;');
    console.error(`   Request ID: ${requestId}`);
    console.error(`   Duration: ${duration}ms`);
    console.error(`   Error: ${error.error || error.message || 'Unknown error'}`);
    console.error('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444;');
    console.log(''); // Empty line
    
    throw error;
  }
};

/**
 * Check chatbot service health
 * @returns {Promise<Object>} Health status
 */
export const checkChatbotHealth = async () => {
  console.log('%c🏥 [CHATBOT] Health Check', 'color: #3b82f6; font-weight: bold;');
  try {
    const response = await api.get('/api/chatbot/health', { skipAuth: true });
    
    if (response.data.success) {
      console.log('%c✅ Chatbot Service: Healthy', 'color: #10b981; font-weight: bold;');
      console.log(`   Model: ${response.data.model || 'N/A'}`);
      console.log(`   Status: ${response.data.status}`);
    } else {
      console.warn('%c⚠️  Chatbot Service: Unhealthy', 'color: #f59e0b; font-weight: bold;');
      console.warn(`   Error: ${response.data.error || 'Unknown'}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('%c❌ Health Check Failed:', 'color: #ef4444; font-weight: bold;');
    console.error(`   ${error.error || error.message || 'Unknown error'}`);
    return { success: false, status: 'unhealthy' };
  }
};
