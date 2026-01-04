/**
 * View Qdrant Data Script
 * Displays data stored in Qdrant collection
 * 
 * Usage: node src/scripts/view-qdrant-data.js [collection-name]
 */

import dotenv from 'dotenv';
import { QdrantClient } from '@qdrant/js-client-rest';
import { qdrantConfig, getQdrantClientConfig } from '../config/qdrant.js';
import { validateQdrantConfig } from '../config/qdrant.js';

dotenv.config();

const viewQdrantData = async (collectionName = null) => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Qdrant Vector Database - Data Viewer');
  console.log('='.repeat(60) + '\n');

  try {
    validateQdrantConfig();
    
    const collection = collectionName || qdrantConfig.collectionName;
    const clientConfig = getQdrantClientConfig();
    const client = new QdrantClient({
      url: clientConfig.url,
      apiKey: clientConfig.apiKey,
    });

    console.log(`📚 Collection: ${collection}`);
    console.log(`🔗 URL: ${clientConfig.url}\n`);

    // Get collection info
    console.log('📋 Collection Information:');
    const collectionInfo = await client.getCollection(collection);
    console.log(`   Name: ${collectionInfo.name}`);
    console.log(`   Vectors Count: ${collectionInfo.vectors_count || 0}`);
    console.log(`   Points Count: ${collectionInfo.points_count || 0}`);
    console.log(`   Vector Size: ${collectionInfo.config?.params?.vectors?.size || 'N/A'}`);
    console.log(`   Distance: ${collectionInfo.config?.params?.vectors?.distance || 'N/A'}\n`);

    // Get sample points
    console.log('🔍 Fetching sample data...');
    const scrollResult = await client.scroll(collection, {
      limit: 10,
      with_payload: true,
      with_vectors: false, // Don't show full vectors, just metadata
    });

    if (scrollResult.points && scrollResult.points.length > 0) {
      console.log(`\n📄 Sample Documents (showing ${scrollResult.points.length} of ${collectionInfo.points_count}):\n`);
      
      scrollResult.points.forEach((point, index) => {
        console.log(`${'─'.repeat(60)}`);
        console.log(`📌 Point #${index + 1} (ID: ${point.id})`);
        console.log(`${'─'.repeat(60)}`);
        
        if (point.payload) {
          if (point.payload.source) {
            console.log(`   📁 Source: ${point.payload.source}`);
          }
          if (point.payload.chunk_index !== undefined) {
            console.log(`   📑 Chunk: ${point.payload.chunk_index + 1} of ${point.payload.total_chunks || '?'}`);
          }
          if (point.payload.document_type) {
            console.log(`   📄 Type: ${point.payload.document_type}`);
          }
          if (point.payload.ingested_at) {
            console.log(`   🕐 Ingested: ${point.payload.ingested_at}`);
          }
          if (point.payload.text) {
            const text = point.payload.text;
            const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
            console.log(`   📝 Text Preview:\n      ${preview.split('\n').join('\n      ')}`);
          }
        }
        console.log('');
      });

      if (collectionInfo.points_count > 10) {
        console.log(`\n💡 Showing first 10 points. Total points in collection: ${collectionInfo.points_count}`);
        console.log(`   To see more, use the Qdrant API or dashboard.\n`);
      }
    } else {
      console.log('   ⚠️  No points found in collection\n');
    }

    // Show statistics
    console.log('📊 Statistics:');
    if (scrollResult.points && scrollResult.points.length > 0) {
      const sources = new Set();
      const documentTypes = new Set();
      
      scrollResult.points.forEach(point => {
        if (point.payload?.source) sources.add(point.payload.source);
        if (point.payload?.document_type) documentTypes.add(point.payload.document_type);
      });

      console.log(`   📁 Unique Sources: ${sources.size}`);
      if (sources.size > 0) {
        sources.forEach(source => console.log(`      - ${source}`));
      }
      console.log(`   📄 Document Types: ${documentTypes.size}`);
      if (documentTypes.size > 0) {
        documentTypes.forEach(type => console.log(`      - ${type}`));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Data viewing completed!');
    console.log('='.repeat(60));
    console.log('\n💡 Tips:');
    console.log('   - Use Qdrant Cloud dashboard: https://cloud.qdrant.io');
    console.log('   - Or use the Qdrant REST API to query your data');
    console.log('   - Search vectors using similarity search\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERROR VIEWING DATA');
    console.error('='.repeat(60));
    console.error(`\n🔍 Error: ${error.message}\n`);
    
    if (error.status === 404) {
      console.error('💡 Collection not found. Make sure the collection name is correct.');
    }
    
    process.exit(1);
  }
};

const collectionName = process.argv[2] || null;
viewQdrantData(collectionName);

