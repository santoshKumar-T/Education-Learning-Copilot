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
    const config = getQdrantClientConfig();
    client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
    });
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
  const client = getClient();

  try {
    const results = await client.search(collection, {
      vector: vector,
      limit: limit,
    });
    return results;
  } catch (error) {
    console.error('Error searching vectors:', error);
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

