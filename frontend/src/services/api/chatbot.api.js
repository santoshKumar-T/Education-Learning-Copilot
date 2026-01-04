// Normalize API base URL - remove trailing slash to prevent double slashes
const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return url.replace(/\/+$/, ''); // Remove trailing slashes
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Create a new chat session
 * @returns {Promise<Object>} Session data
 */
export const createSession = async () => {
  const API_BASE_URL = getApiBaseUrl();
  const token = localStorage.getItem('auth_token');
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/session/create`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('%c💾 [SESSION] Created new session', 'color: #8b5cf6; font-weight: bold;');
    console.log(`   Session ID: ${data.sessionId}`);
    
    return data;
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
  const API_BASE_URL = getApiBaseUrl();
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/history`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
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
  // Get auth token if user is logged in
  const token = localStorage.getItem('auth_token');
  const requestId = Date.now().toString(36);
  const startTime = performance.now();
  
  // Debug logging for browser console
  console.log('%c🤖 [CHATBOT] Sending Message to OpenAI API', 'color: #6366f1; font-weight: bold; font-size: 14px;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1;');
  console.log(`📨 Request ID: ${requestId}`);
  console.log(`🌐 API Endpoint: ${API_BASE_URL}/api/chatbot/message`);
  console.log(`💬 User Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
  console.log(`📚 Conversation History: ${conversationHistory.length} previous messages`);
  console.log(`⏱️  Request started at: ${new Date().toLocaleTimeString()}`);
  
  try {
    console.log('📡 Calling backend API...');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/chatbot/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        conversationHistory,
        sessionId, // Include session ID for persistence
      }),
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('%c❌ API Error:', 'color: #ef4444; font-weight: bold;');
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorData.error || 'Unknown error'}`);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const responseTime = Math.round(endTime - startTime);
    
    // Detailed success logging
    console.log('%c✅ OpenAI API Response Received', 'color: #10b981; font-weight: bold;');
    console.log(`⏱️  Total Response Time: ${responseTime}ms`);
    console.log(`🤖 Model Used: ${data.model || 'N/A'}`);
    
    if (data.usage) {
      console.log('%c🎯 Token Usage (Real OpenAI API):', 'color: #8b5cf6; font-weight: bold;');
      console.log(`   📥 Prompt Tokens: ${data.usage.prompt_tokens || 0}`);
      console.log(`   📤 Completion Tokens: ${data.usage.completion_tokens || 0}`);
      console.log(`   📊 Total Tokens: ${data.usage.total_tokens || 0}`);
      console.log(`   💰 Estimated Cost: ~$${((data.usage.total_tokens || 0) * 0.000002).toFixed(6)}`);
    }
    
    console.log(`💬 Response Preview: "${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}"`);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
    
    // Verification indicators
    const isRealOpenAI = data.model && data.model.includes('gpt') && data.usage && data.usage.total_tokens > 0;
    if (isRealOpenAI) {
      console.log('%c✅ VERIFIED: Using REAL OpenAI API (Not Mock Data)', 'color: #10b981; font-weight: bold; font-size: 12px; background: #d1fae5; padding: 4px 8px; border-radius: 4px;');
      console.log('   Evidence:');
      console.log('   • Real GPT model:', data.model);
      console.log('   • Token usage tracked:', data.usage.total_tokens, 'tokens');
      console.log('   • Network latency:', responseTime, 'ms');
    } else {
      console.warn('%c⚠️  WARNING: May not be using real OpenAI API', 'color: #f59e0b; font-weight: bold;');
    }
    
    console.log(''); // Empty line for readability

    return {
      success: true,
      message: data.message,
      usage: data.usage,
      model: data.model,
      requestId,
      responseTime,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.error('%c❌ Chatbot API Error:', 'color: #ef4444; font-weight: bold;');
    console.error(`   Request ID: ${requestId}`);
    console.error(`   Duration: ${duration}ms`);
    console.error(`   Error: ${error.message}`);
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
    const response = await fetch(`${API_BASE_URL}/api/chatbot/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('%c✅ Chatbot Service: Healthy', 'color: #10b981; font-weight: bold;');
      console.log(`   Model: ${data.model || 'N/A'}`);
      console.log(`   Status: ${data.status}`);
    } else {
      console.warn('%c⚠️  Chatbot Service: Unhealthy', 'color: #f59e0b; font-weight: bold;');
      console.warn(`   Error: ${data.error || 'Unknown'}`);
    }
    
    return data;
  } catch (error) {
    console.error('%c❌ Health Check Failed:', 'color: #ef4444; font-weight: bold;');
    console.error(`   ${error.message}`);
    return { success: false, status: 'unhealthy' };
  }
};

