import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UploadedDatasets.css';

const UploadedDatasets = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // Fetch datasets from backend
  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      // Update this URL to match your Django backend endpoint
      const response = await axios.get('http://localhost:8000/api/datasets/');
      setDatasets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (datasetId) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/datasets/${datasetId}/`);
      // Refresh the datasets list
      fetchDatasets();
    } catch (err) {
      console.error('Error deleting dataset:', err);
      alert('Failed to delete dataset');
    }
  };

  const handleViewRecords = (datasetId) => {
    // FIX: Changed from dataset.id to datasetId parameter
    navigate(`/datasets/${datasetId}/records`);
  };

  const handleDownload = async (datasetId) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/datasets/${datasetId}/download/`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dataset_${datasetId}_report.pdf`); // Fixed: always use .pdf extension
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Clean up
  } catch (err) {
    console.error('Error downloading dataset:', err);
    alert('Failed to download dataset');
  }
};

  // Filter datasets based on search query
  const filteredDatasets = datasets.filter(dataset =>
    dataset.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalDatasets = datasets.length;
  const totalEquipment = datasets.reduce((sum, ds) => sum + (ds.total_count || 0), 0);
  const lastUpload = datasets.length > 0 
    ? new Date(datasets[0].uploaded_at).toLocaleDateString()
    : 'N/A';

  return (
    <div className="uploaded-datasets">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Uploaded Datasets</h1>
        <p className="page-subtitle">Manage and analyze your chemical equipment data</p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filter
        </button>
        <button className="filter-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
          </svg>
          Sort By
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-label">Total Datasets</div>
          <div className="stat-value">{totalDatasets}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Equipment</div>
          <div className="stat-value">{totalEquipment}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Upload</div>
          <div className="stat-value">{lastUpload}</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading datasets...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchDatasets} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Datasets Grid */}
      {!loading && !error && filteredDatasets.length > 0 && (
        <div className="datasets-grid">
          {filteredDatasets.map((dataset, index) => (
            <div key={dataset.id || index} className="dataset-card">
              <div className="dataset-header">
                <div className="dataset-icon">
                  {index % 3 === 0 ? '📊' : index % 3 === 1 ? '📈' : '🔬'}
                </div>
                <div className="dataset-info">
                  <h3 className="dataset-name">{dataset.filename || 'Untitled Dataset'}</h3>
                  <div className="dataset-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {dataset.uploaded_at 
                      ? `Uploaded ${new Date(dataset.uploaded_at).toLocaleDateString()}`
                      : 'Upload date unknown'
                    }
                  </div>
                </div>
              </div>

              <div className="dataset-stats">
                <div className="stat-item">
                  <span className="stat-item-label">Equipment</span>
                  <span className="stat-item-value">{dataset.total_count || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item-label">Types</span>
                  <span className="stat-item-value">{dataset.equipment_types || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-item-label">Avg Flow</span>
                  <span className="stat-item-value">
                    {dataset.avg_flowrate ? dataset.avg_flowrate.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-item-label">Avg Press</span>
                  <span className="stat-item-value">
                    {dataset.avg_pressure ? dataset.avg_pressure.toFixed(1) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="dataset-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => handleViewRecords(dataset.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View Records
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleDownload(dataset.id)}
                  title="Download"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"/>
                  </svg>
                </button>
                <button 
                  className="action-btn danger"
                  onClick={() => handleDelete(dataset.id)}
                  title="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDatasets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3 className="empty-title">
            {searchQuery ? 'No Results Found' : 'No Datasets Yet'}
          </h3>
          <p className="empty-text">
            {searchQuery 
              ? 'Try adjusting your search query'
              : 'Upload your first CSV file to get started with chemical equipment analysis'
            }
          </p>
          {!searchQuery && (
            <button 
              className="upload-new-btn"
              onClick={() => navigate('/')}
            >
              Upload New Dataset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadedDatasets;
