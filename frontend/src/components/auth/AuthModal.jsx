import React, { useState, useEffect } from 'react'
import Login from './Login'
import Register from './Register'
import { getStoredUser, isAuthenticated } from '../../services/api/auth.api'
import './Auth.css'

const AuthModal = ({ onAuthSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      const storedUser = getStoredUser()
      if (storedUser) {
        setUser(storedUser)
        onAuthSuccess(storedUser)
      }
    }
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    onAuthSuccess(userData, token)
  }

  const handleRegister = (userData, token) => {
    setUser(userData)
    onAuthSuccess(userData, token)
  }

  if (user) {
    return null // User is authenticated, don't show modal
  }

  return (
    <div className="auth-container">
      {isLogin ? (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
      {onClose && (
        <button 
          className="auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default AuthModal


