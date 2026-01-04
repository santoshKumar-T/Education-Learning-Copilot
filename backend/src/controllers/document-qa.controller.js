/**
 * Document Q&A Controller
 * Handles RAG-based question answering for documents
 */

import { answerQuestion, searchDocument } from '../services/document/rag-qa.service.js';
import { dbQuery } from '../middleware/database/index.js';
import Document from '../models/Document.js';

/**
 * Answer a question about a document
 * POST /api/documents/:id/qa
 */
export const askQuestion = async (req, res) => {
  try {
    const userId = req.userId;
    const documentId = req.params.id;
    const { question, topK = 5 } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question is required and must be a non-empty string'
      });
    }

    // Get document (through database middleware)
    const result = await dbQuery(async () => {
      return await Document.findOne({ _id: documentId, userId })
        .select('originalName status');
    }, { operationName: 'Get Document for Q&A' });

    const document = result.data;

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check if document is processed
    if (document.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Document is still being processed. Please wait for processing to complete.'
      });
    }

    console.log(`\n💬 [Q&A] Question about document: ${document.originalName}`);
    console.log(`   User: ${userId}`);
    console.log(`   Question: "${question}"`);

    // Generate answer using RAG
    const result = await answerQuestion(
      question,
      documentId.toString(),
      document.originalName,
      Math.min(Math.max(parseInt(topK) || 5, 1), 10) // Clamp between 1 and 10
    );

    res.json({
      success: qaResult.success,
      answer: qaResult.answer,
      sources: qaResult.sources,
      confidence: qaResult.confidence,
      model: qaResult.model,
      usage: qaResult.usage,
      document: {
        id: document._id,
        name: document.originalName
      }
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to answer question',
      details: error.message
    });
  }
};

/**
 * Search document content
 * POST /api/documents/:id/search
 */
export const searchDocumentContent = async (req, res) => {
  try {
    const userId = req.userId;
    const documentId = req.params.id;
    const { query, topK = 10 } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    // Get document (through database middleware)
    const dbResult = await dbQuery(async () => {
      return await Document.findOne({ _id: documentId, userId })
        .select('originalName status');
    }, { operationName: 'Get Document for Search' });

    const document = dbResult.data;

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    if (document.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Document is still being processed'
      });
    }

    // Search document
    const results = await searchDocument(
      query,
      documentId.toString(),
      Math.min(Math.max(parseInt(topK) || 10, 1), 20) // Clamp between 1 and 20
    );

    res.json({
      success: true,
      results: results,
      count: results.length,
      document: {
        id: document._id,
        name: document.originalName
      }
    });
  } catch (error) {
    console.error('Error searching document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search document',
      details: error.message
    });
  }
};

