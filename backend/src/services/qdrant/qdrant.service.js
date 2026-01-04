/**
 * Qdrant Service
 * Handles vector storage and retrieval in Qdrant
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { qdrantConfig, getQdrantClientConfig } from '../../config/qdrant.js';

let client = null;

/**
 * Get or create Qdrant client
 * @returns {QdrantClient} Qdrant client instance
 */
const getClient = () => {
  if (!client) {
    try {
      const config = getQdrantClientConfig();
      
      // Log connection details (without exposing full API key)
      const urlDisplay = config.url || 'NOT SET';
      const apiKeyDisplay = config.apiKey 
        ? `${config.apiKey.substring(0, 10)}...${config.apiKey.substring(config.apiKey.length - 4)}`
        : 'NOT SET';
      
      console.log('🔌 [QDRANT] Initializing client...');
      console.log(`   URL: ${urlDisplay}`);
      console.log(`   API Key: ${apiKeyDisplay}`);
      
      if (!config.url) {
        throw new Error('QDRANT_URL is not set. Please configure QDRANT_URL in environment variables.');
      }
      
      if (!config.apiKey) {
        throw new Error('QDRANT_API_KEY is not set. Please configure QDRANT_API_KEY in environment variables.');
      }
      
      client = new QdrantClient({
        url: config.url,
        apiKey: config.apiKey,
        // Disable version check to avoid compatibility warnings
        checkCompatibility: false,
      });
      
      console.log('✅ [QDRANT] Client initialized successfully');
    } catch (error) {
      console.error('❌ [QDRANT] Failed to initialize client:', error.message);
      throw error;
    }
  }
  return client;
};

/**
 * Ensure collection exists, create if it doesn't
 * @param {string} collectionName - Name of the collection
 * @param {number} vectorSize - Size of vectors
 * @returns {Promise<void>}
 */
export const ensureCollection = async (collectionName = null, vectorSize = null) => {
  const collection = collectionName || qdrantConfig.collectionName;
  const size = vectorSize || qdrantConfig.vectorSize;
  const client = getClient();

  try {
    // Check if collection exists
    await client.getCollection(collection);
    console.log(`✅ Collection "${collection}" already exists`);
  } catch (error) {
    if (error.status === 404) {
      // Collection doesn't exist, create it
      console.log(`📦 Creating collection "${collection}"...`);
      await client.createCollection(collection, {
        vectors: {
          size: size,
          distance: 'Cosine',
        },
      });
      console.log(`✅ Collection "${collection}" created successfully`);
    } else {
      throw error;
    }
  }
};

/**
 * Upsert vectors to Qdrant
 * @param {Array<Object>} points - Array of points with id, vector, and payload
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<void>}
 */
export const upsertVectors = async (points, collectionName = null) => {
  const collection = collectionName || qdrantConfig.collectionName;
  const client = getClient();

  try {
    await client.upsert(collection, {
      wait: true,
      points: points,
    });
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw new Error(`Failed to upsert vectors: ${error.message}`);
  }
};

/**
 * Search for similar vectors
 * @param {Array<number>} vector - Query vector
 * @param {number} limit - Maximum number of results
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Array>} Search results
 */
export const searchVectors = async (vector, limit = 5, collectionName = null) => {
  const collection = collectionName || qdrantConfig.collectionName;
  
  try {
    const client = getClient();
    
    const results = await client.search(collection, {
      vector: vector,
      limit: limit,
    });
    return results;
  } catch (error) {
    console.error('❌ [QDRANT] Error searching vectors:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED') || error.message.includes('127.0.0.1')) {
      throw new Error('Qdrant connection failed: Cannot connect to localhost in production. Please set QDRANT_URL to your cloud Qdrant instance URL in Railway environment variables.');
    }
    
    if (error.message.includes('fetch failed')) {
      throw new Error(`Qdrant connection failed: Unable to reach Qdrant server at ${qdrantConfig.url}. Please verify QDRANT_URL is correct and the server is accessible.`);
    }
    
    throw new Error(`Failed to search vectors: ${error.message}`);
  }
};

/**
 * Get collection info
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Object>} Collection information
 */
export const getCollectionInfo = async (collectionName = null) => {
  const collection = collectionName || qdrantConfig.collectionName;
  const client = getClient();

  try {
    const info = await client.getCollection(collection);
    return info;
  } catch (error) {
    console.error('Error getting collection info:', error);
    throw new Error(`Failed to get collection info: ${error.message}`);
  }
};

