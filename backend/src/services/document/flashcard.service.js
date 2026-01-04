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
      easy: 'Create questions that test basic recall and understanding. Include some questions where the answer might not be immediately obvious from the question alone.',
      medium: 'Create questions that require understanding concepts, making connections, and applying knowledge. Mix in questions that test analysis and require deeper thinking.',
      hard: 'Create challenging questions that require deep analysis, synthesis, application, and critical thinking. Include questions that test understanding of complex relationships and implications.'
    };

    const systemPrompt = `You are an expert educational content creator specializing in creating effective, challenging flashcards for studying.

Your task is to generate high-quality flashcards from educational content. Each flashcard should have:
1. A clear, concise question on the front
2. A comprehensive, accurate answer on the back
3. Relevant context or explanation when helpful

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. Questions MUST NOT have obvious answers. The answer should NOT be deducible from the question alone.
2. Create questions that require ACTUAL KNOWLEDGE from the document to answer correctly.
3. Include questions where someone who hasn't read the document would likely get wrong.
4. Make questions test DEEP UNDERSTANDING, not surface-level recall.
5. **MOST IMPORTANT**: Create questions where there are plausible WRONG answers that sound correct but are actually incorrect.

REQUIRED QUESTION TYPES (use ALL of these):
- **Precise Terminology Questions**: "What does DPO stand for?" (where wrong answers like "Data Protection Order" would be incorrect - only "Data Protection Officer" is correct)
- **Distinction Questions**: "What is the difference between X and Y?" (where X and Y are similar concepts that could be confused)
- **Common Misconception Questions**: Questions that test if user knows the correct concept vs common wrong understanding
- **Application Questions**: "How would you apply X principle in [specific scenario]?" (where wrong application would be plausible)
- **Analysis Questions**: "What are the potential consequences if X is not followed?" (where wrong consequences might seem plausible)
- **Comparison Questions**: "What distinguishes X from Y?" (where the distinction isn't obvious and similar concepts could be confused)
- **Scenario-Based Questions**: "In situation [specific scenario], what would be the appropriate action?" (where wrong actions might seem reasonable)
- **Critical Thinking Questions**: "What would happen if [opposite of what document says]?" (where wrong outcomes might seem plausible)
- **Interpretation Questions**: "What does the document suggest about [implicit concept]?" (where wrong interpretations might seem reasonable)
- **Synthesis Questions**: "How do concepts X and Y relate?" (where wrong relationships might seem plausible)

ANTI-GUESSING STRATEGIES (MUST USE):
- Create questions where there are SIMILAR-SOUNDING WRONG ANSWERS that could be confused
- Include questions about PRECISE TERMINOLOGY where common mistakes exist (e.g., DPO vs DPA, GDPR vs GDRP)
- Ask questions where COMMON MISCONCEPTIONS would lead to wrong answers
- Test ability to DISTINGUISH between similar concepts that sound alike
- Include questions where PLausible-SOUNDING WRONG ANSWERS exist
- Create questions that test SPECIFIC KNOWLEDGE, not general understanding
- Make questions where GUESSING would likely result in wrong answers
- Include questions about EXCEPTIONS, EDGE CASES, or SPECIAL CIRCUMSTANCES
- Ask about RELATIONSHIPS and CONNECTIONS between concepts
- Test UNDERSTANDING OF PRINCIPLES, not just facts

AVOID:
- Questions where the answer is obvious from the question text
- Simple definition questions where the term is in the question
- Questions that can be answered by common sense alone
- Questions where the answer is embedded in the question itself

${difficultyInstructions[difficulty]}

Return ONLY a valid JSON object with a "flashcards" array. Each flashcard should have this structure:
{
  "flashcards": [
    {
      "question": "The question text (MUST require actual knowledge, not obvious)",
      "answer": "CORRECT ANSWER: [the correct answer]\n\nWRONG ANSWERS (common mistakes):\n- [wrong answer 1 that sounds plausible]\n- [wrong answer 2 that could be confused]\n- [wrong answer 3 that is a common misconception]\n\nExplanation: [brief explanation of why the correct answer is right and why wrong answers are incorrect]",
      "category": "Category name (e.g., 'Terminology', 'Application', 'Analysis', 'Critical Thinking', 'Synthesis', 'Scenarios')",
      "difficulty": "${difficulty}"
    }
  ]
}

IMPORTANT: The answer field MUST include:
1. The CORRECT ANSWER clearly labeled
2. At least 2-3 WRONG ANSWERS that are plausible/common mistakes
3. An explanation of why the correct answer is right and why wrong answers are wrong
This format ensures users must actually read and understand to identify the correct answer.`;

    const userMessage = `Generate exactly ${count} flashcards from the following educational content. 

STRICT REQUIREMENTS:
1. Questions MUST require actual knowledge from the document - answers should NOT be obvious
2. If someone blindly guesses "correct" on all questions without reading, they should get MANY WRONG
3. Create questions that test DEEP UNDERSTANDING, not surface recall
4. **CRITICAL**: For EACH flashcard answer, you MUST include:
   - The CORRECT ANSWER clearly labeled
   - At least 2-3 WRONG ANSWERS that are plausible/common mistakes
   - An explanation of why correct is right and wrong answers are incorrect
   
   Example format:
   "CORRECT ANSWER: Data Protection Officer
   
   WRONG ANSWERS (common mistakes):
   - Data Protection Order (incorrect - this is not a real term)
   - Data Privacy Officer (incorrect - DPO is specifically for protection, not just privacy)
   - Data Processing Officer (incorrect - this is a different role)
   
   Explanation: DPO stands for Data Protection Officer, a mandatory role under GDPR. 'Data Protection Order' doesn't exist, 'Data Privacy Officer' is a common misconception, and 'Data Processing Officer' is a different role entirely."

5. Include questions about:
   - Precise definitions and terminology (where wrong terms might sound similar)
   - Distinctions between similar concepts
   - Common misconceptions vs correct understanding
   - Implications and consequences
   - Relationships between concepts
   - Application in different contexts
   - Exceptions and edge cases
   - Why and how things work (not just what)
6. Mix question types: precise terminology, distinction, misconception, application, analysis, critical thinking, synthesis, scenarios
7. Each question should require KNOWING THE SPECIFIC CONTENT, not just general knowledge

Content:
${truncatedText}

Return a JSON object with a "flashcards" array containing exactly ${count} flashcards. 
CRITICAL: Each answer MUST include correct answer + wrong answers + explanation. This ensures users must read and understand to identify the correct answer.`;

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

