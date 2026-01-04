/**
 * Document API Service
 * Handles document upload, retrieval, and management
 */

import { api } from '../../../../middleware/frontend/api/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Upload a document
 * @param {File} file - File to upload
 * @returns {Promise} Upload response
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  return api.post(`${API_BASE_URL}/api/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Get user's documents
 * @returns {Promise} List of documents
 */
export const getDocuments = async () => {
  return api.get(`${API_BASE_URL}/api/documents`);
};

/**
 * Get single document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise} Document details
 */
export const getDocument = async (documentId) => {
  return api.get(`${API_BASE_URL}/api/documents/${documentId}`);
};

/**
 * Delete a document
 * @param {string} documentId - Document ID
 * @returns {Promise} Delete response
 */
export const deleteDocument = async (documentId) => {
  return api.delete(`${API_BASE_URL}/api/documents/${documentId}`);
};

