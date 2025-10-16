import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaTimes,
  FaPrescriptionBottleAlt,
  FaInfoCircle,
  FaSearch,
  FaBox,
  FaBoxes,
  FaNotesMedical,
  FaCalendarCheck,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';
import axios from 'axios';
import { format, parseISO, isToday, isFuture, startOfDay, endOfDay } from 'date-fns';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8000/api';

const CompletedCheckupsModal = ({ isOpen, onClose, completedCheckups, prescriptions, fetchDashboardData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatients, setExpandedPatients] = useState({});
  const [loadingPatientId, setLoadingPatientId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [processedPrescriptions, setProcessedPrescriptions] = useState({});

  // Process prescriptions when component mounts or prescriptions prop changes
  useEffect(() => {
    console.log('=== PRESCRIPTIONS PROP CHANGED ===');
    console.log('Prescriptions prop:', prescriptions);
    console.log('Completed checkups:', completedCheckups);
    
    if (prescriptions && typeof prescriptions === 'object') {
      const processed = {};
      
      // Handle object format
      if (Array.isArray(prescriptions)) {
        prescriptions.forEach((prescription) => {
          if (prescription.patientID) {
            processed[prescription.patientID] = prescription;
          }
        });
      } else {
        // It's an object, convert to array and process
        Object.values(prescriptions).forEach((prescription) => {
          if (prescription.patientID) {
            processed[prescription.patientID] = prescription;
          }
        });
      }
      
      setProcessedPrescriptions(processed);
      console.log('Final processed prescriptions:', processed);
    } else {
      console.log('No prescriptions data or invalid format');
      setProcessedPrescriptions({});
    }
  }, [prescriptions, completedCheckups]);

  if (!isOpen) return null;

  // Filter patients based on search term and date
  const filteredPatients = completedCheckups.filter(patient => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (patient.hospitalNumber && patient.hospitalNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Date filter
    if (!patient.appointment_date) return true;
    
    try {
      const appointmentDate = parseISO(patient.appointment_date);
      
      switch (filterType) {
        case 'today':
          return isToday(appointmentDate);
        case 'upcoming':
          return isFuture(appointmentDate) && !isToday(appointmentDate);
        case 'dateRange':
          if (!showDateFilter || !dateRange.start || !dateRange.end) return true;
          const startDate = startOfDay(parseISO(dateRange.start));
          const endDate = endOfDay(parseISO(dateRange.end));
          return appointmentDate >= startDate && appointmentDate <= endDate;
        default:
          return true;
      }
    } catch (error) {
      console.error('Error filtering patient date:', error);
      return true;
    }
  });

  // FIXED: Enhanced prescription matching logic
  const getPrescriptionForPatient = (patient) => {
    if (!patient) {
      console.log('getPrescriptionForPatient: patient is null/undefined');
      return null;
    }
    
    console.log('🔍 Looking for prescription for patient:', {
      patientName: `${patient.first_name} ${patient.last_name}`,
      patientID: patient.patientID,
      patient_id: patient.patient_id,
      userID: patient.userID,
      schedule_patient_id: patient.schedule_patient_id,
      patientData: patient
    });
    
    console.log('Available prescription keys:', Object.keys(processedPrescriptions));
    console.log('Available prescription patient IDs:', Object.values(processedPrescriptions).map(p => p.patientID));
    
    // Try all possible patient ID fields in priority order
    const possibleIds = [
      patient.patientID,        // from patients.patientID (highest priority)
      patient.patient_id,       // from schedule.patient_id  
      patient.userID,           // from users.userID
      patient.schedule_patient_id // from schedule.patient_id alias
    ].filter(id => id != null && id !== undefined && id !== '');
    
    console.log('Trying patient IDs in order:', possibleIds);
    
    // Try each possible ID with type conversion
    for (const patientId of possibleIds) {
      // Try exact match
      let prescription = processedPrescriptions[patientId];
      if (prescription) {
        console.log(`✅ Found prescription using exact match ID: ${patientId}`, prescription);
        return prescription;
      }
      
      // Try string conversion
      const stringId = String(patientId);
      prescription = processedPrescriptions[stringId];
      if (prescription) {
        console.log(`✅ Found prescription using string ID: ${stringId}`, prescription);
        return prescription;
      }
      
      // Try number conversion
      const numberId = Number(patientId);
      if (!isNaN(numberId)) {
        prescription = processedPrescriptions[numberId];
        if (prescription) {
          console.log(`✅ Found prescription using number ID: ${numberId}`, prescription);
          return prescription;
        }
      }
    }
    
    // Last resort: iterate through all prescriptions and check all possible matches
    const allPrescriptions = Object.values(processedPrescriptions);
    for (const presc of allPrescriptions) {
      if (!presc.patientID) continue;
      
      // Check if any of the patient's possible IDs match the prescription's patientID
      const prescriptionPatientId = presc.patientID;
      
      // Try exact matches first
      if (possibleIds.includes(prescriptionPatientId) || 
          possibleIds.some(id => String(id) === String(prescriptionPatientId)) ||
          possibleIds.some(id => Number(id) === Number(prescriptionPatientId))) {
        console.log('✅ Found prescription by comprehensive matching:', presc);
        return presc;
      }
    }

    console.log('❌ No prescription found after all attempts');
    console.log('Patient details:', {
      name: `${patient.first_name} ${patient.last_name}`,
      triedIds: possibleIds,
      availablePrescriptionIds: allPrescriptions.map(p => p.patientID)
    });
    
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Function to calculate sum of comma-separated numbers
  const calculateSum = (numbersString) => {
    if (!numbersString) return 0;
    
    try {
      const cleanedString = numbersString.replace(/["']/g, '').trim();
      const numbersArray = cleanedString.split(',')
        .map(num => num.trim())
        .filter(num => num !== '')
        .map(num => parseFloat(num));
      
      if (numbersArray.some(isNaN)) {
        return 0;
      }
      
      return numbersArray.reduce((sum, num) => sum + num, 0);
    } catch (error) {
      console.error('Error calculating sum:', error);
      return 0;
    }
  };

  // Function to parse comma-separated values into arrays
  const parseCSV = (value) => {
    if (!value) return [];
    try {
      return value.replace(/["']/g, '').split(',').map(item => item.trim()).filter(item => item !== '');
    } catch (error) {
      return [];
    }
  };

  // Toggle patient expansion
  const togglePatient = (patientId) => {
    setExpandedPatients(prev => ({
      ...prev,
      [patientId]: !prev[patientId]
    }));
  };

  // FIXED: Enhanced handleDoneNextMonth function with better error handling
  const handleDoneNextMonth = async (patientId, scheduleId) => {
    try {
      setLoadingPatientId(patientId);
      setError(null);
      
      console.log('Scheduling next appointment for:', {
        patient_id: patientId,
        schedule_id: scheduleId,
        patientId_type: typeof patientId,
        scheduleId_type: typeof scheduleId
      });
      
      // Validate IDs
      if (!patientId || !scheduleId) {
        throw new Error('Missing patient ID or schedule ID');
      }
      
      const response = await axios.post(`${API_BASE_URL}/staff/complete-checkup`, 
        { 
          patient_id: Number(patientId), // Ensure it's a number
          schedule_id: Number(scheduleId) // Ensure it's a number
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Patient checkup completed successfully! Next appointment scheduled. Email notification sent.');
        setShowSuccessModal(true);
        
        // Remove the patient from the expanded list
        const updatedExpandedPatients = { ...expandedPatients };
        delete updatedExpandedPatients[patientId];
        setExpandedPatients(updatedExpandedPatients);
        
        // Refresh dashboard data
        if (fetchDashboardData) {
          setTimeout(() => {
            fetchDashboardData();
          }, 1000);
        }
      } else {
        throw new Error(response.data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error completing checkup:', error);
      let errorMessage = 'Failed to complete checkup. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingPatientId(null);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage(null);
    onClose();
  };

  const handleCloseModal = () => {
    setExpandedPatients({});
    setSearchTerm('');
    setError(null);
    setFilterType('all');
    setShowDateFilter(false);
    onClose();
  };

  // FIXED: Get a stable patient ID for React keys and state management
  const getPatientKey = (patient) => {
    return patient.patientID || patient.patient_id || patient.userID || patient.schedule_id;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Segoe UI, sans-serif',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaCheckCircle style={{ fontSize: '20px', color: '#059669' }} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937', fontWeight: 600 }}>
                  Completed Checkups & PD Distribution
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  Manage patients who have completed their checkups
                </p>
              </div>
            </div>
            <button onClick={handleCloseModal} style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaTimes />
            </button>
          </div>

          {/* Dashboard Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '20px 24px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderLeft: '4px solid #059669'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Completed</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{completedCheckups.length}</div>
            </div>
            
            <div style={{
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Today's Checkups</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {completedCheckups.filter(patient => 
                  patient.appointment_date && isToday(parseISO(patient.appointment_date))).length}
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderLeft: '4px solid #f59e0b'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Patients with Prescriptions</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                {Object.keys(processedPrescriptions).length}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            padding: '16px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              flexWrap: 'wrap',
              alignItems: 'center',
              marginRight: 'auto'
            }}>
              <button
                onClick={() => {setFilterType('all'); setShowDateFilter(false);}}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filterType === 'all' ? '#059669' : '#f3f4f6',
                  color: filterType === 'all' ? '#fff' : '#4b5563',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaCalendarAlt /> All
              </button>
              <button
                onClick={() => {setFilterType('today'); setShowDateFilter(false);}}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filterType === 'today' ? '#059669' : '#f3f4f6',
                  color: filterType === 'today' ? '#fff' : '#4b5563',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaCalendarAlt /> Today
              </button>
              <button
                onClick={() => {setFilterType('upcoming'); setShowDateFilter(false);}}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filterType === 'upcoming' ? '#059669' : '#f3f4f6',
                  color: filterType === 'upcoming' ? '#fff' : '#4b5563',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaCalendarAlt /> Upcoming
              </button>
              <button
                onClick={() => {setFilterType('dateRange'); setShowDateFilter(!showDateFilter);}}
                style={{
                  padding: '8px 16px',
                  backgroundColor: filterType === 'dateRange' ? '#059669' : '#f3f4f6',
                  color: filterType === 'dateRange' ? '#fff' : '#4b5563',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaFilter /> Date Range
              </button>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              flex: '1',
              minWidth: '250px',
              maxWidth: '400px',
              marginRight: '16px'
            }}>
              <FaSearch style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by name or HN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  marginLeft: '8px',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Date Range Filter */}
          {showDateFilter && (
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>From:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', color: '#374151', fontWeight: 500, whiteSpace: 'nowrap' }}>To:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaInfoCircle />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc2626'
                }}
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Patient List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {completedCheckups.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaCheckCircle size={48} style={{ opacity: 0.5 }} />
                <p style={{ margin: 0 }}>
                  No completed checkups found.
                </p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaSearch size={48} style={{ opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: 500 }}>
                  No patients match your search criteria.
                </p>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  Try changing your search terms or date filters.
                </p>
                {(searchTerm || filterType !== 'all' || showDateFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setShowDateFilter(false);
                    }}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ padding: '0' }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 120px',
                  gap: '16px',
                  padding: '12px 24px',
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  <div>Patient Information</div>
                  <div>Hospital Number</div>
                  <div>Appointment Date</div>
                  <div style={{ textAlign: 'center' }}>Status</div>
                </div>
                
                {/* Patient List */}
                {filteredPatients.map(patient => {
                  const patientKey = getPatientKey(patient);
                  const isExpanded = expandedPatients[patientKey];
                  const prescription = getPrescriptionForPatient(patient);
                  const bagCounts = prescription ? parseCSV(prescription.pd_bag_counts) : [];
                  const bagPercentages = prescription ? parseCSV(prescription.pd_bag_percentages) : [];
                  const totalBags = prescription ? calculateSum(prescription.pd_bag_counts) : 0;
                  
                  const hasPrescription = !!prescription;
                  
                  return (
                    <div key={patientKey} style={{
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: isExpanded ? '#f8fafc' : 'white'
                    }}>
                      {/* Patient Header - Clickable */}
                      <div
                        onClick={() => togglePatient(patientKey)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr 120px',
                          gap: '16px',
                          padding: '16px 24px',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                          </div>
                          <div style={{ 
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {patient.first_name} {patient.last_name}
                          </div>
                        </div>
                        
                        <div style={{ color: '#6b7280' }}>
                          {patient.hospitalNumber || 'N/A'}
                        </div>
                        
                        <div style={{ 
                          color: '#6b7280', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px'
                        }}>
                          <FaCalendarAlt size={12} />
                          {patient.appointment_date ? format(parseISO(patient.appointment_date), 'MMM d, yyyy') : 'N/A'}
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            <FaCheckCircle size={12} /> Complete
                          </div>
                        </div>
                      </div>

                      {/* Patient Details - Expandable */}
                      {isExpanded && (
                        <div style={{ 
                          padding: '20px 24px',
                          backgroundColor: '#f8fafc',
                          borderTop: '1px solid #e2e8f0'
                        }}>
                          {/* Prescription Details */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                              <FaPrescriptionBottleAlt style={{ color: '#6366f1', fontSize: '16px' }} />
                              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                                Prescription Details
                              </h4>
                              {!hasPrescription && (
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: '#ef4444', 
                                  backgroundColor: '#fef2f2',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  marginLeft: 'auto'
                                }}>
                                  No Prescription
                                </span>
                              )}
                            </div>

                            {hasPrescription ? (
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                                gap: '16px',
                                marginBottom: '16px'
                              }}>
                                {/* Total Bags and Bag Distribution */}
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 2fr',
                                  gap: '16px',
                                  gridColumn: '1 / -1'
                                }}>
                                  {/* Total Bags */}
                                  <div style={{
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center'
                                  }}>
                                    <div style={{
                                      width: '44px',
                                      height: '44px',
                                      borderRadius: '50%',
                                      backgroundColor: '#eff6ff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginBottom: '10px'
                                    }}>
                                      <FaBoxes style={{ color: '#3b82f6', fontSize: '18px' }} />
                                    </div>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                                      Total Bags
                                    </p>
                                    <p style={{ margin: 0, fontSize: '24px', color: '#1e40af', fontWeight: '700' }}>
                                      {totalBags}
                                    </p>
                                  </div>

                                  {/* PD Bag Distribution */}
                                  {bagCounts.length > 0 && bagPercentages.length > 0 && (
                                    <div style={{
                                      padding: '16px',
                                      backgroundColor: 'white',
                                      borderRadius: '8px',
                                      border: '1px solid #e2e8f0',
                                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <FaBox style={{ color: '#6366f1', fontSize: '14px' }} />
                                        <p style={{ margin: 0, fontSize: '14px', color: '#374151', fontWeight: '600' }}>
                                          Bag Distribution
                                        </p>
                                      </div>
                                      
                                      <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: bagCounts.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))', 
                                        gap: '12px' 
                                      }}>
                                        {bagCounts.map((count, index) => (
                                          <div key={index} style={{
                                            padding: '12px',
                                            backgroundColor: '#f8fafc',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0',
                                            textAlign: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                          }}>
                                            <div style={{ 
                                              fontSize: '13px', 
                                              color: '#64748b', 
                                              marginBottom: '4px',
                                              fontWeight: '500'
                                            }}>
                                              {bagPercentages[index] || 'N/A'} Solution
                                            </div>
                                            <div style={{ 
                                              fontSize: '16px', 
                                              color: '#1e293b', 
                                              fontWeight: '700',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}>
                                              <FaBox style={{ color: '#94a3b8', fontSize: '12px' }} />
                                              {count} {count == 1 ? 'bag' : 'bags'}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Additional Instructions */}
                                {prescription.additional_instructions && (
                                  <div style={{
                                    padding: '16px',
                                    backgroundColor: '#fffbeb',
                                    borderRadius: '8px',
                                    border: '1px solid #fde68a',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)',
                                    gridColumn: '1 / -1'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                      <FaNotesMedical style={{ color: '#f59e0b', fontSize: '14px' }} />
                                      <p style={{ margin: 0, fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                                        Additional Instructions
                                      </p>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.5' }}>
                                      {prescription.additional_instructions}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{
                                padding: '20px',
                                textAlign: 'center',
                                backgroundColor: '#fef2f2',
                                borderRadius: '8px',
                                border: '1px solid #fecaca',
                                marginBottom: '16px'
                              }}>
                                <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>
                                  No prescription found for this patient.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Done, See you next month Button */}
                          <div style={{
                            marginTop: '24px',
                            padding: '16px',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '8px',
                            border: '1px solid #bae6fd',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <FaCalendarCheck style={{ color: '#0369a1', fontSize: '20px' }} />
                              <div>
                                <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#0c4a6e' }}>
                                  Ready to schedule next appointment?
                                </p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e' }}>
                                  This will schedule the next appointment for 28 days from today.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDoneNextMonth(patient.patientID, patient.schedule_id)}
                              disabled={loadingPatientId === patient.patientID}
                              style={{
                                backgroundColor: loadingPatientId === patient.patientID ? '#9ca3af' : '#0369a1',
                                color: 'white',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '6px',
                                cursor: loadingPatientId === patient.patientID ? 'not-allowed' : 'pointer',
                                fontWeight: '500',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                if (loadingPatientId !== patient.patientID) {
                                  e.target.style.backgroundColor = '#0284c7';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (loadingPatientId !== patient.patientID) {
                                  e.target.style.backgroundColor = '#0369a1';
                                }
                              }}
                            >
                              {loadingPatientId === patient.patientID ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  <FaCheckCircle /> Done, See you next month
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
              Showing {filteredPatients.length} of {completedCheckups.length} completed checkups
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
              {Object.keys(processedPrescriptions).length} patients with prescriptions
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            position: 'relative',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaCheckCircle style={{ color: '#10b981', fontSize: '24px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  Success
                </h3>
              </div>
              <button
                onClick={handleCloseSuccessModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: '#6b7280',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Message */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              marginBottom: '24px',
            }}>
              <p style={{ margin: 0, color: '#166534', lineHeight: '1.5' }}>
                {successMessage}
              </p>
            </div>

            {/* Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleCloseSuccessModal}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompletedCheckupsModal;