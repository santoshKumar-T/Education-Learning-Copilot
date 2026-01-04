/**
 * Document Routes
 * Handles document upload, retrieval, and management
 */

import express from 'express';
import {
  uploadDocument,
  getUserDocuments,
  getDocument,
  deleteDocument
} from '../../controllers/document.controller.js';
import { serveAudioFile } from '../../controllers/tts.controller.js';
import { askQuestion, searchDocumentContent } from '../../controllers/document-qa.controller.js';
import { authenticate } from '../../middleware/auth/auth.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';

const router = express.Router();

// Serve audio files (public - unique filenames provide security)
router.get('/audio/:filename', serveAudioFile);

// All other document routes require authentication
router.use(authenticate);

// Upload document with timeout handling
router.post('/upload', (req, res, next) => {
  // Set timeout to 5 minutes for large file uploads
  req.setTimeout(5 * 60 * 1000, () => {
    res.status(408).json({
      success: false,
      error: 'Upload timeout. File may be too large or connection is slow.'
    });
  });
  next();
}, uploadSingle, uploadDocument);

// Get user's documents
router.get('/', getUserDocuments);

// Get single document
router.get('/:id', getDocument);

// Delete document
router.delete('/:id', deleteDocument);

// Q&A routes (require authentication)
// Answer question about document
router.post('/:id/qa', askQuestion);

// Search document content
router.post('/:id/search', searchDocumentContent);

export default router;

