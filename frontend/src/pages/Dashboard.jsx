import React, { useState, useEffect } from 'react'
import { getMySessions } from '../services/api/session.api'
import { getCurrentUser } from '../services/api/auth.api'
import './Dashboard.css'

const Dashboard = ({ user, onLogout, onNavigate }) => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    activeSessions: 0,
    lastActivity: null
  })

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load user sessions
      const userSessions = await getMySessions()
      setSessions(userSessions || [])

      // Calculate stats
      const totalMessages = userSessions.reduce((sum, session) => {
        return sum + (session.messageCount || 0)
      }, 0)

      const activeSessions = userSessions.filter(session => {
        const lastActivity = new Date(session.lastActivity || session.createdAt)
        const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceActivity < 7 // Active if used in last 7 days
      }).length

      const lastActivity = userSessions.length > 0
        ? userSessions.sort((a, b) => 
            new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt)
          )[0].lastActivity || userSessions[0].createdAt
        : null

      setStats({
        totalSessions: userSessions.length,
        totalMessages,
        activeSessions,
        lastActivity
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="dashboard-title">Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, {user?.name || user?.email || 'User'}! 👋
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'}>
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="dashboard-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalMessages}</div>
                <div className="stat-label">Total Messages</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeSessions}</div>
                <div className="stat-label">Active Sessions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <div className="stat-value">{getTimeAgo(stats.lastActivity)}</div>
                <div className="stat-label">Last Activity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Sessions */}
      <section className="dashboard-sessions">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Sessions</h2>
            <button 
              className="btn-link"
              onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'}
            >
              Start New Session →
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💭</div>
              <h3>No sessions yet</h3>
              <p>Start a conversation with the chatbot to create your first session!</p>
              <button 
                className="btn-primary"
                onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'}
              >
                Start Learning
              </button>
            </div>
          ) : (
            <div className="sessions-list">
              {sessions
                .sort((a, b) => 
                  new Date(b.lastActivity || b.createdAt) - new Date(a.lastActivity || a.createdAt)
                )
                .slice(0, 10)
                .map((session) => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <div className="session-info">
                        <h3 className="session-title">
                          Session {session.id.substring(0, 8)}...
                        </h3>
                        <p className="session-meta">
                          {session.messageCount || 0} messages • 
                          Last active: {getTimeAgo(session.lastActivity || session.createdAt)}
                        </p>
                      </div>
                      <div className="session-actions">
                        <button 
                          className="btn-link"
                          onClick={() => {
                            localStorage.setItem('chatbot_session_id', session.id)
                            if (onNavigate) {
                              onNavigate('home')
                            } else {
                              window.location.href = '/'
                            }
                          }}
                        >
                          Continue →
                        </button>
                      </div>
                    </div>
                    <div className="session-footer">
                      <span className="session-date">
                        Created: {formatDate(session.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="dashboard-actions">
        <div className="container">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'}
            >
              <div className="action-icon">💬</div>
              <h3>Start Chat</h3>
              <p>Continue learning with AI</p>
            </button>
            <button 
              className="action-card"
              onClick={() => onNavigate ? onNavigate('settings') : window.location.href = '/settings'}
            >
              <div className="action-icon">⚙️</div>
              <h3>Settings</h3>
              <p>Manage your preferences</p>
            </button>
            <button 
              className="action-card"
              onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'}
            >
              <div className="action-icon">📚</div>
              <h3>View All Sessions</h3>
              <p>See your learning history</p>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard

