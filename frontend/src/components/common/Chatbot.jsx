import React, { useState, useRef, useEffect } from 'react'
import { sendChatMessage, checkChatbotHealth, createSession, getSessionHistory } from '../../services/api/chatbot.api'
import { getAuthToken, getStoredUser } from '../../services/api/auth.api'
import { getMySessions } from '../../services/api/session.api'
import './Chatbot.css'

const Chatbot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm your Education & Learning Copilot assistant powered by OpenAI. How can I help you today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    
    // Initialize session and load history when opened or user changes
    if (isOpen) {
      console.log('%c🔍 [CHATBOT] Checking service health...', 'color: #3b82f6; font-weight: bold;');
      checkChatbotHealth();
      
      // Initialize session if not exists
      initializeSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]) // Re-initialize when user changes (login/logout)
  
  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Helper function to set cookie
  const setCookie = (name, value, days = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  // Initialize session and load conversation history
  const initializeSession = async () => {
    try {
      // If user is authenticated, try to load their existing sessions first
      if (user) {
        console.log('%c👤 [SESSION] User authenticated, checking for existing sessions', 'color: #8b5cf6; font-weight: bold;');
        
        try {
          const userSessions = await getMySessions();
          
          if (userSessions && userSessions.length > 0) {
            // Sort by lastActivity (most recent first)
            const sortedSessions = userSessions.sort((a, b) => 
              new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt)
            );
            
            const mostRecentSession = sortedSessions[0];
            const sessionIdToLoad = mostRecentSession.id;
            
            console.log(`   📋 Found ${userSessions.length} session(s)`);
            console.log(`   🔄 Loading most recent session: ${sessionIdToLoad}`);
            
            // Load history for this session
            try {
              const history = await getSessionHistory(sessionIdToLoad);
              
              setSessionId(sessionIdToLoad);
              setIsLoadingHistory(true);
              
              // Save session ID in all storage locations
              localStorage.setItem('chatbot_session_id', sessionIdToLoad);
              setCookie('chatbot_session_id', sessionIdToLoad, 365);
              sessionStorage.setItem('chatbot_session_id', sessionIdToLoad);
              
              if (history && history.length > 0) {
                console.log(`   📚 Loaded ${history.length} previous messages from your account`);
                
                // Convert stored messages to chat format
                const formattedMessages = history.map(msg => ({
                  type: msg.role === 'assistant' ? 'bot' : 'user',
                  text: msg.content,
                  timestamp: new Date(msg.timestamp)
                }));
                
                setMessages([
                  {
                    type: 'bot',
                    text: "Welcome back! I remember our previous conversation. How can I help you today?",
                    timestamp: new Date()
                  },
                  ...formattedMessages
                ]);
              } else {
                console.log(`   📝 Session exists but no history yet`);
                setMessages([
                  {
                    type: 'bot',
                    text: "Welcome back! I've restored your session. How can I help you today?",
                    timestamp: new Date()
                  }
                ]);
              }
              
              setIsLoadingHistory(false);
              return; // Successfully loaded user's session
            } catch (error) {
              console.warn('   ⚠️  Could not load session history, will create new session');
            }
          } else {
            console.log(`   📝 No existing sessions found for user`);
          }
        } catch (error) {
          console.warn('   ⚠️  Could not fetch user sessions:', error);
        }
      }
      
      // Check for existing session in multiple places (cookies, localStorage, sessionStorage)
      // Cookies are checked first as they persist even after cache clear
      let existingSessionId = getCookie('chatbot_session_id') || 
                             localStorage.getItem('chatbot_session_id') || 
                             sessionStorage.getItem('chatbot_session_id');
      
      if (existingSessionId) {
        console.log('%c💾 [SESSION] Loading existing session from storage', 'color: #8b5cf6; font-weight: bold;');
        console.log(`   Session ID: ${existingSessionId}`);
        
        // Verify session exists on backend
        try {
          const history = await getSessionHistory(existingSessionId);
          
          // If session exists and has history, use it
          if (history && history.length > 0) {
            setSessionId(existingSessionId);
            setIsLoadingHistory(true);
            
            console.log(`   📚 Loaded ${history.length} previous messages`);
            
            // Convert stored messages to chat format
            const formattedMessages = history.map(msg => ({
              type: msg.role === 'assistant' ? 'bot' : 'user',
              text: msg.content,
              timestamp: new Date(msg.timestamp)
            }));
            
            setMessages([
              {
                type: 'bot',
                text: "Welcome back! I remember our previous conversation. How can I help you today?",
                timestamp: new Date()
              },
              ...formattedMessages
            ]);
            
            setIsLoadingHistory(false);
            
            // Ensure it's saved in both places
            localStorage.setItem('chatbot_session_id', existingSessionId);
            setCookie('chatbot_session_id', existingSessionId);
            return;
          }
        } catch (error) {
          console.warn('Session not found on backend, creating new one');
        }
      }
      
      // Create new session (either no existing session or session not found)
      console.log('%c💾 [SESSION] Creating new session', 'color: #8b5cf6; font-weight: bold;');
      const sessionData = await createSession();
      const newSessionId = sessionData.sessionId;
      
      setSessionId(newSessionId);
      
      // Save in multiple places for persistence
      localStorage.setItem('chatbot_session_id', newSessionId);
      setCookie('chatbot_session_id', newSessionId, 365); // Cookie lasts 1 year
      
      // Also save to sessionStorage as backup
      sessionStorage.setItem('chatbot_session_id', newSessionId);
      
      console.log(`   ✅ Session created: ${newSessionId}`);
      if (user) {
        console.log(`   👤 Linked to user: ${user.email}`);
        console.log(`   💾 Session saved to user account - will persist even after cookie clear!`);
      } else {
        console.log(`   💾 Saved to localStorage, cookies, and sessionStorage for maximum persistence`);
      }
    } catch (error) {
      console.error('%c❌ [SESSION] Error initializing session:', 'color: #ef4444; font-weight: bold;', error);
      // Continue without session (fallback mode)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    }

    const messageText = inputValue
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    // Add loading message
    const loadingMessage = {
      type: 'bot',
      text: 'Thinking...',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      // Get conversation history (excluding loading message)
      const conversationHistory = messages.map(msg => ({
        type: msg.type,
        text: msg.text,
        timestamp: msg.timestamp
      }))

      // Debug: Log to browser console
      console.log('%c💬 [CHATBOT UI] User sent message', 'color: #6366f1; font-weight: bold;');
      console.log(`   Message: "${messageText}"`);
      console.log(`   History: ${conversationHistory.length} messages`);

      // Call OpenAI API via backend with session ID
      const response = await sendChatMessage(messageText, conversationHistory, sessionId)
      
      // Update session ID if returned (in case it was created server-side)
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem('chatbot_session_id', response.sessionId);
        setCookie('chatbot_session_id', response.sessionId, 365);
        sessionStorage.setItem('chatbot_session_id', response.sessionId);
      } else if (sessionId) {
        // Ensure session ID is saved in all storage locations
        localStorage.setItem('chatbot_session_id', sessionId);
        setCookie('chatbot_session_id', sessionId, 365);
        sessionStorage.setItem('chatbot_session_id', sessionId);
      }
      
      // If user is authenticated, session is linked to user account
      // This means even if cookies/localStorage cleared, user can recover sessions
      if (response.userId) {
        console.log('%c👤 [AUTH] Session linked to user account', 'color: #8b5cf6; font-weight: bold;');
      }
      
      // Log successful response
      console.log('%c✅ [CHATBOT UI] Response received', 'color: #10b981; font-weight: bold;');
      if (response.model) {
        console.log(`   Model: ${response.model}`);
      }
      if (response.usage) {
        console.log(`   Tokens: ${response.usage.total_tokens}`);
      }

      // Remove loading message and add actual response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        return [...withoutLoading, {
          type: 'bot',
          text: response.message,
          timestamp: new Date()
        }]
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)
      
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        return [...withoutLoading, {
          type: 'bot',
          text: `Sorry, I encountered an error: ${error.message}. Please make sure the backend server is running and your OpenAI API key is configured.`,
          timestamp: new Date(),
          isError: true
        }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const suggestedQuestions = [
    "How does quiz generation work?",
    "Tell me about lesson planning",
    "What is a learning path?",
    "How does RAG help with learning?"
  ]

  const handleSuggestionClick = async (question) => {
    setInputValue(question)
    
    const userMessage = {
      type: 'user',
      text: question,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Add loading message
    const loadingMessage = {
      type: 'bot',
      text: 'Thinking...',
      timestamp: new Date(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const conversationHistory = messages.map(msg => ({
        type: msg.type,
        text: msg.text,
        timestamp: msg.timestamp
      }))

      const response = await sendChatMessage(question, conversationHistory)

      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        return [...withoutLoading, {
          type: 'bot',
          text: response.message,
          timestamp: new Date()
        }]
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)
      
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        return [...withoutLoading, {
          type: 'bot',
          text: `Sorry, I encountered an error: ${error.message}. Please make sure the backend server is running and your OpenAI API key is configured.`,
          timestamp: new Date(),
          isError: true
        }]
      })
    } finally {
      setIsLoading(false)
      setInputValue('')
    }
  }

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <div className="chatbot-title">Learning Copilot</div>
                <div className="chatbot-status">Online</div>
              </div>
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
          {isLoadingHistory && (
            <div className="message bot">
              <div className="message-content">
                <div className="loading-indicator">Loading conversation history...</div>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="chatbot-suggestions">
              <div className="suggestions-title">Suggested questions:</div>
              <div className="suggestions-list">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="suggestion-button"
                    onClick={() => handleSuggestionClick(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="chatbot-input-form" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button type="submit" className="chatbot-send" disabled={!inputValue.trim() || isLoading}>
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </form>
        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <span className="chatbot-pulse"></span>}
      </button>
    </div>
  )
}

export default Chatbot

