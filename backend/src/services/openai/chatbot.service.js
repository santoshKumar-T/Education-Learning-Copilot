import OpenAI from 'openai';
import { openaiConfig, validateOpenAIConfig } from '../../config/openai.js';

// Validate configuration on import
validateOpenAIConfig();

const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
});

// System prompt for Education & Learning Copilot
const SYSTEM_PROMPT = `You are an AI assistant for the Education & Learning Copilot platform. Your role is to help students and educators with:

1. **Quiz Generation**: Help users understand how to generate quizzes from course materials, explain question types, and provide guidance on quiz creation.

2. **Lesson Planning**: Assist with creating structured lesson plans, organizing content, and sequencing learning objectives.

3. **Learning Paths**: Guide users on personalized learning journeys, recommend study sequences, and help optimize their learning paths.

4. **RAG Technology**: Explain how Retrieval-Augmented Generation works with course content, slides, and notes to provide relevant information.

5. **LMS Integration**: Help with Learning Management System integrations (Canvas, Moodle, Blackboard).

6. **YouTube Integration**: Assist with accessing and integrating educational videos from YouTube.

7. **Performance Tracking**: Explain how student performance is tracked and analyzed.

8. **Weak Areas Detection**: Help users understand how the system identifies areas needing improvement.

Be helpful, concise, and educational. If asked about something outside the platform's scope, politely redirect to relevant features. Always maintain a friendly and supportive tone.`;

/**
 * Generate chatbot response using OpenAI
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<Object>} Response from OpenAI
 */
export const generateChatResponse = async (messages) => {
  try {
    // Debug: Log API key status
    const apiKeyStatus = openaiConfig.apiKey 
      ? `✅ API Key: ${openaiConfig.apiKey.substring(0, 15)}... (${openaiConfig.apiKey.length} chars)`
      : '❌ API Key: NOT SET';
    console.log('\n🤖 [CHATBOT] Starting OpenAI API Call');
    console.log('   ' + apiKeyStatus);
    console.log(`   Model: ${openaiConfig.model}`);
    console.log(`   Temperature: ${openaiConfig.temperature}`);
    console.log(`   Max Tokens: ${openaiConfig.maxTokens}`);
    
    // Debug: Log user message
    const userMessage = messages.find(m => m.role === 'user')?.content || 'N/A';
    console.log(`   User Message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);
    console.log(`   Conversation History: ${messages.length} messages`);
    
    // Add system prompt if not present
    const conversationMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    console.log('   📡 Calling OpenAI API...');
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: conversationMessages,
      temperature: openaiConfig.temperature,
      max_tokens: openaiConfig.maxTokens,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Debug: Log response details
    console.log('   ✅ OpenAI API Response Received');
    console.log(`   ⏱️  Response Time: ${duration}ms`);
    console.log(`   📊 Model Used: ${completion.model}`);
    console.log(`   💬 Response: "${completion.choices[0].message.content.substring(0, 100)}${completion.choices[0].message.content.length > 100 ? '...' : ''}"`);
    console.log(`   🎯 Token Usage:`);
    console.log(`      - Prompt Tokens: ${completion.usage.prompt_tokens}`);
    console.log(`      - Completion Tokens: ${completion.usage.completion_tokens}`);
    console.log(`      - Total Tokens: ${completion.usage.total_tokens}`);
    console.log('   ✅ Request completed successfully\n');

    return {
      success: true,
      message: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model,
    };
  } catch (error) {
    console.error('\n❌ [CHATBOT] OpenAI API Error:');
    console.error('   Error Type:', error.constructor.name);
    console.error('   Error Message:', error.message);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      console.error('   🔑 API Key Issue: Invalid or unauthorized');
      console.error('   💡 Check: Is your API key correct in .env file?');
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (error.status === 429) {
      console.error('   ⚠️  Rate Limit: Too many requests');
      console.error('   💡 Wait a moment and try again');
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      console.error('   ⚠️  Server Error: OpenAI API issue');
      throw new Error('OpenAI API server error. Please try again later.');
    } else {
      console.error('   ⚠️  Unknown Error:', error.status || 'N/A');
      throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Format conversation history for OpenAI
 * @param {Array} conversationHistory - Array of previous messages
 * @returns {Array} Formatted messages for OpenAI
 */
export const formatConversationHistory = (conversationHistory) => {
  return conversationHistory.map(msg => ({
    role: msg.type === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
};

