import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../../data/conversations.json');

// Default data structure
const defaultData = {
  sessions: {},
  conversations: {},
  lastUpdated: new Date().toISOString()
};

// Database instance (will be initialized)
let db = null;

/**
 * Initialize database - ensure data directory exists
 */
export const initializeSessionDB = async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Initialize database with JSONFilePreset
    db = await JSONFilePreset(dbPath, defaultData);
    
    console.log('✅ Session database initialized');
    return true;
  } catch (error) {
    console.error('❌ Error initializing session database:', error);
    return false;
  }
};

/**
 * Create a new session
 * @param {string} userId - Optional user ID (for future authentication)
 * @returns {string} Session ID
 */
export const createSession = async (userId = null) => {
  if (!db) {
    await initializeSessionDB();
  }
  
  const sessionId = uuidv4();
  const session = {
    id: sessionId,
    userId: userId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    messageCount: 0
  };
  
  db.data.sessions[sessionId] = session;
  db.data.conversations[sessionId] = [];
  db.data.lastUpdated = new Date().toISOString();
  
  await db.write();
  
  console.log(`📝 Created new session: ${sessionId}`);
  return sessionId;
};

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session object or null
 */
export const getSession = async (sessionId) => {
  if (!db) {
    await initializeSessionDB();
  }
  return db.data.sessions[sessionId] || null;
};

/**
 * Save message to conversation history
 * @param {string} sessionId - Session ID
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 * @param {Object} metadata - Additional metadata (model, tokens, etc.)
 */
export const saveMessage = async (sessionId, role, content, metadata = {}) => {
  if (!db) {
    await initializeSessionDB();
  }
  
  if (!db.data.conversations[sessionId]) {
    db.data.conversations[sessionId] = [];
  }
  
  const message = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  db.data.conversations[sessionId].push(message);
  
  // Update session activity
  if (db.data.sessions[sessionId]) {
    db.data.sessions[sessionId].lastActivity = new Date().toISOString();
    db.data.sessions[sessionId].messageCount = db.data.conversations[sessionId].length;
  }
  
  db.data.lastUpdated = new Date().toISOString();
  await db.write();
  
  return message;
};

/**
 * Get conversation history for a session
 * @param {string} sessionId - Session ID
 * @param {number} limit - Optional limit on number of messages
 * @returns {Array} Array of messages
 */
export const getConversationHistory = async (sessionId, limit = null) => {
  if (!db) {
    await initializeSessionDB();
  }
  
  let messages = db.data.conversations[sessionId] || [];
  
  if (limit && limit > 0) {
    messages = messages.slice(-limit); // Get last N messages
  }
  
  return messages;
};

/**
 * Get all sessions for a user (for future authentication)
 * @param {string} userId - User ID
 * @returns {Array} Array of sessions
 */
export const getUserSessions = async (userId) => {
  if (!db) {
    await initializeSessionDB();
  }
  
  const sessions = Object.values(db.data.sessions).filter(
    session => session.userId === userId
  );
  
  return sessions.sort((a, b) => 
    new Date(b.lastActivity) - new Date(a.lastActivity)
  );
};

/**
 * Delete a session and its conversation
 * @param {string} sessionId - Session ID
 */
export const deleteSession = async (sessionId) => {
  if (!db) {
    await initializeSessionDB();
  }
  
  delete db.data.sessions[sessionId];
  delete db.data.conversations[sessionId];
  
  db.data.lastUpdated = new Date().toISOString();
  await db.write();
  
  console.log(`🗑️  Deleted session: ${sessionId}`);
};

/**
 * Update session activity timestamp
 * @param {string} sessionId - Session ID
 */
export const updateSessionActivity = async (sessionId) => {
  if (!db) {
    await initializeSessionDB();
  }
  
  if (db.data.sessions[sessionId]) {
    db.data.sessions[sessionId].lastActivity = new Date().toISOString();
    db.data.lastUpdated = new Date().toISOString();
    await db.write();
  }
};

/**
 * Get session statistics
 * @param {string} sessionId - Session ID
 * @returns {Object} Statistics
 */
export const getSessionStats = async (sessionId) => {
  if (!db) {
    await initializeSessionDB();
  }
  
  const session = db.data.sessions[sessionId];
  const messages = db.data.conversations[sessionId] || [];
  
  if (!session) {
    return null;
  }
  
  const userMessages = messages.filter(m => m.role === 'user').length;
  const assistantMessages = messages.filter(m => m.role === 'assistant').length;
  const totalTokens = messages.reduce((sum, m) => sum + (m.total_tokens || 0), 0);
  
  return {
    sessionId,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity,
    messageCount: messages.length,
    userMessages,
    assistantMessages,
    totalTokens,
    estimatedCost: totalTokens * 0.000002 // Approximate cost for gpt-3.5-turbo
  };
};

