import * as sessionService from '../services/session/session.service.mongodb.js';
const {
  createSession,
  getSession,
  getConversationHistory,
  getUserSessions,
  deleteSession,
  getSessionStats,
  updateSessionActivity,
  getRecentSessions
} = sessionService;

/**
 * Create a new chat session
 * POST /api/session/create
 */
export const createNewSession = async (req, res) => {
  try {
    // Get userId from authenticated user or request body
    const userId = req.userId || req.body.userId || null;
    
    const sessionId = await createSession(userId);
    const session = await getSession(sessionId);
    
    // If user is authenticated, link session to user
    if (userId) {
      const authService = await import('../services/auth/auth.service.mongodb.js');
      await authService.addSessionToUser(userId, sessionId);
      console.log(`   👤 Session linked to user: ${userId}`);
    }
    
    res.json({
      success: true,
      sessionId,
      session,
      message: 'Session created successfully',
      userId: userId || null
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create session'
    });
  }
};

/**
 * Get session details
 * GET /api/session/:sessionId
 */
export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Check if user owns this session (if authenticated)
    if (req.userId && session.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const stats = await getSessionStats(sessionId);
    
    res.json({
      success: true,
      session,
      stats
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get session'
    });
  }
};

/**
 * Get conversation history for a session
 * GET /api/session/:sessionId/history
 */
export const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit } = req.query;
    
    // Check if user owns this session (if authenticated)
    if (req.userId) {
      const session = await getSession(sessionId);
      if (session && session.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
    
    const history = await getConversationHistory(
      sessionId,
      limit ? parseInt(limit) : null
    );
    
    res.json({
      success: true,
      sessionId,
      messages: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get conversation history'
    });
  }
};

/**
 * Get all sessions for a user
 * GET /api/session/user/:userId
 */
export const getUserSessionsList = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own sessions
    if (req.userId && req.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const sessions = await getUserSessions(userId);
    
    res.json({
      success: true,
      userId,
      sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user sessions'
    });
  }
};

/**
 * Get current user's sessions
 * GET /api/session/my-sessions
 */
export const getMySessions = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const sessions = await getUserSessions(req.userId);
    
    res.json({
      success: true,
      userId: req.userId,
      sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Error getting my sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sessions'
    });
  }
};

/**
 * Delete a session
 * DELETE /api/session/:sessionId
 */
export const deleteSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if user owns this session (if authenticated)
    if (req.userId) {
      const session = await getSession(sessionId);
      if (session && session.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
    
    await deleteSession(sessionId);
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete session'
    });
  }
};

/**
 * Get session statistics
 * GET /api/session/:sessionId/stats
 */
export const getStats = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Check if user owns this session (if authenticated)
    if (req.userId) {
      const session = await getSession(sessionId);
      if (session && session.userId !== req.userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }
    
    const stats = await getSessionStats(sessionId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get session statistics'
    });
  }
};

/**
 * Get recent sessions (for recovery after cache clear)
 * GET /api/session/recent
 */
export const getRecentSessionsController = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // If user is authenticated, return their sessions
    if (req.userId) {
      const sessions = await getUserSessions(req.userId);
      const sortedSessions = sessions
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        .slice(0, parseInt(limit));
      
      return res.json({
        success: true,
        sessions: sortedSessions,
        count: sortedSessions.length,
        userId: req.userId
      });
    }
    
    // For anonymous users, get recent sessions from MongoDB
    const recentSessions = await sessionService.getRecentSessions(parseInt(limit));
    
    res.json({
      success: true,
      sessions: recentSessions,
      count: recentSessions.length
    });
  } catch (error) {
    console.error('Error getting recent sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get recent sessions'
    });
  }
};
