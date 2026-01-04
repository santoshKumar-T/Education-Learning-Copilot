import dotenv from 'dotenv';

dotenv.config();

export const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
};

export const validateOpenAIConfig = () => {
  if (!openaiConfig.apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  return true;
};




