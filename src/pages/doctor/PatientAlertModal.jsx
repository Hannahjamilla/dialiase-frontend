import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiX, FiAlertTriangle, FiDroplet, FiClipboard, FiUser, FiSearch, FiFilter, FiCheckSquare, FiSquare, FiEdit2, FiMessageSquare, FiPlus } from 'react-icons/fi';

const colors = {
  primary: '#395886',
  secondary: '#638ECB',
  white: '#FFFFFF',
  green: '#477977',
  danger: '#dc3545',
  warning: '#ffc107',
  success: '#28a745',
  info: '#17a2b8',
  lightGray: '#f8f9fa',
  border: '#dee2e6',
  textMuted: '#6c757d'
};

const PatientAlertModal = ({ patient, onClose, onAlertSent }) => {
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const [customMessages, setCustomMessages] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [sendStatus, setSendStatus] = useState({ type: '', message: '' });
  const [showCustomAlertForm, setShowCustomAlertForm] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');

  const alertOptions = [
    {
      type: 'fluid_retention',
      title: 'Fluid Retention Alert',
      icon: <FiDroplet />,
      message: 'Please monitor your fluid intake and output carefully. You appear to be retaining fluid which can be dangerous. Contact your healthcare provider if you experience swelling, shortness of breath, or rapid weight gain.',
      color: colors.danger,
      category: 'health'
    },
    {
      type: 'abnormal_color',
      title: 'Abnormal Drain Color',
      icon: <FiAlertTriangle />,
      message: 'Your dialysis fluid appears to have an unusual color. This could indicate an infection or other complication. Please contact your healthcare team immediately for assessment.',
      color: colors.warning,
      category: 'health'
    },
    {
      type: 'compliance',
      title: 'Treatment Compliance',
      icon: <FiClipboard />,
      message: 'It appears you may have missed some prescribed dialysis treatments. Consistent treatment is essential for your health. Please adhere to your treatment schedule.',
      color: colors.info,
      category: 'treatment'
    },
    {
      type: 'general',
      title: 'General Reminder',
      icon: <FiUser />,
      message: 'This is a reminder to follow your treatment plan carefully and report any unusual symptoms to your healthcare team.',
      color: colors.primary,
      category: 'general'
    },
    {
      type: 'medication',
      title: 'Medication Reminder',
      icon: <FiClipboard />,
      message: 'Please ensure you are taking your medications as prescribed. If you have any questions about your medications, contact your healthcare provider.',
      color: colors.success,
      category: 'treatment'
    },
    {
      type: 'appointment',
      title: 'Upcoming Appointment',
      icon: <FiUser />,
      message: 'This is a reminder about your upcoming appointment. Please arrive 15 minutes early and bring your insurance information and medication list.',
      color: colors.info,
      category: 'general'
    },
    {
      type: 'diet',
      title: 'Dietary Guidance',
      icon: <FiDroplet />,
      message: 'Please remember to follow your prescribed renal diet, limiting sodium, potassium, and phosphorus as directed by your dietitian.',
      color: colors.green,
      category: 'health'
    },
    {
      type: 'vital_signs',
      title: 'Abnormal Vital Signs',
      icon: <FiAlertTriangle />,
      message: 'Your recent vital signs readings appear to be outside the normal range. Please contact your healthcare team for further assessment.',
      color: colors.warning,
      category: 'health'
    },
    {
      type: 'lab_results',
      title: 'Lab Results Review',
      icon: <FiClipboard />,
      message: 'Your recent lab results require attention. Please schedule a follow-up with your healthcare provider to discuss these results.',
      color: colors.info,
      category: 'treatment'
    }
  ];

  // Filter alerts based on search query and category
  useEffect(() => {
    let results = alertOptions;
    
    // Apply category filter
    if (filterCategory !== 'all') {
      results = results.filter(alert => alert.category === filterCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(alert => 
        alert.title.toLowerCase().includes(query) || 
        alert.message.toLowerCase().includes(query)
      );
    }
    
    setFilteredAlerts(results);
  }, [searchQuery, filterCategory]);

  const toggleAlertSelection = (alertType) => {
    if (selectedAlerts.includes(alertType)) {
      setSelectedAlerts(selectedAlerts.filter(type => type !== alertType));
    } else {
      setSelectedAlerts([...selectedAlerts, alertType]);
    }
  };

  const selectAllAlerts = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
      setCustomMessages({});
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert.type));
    }
  };

  const updateCustomMessage = (alertType, message) => {
    setCustomMessages({
      ...customMessages,
      [alertType]: message
    });
  };

  const addCustomAlert = () => {
    if (!customAlertMessage.trim()) {
      setSendStatus({
        type: 'error',
        message: 'Please provide a message for your custom alert.'
      });
      return;
    }

    const customAlertType = 'custom';
    
    // Add custom alert to selected alerts
    setSelectedAlerts([...selectedAlerts, customAlertType]);
    
    // Store custom alert data
    setCustomMessages({
      ...customMessages,
      [customAlertType]: customAlertMessage
    });

    // Reset form
    setCustomAlertMessage('');
    setShowCustomAlertForm(false);
    
    setSendStatus({
      type: 'success',
      message: 'Custom alert added successfully!'
    });
  };

  const sendAlerts = async () => {
    if (selectedAlerts.length === 0) return;
    
    setIsSending(true);
    setSendStatus({ type: '', message: '' });
    
    try {
      // Send each alert individually
      const sentAlerts = [];
      
      for (const alertType of selectedAlerts) {
        let finalMessage;
        
        // Check if it's a custom alert
        if (alertType === 'custom') {
          finalMessage = customMessages['custom'] || '';
        } else {
          const alertData = alertOptions.find(alert => alert.type === alertType);
          const customMessage = customMessages[alertType] || '';
          finalMessage = customMessage 
            ? `${alertData.message}\n\nPersonal note: ${customMessage}`
            : alertData.message;
        }

        const response = await axios.post('/doctor/send-patient-alert', {
          patient_id: patient.patientID,
          alert_type: alertType,
          message: finalMessage
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          sentAlerts.push(alertType === 'custom' ? 'Custom Alert' : alertOptions.find(a => a.type === alertType)?.title);
        }
      }

      if (sentAlerts.length > 0) {
        setSendStatus({
          type: 'success',
          message: `Successfully sent ${sentAlerts.length} ${sentAlerts.length === 1 ? 'alert' : 'alerts'}!`
        });
        
        // Clear selection after successful send
        setSelectedAlerts([]);
        setCustomMessages({});
        
        if (onAlertSent) {
          setTimeout(() => {
            onAlertSent();
            onClose();
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        setSendStatus({
          type: 'error',
          message: 'Failed to send alerts. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error sending alerts:', error);
      setSendStatus({
        type: 'error',
        message: `Error: ${error.response?.data?.message || error.message || 'Failed to send alerts'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(alertOptions.map(alert => alert.category))];

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
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: colors.primary }}>
            Send Alerts to Patient
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#95a5a6'
            }}
            disabled={isSending}
          >
            <FiX />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Status Message */}
          {sendStatus.message && (
            <div style={{
              padding: '1rem',
              backgroundColor: sendStatus.type === 'success' ? '#d4edda' : '#f8d7da',
              color: sendStatus.type === 'success' ? '#155724' : '#721c24',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: `1px solid ${sendStatus.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {sendStatus.message}
            </div>
          )}
          
          <div style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: colors.lightGray,
            borderRadius: '8px'
          }}>
            <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Patient:</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: colors.primary,
                color: colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                fontWeight: '600'
              }}>
                {patient.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: '500' }}>{patient.name}</div>
                <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                  ID: {patient.patientID} • {patient.hospitalNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Custom Alert Creation Form */}
          {showCustomAlertForm && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1.5rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              backgroundColor: `${colors.lightGray}`
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: colors.primary }}>
                <FiEdit2 style={{ marginRight: '0.5rem' }} />
                Create Personal-care Message
              </h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Alert Message *
                </label>
                <textarea
                  value={customAlertMessage}
                  onChange={(e) => setCustomAlertMessage(e.target.value)}
                  placeholder="Type your custom alert message here..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '5px',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                  disabled={isSending}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowCustomAlertForm(false)}
                  style={{
                    padding: '0.7rem 1.5rem',
                    backgroundColor: colors.lightGray,
                    color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button
                  onClick={addCustomAlert}
                  style={{
                    padding: '0.7rem 1.5rem',
                    backgroundColor: colors.success,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  disabled={isSending}
                >
                  <FiPlus /> Add Custom Alert
                </button>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                <FiSearch style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textMuted
                }} />
                <input
                  type="text"
                  placeholder="Search alerts by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem 0.6rem 2.5rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '5px',
                    fontSize: '0.9rem'
                  }}
                  disabled={isSending}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiFilter style={{ color: colors.textMuted }} />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    padding: '0.6rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '5px',
                    fontSize: '0.9rem',
                    backgroundColor: colors.white,
                    minWidth: '120px'
                  }}
                  disabled={isSending}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {filteredAlerts.length > 0 && (
                <button
                  onClick={selectAllAlerts}
                  style={{
                    padding: '0.6rem 1rem',
                    backgroundColor: colors.lightGray,
                    color: colors.primary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '5px',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    opacity: isSending ? 0.6 : 1
                  }}
                  disabled={isSending}
                >
                  {selectedAlerts.length === filteredAlerts.length ? (
                    <><FiCheckSquare /> Deselect All</>
                  ) : (
                    <><FiSquare /> Select All</>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setShowCustomAlertForm(!showCustomAlertForm)}
                style={{
                  padding: '0.6rem 1rem',
                  backgroundColor: showCustomAlertForm ? colors.secondary : colors.primary,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
                disabled={isSending}
              >
                <FiPlus /> {showCustomAlertForm ? 'Cancel Custom' : 'Create Personal-care Message'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: colors.primary }}>Select Alert Types</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                  {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'} found
                </span>
                {selectedAlerts.length > 0 && (
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: colors.primary,
                    fontWeight: '500',
                    padding: '0.2rem 0.5rem',
                    backgroundColor: `${colors.primary}15`,
                    borderRadius: '4px'
                  }}>
                    {selectedAlerts.length} selected
                  </span>
                )}
              </div>
            </div>
            
            {filteredAlerts.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: colors.lightGray,
                borderRadius: '8px',
                color: colors.textMuted
              }}>
                No alerts found matching your criteria
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr',
                gap: '1rem', 
                maxHeight: '350px', 
                overflowY: 'auto', 
                padding: '0.2rem' 
              }}>
                {filteredAlerts.map((alert, index) => (
                  <div key={index}>
                    <div 
                      style={{
                        border: `2px solid ${selectedAlerts.includes(alert.type) ? alert.color : colors.border}`,
                        borderRadius: '8px',
                        padding: '1rem',
                        cursor: isSending ? 'not-allowed' : 'pointer',
                        backgroundColor: selectedAlerts.includes(alert.type) ? `${alert.color}15` : colors.white,
                        transition: 'all 0.2s ease',
                        opacity: isSending ? 0.7 : 1,
                        position: 'relative'
                      }}
                      onClick={() => !isSending && toggleAlertSelection(alert.type)}
                    >
                      <div style={{ 
                        position: 'absolute', 
                        top: '0.8rem', 
                        right: '0.8rem',
                        color: selectedAlerts.includes(alert.type) ? alert.color : colors.border
                      }}>
                        {selectedAlerts.includes(alert.type) ? <FiCheckSquare /> : <FiSquare />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ 
                          color: alert.color, 
                          marginRight: '0.8rem',
                          fontSize: '1.2rem'
                        }}>
                          {alert.icon}
                        </div>
                        <div style={{ fontWeight: '500', color: colors.primary, paddingRight: '1.5rem' }}>
                          {alert.title}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: colors.textMuted,
                        marginLeft: '2rem'
                      }}>
                        {alert.message}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: '0.8rem',
                        right: '0.8rem',
                        fontSize: '0.7rem',
                        padding: '0.2rem 0.5rem',
                        backgroundColor: `${alert.color}20`,
                        color: alert.color,
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {alert.category}
                      </div>
                    </div>
                    
                    {/* Custom message input for selected alerts */}
                    {selectedAlerts.includes(alert.type) && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        backgroundColor: `${colors.lightGray}`
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '0.5rem',
                          color: colors.primary
                        }}>
                          <FiMessageSquare style={{ marginRight: '0.5rem' }} />
                          <span style={{ fontWeight: '500' }}>Add a personal note (optional):</span>
                        </div>
                        <textarea
                          value={customMessages[alert.type] || ''}
                          onChange={(e) => updateCustomMessage(alert.type, e.target.value)}
                          placeholder="Add a personalized message for this patient..."
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            padding: '0.75rem',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '5px',
                            fontSize: '0.9rem',
                            resize: 'vertical'
                          }}
                          disabled={isSending}
                        />
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: colors.textMuted,
                          marginTop: '0.25rem'
                        }}>
                          This will be appended to the standard alert message
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Alert Display (if selected) */}
          {selectedAlerts.includes('custom') && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                border: `2px solid ${colors.info}`,
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: `${colors.info}15`,
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '0.8rem', 
                  right: '0.8rem',
                  color: colors.info
                }}>
                  <FiCheckSquare />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ 
                    color: colors.info, 
                    marginRight: '0.8rem',
                    fontSize: '1.2rem'
                  }}>
                    <FiEdit2 />
                  </div>
                  <div style={{ fontWeight: '500', color: colors.primary }}>
                    Custom Alert
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: colors.textMuted,
                  marginLeft: '2rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {customMessages['custom']}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '0.8rem',
                  right: '0.8rem',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  backgroundColor: `${colors.info}20`,
                  color: colors.info,
                  borderRadius: '4px'
                }}>
                  custom
                </div>
              </div>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: selectedAlerts.length > 0 ? `${colors.primary}08` : colors.lightGray,
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
              {selectedAlerts.length === 0 
                ? 'Select one or more alerts to send' 
                : `Ready to send ${selectedAlerts.length} ${selectedAlerts.length === 1 ? 'alert' : 'alerts'}`
              }
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '0.7rem 1.5rem',
                  backgroundColor: colors.lightGray,
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '5px',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: isSending ? 0.6 : 1
                }}
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={sendAlerts}
                disabled={selectedAlerts.length === 0 || isSending}
                style={{
                  padding: '0.7rem 1.5rem',
                  backgroundColor: selectedAlerts.length > 0 && !isSending ? colors.primary : '#ccc',
                  color: colors.white,
                  border: 'none',
                  borderRadius: '5px',
                  cursor: selectedAlerts.length > 0 && !isSending ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: (selectedAlerts.length === 0 || isSending) ? 0.6 : 1
                }}
              >
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <><FiSend /> Send {selectedAlerts.length > 0 ? `(${selectedAlerts.length})` : ''}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAlertModal;