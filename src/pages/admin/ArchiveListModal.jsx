import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaSearch, FaSync, FaFilePdf, FaUser, 
  FaCalendarAlt, FaArchive, FaRedo, FaChevronLeft, 
  FaChevronRight, FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ArchiveListModal = ({ isOpen, onClose }) => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [archivesPerPage] = useState(10);
  const [totalArchives, setTotalArchives] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Define styles at the top level of the component
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '95%',
      maxWidth: '1400px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: {
      padding: '20px 25px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#395886',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      color: '#64748b',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      transition: 'all 0.3s',
    },
    content: {
      flex: 1,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    controls: {
      padding: '20px 25px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
    },
    searchBox: {
      position: 'relative',
      flex: '1',
      minWidth: '300px',
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
    },
    searchInput: {
      width: '100%',
      padding: '12px 20px 12px 45px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s',
    },
    buttonPrimary: {
      backgroundColor: '#395886',
      color: 'white',
    },
    buttonSecondary: {
      backgroundColor: '#059669',
      color: 'white',
    },
    tableContainer: {
      flex: 1,
      overflow: 'auto',
      padding: '0 25px 25px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '1000px',
    },
    th: {
      padding: '15px 12px',
      textAlign: 'left',
      backgroundColor: '#f8fafc',
      color: '#395886',
      fontWeight: '600',
      borderBottom: '2px solid #e2e8f0',
      fontSize: '14px',
      position: 'sticky',
      top: 0,
    },
    td: {
      padding: '15px 12px',
      borderBottom: '1px solid #f1f1f1',
      fontSize: '14px',
    },
    tr: {
      transition: 'background-color 0.2s',
    },
    archiveType: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    typeUsers: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    typePatients: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    restoreButton: {
      padding: '6px 12px',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'background-color 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #395886',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      margin: '20px 25px',
      color: '#dc2626',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 25px',
      borderTop: '1px solid #e2e8f0',
    },
    paginationInfo: {
      color: '#64748b',
      fontSize: '14px',
    },
    paginationControls: {
      display: 'flex',
      gap: '5px',
    },
    paginationButton: {
      padding: '8px 12px',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s',
    },
    paginationButtonActive: {
      backgroundColor: '#395886',
      color: 'white',
      borderColor: '#395886',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  };

  useEffect(() => {
    if (isOpen) {
      fetchArchives();
    }
  }, [isOpen]);

  const fetchArchives = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/archives?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle paginated response structure
      if (response.data && response.data.success) {
        if (response.data.data && response.data.data.data) {
          // Laravel paginated response structure
          setArchives(response.data.data.data || []);
          setTotalArchives(response.data.data.total || 0);
          setLastPage(response.data.data.last_page || 1);
          setCurrentPage(response.data.data.current_page || 1);
        } else if (Array.isArray(response.data.data)) {
          // Simple array response
          setArchives(response.data.data);
          setTotalArchives(response.data.data.length);
          setLastPage(1);
        } else {
          console.warn('Unexpected API response structure:', response.data);
          setError('Unexpected data format received from server');
          setArchives([]);
        }
      } else {
        setError(response.data?.message || 'Failed to fetch archives');
        setArchives([]);
      }

    } catch (err) {
      console.error('Error fetching archives:', err);
      setError(err.response?.data?.message || 'Error fetching archived records');
      setArchives([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshArchives = () => {
    fetchArchives(currentPage);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchArchives(page);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const restoreArchive = async (archiveId) => {
    if (window.confirm('Are you sure you want to restore this record? This will move it back to the original table.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:8000/api/archives/${archiveId}/restore`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          alert('Record restored successfully');
          fetchArchives(currentPage); // Refresh the current page
        } else {
          alert(response.data.message || 'Failed to restore record');
        }
      } catch (err) {
        console.error('Error restoring archive:', err);
        alert(err.response?.data?.message || 'Error restoring record');
      }
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(18);
      doc.text('Archived Records Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${formatDate(new Date())}`, 14, 30);

      autoTable(doc, {
        startY: 40,
        head: [['Archive ID', 'Table', 'Medical Staff/Patient', 'Archived By', 'Archived Date']],
        body: archives.map(archive => [
          archive.archive_id || 'N/A',
          archive.archived_from_table || 'N/A',
          archive.archived_data?.first_name && archive.archived_data?.last_name 
            ? `${archive.archived_data.first_name} ${archive.archived_data.last_name}`
            : archive.archived_data?.name || 'N/A',
          archive.first_name && archive.last_name 
            ? `${archive.first_name} ${archive.last_name}`
            : 'System',
          archive.archived_date ? formatDate(archive.archived_date) : 'N/A'
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [57, 88, 134],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 255]
        }
      });

      doc.save(`archived-records-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF');
    }
  };

  // Safely filter archives for search functionality
  const filteredArchives = Array.isArray(archives) 
    ? archives.filter(archive => {
        if (!archive) return false;
        
        const searchLower = searchTerm.toLowerCase();
        return (
          archive.archive_id?.toString().includes(searchTerm) ||
          archive.archived_from_table?.toLowerCase().includes(searchLower) ||
          archive.archived_data?.first_name?.toLowerCase().includes(searchLower) ||
          archive.archived_data?.last_name?.toLowerCase().includes(searchLower) ||
          archive.archived_data?.email?.toLowerCase().includes(searchLower) ||
          archive.archived_data?.name?.toLowerCase().includes(searchLower) ||
          archive.first_name?.toLowerCase().includes(searchLower) ||
          archive.last_name?.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Local pagination for search results
  const indexOfLastArchive = currentPage * archivesPerPage;
  const indexOfFirstArchive = indexOfLastArchive - archivesPerPage;
  const currentArchives = searchTerm ? filteredArchives.slice(indexOfFirstArchive, indexOfLastArchive) : archives;
  const totalPages = searchTerm ? Math.ceil(filteredArchives.length / archivesPerPage) : lastPage;

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    
    if (end === totalPages) {
      start = Math.max(1, end - 2);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <FaArchive />
            Archived Records
          </h2>
          <button 
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search archives..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = '#395886'}
              onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
            />
          </div>
          
          <div style={styles.actionButtons}>
            <button 
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={refreshArchives}
              disabled={loading}
            >
              <FaSync />
              Refresh
            </button>
            <button 
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={generatePDF}
              disabled={archives.length === 0}
            >
              <FaFilePdf />
              Export PDF
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <FaExclamationTriangle style={{ marginRight: '10px' }} />
            {error}
          </div>
        )}

        {/* Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Archive ID</th>
                  <th style={styles.th}>Table</th>
                  <th style={styles.th}>Medical Staff/Patient</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Archived By</th>
                  <th style={styles.th}>Archived Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentArchives.map((archive) => (
                  <tr 
                    key={archive.archive_id}
                    style={styles.tr}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={styles.td}>#{archive.archive_id}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.archiveType,
                        ...(archive.archived_from_table === 'users' ? styles.typeUsers : styles.typePatients)
                      }}>
                        {archive.archived_from_table}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUser style={{ color: '#64748b' }} />
                        {archive.archived_data?.first_name} {archive.archived_data?.last_name}
                      </div>
                    </td>
                    <td style={styles.td}>{archive.archived_data?.email || 'N/A'}</td>
                    <td style={styles.td}>
                      {archive.first_name && archive.last_name 
                        ? `${archive.first_name} ${archive.last_name}`
                        : 'System'
                      }
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCalendarAlt style={{ color: '#64748b', fontSize: '12px' }} />
                        {formatDate(archive.archived_date)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button 
                        style={styles.restoreButton}
                        onClick={() => restoreArchive(archive.archive_id)}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
                      >
                        <FaRedo />
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
                {currentArchives.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" style={{ ...styles.td, textAlign: 'center', color: '#64748b' }}>
                      {archives.length === 0 ? 'No archived records found' : 'No matching records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {archives.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Showing {searchTerm ? indexOfFirstArchive + 1 : (currentPage - 1) * 20 + 1}-{Math.min(searchTerm ? indexOfLastArchive : currentPage * 20, searchTerm ? filteredArchives.length : totalArchives)} of {searchTerm ? filteredArchives.length : totalArchives} records
            </div>
            <div style={styles.paginationControls}>
              <button
                style={{ 
                  ...styles.paginationButton, 
                  ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) 
                }}
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft /><FaChevronLeft />
              </button>
              <button
                style={{ 
                  ...styles.paginationButton, 
                  ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) 
                }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              
              {getPaginationGroup().map(number => (
                <button
                  key={number}
                  style={{ 
                    ...styles.paginationButton, 
                    ...(number === currentPage ? styles.paginationButtonActive : {}) 
                  }}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              ))}
              
              <button
                style={{ 
                  ...styles.paginationButton, 
                  ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) 
                }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight />
              </button>
              <button
                style={{ 
                  ...styles.paginationButton, 
                  ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) 
                }}
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <FaChevronRight /><FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ArchiveListModal;