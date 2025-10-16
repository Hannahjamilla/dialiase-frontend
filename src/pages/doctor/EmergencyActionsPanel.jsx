import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiChevronLeft, FiChevronRight, FiDroplet, FiX, FiFilter, FiSearch, FiHome, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { FaHospital, FaAmbulance } from 'react-icons/fa';

// Color constants
const colors = {
  primary: '#395886',
  secondary: '#638ECB',
  white: '#FFFFFF',
  green: '#477977',
  danger: '#dc3545',
  warning: '#ffc107',
  success: '#28a745',
  info: '#17a2b8',
  lightDanger: '#f8d7da',
  lightWarning: '#fff3cd',
  lightSuccess: '#d4edda'
};

// Situation status mapping
const situationStatusMap = {
  'AtHome': { label: 'At Home', color: colors.success, icon: <FiHome /> },
  'InEmergency': { label: 'In Emergency', color: colors.danger, icon: <FaAmbulance /> },
  'WaitToResponse': { label: 'Wait To Response', color: colors.warning, icon: <FiAlertTriangle /> }
};

const EmergencyActionsPanel = ({ 
  emergencyPatients, 
  isRecommending, 
  recommendEmergency, 
  recommendEmergencyToAll, 
  viewPatientDetails,
  formatNameBySurname,
  calculatePatientStats
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [situationFilter, setSituationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [cooldownTimers, setCooldownTimers] = useState({});
  const itemsPerPage = 4;

  // Filter and paginate emergency patients
  const filteredPatients = emergencyPatients.filter(patient => {
    const patientID = String(patient.patientID || '');
    const matchesSearch = searchTerm === '' || 
      formatNameBySurname(patient.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientID.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'sent' && patient.emergency_status === 'sent') ||
      (statusFilter === 'pending' && patient.emergency_status !== 'sent');
    
    const matchesSituation = situationFilter === 'all' || 
      patient.situationStatus === situationFilter;
    
    return matchesSearch && matchesStatus && matchesSituation;
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const currentItems = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, situationFilter]);

  // Handle cooldown timers for WaitToResponse patients
  useEffect(() => {
    const timers = {};
    
    filteredPatients.forEach(patient => {
      if (patient.situationStatus === 'WaitToResponse' && !cooldownTimers[patient.patientID]) {
        // Set a timer to re-enable the button after 10 seconds
        timers[patient.patientID] = setTimeout(() => {
          setCooldownTimers(prev => {
            const newTimers = {...prev};
            delete newTimers[patient.patientID];
            return newTimers;
          });
        }, 10000); // 10 seconds
      }
    });
    
    return () => {
      // Clean up timers on unmount
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [filteredPatients]);

  // Get button state based on patient situationStatus
  const getButtonState = (patient) => {
    if (patient.situationStatus === 'InEmergency') {
      return {
        label: 'In Emergency',
        disabled: true,
        backgroundColor: colors.info,
        icon: <FaAmbulance />
      };
    }
    
    if (patient.situationStatus === 'WaitToResponse') {
      const isOnCooldown = cooldownTimers[patient.patientID];
      
      if (isOnCooldown) {
        return {
          label: 'Wait 10s',
          disabled: true,
          backgroundColor: colors.warning,
          icon: <FiClock />
        };
      } else {
        return {
          label: 'Emergency',
          disabled: false,
          backgroundColor: colors.danger,
          icon: <FaHospital />
        };
      }
    }
    
    // Default for AtHome
    return {
      label: 'Emergency',
      disabled: false,
      backgroundColor: colors.danger,
      icon: <FaHospital />
    };
  };

  // Handle emergency button click
  const handleEmergencyClick = (patient) => {
    const buttonState = getButtonState(patient);
    
    if (!buttonState.disabled) {
      // Set cooldown timer for WaitToResponse patients
      if (patient.situationStatus === 'WaitToResponse') {
        setCooldownTimers(prev => ({
          ...prev,
          [patient.patientID]: true
        }));
      }
      
      recommendEmergency(patient.patientID);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderTop: '1px solid #eee',
        backgroundColor: colors.white
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 0.8rem',
              backgroundColor: currentPage === 1 ? '#f1f1f1' : colors.secondary,
              color: currentPage === 1 ? '#999' : colors.white,
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}
          >
            <FiChevronLeft /> Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
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
                key={`emergency-page-${pageNum}`}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '0.5rem 0.8rem',
                  backgroundColor: pageNum === currentPage ? colors.primary : colors.white,
                  color: pageNum === currentPage ? colors.white : colors.primary,
                  border: `1px solid ${pageNum === currentPage ? colors.primary : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 0.8rem',
              backgroundColor: currentPage === totalPages ? '#f1f1f1' : colors.secondary,
              color: currentPage === totalPages ? '#999' : colors.white,
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.85rem'
            }}
          >
            Next <FiChevronRight />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #eee'
    }}>
      <h4 style={{
        margin: '0 0 1rem',
        color: colors.primary,
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <FaHospital style={{ 
          marginRight: '0.5rem',
          color: colors.danger
        }} /> 
        Emergency Actions
      </h4>
      
      {/* Search and Filter Controls */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: showFilters ? '1rem' : '0'
        }}>
          <div style={{
            position: 'relative',
            flex: '1',
            marginRight: '1rem'
          }}>
            <FiSearch style={{
              position: 'absolute',
              left: '0.8rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#95a5a6'
            }} />
            <input
              type="text"
              placeholder="Search emergency patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '0.9rem',
                transition: 'border 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.secondary}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
            />
            {searchTerm && (
              <button 
                style={{
                  position: 'absolute',
                  right: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#95a5a6',
                  cursor: 'pointer'
                }}
                onClick={() => setSearchTerm('')}
              >
                <FiX />
              </button>
            )}
          </div>
          
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: showFilters ? colors.primary : '#f8f9fa',
              color: showFilters ? colors.white : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              padding: '0.5rem 0.8rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter style={{ marginRight: '0.5rem' }} /> 
            {showFilters ? 'Hide Filters' : 'Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem',
            padding: '0.8rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ 
                marginRight: '0.8rem',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: colors.primary,
                minWidth: '60px'
              }}>Status:</span>
              <div style={{ 
                display: 'flex',
                border: '1px solid #ddd',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <button 
                  style={{
                    padding: '0.4rem 0.8rem',
                    border: 'none',
                    backgroundColor: statusFilter === 'all' ? colors.primary : '#f8f9fa',
                    color: statusFilter === 'all' ? colors.white : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button 
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderLeft: '1px solid #ddd',
                    borderRight: '1px solid #ddd',
                    backgroundColor: statusFilter === 'pending' ? colors.primary : '#f8f9fa',
                    color: statusFilter === 'pending' ? colors.white : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  style={{
                    padding: '0.4rem 0.8rem',
                    border: 'none',
                    backgroundColor: statusFilter === 'sent' ? colors.primary : '#f8f9fa',
                    color: statusFilter === 'sent' ? colors.white : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setStatusFilter('sent')}
                >
                  Sent
                </button>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ 
                marginRight: '0.8rem',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: colors.primary,
                minWidth: '60px'
              }}>Situation:</span>
              <div style={{ 
                display: 'flex',
                border: '1px solid #ddd',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <button 
                  style={{
                    padding: '0.4rem 0.8rem',
                    border: 'none',
                    backgroundColor: situationFilter === 'all' ? colors.primary : '#f8f9fa',
                    color: situationFilter === 'all' ? colors.white : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setSituationFilter('all')}
                >
                  All
                </button>
                <button 
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderLeft: '1px solid #ddd',
                    backgroundColor: situationFilter === 'AtHome' ? colors.primary : '#f8f9fa',
                    color: situationFilter === 'AtHome' ? colors.white : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setSituationFilter('AtHome')}
                >
                  At Home
                </button>
                <button 
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderLeft: '1px solid #ddd',
                    backgroundColor: situationFilter === 'WaitToResponse' ? colors.primary : '#f8f9fa',
                    color: situationFilter === 'WaitToResponse' ? colors.white : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setSituationFilter('WaitToResponse')}
                >
                  Waiting
                </button>
                <button 
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderLeft: '1px solid #ddd',
                    backgroundColor: situationFilter === 'InEmergency' ? colors.primary : '#f8f9fa',
                    color: situationFilter === 'InEmergency' ? colors.white : '#333',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => setSituationFilter('InEmergency')}
                >
                  In Emergency
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {filteredPatients.length > 0 ? (
        <div>
          <div style={{ 
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#6c757d'
          }}>
            Recommend immediate hospital visits for patients with severe fluid retention:
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            {currentItems.map((patient, index) => {
              const formattedName = formatNameBySurname(patient.name);
              const stats = calculatePatientStats(patient);
              const situation = situationStatusMap[patient.situationStatus] || 
                               { label: 'Unknown', color: '#6c757d', icon: <FiAlertTriangle /> };
              
              const buttonState = getButtonState(patient);
              
              return (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8rem',
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : colors.white,
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  border: '1px solid #f1f1f1'
                }}>
                  <div style={{ fontSize: '0.85rem', flex: 1 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      marginBottom: '0.2rem',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      color: colors.primary
                    }}
                      onClick={() => viewPatientDetails(patient)}
                    >
                      {formattedName}
                    </div>
                    <div style={{ 
                      color: colors.danger, 
                      fontSize: '0.8rem', 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: '0.2rem'
                    }}>
                      <FiDroplet style={{ marginRight: '0.3rem' }} />
                      Retention: {stats.avgVolumeIn - stats.avgVolumeOut}mL
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: patient.emergency_status === 'sent' ? colors.success : colors.warning,
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.2rem'
                    }}>
                      Status: {patient.emergency_status === 'sent' ? 'Emergency recommended' : 'Needs attention'}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: situation.color,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {situation.icon}
                      <span style={{ marginLeft: '0.3rem' }}>{situation.label}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEmergencyClick(patient)}
                    disabled={isRecommending || buttonState.disabled}
                    style={{
                      padding: '0.4rem 0.7rem',
                      backgroundColor: buttonState.backgroundColor,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '4px',
                      cursor: (isRecommending || buttonState.disabled) ? 'default' : 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      opacity: (isRecommending || buttonState.disabled) ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!isRecommending && !buttonState.disabled) {
                        e.currentTarget.style.backgroundColor = buttonState.backgroundColor === colors.danger ? '#bb2d3b' : buttonState.backgroundColor;
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isRecommending && !buttonState.disabled) {
                        e.currentTarget.style.backgroundColor = buttonState.backgroundColor;
                      }
                    }}
                  >
                    {buttonState.icon}
                    <span style={{ marginLeft: '0.3rem' }}>{buttonState.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
          
          {renderPagination()}
          
          <button
            onClick={recommendEmergencyToAll}
            disabled={isRecommending || filteredPatients.filter(p => {
              const buttonState = getButtonState(p);
              return buttonState.disabled;
            }).length === filteredPatients.length}
            style={{
              width: '100%',
              padding: '0.7rem',
              backgroundColor: filteredPatients.filter(p => {
                const buttonState = getButtonState(p);
                return !buttonState.disabled;
              }).length > 0 ? colors.danger : '#ccc',
              color: colors.white,
              border: 'none',
              borderRadius: '6px',
              cursor: filteredPatients.filter(p => {
                const buttonState = getButtonState(p);
                return !buttonState.disabled;
              }).length > 0 ? 'pointer' : 'default',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: isRecommending ? 0.6 : 1,
              marginTop: '1rem'
            }}
            onMouseOver={(e) => {
              if (filteredPatients.filter(p => {
                const buttonState = getButtonState(p);
                return !buttonState.disabled;
              }).length > 0) {
                e.currentTarget.style.backgroundColor = '#bb2d3b';
              }
            }}
            onMouseOut={(e) => {
              if (filteredPatients.filter(p => {
                const buttonState = getButtonState(p);
                return !buttonState.disabled;
              }).length > 0) {
                e.currentTarget.style.backgroundColor = colors.danger;
              }
            }}
          >
            <FaHospital style={{ marginRight: '0.5rem' }} /> 
            Recommend Emergency to All Available Patients
          </button>
        </div>
      ) : (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
          color: colors.success,
          fontSize: '0.9rem'
        }}>
          <FiCheckCircle style={{ marginRight: '0.5rem' }} /> 
          No emergency cases match your filters
        </div>
      )}
    </div>
  );
};

export default EmergencyActionsPanel;