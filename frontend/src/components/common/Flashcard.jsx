import React, { useState } from 'react';
import './Flashcard.css';

const Flashcard = ({ card, onFlip, isFlipped, onMarkCorrect, onMarkIncorrect, showActions = true, isAnswered = false }) => {
  return (
    <div className={`flashcard ${isFlipped ? 'flipped' : ''} ${isAnswered ? 'answered' : ''}`} onClick={onFlip}>
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
            <div className="flashcard-answer-content">
              {card.answer.split('\n\n').map((section, idx) => {
                if (section.startsWith('CORRECT ANSWER:')) {
                  return (
                    <div key={idx} className="answer-section correct-answer">
                      <div className="answer-header">✅ Correct Answer:</div>
                      <p className="answer-text">{section.replace('CORRECT ANSWER:', '').trim()}</p>
                    </div>
                  );
                } else if (section.startsWith('WRONG ANSWERS')) {
                  const wrongAnswers = section.split('\n').slice(1).filter(line => line.trim().startsWith('-'));
                  return (
                    <div key={idx} className="answer-section wrong-answers">
                      <div className="answer-header">❌ Wrong Answers (Common Mistakes):</div>
                      <ul className="wrong-answers-list">
                        {wrongAnswers.map((answer, aidx) => (
                          <li key={aidx}>{answer.replace(/^-\s*/, '').trim()}</li>
                        ))}
                      </ul>
                    </div>
                  );
                } else if (section.startsWith('Explanation:')) {
                  return (
                    <div key={idx} className="answer-section explanation">
                      <div className="answer-header">💡 Explanation:</div>
                      <p className="answer-text">{section.replace('Explanation:', '').trim()}</p>
                    </div>
                  );
                } else if (section.trim()) {
                  return (
                    <p key={idx} className="flashcard-text">{section}</p>
                  );
                }
                return null;
              })}
            </div>
          </div>
          {showActions && (
            <div className="flashcard-actions" onClick={(e) => e.stopPropagation()}>
              {isAnswered ? (
                <div className="flashcard-answered-message">
                  ✓ Answer recorded
                </div>
              ) : (
                <>
                  <button
                    className="btn-mark-incorrect"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAnswered && onMarkIncorrect) {
                        onMarkIncorrect();
                      }
                    }}
                    disabled={isAnswered}
                  >
                    ❌ Incorrect
                  </button>
                  <button
                    className="btn-mark-correct"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAnswered && onMarkCorrect) {
                        onMarkCorrect();
                      }
                    }}
                    disabled={isAnswered}
                  >
                    ✅ Correct
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;

