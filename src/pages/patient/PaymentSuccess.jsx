import React from 'react';
import { FiLoader, FiCheck, FiAlertCircle, FiX } from 'react-icons/fi';

const PaymentProcessingModal = ({ 
  showPaymentModal, 
  paymentStatus, 
  errors, 
  colors, 
  onClose 
}) => {
  if (!showPaymentModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 3000
    }}>
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '12px',
        padding: '3rem',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: colors.textMuted,
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          <FiX />
        </button>

        {paymentStatus === 'processing' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              border: `3px solid ${colors.border}`,
              borderTop: `3px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 2rem auto'
            }} />
            <h3 style={{ color: colors.text, marginBottom: '1rem' }}>
              Processing Payment
            </h3>
            <p style={{ color: colors.textMuted }}>
              Please wait while we process your payment. Do not close this window.
            </p>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: `${colors.alert}08`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem auto',
              color: colors.alert,
              fontSize: '2rem'
            }}>
              <FiAlertCircle />
            </div>
            <h3 style={{ color: colors.alert, marginBottom: '1rem' }}>
              Payment Failed
            </h3>
            <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>
              {errors.payment || 'There was an error processing your payment. Please try again.'}
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '1rem 2rem',
                backgroundColor: colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessingModal;