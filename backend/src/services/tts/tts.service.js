/**
 * Text-to-Speech Service
 * Uses OpenAI TTS API to convert text to audio
 */

import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { openaiConfig } from '../../config/openai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: openaiConfig.apiKey
});

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, '../../../audio');
fs.mkdir(audioDir, { recursive: true }).catch(() => {});

/**
 * Generate audio from text using OpenAI TTS
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice to use (alloy, echo, fable, onyx, nova, shimmer)
 * @param {string} speed - Speed of speech (0.25 to 4.0, default: 1.0)
 * @returns {Promise<{audioPath: string, audioUrl: string}>} Path and URL to audio file
 */
export const generateAudio = async (text, voice = 'alloy', speed = 1.0) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for TTS generation');
    }

    // Limit text length to avoid token limits (OpenAI TTS has a limit)
    const maxLength = 4000; // Conservative limit for TTS
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '...'
      : text;

    console.log(`\n🎤 [TTS] Generating audio`);
    console.log(`   Text length: ${text.length} characters`);
    console.log(`   Voice: ${voice}`);
    console.log(`   Speed: ${speed}`);

    // Generate audio using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1', // Use tts-1 for faster generation, tts-1-hd for higher quality
      voice: voice, // alloy, echo, fable, onyx, nova, shimmer
      input: truncatedText,
      speed: Math.max(0.25, Math.min(4.0, speed)), // Clamp speed between 0.25 and 4.0
    });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `audio-${timestamp}-${Math.round(Math.random() * 1E9)}.mp3`;
    const audioPath = path.join(audioDir, filename);

    // Convert response to buffer and save
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(audioPath, buffer);

    console.log(`   ✅ Audio generated: ${filename}`);
    console.log(`   📁 Size: ${(buffer.length / 1024).toFixed(2)} KB`);

    // Return path and URL
    return {
      audioPath,
      audioUrl: `/api/documents/audio/${filename}`,
      filename,
      size: buffer.length
    };
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
};

/**
 * Generate audio from document summary
 * @param {string} summaryText - Summary text to convert
 * @param {string} summaryLevel - Level of summary (brief, detailed, comprehensive)
 * @param {string} voice - Voice to use
 * @param {number} speed - Speed of speech
 * @returns {Promise<{audioPath: string, audioUrl: string}>} Audio file info
 */
export const generateSummaryAudio = async (summaryText, summaryLevel = 'brief', voice = 'alloy', speed = 1.0) => {
  try {
    if (!summaryText || summaryText.trim().length === 0) {
      throw new Error('Summary text is required');
    }

    return await generateAudio(summaryText, voice, speed);
  } catch (error) {
    console.error('Error generating summary audio:', error);
    throw error;
  }
};

/**
 * Delete audio file
 * @param {string} filename - Audio filename to delete
 */
export const deleteAudioFile = async (filename) => {
  try {
    const audioPath = path.join(audioDir, filename);
    await fs.unlink(audioPath);
    console.log(`🗑️  [TTS] Deleted audio file: ${filename}`);
  } catch (error) {
    // File might not exist, that's okay
    console.warn(`Warning: Could not delete audio file ${filename}:`, error.message);
  }
};

