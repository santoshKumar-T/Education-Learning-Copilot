/**
 * Document Controller
 * Handles document upload, processing, and retrieval
 */

import Document from '../models/Document.js';
import { extractTextFromPDF, cleanText } from '../services/document/document.service.js';
import { processDocumentContent } from '../services/document/summarization.service.js';
import { dbWrite, dbQuery, safeDbOperation } from '../middleware/database/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Upload and process document
 * POST /api/documents/upload
 */
export const uploadDocument = async (req, res) => {
  try {
    // Handle multer errors (file too large, etc.)
    if (req.fileValidationError) {
      return res.status(400).json({
        success: false,
        error: req.fileValidationError
      });
    }

    if (!req.file) {
      // Check if it's a size limit error
      if (req.error && req.error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          error: 'File too large. Maximum file size is 50MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const userId = req.userId;
    if (!userId) {
      // Clean up uploaded file if user not authenticated
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    console.log(`\n📄 [DOCUMENT] Upload started`);
    console.log(`   User: ${userId}`);
    console.log(`   File: ${req.file.originalname}`);
    console.log(`   Size: ${(req.file.size / 1024).toFixed(2)} KB`);

    // Create document record (through database middleware)
    const result = await dbWrite(async () => {
      const newDocument = new Document({
        userId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileType: path.extname(req.file.originalname).slice(1).toLowerCase(),
        status: 'processing'
      });
      await newDocument.save();
      return newDocument;
    }, { operationName: 'Create Document' });

    // Extract document from middleware result
    const document = result.data;
    if (!document || !document._id) {
      throw new Error('Failed to create document record');
    }

    // Process document asynchronously
    processDocumentAsync(document._id.toString(), req.file.path, req.file.mimetype)
      .catch(error => {
        console.error('Error processing document:', error);
      });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. Processing in background...',
      document: {
        id: document._id,
        filename: document.originalName,
        status: document.status,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      details: error.message
    });
  }
};

/**
 * Process document asynchronously
 */
const processDocumentAsync = async (documentId, filePath, mimeType) => {
  try {
    const result = await dbQuery(async () => {
      return await Document.findById(documentId);
    }, { operationName: 'Get Document for Processing' });

    const document = result.data;
    if (!document) {
      console.error(`Document ${documentId} not found`);
      return;
    }

    console.log(`\n🔄 [PROCESSING] Document: ${document.originalName}`);

    // Extract text based on file type
    let extractedText = '';
    if (mimeType === 'application/pdf' || document.fileType === 'pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (document.fileType === 'txt' || document.fileType === 'md') {
      extractedText = await fs.readFile(filePath, 'utf-8');
    } else {
      throw new Error(`Unsupported file type: ${document.fileType}`);
    }

    // Clean text
    extractedText = cleanText(extractedText);
    
    // Update document with extracted text (through database middleware)
    await dbWrite(async () => {
      document.extractedText = extractedText;
      document.metadata = {
        wordCount: extractedText.split(/\s+/).length,
        pageCount: mimeType === 'application/pdf' ? extractedText.split('\f').length : 1
      };
      await document.save();
    }, { operationName: 'Update Document with Extracted Text' });

    console.log(`   ✅ Text extracted: ${extractedText.length} characters`);

    // Generate summaries and extract topics
    const { summary, keyTopics, processingTime } = await processDocumentContent(extractedText);

    // Update document with summaries and topics (through database middleware)
    await dbWrite(async () => {
      document.summary = summary;
      document.keyTopics = keyTopics;
      document.status = 'completed';
      document.metadata.processingTime = processingTime;
      await document.save();
    }, { operationName: 'Update Document with Summaries' });

    console.log(`   ✅ Processing completed for: ${document.originalName}`);
  } catch (error) {
    console.error(`   ❌ Error processing document ${documentId}:`, error);
    
    // Update document status to failed (through database middleware)
    await safeDbOperation(async () => {
      const doc = await Document.findById(documentId);
      if (doc) {
        doc.status = 'failed';
        doc.error = error.message;
        await doc.save();
      }
    }, { operationName: 'Update Document Status to Failed' });
  }
};

/**
 * Get user's documents
 * GET /api/documents
 */
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await dbQuery(async () => {
      return await Document.find({ userId })
        .sort({ createdAt: -1 })
        .select('-extractedText') // Don't send full text to frontend
        .lean();
    }, { operationName: 'Get User Documents' });

    // Extract data from middleware result
    const documents = result.data || [];

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        filename: doc.originalName,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        summary: doc.summary,
        keyTopics: doc.keyTopics,
        status: doc.status,
        metadata: doc.metadata,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      details: error.message
    });
  }
};

/**
 * Get single document by ID
 * GET /api/documents/:id
 */
export const getDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await dbQuery(async () => {
      return await Document.findOne({ _id: documentId, userId })
        .select('-extractedText') // Don't send full text
        .lean();
    }, { operationName: 'Get Document by ID' });

    const document = result.data;

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      document: {
        id: document._id,
        filename: document.originalName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        summary: document.summary,
        keyTopics: document.keyTopics,
        status: document.status,
        metadata: document.metadata,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document',
      details: error.message
    });
  }
};

/**
 * Delete document
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.userId;
    const documentId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await dbQuery(async () => {
      return await Document.findOne({ _id: documentId, userId });
    }, { operationName: 'Get Document for Deletion' });

    const document = result.data;
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.warn('Error deleting file:', error);
    }

    // Delete document from database (through database middleware)
    await dbWrite(async () => {
      await Document.findByIdAndDelete(documentId);
    }, { operationName: 'Delete Document' });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
      details: error.message
    });
  }
};

