/**
 * Flashcard Controller
 * Handles flashcard generation requests
 */

import { generateFlashcards, generateFlashcardsFromSummary } from '../services/document/flashcard.service.js';
import { dbQuery } from '../middleware/database/index.js';
import Document from '../models/Document.js';

/**
 * Generate flashcards from a document
 * POST /api/documents/:id/flashcards
 */
export const generateDocumentFlashcards = async (req, res) => {
  try {
    const userId = req.userId;
    const documentId = req.params.id;
    const { count = 10, difficulty = 'medium', useSummary = false, summaryLevel = 'detailed' } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Validate inputs
    const flashcardCount = Math.min(Math.max(parseInt(count) || 10, 1), 50); // Clamp between 1 and 50
    const difficultyLevel = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

    // Get document (through database middleware)
    const dbResult = await dbQuery(async () => {
      return await Document.findOne({ _id: documentId, userId })
        .select('originalName status extractedText summary');
    }, { operationName: 'Get Document for Flashcard Generation' });

    const document = dbResult.data;
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

    console.log(`\n📚 [FLASHCARD] Generating flashcards for document: ${document.originalName}`);
    console.log(`   User: ${userId}`);
    console.log(`   Count: ${flashcardCount}`);
    console.log(`   Difficulty: ${difficultyLevel}`);
    console.log(`   Use Summary: ${useSummary}`);

    let flashcards = [];

    if (useSummary && document.summary && document.summary[summaryLevel]) {
      // Generate from summary
      console.log(`   Using ${summaryLevel} summary`);
      flashcards = await generateFlashcardsFromSummary(
        document.summary[summaryLevel],
        flashcardCount,
        difficultyLevel
      );
    } else if (document.extractedText && document.extractedText.length > 0) {
      // Generate from full text
      console.log(`   Using full document text`);
      flashcards = await generateFlashcards(
        document.extractedText,
        flashcardCount,
        difficultyLevel
      );
    } else {
      return res.status(400).json({
        success: false,
        error: 'Document content not available. Please ensure the document has been processed.'
      });
    }

    res.json({
      success: true,
      flashcards: flashcards,
      count: flashcards.length,
      difficulty: difficultyLevel,
      document: {
        id: document._id,
        name: document.originalName
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate flashcards',
      details: error.message
    });
  }
};

