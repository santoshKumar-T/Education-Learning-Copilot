import React, { useState } from 'react';
import './Flashcard.css';

const Flashcard = ({ card, onFlip, isFlipped, onMarkCorrect, onMarkIncorrect, showActions = true }) => {
  return (
    <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <div className="flashcard-header">
            <span className="flashcard-category">{card.category || 'General'}</span>
            <span className={`flashcard-difficulty difficulty-${card.difficulty || 'medium'}`}>
              {card.difficulty || 'medium'}
            </span>
          </div>
          <div className="flashcard-content">
            <div className="flashcard-label">Question</div>
            <p className="flashcard-text">{card.question}</p>
          </div>
          <div className="flashcard-hint">Click to reveal answer</div>
        </div>
        <div className="flashcard-back">
          <div className="flashcard-header">
            <span className="flashcard-category">{card.category || 'General'}</span>
            <span className={`flashcard-difficulty difficulty-${card.difficulty || 'medium'}`}>
              {card.difficulty || 'medium'}
            </span>
          </div>
          <div className="flashcard-content">
            <div className="flashcard-label">Answer</div>
            <p className="flashcard-text">{card.answer}</p>
          </div>
          {showActions && (
            <div className="flashcard-actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="btn-mark-incorrect"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkIncorrect && onMarkIncorrect();
                }}
              >
                ❌ Incorrect
              </button>
              <button
                className="btn-mark-correct"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkCorrect && onMarkCorrect();
                }}
              >
                ✅ Correct
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;

