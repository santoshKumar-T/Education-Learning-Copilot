/**
 * Section Icons Component
 * Provides SVG icons for different sections
 */

import React from 'react';

// Student Performance Memory Icon (like the image description - purple square with indentations)
export const PerformanceMemoryIcon = ({ className = '', size = 80 }) => (
  <div className={`performance-memory-icon ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      {/* Main square */}
      <rect x="20" y="20" width="60" height="60" rx="4" fill="url(#memoryGradient)" />
      {/* Top indentations */}
      <rect x="25" y="15" width="8" height="8" rx="1" fill="url(#memoryGradient)" />
      <rect x="67" y="15" width="8" height="8" rx="1" fill="url(#memoryGradient)" />
      {/* Bottom indentations */}
      <rect x="25" y="77" width="8" height="8" rx="1" fill="url(#memoryGradient)" />
      <rect x="67" y="77" width="8" height="8" rx="1" fill="url(#memoryGradient)" />
      {/* Inner lines */}
      <line x1="30" y1="40" x2="70" y2="40" stroke="white" strokeWidth="2" opacity="0.3" />
      <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="2" opacity="0.3" />
      <line x1="30" y1="60" x2="55" y2="60" stroke="white" strokeWidth="2" opacity="0.3" />
    </svg>
  </div>
);

// LMS Integration Icon
export const LMSIcon = ({ className = '', size = 80 }) => (
  <div className={`lms-icon ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lmsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      {/* Link chain */}
      <circle cx="30" cy="35" r="12" fill="none" stroke="url(#lmsGradient)" strokeWidth="3" />
      <circle cx="70" cy="35" r="12" fill="none" stroke="url(#lmsGradient)" strokeWidth="3" />
      <path d="M 42 35 L 58 35" stroke="url(#lmsGradient)" strokeWidth="3" strokeLinecap="round" />
      {/* Platform base */}
      <rect x="15" y="60" width="70" height="8" rx="4" fill="url(#lmsGradient)" />
      <rect x="20" y="72" width="60" height="6" rx="3" fill="url(#lmsGradient)" opacity="0.6" />
    </svg>
  </div>
);

// YouTube Icon
export const YouTubeIcon = ({ className = '', size = 80 }) => (
  <div className={`youtube-icon ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="youtubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff0000" />
          <stop offset="100%" stopColor="#cc0000" />
        </linearGradient>
      </defs>
      {/* Play button */}
      <rect x="20" y="20" width="60" height="60" rx="8" fill="url(#youtubeGradient)" />
      <path d="M 38 30 L 38 70 L 65 50 Z" fill="white" />
    </svg>
  </div>
);

// Weak Areas Detection Icon
export const WeakAreasIcon = ({ className = '', size = 80 }) => (
  <div className={`weak-areas-icon ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      {/* Target circles */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="url(#targetGradient)" strokeWidth="3" />
      <circle cx="50" cy="50" r="25" fill="none" stroke="url(#targetGradient)" strokeWidth="3" />
      <circle cx="50" cy="50" r="15" fill="url(#targetGradient)" />
      {/* Arrow */}
      <path d="M 50 15 L 50 5 M 50 15 L 45 10 M 50 15 L 55 10" 
            stroke="url(#targetGradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

// Generic icon wrapper
export const SectionIcon = ({ children, className = '', size = 80 }) => (
  <div className={`section-icon-wrapper ${className}`} style={{ width: size, height: size }}>
    {children}
  </div>
);

