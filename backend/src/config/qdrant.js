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
  // Validate URL is not localhost in production
  const url = qdrantConfig.url;
  if (!url) {
    throw new Error('QDRANT_URL is not set in environment variables');
  }
  
  // Check if URL is localhost (won't work in production)
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('QDRANT_URL cannot be localhost in production. Please set QDRANT_URL to your cloud Qdrant instance URL.');
    }
    console.warn('⚠️  QDRANT_URL is set to localhost. This will not work in production.');
  }
  
  return {
    url: url,
    apiKey: qdrantConfig.apiKey,
  };
};

