// TreatmentHistoryModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

const TreatmentHistoryModal = ({ onClose, patientId }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const convertToPHTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Date(date.getTime() + (8 * 60 * 60 * 1000));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = convertToPHTime(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/patient/treatments/recent', {
        params: {
          page: currentPage,
          search: searchTerm,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setTreatments(response.data.treatments);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, [currentPage, searchTerm, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchTreatments();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const groupTreatmentsByDate = () => {
    const grouped = {};
    
    treatments.forEach(treatment => {
      const phDate = convertToPHTime(treatment.treatmentDate);
      const dateKey = phDate.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(treatment);
    });
    
    return grouped;
  };

const getBalanceDetails = (treatment) => {
  const volumeIn = treatment.inSolution?.VolumeIn || 0;
  const volumeOut = treatment.outSolution?.VolumeOut || 0;
  const balance = volumeOut - volumeIn;
  
  let sign = '';
  let displayValue = '';
  let interpretation = '';
  let interpretationColor = '';
  
  if (balance > 0) {
    sign = '-'; // Negative sign when volume out is higher than volume in
    displayValue = `-${Math.abs(balance)}`;
    interpretation = 'Good: No fluid retention';
    interpretationColor = '#166534'; // Green color for good balance
  } else if (balance < 0) {
    sign = '+'; // Positive sign when volume out is lower than volume in
    displayValue = `+${Math.abs(balance)}`;
    interpretation = 'Warning: Fluid retention detected';
    interpretationColor = '#b91c1c'; // Red color for warning
  } else {
    displayValue = '0';
    interpretation = 'Good: Perfect balance';
    interpretationColor = '#166534'; // Green color for good balance
  }
  
  return {
    value: displayValue,
    rawValue: balance,
    isPositive: balance >= 0,
    interpretation,
    interpretationColor
  };
};

const calculateTotalBalance = (treatments) => {
  let totalPositive = 0;
  let totalNegative = 0;
  
  treatments.forEach(treatment => {
    const volumeIn = treatment.inSolution?.VolumeIn || 0;
    const volumeOut = treatment.outSolution?.VolumeOut || 0;
    const balance = volumeOut - volumeIn;
    
    if (balance > 0) {
      totalNegative += balance; // Add to negative total when volume out > volume in
    } else if (balance < 0) {
      totalPositive += Math.abs(balance); // Add to positive total when volume out < volume in
    }
  });
  
  // Calculate the difference between positive and negative totals
  const difference = totalPositive - totalNegative;
  
  if (difference > 0) {
    return `+${difference}`;
  } else if (difference < 0) {
    return `${difference}`; // This will automatically include the negative sign
  } else {
    return '0';
  }
};

  const hasInsufficientTreatments = (treatmentsForDate) => {
    return treatmentsForDate.length < 3;
  };

  const groupedTreatments = groupTreatmentsByDate();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{ 
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#2d3748'
          }}>Treatment History</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '4px',
              transition: 'all 0.2s',
              ':hover': {
                color: '#475569',
                backgroundColor: '#f1f5f9'
              }
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #eaeaea',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            position: 'relative',
            flex: 1,
            minWidth: '250px'
          }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} />
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                ':focus': {
                  outline: 'none',
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: showFilters ? '#e0f2fe' : '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              color: showFilters ? '#0369a1' : '#334155',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: showFilters ? '#dbeafe' : '#e2e8f0'
              }
            }}
          >
            <FiFilter /> Filters
          </button>
          <button
            onClick={resetFilters}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#334155',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s',
              ':hover': {
                backgroundColor: '#e2e8f0'
              }
            }}
          >
            Reset
          </button>
        </div>

        {/* Filter Dropdown */}
        {showFilters && (
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #eaeaea',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ minWidth: '220px', flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#475569',
                fontWeight: '500'
              }}>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  transition: 'all 0.2s',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }
                }}
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div style={{ minWidth: '220px', flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#475569',
                fontWeight: '500'
              }}>From Date</label>
              <div style={{
                position: 'relative'
              }}>
                <FiCalendar style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  zIndex: 1
                }} />
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                />
              </div>
            </div>
            <div style={{ minWidth: '220px', flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#475569',
                fontWeight: '500'
              }}>To Date</label>
              <div style={{
                position: 'relative'
              }}>
                <FiCalendar style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  zIndex: 1
                }} />
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                    ':focus': {
                      outline: 'none',
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                  }}
                />
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              marginLeft: 'auto',
              gap: '12px'
            }}>
              <button
                onClick={applyFilters}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#2563eb'
                  }
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : treatments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }}>📋</div>
              <h3 style={{ 
                margin: '0 0 8px 0',
                fontSize: '18px',
                color: '#334155'
              }}>No treatments found</h3>
              <p style={{ 
                margin: 0,
                color: '#64748b',
                fontSize: '14px'
              }}>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              padding: '24px'
            }}>
              {Object.keys(groupedTreatments).map(dateKey => (
                <div key={dateKey}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#e0f2fe',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      marginRight: '12px'
                    }}>
                      <FiCalendar style={{
                        marginRight: '8px',
                        color: '#0369a1'
                      }} />
                      <span style={{
                        color: '#0369a1',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        {convertToPHTime(dateKey).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {hasInsufficientTreatments(groupedTreatments[dateKey]) && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        marginLeft: 'auto'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                          <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                            stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{
                          color: '#92400e',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}>
                          Warning: Only {groupedTreatments[dateKey].length} treatments (should be 3)
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    overflowX: 'auto',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      minWidth: '800px'
                    }}>
                      <thead>
                        <tr style={{
                          backgroundColor: '#f8fafc',
                          textAlign: 'left',
                          borderBottom: '1px solid #e2e8f0'
                        }}>
                          <th style={{ 
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Volume In</th>
                          <th style={{ 
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>PD-Solution</th>
                          <th style={{ 
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Dwell</th>
                          <th style={{ 
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Volume Out</th>
                          <th style={{ 
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Balance</th>
                          <th style={{ 
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Status</th>
                          <th style={{ 
                            padding: '12px 16px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedTreatments[dateKey].map((treatment) => {
                          const balanceDetails = getBalanceDetails(treatment);
                          
                          return (
                            <tr key={treatment.Treatment_ID} style={{
                              borderBottom: '1px solid #e2e8f0',
                              transition: 'background-color 0.2s',
                              ':hover': {
                                backgroundColor: '#f8fafc'
                              },
                              ':last-child': {
                                borderBottom: 'none'
                              }
                            }}>
                              <td style={{ 
                                padding: '16px',
                                fontSize: '14px',
                                color: '#334155'
                              }}>{treatment.inSolution?.VolumeIn || 'N/A'} mL</td>
                              <td style={{ 
                                padding: '16px',
                                fontSize: '14px',
                                color: '#334155'
                              }}>{treatment.inSolution?.Dialysate || 'N/A'}%</td>
                              <td style={{ 
                                padding: '16px',
                                fontSize: '14px',
                                color: '#334155'
                              }}>{treatment.inSolution?.Dwell || 'N/A'}h</td>
                              <td style={{ 
                                padding: '16px',
                                fontSize: '14px',
                                color: '#334155'
                              }}>{treatment.outSolution?.VolumeOut || 'N/A'} mL</td>
                              <td style={{ 
  padding: '16px',
  fontSize: '14px',
  color: '#334155'
}}>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ fontWeight: '500' }}>
      {balanceDetails.value} mL
    </span>
    <span style={{
      fontSize: '12px',
      color: balanceDetails.interpretationColor,
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {balanceDetails.rawValue !== 0 && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
            stroke={balanceDetails.interpretationColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {balanceDetails.interpretation}
    </span>
  </div>
</td>
                              <td style={{ 
                                padding: '16px',
                                fontSize: '14px'
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  backgroundColor: treatment.TreatmentStatus.toLowerCase() === 'completed' ? '#dcfce7' : 
                                                treatment.TreatmentStatus.toLowerCase() === 'in progress' ? '#dbeafe' : 
                                                treatment.TreatmentStatus.toLowerCase() === 'scheduled' ? '#fef3c7' : '#fee2e2',
                                  color: treatment.TreatmentStatus.toLowerCase() === 'completed' ? '#166534' : 
                                         treatment.TreatmentStatus.toLowerCase() === 'in progress' ? '#1e40af' : 
                                         treatment.TreatmentStatus.toLowerCase() === 'scheduled' ? '#92400e' : '#991b1b'
                                }}>
                                  {treatment.TreatmentStatus}
                                </span>
                              </td>
                              <td style={{ 
                                padding: '16px',
                                fontSize: '14px',
                                color: '#475569'
                              }}>
                                {treatment.outSolution?.Notes || (
                                  <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{
                          backgroundColor: '#f8fafc',
                          fontWeight: '600'
                        }}>
                          <td colSpan="4" style={{ 
                            padding: '16px',
                            textAlign: 'right',
                            fontSize: '14px',
                            color: '#334155'
                          }}>Total Balance:</td>
                          <td style={{ 
                            padding: '16px',
                            fontSize: '14px',
                            color: '#334155'
                          }}>
                            {calculateTotalBalance(groupedTreatments[dateKey])} mL
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && treatments.length > 0 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #eaeaea',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}>
            <div>
              <span style={{ 
                color: '#475569',
                fontSize: '14px'
              }}>
                Showing page {currentPage} of {totalPages}
              </span>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 16px',
                  backgroundColor: currentPage === 1 ? '#f1f5f9' : '#3b82f6',
                  color: currentPage === 1 ? '#94a3b8' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  ':hover': currentPage !== 1 ? {
                    backgroundColor: '#2563eb'
                  } : {}
                }}
              >
                <FiChevronLeft /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 16px',
                  backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#3b82f6',
                  color: currentPage === totalPages ? '#94a3b8' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  ':hover': currentPage !== totalPages ? {
                    backgroundColor: '#2563eb'
                  } : {}
                }}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentHistoryModal;