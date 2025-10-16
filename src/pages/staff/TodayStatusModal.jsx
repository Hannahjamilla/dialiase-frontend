import React from 'react';

const TodayStatusModal = ({ onConfirm, onCancel, loading, error }) => {
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const statusModalStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const modalHeaderStyle = {
    padding: '16px',
    backgroundColor: '#395886',
    color: 'white',
    textAlign: 'center'
  };

  const modalBodyStyle = {
    padding: '20px',
    textAlign: 'center'
  };

  const confirmButtonStyle = {
    backgroundColor: '#395886',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  };

  const cancelButtonStyle = {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  };

  const errorTextStyle = {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '10px'
  };

  const buttonHoverStyle = {
    ':hover': {
      backgroundColor: '#2d456e'
    }
  };

  const cancelButtonHoverStyle = {
    ':hover': {
      backgroundColor: '#f1f5f9'
    }
  };

  const disabledStyle = {
    opacity: 0.7,
    cursor: 'not-allowed'
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={statusModalStyle}>
        <div style={modalHeaderStyle}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Daily Status Check</h3>
        </div>
        <div style={modalBodyStyle}>
          <p style={{ marginBottom: '20px', color: '#333' }}>Are you on duty today?</p>
          {error && (
            <p style={errorTextStyle}>
              {error}
            </p>
          )}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button 
              onClick={onConfirm} 
              disabled={loading}
              style={{
                ...confirmButtonStyle,
                ...(loading ? disabledStyle : buttonHoverStyle),
                backgroundColor: loading ? '#94a3b8' : confirmButtonStyle.backgroundColor
              }}
            >
              {loading ? 'Updating...' : "Yes, I'm on duty"}
            </button>
            <button 
              onClick={onCancel} 
              disabled={loading}
              style={{
                ...cancelButtonStyle,
                ...(loading ? disabledStyle : cancelButtonHoverStyle)
              }}
            >
              No, I'm not available
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayStatusModal;