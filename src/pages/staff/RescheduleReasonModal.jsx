import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCommentAlt, 
  FaTimes, 
  FaUser, 
  FaCalendarAlt, 
  FaIdCard, 
  FaEnvelope,
  FaPhone,
  FaNotesMedical
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

const RescheduleReasonModal = ({ show, onClose, reason, colors, appointment }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(33, 33, 33, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            backdropFilter: 'blur(4px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              backgroundColor: colors.white,
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                width: '40px',
                height: '40px',
                background: `${colors.gray100}`,
                border: 'none',
                cursor: 'pointer',
                color: colors.gray600,
                fontSize: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <FaTimes />
            </motion.button>
            
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '24px',
              paddingRight: '40px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${colors.primary}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                flexShrink: 0,
                border: `2px solid ${colors.primary}30`
              }}>
                <FaCommentAlt color={colors.primary} size={20} />
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '22px',
                  fontWeight: 700,
                  color: colors.dark,
                  lineHeight: 1.3
                }}>
                  Reschedule Request
                </h3>
                <p style={{
                  margin: '6px 0 0',
                  fontSize: '14px',
                  color: colors.gray600,
                }}>
                  Patient's request to change appointment
                </p>
              </div>
            </div>
            
            {/* Patient Card */}
            <div style={{ 
              backgroundColor: colors.gray50,
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: `1px solid ${colors.gray200}`,
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaUser color={colors.gray500} size={16} />
                  <p style={{ margin: 0, fontSize: '15px', color: colors.dark }}>
                    <span style={{ color: colors.gray600, marginRight: '8px' }}>Patient Name:</span>
                    {appointment?.first_name} {appointment?.last_name}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaIdCard color={colors.gray500} size={16} />
                  <p style={{ margin: 0, fontSize: '15px', color: colors.dark }}>
                    <span style={{ color: colors.gray600, marginRight: '8px' }}>Hospital Number:</span>
                    {appointment?.hospitalNumber || 'Not provided'}
                  </p>
                </div>
                
                {appointment?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaPhone color={colors.gray500} size={16} />
                    <p style={{ margin: 0, fontSize: '15px', color: colors.dark }}>
                      <span style={{ color: colors.gray600, marginRight: '8px' }}>Phone:</span>
                      {appointment.phone}
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaCalendarAlt color={colors.gray500} size={16} />
                  <p style={{ margin: 0, fontSize: '15px', color: colors.dark }}>
                    <span style={{ color: colors.gray600, marginRight: '8px' }}>Original Date:</span>
                    {appointment?.appointment_date ? format(parseISO(appointment.appointment_date), 'MMMM d, yyyy') : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Reason Section */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: 600,
                color: colors.gray700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <FaNotesMedical size={14} /> Reason for Reschedule
              </h4>
              
              {reason ? (
                <div style={{
                  backgroundColor: colors.white,
                  padding: '20px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.gray200}`,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  color: colors.gray800,
                  fontSize: '15px'
                }}>
                  {reason}
                </div>
              ) : (
                <div style={{ 
                  padding: '16px',
                  backgroundColor: `${colors.gray100}50`,
                  borderRadius: '8px',
                  border: `1px dashed ${colors.gray300}`,
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: colors.gray500, 
                    fontStyle: 'italic',
                    margin: 0,
                    fontSize: '14px'
                  }}>
                    No reason provided for rescheduling
                  </p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${colors.gray200}`
            }}>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RescheduleReasonModal;