import React, { useState } from 'react';
import { 
  FaCheckCircle, 
  FaUserClock, 
  FaExchangeAlt, 
  FaCalendarTimes,
  FaInfoCircle,
  FaChevronRight,
  FaCalendarCheck,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { format, isToday, isAfter, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import MissedAppointmentsNotification from './MissedAppointmentsNotification';
import ConfirmedPatientTodayModal from './ConfirmedPatientTodayModal';
import PendingPatientModal from './PendingPatientModal';
import AppointmentStatusDetailsModal from './AppointmentStatusDetailsModal';
import RescheduledAppointmentsModal from './RescheduledAppointmentsModal';

const StatusSummaryCard = ({ 
  confirmedCount = 0,
  pendingCount = 0,
  rescheduledCount = 0,
  missedCount = 0, 
  yesterdayMissedCount = 0,
  olderMissedCount = 0,
  fetchDashboardData
}) => {
  const [showMissedAppointments, setShowMissedAppointments] = useState(false);
  const [showConfirmedModal, setShowConfirmedModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showStatusDetailsModal, setShowStatusDetailsModal] = useState(false);
  const [showRescheduledModal, setShowRescheduledModal] = useState(false);

  const statusItems = [
    {
      icon: <FaCheckCircle size={18} />,
      title: "Confirmed Appointments",
      count: confirmedCount,
      bgColor: "rgba(16, 185, 129, 0.05)",
      iconColor: "#10b981",
      // period: `${format(new Date(), 'MMM d')}-${format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'MMM d')}`,
      onClick: () => setShowConfirmedModal(true)
    },
    {
      icon: <FaUserClock size={18} />,
      title: "Pending Appointments",
      count: pendingCount,
      bgColor: "rgba(245, 158, 11, 0.05)",
      iconColor: "#f59e0b",
      trend: "neutral",
      onClick: () => setShowPendingModal(true)
    },
    {
      icon: <FaExchangeAlt size={18} />,
      title: "Rescheduled Appointments",
      count: rescheduledCount,
      bgColor: "rgba(59, 130, 246, 0.05)",
      iconColor: "#3b82f6",
      onClick: () => setShowRescheduledModal(true)
    },
    {
      icon: <FaCalendarTimes size={18} />,
      title: "Missed Appointments",
      count: missedCount,
      bgColor: "rgba(239, 68, 68, 0.05)",
      iconColor: "#ef4444",
      yesterdayCount: yesterdayMissedCount,
      olderCount: olderMissedCount,
      onClick: () => setShowMissedAppointments(true)
    }
  ];

  return (
    <>
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
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          width: "125%",
          height: "650px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
            <FaCalendarCheck style={{ color: "#477977", fontSize: "20px" }} />
            <h3 style={{
              margin: 0, fontSize: "20px", fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em"
            }}>Appointment Status</h3>
          </div>
        </div>

        <div style={{
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "16px", 
          padding: "20px",
          flex: 1,
          overflow: "hidden"
        }}>
          {statusItems.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                backgroundColor: item.bgColor,
                padding: "20px",
                borderRadius: "14px",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                border: `1px solid ${item.bgColor.replace('0.05)', '0.1)')}`,
                cursor: item.onClick ? "pointer" : "default",
                minHeight: "120px"
              }}
              onClick={item.onClick}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: item.iconColor,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                }}>
                  {item.icon}
                </div>
                {item.trend && item.trend !== "neutral" && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600,
                    padding: "4px 8px", borderRadius: "12px",
                    backgroundColor: item.trend === "up" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: item.trend === "up" ? "#10b981" : "#ef4444",
                  }}>
                    {item.trend === "up" ? <FaArrowUp size={11} /> : <FaArrowDown size={11} />}
                    <span>{item.trendValue}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#334155" }}>{item.title}</span>
                {item.period && (
                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>{item.period}</span>
                )}
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "14px"
              }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{item.count}</div>
                {(item.yesterdayCount || item.olderCount) && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    {item.yesterdayCount > 0 && (
                      <div style={{
                        fontSize: "13px", color: "#64748b", fontWeight: 500,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        padding: "4px 8px", borderRadius: "8px"
                      }}>
                        Yesterday: {item.yesterdayCount}
                      </div>
                    )}
                    {item.olderCount > 0 && (
                      <div style={{
                        fontSize: "13px", color: "#64748b", fontWeight: 500,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        padding: "4px 8px", borderRadius: "8px"
                      }}>
                        Older: {item.olderCount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{
          padding: "16px 24px", borderTop: "1px solid #f1f5f9",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          backgroundColor: "#f8fafc",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8" }}>
            <FaInfoCircle size={13} />
            <span>Updated just now</span>
          </div>
          <button onClick={() => setShowStatusDetailsModal(true)} style={{
            display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none",
            color: "#477977", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            padding: "6px 12px", borderRadius: "8px",
            backgroundColor: "rgba(71, 121, 119, 0.1)",
          }}>
            View details <FaChevronRight size={13} />
          </button>
        </div>
      </motion.div>

      {showMissedAppointments && (
        <MissedAppointmentsNotification 
          onClose={() => setShowMissedAppointments(false)}
          missedCount={missedCount}
          yesterdayMissedCount={yesterdayMissedCount}
          olderMissedCount={olderMissedCount}
          fetchDashboardData={fetchDashboardData}
        />
      )}

      {showConfirmedModal && (
        <ConfirmedPatientTodayModal
          onClose={() => setShowConfirmedModal(false)}
          fetchDashboardData={fetchDashboardData}
          confirmedCount={confirmedCount}
        />
      )}

      {showPendingModal && (
        <PendingPatientModal
          onClose={() => setShowPendingModal(false)}
          fetchDashboardData={fetchDashboardData}
          pendingCount={pendingCount}
        />
      )}

      {showStatusDetailsModal && (
        <AppointmentStatusDetailsModal
          onClose={() => setShowStatusDetailsModal(false)}
          confirmedCount={confirmedCount}
          pendingCount={pendingCount}
          rescheduledCount={rescheduledCount}
          missedCount={missedCount}
        />
      )}

      {showRescheduledModal && (
        <RescheduledAppointmentsModal
          onClose={() => setShowRescheduledModal(false)}
          rescheduledCount={rescheduledCount}
        />
      )}
    </>
  );
};

export default StatusSummaryCard;