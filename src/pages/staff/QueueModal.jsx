import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaListOl, 
  FaUserInjured, 
  FaClock, 
  FaCheckCircle, 
  FaPlayCircle, 
  FaTimesCircle,
  FaSync,
  FaTimes,
  FaUserMd,
  FaProcedures,
  FaHourglassHalf,
  FaArrowRight,
  FaStethoscope,
  FaUserCheck,
  FaUserClock,
  FaNotesMedical,
  FaClinicMedical,
  FaForward,
  FaExclamationTriangle,
  FaVolumeUp,
  FaVolumeMute,
  FaArrowUp,
  FaAmbulance,
  FaCalendarAlt
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api';

const QueueModal = ({ onClose }) => {
  const [queues, setQueues] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previousCompletedCount, setPreviousCompletedCount] = useState(0);
  const [previousInProgressCount, setPreviousInProgressCount] = useState(0);
  const [patientTreatmentData, setPatientTreatmentData] = useState({});

  // Define color variables
  const colors = {
    primary: '#2c5282',
    primaryLight: '#4299e1',
    white: '#FFFFFF',
    green: '#38a169',
    lightGreen: '#f0fff4',
    red: '#e53e3e',
    lightRed: '#fff5f5',
    yellow: '#d69e2e',
    lightYellow: '#fffbeb',
    blue: '#3182ce',
    lightBlue: '#ebf8ff',
    gray: '#718096',
    lightGray: '#f7fafc',
    border: '#e2e8f0',
    purple: '#805ad5',
    lightPurple: '#faf5ff',
    orange: '#dd6b20',
    lightOrange: '#fffaf0',
    darkRed: '#c53030',
    lightDarkRed: '#fff5f5',
    teal: '#319795',
    lightTeal: '#e6fffa'
  };

  // Create sounds using Web Audio API
  const createStartSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  };

  const createCompletedSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.3);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  };

  const playStartSound = () => {
    if (soundEnabled) {
      createStartSound();
    }
  };

  const playCompletedSound = () => {
    if (soundEnabled) {
      createCompletedSound();
    }
  };

  const fetchTodayQueues = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_BASE_URL}/staff/today-queues`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const newQueues = response.data.queues || [];
      
      // Check for completed consultations to play sound
      const currentCompletedCount = newQueues.filter(q => q.status === 'completed' && q.checkup_status !== 'Completed').length;
      const currentInProgressCount = newQueues.filter(q => q.status === 'in-progress' && q.checkup_status !== 'Completed').length;
      
      // Play sounds only when there are changes
      if (currentCompletedCount > previousCompletedCount) {
        playCompletedSound();
      }
      
      if (currentInProgressCount > previousInProgressCount && previousInProgressCount === 0) {
        playStartSound();
      }
      
      setPreviousCompletedCount(currentCompletedCount);
      setPreviousInProgressCount(currentInProgressCount);
      
      setQueues(newQueues);
      setError(null);

      // Fetch treatment data for all patients
      await fetchPatientTreatmentData(newQueues);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch queue data");
      console.error("Error fetching queue data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

// In the fetchPatientTreatmentData function, update the error handling:
const fetchPatientTreatmentData = async (queues) => {
  try {
    const treatmentData = {};
    
    // Fetch treatment data for each patient
    for (const queue of queues) {
      try {
        // Extract userID from queue
        const userID = queue.userID;
        if (userID) {
          const response = await axios.get(`${API_BASE_URL}/staff/enhanced-patient-data/${userID}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          
          // Check if response has data property or is the data itself
          if (response.data && typeof response.data === 'object') {
            treatmentData[userID] = response.data;
          } else {
            treatmentData[userID] = {
              treatment_count_28_days: 0,
              is_emergency: false,
              emergency_priority: 0,
              emergency_note: 'Data format error'
            };
          }
        }
      } catch (error) {
        console.warn(`Error fetching treatment data for patient ${queue.patient_name}:`, error);
        treatmentData[queue.userID] = {
          treatment_count_28_days: 0,
          is_emergency: false,
          emergency_priority: 0,
          emergency_note: 'Data temporarily unavailable'
        };
      }
    }
    
    setPatientTreatmentData(treatmentData);
  } catch (error) {
    console.error('Error in fetchPatientTreatmentData:', error);
    // Don't set error state here as it's not critical for main functionality
  }
};
  const fetchDoctorsOnDuty = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/doctors-on-duty`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error("Error fetching doctors on duty:", error);
    }
  };

  const updateEmergencyStatuses = async () => {
    try {
      await axios.post(`${API_BASE_URL}/staff/update-emergency-statuses`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      await fetchTodayQueues();
    } catch (error) {
      console.error("Error updating emergency statuses:", error);
    }
  };

  useEffect(() => {
    fetchTodayQueues();
    fetchDoctorsOnDuty();
    
    // Refresh queue every 30 seconds
    const interval = setInterval(fetchTodayQueues, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateQueueStatus = async (queueId, status, doctorId = null) => {
    try {
      const payload = { queue_id: queueId, status };
      if (doctorId) {
        payload.doctor_id = doctorId;
      }
      
      if (status === 'completed') {
        payload.checkup_status = 'Completed';
      }
      
      await axios.post(`${API_BASE_URL}/staff/update-queue-status`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setQueues(prevQueues => 
        prevQueues.map(queue => 
          queue.queue_id === queueId 
            ? { 
                ...queue, 
                status, 
                start_time: status === 'in-progress' ? new Date().toISOString() : queue.start_time,
                doctor_id: doctorId || queue.doctor_id,
                checkup_status: status === 'completed' ? 'Completed' : queue.checkup_status
              }
            : queue
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update queue status");
      console.error("Error updating queue status:", error);
    }
  };

  const skipQueue = async (queueId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/skip-queue`, 
        { queue_id: queueId, positions: 5 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      await fetchTodayQueues();
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to skip queue";
      setError(errorMessage);
      console.error("Error skipping queue:", error);
    }
  };

  const prioritizeEmergencyPatient = async (queueId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/prioritize-emergency-patient`, 
        { queue_id: queueId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      await fetchTodayQueues();
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to prioritize patient";
      setError(errorMessage);
      console.error("Error prioritizing patient:", error);
    }
  };

  const sendToEmergency = async (queueId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/send-to-emergency`, 
        { queue_id: queueId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      await fetchTodayQueues();
      setError(null);
      // Show success message
      alert('Patient sent directly to emergency department!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to send patient to emergency";
      setError(errorMessage);
      console.error("Error sending patient to emergency:", error);
    }
  };

  const startQueue = async () => {
    try {
      setRefreshing(true);
      const response = await axios.post(`${API_BASE_URL}/staff/start-queue`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      playStartSound();
      await fetchTodayQueues();
      setError(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to start queue";
      setError(errorMessage);
      console.error("Error starting queue:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-progress':
        return <FaUserCheck style={{ color: colors.blue, fontSize: '14px' }} />;
      case 'completed':
        return <FaCheckCircle style={{ color: colors.green, fontSize: '14px' }} />;
      case 'cancelled':
        return <FaTimesCircle style={{ color: colors.red, fontSize: '14px' }} />;
      default:
        return <FaUserClock style={{ color: colors.gray, fontSize: '14px' }} />;
    }
  };

  const getStatusStyles = (status) => {
    const baseStyle = {
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    };

    switch (status) {
      case 'in-progress':
        return { ...baseStyle, backgroundColor: colors.lightBlue, color: colors.blue };
      case 'completed':
        return { ...baseStyle, backgroundColor: colors.lightGreen, color: colors.green };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: colors.lightRed, color: colors.red };
      default:
        return { ...baseStyle, backgroundColor: '#edf2f7', color: colors.gray };
    }
  };

  // Get priority level description
  const getPriorityDescription = (priority) => {
    if (priority >= 15) {
      return 'Critical';
    } else if (priority >= 10) {
      return 'High';
    } else if (priority >= 5) {
      return 'Medium';
    } else {
      return 'Normal';
    }
  };

  const getEmergencyStyles = (emergencyStatus, emergencyPriority) => {
    if (!emergencyStatus) {
      return {
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: colors.lightTeal,
        color: colors.teal
      };
    }
    
    const baseStyle = {
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    };
    
    if (emergencyPriority >= 15) {
      return { ...baseStyle, backgroundColor: colors.lightDarkRed, color: colors.darkRed };
    } else if (emergencyPriority >= 10) {
      return { ...baseStyle, backgroundColor: colors.lightRed, color: colors.red };
    } else {
      return { ...baseStyle, backgroundColor: colors.lightOrange, color: colors.orange };
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get doctor name by ID
  const getDoctorName = (doctorId) => {
    if (!doctorId) return 'Not assigned';
    const doctor = doctors.find(d => d.userID === doctorId);
    return doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : 'Not assigned';
  };

  // Get available doctors (doctors without current patients)
  const getAvailableDoctors = () => {
    const currentPatientDoctorIds = queues
      .filter(q => q.status === 'in-progress' && q.doctor_id)
      .map(q => q.doctor_id);
    
    return doctors.filter(doctor => !currentPatientDoctorIds.includes(doctor.userID));
  };

  // Get next patients for consultation (prioritizing emergency cases)
  const getNextPatientsForConsultation = () => {
    const waitingPatients = queues.filter(q => q.status === 'waiting' && q.checkup_status !== 'Completed');
    const availableDoctorsCount = getAvailableDoctors().length;
    
    // Sort by emergency priority first, then queue number
    const sortedPatients = [...waitingPatients].sort((a, b) => {
      if (a.emergency_status !== b.emergency_status) {
        return b.emergency_status - a.emergency_status;
      }
      if (a.emergency_priority !== b.emergency_priority) {
        return b.emergency_priority - a.emergency_priority;
      }
      return a.queue_number - b.queue_number;
    });
    
    return sortedPatients.slice(0, availableDoctorsCount);
  };

  // Get treatment count for a patient
  const getTreatmentCount = (patient) => {
    const userID = patient.userID;
    if (!userID || !patientTreatmentData[userID]) return 0;
    return patientTreatmentData[userID].treatment_count_28_days || 0;
  };

  // Get emergency status for a patient
  const getPatientEmergencyStatus = (patient) => {
    const userID = patient.userID;
    if (!userID || !patientTreatmentData[userID]) return false;
    return patientTreatmentData[userID].is_emergency || false;
  };

  // Get emergency priority for a patient
  const getPatientEmergencyPriority = (patient) => {
    const userID = patient.userID;
    if (!userID || !patientTreatmentData[userID]) return 0;
    return patientTreatmentData[userID].emergency_priority || 0;
  };

  // Get emergency note for a patient
  const getPatientEmergencyNote = (patient) => {
    const userID = patient.userID;
    if (!userID || !patientTreatmentData[userID]) return 'Normal';
    return patientTreatmentData[userID].emergency_note || 'Normal';
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filter queues based on active tab
  const filteredQueues = activeTab === 'all' 
    ? queues.filter(q => q.checkup_status !== 'Completed')
    : queues.filter(queue => queue.status === activeTab && queue.checkup_status !== 'Completed');

  // Count queues by status
  const statusCounts = {
    all: queues.filter(q => q.checkup_status !== 'Completed').length,
    waiting: queues.filter(q => q.status === 'waiting' && q.checkup_status !== 'Completed').length,
    'in-progress': queues.filter(q => q.status === 'in-progress' && q.checkup_status !== 'Completed').length,
    completed: queues.filter(q => q.status === 'completed' && q.checkup_status !== 'Completed').length,
    cancelled: queues.filter(q => q.status === 'cancelled' && q.checkup_status !== 'Completed').length
  };

  // Get emergency patients - use both queue data and treatment data
  const emergencyPatients = queues.filter(q => {
    const isEmergencyFromQueue = q.emergency_status;
    const isEmergencyFromTreatment = getPatientEmergencyStatus(q);
    return (isEmergencyFromQueue || isEmergencyFromTreatment) && q.status === 'waiting' && q.checkup_status !== 'Completed';
  });
  
  // Get current patients (in-progress)
  const currentPatients = queues.filter(q => q.status === 'in-progress' && q.checkup_status !== 'Completed');

  // Get waiting patients (waiting)
  const waitingPatients = queues.filter(q => q.status === 'waiting' && q.checkup_status !== 'Completed');

  const availableDoctors = getAvailableDoctors();
  const nextPatientsForConsultation = getNextPatientsForConsultation();

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }} onClick={handleBackdropClick}>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '12px',
          padding: '24px',
          width: '94%',
          maxWidth: '1600px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
          }}>
            <div style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '50%',
              height: '40px',
              width: '40px',
              border: `3px solid ${colors.primary}`,
              borderTopColor: 'transparent'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }} onClick={handleBackdropClick}>
      
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '12px',
        padding: '24px',
        width: '98%',
        maxWidth: '1650px',
        maxHeight: '95vh',
        overflow: 'auto',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: colors.lightGray,
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: colors.gray,
            padding: '6px',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.color = colors.white;
            e.target.style.backgroundColor = colors.red;
          }}
          onMouseOut={(e) => {
            e.target.style.color = colors.gray;
            e.target.style.backgroundColor = colors.lightGray;
          }}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingRight: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: colors.primary,
              color: colors.white,
              borderRadius: '10px',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              <FaClinicMedical />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, margin: 0 }}>
               Patient Queue Overview
              </h2>
              <p style={{ fontSize: '14px', color: colors.gray, margin: 0 }}>
                Real-time monitoring of patient flow and doctor assignments
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={updateEmergencyStatuses}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: colors.white,
                color: colors.orange,
                padding: '10px 16px',
                borderRadius: '8px',
                border: `1px solid ${colors.orange}`,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                opacity: refreshing ? 0.7 : 1
              }}
              onMouseOver={(e) => {
                if (!refreshing) {
                  e.target.style.backgroundColor = colors.orange;
                  e.target.style.color = colors.white;
                }
              }}
              onMouseOut={(e) => {
                if (!refreshing) {
                  e.target.style.backgroundColor = colors.white;
                  e.target.style.color = colors.orange;
                }
              }}
            >
              <FaSync />
              Refresh Status
            </button>
            
            {nextPatientsForConsultation.length > 0 && availableDoctors.length > 0 && (
              <button
                onClick={startQueue}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: colors.green,
                  color: colors.white,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: refreshing ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!refreshing) {
                    e.target.style.backgroundColor = '#2f855a';
                  }
                }}
                onMouseOut={(e) => {
                  if (!refreshing) {
                    e.target.style.backgroundColor = colors.green;
                  }
                }}
              >
                <FaPlayCircle />
                Start Next Patients ({Math.min(availableDoctors.length, nextPatientsForConsultation.length)})
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: colors.primary,
            padding: '20px',
            borderRadius: '12px',
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}> 
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              width: '54px',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              <FaUserMd />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                {doctors.length}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Doctors On Duty</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                Available: {availableDoctors.length}
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: colors.orange,
            padding: '20px',
            borderRadius: '12px',
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              width: '54px',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              <FaHourglassHalf />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                {statusCounts.waiting}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Waiting Patients</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                Next in line: {nextPatientsForConsultation.length}
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: colors.blue,
            padding: '20px',
            borderRadius: '12px',
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              width: '54px',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              <FaStethoscope />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                {statusCounts['in-progress']}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>In Consultation</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                Capacity: {currentPatients.length}/{doctors.length}
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: colors.red,
            padding: '20px',
            borderRadius: '12px',
            color: colors.white,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '10px',
              width: '54px',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              <FaExclamationTriangle />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
                {emergencyPatients.length}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Emergency Cases</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                Auto-detected
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: colors.lightRed,
            borderLeft: `4px solid ${colors.red}`,
            color: '#742a2a',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaTimesCircle style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Main Content Area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.8fr',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Left Column - Doctors & Current Patients */}
          <div>
            {/* Doctors on Duty */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              padding: '20px',
              marginBottom: '24px'
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
                <FaUserMd style={{ color: colors.primaryLight }} />
                Doctors On Duty ({doctors.length})
                <span style={{ 
                  fontSize: '14px', 
                  color: colors.green, 
                  marginLeft: 'auto',
                  fontWeight: 'normal'
                }}>
                  Available: {availableDoctors.length}
                </span>
              </h3>
              
              {doctors.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '12px'
                }}>
                  {doctors.map((doctor, index) => {
                    const assignedPatient = currentPatients.find(p => p.doctor_id === doctor.userID);
                    const isAvailable = !assignedPatient;
                    
                    return (
                      <div key={doctor.userID} style={{
                        padding: '16px',
                        backgroundColor: assignedPatient ? colors.lightBlue : colors.lightGray,
                        borderRadius: '8px',
                        border: `1px solid ${assignedPatient ? colors.blue : colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          backgroundColor: assignedPatient ? colors.blue : 
                                       isAvailable ? colors.green : colors.gray,
                          color: colors.white,
                          borderRadius: '8px',
                          width: '44px',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            margin: '0 0 4px 0',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: colors.primary
                          }}>
                            Dr. {doctor.first_name} {doctor.last_name}
                          </h4>
                          <p style={{
                            margin: 0,
                            fontSize: '14px',
                            color: colors.gray
                          }}>
                            {doctor.specialization || 'General Practitioner'}
                          </p>
                        </div>
                        {assignedPatient ? (
                          <div style={{
                            backgroundColor: colors.blue,
                            color: colors.white,
                            padding: '6px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            With Patient
                          </div>
                        ) : (
                          <div style={{
                            backgroundColor: colors.lightGreen,
                            color: colors.green,
                            padding: '6px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: `1px solid ${colors.green}`
                          }}>
                            Available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: colors.gray
                }}>
                  <FaUserMd style={{ fontSize: '36px', margin: '0 auto 12px', color: colors.border }} />
                  <p style={{ margin: 0 }}>No doctors on duty today</p>
                </div>
              )}
            </div>

            {/* Current Patients */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              padding: '20px'
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
                <FaUserCheck style={{ color: colors.blue }} />
                Current Consultations ({currentPatients.length}/{doctors.length})
              </h3>
              
              {currentPatients.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gap: '12px'
                }}>
                  {currentPatients.map((patient) => (
                    <div key={patient.queue_id} style={{
                      padding: '16px',
                      backgroundColor: colors.lightBlue,
                      borderRadius: '8px',
                      border: `1px solid ${colors.blue}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        backgroundColor: colors.blue,
                        color: colors.white,
                        borderRadius: '8px',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        flexShrink: 0
                      }}>
                        {patient.queue_number}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: '0 0 4px 0',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.primary
                        }}>
                          {patient.patient_name}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '14px',
                          color: colors.gray
                        }}>
                          Doctor: {getDoctorName(patient.doctor_id)}
                        </p>
                        {patient.start_time && (
                          <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '12px',
                            color: colors.gray
                          }}>
                            Started: {formatTime(patient.start_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: colors.gray
                }}>
                  <FaUserCheck style={{ fontSize: '36px', margin: '0 auto 12px', color: colors.border }} />
                  <p style={{ margin: 0 }}>No patients currently in consultation</p>
                  {nextPatientsForConsultation.length > 0 && availableDoctors.length > 0 && (
                    <button
                      onClick={startQueue}
                      disabled={refreshing}
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '16px auto 0',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        opacity: refreshing ? 0.7 : 1
                      }}
                      onMouseOver={(e) => {
                        if (!refreshing) {
                          e.target.style.backgroundColor = '#2b6cb0';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!refreshing) {
                          e.target.style.backgroundColor = colors.primary;
                        }
                      }}
                    >
                      <FaPlayCircle />
                      Start Next Patients ({Math.min(availableDoctors.length, nextPatientsForConsultation.length)})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Emergency Patients, Waiting Patients & Queue List */}
          <div>
            {/* Emergency Patients */}
            {emergencyPatients.length > 0 && (
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                padding: '20px',
                marginBottom: '24px',
                borderLeft: `4px solid ${colors.darkRed}`
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: colors.darkRed,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaExclamationTriangle style={{ color: colors.darkRed }} />
                  Emergency Patients ({emergencyPatients.length})
                  <span style={{ 
                    fontSize: '14px', 
                    color: colors.darkRed, 
                    marginLeft: 'auto',
                    fontWeight: 'normal'
                  }}>
                    Auto-detected from treatment data
                  </span>
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  {emergencyPatients.map((patient, index) => {
                    const emergencyPriority = getPatientEmergencyPriority(patient) || patient.emergency_priority || 0;
                    const emergencyNote = getPatientEmergencyNote(patient) || patient.emergency_note || 'Emergency case detected';
                    
                    return (
                      <div key={patient.queue_id} style={{
                        padding: '16px',
                        backgroundColor: emergencyPriority >= 15 ? colors.lightDarkRed : 
                                       emergencyPriority >= 10 ? colors.lightRed : colors.lightOrange,
                        borderRadius: '8px',
                        border: `1px solid ${emergencyPriority >= 15 ? colors.darkRed : 
                                       emergencyPriority >= 10 ? colors.red : colors.orange}`,
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: emergencyPriority >= 15 ? colors.darkRed : 
                                         emergencyPriority >= 10 ? colors.red : colors.orange,
                          color: colors.white,
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {index + 1}
                        </div>
                        
                        <div style={{
                          backgroundColor: emergencyPriority >= 15 ? colors.darkRed : 
                                         emergencyPriority >= 10 ? colors.red : colors.orange,
                          color: colors.white,
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '20px',
                          margin: '0 auto 12px'
                        }}>
                          {patient.queue_number}
                        </div>
                        
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: emergencyPriority >= 15 ? colors.darkRed : 
                                 emergencyPriority >= 10 ? colors.red : colors.orange
                        }}>
                          {patient.patient_name}
                        </h4>
                        
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '12px',
                          color: colors.gray,
                          fontStyle: 'italic',
                          minHeight: '32px'
                        }}>
                          {emergencyNote}
                        </p>

                        {/* Treatment Count Display */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          margin: '8px 0',
                          fontSize: '11px',
                          color: colors.gray
                        }}>
                          <FaCalendarAlt />
                          Treatments (28 days): {getTreatmentCount(patient)}
                        </div>
                        
                        <div style={getEmergencyStyles(true, emergencyPriority)}>
                          <FaExclamationTriangle />
                          {getPriorityDescription(emergencyPriority)} Priority
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '12px'
                        }}>
                          <button
                            onClick={() => prioritizeEmergencyPatient(patient.queue_id)}
                            style={{
                              backgroundColor: colors.darkRed,
                              color: colors.white,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600',
                              transition: 'all 0.2s',
                              flex: 1,
                              justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#9b2c2c';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = colors.darkRed;
                            }}
                            title="Move this emergency patient to front of queue"
                          >
                            <FaArrowUp style={{ fontSize: '10px' }} />
                            Prioritize
                          </button>

                          <button
                            onClick={() => sendToEmergency(patient.queue_id)}
                            style={{
                              backgroundColor: colors.purple,
                              color: colors.white,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600',
                              transition: 'all 0.2s',
                              flex: 1,
                              justifyContent: 'center'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = '#6b46c1';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = colors.purple;
                            }}
                            title="Send directly to emergency department (remove from queue)"
                          >
                            <FaAmbulance style={{ fontSize: '10px' }} />
                            To Emergency
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Next Patients for Consultation */}
            {nextPatientsForConsultation.length > 0 && (
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                padding: '20px',
                marginBottom: '24px',
                borderLeft: `4px solid ${colors.green}`
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: colors.green,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaArrowRight style={{ color: colors.green }} />
                  Next for Consultation ({nextPatientsForConsultation.length})
                  <span style={{ 
                    fontSize: '14px', 
                    color: colors.green, 
                    marginLeft: 'auto',
                    fontWeight: 'normal'
                  }}>
                    Ready for {availableDoctors.length} doctors
                  </span>
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {nextPatientsForConsultation.map((patient, index) => {
                    const isEmergency = getPatientEmergencyStatus(patient) || patient.emergency_status;
                    const emergencyPriority = getPatientEmergencyPriority(patient) || patient.emergency_priority || 0;
                    const emergencyNote = getPatientEmergencyNote(patient) || patient.emergency_note || 'Normal';
                    
                    return (
                      <div key={patient.queue_id} style={{
                        padding: '16px',
                        backgroundColor: isEmergency ? colors.lightRed : colors.lightGreen,
                        borderRadius: '8px',
                        border: `1px solid ${isEmergency ? colors.red : colors.green}`,
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: isEmergency ? colors.red : colors.green,
                          color: colors.white,
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {index + 1}
                        </div>
                        
                        <div style={{
                          backgroundColor: isEmergency ? colors.red : colors.green,
                          color: colors.white,
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '20px',
                          margin: '0 auto 12px'
                        }}>
                          {patient.queue_number}
                        </div>
                        
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: isEmergency ? colors.red : colors.green
                        }}>
                          {patient.patient_name}
                        </h4>
                        
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '12px',
                          color: isEmergency ? colors.red : colors.gray,
                          fontStyle: 'italic',
                          minHeight: '32px',
                          fontWeight: isEmergency ? '600' : 'normal'
                        }}>
                          {emergencyNote}
                        </p>

                        {/* Treatment Count Display */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          margin: '8px 0',
                          fontSize: '11px',
                          color: colors.gray
                        }}>
                          <FaCalendarAlt />
                          Treatments (28 days): {getTreatmentCount(patient)}
                        </div>
                        
                        <div style={getEmergencyStyles(isEmergency, emergencyPriority)}>
                          {isEmergency ? <FaExclamationTriangle /> : <FaCheckCircle />}
                          {isEmergency ? `${getPriorityDescription(emergencyPriority)} Priority` : 'Normal'}
                        </div>
                        
                        <div style={{
                          marginTop: '12px'
                        }}>
                          <button
                            onClick={() => skipQueue(patient.queue_id)}
                            style={{
                              backgroundColor: colors.white,
                              color: colors.purple,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: `1px solid ${colors.purple}`,
                              cursor: 'pointer',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600',
                              transition: 'all 0.2s',
                              margin: '0 auto'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.backgroundColor = colors.purple;
                              e.target.style.color = colors.white;
                            }}
                            onMouseOut={(e) => {
                              e.target.style.backgroundColor = colors.white;
                              e.target.style.color = colors.purple;
                            }}
                            title="Skip this patient (move 5 positions back)"
                          >
                            <FaForward style={{ fontSize: '10px' }} />
                            Skip
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Waiting Patients */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              padding: '20px',
              marginBottom: '24px'
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
                <FaUserClock style={{ color: colors.yellow }} />
                All Waiting Patients ({waitingPatients.length})
              </h3>
              
              {waitingPatients.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {waitingPatients.map((patient, index) => {
                    const isNextForConsultation = nextPatientsForConsultation.some(p => p.queue_id === patient.queue_id);
                    const isEmergency = getPatientEmergencyStatus(patient) || patient.emergency_status;
                    const emergencyPriority = getPatientEmergencyPriority(patient) || patient.emergency_priority || 0;
                    const emergencyNote = getPatientEmergencyNote(patient) || patient.emergency_note || 'Normal';
                    
                    return (
                      <div key={patient.queue_id} style={{
                        padding: '16px',
                        backgroundColor: isNextForConsultation ? colors.lightYellow : colors.lightGray,
                        borderRadius: '8px',
                        border: `1px solid ${isNextForConsultation ? colors.yellow : colors.border}`,
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                        {isNextForConsultation && (
                          <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: colors.yellow,
                            color: colors.primary,
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}>
                            {nextPatientsForConsultation.findIndex(p => p.queue_id === patient.queue_id) + 1}
                          </div>
                        )}
                        
                        <div style={{
                          backgroundColor: isNextForConsultation ? colors.primary : colors.gray,
                          color: colors.white,
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '20px',
                          margin: '0 auto 12px'
                        }}>
                          {patient.queue_number}
                        </div>
                        
                        <h4 style={{
                          margin: '0 0 8px 0',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: colors.primary
                        }}>
                          {patient.patient_name}
                        </h4>
                        
                        <p style={{
                          margin: '0 0 8px 0',
                          fontSize: '12px',
                          color: isEmergency ? colors.red : colors.gray,
                          fontStyle: 'italic',
                          minHeight: '32px',
                          fontWeight: isEmergency ? '600' : 'normal'
                        }}>
                          {emergencyNote}
                        </p>

                        {/* Treatment Count Display */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          margin: '8px 0',
                          fontSize: '11px',
                          color: colors.gray
                        }}>
                          <FaCalendarAlt />
                          Treatments (28 days): {getTreatmentCount(patient)}
                        </div>

                        <div style={getEmergencyStyles(isEmergency, emergencyPriority)}>
                          {isEmergency ? <FaExclamationTriangle /> : <FaCheckCircle />}
                          {isEmergency ? `${getPriorityDescription(emergencyPriority)} Priority` : 'Normal'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: colors.gray
                }}>
                  <FaUserClock style={{ fontSize: '36px', margin: '0 auto 12px', color: colors.border }} />
                  <p style={{ margin: 0 }}>No patients waiting in queue</p>
                </div>
              )}
            </div>

            {/* Queue List with Tabs */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              padding: '20px'
            }}>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                borderBottom: `1px solid ${colors.border}`,
                marginBottom: '20px',
                overflowX: 'auto'
              }}>
                {['all', 'waiting', 'in-progress', 'completed', 'cancelled'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === tab ? `3px solid ${colors.primary}` : '3px solid transparent',
                      color: activeTab === tab ? colors.primary : colors.gray,
                      fontWeight: activeTab === tab ? '600' : '500',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab === 'all' && <FaProcedures />}
                  {tab === 'waiting' && <FaClock />}
                  {tab === 'in-progress' && <FaUserMd />}
                  {tab === 'completed' && <FaCheckCircle />}
                  {tab === 'cancelled' && <FaTimesCircle />}
                  {tab.replace('-', ' ')} ({statusCounts[tab]})
                </button>
              ))}
              </div>

              {/* Queue List */}
              <div>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: colors.primary
                }}>
                  {activeTab === 'all' ? 'All Patients' : `${activeTab.replace('-', ' ')} Patients`}
                </h3>
                
                {filteredQueues.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 0',
                    color: colors.gray,
                    fontSize: '16px'
                  }}>
                    <FaUserInjured style={{ fontSize: '48px', margin: '0 auto 16px', color: colors.border }} />
                    <p style={{ margin: 0 }}>No patients in {activeTab} queue</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '16px'
                  }}>
                    {filteredQueues.map((queue) => {
                      const isEmergency = getPatientEmergencyStatus(queue) || queue.emergency_status;
                      const emergencyPriority = getPatientEmergencyPriority(queue) || queue.emergency_priority || 0;
                      const emergencyNote = getPatientEmergencyNote(queue) || queue.emergency_note || 'Normal case';
                      
                      return (
                        <div
                          key={queue.queue_id}
                          style={{
                            padding: '16px',
                            backgroundColor: colors.lightGray,
                            borderRadius: '8px',
                            border: `1px solid ${colors.border}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                            <div style={{
                              backgroundColor: colors.primary,
                              color: colors.white,
                              borderRadius: '6px',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '16px'
                            }}>
                              {queue.queue_number}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <span style={getStatusStyles(queue.status)}>
                                {getStatusIcon(queue.status)}
                                {queue.status.replace('-', ' ')}
                              </span>
                              
                              <span style={getEmergencyStyles(isEmergency, emergencyPriority)}>
                                {isEmergency ? <FaExclamationTriangle /> : <FaCheckCircle />}
                                {isEmergency ? `${getPriorityDescription(emergencyPriority)} Priority` : 'Normal'}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h3 style={{ 
                              fontSize: '16px', 
                              fontWeight: '600', 
                              color: colors.primary, 
                              margin: '0 0 4px 0'
                            }}>
                              {queue.patient_name}
                            </h3>
                            <p style={{ 
                              fontSize: '14px', 
                              color: colors.gray, 
                              margin: 0 
                            }}>
                              Doctor: {getDoctorName(queue.doctor_id)}
                            </p>
                          </div>

                          {/* Treatment Count Display */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: colors.gray
                          }}>
                            <FaCalendarAlt />
                            Treatments (28 days): {getTreatmentCount(queue)}
                          </div>

                          <p style={{
                            fontSize: '12px',
                            color: colors.gray,
                            fontStyle: 'italic',
                            margin: 0
                          }}>
                            {emergencyNote}
                          </p>

                          {queue.start_time && (
                            <div style={{ 
                              fontSize: '14px', 
                              color: colors.gray,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <FaClock style={{ fontSize: '12px' }} />
                              Started: {formatTime(queue.start_time)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sound Toggle Button */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '20px',
          border: `1px solid ${colors.border}`
        }}>
          <span style={{ fontSize: '12px', color: colors.gray, fontWeight: '500' }}>
            Sound:
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              backgroundColor: soundEnabled ? colors.primary : colors.lightGray,
              color: soundEnabled ? colors.white : colors.gray,
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '6px',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default QueueModal;