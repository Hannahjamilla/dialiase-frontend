import React, { useState } from 'react';
import { FaExclamationTriangle, FaCalendarTimes, FaSearch, FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const MissedSchedules = ({ missedSchedules, handleReschedule, formatDate, fetchDashboardData }) => {
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [notification, setNotification] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Color variables
  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightGreen: '#e6f0ef',
    lightBlue: '#f0f5ff',
    danger: '#e74c3c',
    warning: '#f39c12',
    gray: '#95a5a6',
    lightGray: '#ecf0f1',
    darkGray: '#7f8c8d'
  };

  // Filter missed schedules based on search term
  const filteredSchedules = missedSchedules.filter(schedule => {
    const fullName = `${schedule.first_name || ''} ${schedule.last_name || ''}`.toLowerCase();
    const hn = schedule.hospitalNumber ? schedule.hospitalNumber.toLowerCase() : '';
    return fullName.includes(searchTerm.toLowerCase()) || 
           hn.includes(searchTerm.toLowerCase());
  });

  // Toggle selection for a single patient
  const togglePatientSelection = (patientId) => {
    if (selectedPatients.includes(patientId)) {
      setSelectedPatients(selectedPatients.filter(id => id !== patientId));
    } else {
      setSelectedPatients([...selectedPatients, patientId]);
    }
  };

  // Toggle select all patients
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredSchedules.map(schedule => schedule.patientID));
    }
    setSelectAll(!selectAll);
  };

  // Open reason modal for a specific patient
  const openReasonModal = (patient) => {
    setCurrentPatient(patient);
    setShowReasonModal(true);
  };

  // Close reason modal
  const closeReasonModal = () => {
    setShowReasonModal(false);
    setCurrentPatient(null);
    setRescheduleReason('');
    setIsRescheduling(false);
  };

  // Handle rescheduling from reason modal
  const handleRescheduleFromModal = async () => {
    if (!currentPatient) return;
    
    setIsRescheduling(true);
    try {
      await handleReschedule(currentPatient.patientID);
      
      // Record the reason analysis
      if (rescheduleReason) {
        await axios.post(`${API_BASE_URL}/staff/analyze-missed-appointment`, 
          { 
            patient_id: currentPatient.patientID,
            staff_notes: rescheduleReason
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
      }
      
      setNotification({
        message: 'Patient has been rescheduled successfully',
        type: 'success'
      });
      
      // Refresh data
      await fetchDashboardData();
      closeReasonModal();
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to reschedule appointment",
        type: 'error'
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <>
      {/* Compact Summary View */}
      <div 
        style={{
          backgroundColor: colors.white,
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          overflow: 'hidden',
          cursor: 'pointer',
          marginTop: '30px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }
        }}
        onClick={() => setShowModal(true)}
      >
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#fef3f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaExclamationTriangle color={colors.danger} size={18} />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: colors.primary
              }}>
                Missed Appointments
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: colors.gray
              }}>
                {missedSchedules.length} patients missed their appointments
              </p>
            </div>
          </div>
          <div style={{
            backgroundColor: '#fef3f2',
            color: colors.danger,
            fontSize: '12px',
            fontWeight: '500',
            padding: '6px 10px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <FaCalendarTimes size={12} />
            Assess
          </div>
        </div>
      </div>

      {/* Main Modal View */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.primary,
              color: colors.white
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaExclamationTriangle color={colors.white} size={18} /> 
                <span>Missed Appointments ({missedSchedules.length})</span>
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedPatients([]);
                  setSelectAll(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.white,
                  cursor: 'pointer',
                  fontSize: '18px',
                  opacity: 0.8,
                  ':hover': {
                    opacity: 1
                  }
                }}
              >
                &times;
              </button>
            </div>
            
            {/* Search and Actions */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: colors.lightBlue,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                position: 'relative',
                flex: 1,
                minWidth: '250px',
                maxWidth: '400px'
              }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.gray,
                  fontSize: '14px'
                }} />
                <input 
                  type="text" 
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.secondary}`,
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border 0.2s, box-shadow 0.2s',
                    backgroundColor: colors.white,
                    ':focus': {
                      borderColor: colors.primary,
                      boxShadow: `0 0 0 2px ${colors.secondary}20`
                    }
                  }}
                  placeholder="Search patients by name or HN..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: selectedPatients.length > 0 ? `${colors.primary}10` : 'transparent',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      accentColor: colors.primary
                    }}
                  />
                  <span style={{ 
                    fontSize: '14px', 
                    color: colors.primary,
                    fontWeight: '500'
                  }}>
                    Select All
                  </span>
                </div>
                <button
                  onClick={() => {
                    selectedPatients.forEach(patientId => {
                      const patient = missedSchedules.find(p => p.patientID === patientId);
                      if (patient) openReasonModal(patient);
                    });
                  }}
                  disabled={selectedPatients.length === 0}
                  style={{
                    backgroundColor: selectedPatients.length > 0 ? colors.primary : colors.lightGray,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: selectedPatients.length > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    ':hover': {
                      backgroundColor: selectedPatients.length > 0 ? colors.secondary : colors.lightGray,
                      boxShadow: selectedPatients.length > 0 ? `0 2px 4px ${colors.secondary}40` : 'none'
                    }
                  }}
                >
                  Analyze Selected ({selectedPatients.length})
                </button>
              </div>
            </div>
            
            {/* Patient List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 0'
            }}>
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule, index) => {
                  const daysMissed = Math.floor((new Date() - new Date(schedule.appointment_date)) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={index}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s',
                        backgroundColor: selectedPatients.includes(schedule.patientID) ? `${colors.secondary}10` : colors.white,
                        ':hover': {
                          backgroundColor: selectedPatients.includes(schedule.patientID) ? `${colors.secondary}15` : colors.lightBlue
                        }
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        flex: 1,
                        gap: '12px'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedPatients.includes(schedule.patientID)}
                          onChange={() => togglePatientSelection(schedule.patientID)}
                          style={{
                            marginRight: '4px',
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px',
                            accentColor: colors.primary
                          }}
                        />
                        <div style={{ 
                          flex: 1,
                          minWidth: 0 // Prevent flex item from overflowing
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              fontWeight: '600',
                              color: colors.primary,
                              fontSize: '15px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {schedule.first_name} {schedule.last_name}
                            </span>
                            <span style={{
                              backgroundColor: '#fef3f2',
                              color: colors.danger,
                              fontSize: '12px',
                              fontWeight: '500',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0
                            }}>
                              <FaCalendarTimes size={12} />
                              Missed {daysMissed} day{daysMissed !== 1 ? 's' : ''} ago
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: colors.gray,
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ whiteSpace: 'nowrap' }}>
                              HN: {schedule.hospitalNumber || 'N/A'}
                            </span>
                            <span style={{ whiteSpace: 'nowrap' }}>
                              Scheduled: {formatDate(schedule.appointment_date)}
                            </span>
                          </div>
                          {schedule.missed_reason && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              backgroundColor: colors.lightGray,
                              borderRadius: '6px',
                              fontSize: '13px',
                              color: colors.darkGray,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              <strong>Patient's Reason:</strong> {schedule.missed_reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px',
                        flexShrink: 0,
                        marginLeft: '12px'
                      }}>
                        <button
                          onClick={() => openReasonModal(schedule)}
                          style={{
                            backgroundColor: colors.warning,
                            color: colors.white,
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s',
                            ':hover': {
                              backgroundColor: '#e67e22',
                              boxShadow: `0 2px 4px ${colors.warning}40`
                            }
                          }}
                        >
                          Check
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: colors.lightGray,
                    fontSize: '32px',
                    marginBottom: '12px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <FaExclamationTriangle />
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: colors.primary,
                    marginBottom: '8px'
                  }}>
                    {searchTerm ? 'No matching patients found' : 'No Missed Appointments'}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: colors.gray,
                    margin: 0
                  }}>
                    {searchTerm 
                      ? 'Try a different search term' 
                      : 'All patients have attended their scheduled appointments'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reason Analysis Modal */}
      {showReasonModal && currentPatient && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '90%',
            maxWidth: '600px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaExclamationTriangle color={colors.warning} />
              Missed Appointment Analysis
            </h3>
            
            <div style={{ 
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: colors.lightBlue,
              borderRadius: '8px',
              borderLeft: `4px solid ${colors.warning}`
            }}>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontWeight: '600', 
                color: colors.primary,
                fontSize: '15px'
              }}>
                {currentPatient.first_name} {currentPatient.last_name}
              </p>
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <span style={{ 
                  fontSize: '13px',
                  color: colors.darkGray,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <strong>HN:</strong> {currentPatient.hospitalNumber || 'N/A'}
                </span>
                <span style={{ 
                  fontSize: '13px',
                  color: colors.darkGray,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FaCalendarAlt size={12} />
                  <strong>Missed:</strong> {formatDate(currentPatient.appointment_date)}
                </span>
              </div>
            </div>
            
            <div style={{ 
              marginBottom: '16px',
              backgroundColor: colors.lightGray,
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderBottom: `1px solid ${colors.secondary}20`
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '500',
                  color: colors.primary,
                  fontSize: '14px'
                }}>
                  Patient's Reason for Missing:
                </label>
              </div>
              <div style={{
                padding: '12px',
                fontSize: '14px',
                color: colors.darkGray,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {currentPatient.missed_reason || 'No reason provided by patient'}
              </div>
            </div>
            
            <div style={{ 
              marginBottom: '16px',
              backgroundColor: colors.white,
              borderRadius: '8px',
              border: `1px solid ${colors.lightGray}`,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderBottom: `1px solid ${colors.secondary}20`
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: '500',
                  color: colors.primary,
                  fontSize: '14px'
                }}>
                  Staff Assessment Notes:
                </label>
              </div>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  minHeight: '100px',
                  resize: 'vertical',
                  fontSize: '14px',
                  color: colors.darkGray,
                  border: 'none',
                  outline: 'none',
                  ':focus': {
                    outline: 'none'
                  }
                }}
                placeholder="Enter your assessment notes about this missed appointment..."
              />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '16px'
            }}>
              <button
                onClick={closeReasonModal}
                style={{
                  backgroundColor: 'transparent',
                  color: colors.gray,
                  border: `1px solid ${colors.gray}`,
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: colors.lightGray
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleFromModal}
                disabled={isRescheduling}
                style={{
                  backgroundColor: isRescheduling ? colors.gray : colors.green,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isRescheduling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: isRescheduling ? colors.gray : '#3a6563',
                    boxShadow: isRescheduling ? 'none' : `0 2px 4px ${colors.green}40`
                  }
                }}
              >
                {isRescheduling ? 'Processing...' : (
                  <>
                    <FaCalendarAlt size={14} /> Reschedule Appointment
                  </>
                )}
              </button>
            </div>
            
            <button 
              onClick={closeReasonModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: colors.gray,
                cursor: 'pointer',
                fontSize: '20px',
                ':hover': {
                  color: colors.primary
                }
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1002,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: notification.type === 'success' ? colors.green : colors.danger,
            color: colors.white,
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '300px',
            maxWidth: '350px'
          }}>
            <div style={{ flex: 1 }}>
              {notification.message}
            </div>
            <button 
              onClick={handleCloseNotification}
              style={{
                background: 'none',
                border: 'none',
                color: colors.white,
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '12px',
                opacity: 0.8,
                ':hover': {
                  opacity: 1
                }
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MissedSchedules;