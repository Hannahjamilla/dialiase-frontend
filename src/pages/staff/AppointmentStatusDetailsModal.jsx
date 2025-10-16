import React from 'react';
import {
  FaTimes,
  FaUserCheck,
  FaHourglassHalf,
  FaRedo,
  FaUserTimes,
  FaInfoCircle,
  FaExclamationTriangle,
  FaBullseye,
  FaChartLine
} from 'react-icons/fa';
import { format } from 'date-fns';

const AppointmentStatusDetailsModal = ({
  onClose,
  confirmedCount = 0,
  pendingCount = 0,
  rescheduledCount = 0,
  missedCount = 0,
}) => {
  const totalPatients = confirmedCount + pendingCount + rescheduledCount + missedCount;
  const dailyTarget = 80;
  const targetPercentage = Math.min(100, (confirmedCount / dailyTarget) * 100);
  const isTargetMet = confirmedCount >= dailyTarget;

  const getPercentage = (count) =>
    totalPatients > 0 ? ((count / totalPatients) * 100).toFixed(1) : '0.0';

  // Color definitions based on your requirements
  const colors = {
    primary: '#395886',
    white: '#FFFFFF',
    green: '#477977',
    confirmed: '#477977', // Using your green for confirmed
    pending: '#395886',   // Using your primary blue for pending
    rescheduled: '#6366f1', // A nice purple for rescheduled
    missed: '#dc2626',    // Keeping red for missed (important for warnings)
    background: '#f8fafc',
    textPrimary: '#0f172a',
    textSecondary: '#64748b'
  };

  const summaryCard = (label, Icon, count, color = colors.primary, description) => (
    <div
      style={{
        backgroundColor: colors.white,
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${color}15`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        height: '100%',
      }}
      className="summary-card"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 500, marginBottom: '4px' }}>{label}</div>
          <div style={{ fontWeight: 700, fontSize: '24px', color: colors.textPrimary }}>{count}</div>
        </div>
        {description && (
          <div title={description} style={{ color: '#cbd5e1', cursor: 'help' }}>
            <FaInfoCircle size={14} />
          </div>
        )}
      </div>
      <div
        style={{
          height: '6px',
          borderRadius: '3px',
          backgroundColor: '#f1f5f9',
          width: '100%',
          overflow: 'hidden',
          marginBottom: '8px'
        }}
      >
        <div
          style={{
            width: `${getPercentage(count)}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '3px',
            transition: 'width 0.5s ease'
          }}
        ></div>
      </div>
      <div style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: 500 }}>
        {getPercentage(count)}% of total
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.white,
          borderRadius: '16px',
          padding: '32px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            color: '#94a3b8',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = colors.background}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${colors.primary}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px',
            color: colors.primary
          }}>
            <FaChartLine size={24} />
          </div>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              color: colors.textPrimary,
              letterSpacing: '-0.025em'
            }}>
              Today's Appointment Status
            </h2>
            <p style={{
              margin: 0,
              fontSize: '16px',
              color: colors.textSecondary
            }}>
              Daily overview for {format(new Date(), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: colors.background,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${colors.primary}20`
          }}>
            <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>Today's Appointments</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: colors.textPrimary }}>{totalPatients}</div>
          </div>
          <div style={{
            backgroundColor: `${colors.primary}08`,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${colors.primary}20`
          }}>
            <div style={{ fontSize: '14px', color: colors.primary, marginBottom: '8px' }}>Daily Target</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: colors.primary }}>{dailyTarget}</div>
          </div>
          <div style={{
            backgroundColor: `${colors.green}08`,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${colors.green}20`
          }}>
            <div style={{ fontSize: '14px', color: colors.green, marginBottom: '8px' }}>Confirmation Rate</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: colors.green }}>{getPercentage(confirmedCount)}%</div>
          </div>
        </div>

        {/* Daily Target Progress */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaBullseye size={16} color={isTargetMet ? colors.green : colors.primary} />
              <span style={{ fontWeight: '600', color: colors.textPrimary }}>Daily Target Progress</span>
            </div>
            <span style={{ fontWeight: '600', color: isTargetMet ? colors.green : colors.primary }}>
              {confirmedCount} / {dailyTarget} ({targetPercentage.toFixed(0)}%)
            </span>
          </div>
          <div style={{
            height: '10px',
            borderRadius: '5px',
            backgroundColor: '#e2e8f0',
            width: '100%',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${targetPercentage}%`,
              height: '100%',
              backgroundColor: isTargetMet ? colors.green : colors.primary,
              borderRadius: '5px',
              transition: 'width 0.5s ease, background-color 0.3s ease'
            }}></div>
          </div>
          <div style={{
            fontSize: '14px',
            color: isTargetMet ? colors.green : colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {isTargetMet ? (
              <>
                <FaExclamationTriangle size={12} /> Target achieved! Excellent work.
              </>
            ) : (
              <>
                <FaExclamationTriangle size={12} /> {dailyTarget - confirmedCount} more confirmations needed to reach target.
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {summaryCard(
            'Confirmed',
            FaUserCheck,
            confirmedCount,
            colors.green,
            'Patients who confirmed attendance for today'
          )}
          {summaryCard(
            'Pending',
            FaHourglassHalf,
            pendingCount,
            colors.primary,
            'Awaiting patient confirmation for today'
          )}
          {summaryCard(
            'Rescheduled',
            FaRedo,
            rescheduledCount,
            colors.rescheduled,
            'Today\'s appointments moved to another time'
          )}
          {summaryCard(
            'Missed',
            FaUserTimes,
            missedCount,
            colors.missed,
            'Patients who didn\'t attend today\'s appointment'
          )}
        </div>

        {/* Insights & Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Performance Tips */}
          <div style={{
            padding: '24px',
            backgroundColor: colors.background,
            borderRadius: '12px',
            border: `1px solid ${colors.primary}20`
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaChartLine size={16} color={colors.primary} /> Today's Performance Insights
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              color: colors.textPrimary,
              fontSize: '14px',
              lineHeight: '1.7'
            }}>
              <li>Follow up with <strong>{pendingCount}</strong> pending patients to increase today's confirmation rate</li>
              <li>Contact <strong>{missedCount}</strong> missed appointment patients for immediate follow-up</li>
              <li>Monitor today's targets to ensure optimal clinic utilization</li>
              <li>Review <strong>{rescheduledCount}</strong> rescheduled appointments from today</li>
            </ul>
          </div>

          {/* Recommendations */}
          <div style={{
            padding: '24px',
            backgroundColor: `${colors.primary}08`,
            borderRadius: '12px',
            border: `1px solid ${colors.primary}20`
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 16px 0',
              color: colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaExclamationTriangle size={16} color={colors.primary} /> Today's Recommendations
            </h3>
            <div style={{
              color: colors.primary,
              fontSize: '14px',
              lineHeight: '1.7'
            }}>
              {confirmedCount < dailyTarget ? (
                <p>Consider sending reminder messages to <strong>{pendingCount}</strong> pending patients to increase today's confirmations and meet your daily target.</p>
              ) : (
                <p>Great job meeting today's target! Focus now on reducing missed appointments and improving patient follow-up.</p>
              )}
              <p style={{ margin: '12px 0 0 0' }}>
                For detailed patient information and follow-up actions, visit the <strong>Patient Schedule</strong> section.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '24px',
          borderTop: `1px solid ${colors.primary}20`,
          fontSize: '14px',
          color: colors.textSecondary
        }}>
          <div>Data reflects today's appointment status only</div>
          <div>Last updated: {format(new Date(), 'PPpp')}</div>
        </div>

        {/* Custom CSS for hover effects */}
        <style>{`
          .summary-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </div>
  );
};

export default AppointmentStatusDetailsModal;