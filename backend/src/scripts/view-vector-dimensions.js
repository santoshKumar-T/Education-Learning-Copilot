/**
 * View Vector Dimensions Script
 * Displays vector dimension values for ingested chunks
 * 
 * Usage: node src/scripts/view-vector-dimensions.js [collection-name] [limit]
 */

import dotenv from 'dotenv';
import { QdrantClient } from '@qdrant/js-client-rest';
import { qdrantConfig, getQdrantClientConfig } from '../config/qdrant.js';
import { validateQdrantConfig } from '../config/qdrant.js';

dotenv.config();

const viewVectorDimensions = async (collectionName = null, limit = 5) => {
  console.log('\n' + '='.repeat(60));
  console.log('🔢 Vector Dimensions Viewer - Ingested Chunks');
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
    console.log(`🔗 URL: ${clientConfig.url}`);
    console.log(`📊 Showing first ${limit} vectors\n`);

    // Get collection info first
    const collectionInfo = await client.getCollection(collection);
    console.log('📋 Collection Information:');
    console.log(`   Total Points: ${collectionInfo.points_count || 0}`);
    console.log(`   Vector Size: ${collectionInfo.config?.params?.vectors?.size || 'N/A'} dimensions`);
    console.log(`   Distance Metric: ${collectionInfo.config?.params?.vectors?.distance || 'N/A'}\n`);

    // Get point IDs first using scroll
    console.log('🔍 Fetching point IDs...');
    const scrollForIds = await client.scroll(collection, {
      limit: parseInt(limit),
      with_payload: true,
      with_vectors: false,
    });

    if (!scrollForIds.points || scrollForIds.points.length === 0) {
      console.log('⚠️  No points found in collection\n');
      process.exit(0);
    }

    const pointIds = scrollForIds.points.map(p => p.id);
    console.log(`   ✅ Found ${pointIds.length} points\n`);

    // Now retrieve with vectors using REST API directly
    // The JS client might not return vectors properly, so use fetch
    console.log('🔍 Fetching vectors with dimensions...\n');
    
    const points = [];
    for (const pointId of pointIds) {
      try {
        const response = await fetch(
          `${clientConfig.url}/collections/${collection}/points/${pointId}?with_payload=true&with_vectors=true`,
          {
            headers: {
              'api-key': clientConfig.apiKey,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const result = data.result || data;
        
        let vector = null;
        if (result.vector && Array.isArray(result.vector)) {
          vector = result.vector;
        } else if (result.vectors && typeof result.vectors === 'object') {
          const vectorKeys = Object.keys(result.vectors);
          if (vectorKeys.length > 0) {
            vector = result.vectors[vectorKeys[0]];
          }
        }
        
        points.push({
          id: result.id,
          vector: vector,
          payload: result.payload || scrollForIds.points.find(p => p.id === pointId)?.payload,
        });
      } catch (error) {
        console.log(`   ⚠️  Failed to retrieve point ${pointId}: ${error.message}`);
      }
    }

    // Filter out points without vectors
    const pointsWithVectors = points.filter(p => p.vector && Array.isArray(p.vector));
    
    if (pointsWithVectors.length === 0) {
      console.log('⚠️  No vectors found in retrieved points');
      console.log('   This might indicate vectors are not stored or API format is different\n');
      console.log('💡 Debug info:');
      console.log(`   Retrieved ${retrieveResult.length} points`);
      if (retrieveResult.length > 0) {
        console.log(`   First point keys: ${Object.keys(retrieveResult[0]).join(', ')}`);
      }
      process.exit(0);
    }

    const vectors = pointsWithVectors.map(p => p.vector);
    const vectorSize = vectors[0]?.length || 0;

    console.log('📊 Vector Statistics:');
    console.log(`   Number of vectors analyzed: ${vectors.length}`);
    console.log(`   Vector dimension size: ${vectorSize}`);
    console.log(`   Expected dimension size: ${qdrantConfig.vectorSize}\n`);

    // Calculate statistics for each dimension
    if (vectors.length > 0 && vectorSize > 0) {
      console.log('📈 Dimension Value Statistics:');
      
      // Calculate min, max, mean, std for first 10 dimensions
      const dimensionStats = [];
      for (let dim = 0; dim < Math.min(vectorSize, 10); dim++) {
        const values = vectors.map(v => v[dim]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);
        
        dimensionStats.push({
          dimension: dim,
          min: min.toFixed(6),
          max: max.toFixed(6),
          mean: mean.toFixed(6),
          std: std.toFixed(6)
        });
      }

      // Display stats for first 10 dimensions
      console.log('   First 10 Dimensions:');
      console.log('   ' + '─'.repeat(70));
      console.log('   ' + 'Dim'.padEnd(6) + 'Min'.padEnd(12) + 'Max'.padEnd(12) + 'Mean'.padEnd(12) + 'Std Dev'.padEnd(12));
      console.log('   ' + '─'.repeat(70));
      dimensionStats.forEach(stat => {
        console.log(`   ${String(stat.dimension).padEnd(6)}${stat.min.padEnd(12)}${stat.max.padEnd(12)}${stat.mean.padEnd(12)}${stat.std.padEnd(12)}`);
      });
      console.log('   ' + '─'.repeat(70));
      console.log(`   ... (showing first 10 of ${vectorSize} dimensions)\n`);

      // Overall statistics
      const allValues = vectors.flat();
      const overallMin = Math.min(...allValues);
      const overallMax = Math.max(...allValues);
      const overallMean = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      const overallVariance = allValues.reduce((sum, val) => sum + Math.pow(val - overallMean, 2), 0) / allValues.length;
      const overallStd = Math.sqrt(overallVariance);

      console.log('📊 Overall Vector Statistics:');
      console.log(`   Min value across all dimensions: ${overallMin.toFixed(6)}`);
      console.log(`   Max value across all dimensions: ${overallMax.toFixed(6)}`);
      console.log(`   Mean value across all dimensions: ${overallMean.toFixed(6)}`);
      console.log(`   Std deviation across all dimensions: ${overallStd.toFixed(6)}\n`);
    }

    // Display detailed vector information for each point
    console.log('='.repeat(60));
    console.log('📄 Detailed Vector Information by Chunk:');
    console.log('='.repeat(60) + '\n');

    pointsWithVectors.forEach((point, index) => {
      console.log(`${'─'.repeat(60)}`);
      console.log(`📌 Vector #${index + 1} (Point ID: ${point.id})`);
      console.log(`${'─'.repeat(60)}`);
      
      if (point.payload) {
        if (point.payload.source) {
          console.log(`   📁 Source: ${point.payload.source}`);
        }
        if (point.payload.chunk_index !== undefined) {
          console.log(`   📑 Chunk: ${point.payload.chunk_index + 1} of ${point.payload.total_chunks || '?'}`);
        }
        if (point.payload.text) {
          const text = point.payload.text;
          const preview = text.length > 100 ? text.substring(0, 100) + '...' : text;
          console.log(`   📝 Text: ${preview}`);
        }
      }

      if (point.vector && Array.isArray(point.vector)) {
        const vector = point.vector;
        console.log(`\n   🔢 Vector Dimensions: ${vector.length}`);
        console.log(`   📊 Vector Statistics:`);
        
        const vectorMin = Math.min(...vector);
        const vectorMax = Math.max(...vector);
        const vectorMean = vector.reduce((a, b) => a + b, 0) / vector.length;
        const vectorSum = vector.reduce((a, b) => a + b, 0);
        const vectorMagnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        
        console.log(`      Min: ${vectorMin.toFixed(6)}`);
        console.log(`      Max: ${vectorMax.toFixed(6)}`);
        console.log(`      Mean: ${vectorMean.toFixed(6)}`);
        console.log(`      Sum: ${vectorSum.toFixed(6)}`);
        console.log(`      Magnitude: ${vectorMagnitude.toFixed(6)}`);
        
        // Show first 20 dimension values
        console.log(`\n   📐 First 20 Dimension Values:`);
        const first20 = vector.slice(0, 20);
        const valuesStr = first20.map((v, i) => {
          const val = v.toFixed(6);
          return `[${i}]=${val}`;
        }).join(', ');
        console.log(`      ${valuesStr}`);
        
        if (vector.length > 20) {
          console.log(`      ... (${vector.length - 20} more dimensions)`);
          
          // Show last 10 dimension values
          const last10 = vector.slice(-10);
          const last10Str = last10.map((v, i) => {
            const val = v.toFixed(6);
            const idx = vector.length - 10 + i;
            return `[${idx}]=${val}`;
          }).join(', ');
          console.log(`      Last 10: ${last10Str}`);
        }
      } else {
        console.log(`   ⚠️  No vector data found for this point`);
      }
      
      console.log('');
    });

    // Export option
    console.log('='.repeat(60));
    console.log('💡 Additional Information:');
    console.log('='.repeat(60));
    console.log('\n📋 Vector Details:');
    console.log(`   - Each vector has ${vectorSize} dimensions (OpenAI text-embedding-ada-002)`);
    console.log(`   - Values are floating-point numbers (typically between -1 and 1)`);
    console.log(`   - Vectors are normalized for cosine similarity search`);
    console.log(`   - Total vectors in collection: ${collectionInfo.points_count || 0}`);
    console.log('\n🔍 To see more vectors, run:');
    console.log(`   node src/scripts/view-vector-dimensions.js ${collection} <number>`);
    console.log(`   Example: node src/scripts/view-vector-dimensions.js ${collection} 10\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ERROR VIEWING VECTOR DIMENSIONS');
    console.error('='.repeat(60));
    console.error(`\n🔍 Error: ${error.message}\n`);
    
    if (error.status === 404) {
      console.error('💡 Collection not found. Make sure the collection name is correct.');
    }
    
    if (error.stack) {
      console.error('📚 Stack Trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
};

// Parse command line arguments
const collectionName = process.argv[2] || null;
const limit = parseInt(process.argv[3] || '5');

viewVectorDimensions(collectionName, limit);
