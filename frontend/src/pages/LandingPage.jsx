import React from 'react'
import './LandingPage.css'

const LandingPage = ({ user, onLogin, onLogout, onNavigate }) => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">Education & Learning Copilot</span>
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#agents">Agents</a>
              <a href="#integrations">Integrations</a>
              {user ? (
                <div className="user-menu">
                  <button 
                    className="btn-link-nav" 
                    onClick={() => onNavigate && onNavigate('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button 
                    className="btn-link-nav" 
                    onClick={() => onNavigate && onNavigate('settings')}
                  >
                    Settings
                  </button>
                  <span className="user-name">👤 {user.name || user.email}</span>
                  <button className="btn-secondary" onClick={onLogout}>Logout</button>
                </div>
              ) : (
                <button className="btn-primary" onClick={onLogin}>Login / Sign Up</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Your Personal <span className="gradient-text">Learning Companion</span>
            </h1>
            <p className="hero-subtitle">
              AI-powered personalized learning, intelligent quiz generation, and adaptive lesson plans 
              tailored to your learning style and pace.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary btn-large">Start Learning</button>
              <button className="btn-secondary btn-large">Watch Demo</button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Active Learners</div>
              </div>
              <div className="stat">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Quizzes Generated</div>
              </div>
              <div className="stat">
                <div className="stat-number">1M+</div>
                <div className="stat-label">Lessons Created</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need for personalized and effective learning
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Personalized Learning</h3>
              <p className="feature-description">
                Adaptive learning paths that adjust to your pace, style, and performance. 
                Get content recommendations tailored just for you.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❓</div>
              <h3 className="feature-title">Quiz Generation</h3>
              <p className="feature-description">
                AI-powered quiz creation from your course materials. Generate comprehensive 
                assessments instantly to test your understanding.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">Lesson Plans</h3>
              <p className="feature-description">
                Intelligent lesson planning that structures your learning journey. 
                Break down complex topics into manageable, sequential lessons.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">RAG Technology</h3>
              <p className="feature-description">
                Retrieval-Augmented Generation for course content, slides, and notes. 
                Access relevant information instantly from your learning materials.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Performance Tracking</h3>
              <p className="feature-description">
                Monitor your progress with detailed analytics. Identify strengths 
                and areas that need improvement.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3 className="feature-title">Learning Paths</h3>
              <p className="feature-description">
                Customized learning paths that guide you from beginner to expert. 
                Optimized sequences for maximum retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="agents">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">AI Agents</h2>
            <p className="section-subtitle">
              Specialized AI agents working together to enhance your learning experience
            </p>
          </div>
          <div className="agents-grid">
            <div className="agent-card">
              <div className="agent-icon">🎲</div>
              <h3 className="agent-title">Quiz Generator Agent</h3>
              <p className="agent-description">
                Automatically creates comprehensive quizzes from your course materials. 
                Generates multiple question types including multiple choice, true/false, 
                and short answer questions.
              </p>
              <ul className="agent-features">
                <li>Multiple question types</li>
                <li>Difficulty adaptation</li>
                <li>Instant feedback</li>
              </ul>
            </div>
            <div className="agent-card">
              <div className="agent-icon">📚</div>
              <h3 className="agent-title">Lesson Planner Agent</h3>
              <p className="agent-description">
                Designs structured lesson plans based on learning objectives. 
                Creates sequential, logical learning experiences that build upon 
                previous knowledge.
              </p>
              <ul className="agent-features">
                <li>Structured curriculum</li>
                <li>Learning objectives</li>
                <li>Time estimation</li>
              </ul>
            </div>
            <div className="agent-card">
              <div className="agent-icon">🗺️</div>
              <h3 className="agent-title">Learning Path Agent</h3>
              <p className="agent-description">
                Maps out personalized learning journeys. Analyzes your goals, 
                current knowledge, and learning style to create the optimal path 
                to mastery.
              </p>
              <ul className="agent-features">
                <li>Personalized routes</li>
                <li>Progress optimization</li>
                <li>Adaptive recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="integrations">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Integrations & Memory</h2>
            <p className="section-subtitle">
              Seamlessly connect with your existing tools and remember your progress
            </p>
          </div>
          <div className="integrations-content">
            <div className="integrations-grid">
              <div className="integration-card">
                <div className="integration-icon">🔗</div>
                <h3 className="integration-title">LMS Integration</h3>
                <p className="integration-description">
                  Connect with popular Learning Management Systems. Sync your courses, 
                  assignments, and progress seamlessly.
                </p>
              </div>
              <div className="integration-card">
                <div className="integration-icon">▶️</div>
                <h3 className="integration-title">YouTube API</h3>
                <p className="integration-description">
                  Access millions of educational videos. Integrate YouTube content 
                  directly into your learning paths and lesson plans.
                </p>
              </div>
              <div className="integration-card">
                <div className="integration-icon">💾</div>
                <h3 className="integration-title">Student Performance Memory</h3>
                <p className="integration-description">
                  Tracks and remembers your performance across all assessments. 
                  Builds a comprehensive profile of your learning journey.
                </p>
              </div>
              <div className="integration-card">
                <div className="integration-icon">🎯</div>
                <h3 className="integration-title">Weak Areas Detection</h3>
                <p className="integration-description">
                  Identifies areas where you need more practice. Provides targeted 
                  recommendations to strengthen your knowledge gaps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Learning?</h2>
            <p className="cta-subtitle">
              Join thousands of learners who are already experiencing personalized, 
              AI-powered education.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary btn-large">Get Started Free</button>
              <button className="btn-secondary btn-large">Schedule a Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-icon">📚</span>
                <span className="logo-text">Education & Learning Copilot</span>
              </div>
              <p className="footer-description">
                Your personal AI-powered learning companion for personalized education, 
                intelligent quizzes, and adaptive lesson plans.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#agents">Agents</a></li>
                <li><a href="#integrations">Integrations</a></li>
                <li><a href="#">Pricing</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Resources</h4>
              <ul className="footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Support</a></li>
                <li><a href="#">API</a></li>
                <li><a href="#">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Education & Learning Copilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage




