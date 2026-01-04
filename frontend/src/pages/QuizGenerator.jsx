import React, { useState } from 'react';
import { generateQuiz, generateQuizFromConversation } from '../services/api/quiz.api';
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
                {quiz.questions?.map((question, index) => (
                  <div key={question.id || index} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Q{index + 1}</span>
                      <span className="question-type">{question.type}</span>
                    </div>
                    <h3 className="question-text">{question.question}</h3>
                    
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="question-options">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="option-item">
                            <span className="option-label">{String.fromCharCode(65 + optIndex)}</span>
                            <span className="option-text">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div className="question-options">
                        <div className="option-item">True</div>
                        <div className="option-item">False</div>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="question-explanation">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="quiz-actions">
                <button className="btn-secondary" onClick={() => setQuiz(null)}>
                  Generate Another Quiz
                </button>
                <button className="btn-primary" onClick={() => window.print()}>
                  📄 Print Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;

