import React, { useState, useEffect, useRef } from 'react';
import { uploadDocument, getDocuments, deleteDocument, askDocumentQuestion } from '../services/api/document.api.js';
import { generateDocumentSummaryAudio, getAudioUrl } from '../services/api/tts.api.js';
import AudioPlayer from '../components/common/AudioPlayer.jsx';
import './DocumentAssistant.css';

const DocumentAssistant = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [summaryLevel, setSummaryLevel] = useState('brief');
  const [dragActive, setDragActive] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFilename, setAudioFilename] = useState(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [voice, setVoice] = useState('alloy');
  const [speed, setSpeed] = useState(1.0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [qaError, setQaError] = useState(null);
  const fileInputRef = useRef(null);
  const questionInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  // Clear Q&A state when selected document changes
  useEffect(() => {
    if (selectedDocument) {
      setQuestion('');
      setAnswer(null);
      setSources([]);
      setQaError(null);
    }
  }, [selectedDocument?.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      // API middleware returns { data, status, ... } - check response.data
      if (response.data && response.data.success) {
        setDocuments(response.data.documents || []);
      } else if (response.success) {
        // Fallback for direct response
        setDocuments(response.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Invalid file type. Please upload PDF, TXT, or MD files only.');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit.');
      return;
    }

    try {
      setUploading(true);
      const response = await uploadDocument(file);
      // API middleware returns { data, status, ... } - check response.data
      const success = (response.data && response.data.success) || response.success;
      if (success) {
        alert('Document uploaded successfully! Processing in background...');
        // Reload documents immediately and then again after processing
        loadDocuments();
        setTimeout(() => {
          loadDocuments();
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await deleteDocument(documentId);
      // API middleware returns { data, status, ... } - check response.data
      const success = (response.data && response.data.success) || response.success;
      if (success) {
        setDocuments(documents.filter(doc => doc.id !== documentId));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null);
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleGenerateAudio = async () => {
    if (!selectedDocument || selectedDocument.status !== 'completed') {
      alert('Please select a completed document first.');
      return;
    }

    const summaryText = selectedDocument.summary?.[summaryLevel];
    if (!summaryText) {
      alert(`No ${summaryLevel} summary available for this document.`);
      return;
    }

    try {
      setGeneratingAudio(true);
      const response = await generateDocumentSummaryAudio(
        selectedDocument.id,
        summaryLevel,
        voice,
        speed
      );

      const success = (response.data && response.data.success) || response.success;
      if (success) {
        const audio = (response.data && response.data.audio) || response.audio;
        const audioFileUrl = getAudioUrl(audio.filename);
        setAudioUrl(audioFileUrl);
        setAudioFilename(audio.filename);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please try again.');
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleSummaryLevelChange = (level) => {
    setSummaryLevel(level);
    // Clear audio when summary level changes
    setAudioUrl(null);
    setAudioFilename(null);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !selectedDocument) {
      return;
    }

    if (selectedDocument.status !== 'completed') {
      alert('Please wait for the document to finish processing before asking questions.');
      return;
    }

    try {
      setAskingQuestion(true);
      setQaError(null);
      setAnswer(null);
      setSources([]);

      const response = await askDocumentQuestion(selectedDocument.id, question.trim());
      
      const success = (response.data && response.data.success) || response.success;
      if (success) {
        const data = response.data || response;
        setAnswer({
          text: data.answer,
          confidence: data.confidence,
          model: data.model,
          usage: data.usage
        });
        setSources(data.sources || []);
      } else {
        setQaError('Failed to get answer. Please try again.');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setQaError(error.message || 'Failed to get answer. Please try again.');
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleClearQa = () => {
    setQuestion('');
    setAnswer(null);
    setSources([]);
    setQaError(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      uploaded: { text: 'Uploaded', class: 'status-uploaded' },
      processing: { text: 'Processing...', class: 'status-processing' },
      completed: { text: 'Ready', class: 'status-completed' },
      failed: { text: 'Failed', class: 'status-failed' }
    };

    const config = statusConfig[status] || statusConfig.uploaded;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (!user) {
    return (
      <div className="document-assistant">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to use the Document Assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-assistant">
      <div className="container">
        <div className="page-header">
          <h1>📄 Smart Document Assistant</h1>
          <p>Upload documents and get AI-powered summaries, key topics, and more</p>
        </div>

        <div className="document-layout">
          {/* Upload Section */}
          <div className="upload-section">
            <div
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              {uploading ? (
                <div className="upload-content">
                  <div className="upload-spinner"></div>
                  <p>Uploading and processing...</p>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon">📤</div>
                  <h3>Drag & Drop or Click to Upload</h3>
                  <p>Supports PDF, TXT, and MD files (Max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Documents List */}
          <div className="documents-section">
            <h2>Your Documents</h2>
            {loading ? (
              <div className="loading">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <p>No documents yet. Upload your first document to get started!</p>
              </div>
            ) : (
              <div className="documents-list">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`document-card ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="document-header">
                      <div className="document-info">
                        <h3>{doc.filename}</h3>
                        <p className="document-meta">
                          {formatFileSize(doc.fileSize)} • {doc.fileType.toUpperCase()} • {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="document-actions">
                        {getStatusBadge(doc.status)}
                        <button
                          className="btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Details */}
          {selectedDocument && (
            <div className="document-details">
              <div className="details-header">
                <h2>{selectedDocument.filename}</h2>
                <button className="btn-close" onClick={() => {
                  setSelectedDocument(null);
                  // Clear Q&A state when closing document
                  setQuestion('');
                  setAnswer(null);
                  setSources([]);
                  setQaError(null);
                }}>✕</button>
              </div>

              {selectedDocument.status === 'processing' && (
                <div className="processing-message">
                  <div className="spinner"></div>
                  <p>Document is being processed. Please refresh in a moment.</p>
                </div>
              )}

              {selectedDocument.status === 'failed' && (
                <div className="error-message">
                  <p>❌ Failed to process document. Please try uploading again.</p>
                </div>
              )}

              {selectedDocument.status === 'completed' && (
                <div className="document-content">
                  {/* Summary Level Selector */}
                  <div className="summary-selector">
                    <button
                      className={summaryLevel === 'brief' ? 'active' : ''}
                      onClick={() => handleSummaryLevelChange('brief')}
                    >
                      Brief
                    </button>
                    <button
                      className={summaryLevel === 'detailed' ? 'active' : ''}
                      onClick={() => handleSummaryLevelChange('detailed')}
                    >
                      Detailed
                    </button>
                    <button
                      className={summaryLevel === 'comprehensive' ? 'active' : ''}
                      onClick={() => handleSummaryLevelChange('comprehensive')}
                    >
                      Comprehensive
                    </button>
                  </div>

                  {/* Audio Generation Controls */}
                  {selectedDocument.summary && selectedDocument.summary[summaryLevel] && (
                    <div className="audio-controls-section">
                      <div className="audio-settings-row">
                        <div className="audio-setting">
                          <label>Voice:</label>
                          <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="voice-select"
                          >
                            <option value="alloy">Alloy</option>
                            <option value="echo">Echo</option>
                            <option value="fable">Fable</option>
                            <option value="onyx">Onyx</option>
                            <option value="nova">Nova</option>
                            <option value="shimmer">Shimmer</option>
                          </select>
                        </div>
                        <div className="audio-setting">
                          <label>Speed:</label>
                          <select
                            value={speed}
                            onChange={(e) => setSpeed(parseFloat(e.target.value))}
                            className="speed-select-input"
                          >
                            <option value="0.75">0.75x</option>
                            <option value="1.0">1.0x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                          </select>
                        </div>
                        <button
                          className="btn-generate-audio"
                          onClick={handleGenerateAudio}
                          disabled={generatingAudio}
                        >
                          {generatingAudio ? '⏳ Generating...' : '🎤 Generate Audio'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Audio Player */}
                  {audioUrl && (
                    <div className="audio-section">
                      <h3>🎧 Audio Summary</h3>
                      <AudioPlayer
                        audioUrl={audioUrl}
                        filename={audioFilename || 'summary.mp3'}
                        onDelete={() => {
                          setAudioUrl(null);
                          setAudioFilename(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Summary Display */}
                  {selectedDocument.summary && selectedDocument.summary[summaryLevel] && (
                    <div className="summary-section">
                      <h3>Summary ({summaryLevel})</h3>
                      <div className="summary-content">
                        {selectedDocument.summary[summaryLevel].split('\n').map((paragraph, idx) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Topics */}
                  {selectedDocument.keyTopics && selectedDocument.keyTopics.length > 0 && (
                    <div className="topics-section">
                      <h3>Key Topics</h3>
                      <div className="topics-list">
                        {selectedDocument.keyTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className={`topic-badge topic-${topic.importance || 'medium'}`}
                          >
                            {topic.topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Q&A Section */}
                  <div className="qa-section">
                    <h3>💬 Ask Questions About This Document</h3>
                    <p className="qa-description">Ask any question about the document content and get AI-powered answers based on the document.</p>
                    
                    <form onSubmit={handleAskQuestion} className="qa-form">
                      <div className="qa-input-group">
                        <input
                          ref={questionInputRef}
                          type="text"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="e.g., What are the main topics covered? What is GDPR?"
                          className="qa-input"
                          disabled={askingQuestion}
                        />
                        <button
                          type="submit"
                          className="btn-ask"
                          disabled={askingQuestion || !question.trim()}
                        >
                          {askingQuestion ? '⏳ Asking...' : '❓ Ask'}
                        </button>
                      </div>
                    </form>

                    {qaError && (
                      <div className="qa-error">
                        <p>❌ {qaError}</p>
                      </div>
                    )}

                    {answer && (
                      <div className="qa-answer">
                        <div className="answer-header">
                          <h4>Answer</h4>
                          {answer.confidence && (
                            <span className="confidence-badge">
                              Confidence: {(answer.confidence * 100).toFixed(1)}%
                            </span>
                          )}
                          <button className="btn-clear-qa" onClick={handleClearQa}>Clear</button>
                        </div>
                        <div className="answer-content">
                          {answer.text.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                        
                        {sources && sources.length > 0 && (
                          <div className="qa-sources">
                            <h5>📚 Sources ({sources.length})</h5>
                            <div className="sources-list">
                              {sources.map((source, idx) => (
                                <div key={idx} className="source-item">
                                  <div className="source-header">
                                    <span className="source-rank">#{idx + 1}</span>
                                    <span className="source-score">Relevance: {(source.score * 100).toFixed(1)}%</span>
                                  </div>
                                  <p className="source-text">{source.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  {selectedDocument.metadata && (
                    <div className="metadata-section">
                      <h3>Document Info</h3>
                      <div className="metadata-grid">
                        {selectedDocument.metadata.wordCount && (
                          <div className="metadata-item">
                            <span className="metadata-label">Words:</span>
                            <span className="metadata-value">{selectedDocument.metadata.wordCount.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedDocument.metadata.pageCount && (
                          <div className="metadata-item">
                            <span className="metadata-label">Pages:</span>
                            <span className="metadata-value">{selectedDocument.metadata.pageCount}</span>
                          </div>
                        )}
                        {selectedDocument.metadata.processingTime && (
                          <div className="metadata-item">
                            <span className="metadata-label">Processed in:</span>
                            <span className="metadata-value">{(selectedDocument.metadata.processingTime / 1000).toFixed(2)}s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentAssistant;

