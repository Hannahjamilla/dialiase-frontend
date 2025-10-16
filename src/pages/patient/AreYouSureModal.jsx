import React from 'react';
import { FiAlertTriangle, FiX, FiCalendar, FiPackage } from 'react-icons/fi';

const AreYouSureModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  colors,
  orderDetails 
}) => {
  if (!isOpen) return null;

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
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '12px',
        width: '95%', // Changed from 90% to 95%
        maxWidth: '550px', // Increased from 500px to 550px
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '2rem 2.5rem 1.5rem 2.5rem', // Increased horizontal padding
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: colors.white
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: `${colors.warning}08`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.warning,
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <FiAlertTriangle />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.5rem',
                fontWeight: '700',
                color: colors.text,
                marginBottom: '0.5rem'
              }}>
                Confirm Reservation
              </h3>
              <p style={{ 
                margin: 0,
                color: colors.textMuted,
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                Please review your reservation details carefully
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.white,
              color: colors.textMuted,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              marginLeft: '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = colors.alert;
              e.target.style.color = colors.alert;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.color = colors.textMuted;
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 2.5rem', flex: 1 }}> {/* Increased horizontal padding */}
          
          {/* Warning Box */}
          <div style={{
            backgroundColor: `${colors.warning}08`,
            border: `1px solid ${colors.warning}20`,
            borderRadius: '8px',
            padding: '1.75rem', // Slightly increased padding
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem'
            }}>
              <FiAlertTriangle color={colors.warning} size={22} style={{ flexShrink: 0, marginTop: '1px' }} /> {/* Slightly larger icon */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: colors.warning, 
                  fontWeight: '600', 
                  fontSize: '1.15rem', // Slightly larger font
                  marginBottom: '0.75rem'
                }}>
                  Important Notice
                </div>
                <div style={{ 
                  color: colors.warning, 
                  fontSize: '1rem', // Slightly larger font
                  lineHeight: '1.6', // Better line height
                  opacity: 0.9
                }}>
                  Once confirmed, this reservation cannot be cancelled or modified. Please ensure all details are correct before proceeding.
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div style={{
            backgroundColor: colors.subtle,
            borderRadius: '8px',
            padding: '1.75rem', // Slightly increased padding
            marginBottom: '2rem'
          }}>
            <h4 style={{ 
              color: colors.text,
              marginBottom: '1.5rem',
              fontSize: '1.25rem', // Slightly larger font
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FiPackage size={20} /> {/* Slightly larger icon */}
              Reservation Summary
            </h4>
            
            <div style={{ display: 'grid', gap: '1.25rem' }}> {/* Increased gap */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: colors.textMuted, fontSize: '1.05rem' }}>Total Items:</span> {/* Slightly larger font */}
                <span style={{ color: colors.text, fontSize: '1.05rem', fontWeight: '600' }}>
                  {orderDetails?.items?.length || 0} items
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: colors.textMuted, fontSize: '1.05rem' }}>Total Amount:</span> {/* Slightly larger font */}
                <span style={{ color: colors.accent, fontSize: '1.2rem', fontWeight: '700' }}> {/* Slightly larger font */}
                  ₱{orderDetails?.total?.toLocaleString() || '0'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ color: colors.textMuted, fontSize: '1.05rem' }}>Payment Method:</span> {/* Slightly larger font */}
                <span style={{ 
                  color: colors.warning, 
                  fontSize: '1.05rem', 
                  fontWeight: '600',
                  textAlign: 'right'
                }}>
                  Pay at CAPD Dept
                </span>
              </div>
            </div>
          </div>

          {/* Pickup Information */}
          <div style={{
            backgroundColor: `${colors.primary}05`,
            border: `1px solid ${colors.primary}15`,
            borderRadius: '8px',
            padding: '1.75rem' // Slightly increased padding
          }}>
            <h4 style={{ 
              color: colors.primary,
              marginBottom: '1rem',
              fontSize: '1.15rem', // Slightly larger font
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FiCalendar size={18} /> {/* Slightly larger icon */}
              Pickup Instructions
            </h4>
            <div style={{ 
              color: colors.textMuted, 
              fontSize: '1rem', // Slightly larger font
              lineHeight: '1.6' // Better line height
            }}>
              Your medical supplies will be reserved and available for collection during your scheduled CAPD appointment. 
              Please bring valid patient identification for verification.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2.5rem 2rem 2.5rem', // Increased horizontal padding
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.white,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1.25rem' // Increased gap
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '1.1rem 2.25rem', // Slightly larger padding
              border: `1px solid ${colors.border}`,
              backgroundColor: 'transparent',
              color: colors.textMuted,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1.05rem', // Slightly larger font
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = colors.primary;
              e.target.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = colors.border;
              e.target.style.color = colors.textMuted;
            }}
          >
            Review Details
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '1.1rem 2.75rem', // Slightly larger padding
              backgroundColor: colors.warning,
              color: colors.white,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1.05rem', // Slightly larger font
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.alert;
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.warning;
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FiAlertTriangle size={20} /> {/* Slightly larger icon */}
            Confirm Reservation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreYouSureModal;