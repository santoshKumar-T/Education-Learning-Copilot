/**
 * Lesson Plan Generation Service
 * Generates structured lesson plans using OpenAI API
 */

import OpenAI from 'openai';
import { openaiConfig, validateOpenAIConfig } from '../../config/openai.js';

// Validate configuration on import
validateOpenAIConfig();
const openai = new OpenAI({
  apiKey: openaiConfig.apiKey,
});

/**
 * Generate lesson plan from topic or learning objectives
 * @param {string} topic - The topic or learning objectives
 * @param {Object} options - Lesson plan generation options
 * @returns {Promise<Object>} Generated lesson plan
 */
export const generateLessonPlan = async (topic, options = {}) => {
  try {
    const {
      duration = 60, // minutes
      level = 'intermediate',
      learningObjectives = [],
      includeActivities = true,
      includeAssessment = true,
    } = options;

    console.log('\n📚 [LESSON PLAN GENERATOR] Starting lesson plan generation...');
    console.log(`   Topic: ${topic.substring(0, 50)}${topic.length > 50 ? '...' : ''}`);
    console.log(`   Duration: ${duration} minutes`);
    console.log(`   Level: ${level}`);
    console.log(`   Learning Objectives: ${learningObjectives.length > 0 ? learningObjectives.join(', ') : 'Auto-generated'}`);

    const systemPrompt = `You are an expert educational lesson planner. Generate a comprehensive, structured lesson plan based on the provided topic or learning objectives.

Requirements:
- Create a sequential, logical learning experience
- Build upon previous knowledge progressively
- Include clear learning objectives
- Provide time estimates for each section
- Make it structured and manageable
- Format the response as JSON

Lesson Plan Structure:
1. Title and Overview
2. Learning Objectives (3-5 clear, measurable objectives)
3. Prerequisites (what students should know beforehand)
4. Materials Needed
5. Lesson Structure with time estimates:
   - Introduction/Warm-up
   - Main Content (broken into logical sections)
   - Activities/Practice
   - Assessment/Evaluation
   - Summary/Wrap-up
6. Key Concepts
7. Assessment Methods
8. Extension Activities (optional)

Level Guidelines:
- Beginner: Simple concepts, lots of examples, step-by-step
- Intermediate: Moderate complexity, some prior knowledge assumed
- Advanced: Complex topics, deeper analysis, critical thinking

Return the lesson plan in this JSON format:
{
  "title": "Lesson Plan Title",
  "topic": "Topic name",
  "level": "${level}",
  "duration": ${duration},
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "materials": ["Material 1", "Material 2"],
  "sections": [
    {
      "title": "Section Title",
      "duration": 10,
      "content": "Detailed content for this section",
      "activities": ["Activity 1", "Activity 2"],
      "keyPoints": ["Point 1", "Point 2"]
    }
  ],
  "assessment": {
    "methods": ["Method 1", "Method 2"],
    "criteria": "Assessment criteria"
  },
  "extensionActivities": ["Activity 1", "Activity 2"],
  "estimatedTotalTime": ${duration}
}`;

    const userPrompt = learningObjectives.length > 0
      ? `Generate a lesson plan for the following topic with these specific learning objectives:\n\nTopic: ${topic}\n\nLearning Objectives:\n${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}\n\nMake sure the lesson plan addresses all these objectives and creates a logical learning progression.`
      : `Generate a comprehensive lesson plan for the following topic:\n\n${topic}\n\nCreate learning objectives that are clear, measurable, and appropriate for ${level} level. Structure the lesson to build knowledge progressively.`;

    console.log('   🤖 Calling OpenAI API...');
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: openaiConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: openaiConfig.maxTokens || 3000,
      response_format: { type: 'json_object' },
    });

    const responseTime = Date.now() - startTime;
    console.log(`   ✅ Lesson plan generated in ${responseTime}ms`);

    const responseContent = completion.choices[0].message.content;
    let lessonPlanData;

    try {
      lessonPlanData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('   ❌ Failed to parse JSON response, attempting to extract JSON...');
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        lessonPlanData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse lesson plan response');
      }
    }

    // Validate and structure the lesson plan
    const lessonPlan = {
      title: lessonPlanData.title || `Lesson Plan: ${topic}`,
      topic: lessonPlanData.topic || topic,
      level: lessonPlanData.level || level,
      duration: lessonPlanData.duration || duration,
      learningObjectives: lessonPlanData.learningObjectives || [],
      prerequisites: lessonPlanData.prerequisites || [],
      materials: lessonPlanData.materials || [],
      sections: lessonPlanData.sections || [],
      assessment: lessonPlanData.assessment || {},
      extensionActivities: lessonPlanData.extensionActivities || [],
      estimatedTotalTime: lessonPlanData.estimatedTotalTime || duration,
      createdAt: new Date().toISOString(),
    };

    console.log(`   📊 Lesson Plan: "${lessonPlan.title}"`);
    console.log(`   📝 Sections: ${lessonPlan.sections.length}`);
    console.log(`   🎯 Objectives: ${lessonPlan.learningObjectives.length}`);

    return {
      success: true,
      lessonPlan,
    };
  } catch (error) {
    console.error('   ❌ Lesson plan generation error:', error.message);
    throw new Error(`Failed to generate lesson plan: ${error.message}`);
  }
};

/**
 * Generate lesson plan from conversation history
 * @param {Array} conversationHistory - Conversation messages
 * @param {Object} options - Lesson plan options
 * @returns {Promise<Object>} Generated lesson plan
 */
export const generateLessonPlanFromConversation = async (conversationHistory, options = {}) => {
  try {
    // Extract key topics and concepts from conversation
    const conversationText = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Student' : 'Teacher'}: ${msg.content}`)
      .join('\n');

    const topic = `Based on the following conversation, create a lesson plan that covers the topics discussed:\n\n${conversationText}`;

    return await generateLessonPlan(topic, options);
  } catch (error) {
    console.error('Error generating lesson plan from conversation:', error);
    throw error;
  }
};

