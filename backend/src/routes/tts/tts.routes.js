/**
 * Text-to-Speech Routes
 * Handles TTS generation and audio file serving
 */

import express from 'express';
import {
  generateTTS,
  generateDocumentSummaryAudio,
  serveAudioFile,
  deleteAudio
} from '../../controllers/tts.controller.js';
import { authenticate } from '../../middleware/auth/auth.middleware.js';

const router = express.Router();

// Generate TTS from text (requires auth)
router.post('/generate', authenticate, generateTTS);

// Generate TTS from document summary (requires auth)
router.post('/document/:id', authenticate, generateDocumentSummaryAudio);

export default router;

