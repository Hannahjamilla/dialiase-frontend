import React, { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaFilter,
  FaInfoCircle, 
  FaChevronDown
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PatientsSchedWeek = ({ 
  filteredAppointments, 
  setActiveTab,
  handlePatientClick
}) => {
  const [filter, setFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Filter appointments based on selected filter
  const getFilteredAppointments = () => {
    if (filter === 'all') return filteredAppointments;
    
    return filteredAppointments.filter(appointment => {
      const daysDifference = getDaysDifference(appointment.appointment_date);
      
      switch(filter) {
        case 'today':
          return daysDifference === 0;
        case 'tomorrow':
          return daysDifference === 1;
        case 'soon':
          return daysDifference > 1 && daysDifference <= 3;
        case 'upcoming':
          return daysDifference > 3;
        default:
          return true;
      }
    });
  };
  
  const filteredAppointmentsByStatus = getFilteredAppointments();

  const getDaysDifference = (appointmentDate) => {
    if (!appointmentDate) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointment = new Date(appointmentDate);
    appointment.setHours(0, 0, 0, 0);
    const diffTime = appointment - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityLevel = (daysDifference) => {
    if (daysDifference === 0) return { label: "Today", color: "#16a34a", bg: "#f0fdf4" };
    if (daysDifference === 1) return { label: "Tomorrow", color: "#2563eb", bg: "#eff6ff" };
    if (daysDifference <= 3) return { label: "Soon", color: "#d97706", bg: "#fef3c7" };
    return { label: "Upcoming", color: "#475569", bg: "#f8fafc" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFilterLabel = () => {
    switch(filter) {
      case 'today': return 'Today';
      case 'tomorrow': return 'Tomorrow';
      case 'soon': return 'Next 3 Days';
      case 'upcoming': return 'Upcoming';
      default: return 'All Appointments';
    }
  };

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return filteredAppointments.length;
    
    return filteredAppointments.filter(appointment => {
      const daysDifference = getDaysDifference(appointment.appointment_date);
      
      switch(filterType) {
        case 'today': return daysDifference === 0;
        case 'tomorrow': return daysDifference === 1;
        case 'soon': return daysDifference > 1 && daysDifference <= 3;
        case 'upcoming': return daysDifference > 3;
        default: return true;
      }
    }).length;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
        overflow: "hidden",
        border: "1px solid #f1f5f9",
        marginTop: "20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        width: "125%",
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: "20px 24px", 
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            backgroundColor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#16a34a"
          }}>
            <FaCalendarAlt size={18} />
          </div>
          <div>
            <h3 style={{
              margin: 0, 
              fontSize: "18px", 
              fontWeight: 600, 
              color: "#0f172a", 
              letterSpacing: "-0.01em"
            }}>
              Upcoming Appointments
            </h3>
          </div>
        </div>
      </div>
      
      {/* Filter Dropdown */}
      <div style={{
        padding: "16px 24px",
        borderBottom: filteredAppointments.length > 0 ? "1px solid #f1f5f9" : "none",
        backgroundColor: "#f8fafc",
        position: "relative"
      }}>
        <div 
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            cursor: "pointer",
            transition: "all 0.2s ease",
            ':hover': {
              borderColor: "#477977",
            }
          }}
        >
          <FaFilter size={14} color="#64748b" />
          <span style={{ fontSize: "14px", color: "#334155", fontWeight: "500" }}>
            {getFilterLabel()}
          </span>
          <span style={{ 
            marginLeft: "auto", 
            fontSize: "12px", 
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <FaChevronDown 
              size={12} 
              style={{ 
                transform: showFilterDropdown ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease"
              }} 
            />
          </span>
        </div>
        
        {/* Filter Dropdown Menu */}
        <AnimatePresence>
          {showFilterDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                top: "100%",
                left: "24px",
                right: "24px",
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e2e8f0",
                zIndex: 10,
                marginTop: "4px",
                overflow: "hidden"
              }}
            >
              {[
                { key: 'all', label: 'All Appointments' },
                { key: 'today', label: 'Today' },
                { key: 'tomorrow', label: 'Tomorrow' },
                { key: 'soon', label: 'Next 3 Days' },
                { key: 'upcoming', label: 'Upcoming' }
              ].map((item) => {
                const isSelected = filter === item.key;
                
                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      setFilter(item.key);
                      setShowFilterDropdown(false);
                    }}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isSelected ? "#f0fdf4" : "transparent",
                      transition: "background-color 0.2s ease",
                      borderBottom: "1px solid #f1f5f9",
                      ':last-child': {
                        borderBottom: "none"
                      },
                      ':hover': {
                        backgroundColor: isSelected ? "#f0fdf4" : "#f8fafc"
                      }
                    }}
                  >
                    <span style={{ 
                      fontSize: "14px", 
                      color: isSelected ? "#16a34a" : "#334155",
                      fontWeight: isSelected ? "600" : "400"
                    }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Appointments List */}
      <div style={{
        maxHeight: "500px",
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#e2e8f0 transparent"
      }}>
        {filteredAppointmentsByStatus.length > 0 ? (
          <div style={{ padding: "8px 0" }}>
            {filteredAppointmentsByStatus.map((appointment, index) => {
              const daysDifference = getDaysDifference(appointment.appointment_date);
              const isRescheduled = appointment.checkup_remarks?.includes('Automatically rescheduled');
              const originalDate = isRescheduled && appointment.checkup_remarks.match(/\d{4}-\d{2}-\d{2}/)?.[0];
              const priority = getPriorityLevel(daysDifference);

              return (
                <motion.div 
                  key={`${appointment.patientID}-${index}`}
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePatientClick(appointment)}
                  style={{
                    padding: "16px 24px 16px 20px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderBottom: index !== filteredAppointmentsByStatus.length - 1 ? "1px solid #f1f5f9" : "none",
                    position: "relative"
                  }}
                >
                  {/* Priority indicator bar */}
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "4px",
                    backgroundColor: priority.color,
                    borderTopLeftRadius: "4px",
                    borderBottomLeftRadius: "4px"
                  }}></div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px"
                  }}>
                    <div>
                      <div style={{
                        fontWeight: "600",
                        color: "#1e293b",
                        fontSize: "15px",
                        marginBottom: "4px"
                      }}>
                        {appointment.first_name} {appointment.last_name}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: "#64748b"
                      }}>
                        HN: {appointment.hospitalNumber || 'N/A'}
                      </div>
                    </div>
                    
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "6px"
                    }}>
                      <span style={{
                        backgroundColor: priority.bg,
                        color: priority.color,
                        fontSize: "12px",
                        fontWeight: "500",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: priority.color
                        }}></span>
                        {daysDifference <= 7 && priority.label !== "Today" && priority.label !== "Tomorrow" 
                          ? `In ${daysDifference} days` 
                          : priority.label}
                      </span>
                      
                      <div style={{
                        fontSize: "13px",
                        color: "#475569",
                        fontWeight: "500"
                      }}>
                        {formatDate(appointment.appointment_date)}
                      </div>
                    </div>
                  </div>
                  
                  {isRescheduled && (
                    <div style={{
                      marginTop: "12px",
                      fontSize: "12px",
                      color: "#d97706",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                      backgroundColor: "#fffbeb",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      borderLeft: "3px solid #f59e0b"
                    }}>
                      <FaInfoCircle size={12} style={{ flexShrink: 0, marginTop: "1px" }} />
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          Rescheduled from {originalDate && formatDate(originalDate)}
                        </div>
                        <div style={{ 
                          fontSize: "11px", 
                          opacity: 0.8,
                          marginTop: "2px"
                        }}>
                          Previous appointment was automatically rescheduled
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: "60px 16px",
              textAlign: "center",
              background: "linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)"
            }}
          >
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -5, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 2 
              }}
              style={{
                color: "#e2e8f0",
                fontSize: "48px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <FaCalendarAlt />
            </motion.div>
            
            <div style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#475569",
              marginBottom: "8px"
            }}>
              No appointments found
            </div>
            
            <p style={{
              fontSize: "14px",
              color: "#94a3b8",
              margin: 0,
              maxWidth: "240px",
              margin: "0 auto",
              lineHeight: "1.5"
            }}>
              {filter === 'all' 
                ? "You have no upcoming appointments" 
                : `No ${getFilterLabel().toLowerCase()} appointments found`}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PatientsSchedWeek;