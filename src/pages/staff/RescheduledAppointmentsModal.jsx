import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaRedo, 
  FaCalendarAlt, 
  FaArchive,
  FaSearch,
  FaChevronDown,
  FaUser,
  FaIdCard,
  FaCommentAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarPlus,
  FaClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isBefore, isToday, isYesterday, isThisWeek, compareDesc, addDays } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';

const RescheduledAppointmentsModal = ({ onClose, rescheduledPatients = [] }) => {
  // Color palette
  const colors = {
    primary: '#3f51b5',
    secondary: '#009688',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    light: '#f5f5f5',
    white: '#ffffff',
    dark: '#212121',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
  };

  const [pastReasons, setPastReasons] = useState([]);
  const [currentReschedules, setCurrentReschedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isArchiving, setIsArchiving] = useState(false);
  const [activeTab, setActiveTab] = useState('reasons'); // 'reasons' or 'current'
  const [showDatePicker, setShowDatePicker] = useState(null); // schedule_id of item being rescheduled
  const [newAppointmentDate, setNewAppointmentDate] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Format date for display
  const formatGroupDate = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return `Today (${format(date, 'MMMM d, yyyy')})`;
    if (isYesterday(date)) return `Yesterday (${format(date, 'MMMM d, yyyy')})`;
    if (isThisWeek(date)) return `${format(date, 'EEEE')} (${format(date, 'MMMM d, yyyy')})`;
    return format(date, 'MMMM d, yyyy');
  };

  // Group items by date
  const groupByDate = (items, dateField = 'reschedule_request_date') => {
    const grouped = {};
    
    items.forEach(item => {
      const dateKey = format(parseISO(item[dateField] || item.appointment_date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: item[dateField] || item.appointment_date,
          items: []
        };
      }
      grouped[dateKey].items.push(item);
    });
    
    // Sort groups by date (newest first)
    const sortedGroups = {};
    Object.keys(grouped)
      .sort((a, b) => compareDesc(parseISO(a), parseISO(b)))
      .forEach(key => {
        sortedGroups[key] = grouped[key];
      });
    
    return sortedGroups;
  };

  // Check if appointment is past due
  const isPastDue = (appointmentDate) => {
    return isBefore(parseISO(appointmentDate), new Date());
  };

  useEffect(() => {
    const now = new Date();
    const past = [];
    const current = [];

    rescheduledPatients.forEach(patient => {
      if (patient.reschedule_reason) {
        // Add to past reasons if it has a reason
        past.push(patient);
      }
      if (patient.reschedule_requested_date && 
          !isBefore(parseISO(patient.reschedule_requested_date), now)) {
        // Add to current reschedules if the new date is in the future
        current.push(patient);
      }
    });

    setPastReasons(groupByDate(past));
    setCurrentReschedules(groupByDate(current, 'reschedule_requested_date'));
    setLoading(false);
  }, [rescheduledPatients]);

  const handleArchiveReason = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to archive this reschedule reason?')) return;

    setIsArchiving(true);
    try {
      const response = await axios.post('/api/staff/archive-reschedule-reason', {
        schedule_id: scheduleId,
        is_past: activeTab === 'reasons' // Indicate if we're archiving from past reasons
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        toast.success('Reschedule reason archived successfully');
        // Update the appropriate list
        if (activeTab === 'reasons') {
          const updatedGroups = {...pastReasons};
          for (const dateKey in updatedGroups) {
            updatedGroups[dateKey].items = updatedGroups[dateKey].items.filter(
              r => r.schedule_id !== scheduleId
            );
            if (updatedGroups[dateKey].items.length === 0) {
              delete updatedGroups[dateKey];
            }
          }
          setPastReasons(updatedGroups);
        } else {
          const updatedGroups = {...currentReschedules};
          for (const dateKey in updatedGroups) {
            updatedGroups[dateKey].items = updatedGroups[dateKey].items.filter(
              r => r.schedule_id !== scheduleId
            );
            if (updatedGroups[dateKey].items.length === 0) {
              delete updatedGroups[dateKey];
            }
          }
          setCurrentReschedules(updatedGroups);
        }
      } else {
        toast.error(response.data.message || 'Failed to archive reason');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error archiving reason');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRescheduleWithNewDate = async (scheduleId, patientName) => {
    if (!newAppointmentDate) {
      toast.error('Please select a new appointment date');
      return;
    }

    const selectedDate = parseISO(newAppointmentDate);
    const today = new Date();
    
    if (isBefore(selectedDate, today)) {
      toast.error('New appointment date cannot be in the past');
      return;
    }

    if (!window.confirm(`Are you sure you want to reschedule ${patientName} to ${format(selectedDate, 'MMMM d, yyyy')}?`)) {
      return;
    }

    setIsRescheduling(true);
    try {
      const response = await axios.post('/api/staff/reschedule-with-new-date', {
        schedule_id: scheduleId,
        new_appointment_date: newAppointmentDate
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        toast.success(`Appointment rescheduled to ${format(selectedDate, 'MMMM d, yyyy')}`);
        
        // Update the lists
        if (activeTab === 'reasons') {
          const updatedGroups = {...pastReasons};
          for (const dateKey in updatedGroups) {
            updatedGroups[dateKey].items = updatedGroups[dateKey].items.filter(
              r => r.schedule_id !== scheduleId
            );
            if (updatedGroups[dateKey].items.length === 0) {
              delete updatedGroups[dateKey];
            }
          }
          setPastReasons(updatedGroups);
        } else {
          const updatedGroups = {...currentReschedules};
          for (const dateKey in updatedGroups) {
            updatedGroups[dateKey].items = updatedGroups[dateKey].items.filter(
              r => r.schedule_id !== scheduleId
            );
            if (updatedGroups[dateKey].items.length === 0) {
              delete updatedGroups[dateKey];
            }
          }
          setCurrentReschedules(updatedGroups);
        }
        
        setShowDatePicker(null);
        setNewAppointmentDate('');
      } else {
        toast.error(response.data.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rescheduling appointment');
    } finally {
      setIsRescheduling(false);
    }
  };

  const toggleGroup = (dateKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  // Filter items based on search term
  const filterItems = (groups) => {
    return Object.keys(groups).reduce((acc, dateKey) => {
      const group = groups[dateKey];
      const filtered = group.items.filter(item => {
        const matchesSearch = 
          `${item.first_name} ${item.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.hospitalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.reschedule_reason && item.reschedule_reason.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
      });

      if (filtered.length > 0) {
        acc[dateKey] = {
          date: group.date,
          items: filtered
        };
      }
      return acc;
    }, {});
  };

  const filteredPastReasons = filterItems(pastReasons);
  const filteredCurrentReschedules = filterItems(currentReschedules);

  const renderItem = (item, isPast = false) => (
    <div 
      key={item.schedule_id}
      style={{ 
        display: 'flex',
        alignItems: 'flex-start',
        padding: '16px 24px',
        backgroundColor: colors.white,
        transition: 'background-color 0.2s',
        borderLeft: isPastDue(item.appointment_date) ? `4px solid ${colors.warning}` : '4px solid transparent'
      }}
    >
      <div style={{ 
        width: '40px',
        paddingRight: '16px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `${colors.secondary}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FaUser color={colors.secondary} size={16} />
        </div>
      </div>
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            fontWeight: 600,
            color: colors.dark,
            fontSize: '15px'
          }}>
            {item.first_name} {item.last_name}
            {isPastDue(item.appointment_date) && (
              <span style={{
                marginLeft: '8px',
                backgroundColor: colors.warning,
                color: colors.white,
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 500
              }}>
                Past Due
              </span>
            )}
          </div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: colors.gray600,
            fontSize: '14px'
          }}>
            <FaIdCard size={14} />
            <span>{item.hospitalNumber}</span>
          </div>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isPastDue(item.appointment_date) ? colors.warning : colors.gray600,
            fontSize: '14px',
            fontWeight: isPastDue(item.appointment_date) ? 600 : 400
          }}>
            <FaCalendarAlt size={14} />
            <span>Original: {format(parseISO(item.appointment_date), 'PP')}</span>
          </div>
          {!isPast && item.reschedule_requested_date && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: colors.info,
              fontSize: '14px',
              fontWeight: 500
            }}>
              <FaCalendarAlt size={14} />
              <span>New: {format(parseISO(item.reschedule_requested_date), 'PP')}</span>
            </div>
          )}
        </div>
        {item.reschedule_reason && (
          <div style={{ 
            backgroundColor: colors.gray100,
            padding: '12px',
            borderRadius: '8px',
            marginTop: '8px'
          }}>
            <div style={{
              color: colors.gray600,
              fontWeight: 500,
              fontSize: '13px',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <FaCommentAlt size={14} />
              <span>Reschedule Reason</span>
            </div>
            <p style={{ 
              margin: 0,
              color: colors.dark,
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {item.reschedule_reason}
            </p>
          </div>
        )}

        {/* Date Picker for Rescheduling */}
        {showDatePicker === item.schedule_id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              backgroundColor: colors.gray100,
              padding: '16px',
              borderRadius: '8px',
              marginTop: '12px',
              border: `1px solid ${colors.gray300}`
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: 500,
                  color: colors.dark,
                  fontSize: '14px'
                }}>
                  New Appointment Date
                </label>
                <input
                  type="date"
                  value={newAppointmentDate}
                  onChange={(e) => setNewAppointmentDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: `1px solid ${colors.gray300}`,
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button
                  onClick={() => handleRescheduleWithNewDate(item.schedule_id, `${item.first_name} ${item.last_name}`)}
                  disabled={isRescheduling || !newAppointmentDate}
                  style={{
                    backgroundColor: colors.success,
                    color: colors.white,
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: isRescheduling || !newAppointmentDate ? 'not-allowed' : 'pointer',
                    opacity: isRescheduling || !newAppointmentDate ? 0.6 : 1,
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isRescheduling ? (
                    <>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid transparent',
                        borderTopColor: colors.white,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Rescheduling...
                    </>
                  ) : (
                    <>
                      <FaCalendarPlus size={14} />
                      Confirm New Date
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDatePicker(null);
                    setNewAppointmentDate('');
                  }}
                  disabled={isRescheduling}
                  style={{
                    backgroundColor: colors.gray300,
                    color: colors.dark,
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: isRescheduling ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            {newAppointmentDate && (
              <div style={{
                marginTop: '8px',
                fontSize: '13px',
                color: colors.gray600,
                fontStyle: 'italic'
              }}>
                New appointment will be scheduled for: {format(parseISO(newAppointmentDate), 'PPPP')}
              </div>
            )}
          </motion.div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Reschedule Button - Show for past due appointments with reasons */}
        {isPastDue(item.appointment_date) && item.reschedule_reason && (
          <button
            onClick={() => {
              setShowDatePicker(showDatePicker === item.schedule_id ? null : item.schedule_id);
              setNewAppointmentDate('');
            }}
            disabled={isRescheduling}
            style={{
              backgroundColor: colors.info,
              color: colors.white,
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            <FaCalendarPlus size={12} />
            {showDatePicker === item.schedule_id ? 'Cancel' : 'Set New Date'}
          </button>
        )}
        
        <button
          onClick={() => handleArchiveReason(item.schedule_id)}
          disabled={isArchiving || isRescheduling}
          style={{
            background: 'none',
            border: 'none',
            color: colors.gray500,
            cursor: isArchiving || isRescheduling ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'all 0.2s',
            opacity: isArchiving || isRescheduling ? 0.6 : 1
          }}
        >
          <FaArchive size={14} />
          <span style={{ fontSize: '14px' }}>Archive</span>
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(33, 33, 33, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          backgroundColor: colors.white,
          borderRadius: '12px',
          width: '95%',
          maxWidth: '1400px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.gray200}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.white,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: `${colors.primary}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FaRedo style={{ color: colors.primary, fontSize: '20px' }} />
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: 600, 
                color: colors.dark,
              }}>
                Rescheduled Appointments
              </h3>
              <p style={{
                margin: '4px 0 0',
                fontSize: '14px',
                color: colors.gray600,
              }}>
                {rescheduledPatients.filter(p => p.reschedule_reason).length} reasons • {currentReschedules.length} current reschedules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.gray500,
              fontSize: '20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.gray200}`,
        }}>
          <button
            onClick={() => setActiveTab('reasons')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === 'reasons' ? colors.white : colors.gray100,
              border: 'none',
              borderBottom: activeTab === 'reasons' ? `2px solid ${colors.primary}` : 'none',
              color: activeTab === 'reasons' ? colors.primary : colors.gray600,
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaCommentAlt size={14} />
            Past Reasons ({Object.values(pastReasons).reduce((acc, group) => acc + group.items.length, 0)})
          </button>
          <button
            onClick={() => setActiveTab('current')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeTab === 'current' ? colors.white : colors.gray100,
              border: 'none',
              borderBottom: activeTab === 'current' ? `2px solid ${colors.primary}` : 'none',
              color: activeTab === 'current' ? colors.primary : colors.gray600,
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaCalendarAlt size={14} />
            Current Reschedules ({Object.values(currentReschedules).reduce((acc, group) => acc + group.items.length, 0)})
          </button>
        </div>

        {/* Search */}
        <div style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${colors.gray200}`,
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
          }}>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'reasons' ? 'past reasons' : 'current reschedules'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: '8px',
                border: `1px solid ${colors.gray300}`,
                fontSize: '14px',
                transition: 'all 0.2s',
                backgroundColor: colors.white,
              }}
            />
            <FaSearch style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.gray500,
              fontSize: '14px'
            }} />
          </div>
        </div>

        {/* Info Banner for Past Due Appointments */}
        {activeTab === 'reasons' && Object.values(filteredPastReasons).some(group => 
          group.items.some(item => isPastDue(item.appointment_date) && item.reschedule_reason)
        ) && (
          <div style={{
            backgroundColor: `${colors.warning}15`,
            border: `1px solid ${colors.warning}30`,
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaExclamationTriangle color={colors.warning} size={16} />
            <div>
              <div style={{ fontWeight: 600, color: colors.dark, fontSize: '14px' }}>
                Past Due Appointments with Reschedule Reasons
              </div>
              <div style={{ color: colors.gray600, fontSize: '13px' }}>
                You can set new appointment dates for patients who missed their appointments and provided reschedule reasons.
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              border: `3px solid ${colors.gray200}`, 
              borderTopColor: colors.primary, 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ 
              margin: 0, 
              color: colors.gray600,
              fontSize: '15px'
            }}>
              Loading data...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && (
          (
            (activeTab === 'reasons' && Object.keys(filteredPastReasons).length === 0) ||
            (activeTab === 'current' && Object.keys(filteredCurrentReschedules).length === 0)
          ) ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              {searchTerm ? (
                <>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.warning}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FaExclamationTriangle style={{ fontSize: '28px', color: colors.warning }} />
                  </div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.dark
                  }}>
                    No {activeTab === 'reasons' ? 'past reasons' : 'current reschedules'} found
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: colors.gray600,
                    fontSize: '15px',
                    maxWidth: '400px',
                    lineHeight: '1.6'
                  }}>
                    No {activeTab === 'reasons' ? 'past reschedule reasons' : 'current rescheduled appointments'} match "{searchTerm}"
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      background: colors.primary,
                      color: colors.white,
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '14px',
                      marginTop: '16px',
                      transition: 'all 0.2s',
                    }}
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.success}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FaCheckCircle style={{ fontSize: '32px', color: colors.success }} />
                  </div>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '18px',
                    fontWeight: 600,
                    color: colors.dark
                  }}>
                    No {activeTab === 'reasons' ? 'past reschedule reasons' : 'current rescheduled appointments'}
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: colors.gray600,
                    fontSize: '15px',
                    maxWidth: '400px',
                    lineHeight: '1.6'
                  }}>
                    {activeTab === 'reasons' 
                      ? 'All reschedule reasons have been archived or no reasons were provided.'
                      : 'No upcoming rescheduled appointments found.'}
                  </p>
                </>
              )}
            </div>
          ) : null
        )}
        
        {/* Content */}
        {!loading && (
          <div style={{ 
            overflowY: 'auto', 
            flex: 1,
            position: 'relative'
          }}>
            {activeTab === 'reasons' ? (
              Object.keys(filteredPastReasons).map(dateKey => {
                const group = filteredPastReasons[dateKey];
                const isExpanded = expandedGroups[dateKey] !== false;

                return (
                  <div key={dateKey} style={{ 
                    borderBottom: `1px solid ${colors.gray200}`,
                    backgroundColor: isExpanded ? colors.white : colors.gray100
                  }}>
                    {/* Group Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? colors.white : colors.gray100,
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => toggleGroup(dateKey)}
                    >
                      <div style={{ 
                        width: '40px',
                        paddingRight: '16px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaChevronDown style={{ 
                          color: colors.gray500,
                          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s'
                        }} />
                      </div>
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{ 
                          flex: 1,
                          fontWeight: 600,
                          color: colors.dark,
                        }}>
                          {formatGroupDate(group.date)}
                        </div>
                        <div style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600
                        }}>
                          {group.items.length} {group.items.length === 1 ? 'reason' : 'reasons'}
                        </div>
                      </div>
                    </div>

                    {/* Group Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {group.items.map((item) => renderItem(item, true))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              Object.keys(filteredCurrentReschedules).map(dateKey => {
                const group = filteredCurrentReschedules[dateKey];
                const isExpanded = expandedGroups[dateKey] !== false;

                return (
                  <div key={dateKey} style={{ 
                    borderBottom: `1px solid ${colors.gray200}`,
                    backgroundColor: isExpanded ? colors.white : colors.gray100
                  }}>
                    {/* Group Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? colors.white : colors.gray100,
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => toggleGroup(dateKey)}
                    >
                      <div style={{ 
                        width: '40px',
                        paddingRight: '16px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaChevronDown style={{ 
                          color: colors.gray500,
                          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s'
                        }} />
                      </div>
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div style={{ 
                          flex: 1,
                          fontWeight: 600,
                          color: colors.dark,
                        }}>
                          {formatGroupDate(group.date)}
                        </div>
                        <div style={{
                          backgroundColor: colors.info,
                          color: colors.white,
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 600
                        }}>
                          {group.items.length} {group.items.length === 1 ? 'reschedule' : 'reschedules'}
                        </div>
                      </div>
                    </div>

                    {/* Group Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {group.items.map((item) => renderItem(item))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        )}
      </motion.div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default RescheduledAppointmentsModal;