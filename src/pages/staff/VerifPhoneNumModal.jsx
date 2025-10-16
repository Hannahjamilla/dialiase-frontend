import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaSpinner, FaCheck, FaMobileAlt, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const VerifPhoneNumModal = ({ phoneNumber, onClose, onVerificationSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Auto-send OTP when modal opens
    handleResendOtp();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Move to next input on right arrow if not at last input
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Move to previous input on left arrow if not at first input
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
      
      // Focus the last input after paste
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      
      // Focus the first empty input
      const firstEmptyIndex = otp.findIndex(digit => digit === '');
      if (firstEmptyIndex !== -1 && inputRefs.current[firstEmptyIndex]) {
        inputRefs.current[firstEmptyIndex].focus();
      }
      
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/patient/verify-phone-otp', {
        phone_number: phoneNumber,
        otp: otpValue
      });

      if (response.data.success) {
        setSuccess('Phone number verified successfully!');
        setTimeout(() => {
          onVerificationSuccess();
        }, 1000);
      } else {
        setError(response.data.error || 'Invalid OTP. Please try again.');
        
        // Clear OTP and focus first input on error
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

const handleResendOtp = async () => {
  setResendLoading(true);
  setError('');
  setSuccess('');

  try {
    const response = await axios.post('/patient/send-phone-otp', {
      phone_number: phoneNumber
    });

    if (response.data.success) {
      setSuccess(response.data.message || 'New OTP sent successfully!');
      setCountdown(60);
      
      // If in development mode and OTP is provided for debugging
      if (response.data.otp_debug) {
        console.log('DEBUG OTP:', response.data.otp_debug);
        setOtp(response.data.otp_debug.toString().split(''));
      }
    } else {
      setError(response.data.error || 'Failed to resend OTP');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Failed to resend verification code';
    setError(errorMessage);
  } finally {
    setResendLoading(false);
  }
};
  // Handle Enter key press to submit form
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }} onKeyPress={handleKeyPress}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: '#666',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#f5f5f5';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
          aria-label="Close verification modal"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            transition: 'transform 0.3s ease'
          }} className="verification-icon">
            <FaMobileAlt style={{ fontSize: '28px', color: '#395886' }} />
          </div>
          <h2 style={{ 
            margin: '0 0 10px 0',
            color: '#395886',
            fontSize: '24px'
          }}>
            Verify Phone Number
          </h2>
          <p style={{ 
            margin: 0,
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Enter the 6-digit code sent to <strong>{phoneNumber}</strong>
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            borderLeft: '4px solid #f44336',
            padding: '12px 15px',
            marginBottom: '20px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <FaExclamationTriangle style={{ color: '#f44336', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '14px' }}>{error}</div>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#e8f5e9',
            borderLeft: '4px solid #4caf50',
            padding: '12px 15px',
            marginBottom: '20px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <FaCheck style={{ color: '#4caf50', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '14px' }}>{success}</div>
          </div>
        )}

        {/* OTP Input Fields */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                style={{
                  width: '50px',
                  height: '60px',
                  textAlign: 'center',
                  fontSize: '24px',
                  borderRadius: '8px',
                  border: error ? '2px solid #f44336' : '2px solid #ddd',
                  backgroundColor: '#f9f9f9',
                  transition: 'all 0.2s ease',
                  caretColor: 'transparent'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#395886';
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(57, 88, 134, 0.2)';
                  // Select the text in the input when focused
                  e.target.select();
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? '#f44336' : '#ddd';
                  e.target.style.backgroundColor = '#f9f9f9';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={loading}
                aria-label={`Digit ${index + 1} of 6`}
              />
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
            marginTop: '10px'
          }}>
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span style={{ color: '#999' }}>
                Resend in {countdown}s
              </span>
            ) : (
              <button
                onClick={handleResendOtp}
                disabled={resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#395886',
                  textDecoration: 'underline',
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                aria-label="Resend verification code"
              >
                {resendLoading ? (
                  <>
                    <FaSpinner style={{ 
                      animation: 'spin 1s linear infinite',
                      marginRight: '5px'
                    }} />
                    Sending...
                  </>
                ) : (
                  'Resend OTP'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#e0e0e0';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#f5f5f5';
            }}
            aria-label="Cancel verification"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: loading ? '#95a5a6' : (otp.join('').length !== 6 ? '#ccc' : '#395886'),
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!loading && otp.join('').length === 6) e.target.style.backgroundColor = '#2a4266';
            }}
            onMouseOut={(e) => {
              if (!loading && otp.join('').length === 6) e.target.style.backgroundColor = '#395886';
            }}
            aria-label="Verify code"
          >
            {loading ? (
              <>
                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        input:focus {
          outline: none;
        }
        
        .verification-icon:hover {
          transform: scale(1.05);
        }
        
        /* Improve number input appearance */
        input[type="text"]::-webkit-outer-spin-button,
        input[type="text"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default VerifPhoneNumModal;