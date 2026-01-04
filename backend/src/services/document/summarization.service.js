/**
 * Document Summarization Service
 * Uses OpenAI to generate summaries at different levels
 */

import OpenAI from 'openai';
import { openaiConfig } from '../../config/openai.js';

const openai = new OpenAI({
  apiKey: openaiConfig.apiKey
});

/**
 * Generate brief summary (1-2 sentences)
 */
export const generateBriefSummary = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates concise, one to two sentence summaries of educational content. Focus on the main topic and key takeaway.'
        },
        {
          role: 'user',
          content: `Please provide a brief summary (1-2 sentences) of the following text:\n\n${text.substring(0, 8000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating brief summary:', error);
    throw new Error(`Failed to generate brief summary: ${error.message}`);
  }
};

/**
 * Generate detailed summary (paragraph format)
 */
export const generateDetailedSummary = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates detailed summaries of educational content. Provide a comprehensive paragraph that covers the main points, key concepts, and important details.'
        },
        {
          role: 'user',
          content: `Please provide a detailed summary (1-2 paragraphs) of the following text:\n\n${text.substring(0, 8000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating detailed summary:', error);
    throw new Error(`Failed to generate detailed summary: ${error.message}`);
  }
};

/**
 * Generate comprehensive summary (multiple paragraphs with structure)
 */
export const generateComprehensiveSummary = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates comprehensive summaries of educational content. Structure your summary with clear sections covering: Overview, Key Concepts, Important Details, and Takeaways.'
        },
        {
          role: 'user',
          content: `Please provide a comprehensive summary of the following text. Structure it with clear sections:\n\n${text.substring(0, 12000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating comprehensive summary:', error);
    throw new Error(`Failed to generate comprehensive summary: ${error.message}`);
  }
};

/**
 * Extract key topics from text
 */
export const extractKeyTopics = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts key topics from educational content. Return a JSON array of topics with their importance level (high, medium, low). Format: [{"topic": "topic name", "importance": "high|medium|low"}]'
        },
        {
          role: 'user',
          content: `Extract the key topics from the following text and return as JSON array:\n\n${text.substring(0, 8000)}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content.trim();
    const parsed = JSON.parse(content);
    
    // Handle different response formats
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed.topics && Array.isArray(parsed.topics)) {
      return parsed.topics;
    } else if (parsed.keyTopics && Array.isArray(parsed.keyTopics)) {
      return parsed.keyTopics;
    } else {
      // Fallback: try to extract topics from text
      return Object.entries(parsed).map(([topic, importance]) => ({
        topic,
        importance: importance || 'medium'
      })).slice(0, 10);
    }
  } catch (error) {
    console.error('Error extracting key topics:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

/**
 * Generate all summaries and extract topics
 */
export const processDocumentContent = async (text) => {
  const startTime = Date.now();
  
  try {
    console.log('📝 Starting document processing...');
    
    // Generate all summaries in parallel for efficiency
    const [brief, detailed, comprehensive, topics] = await Promise.all([
      generateBriefSummary(text),
      generateDetailedSummary(text),
      generateComprehensiveSummary(text),
      extractKeyTopics(text)
    ]);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Document processing completed in ${processingTime}ms`);

    return {
      summary: {
        brief,
        detailed,
        comprehensive
      },
      keyTopics: topics,
      processingTime
    };
  } catch (error) {
    console.error('Error processing document content:', error);
    throw error;
  }
};

