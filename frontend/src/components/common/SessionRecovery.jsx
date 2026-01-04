import React, { useState, useEffect } from 'react';
import { getAllSessions, restoreSession } from '../../services/api/session.api';
import './SessionRecovery.css';

const SessionRecovery = ({ onSessionRestored, onCancel }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadRecentSessions();
  }, []);

  const loadRecentSessions = async () => {
    try {
      setLoading(true);
      // For now, we'll show a message that sessions can be recovered
      // In production, this would fetch user's sessions
      setSessions([]);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (sessionId) => {
    try {
      setRestoring(true);
      const sessionData = await restoreSession(sessionId);
      
      // Save to localStorage and cookies
      localStorage.setItem('chatbot_session_id', sessionId);
      const expires = new Date();
      expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = `chatbot_session_id=${sessionId};expires=${expires.toUTCString()};path=/`;
      
      onSessionRestored(sessionId);
    } catch (error) {
      console.error('Error restoring session:', error);
      alert('Failed to restore session. Creating new one...');
      onCancel();
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="session-recovery">
        <div className="recovery-content">
          <div className="loading">Loading sessions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-recovery">
      <div className="recovery-content">
        <h3>Session Recovery</h3>
        <p>Your previous session was cleared. Would you like to:</p>
        <div className="recovery-options">
          <button 
            className="btn-primary" 
            onClick={onCancel}
            disabled={restoring}
          >
            Start New Conversation
          </button>
        </div>
        <p className="recovery-note">
          💡 Tip: Your conversations are saved on the server. 
          If you remember your session ID, you can restore it.
        </p>
      </div>
    </div>
  );
};

export default SessionRecovery;


