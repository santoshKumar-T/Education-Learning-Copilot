import React, { useState, useEffect } from 'react'
import { getCurrentUser, getStoredUser } from '../services/api/auth.api'
import './Settings.css'

const Settings = ({ user, onLogout, onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(user || getStoredUser())
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    theme: localStorage.getItem('theme') || 'light',
    notifications: localStorage.getItem('notifications') !== 'false',
    language: localStorage.getItem('language') || 'en',
    autoSave: localStorage.getItem('autoSave') !== 'false',
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser()
      if (userData) {
        setCurrentUser(userData)
        setSettings(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    
    try {
      // Save to localStorage
      Object.entries(settings).forEach(([key, value]) => {
        if (key !== 'name' && key !== 'email') {
          localStorage.setItem(key, value.toString())
        }
      })

      // TODO: Update user profile via API if endpoint exists
      // For now, just save to localStorage
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }))
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <header className="settings-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1 className="settings-title">Settings</h1>
              <p className="settings-subtitle">
                Manage your account preferences and settings
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

      <div className="settings-content">
        <div className="container">
          {/* Profile Section */}
          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Profile</h2>
              <p className="section-description">Update your personal information</p>
            </div>
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={settings.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={settings.email}
                  disabled
                  className="form-input disabled"
                />
                <p className="form-help">Email cannot be changed</p>
              </div>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Appearance</h2>
              <p className="section-description">Customize the look and feel</p>
            </div>
            <div className="settings-form">
              <div className="form-group">
                <label>Theme</label>
                <div className="theme-options">
                  <button
                    className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <span className="theme-icon">☀️</span>
                    <span>Light</span>
                  </button>
                  <button
                    className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <span className="theme-icon">🌙</span>
                    <span>Dark</span>
                  </button>
                  <button
                    className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('auto')}
                  >
                    <span className="theme-icon">🔄</span>
                    <span>Auto</span>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  name="language"
                  value={settings.language}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Preferences</h2>
              <p className="section-description">Configure your learning preferences</p>
            </div>
            <div className="settings-form">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <div className="checkbox-content">
                    <span className="checkbox-title">Enable Notifications</span>
                    <span className="checkbox-description">
                      Receive notifications about your learning progress
                    </span>
                  </div>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="autoSave"
                    checked={settings.autoSave}
                    onChange={handleInputChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <div className="checkbox-content">
                    <span className="checkbox-title">Auto-save Sessions</span>
                    <span className="checkbox-description">
                      Automatically save your conversation sessions
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Account</h2>
              <p className="section-description">Manage your account</p>
            </div>
            <div className="settings-form">
              <div className="account-actions">
                <button className="btn-secondary" onClick={() => onNavigate ? onNavigate('dashboard') : window.location.href = '/dashboard'}>
                  View Dashboard
                </button>
                <button className="btn-danger" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="settings-footer">
            <button
              className="btn-primary btn-large"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

