import React, { useState, useEffect } from 'react';
import {
  FaUserClock,
  FaTimes,
  FaCalendarAlt,
  FaUser,
  FaIdCard,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSearch,
  FaEnvelope,
  FaFilter
} from 'react-icons/fa';
import { format, parseISO, isToday, isFuture, startOfDay, endOfDay } from 'date-fns';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8000/api';

const PendingPatientDashboard = ({ onClose, fetchDashboardData }) => {
  const [pendingPatients, setPendingPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [sendingEmails, setSendingEmails] = useState({});

  const fetchPendingPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/staff/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const data = await response.json();

      if (!data.allSchedules) {
        throw new Error('Invalid data structure from server');
      }

      const filtered = data.allSchedules.filter(patient => 
        patient.confirmation_status === 'pending' && patient.appointment_date
      );

      setPendingPatients(filtered);
    } catch (error) {
      setError(error.message || 'Failed to load pending appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPatients();
  }, []);

  useEffect(() => {
    let results = [...pendingPatients];
    
    // Apply filter type
    if (filterType === 'today') {
      results = results.filter(patient => 
        isToday(parseISO(patient.appointment_date))
      );
    } else if (filterType === 'upcoming') {
      results = results.filter(patient => 
        isFuture(parseISO(patient.appointment_date)) && !isToday(parseISO(patient.appointment_date))
      );
    } else if (filterType === 'dateRange' && showDateFilter) {
      results = results.filter(patient => {
        const appointmentDate = parseISO(patient.appointment_date);
        const startDate = startOfDay(parseISO(dateRange.start));
        const endDate = endOfDay(parseISO(dateRange.end));
        return appointmentDate >= startDate && appointmentDate <= endDate;
      });
    }
    
    // Apply search term
    const lowerSearch = searchTerm.toLowerCase();
    results = results.filter(patient =>
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(lowerSearch) ||
      patient.hospitalNumber.toLowerCase().includes(lowerSearch)
    );
    
    setFilteredPatients(results);
  }, [searchTerm, pendingPatients, filterType, dateRange, showDateFilter]);

  const sendReminderEmail = async (patient) => {
    try {
      setSendingEmails(prev => ({ ...prev, [patient.schedule_id]: true }));
      
      const response = await fetch(`${API_BASE_URL}/staff/send-reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schedule_id: patient.schedule_id,
          patient_name: `${patient.first_name} ${patient.last_name}`,
          appointment_date: format(parseISO(patient.appointment_date), 'MMMM d, yyyy')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder email');
      }

      alert(`Reminder email sent to ${patient.first_name} ${patient.last_name}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSendingEmails(prev => ({ ...prev, [patient.schedule_id]: false }));
    }
  };

  const sendRemindersToAll = async () => {
    if (filteredPatients.length === 0) return;
    
    if (!window.confirm(`Send reminder emails to all ${filteredPatients.length} patients?`)) {
      return;
    }

    try {
      for (const patient of filteredPatients) {
        await sendReminderEmail(patient);
      }
      alert('All reminder emails sent successfully!');
    } catch (error) {
      alert(`Error sending some emails: ${error.message}`);
    }
  };

  return (
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
          maxWidth: '1200px', // Increased from 1000px to 1200px
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
              backgroundColor: '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaUserClock style={{ fontSize: '20px', color: '#4f46e5' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#1f2937', fontWeight: 600 }}>
                Pending Confirmations Dashboard
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                Manage patients awaiting appointment confirmation
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
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
            borderLeft: '4px solid #4f46e5'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Pending</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{pendingPatients.length}</div>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ fontSize: '14px', color: '6b7280', marginBottom: '8px' }}>Today's Appointments</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {pendingPatients.filter(patient => isToday(parseISO(patient.appointment_date))).length}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Upcoming Appointments</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {pendingPatients.filter(patient => 
                isFuture(parseISO(patient.appointment_date)) && !isToday(parseISO(patient.appointment_date))).length}
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
              onClick={() => {setFilterType('today'); setShowDateFilter(false);}}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'today' ? '#4f46e5' : '#f3f4f6',
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
              <FaClock /> Today
            </button>
            <button
              onClick={() => {setFilterType('upcoming'); setShowDateFilter(false);}}
              style={{
                padding: '8px 16px',
                backgroundColor: filterType === 'upcoming' ? '#4f46e5' : '#f3f4f6',
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
                backgroundColor: filterType === 'dateRange' ? '#4f46e5' : '#f3f4f6',
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

          {filteredPatients.length > 0 && (
            <button
              onClick={sendRemindersToAll}
              disabled={Object.values(sendingEmails).some(status => status)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 500,
                opacity: Object.values(sendingEmails).some(status => status) ? 0.6 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              <FaEnvelope /> 
              {Object.values(sendingEmails).some(status => status) 
                ? 'Sending...' 
                : `Send All (${filteredPatients.length})`}
            </button>
          )}
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

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {error ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#dc2626', 
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FaExclamationTriangle size={30} />
              <h4 style={{ margin: 0 }}>Error Loading Data</h4>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          ) : loading ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              padding: '40px 20px' 
            }}>
              Loading patient data...
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
              <FaUserClock size={48} style={{ opacity: 0.5 }} />
              <p style={{ margin: 0 }}>
                No pending patients {filterType === 'today' ? 'for today' : 
                filterType === 'upcoming' ? 'in the upcoming days' : 
                'in the selected date range'}.
              </p>
            </div>
          ) : (
            <div style={{ padding: '0' }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 120px', // Adjusted column widths
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
                <div style={{ textAlign: 'center' }}>Action</div>
              </div>
              
              {/* Patient List */}
              {filteredPatients.map((patient, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr 120px', // Adjusted column widths
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#fafafa'
                  }
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#e0e7ff',
                      color: '#4f46e5',
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
                    {patient.hospitalNumber}
                  </div>
                  
                  <div style={{ 
                    color: '#6b7280', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px'
                  }}>
                    <FaCalendarAlt size={12} />
                    {format(parseISO(patient.appointment_date), 'MMM d, yyyy')}
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => sendReminderEmail(patient)}
                      disabled={sendingEmails[patient.schedule_id]}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: sendingEmails[patient.schedule_id] ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: sendingEmails[patient.schedule_id] ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 500
                      }}
                    >
                      <FaEnvelope size={12} />
                      {sendingEmails[patient.schedule_id] ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              ))}
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
            Showing {filteredPatients.length} of {pendingPatients.length} pending appointments
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PendingPatientDashboard;