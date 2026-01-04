/**
 * Quiz Generation Service
 * Generates quizzes using OpenAI API
 */

import OpenAI from 'openai';
import { openaiConfig, validateOpenAIConfig } from '../../config/openai.js';

// Validate configuration on import
validateOpenAIConfig();
const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
});

/**
 * Generate quiz from topic or content
 * @param {string} topic - The topic or content to generate quiz from
 * @param {Object} options - Quiz generation options
 * @returns {Promise<Object>} Generated quiz
 */
export const generateQuiz = async (topic, options = {}) => {
  try {
    const {
      numQuestions = 5,
      difficulty = 'medium',
      questionTypes = ['multiple-choice', 'true-false', 'short-answer'],
      timeLimit = null,
    } = options;

    console.log('\n📝 [QUIZ GENERATOR] Starting quiz generation...');
    console.log(`   Topic: ${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}`);
    console.log(`   Questions: ${numQuestions}`);
    console.log(`   Difficulty: ${difficulty}`);
    console.log(`   Types: ${questionTypes.join(', ')}`);

    const systemPrompt = `You are an expert quiz generator for educational content. Generate a comprehensive quiz based on the provided topic or content.

Requirements:
- Generate exactly ${numQuestions} questions
- Difficulty level: ${difficulty}
- Question types: ${questionTypes.join(', ')}
- Each question should be clear, educational, and test understanding
- Provide correct answers and explanations
- Format the response as JSON

Question Types:
- Multiple Choice: Provide 4 options (A, B, C, D), mark the correct one
- True/False: Simple true or false questions
- Short Answer: Questions requiring brief written responses

Return the quiz in this JSON format:
{
  "title": "Quiz title",
  "topic": "Topic name",
  "difficulty": "${difficulty}",
  "timeLimit": ${timeLimit || 'null'},
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "totalQuestions": ${numQuestions}
}`;

    const userPrompt = `Generate a quiz on the following topic:\n\n${topic}\n\nMake sure the questions are relevant, educational, and cover important aspects of the topic.`;

    console.log('   🤖 Calling OpenAI API...');
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: openaiConfig.maxTokens || 2000,
      response_format: { type: 'json_object' },
    });

    const responseTime = Date.now() - startTime;
    console.log(`   ✅ Quiz generated in ${responseTime}ms`);

    const responseContent = completion.choices[0].message.content;
    let quizData;

    try {
      quizData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('   ❌ Failed to parse JSON response, attempting to extract JSON...');
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from OpenAI');
      }
    }

    // Validate quiz structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz structure: missing questions array');
    }

    // Add metadata
    quizData.generatedAt = new Date().toISOString();
    quizData.id = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    quizData.actualQuestions = quizData.questions.length;

    console.log(`   📊 Quiz Stats:`);
    console.log(`      - Title: ${quizData.title || 'Untitled Quiz'}`);
    console.log(`      - Questions Generated: ${quizData.questions.length}`);
    console.log(`      - Token Usage: ${completion.usage.total_tokens}`);
    console.log('   ✅ Quiz generation completed successfully\n');

    return {
      success: true,
      quiz: quizData,
      usage: completion.usage,
      model: completion.model,
      responseTime,
    };
  } catch (error) {
    console.error('\n❌ [QUIZ GENERATOR] Error generating quiz:');
    console.error('   Error Type:', error.constructor.name);
    console.error('   Error Message:', error.message);

    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your .env file.');
    } else if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('OpenAI API server error. Please try again later.');
    } else {
      throw new Error(`Quiz generation failed: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Generate quiz from conversation history
 * @param {Array} conversationHistory - Previous conversation messages
 * @param {Object} options - Quiz generation options
 * @returns {Promise<Object>} Generated quiz
 */
export const generateQuizFromConversation = async (conversationHistory, options = {}) => {
  try {
    // Extract key topics from conversation
    const conversationText = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const topic = `Based on the following conversation, generate a quiz:\n\n${conversationText}`;

    return await generateQuiz(topic, options);
  } catch (error) {
    throw error;
  }
};

/**
 * Validate quiz answers
 * @param {Object} quiz - The quiz object
 * @param {Object} answers - User answers { questionId: answer }
 * @returns {Object} Results with score and feedback
 */
export const validateQuizAnswers = (quiz, answers) => {
  try {
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error('Invalid quiz structure');
    }

    let correctCount = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[question.id] || answers[index];
      let isCorrect = false;

      if (question.type === 'multiple-choice') {
        isCorrect = parseInt(userAnswer) === question.correctAnswer;
      } else if (question.type === 'true-false') {
        isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
      } else if (question.type === 'short-answer') {
        // For short answers, we'll do a simple keyword match (could be enhanced with AI)
        const userAnswerLower = String(userAnswer).toLowerCase();
        const correctAnswerLower = String(question.correctAnswer).toLowerCase();
        isCorrect = userAnswerLower.includes(correctAnswerLower) || 
                   correctAnswerLower.includes(userAnswerLower);
      }

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: question.id || index,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation || '',
      });
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const percentage = score;

    return {
      success: true,
      score,
      percentage,
      correctCount,
      totalQuestions,
      results,
      passed: score >= 70, // 70% passing threshold
    };
  } catch (error) {
    throw new Error(`Failed to validate quiz answers: ${error.message}`);
  }
};

