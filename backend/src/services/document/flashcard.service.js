/**
 * Flashcard Generation Service
 * Generates flashcards from document content using OpenAI
 */

import OpenAI from 'openai';
import { openaiConfig } from '../../config/openai.js';

const openai = new OpenAI({
  apiKey: openaiConfig.apiKey
});

/**
 * Generate flashcards from document content
 * @param {string} text - Document text content
 * @param {number} count - Number of flashcards to generate (default: 10)
 * @param {string} difficulty - Difficulty level: 'easy', 'medium', 'hard' (default: 'medium')
 * @returns {Promise<Array>} Array of flashcard objects
 */
export const generateFlashcards = async (text, count = 10, difficulty = 'medium') => {
  try {
    console.log('\n📚 [FLASHCARD] Starting flashcard generation');
    console.log(`   Text length: ${text.length} characters`);
    console.log(`   Requested count: ${count}`);
    console.log(`   Difficulty: ${difficulty}`);

    // Limit text to avoid token limits (keep it reasonable)
    const maxTextLength = 12000; // ~3000 tokens
    const truncatedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + '...'
      : text;

    const difficultyInstructions = {
      easy: 'Create simple, straightforward questions that test basic understanding and recall of facts.',
      medium: 'Create questions that require understanding concepts and making connections between ideas.',
      hard: 'Create challenging questions that require deep analysis, synthesis, and application of concepts.'
    };

    const systemPrompt = `You are an expert educational content creator specializing in creating effective flashcards for studying.

Your task is to generate high-quality flashcards from educational content. Each flashcard should have:
1. A clear, concise question on the front
2. A comprehensive, accurate answer on the back
3. Relevant context or explanation when helpful

Guidelines:
- Questions should be specific and test understanding, not just recall
- Answers should be clear, accurate, and educational
- Focus on key concepts, important facts, definitions, and relationships
- Avoid trivial or overly obvious questions
- Make questions progressively more challenging based on difficulty level
- ${difficultyInstructions[difficulty]}

Return ONLY a valid JSON object with a "flashcards" array. Each flashcard should have this structure:
{
  "flashcards": [
    {
      "question": "The question text",
      "answer": "The answer text",
      "category": "Category name (e.g., 'Definitions', 'Concepts', 'Processes', 'Facts')",
      "difficulty": "${difficulty}"
    }
  ]
}`;

    const userMessage = `Generate exactly ${count} flashcards from the following educational content. Make them diverse, covering different aspects of the content:

${truncatedText}

Return a JSON object with a "flashcards" array containing exactly ${count} flashcards.`;

    console.log('   🤖 Calling OpenAI to generate flashcards...');
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const duration = Date.now() - startTime;
    console.log(`   ✅ OpenAI response received (${duration}ms)`);

    // Parse the response
    let flashcards = [];
    try {
      const content = response.choices[0].message.content.trim();
      
      // Try to parse as JSON object first (OpenAI might return { flashcards: [...] })
      let parsed = JSON.parse(content);
      
      // If it's an object with a flashcards key, use that
      if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
        flashcards = parsed.flashcards;
      } else if (parsed.cards && Array.isArray(parsed.cards)) {
        flashcards = parsed.cards;
      } else if (Array.isArray(parsed)) {
        flashcards = parsed;
      } else {
        // If it's an object, try to extract arrays
        const keys = Object.keys(parsed);
        for (const key of keys) {
          if (Array.isArray(parsed[key])) {
            flashcards = parsed[key];
            break;
          }
        }
      }

      // Validate and clean flashcards
      flashcards = flashcards
        .filter(card => card.question && card.answer)
        .map((card, index) => ({
          id: `card-${Date.now()}-${index}`,
          question: card.question.trim(),
          answer: card.answer.trim(),
          category: card.category || 'General',
          difficulty: card.difficulty || difficulty,
          createdAt: new Date().toISOString()
        }))
        .slice(0, count); // Ensure we don't exceed requested count

      console.log(`   ✅ Generated ${flashcards.length} flashcards`);
      
      if (flashcards.length === 0) {
        throw new Error('No valid flashcards were generated from the response');
      }

    } catch (parseError) {
      console.error('   ❌ Error parsing flashcard response:', parseError);
      console.error('   Response content:', response.choices[0].message.content.substring(0, 500));
      throw new Error(`Failed to parse flashcard response: ${parseError.message}`);
    }

    return flashcards;
  } catch (error) {
    console.error('\n❌ [FLASHCARD] Error generating flashcards:', error);
    throw new Error(`Failed to generate flashcards: ${error.message}`);
  }
};

/**
 * Generate flashcards from document summary
 * @param {string} summary - Document summary text
 * @param {number} count - Number of flashcards to generate
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<Array>} Array of flashcard objects
 */
export const generateFlashcardsFromSummary = async (summary, count = 10, difficulty = 'medium') => {
  return generateFlashcards(summary, count, difficulty);
};

