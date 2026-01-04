import React, { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Chatbot from './components/common/Chatbot'
import AuthModal from './components/auth/AuthModal'
import { isAuthenticated, getStoredUser, logout } from './services/api/auth.api'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated()) {
      const storedUser = getStoredUser()
      if (storedUser) {
        setUser(storedUser)
      }
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
  }

  return (
    <div className="App">
      <LandingPage user={user} onLogin={() => setShowAuth(true)} onLogout={handleLogout} />
      <Chatbot user={user} />
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


