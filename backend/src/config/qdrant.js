/**
 * Qdrant Configuration
 * Configuration for Qdrant vector database connection
 */

import dotenv from 'dotenv';

dotenv.config();

export const qdrantConfig = {
  url: process.env.QDRANT_URL || '',
  apiKey: process.env.QDRANT_API_KEY || '',
  collectionName: process.env.QDRANT_COLLECTION_NAME || 'education_copilot',
  vectorSize: parseInt(process.env.QDRANT_VECTOR_SIZE || '1536'), // OpenAI embedding size
};

/**
 * Validate Qdrant configuration
 */
export const validateQdrantConfig = () => {
  if (!qdrantConfig.url) {
    throw new Error('QDRANT_URL is not set in environment variables');
  }
  if (!qdrantConfig.apiKey) {
    throw new Error('QDRANT_API_KEY is not set in environment variables');
  }
  return true;
};

/**
 * Get Qdrant client configuration
 */
export const getQdrantClientConfig = () => {
  return {
    url: qdrantConfig.url,
    apiKey: qdrantConfig.apiKey,
  };
};

