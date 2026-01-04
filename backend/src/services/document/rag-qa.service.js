/**
 * RAG Q&A Service
 * Retrieval-Augmented Generation for document Q&A
 * Uses Qdrant for vector search and OpenAI for answer generation
 */

import { generateEmbedding } from '../embeddings/embeddings.service.js';
import { searchVectors } from '../qdrant/qdrant.service.js';
import { generateChatResponse } from '../openai/chatbot.service.js';
import { qdrantConfig } from '../../config/qdrant.js';

/**
 * Generate answer to a question about a document using RAG
 * @param {string} question - User's question
 * @param {string} documentId - Document ID to search within
 * @param {string} documentName - Document name for context
 * @param {number} topK - Number of relevant chunks to retrieve (default: 5)
 * @returns {Promise<Object>} Answer with sources
 */
export const answerQuestion = async (question, documentId, documentName, topK = 5) => {
  try {
    console.log('\n🔍 [RAG Q&A] Starting question answering');
    console.log(`   Question: "${question.substring(0, 100)}${question.length > 100 ? '...' : ''}"`);
    console.log(`   Document: ${documentName} (${documentId})`);
    console.log(`   Top K: ${topK}`);

    // Step 1: Generate embedding for the question
    console.log('\n📊 Step 1: Generating question embedding...');
    const questionEmbedding = await generateEmbedding(question);
    console.log(`✅ Embedding generated (${questionEmbedding.length} dimensions)`);

    // Step 2: Search for relevant chunks in Qdrant
    console.log('\n🔎 Step 2: Searching for relevant document chunks...');
    const searchResults = await searchVectors(questionEmbedding, topK);
    
    if (!searchResults || searchResults.length === 0) {
      console.log('⚠️  No relevant chunks found');
      return {
        success: false,
        answer: 'I couldn\'t find relevant information in the document to answer your question. Please try rephrasing your question or ensure the document has been properly processed.',
        sources: [],
        confidence: 0
      };
    }

    console.log(`✅ Found ${searchResults.length} relevant chunks`);

    // Step 3: Extract relevant text chunks and metadata
    const relevantChunks = searchResults.map((result, index) => {
      const payload = result.payload || {};
      const score = result.score || 0;
      
      return {
        text: payload.text || payload.chunk || '',
        score: score,
        chunkIndex: payload.chunkIndex || index,
        metadata: {
          documentId: payload.documentId || documentId,
          documentName: payload.documentName || documentName,
          page: payload.page || null,
          section: payload.section || null
        }
      };
    }).filter(chunk => chunk.text && chunk.text.length > 0);

    if (relevantChunks.length === 0) {
      console.log('⚠️  No valid text chunks found in results');
      return {
        success: false,
        answer: 'I found some results but couldn\'t extract the text content. Please try again.',
        sources: [],
        confidence: 0
      };
    }

    // Calculate average confidence score
    const avgScore = relevantChunks.reduce((sum, chunk) => sum + chunk.score, 0) / relevantChunks.length;
    console.log(`   Average relevance score: ${avgScore.toFixed(3)}`);

    // Step 4: Build context from retrieved chunks
    const context = relevantChunks
      .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.text}`)
      .join('\n\n---\n\n');

    console.log(`\n📝 Step 3: Building context (${relevantChunks.length} chunks, ${context.length} characters)`);

    // Step 5: Generate answer using OpenAI with retrieved context
    console.log('\n🤖 Step 4: Generating answer with OpenAI...');
    
    const systemPrompt = `You are an AI assistant helping users understand documents. Answer questions based ONLY on the provided document context. 

Instructions:
- Use the provided document chunks to answer the question
- If the answer is not in the context, say "I cannot find this information in the document"
- Be concise but comprehensive
- Cite which chunk(s) you used when relevant
- If multiple chunks are relevant, synthesize information from all of them

Document: ${documentName}`;

    const userMessage = `Based on the following document context, please answer this question:

Question: ${question}

Document Context:
${context}

Please provide a clear and accurate answer based on the document context above.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const aiResponse = await generateChatResponse(messages);

    console.log('✅ Answer generated successfully');

    // Step 6: Format response
    const response = {
      success: true,
      answer: aiResponse.message,
      sources: relevantChunks.map(chunk => ({
        text: chunk.text.substring(0, 200) + (chunk.text.length > 200 ? '...' : ''),
        score: chunk.score,
        metadata: chunk.metadata
      })),
      confidence: avgScore,
      model: aiResponse.model,
      usage: aiResponse.usage
    };

    console.log(`\n✅ [RAG Q&A] Completed successfully`);
    console.log(`   Answer length: ${response.answer.length} characters`);
    console.log(`   Sources: ${response.sources.length}`);
    console.log(`   Confidence: ${response.confidence.toFixed(3)}`);

    return response;
  } catch (error) {
    console.error('\n❌ [RAG Q&A] Error:', error);
    throw new Error(`Failed to answer question: ${error.message}`);
  }
};

/**
 * Search documents for a query (without generating answer)
 * @param {string} query - Search query
 * @param {string} documentId - Optional document ID to filter by
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} Search results
 */
export const searchDocument = async (query, documentId = null, topK = 10) => {
  try {
    console.log('\n🔍 [RAG Search] Starting document search');
    console.log(`   Query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
    if (documentId) {
      console.log(`   Document ID: ${documentId}`);
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Search Qdrant
    const searchResults = await searchVectors(queryEmbedding, topK);

    if (!searchResults || searchResults.length === 0) {
      return [];
    }

    // Format results
    const results = searchResults.map((result, index) => {
      const payload = result.payload || {};
      return {
        rank: index + 1,
        text: payload.text || payload.chunk || '',
        score: result.score || 0,
        metadata: {
          documentId: payload.documentId || null,
          documentName: payload.documentName || null,
          chunkIndex: payload.chunkIndex || null,
          page: payload.page || null
        }
      };
    }).filter(result => result.text && result.text.length > 0);

    // Filter by documentId if provided
    if (documentId) {
      return results.filter(result => result.metadata.documentId === documentId);
    }

    return results;
  } catch (error) {
    console.error('\n❌ [RAG Search] Error:', error);
    throw new Error(`Failed to search document: ${error.message}`);
  }
};

