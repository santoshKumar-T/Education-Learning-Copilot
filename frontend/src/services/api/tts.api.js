/**
 * Text-to-Speech API Service
 * Handles TTS generation and audio playback
 */

import { api } from '../../../../middleware/frontend/api/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Generate audio from text
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @param {number} speed - Speed of speech (0.25 to 4.0)
 * @returns {Promise} Audio generation response
 */
export const generateTTS = async (text, voice = 'alloy', speed = 1.0) => {
  return api.post(`${API_BASE_URL}/api/tts/generate`, {
    text,
    voice,
    speed
  });
};

/**
 * Generate audio from document summary
 * @param {string} documentId - Document ID
 * @param {string} summaryLevel - Summary level (brief, detailed, comprehensive)
 * @param {string} voice - Voice to use
 * @param {number} speed - Speed of speech
 * @returns {Promise} Audio generation response
 */
export const generateDocumentSummaryAudio = async (documentId, summaryLevel = 'brief', voice = 'alloy', speed = 1.0) => {
  return api.post(`${API_BASE_URL}/api/tts/document/${documentId}`, {
    summaryLevel,
    voice,
    speed
  });
};

/**
 * Get audio file URL
 * @param {string} filename - Audio filename
 * @returns {string} Audio file URL
 */
export const getAudioUrl = (filename) => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  return `${baseUrl}/api/documents/audio/${filename}`;
};

