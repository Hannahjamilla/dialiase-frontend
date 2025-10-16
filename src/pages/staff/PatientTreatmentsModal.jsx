import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaFilter, FaSearch, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { format, parseISO, isSameDay, isToday } from 'date-fns';

const PatientTreatmentsModal = ({ patient, onClose }) => {
  // State management
  const [treatments, setTreatments] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTreatments: 0,
    avgVolumeIn: 0,
    avgVolumeOut: 0,
    avgBalance: 0,
    lastTreatmentDate: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [groupedTreatments, setGroupedTreatments] = useState({});
  const [hasTreatmentToday, setHasTreatmentToday] = useState(false);

  // Format time for display
  const formatTime = (timeValue) => {
    if (!timeValue) return 'N/A';
    try {
      const time = new Date(timeValue);
      if (isNaN(time.getTime())) return 'N/A';
      
      return time.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Calculate balance with sign - FIXED: VolumeIn - VolumeOut
  const calculateBalance = (treatment) => {
    if (!treatment.VolumeIn || !treatment.VolumeOut) return null;
    const balance = treatment.VolumeIn - treatment.VolumeOut; // FIXED: Changed to VolumeIn - VolumeOut
    return balance;
  };

  // Format balance display - FIXED: Negative balance (good) = GREEN, Positive balance (fluid retention) = RED
  const formatBalance = (balance) => {
    if (balance === null) return 'N/A';
    const sign = balance >= 0 ? '+' : '-';
    const absBalance = Math.abs(balance);
    return (
      <span style={{ 
        color: balance <= 0 ? '#10B981' : '#EF4444', // FIXED: Negative balance (<=0) is GREEN, Positive (>0) is RED
        fontWeight: 500
      }}>
        {sign}{absBalance} ml
        {balance > 0 && ( // FIXED: Show fluid retention warning for POSITIVE balance
          <span style={{ 
            marginLeft: '8px',
            color: '#EF4444',
            fontSize: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            <FaExclamationTriangle style={{ marginRight: '4px' }} />
            Fluid retention
          </span>
        )}
      </span>
    );
  };

  // Group treatments by date and calculate daily totals
  const groupByDate = (treatments) => {
    const grouped = {};
    let todayTreatment = false;
    
    treatments.forEach(treatment => {
      const date = format(parseISO(treatment.TreatmentDate), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = {
          treatments: [],
          totalBalance: 0,
          treatmentCount: 0,
          completedCount: 0
        };
      }
      
      // Check if this treatment is from today
      if (isToday(parseISO(treatment.TreatmentDate))) {
        todayTreatment = true;
      }
      
      const balance = calculateBalance(treatment) || 0;
      grouped[date].treatments.push(treatment);
      grouped[date].totalBalance += balance;
      grouped[date].treatmentCount++;
      
      // Count completed treatments
      if (treatment.TreatmentStatus === 'Completed') {
        grouped[date].completedCount++;
      }
    });
    
    setHasTreatmentToday(todayTreatment);
    return grouped;
  };

  // Check if patient is following treatment schedule (3 treatments per day)
  const checkTreatmentCompliance = (groupedTreatments) => {
    const complianceIssues = [];
    
    Object.entries(groupedTreatments).forEach(([date, dayData]) => {
      if (dayData.completedCount < 3) {
        complianceIssues.push({
          date,
          expected: 3,
          actual: dayData.completedCount
        });
      }
    });
    
    return complianceIssues;
  };

  // Check if patient is in danger based on treatment patterns - FIXED: Now checks for positive balance (fluid retention)
  const checkDangerStatus = (groupedTreatments) => {
    let positiveBalanceDays = 0;
    let totalDays = 0;
    
    Object.values(groupedTreatments).forEach(dayData => {
      totalDays++;
      if (dayData.totalBalance > 0) { // FIXED: Now checking for POSITIVE balance (fluid retention)
        positiveBalanceDays++;
      }
    });
    
    // If more than 30% of days have positive fluid balance (fluid retention), consider patient at risk
    return (positiveBalanceDays / totalDays) > 0.3;
  };

  // Fetch treatments data
  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`/v1/staff-patient-treatments/${patient.userID}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          page: currentPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined
        }
      });
      
      if (response.data.success) {
        setTreatments({
          items: response.data.treatments,
          total: response.data.total
        });
        setTotalPages(response.data.lastPage);
        setGroupedTreatments(groupByDate(response.data.treatments));
      } else {
        throw new Error(response.data.message || 'Failed to fetch treatments');
      }
    } catch (err) {
      console.error('Error fetching treatments:', err);
      let errorMessage = 'Failed to load treatments. Please try again.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (err.response.status === 404) {
          errorMessage = 'Patient treatment records not found';
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTreatments({ items: [], total: 0 });
      setGroupedTreatments({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics data
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`/v1/staff-patient-treatments-stats/${patient.userID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        console.error('Failed to fetch stats:', response.data.message);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    if (patient?.userID) {
      fetchTreatments();
      fetchStats();
    }
  }, [patient, currentPage, searchTerm, statusFilter, dateFrom, dateTo]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Format date header
  const formatDateHeader = (dateString) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Render loading spinner
  const renderLoading = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0'
    }}>
      <div style={{
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderLeftColor: '#3b82f6',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
    </div>
  );

  // Render error message
  const renderError = () => (
    <div style={error.includes('No treatment records') ? {
      padding: '40px 0',
      textAlign: 'center',
      color: '#6b7280'
    } : {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      padding: '16px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px'
    }}>
      {error.includes('No treatment records') ? (
        <p>{error}</p>
      ) : (
        <>
          <div style={{ marginRight: '12px', color: '#dc2626' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div style={{ fontSize: '0.875rem' }}>{error}</div>
        </>
      )}
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div style={{
      padding: '40px 0',
      textAlign: 'center',
      color: '#6b7280'
    }}>
      <p>No treatment records found for this patient</p>
    </div>
  );

  // Render today's treatment reminder
  const renderTodayTreatmentReminder = () => (
    <div style={{
      backgroundColor: '#FFFBEB',
      border: '1px solid #F59E0B',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'flex-start'
    }}>
      <div style={{
        color: '#D97706',
        marginRight: '12px',
        fontSize: '1.25rem'
      }}>
        <FaExclamationTriangle />
      </div>
      <div>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '1rem',
          color: '#92400E'
        }}>
          Today's Treatment Status
        </h4>
        <p style={{
          margin: '0',
          fontSize: '0.875rem',
          color: '#92400E'
        }}>
          This patient has not yet undergone treatment for today.
        </p>
      </div>
    </div>
  );

  // Render compliance warning
  const renderComplianceWarning = (complianceIssues) => (
    <div style={{
      backgroundColor: '#FFFBEB',
      border: '1px solid #F59E0B',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'flex-start'
    }}>
      <div style={{
        color: '#D97706',
        marginRight: '12px',
        fontSize: '1.25rem'
      }}>
        <FaExclamationTriangle />
      </div>
      <div>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '1rem',
          color: '#92400E'
        }}>
          Treatment Compliance Issue
        </h4>
        <p style={{
          margin: '0',
          fontSize: '0.875rem',
          color: '#92400E'
        }}>
          This patient is not following the prescribed treatment schedule. Expected 3 treatments per day, but found:
        </p>
        <ul style={{
          margin: '8px 0 0 0',
          paddingLeft: '20px',
          fontSize: '0.875rem',
          color: '#92400E'
        }}>
          {complianceIssues.slice(0, 3).map((issue, index) => (
            <li key={index}>
              {formatDateHeader(issue.date)}: {issue.actual} of {issue.expected} treatments
            </li>
          ))}
          {complianceIssues.length > 3 && (
            <li>...and {complianceIssues.length - 3} more days with incomplete treatments</li>
          )}
        </ul>
      </div>
    </div>
  );

  // Render danger warning
  const renderDangerWarning = () => (
    <div style={{
      backgroundColor: '#FEF2F2',
      border: '1px solid #EF4444',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'flex-start'
    }}>
      <div style={{
        color: '#DC2626',
        marginRight: '12px',
        fontSize: '1.25rem'
      }}>
        <FaExclamationTriangle />
      </div>
      <div>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '1rem',
          color: '#B91C1C'
        }}>
          Patient At Risk
        </h4>
        <p style={{
          margin: '0',
          fontSize: '0.875rem',
          color: '#B91C1C'
        }}>
          This patient shows signs of fluid retention risk based on treatment history. Please review their treatment plan.
        </p>
      </div>
    </div>
  );

  // Render treatments table
  const renderTreatmentsTable = () => {
    const complianceIssues = checkTreatmentCompliance(groupedTreatments);
    const isInDanger = checkDangerStatus(groupedTreatments);
    
    return (
      <>
        {/* Today's Treatment Reminder */}
        {!hasTreatmentToday && renderTodayTreatmentReminder()}
        
        {/* Compliance and Danger Warnings */}
        {complianceIssues.length > 0 && renderComplianceWarning(complianceIssues)}
        {isInDanger && renderDangerWarning()}
        
        <div style={{
          overflowX: 'auto',
          marginBottom: '24px'
        }}>
          {Object.entries(groupedTreatments).map(([date, dayData]) => (
            <div key={date} style={{ marginBottom: '32px' }}>
              <div style={{
                backgroundColor: '#F3F4F6',
                padding: '12px 16px',
                borderRadius: '6px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#111827'
                  }}>
                    {formatDateHeader(date)}
                  </h4>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6B7280',
                    marginTop: '4px'
                  }}>
                    Daily Balance: {formatBalance(dayData.totalBalance)}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: dayData.completedCount >= 3 ? '#10B981' : '#EF4444',
                  backgroundColor: dayData.completedCount >= 3 ? '#C6F6D5' : '#FED7D7',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontWeight: 500
                }}>
                  {dayData.completedCount} of 3 treatments completed
                </div>
              </div>
              
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
                marginBottom: '24px'
              }}>
                <thead style={{
                  backgroundColor: '#f9fafb',
                  textAlign: 'left'
                }}>
                  <tr>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Status</th>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Time In</th>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Time Out</th>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Volume In</th>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Volume Out</th>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Balance</th>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Color</th>
                    <th style={{
                      padding: '12px 16px',
                      fontWeight: 500,
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {dayData.treatments.map((treatment) => {
                    const balance = calculateBalance(treatment);
                    return (
                      <tr key={treatment.id} style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: '#f9fafb'
                        }
                      }}>
                        <td style={{
                          padding: '12px 16px',
                          color: '#4b5563',
                          verticalAlign: 'top'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            backgroundColor: treatment.TreatmentStatus === 'Completed' 
                              ? '#C6F6D5' 
                              : treatment.TreatmentStatus === 'Scheduled'
                                ? '#BEE3F8'
                                : '#FED7D7',
                            color: treatment.TreatmentStatus === 'Completed' 
                              ? '#276749'
                              : treatment.TreatmentStatus === 'Scheduled'
                                ? '#2C5282'
                                : '#C53030',
                          }}>
                            {treatment.TreatmentStatus}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#4b5563',
                          verticalAlign: 'top'
                        }}>
                          <div>Start: {formatTime(treatment.InStarted)}</div>
                          <div>Finish: {formatTime(treatment.InFinished)}</div>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#4b5563',
                          verticalAlign: 'top'
                        }}>
                          <div>Start: {formatTime(treatment.DrainStarted)}</div>
                          <div>Finish: {formatTime(treatment.DrainFinished)}</div>
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#4b5563',
                          verticalAlign: 'top'
                        }}>{treatment.VolumeIn || 'N/A'} ml</td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#4b5563',
                          verticalAlign: 'top'
                        }}>{treatment.VolumeOut || 'N/A'} ml</td>
                        <td style={{
                          padding: '12px 16px',
                          verticalAlign: 'top'
                        }}>
                          {formatBalance(balance)}
                        </td>
                        <td style={{
                          padding: '12px 16px',
                          color: '#4b5563',
                          verticalAlign: 'top'
                        }}>{treatment.Color || 'N/A'}</td>
                        <td style={{ 
                          padding: '12px 16px',
                          color: '#4b5563',
                          verticalAlign: 'top',
                          maxWidth: '200px', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {treatment.Notes || 'None'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            Showing <span style={{ fontWeight: 600 }}>{(currentPage - 1) * 5 + 1}</span> to{' '}
            <span style={{ fontWeight: 600 }}>{Math.min(currentPage * 5, treatments.total)}</span> of{' '}
            <span style={{ fontWeight: 600 }}>{treatments.total}</span> results
          </div>
          <div style={{
            display: 'flex'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                color: '#4b5563',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s',
                ...(currentPage === 1 && { opacity: '0.5', cursor: 'not-allowed' }),
                borderTopLeftRadius: '6px',
                borderBottomLeftRadius: '6px',
              }}
            >
              <FaChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = currentPage <= 3 
                ? i + 1 
                : currentPage >= totalPages - 2 
                  ? totalPages - 4 + i 
                  : currentPage - 2 + i;
              return pageNum > 0 && pageNum <= totalPages ? (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    color: '#4b5563',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s, border-color 0.2s',
                    ...(currentPage === pageNum && { 
                      backgroundColor: '#3b82f6',
                      borderColor: '#3b82f6',
                      color: 'white'
                    }),
                    borderLeft: 'none',
                    borderRight: 'none',
                  }}
                >
                  {pageNum}
                </button>
              ) : null;
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                color: '#4b5563',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, border-color 0.2s',
                ...(currentPage === totalPages && { opacity: '0.5', cursor: 'not-allowed' }),
                borderTopRightRadius: '6px',
                borderBottomRightRadius: '6px',
              }}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      </>
    );
  };

  // Main render
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '1400px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: 0,
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span>Treatment Records</span>
              <span style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                {patient.first_name} {patient.last_name}
              </span>
            </h3>
            <p style={{
              margin: '4px 0 0',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              Detailed view of all dialysis treatments
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#f1f5f9'
              }
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '4px'
                }}></div>
                Total Treatments
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#111827'
              }}>{stats.totalTreatments}</div>
            </div>
            <div
              style={{
                backgroundColor: '#F0FFF4',
                border: '1px solid #C6F6D5',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >

              <div style={{
                fontSize: '0.875rem',
                color: '#276749',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#10B981',
                  borderRadius: '4px'
                }}></div>
                Avg. Volume In
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#276749'
              }}>{stats.avgVolumeIn} ml</div>
            </div>
            <div style={{
              backgroundColor: '#EBF8FF',
              border: "1px solid '#BEE3F8",
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#2C5282',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '4px'
                }}></div>
                Avg. Balance
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#2C5282'
              }}>{stats.avgBalance} ml</div>
            </div>
            <div style={{
              backgroundColor: '#FFF7ED',
              border: "1px solid '#FED7AA",
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
              }
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#9C4221',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#F59E0B',
                  borderRadius: '4px'
                }}></div>
                Last Treatment
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#9C4221'
              }}>
                {stats.lastTreatmentDate ? formatDate(stats.lastTreatmentDate) : 'N/A'}
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  placeholder="Search treatments by dialysate, notes, color..."
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    '&:focus': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#4b5563',
                  transition: 'background-color 0.2s, border-color 0.2s',
                  '&:hover': {
                    backgroundColor: '#f9fafb',
                    borderColor: '#9ca3af'
                  }
                }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter style={{ marginRight: '8px' }} />
                Filters
              </button>
              <button 
                type="submit" 
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  '&:hover': {
                    backgroundColor: '#2563eb'
                  }
                }}
              >
                <FaSearch size={14} />
                Search
              </button>
            </div>

            {showFilters && (
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '12px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      color: '#4b5563',
                      fontWeight: 500
                    }}>Status</label>
                    <select
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        '&:focus': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }
                      }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      color: '#4b5563',
                      fontWeight: 500
                    }}>From Date</label>
                    <input
                      type="date"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        '&:focus': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }
                      }}
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      color: '#4b5563',
                      fontWeight: 500
                    }}>To Date</label>
                    <input
                      type="date"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        '&:focus': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }
                      }}
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button 
                    type="button"
                    style={{
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      '&:hover': {
                        color: '#2563eb'
                      }
                    }} 
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </button>
                  <button 
                    type="button"
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: '#e5e7eb'
                      }
                    }}
                    onClick={() => setShowFilters(false)}
                  >
                    Hide Filters
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Content */}
          {loading ? renderLoading() : 
           error ? renderError() : 
           treatments.items.length === 0 ? renderEmptyState() : 
           renderTreatmentsTable()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Showing {treatments.items.length} of {treatments.total} treatments
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTreatmentsModal;