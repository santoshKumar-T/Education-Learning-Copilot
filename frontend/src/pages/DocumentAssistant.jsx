import React, { useState, useEffect, useRef } from 'react';
import { uploadDocument, getDocuments, deleteDocument } from '../services/api/document.api.js';
import './DocumentAssistant.css';

const DocumentAssistant = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [summaryLevel, setSummaryLevel] = useState('brief');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

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

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
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
                <button className="btn-close" onClick={() => setSelectedDocument(null)}>✕</button>
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
                      onClick={() => setSummaryLevel('brief')}
                    >
                      Brief
                    </button>
                    <button
                      className={summaryLevel === 'detailed' ? 'active' : ''}
                      onClick={() => setSummaryLevel('detailed')}
                    >
                      Detailed
                    </button>
                    <button
                      className={summaryLevel === 'comprehensive' ? 'active' : ''}
                      onClick={() => setSummaryLevel('comprehensive')}
                    >
                      Comprehensive
                    </button>
                  </div>

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

