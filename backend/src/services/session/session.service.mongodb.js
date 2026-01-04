/**
 * Session Service (MongoDB)
 * Handles session management using MongoDB through database middleware
 */

import Session from '../../models/Session.js';
import { dbQuery, dbWrite, safeDbOperation } from '../../middleware/database/index.js';

/**
 * Create a new chat session
 * @param {string} userId - Optional user ID to link session
 * @returns {Promise<string>} Session ID
 */
export const createSession = async (userId = null) => {
  return dbWrite(async () => {
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
  }, {
    operationName: 'Create Session',
  }).then(result => result.data);
};

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session object
 */
export const getSession = async (sessionId) => {
  return safeDbOperation(async () => {
    const session = await Session.findById(sessionId);
    return session;
  }, {
    operationName: 'Get Session',
  }).then(result => result?.data || null);
};

/**
 * Save message to session
 * @param {string} sessionId - Session ID
 * @param {string} role - Message role (user or assistant)
 * @param {string} content - Message content
 * @param {Object} metadata - Optional metadata (model, tokens, etc.)
 */
export const saveMessage = async (sessionId, role, content, metadata = {}) => {
  return dbWrite(async () => {
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
  }, {
    operationName: 'Save Message',
  });
};

/**
 * Get conversation history for a session
 * @param {string} sessionId - Session ID
 * @param {number} limit - Optional limit on number of messages
 * @returns {Promise<Array>} Conversation history
 */
export const getConversationHistory = async (sessionId, limit = null) => {
  return safeDbOperation(async () => {
    const session = await Session.findById(sessionId);
    if (!session) {
      return [];
    }

    return session.getConversationHistory(limit);
  }, {
    operationName: 'Get Conversation History',
  }).then(result => result?.data || []);
};

/**
 * Get all sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of sessions
 */
export const getUserSessions = async (userId) => {
  return safeDbOperation(async () => {
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
  }, {
    operationName: 'Get User Sessions',
  }).then(result => result?.data || []);
};

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 */
export const deleteSession = async (sessionId) => {
  return dbWrite(async () => {
    await Session.findByIdAndDelete(sessionId);
    console.log(`🗑️  Deleted session: ${sessionId}`);
  }, {
    operationName: 'Delete Session',
  });
};

/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID
 */
export const updateSessionActivity = async (sessionId) => {
  return safeDbOperation(async () => {
    await Session.findByIdAndUpdate(sessionId, {
      lastActivity: new Date()
    });
  }, {
    operationName: 'Update Session Activity',
    requireConnection: false, // Don't throw if DB not connected
  });
};

/**
 * Get session statistics
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session statistics
 */
export const getSessionStats = async (sessionId) => {
  return safeDbOperation(async () => {
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
  }, {
    operationName: 'Get Session Stats',
  }).then(result => result?.data || null);
};

/**
 * Get recent sessions (for anonymous users or recovery)
 * @param {number} limit - Maximum number of sessions to return
 * @returns {Promise<Array>} Recent sessions
 */
export const getRecentSessions = async (limit = 10) => {
  return safeDbOperation(async () => {
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
  }, {
    operationName: 'Get Recent Sessions',
  }).then(result => result?.data || []);
};
