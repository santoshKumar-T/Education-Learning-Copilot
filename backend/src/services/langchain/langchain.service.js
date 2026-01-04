import { ChatOpenAI } from '@langchain/openai';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

dotenv.config();

/**
 * LangChain Service for Advanced Memory Management
 * Provides conversation memory, context management, and chain-based interactions
 */

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

Be helpful, concise, and educational. If asked about something outside the platform's scope, politely redirect to relevant features. Always maintain a friendly and supportive tone.

Current conversation:
{history}

Human: {input}
Assistant:`;

// Initialize LangChain Chat Model
let langchainModel = null;
let conversationChains = new Map(); // Store chains per session

/**
 * Initialize LangChain model
 */
export const initializeLangChain = () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    langchainModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    });

    console.log('✅ LangChain initialized successfully');
    console.log(`   Model: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
    return true;
  } catch (error) {
    console.error('❌ Error initializing LangChain:', error);
    return false;
  }
};

/**
 * Get or create conversation chain for a session
 * @param {string} sessionId - Session ID
 * @returns {ConversationChain} LangChain conversation chain
 */
export const getConversationChain = (sessionId) => {
  if (!langchainModel) {
    initializeLangChain();
  }

  // Return existing chain if available
  if (conversationChains.has(sessionId)) {
    return conversationChains.get(sessionId);
  }

  // Create new chain with memory
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: 'history',
  });

  const prompt = PromptTemplate.fromTemplate(SYSTEM_PROMPT);

  const chain = new ConversationChain({
    llm: langchainModel,
    memory: memory,
    prompt: prompt,
    verbose: false,
  });

  // Store chain for this session
  conversationChains.set(sessionId, chain);

  console.log(`📚 Created LangChain conversation chain for session: ${sessionId}`);
  return chain;
};

/**
 * Generate response using LangChain with memory
 * @param {string} sessionId - Session ID
 * @param {string} message - User message
 * @returns {Promise<Object>} Response with message and metadata
 */
export const generateLangChainResponse = async (sessionId, message) => {
  try {
    if (!langchainModel) {
      initializeLangChain();
    }

    const chain = getConversationChain(sessionId);
    const startTime = Date.now();

    console.log(`\n🧠 [LANGCHAIN] Processing message for session: ${sessionId}`);
    console.log(`   Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Invoke chain with user input
    const response = await chain.call({
      input: message,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Extract response text
    const responseText = response.response || response.output || response.text || '';

    console.log(`   ✅ Response generated in ${duration}ms`);
    console.log(`   💬 Response: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`);

    // Get memory state
    const memoryState = await chain.memory.loadMemoryVariables({});

    return {
      success: true,
      message: responseText,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      responseTime: duration,
      memoryState: memoryState,
      sessionId: sessionId,
    };
  } catch (error) {
    console.error('❌ LangChain Error:', error);
    throw new Error(`LangChain error: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Clear memory for a session
 * @param {string} sessionId - Session ID
 */
export const clearSessionMemory = async (sessionId) => {
  try {
    if (conversationChains.has(sessionId)) {
      const chain = conversationChains.get(sessionId);
      await chain.memory.clear();
      conversationChains.delete(sessionId);
      console.log(`🗑️  Cleared LangChain memory for session: ${sessionId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error clearing memory:', error);
    return false;
  }
};

/**
 * Get memory summary for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Memory summary
 */
export const getMemorySummary = async (sessionId) => {
  try {
    if (conversationChains.has(sessionId)) {
      const chain = conversationChains.get(sessionId);
      const memoryState = await chain.memory.loadMemoryVariables({});
      
      return {
        sessionId,
        hasMemory: true,
        memoryKeys: Object.keys(memoryState),
        messageCount: memoryState.history?.length || 0,
      };
    }
    return {
      sessionId,
      hasMemory: false,
      messageCount: 0,
    };
  } catch (error) {
    console.error('Error getting memory summary:', error);
    return {
      sessionId,
      hasMemory: false,
      error: error.message,
    };
  }
};

/**
 * Save memory to persistent storage (for future retrieval)
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Saved memory state
 */
export const saveMemoryState = async (sessionId) => {
  try {
    if (conversationChains.has(sessionId)) {
      const chain = conversationChains.get(sessionId);
      const memoryState = await chain.memory.loadMemoryVariables({});
      
      // This can be saved to database for persistence
      return {
        sessionId,
        memoryState,
        savedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error saving memory state:', error);
    return null;
  }
};

// Initialize on module load
initializeLangChain();

