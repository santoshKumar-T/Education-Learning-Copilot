import React, { useState } from 'react';
import { generateQuiz, generateQuizFromConversation, validateQuizAnswers } from '../services/api/quiz.api';
import { getMySessions } from '../services/api/session.api';
import './QuizGenerator.css';

const QuizGenerator = ({ user, onNavigate }) => {
  const [topic, setTopic] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [options, setOptions] = useState({
    numQuestions: 5,
    difficulty: 'medium',
    questionTypes: ['multiple-choice', 'true-false'],
    timeLimit: null,
  });
  const [generateFrom, setGenerateFrom] = useState('topic'); // 'topic' or 'conversation'

  React.useEffect(() => {
    if (user && generateFrom === 'conversation') {
      loadSessions();
    }
  }, [user, generateFrom]);

  const loadSessions = async () => {
    try {
      const userSessions = await getMySessions();
      setSessions(userSessions || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setQuiz(null);
    setGenerating(true);

    try {
      let result;
      
      if (generateFrom === 'topic') {
        if (!topic.trim()) {
          setError('Please enter a topic');
          setGenerating(false);
          return;
        }
        result = await generateQuiz(topic, options);
      } else {
        if (!selectedSessionId) {
          setError('Please select a conversation session');
          setGenerating(false);
          return;
        }
        result = await generateQuizFromConversation(selectedSessionId, options);
      }

      if (result.success) {
        setQuiz(result.quiz);
        setError('');
      } else {
        setError(result.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
      console.error('Quiz generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quiz.questions) {
      setError('No quiz to submit');
      return;
    }

    // Validate all questions are answered
    const unanswered = quiz.questions.filter(q => !userAnswers[q.id || q.question]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} question(s) unanswered.`);
      return;
    }

    try {
      const result = await validateQuizAnswers(quiz, userAnswers);
      setQuizResults(result);
      setSubmitted(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to validate quiz. Please try again.');
      console.error('Quiz validation error:', err);
    }
  };

  const handleResetQuiz = () => {
    setQuiz(null);
    setUserAnswers({});
    setSubmitted(false);
    setQuizResults(null);
    setError('');
  };

  return (
    <div className="quiz-generator-container">
      <div className="container">
        <header className="quiz-header">
          <h1>🎲 Quiz Generator Agent</h1>
          <p>Generate AI-powered quizzes from topics or conversation history</p>
        </header>

        <div className="quiz-generator-content">
          {/* Generation Options */}
          <div className="generation-options">
            <div className="option-tabs">
              <button
                className={`tab-button ${generateFrom === 'topic' ? 'active' : ''}`}
                onClick={() => setGenerateFrom('topic')}
              >
                📝 From Topic
              </button>
              <button
                className={`tab-button ${generateFrom === 'conversation' ? 'active' : ''}`}
                onClick={() => setGenerateFrom('conversation')}
                disabled={!user}
              >
                💬 From Conversation
              </button>
            </div>

            {!user && generateFrom === 'conversation' && (
              <div className="info-message">
                <p>Please log in to generate quizzes from your conversation history.</p>
              </div>
            )}
          </div>

          {/* Quiz Form */}
          <form onSubmit={handleGenerateQuiz} className="quiz-form">
            {generateFrom === 'topic' ? (
              <div className="form-group">
                <label htmlFor="topic">Topic or Content *</label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic, subject, or content to generate a quiz from. For example: 'JavaScript functions' or 'World War II'"
                  rows="4"
                  required
                  disabled={generating}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="session">Select Conversation Session *</label>
                <select
                  id="session"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  required
                  disabled={generating || sessions.length === 0}
                >
                  <option value="">Select a session...</option>
                  {sessions.map(session => (
                    <option key={session._id} value={session._id}>
                      Session {session._id.substring(0, 8)}... ({session.messageCount || 0} messages)
                    </option>
                  ))}
                </select>
                {sessions.length === 0 && (
                  <p className="form-help">No conversation sessions found. Start chatting to create sessions!</p>
                )}
              </div>
            )}

            {/* Quiz Options */}
            <div className="quiz-options">
              <h3>Quiz Options</h3>
              
              <div className="options-grid">
                <div className="form-group">
                  <label htmlFor="numQuestions">Number of Questions</label>
                  <input
                    type="number"
                    id="numQuestions"
                    min="3"
                    max="20"
                    value={options.numQuestions}
                    onChange={(e) => setOptions({ ...options, numQuestions: parseInt(e.target.value) || 5 })}
                    disabled={generating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select
                    id="difficulty"
                    value={options.difficulty}
                    onChange={(e) => setOptions({ ...options, difficulty: e.target.value })}
                    disabled={generating}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="timeLimit">Time Limit (minutes, optional)</label>
                  <input
                    type="number"
                    id="timeLimit"
                    min="1"
                    value={options.timeLimit || ''}
                    onChange={(e) => setOptions({ ...options, timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Optional"
                    disabled={generating}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Question Types</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={options.questionTypes.includes('multiple-choice')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptions({ ...options, questionTypes: [...options.questionTypes, 'multiple-choice'] });
                        } else {
                          setOptions({ ...options, questionTypes: options.questionTypes.filter(t => t !== 'multiple-choice') });
                        }
                      }}
                      disabled={generating}
                    />
                    <span>Multiple Choice</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={options.questionTypes.includes('true-false')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptions({ ...options, questionTypes: [...options.questionTypes, 'true-false'] });
                        } else {
                          setOptions({ ...options, questionTypes: options.questionTypes.filter(t => t !== 'true-false') });
                        }
                      }}
                      disabled={generating}
                    />
                    <span>True/False</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={options.questionTypes.includes('short-answer')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOptions({ ...options, questionTypes: [...options.questionTypes, 'short-answer'] });
                        } else {
                          setOptions({ ...options, questionTypes: options.questionTypes.filter(t => t !== 'short-answer') });
                        }
                      }}
                      disabled={generating}
                    />
                    <span>Short Answer</span>
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary btn-large"
              disabled={generating || (generateFrom === 'topic' && !topic.trim()) || (generateFrom === 'conversation' && !selectedSessionId)}
            >
              {generating ? (
                <>
                  <span className="spinner"></span>
                  Generating Quiz...
                </>
              ) : (
                '🎲 Generate Quiz'
              )}
            </button>
          </form>

          {/* Generated Quiz Display */}
          {quiz && (
            <div className="generated-quiz">
              <div className="quiz-header-info">
                <h2>{quiz.title || 'Generated Quiz'}</h2>
                <div className="quiz-meta">
                  <span>Topic: {quiz.topic || 'N/A'}</span>
                  <span>Difficulty: {quiz.difficulty || 'medium'}</span>
                  <span>Questions: {quiz.questions?.length || 0}</span>
                  {quiz.timeLimit && <span>Time: {quiz.timeLimit} min</span>}
                </div>
              </div>

              <div className="quiz-questions">
                {quiz.questions?.map((question, index) => {
                  const questionId = question.id || question.question || index;
                  const userAnswer = userAnswers[questionId];
                  const correctAnswer = question.correctAnswer || question.answer;
                  const isCorrect = submitted && userAnswer === correctAnswer;
                  const showAnswer = submitted && quizResults;

                  return (
                    <div key={questionId} className="question-card">
                      <div className="question-header">
                        <span className="question-number">Q{index + 1}</span>
                        <span className="question-type">{question.type}</span>
                        {showAnswer && (
                          <span className={`answer-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                        )}
                      </div>
                      <h3 className="question-text">{question.question}</h3>
                      
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="question-options">
                          {question.options.map((option, optIndex) => {
                            const optionLabel = String.fromCharCode(65 + optIndex);
                            const isSelected = userAnswer === optionLabel || userAnswer === option;
                            const isCorrectOption = correctAnswer === optionLabel || correctAnswer === option;
                            
                            return (
                              <label 
                                key={optIndex} 
                                className={`option-item ${isSelected ? 'selected' : ''} ${showAnswer && isCorrectOption ? 'correct-answer' : ''} ${showAnswer && isSelected && !isCorrectOption ? 'wrong-answer' : ''}`}
                                style={{ cursor: submitted ? 'default' : 'pointer' }}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionId}`}
                                  value={optionLabel}
                                  checked={isSelected}
                                  onChange={() => !submitted && handleAnswerChange(questionId, optionLabel)}
                                  disabled={submitted}
                                />
                                <span className="option-label">{optionLabel}</span>
                                <span className="option-text">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {question.type === 'true-false' && (
                        <div className="question-options">
                          {['True', 'False'].map((option) => {
                            const isSelected = userAnswer === option;
                            const isCorrectOption = correctAnswer === option;
                            
                            return (
                              <label 
                                key={option}
                                className={`option-item ${isSelected ? 'selected' : ''} ${showAnswer && isCorrectOption ? 'correct-answer' : ''} ${showAnswer && isSelected && !isCorrectOption ? 'wrong-answer' : ''}`}
                                style={{ cursor: submitted ? 'default' : 'pointer' }}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionId}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => !submitted && handleAnswerChange(questionId, option)}
                                  disabled={submitted}
                                />
                                <span className="option-text">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {question.type === 'short-answer' && (
                        <div className="short-answer-input">
                          <textarea
                            value={userAnswer || ''}
                            onChange={(e) => !submitted && handleAnswerChange(questionId, e.target.value)}
                            placeholder="Type your answer here..."
                            disabled={submitted}
                            rows="3"
                          />
                        </div>
                      )}

                      {showAnswer && question.explanation && (
                        <div className="question-explanation">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}

                      {showAnswer && (
                        <div className="correct-answer-display">
                          <strong>Correct Answer:</strong> {correctAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!submitted && (
                <div className="quiz-submit-section">
                  <button 
                    className="btn-primary btn-large"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length < quiz.questions?.length}
                  >
                    📝 Submit Quiz
                  </button>
                  <p className="submit-help">
                    {Object.keys(userAnswers).length} of {quiz.questions?.length} questions answered
                  </p>
                </div>
              )}

              {submitted && quizResults && (
                <div className="quiz-results">
                  <div className="results-header">
                    <h2>Quiz Results</h2>
                    <div className="score-display">
                      <div className="score-circle">
                        <span className="score-number">{quizResults.score || 0}%</span>
                        <span className="score-label">Score</span>
                      </div>
                      <div className="score-details">
                        <p><strong>Correct:</strong> {quizResults.correctCount || 0} / {quizResults.totalQuestions || quiz.questions?.length || 0}</p>
                        <p><strong>Incorrect:</strong> {(quizResults.totalQuestions || quiz.questions?.length || 0) - (quizResults.correctCount || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="quiz-actions">
                <button className="btn-secondary" onClick={handleResetQuiz}>
                  Generate Another Quiz
                </button>
                {submitted && (
                  <button className="btn-primary" onClick={() => window.print()}>
                    📄 Print Results
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;

