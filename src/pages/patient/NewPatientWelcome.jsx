import React from 'react';
import { FiAlertCircle, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const NewPatientWelcome = ({ colors, user }) => {
  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: '20px',
      padding: '40px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        width: '100px',
        height: '100px',
        backgroundColor: `${colors.info}20`,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 30px',
        color: colors.info,
        fontSize: '48px'
      }}>
        <FiAlertCircle />
      </div>
      
      <h2 style={{
        color: colors.primary,
        fontSize: '28px',
        marginBottom: '20px',
        fontWeight: '600'
      }}>
        Welcome to Your Treatment Journey, {user.first_name}!
      </h2>
      
      <div style={{
        backgroundColor: `${colors.primary}10`,
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'left'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          marginBottom: '15px'
        }}>
          <FiCheckCircle style={{
            color: colors.success,
            fontSize: '20px',
            marginRight: '15px',
            flexShrink: 0,
            marginTop: '3px'
          }} />
          <div>
            <h3 style={{
              margin: '0 0 5px 0',
              color: colors.primary,
              fontSize: '18px'
            }}>Account Setup Complete</h3>
            <p style={{
              margin: 0,
              color: `${colors.primary}AA`,
              lineHeight: '1.6'
            }}>
              Your patient account has been successfully created. You're now part of our care system.
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          <FiCalendar style={{
            color: colors.info,
            fontSize: '20px',
            marginRight: '15px',
            flexShrink: 0,
            marginTop: '3px'
          }} />
          <div>
            <h3 style={{
              margin: '0 0 5px 0',
              color: colors.primary,
              fontSize: '18px'
            }}>Next Steps Required</h3>
            <p style={{
              margin: 0,
              color: `${colors.primary}AA`,
              lineHeight: '1.6'
            }}>
              Before you can begin your peritoneal dialysis treatments, you need to complete your initial medical checkup with our doctor.
            </p>
          </div>
        </div>
      </div>
      
      <div style={{
        backgroundColor: colors.white,
        border: `1px solid ${colors.primary}20`,
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '30px',
        textAlign: 'left'
      }}>
        <h3 style={{
          color: colors.primary,
          fontSize: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>Important Information</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          <div style={{
            backgroundColor: `${colors.primary}05`,
            padding: '15px',
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.info}`
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: colors.primary,
              fontSize: '16px'
            }}>Initial Checkup</h4>
            <p style={{
              margin: 0,
              color: `${colors.primary}AA`,
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              Your first appointment has been scheduled. During this visit, our doctor will assess your condition and prescribe the appropriate PD solution.
            </p>
          </div>
          
          <div style={{
            backgroundColor: `${colors.primary}05`,
            padding: '15px',
            borderRadius: '8px',
            borderLeft: `4px solid ${colors.success}`
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: colors.primary,
              fontSize: '16px'
            }}>Treatment Preparation</h4>
            <p style={{
              margin: 0,
              color: `${colors.primary}AA`,
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              After your checkup, we'll provide training on how to perform your treatments and schedule your regular sessions.
            </p>
          </div>
        </div>
      </div>
      
      <p style={{
        color: `${colors.primary}AA`,
        marginBottom: '30px',
        lineHeight: '1.6'
      }}>
        Please visit the clinic on your scheduled appointment date. If you need to reschedule or have any questions, contact our support team.
      </p>
      
      <button style={{
        backgroundColor: colors.primary,
        color: colors.white,
        border: 'none',
        padding: '12px 30px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        ':hover': {
          opacity: 0.9,
          transform: 'translateY(-2px)'
        }
      }}>
        View My Appointments
      </button>
    </div>
  );
};

export default NewPatientWelcome;