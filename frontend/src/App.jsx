import React, { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Chatbot from './components/common/Chatbot'
import AuthModal from './components/auth/AuthModal'
import { isAuthenticated, getStoredUser, logout } from './services/api/auth.api'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      const storedUser = getStoredUser()
      if (storedUser) {
        setUser(storedUser)
      }
    }

    // Check URL for routing
    const path = window.location.pathname
    if (path === '/dashboard') {
      setCurrentPage('dashboard')
    } else if (path === '/settings') {
      setCurrentPage('settings')
    } else {
      setCurrentPage('home')
    }
  }, [])

  const handleAuthSuccess = (userData, token) => {
    setUser(userData)
    setShowAuth(false)
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    // Clear session as well
    localStorage.removeItem('chatbot_session_id')
    // Redirect to home
    window.location.href = '/'
  }

  const navigateTo = (page) => {
    setCurrentPage(page)
    window.history.pushState({}, '', `/${page === 'home' ? '' : page}`)
  }

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/dashboard') {
        setCurrentPage('dashboard')
      } else if (path === '/settings') {
        setCurrentPage('settings')
      } else {
        setCurrentPage('home')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="App">
      {currentPage === 'home' && (
        <LandingPage 
          user={user} 
          onLogin={() => setShowAuth(true)} 
          onLogout={handleLogout}
          onNavigate={navigateTo}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard user={user} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentPage === 'settings' && (
        <Settings user={user} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentPage === 'home' && <Chatbot user={user} />}
      {showAuth && !user && (
        <AuthModal 
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  )
}

export default App


