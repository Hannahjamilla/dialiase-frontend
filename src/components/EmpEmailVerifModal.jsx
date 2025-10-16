import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaCheck, FaArrowRight, FaUser, FaIdCard, FaInfoCircle, FaTimes } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import axios from "axios";

const EmpEmailVerifModal = ({ 
  isOpen, 
  onClose, 
  userData,
  onVerificationComplete 
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightBlue: '#F5F8FC',
    lightGreen: '#F0F7F7',
    gray: '#6B7280',
    darkGray: '#1F2937',
    border: '#E5E7EB',
    errorBg: '#FEF2F2',
    errorText: '#B91C1C',
    successBg: '#ECFDF5',
    successText: '#065F46'
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/update-employee-email', {
        employeeNumber: userData.employeeNumber,
        newEmail
      });
      if (response.data.success) {
        setStep(2);
        setCountdown(120);
        setSuccess("Verification code sent to your email");
      } else {
        throw new Error(response.data.message || "Failed to send verification code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/verify-email-otp', {
        employeeNumber: userData.employeeNumber,
        otp,
        newEmail
      });
      if (response.data.success) {
        setSuccess("Email verified successfully!");
        setTimeout(() => {
          onVerificationComplete(newEmail);
          onClose();
        }, 1500);
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post('/resend-email-otp', {
        employeeNumber: userData.employeeNumber,
        newEmail
      });
      if (response.data.success) {
        setCountdown(120);
        setSuccess("Verification code resent successfully");
      } else {
        throw new Error(response.data.message || "Failed to resend verification code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          backgroundColor: colors.white,
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', fontSize: '1.25rem',
            cursor: 'pointer', color: colors.gray
          }}
        >
          <FaTimes />
        </button>

        {/* Icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          backgroundColor: colors.lightBlue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
          border: `2px solid ${colors.secondary}`
        }}>
          <FaEnvelope size={28} color={colors.primary} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: colors.darkGray, marginBottom: '0.5rem' }}>
          {step === 1 ? 'Update Email' : 'Verify Email'}
        </h2>
        <p style={{ color: colors.gray, fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
          {step === 1 
            ? 'Enter your new email address to receive a verification code.' 
            : `We sent a code to ${newEmail}`}
        </p>

        {/* User Info */}
        <div style={{
          backgroundColor: colors.lightBlue,
          padding: '0.875rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          border: `1px solid ${colors.border}`,
          marginBottom: '1.25rem'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            backgroundColor: colors.white, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${colors.secondary}`
          }}>
            <FaUser size={14} color={colors.primary} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: '600', margin: 0 }}>
              {userData.firstName} {userData.lastName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: colors.gray }}>
              <FaIdCard size={12} />
              <span>{userData.employeeNumber}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: colors.errorBg, color: colors.errorText,
            padding: '0.75rem', borderRadius: '8px',
            marginBottom: '1rem', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            borderLeft: `3px solid ${colors.errorText}`
          }}>
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{
            backgroundColor: colors.successBg, color: colors.successText,
            padding: '0.75rem', borderRadius: '8px',
            marginBottom: '1rem', fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            borderLeft: `3px solid ${colors.successText}`
          }}>
            <FaCheck size={14} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="yourNEW.email@example.com"
              style={{
                width: '100%', padding: '0.75rem 1rem', marginBottom: '1rem',
                borderRadius: '8px', border: `1px solid ${colors.border}`,
                fontSize: '0.9375rem'
              }}
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '0.75rem',
                backgroundColor: colors.primary, color: colors.white,
                border: 'none', borderRadius: '8px',
                fontWeight: '500', fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'} {!isLoading && <FaArrowRight size={14} />}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              style={{
                width: '100%', padding: '0.75rem 1rem', marginBottom: '0.75rem',
                borderRadius: '8px', border: `1px solid ${colors.border}`,
                textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1rem'
              }}
              disabled={isLoading}
            />
            <div style={{ fontSize: '0.8125rem', marginBottom: '1rem', color: colors.gray }}>
              <span
                onClick={resendOtp}
                style={{
                  color: countdown > 0 ? colors.gray : colors.primary,
                  cursor: countdown > 0 ? 'default' : 'pointer',
                  textDecoration: countdown > 0 ? 'none' : 'underline'
                }}
              >
                {countdown > 0 
                  ? `Resend code in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                  : 'Resend code'}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '0.75rem',
                backgroundColor: colors.green, color: colors.white,
                border: 'none', borderRadius: '8px',
                fontWeight: '500', fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'} {!isLoading && <FaCheck size={14} />}
            </motion.button>
          </form>
        )}

        {/* Help text */}
        <div style={{
          marginTop: '1.5rem', padding: '0.875rem',
          backgroundColor: step === 1 ? colors.lightBlue : colors.lightGreen,
          borderRadius: '8px', fontSize: '0.8125rem',
          color: step === 1 ? colors.primary : colors.green,
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
        }}>
          <FaInfoCircle size={16} style={{ flexShrink: 0 }} />
          <p style={{ margin: 0 }}>
            {step === 1 
              ? 'This email will be used for all official communications. Please ensure it is correct and accessible.'
              : 'Check your spam folder if you haven\'t received the code. The code expires in 2 minutes.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmpEmailVerifModal;