import React, { useState } from 'react';
import axios from 'axios';
import './UploadCSVModern.css';

// Error handling utilities
const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  SERVER: 'SERVER_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
};

const validateFile = (file) => {
  const errors = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['.csv'];
  const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];

  if (!file) {
    errors.push('No file selected');
    return { valid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push(`File size exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit`);
  }

  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`Invalid file type. Please upload: ${allowedTypes.join(', ')}`);
  }

  if (!allowedMimeTypes.includes(file.type) && file.type !== '') {
    errors.push('File format not supported');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
  };

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{icons[type]}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose}>✕</button>
    </div>
  );
};

// Error Alert component
const ErrorAlert = ({ error, onClose, onRetry }) => {
  if (!error) return null;

  return (
    <div className="error-alert">
      <div className="error-alert__content">
        <span className="error-alert__icon">⚠️</span>
        <div className="error-alert__text">
          <h4 className="error-alert__title">{error.title || 'Error'}</h4>
          <p className="error-alert__message">{error.message}</p>
        </div>
      </div>
      <div className="error-alert__actions">
        {onRetry && (
          <button className="error-alert__btn error-alert__btn--retry" onClick={onRetry}>
            Retry
          </button>
        )}
        <button className="error-alert__btn error-alert__btn--close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

// Main UploadCSV Component
const UploadCSV = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);
  const [error, setError] = useState(null);
  const [fileValidationErrors, setFileValidationErrors] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    setError(null);
    setFileValidationErrors([]);

    if (!file) return;

    const validation = validateFile(file);

    if (!validation.valid) {
      setFileValidationErrors(validation.errors);
      addToast('Invalid file selected', 'error');
      return;
    }

    setSelectedFile(file);
    addToast(`File "${file.name}" selected successfully`, 'success');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addToast('Please select a file first', 'warning');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Update this URL to match your Django backend
      const response = await axios.post('http://localhost:8000/api/upload-csv/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedData(response.data);
      addToast('File uploaded and processed successfully!', 'success');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('csv-file');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = 'Failed to upload file. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
      } else if (err.request) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      }

      setError({
        title: 'Upload Failed',
        message: errorMessage
      });
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className="upload-csv-modern">
      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className="upload-modern-content">
        {/* Error Alert */}
        {error && (
          <ErrorAlert
            error={error}
            onClose={() => setError(null)}
            onRetry={handleUpload}
          />
        )}

        {/* File Validation Errors */}
        {fileValidationErrors.length > 0 && (
          <div className="validation-errors">
            <div className="validation-errors__header">
              <span className="validation-errors__icon">⚠️</span>
              <h4>File Validation Issues</h4>
              <button className="validation-errors__close" onClick={() => setFileValidationErrors([])}>
                ✕
              </button>
            </div>
            <ul className="validation-errors__list">
              {fileValidationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Upload Section */}
        <div className="upload-zone-wrapper">
          {/* Upload Dropzone */}
          <div
            className={`upload-dropzone ${selectedFile ? 'has-file' : ''} ${loading ? 'loading' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="csv-file"
              accept=".csv"
              onChange={handleFileSelect}
              className="file-input-hidden"
              disabled={loading}
            />
            
            {!selectedFile ? (
              <label htmlFor="csv-file" className="dropzone-label">
                <div className="dropzone-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 className="dropzone-title">Drop your CSV file here</h3>
                <p className="dropzone-subtitle">or click to browse</p>
                <div className="dropzone-requirements">
                  <span>CSV format • Max 5MB</span>
                </div>
              </label>
            ) : (
              <div className="file-selected">
                <div className="file-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div className="file-details">
                  <h4 className="file-name">{selectedFile.name}</h4>
                  <p className="file-meta">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                    <span className="file-status">• Ready to upload</span>
                  </p>
                </div>
                <button 
                  className="file-remove"
                  onClick={() => {
                    setSelectedFile(null);
                    const input = document.getElementById('csv-file');
                    if (input) input.value = '';
                  }}
                  disabled={loading}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className="upload-action-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Upload & Analyze
              </>
            )}
          </button>
        </div>

        {/* Requirements Info */}
        <div className="upload-info">
          <div className="info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="info-text">
              <strong>Required Columns:</strong>
              <span>Equipment Name, Type, Flowrate, Pressure, Temperature</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="processing-overlay">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <h3>Processing Your Data</h3>
              <p>Analyzing equipment parameters...</p>
            </div>
          </div>
        )}

        {/* Success State - Data Summary */}
        {!loading && uploadedData && (
          <div className="data-results">
            <div className="results-header">
              <div className="success-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Upload Successful
              </div>
              <h3>Dataset Analysis Complete</h3>
            </div>

            <div className="results-grid">
              <div className="result-stat">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Total Equipment</span>
                  <span className="stat-value">{uploadedData.total_count || 0}</span>
                </div>
              </div>

              <div className="result-stat">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Equipment Types</span>
                  <span className="stat-value">{uploadedData.equipment_types || 0}</span>
                </div>
              </div>

              <div className="result-stat">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Avg Flowrate</span>
                  <span className="stat-value">{uploadedData.avg_flowrate?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>

              <div className="result-stat">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 20V10" />
                    <path d="M12 20V4" />
                    <path d="M6 20v-6" />
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-label">Avg Pressure</span>
                  <span className="stat-value">{uploadedData.avg_pressure?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <button 
              className="view-details-btn"
              onClick={() => {
                // Navigate to details or charts
                window.location.href = '/datasets';
              }}
            >
              View Detailed Analysis
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCSV;
