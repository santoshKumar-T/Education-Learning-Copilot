import React, { useState } from 'react';
import { generateLessonPlan, generateLessonPlanFromConversation } from '../services/api/lesson-plan.api';
import { getMySessions } from '../services/api/session.api';
import './LessonPlanner.css';

const LessonPlanner = ({ user, onNavigate }) => {
  const [topic, setTopic] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [lessonPlan, setLessonPlan] = useState(null);
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    duration: 60,
    level: 'intermediate',
    learningObjectives: [],
    includeActivities: true,
    includeAssessment: true,
  });
  const [newObjective, setNewObjective] = useState('');
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

  const handleGenerateLessonPlan = async (e) => {
    e.preventDefault();
    setError('');
    setLessonPlan(null);
    setGenerating(true);

    try {
      let result;
      
      if (generateFrom === 'topic') {
        if (!topic.trim()) {
          setError('Please enter a topic or learning objectives');
          setGenerating(false);
          return;
        }
        result = await generateLessonPlan(topic, options);
      } else {
        if (!selectedSessionId) {
          setError('Please select a conversation session');
          setGenerating(false);
          return;
        }
        result = await generateLessonPlanFromConversation(selectedSessionId, options);
      }

      if (result.success) {
        setLessonPlan(result.lessonPlan);
        setError('');
      } else {
        setError(result.error || 'Failed to generate lesson plan');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate lesson plan. Please try again.');
      console.error('Lesson plan generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setOptions({
        ...options,
        learningObjectives: [...options.learningObjectives, newObjective.trim()],
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index) => {
    setOptions({
      ...options,
      learningObjectives: options.learningObjectives.filter((_, i) => i !== index),
    });
  };

  const handleReset = () => {
    setLessonPlan(null);
    setTopic('');
    setError('');
  };

  return (
    <div className="lesson-planner-container">
      <div className="container">
        <header className="lesson-planner-header">
          <h1>📚 Lesson Planner Agent</h1>
          <p>Design structured lesson plans based on learning objectives. Create sequential, logical learning experiences.</p>
        </header>

        <div className="lesson-planner-content">
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
                <p>Please log in to generate lesson plans from your conversation history.</p>
              </div>
            )}
          </div>

          {/* Lesson Plan Form */}
          <form onSubmit={handleGenerateLessonPlan} className="lesson-plan-form">
            {generateFrom === 'topic' ? (
              <div className="form-group">
                <label htmlFor="topic">Topic or Learning Objectives *</label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic, subject, or learning objectives. For example: 'Introduction to JavaScript' or 'Understanding Photosynthesis'"
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

            {/* Lesson Plan Options */}
            <div className="lesson-plan-options">
              <h3>Lesson Plan Options</h3>
              
              <div className="options-grid">
                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration"
                    min="15"
                    max="180"
                    value={options.duration}
                    onChange={(e) => setOptions({ ...options, duration: parseInt(e.target.value) || 60 })}
                    disabled={generating}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="level">Level</label>
                  <select
                    id="level"
                    value={options.level}
                    onChange={(e) => setOptions({ ...options, level: e.target.value })}
                    disabled={generating}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="objectives">Learning Objectives (Optional)</label>
                <p className="form-help">Add specific learning objectives. Leave empty to auto-generate.</p>
                <div className="objectives-input">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                    placeholder="Enter a learning objective and press Enter"
                    disabled={generating}
                  />
                  <button type="button" onClick={addObjective} disabled={generating || !newObjective.trim()}>
                    Add
                  </button>
                </div>
                {options.learningObjectives.length > 0 && (
                  <div className="objectives-list">
                    {options.learningObjectives.map((obj, index) => (
                      <div key={index} className="objective-item">
                        <span>{obj}</span>
                        <button type="button" onClick={() => removeObjective(index)} disabled={generating}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.includeActivities}
                    onChange={(e) => setOptions({ ...options, includeActivities: e.target.checked })}
                    disabled={generating}
                  />
                  <span>Include Activities & Practice</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.includeAssessment}
                    onChange={(e) => setOptions({ ...options, includeAssessment: e.target.checked })}
                    disabled={generating}
                  />
                  <span>Include Assessment Methods</span>
                </label>
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
                  Generating Lesson Plan...
                </>
              ) : (
                '📚 Generate Lesson Plan'
              )}
            </button>
          </form>

          {/* Generated Lesson Plan Display */}
          {lessonPlan && (
            <div className="generated-lesson-plan">
              <div className="lesson-plan-header-info">
                <h2>{lessonPlan.title || 'Generated Lesson Plan'}</h2>
                <div className="lesson-plan-meta">
                  <span>Topic: {lessonPlan.topic || 'N/A'}</span>
                  <span>Level: {lessonPlan.level || 'intermediate'}</span>
                  <span>Duration: {lessonPlan.estimatedTotalTime || lessonPlan.duration} min</span>
                </div>
              </div>

              {/* Learning Objectives */}
              {lessonPlan.learningObjectives && lessonPlan.learningObjectives.length > 0 && (
                <div className="lesson-plan-section">
                  <h3>🎯 Learning Objectives</h3>
                  <ul className="objectives-list-display">
                    {lessonPlan.learningObjectives.map((obj, index) => (
                      <li key={index}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {lessonPlan.prerequisites && lessonPlan.prerequisites.length > 0 && (
                <div className="lesson-plan-section">
                  <h3>📋 Prerequisites</h3>
                  <ul className="prerequisites-list">
                    {lessonPlan.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Materials */}
              {lessonPlan.materials && lessonPlan.materials.length > 0 && (
                <div className="lesson-plan-section">
                  <h3>📦 Materials Needed</h3>
                  <ul className="materials-list">
                    {lessonPlan.materials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lesson Sections */}
              {lessonPlan.sections && lessonPlan.sections.length > 0 && (
                <div className="lesson-plan-section">
                  <h3>📖 Lesson Structure</h3>
                  <div className="sections-list">
                    {lessonPlan.sections.map((section, index) => (
                      <div key={index} className="section-card">
                        <div className="section-header">
                          <h4>{section.title || `Section ${index + 1}`}</h4>
                          <span className="section-duration">{section.duration || 0} min</span>
                        </div>
                        <div className="section-content">
                          <p>{section.content}</p>
                          {section.keyPoints && section.keyPoints.length > 0 && (
                            <div className="key-points">
                              <strong>Key Points:</strong>
                              <ul>
                                {section.keyPoints.map((point, pIndex) => (
                                  <li key={pIndex}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {section.activities && section.activities.length > 0 && (
                            <div className="section-activities">
                              <strong>Activities:</strong>
                              <ul>
                                {section.activities.map((activity, aIndex) => (
                                  <li key={aIndex}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment */}
              {lessonPlan.assessment && (
                <div className="lesson-plan-section">
                  <h3>✅ Assessment</h3>
                  {lessonPlan.assessment.methods && lessonPlan.assessment.methods.length > 0 && (
                    <div className="assessment-methods">
                      <strong>Assessment Methods:</strong>
                      <ul>
                        {lessonPlan.assessment.methods.map((method, index) => (
                          <li key={index}>{method}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {lessonPlan.assessment.criteria && (
                    <div className="assessment-criteria">
                      <strong>Assessment Criteria:</strong>
                      <p>{lessonPlan.assessment.criteria}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Extension Activities */}
              {lessonPlan.extensionActivities && lessonPlan.extensionActivities.length > 0 && (
                <div className="lesson-plan-section">
                  <h3>🚀 Extension Activities</h3>
                  <ul className="extension-activities-list">
                    {lessonPlan.extensionActivities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="lesson-plan-actions">
                <button className="btn-secondary" onClick={handleReset}>
                  Generate Another Lesson Plan
                </button>
                <button className="btn-primary" onClick={() => window.print()}>
                  📄 Print Lesson Plan
                </button>
                <button className="btn-primary" onClick={() => {
                  const dataStr = JSON.stringify(lessonPlan, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `lesson-plan-${lessonPlan.topic || 'lesson'}.json`;
                  link.click();
                }}>
                  💾 Export JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;

