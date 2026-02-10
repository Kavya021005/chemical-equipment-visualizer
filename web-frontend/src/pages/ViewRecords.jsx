import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ViewRecords.css';
import EquipmentCharts from '../components/EquipmentCharts';

const DatasetDetail = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  
  const [records, setRecords] = useState([]);
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCharts, setShowCharts] = useState(true);
  const recordsPerPage = 20;

  useEffect(() => {
    fetchDatasetRecords();
  }, [datasetId]);

  const fetchDatasetRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/datasets/${datasetId}/records/`);
      
      // The backend should return: { dataset: {...}, records: [...] }
      setDataset(response.data.dataset || response.data);
      setRecords(response.data.records || response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load dataset records');
    } finally {
      setLoading(false);
    }
  };

  // Filter records based on search
  const filteredRecords = records.filter(record => {
    if (!searchQuery) return true;
    
    return Object.values(record).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Get column headers from first record
  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExport = () => {
    // Convert records to CSV
    if (records.length === 0) return;
    
    const headers = Object.keys(records[0]);
    const csvContent = [
      headers.join(','),
      ...records.map(record => 
        headers.map(header => `"${record[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset?.filename || 'dataset'}_records.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dataset-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/uploaded-datasets')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Datasets
        </button>
        
        {dataset && (
          <div className="dataset-title-section">
            <h1 className="detail-title">{dataset.filename || 'Dataset Records'}</h1>
            <div className="dataset-meta">
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {new Date(dataset.uploaded_at).toLocaleDateString()}
              </span>
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                {records.length} Records
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="records-toolbar">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="toolbar-actions">
          <button 
            className={`toggle-charts-btn ${showCharts ? 'active' : ''}`} 
            onClick={() => setShowCharts(!showCharts)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </button>
          
          <button className="export-btn" onClick={handleExport}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading records...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchDatasetRecords} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Charts Section */}
      {!loading && !error && records.length > 0 && showCharts && (
        <EquipmentCharts records={records} dataset={dataset} />
      )}

      {/* Records Table */}
      {!loading && !error && records.length > 0 && (
        <>
          <div className="table-container">
            <table className="records-table">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index}>{column.replace(/_/g, ' ').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record, rowIndex) => (
                  <tr key={rowIndex} className="table-row-animated" style={{ animationDelay: `${rowIndex * 0.05}s` }}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex}>{record[column]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                className="page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          )}

          <div className="records-info">
            Showing {indexOfFirstRecord + 1} - {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} records
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && records.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">No Records Found</h3>
          <p className="empty-text">This dataset doesn't contain any records.</p>
        </div>
      )}
    </div>
  );
};

export default DatasetDetail;
