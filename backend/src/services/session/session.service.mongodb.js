import Session from '../../models/Session.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

/**
 * Check if MongoDB is connected
 */
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

/**
 * Create a new chat session
 * @param {string} userId - Optional user ID to link session
 * @returns {Promise<string>} Session ID
 */
export const createSession = async (userId = null) => {
  try {
    if (!isMongoConnected()) {
      throw new Error('Database not connected. Please start MongoDB or configure MongoDB Atlas connection.');
    }
    const session = new Session({
      userId: userId || null,
      messages: [],
      messageCount: 0,
      lastActivity: new Date()
    });

    await session.save();

    console.log(`✅ Session created: ${session._id}`);
    if (userId) {
      console.log(`   👤 Linked to user: ${userId}`);
    }

    return session._id.toString();
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session object
 */
export const getSession = async (sessionId) => {
  try {
    if (!isMongoConnected()) {
      return null;
    }
    const session = await Session.findById(sessionId);
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Save message to session
 * @param {string} sessionId - Session ID
 * @param {string} role - Message role (user or assistant)
 * @param {string} content - Message content
 * @param {Object} metadata - Optional metadata (model, tokens, etc.)
 */
export const saveMessage = async (sessionId, role, content, metadata = {}) => {
  try {
    if (!isMongoConnected()) {
      throw new Error('Database not connected. Please start MongoDB or configure MongoDB Atlas connection.');
    }
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const messageData = {
      role,
      content,
      ...metadata
    };

    session.addMessage(messageData);
    await session.save();

    console.log(`💾 Message saved to session: ${sessionId}`);
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Get conversation history for a session
 * @param {string} sessionId - Session ID
 * @param {number} limit - Optional limit on number of messages
 * @returns {Promise<Array>} Conversation history
 */
export const getConversationHistory = async (sessionId, limit = null) => {
  try {
    if (!isMongoConnected()) {
      return [];
    }
    const session = await Session.findById(sessionId);
    if (!session) {
      return [];
    }

    return session.getConversationHistory(limit);
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
};

/**
 * Get all sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of sessions
 */
export const getUserSessions = async (userId) => {
  try {
    if (!isMongoConnected()) {
      return [];
    }
    const sessions = await Session.find({ userId })
      .sort({ lastActivity: -1 })
      .select('_id userId createdAt lastActivity messageCount')
      .lean(); // Return plain objects for better performance

    return sessions.map(session => ({
      id: session._id.toString(),
      userId: session.userId ? session.userId.toString() : null,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messageCount
    }));
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 */
export const deleteSession = async (sessionId) => {
  try {
    if (!isMongoConnected()) {
      throw new Error('Database not connected. Please start MongoDB or configure MongoDB Atlas connection.');
    }
    await Session.findByIdAndDelete(sessionId);
    console.log(`🗑️  Deleted session: ${sessionId}`);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID
 */
export const updateSessionActivity = async (sessionId) => {
  try {
    if (!isMongoConnected()) {
      return; // Silently fail if DB not connected
    }
    await Session.findByIdAndUpdate(sessionId, {
      lastActivity: new Date()
    });
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};

/**
 * Get session statistics
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session statistics
 */
export const getSessionStats = async (sessionId) => {
  try {
    if (!isMongoConnected()) {
      return null;
    }
    const session = await Session.findById(sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session._id.toString(),
      userId: session.userId ? session.userId.toString() : null,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messageCount,
      userMessages: session.messages.filter(m => m.role === 'user').length,
      assistantMessages: session.messages.filter(m => m.role === 'assistant').length
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return null;
  }
};

/**
 * Get recent sessions (for anonymous users or recovery)
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<Array>} Recent sessions
 */
export const getRecentSessions = async (limit = 10) => {
  try {
    if (!isMongoConnected()) {
      return [];
    }
    const sessions = await Session.find()
      .sort({ lastActivity: -1 })
      .limit(limit)
      .select('_id userId createdAt lastActivity messageCount messages')
      .lean();

    return sessions.map(session => ({
      id: session._id.toString(),
      userId: session.userId ? session.userId.toString() : null,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messageCount,
      preview: session.messages && session.messages.length > 0 
        ? session.messages[0].content.substring(0, 50) 
        : 'No messages'
    }));
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    return [];
  }
};

