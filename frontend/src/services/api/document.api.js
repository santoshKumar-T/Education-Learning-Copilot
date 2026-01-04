/**
 * Document API Service
 * Handles document upload, retrieval, and management
 */

import { api } from '../../../../middleware/frontend/api/index.js';

/**
 * Upload a document
 * @param {File} file - File to upload
 * @returns {Promise} Upload response
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  // Don't set Content-Type header - browser will set it automatically with boundary for FormData
  // Use relative path - middleware will add base URL
  return api.post('/api/documents/upload', formData);
};

/**
 * Get user's documents
 * @returns {Promise} List of documents
 */
export const getDocuments = async () => {
  // Use relative path - middleware will add base URL
  return api.get('/api/documents');
};

/**
 * Get single document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise} Document details
 */
export const getDocument = async (documentId) => {
  // Use relative path - middleware will add base URL
  return api.get(`/api/documents/${documentId}`);
};

/**
 * Delete a document
 * @param {string} documentId - Document ID
 * @returns {Promise} Delete response
 */
export const deleteDocument = async (documentId) => {
  // Use relative path - middleware will add base URL
  return api.delete(`/api/documents/${documentId}`);
};

/**
 * Ask a question about a document (RAG-based Q&A)
 * @param {string} documentId - Document ID
 * @param {string} question - User's question
 * @param {number} topK - Number of relevant chunks to retrieve (default: 5)
 * @returns {Promise<Object>} Answer with sources
 */
export const askDocumentQuestion = async (documentId, question, topK = 5) => {
  // Use relative path - middleware will add base URL
  return api.post(`/api/documents/${documentId}/qa`, {
    question,
    topK
  });
};

/**
 * Search document content
 * @param {string} documentId - Document ID
 * @param {string} query - Search query
 * @param {number} topK - Number of results (default: 10)
 * @returns {Promise<Object>} Search results
 */
export const searchDocumentContent = async (documentId, query, topK = 10) => {
  // Use relative path - middleware will add base URL
  return api.post(`/api/documents/${documentId}/search`, {
    query,
    topK
  });
};

/**
 * Generate flashcards from a document
 * @param {string} documentId - Document ID
 * @param {number} count - Number of flashcards to generate (default: 10)
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', 'hard' (default: 'medium')
 * @param {boolean} useSummary - Whether to use summary instead of full text (default: false)
 * @param {string} summaryLevel - Summary level to use: 'brief', 'detailed', 'comprehensive' (default: 'detailed')
 * @returns {Promise<Object>} Flashcards response
 */
export const generateFlashcards = async (documentId, count = 10, difficulty = 'medium', useSummary = false, summaryLevel = 'detailed') => {
  // Use relative path - middleware will add base URL
  return api.post(`/api/documents/${documentId}/flashcards`, {
    count,
    difficulty,
    useSummary,
    summaryLevel
  });
};

