import React from 'react';
import { FaCheck, FaUser, FaFilePdf, FaInfoCircle, FaPlus, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StaffRegistrationCompleteModal = ({ 
  registrationDetails, 
  onClose, 
  onDownloadCertificate,
  onRegisterAnother
}) => {
  const navigate = useNavigate();

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSeeList = () => {
    onClose();
    navigate('/staff/OutpatientList');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(45, 53, 66, 0.53)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '750px',
        padding: '40px 30px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          backgroundColor: 'rgba(99, 142, 203, 0.1)',
          borderRadius: '0 16px 0 100%',
          zIndex: 0
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(71, 121, 119, 0.1)',
          borderRadius: '0 100% 0 0',
          zIndex: 0
        }}></div>

        {/* Success Header */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '30px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-green)',
            color: 'var(--color-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '36px',
            boxShadow: '0 6px 20px rgba(71, 121, 119, 0.4)',
            border: '4px solid rgba(255,255,255,0.2)'
          }}>
            <FaCheck />
          </div>
          <h2 style={{ 
            color: 'var(--color-primary)',
            marginBottom: '10px',
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Registration Complete!
          </h2>
          <p style={{ 
            color: '#6B7C93',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '500px',
            margin: '0 auto',
            fontWeight: '400'
          }}>
            <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '5px' }}>
              Registration Confirmed
            </strong>
            The patient has been successfully registered in the system. The patient may now proceed with their check-up and treatment.
          </p>
        </div>
        
        {/* Patient Details Card */}
        <div style={{ 
          backgroundColor: 'rgba(99, 142, 203, 0.05)',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid rgba(57, 88, 134, 0.1)',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(2px)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '20px',
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-white)',
            padding: '4px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 3px 10px rgba(57, 88, 134, 0.2)'
          }}>
            <FaUser style={{ fontSize: '12px' }} /> PATIENT DETAILS
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginTop: '15px'
          }}>
            <div>
              <div style={{ 
                fontWeight: '600',
                color: 'var(--color-primary)',
                marginBottom: '8px',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.8
              }}>
                Hospital Number
              </div>
              <div style={{ 
                color: 'var(--color-primary)',
                fontWeight: '700',
                fontSize: '18px',
                letterSpacing: '0.5px'
              }}>
                {registrationDetails.hospitalNumber}
              </div>
            </div>
            
            <div>
              <div style={{ 
                fontWeight: '600',
                color: 'var(--color-primary)',
                marginBottom: '8px',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                opacity: 0.8
              }}>
                Patient Name
              </div>
              <div style={{ 
                color: 'var(--color-primary)',
                fontWeight: '600',
                fontSize: '17px'
              }}>
                {registrationDetails.patientName}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          position: 'relative',
          zIndex: 1,
          marginBottom: '20px'
        }}>
          <button 
            onClick={onRegisterAnother}
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-white)',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(99, 142, 203, 0.3)',
              ':hover': {
                backgroundColor: 'var(--color-primary)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(57, 88, 134, 0.4)'
              }
            }}
          >
            <FaPlus /> Register Another
          </button>
          
          <button 
            onClick={handleSeeList}
            style={{
              backgroundColor: 'var(--color-white)',
              color: 'var(--color-primary)',
              border: '2px solid var(--color-primary)',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              ':hover': {
                backgroundColor: 'rgba(57, 88, 134, 0.05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <FaList /> View Patient List
          </button>
        </div>
        
        {/* Optional Download Button */}
        <div style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
        </div>
      </div>
    </div>
  );
};

export default StaffRegistrationCompleteModal;