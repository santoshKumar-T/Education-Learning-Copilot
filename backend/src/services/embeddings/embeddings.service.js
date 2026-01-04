/**
 * Embeddings Service
 * Handles text embedding generation using OpenAI
 */

import OpenAI from 'openai';
import { openaiConfig, validateOpenAIConfig } from '../../config/openai.js';

// Validate configuration on import
validateOpenAIConfig();

const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
});

/**
 * Generate embedding for a text
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} Embedding vector
 */
export const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Text must be a non-empty string');
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate embeddings for multiple texts in batch
 * @param {Array<string>} texts - Array of texts to embed
 * @param {number} batchSize - Number of texts to process per batch (default: 100)
 * @returns {Promise<Array<Array<number>>>} Array of embedding vectors
 */
export const generateEmbeddingsBatch = async (texts, batchSize = 100) => {
  try {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Texts must be a non-empty array');
    }

    const embeddings = [];
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`   📊 Generating embeddings for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} texts)`);
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: batch,
      });

      embeddings.push(...response.data.map(item => item.embedding));
    }

    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings batch:', error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
};

