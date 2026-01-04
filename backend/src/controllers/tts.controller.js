/**
 * Text-to-Speech Controller
 * Handles TTS generation requests
 */

import { generateAudio, generateSummaryAudio, deleteAudioFile } from '../services/tts/tts.service.js';
import Document from '../models/Document.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate audio from text
 * POST /api/documents/tts/generate
 */
export const generateTTS = async (req, res) => {
  try {
    const { text, voice = 'alloy', speed = 1.0 } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const audioInfo = await generateAudio(text, voice, speed);

    res.json({
      success: true,
      audio: {
        url: audioInfo.audioUrl,
        filename: audioInfo.filename,
        size: audioInfo.size
      }
    });
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio',
      details: error.message
    });
  }
};

/**
 * Generate audio from document summary
 * POST /api/documents/:id/tts
 */
export const generateDocumentSummaryAudio = async (req, res) => {
  try {
    const userId = req.userId;
    const documentId = req.params.id;
    const { summaryLevel = 'brief', voice = 'alloy', speed = 1.0 } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get document
    const document = await Document.findOne({ _id: documentId, userId });
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
        error: 'Document is still being processed. Please wait.'
      });
    }

    // Get summary text based on level
    const summaryText = document.summary?.[summaryLevel];
    if (!summaryText) {
      return res.status(400).json({
        success: false,
        error: `Summary level "${summaryLevel}" not available for this document`
      });
    }

    console.log(`\n🎤 [TTS] Generating audio for document: ${document.originalName}`);
    console.log(`   Summary level: ${summaryLevel}`);
    console.log(`   Text length: ${summaryText.length} characters`);

    const audioInfo = await generateSummaryAudio(summaryText, summaryLevel, voice, speed);

    res.json({
      success: true,
      audio: {
        url: audioInfo.audioUrl,
        filename: audioInfo.filename,
        size: audioInfo.size
      },
      document: {
        id: document._id,
        filename: document.originalName
      }
    });
  } catch (error) {
    console.error('Error generating document summary audio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio',
      details: error.message
    });
  }
};

/**
 * Serve audio file
 * GET /api/documents/audio/:filename
 */
export const serveAudioFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security: Only allow alphanumeric, dash, and underscore in filename
    if (!/^[a-zA-Z0-9_-]+\.mp3$/.test(filename)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    const audioDir = path.join(__dirname, '../../audio');
    const audioPath = path.join(audioDir, filename);

    // Check if file exists
    try {
      await fs.access(audioPath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileBuffer = await fs.readFile(audioPath);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve audio file',
      details: error.message
    });
  }
};

/**
 * Delete audio file
 * DELETE /api/documents/audio/:filename
 */
export const deleteAudio = async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Security: Only allow alphanumeric, dash, and underscore in filename
    if (!/^[a-zA-Z0-9_-]+\.mp3$/.test(filename)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    await deleteAudioFile(filename);

    res.json({
      success: true,
      message: 'Audio file deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting audio file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete audio file',
      details: error.message
    });
  }
};

