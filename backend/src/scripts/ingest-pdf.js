/**
 * PDF Ingestion Script
 * Ingests a PDF document into Qdrant vector database
 * 
 * Usage: node src/scripts/ingest-pdf.js <path-to-pdf>
 * Example: node src/scripts/ingest-pdf.js ../../docs/GDPR_FINAL_EPSU.pdf
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromPDF, chunkText, cleanText } from '../services/document/document.service.js';
import { generateEmbeddingsBatch } from '../services/embeddings/embeddings.service.js';
import { ensureCollection, upsertVectors, getCollectionInfo } from '../services/qdrant/qdrant.service.js';
import { qdrantConfig } from '../config/qdrant.js';
import { validateQdrantConfig } from '../config/qdrant.js';
import { validateOpenAIConfig } from '../config/openai.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ingestPDF = async (pdfPath) => {
  console.log('\n' + '='.repeat(60));
  console.log('📄 PDF Document Ingestion to Vector Database');
  console.log('='.repeat(60) + '\n');

  try {
    // Validate configurations
    console.log('📋 Validating configurations...');
    validateQdrantConfig();
    validateOpenAIConfig();
    console.log('✅ All configurations valid\n');

    // Resolve PDF path
    const resolvedPath = path.isAbsolute(pdfPath) 
      ? pdfPath 
      : path.resolve(__dirname, pdfPath);
    
    console.log(`📂 PDF File: ${resolvedPath}`);

    // Check if file exists
    const fs = await import('fs/promises');
    try {
      await fs.access(resolvedPath);
    } catch (error) {
      throw new Error(`PDF file not found: ${resolvedPath}`);
    }

    // Step 1: Extract text from PDF
    console.log('\n📖 Step 1: Extracting text from PDF...');
    const rawText = await extractTextFromPDF(resolvedPath);
    console.log(`✅ Text extracted: ${rawText.length} characters`);

    // Step 2: Clean text
    console.log('\n🧹 Step 2: Cleaning text...');
    const cleanedText = cleanText(rawText);
    console.log(`✅ Text cleaned: ${cleanedText.length} characters`);

    // Step 3: Chunk text
    console.log('\n✂️  Step 3: Chunking text...');
    const chunkSize = parseInt(process.env.CHUNK_SIZE || '1000');
    const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP || '200');
    const chunks = chunkText(cleanedText, chunkSize, chunkOverlap);
    console.log(`✅ Text chunked into ${chunks.length} pieces`);
    console.log(`   Chunk size: ${chunkSize} characters`);
    console.log(`   Overlap: ${chunkOverlap} characters`);

    if (chunks.length === 0) {
      throw new Error('No text chunks generated from PDF');
    }

    // Step 4: Ensure collection exists
    console.log(`\n📦 Step 4: Ensuring collection "${qdrantConfig.collectionName}" exists...`);
    await ensureCollection();
    console.log('✅ Collection ready');

    // Step 5: Generate embeddings
    console.log('\n🧠 Step 5: Generating embeddings...');
    const embeddings = await generateEmbeddingsBatch(chunks);
    console.log(`✅ Generated ${embeddings.length} embeddings`);
    console.log(`   Vector size: ${embeddings[0]?.length || 0} dimensions`);

    // Step 6: Prepare points for Qdrant
    console.log('\n📝 Step 6: Preparing vectors for storage...');
    const points = chunks.map((chunk, index) => {
      const pointId = Date.now() + index; // Simple ID generation
      return {
        id: pointId,
        vector: embeddings[index],
        payload: {
          text: chunk,
          source: path.basename(resolvedPath),
          chunk_index: index,
          total_chunks: chunks.length,
          document_type: 'pdf',
          ingested_at: new Date().toISOString(),
        },
      };
    });
    console.log(`✅ Prepared ${points.length} points`);

    // Step 7: Store in Qdrant
    console.log(`\n💾 Step 7: Storing vectors in Qdrant collection "${qdrantConfig.collectionName}"...`);
    
    // Store in batches to avoid overwhelming the API
    const batchSize = 100;
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      console.log(`   📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(points.length / batchSize)} (${batch.length} vectors)...`);
      await upsertVectors(batch);
    }
    
    console.log('✅ All vectors stored successfully');

    // Step 8: Verify storage
    console.log(`\n🔍 Step 8: Verifying storage...`);
    const collectionInfo = await getCollectionInfo();
    console.log(`✅ Collection info:`);
    console.log(`   Name: ${collectionInfo.name}`);
    console.log(`   Vectors count: ${collectionInfo.vectors_count || 0}`);
    console.log(`   Points count: ${collectionInfo.points_count || 0}`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ PDF INGESTION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   PDF File: ${path.basename(resolvedPath)}`);
    console.log(`   Text Length: ${cleanedText.length} characters`);
    console.log(`   Chunks Created: ${chunks.length}`);
    console.log(`   Vectors Stored: ${points.length}`);
    console.log(`   Collection: ${qdrantConfig.collectionName}`);
    console.log(`   Total Vectors in Collection: ${collectionInfo.vectors_count || 0}`);
    console.log('\n💡 The document is now searchable in your vector database!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ PDF INGESTION FAILED');
    console.error('='.repeat(60));
    console.error('\n🔍 Error Details:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.stack) {
      console.error(`\n📚 Stack Trace:`);
      console.error(error.stack);
    }

    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify PDF file path is correct');
    console.error('   2. Check QDRANT_URL and QDRANT_API_KEY in .env');
    console.error('   3. Verify OPENAI_API_KEY is set in .env');
    console.error('   4. Ensure Qdrant collection is accessible');
    console.error('   5. Check network connectivity\n');

    process.exit(1);
  }
};

// Get PDF path from command line arguments
const pdfPath = process.argv[2];

if (!pdfPath) {
  console.error('\n❌ Error: PDF file path is required');
  console.error('\nUsage: node src/scripts/ingest-pdf.js <path-to-pdf>');
  console.error('Example: node src/scripts/ingest-pdf.js ../../docs/GDPR_FINAL_EPSU.pdf\n');
  process.exit(1);
}

// Run ingestion
ingestPDF(pdfPath);

