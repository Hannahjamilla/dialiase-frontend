import React from 'react';
import Modal from 'react-modal';

const DrainTimerModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          width: '600px',
          maxWidth: '90%',
          margin: 'auto',
          borderRadius: '10px',
          padding: '30px',
          border: 'none',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          animation: 'fadeIn 0.3s ease-out'
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }
      }}
    >
      <div style={{
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          width: '80px',
          height: '80px',
          backgroundColor: '#e3f2fd',
          borderRadius: '50%',
          padding: '15px',
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          <svg viewBox="0 0 24 24" style={{
            width: '100%',
            height: '100%',
            fill: '#1976d2'
          }}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        
        <h2 style={{
          color: '#1976d2',
          marginBottom: '20px',
          fontSize: '24px'
        }}>Important: Drain Process</h2>
        
        <div style={{
          backgroundColor: '#f5fbff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px',
          textAlign: 'left',
          borderLeft: '4px solid #1976d2'
        }}>
          <p style={{
            color: '#333',
            lineHeight: '1.6',
            marginBottom: '15px'
          }}>
            You are about to begin the drain process. Please ensure:
          </p>
          
          <ul style={{
            paddingLeft: '20px',
            marginBottom: '0'
          }}>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                backgroundColor: '#bbdefb',
                borderRadius: '50%',
                color: '#1976d2',
                textAlign: 'center',
                lineHeight: '24px',
                marginRight: '10px',
                flexShrink: 0
              }}>1</span>
              The drain bag is positioned lower than your abdomen
            </li>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                backgroundColor: '#bbdefb',
                borderRadius: '50%',
                color: '#1976d2',
                textAlign: 'center',
                lineHeight: '24px',
                marginRight: '10px',
                flexShrink: 0
              }}>2</span>
              You're in a comfortable position (sitting or reclining)
            </li>
            <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
              <span style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                backgroundColor: '#bbdefb',
                borderRadius: '50%',
                color: '#1976d2',
                textAlign: 'center',
                lineHeight: '24px',
                marginRight: '10px',
                flexShrink: 0
              }}>3</span>
              The transfer set is properly connected
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                backgroundColor: '#bbdefb',
                borderRadius: '50%',
                color: '#1976d2',
                textAlign: 'center',
                lineHeight: '24px',
                marginRight: '10px',
                flexShrink: 0
              }}>4</span>
              The drain clamp is open
            </li>
          </ul>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px'
        }}>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1565c0';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1976d2';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }}
          >
            I'm Ready to Start
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DrainTimerModal;