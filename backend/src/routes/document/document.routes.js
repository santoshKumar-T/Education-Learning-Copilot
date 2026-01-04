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
import { authenticate } from '../../middleware/auth/auth.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';

const router = express.Router();

// All document routes require authentication
router.use(authenticate);

// Upload document
router.post('/upload', uploadSingle, uploadDocument);

// Get user's documents
router.get('/', getUserDocuments);

// Get single document
router.get('/:id', getDocument);

// Delete document
router.delete('/:id', deleteDocument);

export default router;

