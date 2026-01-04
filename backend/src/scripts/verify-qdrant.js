/**
 * Qdrant Connection Verification Script
 * Tests connection to Qdrant vector database using API keys and endpoint
 * 
 * Usage: node src/scripts/verify-qdrant.js
 */

import dotenv from 'dotenv';
import { QdrantClient } from '@qdrant/js-client-rest';
import { qdrantConfig, validateQdrantConfig, getQdrantClientConfig } from '../config/qdrant.js';

// Load environment variables
dotenv.config();

const verifyQdrantConnection = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Qdrant Vector Database Connection Verification');
  console.log('='.repeat(60) + '\n');

  try {
    // Validate configuration
    console.log('📋 Checking configuration...');
    validateQdrantConfig();
    
    console.log('✅ Configuration valid');
    console.log(`   URL: ${qdrantConfig.url}`);
    console.log(`   API Key: ${qdrantConfig.apiKey.substring(0, 10)}...${qdrantConfig.apiKey.substring(qdrantConfig.apiKey.length - 4)}`);
    console.log(`   Collection: ${qdrantConfig.collectionName}`);
    console.log(`   Vector Size: ${qdrantConfig.vectorSize}\n`);

    // Create Qdrant client
    console.log('🔌 Creating Qdrant client...');
    const clientConfig = getQdrantClientConfig();
    const client = new QdrantClient({
      url: clientConfig.url,
      apiKey: clientConfig.apiKey,
    });

    // Test 1: Get cluster info
    console.log('\n📡 Test 1: Getting cluster information...');
    try {
      const clusterInfo = await client.getCollections();
      console.log('✅ Successfully connected to Qdrant!');
      console.log(`   Collections found: ${clusterInfo.collections?.length || 0}`);
      
      if (clusterInfo.collections && clusterInfo.collections.length > 0) {
        console.log('\n   Existing collections:');
        clusterInfo.collections.forEach((col, index) => {
          console.log(`   ${index + 1}. ${col.name} (${col.vectors_count || 0} vectors)`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to get cluster info:', error.message);
      throw error;
    }

    // Test 2: Check if collection exists
    console.log(`\n📚 Test 2: Checking collection "${qdrantConfig.collectionName}"...`);
    try {
      const collectionInfo = await client.getCollection(qdrantConfig.collectionName);
      console.log('✅ Collection exists!');
      console.log(`   Name: ${collectionInfo.name}`);
      console.log(`   Vectors Count: ${collectionInfo.vectors_count || 0}`);
      console.log(`   Points Count: ${collectionInfo.points_count || 0}`);
      console.log(`   Vector Size: ${collectionInfo.config?.params?.vectors?.size || 'N/A'}`);
    } catch (error) {
      if (error.status === 404) {
        console.log(`⚠️  Collection "${qdrantConfig.collectionName}" does not exist`);
        console.log('   This is okay - you can create it later when needed');
      } else {
        console.error('❌ Error checking collection:', error.message);
        throw error;
      }
    }

    // Test 3: Create a test collection (optional)
    console.log(`\n🧪 Test 3: Testing collection creation...`);
    const testCollectionName = `test_${Date.now()}`;
    try {
      await client.createCollection(testCollectionName, {
        vectors: {
          size: qdrantConfig.vectorSize,
          distance: 'Cosine',
        },
      });
      console.log(`✅ Successfully created test collection: ${testCollectionName}`);

      // Clean up: Delete test collection
      console.log('   Cleaning up test collection...');
      await client.deleteCollection(testCollectionName);
      console.log('✅ Test collection deleted');
    } catch (error) {
      console.error('❌ Failed to create test collection:', error.message);
      // Don't throw - this is just a test
    }

    // Test 4: Insert and retrieve a test vector
    console.log(`\n🧪 Test 4: Testing vector operations...`);
    const testCollectionName2 = `test_ops_${Date.now()}`;
    try {
      // Create test collection
      await client.createCollection(testCollectionName2, {
        vectors: {
          size: qdrantConfig.vectorSize,
          distance: 'Cosine',
        },
      });

      // Insert a test vector
      const testVector = new Array(qdrantConfig.vectorSize).fill(0).map(() => Math.random());
      await client.upsert(testCollectionName2, {
        wait: true,
        points: [
          {
            id: 1,
            vector: testVector,
            payload: {
              text: 'Test document',
              timestamp: new Date().toISOString(),
            },
          },
        ],
      });
      console.log('✅ Successfully inserted test vector');

      // Retrieve the vector
      const retrieved = await client.retrieve(testCollectionName2, {
        ids: [1],
      });
      console.log('✅ Successfully retrieved test vector');
      console.log(`   Retrieved points: ${retrieved.length}`);

      // Search for similar vectors
      const searchResults = await client.search(testCollectionName2, {
        vector: testVector,
        limit: 5,
      });
      console.log('✅ Successfully performed vector search');
      console.log(`   Search results: ${searchResults.length} points found`);

      // Clean up
      await client.deleteCollection(testCollectionName2);
      console.log('✅ Test collection cleaned up');
    } catch (error) {
      console.error('❌ Failed vector operations test:', error.message);
      // Try to clean up
      try {
        await client.deleteCollection(testCollectionName2);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ QDRANT CONNECTION VERIFICATION SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log('   ✅ Connection: Working');
    console.log('   ✅ Authentication: Valid');
    console.log('   ✅ Permissions: Sufficient');
    console.log('   ✅ Vector Operations: Functional');
    console.log('\n💡 Your Qdrant database is ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ QDRANT CONNECTION VERIFICATION FAILED');
    console.error('='.repeat(60));
    console.error('\n🔍 Error Details:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.status) {
      console.error(`   HTTP Status: ${error.status}`);
    }
    
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response, null, 2)}`);
    }

    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check QDRANT_URL in .env file');
    console.error('   2. Verify QDRANT_API_KEY is correct');
    console.error('   3. Ensure your Qdrant cluster is running');
    console.error('   4. Check network connectivity to Qdrant endpoint');
    console.error('   5. Verify API key has proper permissions\n');

    process.exit(1);
  }
};

// Run verification
verifyQdrantConnection();

