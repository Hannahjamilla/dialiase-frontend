import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import axios from 'axios';

const DoctorAlerts = ({ colors }) => {
  const [alerts, setAlerts] = useState([]);
  const [patientStatus, setPatientStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchDoctorAlerts();
    fetchPatientStatus();
  }, []);

  const fetchDoctorAlerts = async () => {
    try {
      const response = await axios.get('/patient/doctor-alerts');
      if (response.data.success) {
        setAlerts(response.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching doctor alerts:', error);
    }
  };

  const fetchPatientStatus = async () => {
    try {
      const response = await axios.get('/patient/status');
      if (response.data.success) {
        setPatientStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error fetching patient status:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmEmergency = async () => {
    try {
      setConfirming(true);
      const response = await axios.post('/patient/confirm-emergency');
      
      if (response.data.success) {
        // Update patient status after confirmation
        setPatientStatus('InEmergency');
        // Refresh alerts after confirmation
        fetchDoctorAlerts();
        alert('Emergency status confirmed. Please proceed to the hospital.');
      } else {
        alert('Failed to confirm emergency: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error confirming emergency:', error);
      alert('Failed to confirm emergency. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '25px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${colors.info}`
      }}>
        <div style={{ textAlign: 'center', color: colors.primary }}>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  // Filter for emergency recommendations
  const emergencyAlerts = alerts.filter(alert => 
    alert.type === 'emergency_recommendation' || alert.type === 'emergency_confirmation'
  );

  const hasActiveEmergency = emergencyAlerts.some(alert => 
    alert.type === 'emergency_recommendation' && alert.status === 'active'
  );

  // Check if patient needs to confirm emergency (WaitToResponse status)
  const needsConfirmation = patientStatus === 'WaitToResponse';

  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '25px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${hasActiveEmergency || needsConfirmation ? colors.danger : colors.info}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `${hasActiveEmergency || needsConfirmation ? colors.danger : colors.info}20`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: '15px'
        }}>
          <FiAlertTriangle style={{ 
            color: hasActiveEmergency || needsConfirmation ? colors.danger : colors.info,
            fontSize: '20px'
          }} />
        </div>
        <h3 style={{ 
          margin: 0,
          color: colors.primary,
          fontSize: '18px',
          fontWeight: '600'
        }}>Doctor's Recommendations</h3>
      </div>

      {needsConfirmation ? (
        <div>
          <div style={{
            backgroundColor: `${colors.danger}15`,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: `1px solid ${colors.danger}30`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '10px'
            }}>
              <FiAlertTriangle style={{ 
                color: colors.danger,
                marginRight: '10px',
                marginTop: '2px',
                flexShrink: 0
              }} />
              <div>
                <h4 style={{ 
                  margin: '0 0 8px 0',
                  color: colors.danger,
                  fontSize: '16px'
                }}>
                  Emergency Hospital Visit Recommended
                </h4>
                <p style={{ 
                  margin: 0,
                  color: colors.text,
                  lineHeight: '1.5'
                }}>
                  Your doctor has recommended an immediate hospital visit due to concerning 
                  fluid retention levels. Please confirm that you will proceed to the emergency department.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={confirmEmergency}
            disabled={confirming}
            style={{
              padding: '12px 20px',
              backgroundColor: colors.danger,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              cursor: confirming ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              transition: 'all 0.2s ease',
              opacity: confirming ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!confirming) {
                e.currentTarget.style.backgroundColor = '#bb2d3b';
              }
            }}
            onMouseOut={(e) => {
              if (!confirming) {
                e.currentTarget.style.backgroundColor = colors.danger;
              }
            }}
          >
            {confirming ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Confirming...
              </>
            ) : (
              <>
                <FiCheckCircle size={18} />
                Confirm Emergency Visit
              </>
            )}
          </button>
        </div>
      ) : hasActiveEmergency ? (
        <div>
          <div style={{
            backgroundColor: `${colors.danger}15`,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: `1px solid ${colors.danger}30`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '10px'
            }}>
              <FiAlertTriangle style={{ 
                color: colors.danger,
                marginRight: '10px',
                marginTop: '2px',
                flexShrink: 0
              }} />
              <div>
                <h4 style={{ 
                  margin: '0 0 8px 0',
                  color: colors.danger,
                  fontSize: '16px'
                }}>
                  Emergency Hospital Visit Recommended
                </h4>
                <p style={{ 
                  margin: 0,
                  color: colors.text,
                  lineHeight: '1.5'
                }}>
                  Your doctor has recommended an immediate hospital visit due to concerning 
                  fluid retention levels. Please proceed to the emergency department.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : patientStatus === 'InEmergency' ? (
        <div style={{
          backgroundColor: `${colors.success}15`,
          padding: '15px',
          borderRadius: '8px',
          border: `1px solid ${colors.success}30`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <FiCheckCircle style={{ 
              color: colors.success,
              marginRight: '10px',
              marginTop: '2px',
              flexShrink: 0
            }} />
            <div>
              <h4 style={{ 
                margin: '0 0 8px 0',
                color: colors.success,
                fontSize: '16px'
              }}>
                Emergency Status Confirmed
              </h4>
              <p style={{ 
                margin: 0,
                color: colors.text,
                lineHeight: '1.5'
              }}>
                You have confirmed your emergency hospital visit. Thank you for updating your status.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: `${colors.info}15`,
          padding: '15px',
          borderRadius: '8px',
          border: `1px solid ${colors.info}30`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <FiInfo style={{ 
              color: colors.info,
              marginRight: '10px',
              marginTop: '2px',
              flexShrink: 0
            }} />
            <div>
              <h4 style={{ 
                margin: '0 0 8px 0',
                color: colors.info,
                fontSize: '16px'
              }}>
                No Emergency Recommendations
              </h4>
              <p style={{ 
                margin: 0,
                color: colors.text,
                lineHeight: '1.5'
              }}>
                Continue with your regular treatments. Your doctor will notify you if any 
                emergency action is needed based on your treatment data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAlerts;