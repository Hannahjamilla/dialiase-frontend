// components/AdminMetrics.jsx
import React from 'react';
import { 
  FaUsers, 
  FaUserInjured, 
  FaCalendarCheck,
  FaArrowUp,
  FaUserMd,
  FaUserNurse
} from 'react-icons/fa';

const AdminMetrics = ({ dashboardStats, appointmentCounts, loadingStats }) => {
  // Compact card container style
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s ease',
    ':hover': {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
    }
  };

  // Smaller icon container style
  const iconContainerStyle = (color) => ({
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${color}15`,
    color: color,
    fontSize: '14px'
  });

  // Compact badge style
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 6px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    marginRight: '6px'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Medical Staff Card */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: '2px'
            }}>CAPD Medical Staff</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b'
            }}>{loadingStats ? '...' : (dashboardStats?.doctorCount || 0) + (dashboardStats?.nurseCount || 0)}</div>
          </div>
          <div style={iconContainerStyle('#3b82f6')}>
            <FaUsers />
          </div>
        </div>
        
        <div style={{
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={iconContainerStyle('#6366f1')}>
                <FaUserMd />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Doctors</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{loadingStats ? '...' : dashboardStats?.doctorCount || 0}</div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={iconContainerStyle('#8b5cf6')}>
                <FaUserNurse />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Nurses</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{loadingStats ? '...' : dashboardStats?.nurseCount || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Card */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: '2px'
            }}>CAPD Patients</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b'
            }}>{loadingStats ? '...' : dashboardStats?.patientCount || 0}</div>
          </div>
          <div style={iconContainerStyle('#ef4444')}>
            <FaUserInjured />
          </div>
        </div>
        
        <div style={{
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          <div style={badgeStyle}>
            <FaArrowUp style={{ marginRight: '3px', fontSize: '9px' }} />
            {dashboardStats?.newPatientsLast7Days || 0} new
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {dashboardStats?.patientChangePercentage || 0}% from last week
          </div>
        </div>
      </div>

      {/* Appointments Card */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: '2px'
            }}>CAPD Confirmed Checkup</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b'
            }}>{loadingStats ? '...' : dashboardStats?.appointmentCount || 0}</div>
          </div>
          <div style={iconContainerStyle('#f59e0b')}>
            <FaCalendarCheck />
          </div>
        </div>
        
        {appointmentCounts && (
          <div style={{
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Today</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{appointmentCounts.today}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Tomorrow</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{appointmentCounts.tomorrow}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Next 3 Days</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{appointmentCounts.nextThreeDays}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMetrics;