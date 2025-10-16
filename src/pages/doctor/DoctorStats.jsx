import React from 'react';
import { FaClock, FaProcedures, FaCheckCircle } from 'react-icons/fa';

const DoctorStats = ({ stats }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="stats-overview" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="stat-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease',
          ':hover': {
            transform: 'translateY(-5px)'
          }
        }}>
          <div className="card-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div className="card-title" style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>Pending Checkups</div>
            <div className="card-icon pending" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(243, 156, 18, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f39c12'
            }}>
              <FaClock />
            </div>
          </div>
          <div className="card-value" style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '0.5rem'
          }}>{stats.pending}</div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease',
          ':hover': {
            transform: 'translateY(-5px)'
          }
        }}>
          <div className="card-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div className="card-title" style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>Track Patient Treatments</div>
            <div className="card-icon in-progress" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3498db'
            }}>
              <FaProcedures />
            </div>
          </div>
          <div className="card-value" style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '0.5rem'
          }}>{stats.in_progress}</div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease',
          ':hover': {
            transform: 'translateY(-5px)'
          }
        }}>
          <div className="card-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div className="card-title" style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>Completed Today</div>
            <div className="card-icon completed" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2ecc71'
            }}>
              <FaCheckCircle />
            </div>
          </div>
          <div className="card-value" style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '0.5rem'
          }}>{stats.completed}</div>
        </div>
      </div>
    </div>
  );
};

export default DoctorStats;