import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const PreTreatmentReminderModal = ({ isOpen, onRequestClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          width: '600px',
          maxWidth: '90%',
          margin: 'auto',
          borderRadius: '10px',
          padding: '0',
          border: 'none',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          animation: 'modalFadeIn 0.3s ease-out'
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
        padding: '25px',
        position: 'relative'
      }}>
        <button 
          onClick={onRequestClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#777',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#333'}
          onMouseOut={(e) => e.currentTarget.style.color = '#777'}
        >
          ×
        </button>
        
        <div style={{
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'inline-block',
            width: '60px',
            height: '60px',
            backgroundColor: '#fff8e1',
            borderRadius: '50%',
            padding: '10px',
            marginBottom: '15px',
            animation: 'pulse 2s infinite'
          }}>
            <svg viewBox="0 0 24 24" style={{
              width: '100%',
              height: '100%',
              fill: '#ffa000'
            }}>
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 6h2v2h-2V8zm0 4h2v6h-2v-6z"/>
            </svg>
          </div>
          <h2 style={{
            color: '#333',
            marginBottom: '15px'
          }}>Important Reminder Before Ending Treatment</h2>
        </div>
        
        <div style={{
          backgroundColor: '#fff9e6',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '25px',
          animation: 'fadeInUp 0.5s ease-out'
        }}>
          <h3 style={{
            color: '#d35400',
            marginTop: '0',
            marginBottom: '15px'
          }}>Please Verify:</h3>
          
          <ul style={{
            paddingLeft: '20px',
            margin: '0',
            listStyleType: 'none'
          }}>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #ffe0b2',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg style={{
                width: '20px',
                height: '20px',
                fill: '#27ae60',
                marginRight: '10px',
                flexShrink: '0'
              }} viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              The drainage is complete and the bag is empty
            </li>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #ffe0b2',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg style={{
                width: '20px',
                height: '20px',
                fill: '#27ae60',
                marginRight: '10px',
                flexShrink: '0'
              }} viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              You've examined the drained solution color
            </li>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #ffe0b2',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg style={{
                width: '20px',
                height: '20px',
                fill: '#27ae60',
                marginRight: '10px',
                flexShrink: '0'
              }} viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              You've measured the drained volume accurately
            </li>
            <li style={{
              padding: '8px 0',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg style={{
                width: '20px',
                height: '20px',
                fill: '#27ae60',
                marginRight: '10px',
                flexShrink: '0'
              }} viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              All connections are properly closed
            </li>
          </ul>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '25px'
        }}>
          <button 
            onClick={onConfirm}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2980b9';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3498db';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            }}
          >
            I Understand - Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PreTreatmentReminderModal;