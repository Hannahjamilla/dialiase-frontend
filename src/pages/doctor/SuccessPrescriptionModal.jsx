import React from 'react';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaUserInjured, FaArrowRight } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const SuccessPrescriptionModal = ({ 
  isOpen = false, 
  onClose = () => {},
  patientName = '',
  nextPatient = null
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProceedToNext = () => {
    onClose();
    if (nextPatient) {
      navigate('/doctor/PrescriptionPage', { 
        state: { patient: nextPatient } 
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '32rem',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#1e293b',
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaCheckCircle style={{ color: '#10b981' }} />
              Prescription Successfully Sent
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              color: '#64748b',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              transition: 'color 0.2s'
            }}
          >
            <MdClose />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          <div style={{
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #10b981',
            padding: '1.25rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ 
              fontWeight: 500, 
              color: '#065f46',
              lineHeight: '1.5'
            }}>
              The prescription for <strong>{patientName}</strong> has been successfully saved and sent to the pharmacy.
            </p>
          </div>

          {nextPatient && (
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              border: '1px solid #e2e8f0',
              marginTop: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaUserInjured style={{ color: '#4f46e5' }} />
                Next Patient
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ 
                    fontWeight: 500,
                    color: '#1e293b',
                    marginBottom: '0.25rem'
                  }}>
                    {nextPatient.first_name} {nextPatient.last_name}
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    Scheduled for {new Date(nextPatient.appointment_date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                    ':hover': {
                      backgroundColor: '#4338ca'
                    }
                  }}
                  onClick={handleProceedToNext}
                >
                  Proceed <FaArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '1rem 2rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'background-color 0.2s',
              ':hover': {
                backgroundColor: '#cbd5e1'
              }
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

SuccessPrescriptionModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  patientName: PropTypes.string,
  nextPatient: PropTypes.object
};

export default SuccessPrescriptionModal;