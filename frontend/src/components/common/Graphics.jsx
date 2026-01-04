/**
 * Graphics and Illustrations Component
 * Provides reusable SVG graphics and animated elements
 */

import React from 'react';

// Animated gradient blob
export const GradientBlob = ({ className = '', size = 400 }) => (
  <div className={`gradient-blob ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#764ba2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f093fb" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M100,200 Q150,100 200,200 T300,200 T400,200 L400,400 L0,400 Z"
        fill="url(#blobGradient)"
        className="blob-path"
      />
    </svg>
  </div>
);

// Floating particles
export const FloatingParticles = ({ count = 20 }) => (
  <div className="floating-particles">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

// Animated wave
export const AnimatedWave = ({ className = '' }) => (
  <div className={`animated-wave ${className}`}>
    <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="rgba(99, 102, 241, 0.1)"
        fillOpacity="1"
        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        className="wave-path"
      />
    </svg>
  </div>
);

// Decorative circles
export const DecorativeCircles = () => (
  <div className="decorative-circles">
    <div className="circle circle-1" />
    <div className="circle circle-2" />
    <div className="circle circle-3" />
  </div>
);

// Sparkle effect
export const Sparkles = ({ count = 15 }) => (
  <div className="sparkles">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="sparkle"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ))}
  </div>
);

// Education icon illustration
export const EducationIllustration = ({ className = '' }) => (
  <div className={`education-illustration ${className}`}>
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="eduGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      {/* Book */}
      <rect x="40" y="80" width="120" height="90" rx="8" fill="url(#eduGradient)" className="book" />
      <rect x="50" y="90" width="100" height="70" rx="4" fill="white" opacity="0.3" />
      <line x1="70" y1="110" x2="130" y2="110" stroke="white" strokeWidth="2" opacity="0.5" />
      <line x1="70" y1="130" x2="130" y2="130" stroke="white" strokeWidth="2" opacity="0.5" />
      <line x1="70" y1="150" x2="100" y2="150" stroke="white" strokeWidth="2" opacity="0.5" />
      
      {/* Lightbulb */}
      <circle cx="100" cy="50" r="25" fill="#fbbf24" className="lightbulb" />
      <rect x="95" y="70" width="10" height="15" fill="#fbbf24" />
      <path d="M85,50 Q100,40 115,50" stroke="#f59e0b" strokeWidth="3" fill="none" />
    </svg>
  </div>
);

// Learning path illustration
export const LearningPathIllustration = ({ className = '' }) => (
  <div className={`learning-path-illustration ${className}`}>
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
      </defs>
      {/* Path */}
      <path
        d="M20,100 Q100,50 150,100 T280,100"
        stroke="url(#pathGradient)"
        strokeWidth="4"
        fill="none"
        className="path-line"
      />
      {/* Nodes */}
      <circle cx="50" cy="100" r="12" fill="#667eea" className="path-node" />
      <circle cx="150" cy="100" r="12" fill="#764ba2" className="path-node" />
      <circle cx="250" cy="100" r="12" fill="#f093fb" className="path-node" />
    </svg>
  </div>
);

// Chat bubble illustration
export const ChatBubbleIllustration = ({ className = '' }) => (
  <div className={`chat-bubble-illustration ${className}`}>
    <svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      {/* Main bubble */}
      <path
        d="M20,20 L130,20 Q140,20 140,30 L140,70 Q140,80 130,80 L80,80 L60,100 L60,80 L30,80 Q20,80 20,70 L20,30 Q20,20 30,20 Z"
        fill="url(#chatGradient)"
        className="bubble-main"
      />
      {/* Dots */}
      <circle cx="50" cy="45" r="3" fill="white" opacity="0.8" />
      <circle cx="70" cy="45" r="3" fill="white" opacity="0.8" />
      <circle cx="90" cy="45" r="3" fill="white" opacity="0.8" />
    </svg>
  </div>
);

