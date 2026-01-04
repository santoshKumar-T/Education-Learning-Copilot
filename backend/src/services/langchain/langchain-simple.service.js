import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Simplified LangChain Service
 * Uses LangChain for better conversation management
 */

let langchainModel = null;

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
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
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
 * Generate response using LangChain
 * @param {Array} messages - Array of message objects with role and content
 * @returns {Promise<Object>} Response with message and metadata
 */
export const generateLangChainResponse = async (messages) => {
  try {
    if (!langchainModel) {
      initializeLangChain();
    }

    const startTime = Date.now();

    console.log(`\n🧠 [LANGCHAIN] Processing message`);
    console.log(`   Messages: ${messages.length}`);

    // Invoke LangChain model
    const response = await langchainModel.invoke(messages);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Extract response content
    const responseText = response.content || response.text || '';

    console.log(`   ✅ Response generated in ${duration}ms`);
    console.log(`   💬 Response: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`);

    return {
      success: true,
      message: responseText,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      responseTime: duration,
      poweredBy: 'LangChain',
    };
  } catch (error) {
    console.error('❌ LangChain Error:', error);
    throw new Error(`LangChain error: ${error.message || 'Unknown error'}`);
  }
};

// Initialize on module load
initializeLangChain();


