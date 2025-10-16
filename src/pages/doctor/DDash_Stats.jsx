import React from 'react';
import { FaClock, FaProcedures, FaCheckCircle } from 'react-icons/fa';

const DoctorStats = ({ stats }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(243, 156, 18, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f39c12'
          }}>
            <FaClock size={20} />
          </div>
          <div>
            <h3 style={{
              margin: '0',
              color: '#7f8c8d',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>Pending</h3>
            <p style={{
              margin: '0',
              color: '#2c3e50',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>{stats.pending}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3498db'
          }}>
            <FaProcedures size={20} />
          </div>
          <div>
            <h3 style={{
              margin: '0',
              color: '#7f8c8d',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>In Progress</h3>
            <p style={{
              margin: '0',
              color: '#2c3e50',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>{stats.in_progress}</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2ecc71'
          }}>
            <FaCheckCircle size={20} />
          </div>
          <div>
            <h3 style={{
              margin: '0',
              color: '#7f8c8d',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>Completed</h3>
            <p style={{
              margin: '0',
              color: '#2c3e50',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>{stats.completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorStats;