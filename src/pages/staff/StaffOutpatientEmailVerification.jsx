import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUserPlus, FaSpinner, FaArrowLeft, FaEnvelope, FaCheck, 
  FaLock, FaRedo, FaExclamationTriangle, FaTimes, FaBell,
  FaInfoCircle, FaShieldAlt, FaUserShield, FaCalendarAlt,
  FaIdCard, FaStethoscope, FaClinicMedical
} from 'react-icons/fa';
import axios from 'axios';
import StaffSidebar from './StaffSidebar';

axios.defaults.baseURL = 'http://localhost:8000/api';

const StaffOutpatientEmailVerification = () => {
  // Define the color scheme
  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightBg: '#f5f7fa',
    errorBg: '#fef2f2',
    errorBorder: '#ef4444',
    successBg: '#f0fdf4',
    successBorder: '#10b981',
    infoBg: '#eff6ff',
    infoBorder: '#3b82f6'
  };

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpResendDisabled, setOtpResendDisabled] = useState(false);
  const [otpResendCountdown, setOtpResendCountdown] = useState(30);
  const [notifications, setNotifications] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [user, setUser] = useState(null);

  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);

  // Get user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-focus inputs when step changes
  useEffect(() => {
    if (step === 1 && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (step === 2 && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // OTP resend countdown
  useEffect(() => {
    let timer;
    if (otpResendDisabled && otpResendCountdown > 0) {
      timer = setTimeout(() => {
        setOtpResendCountdown(otpResendCountdown - 1);
      }, 1000);
    } else if (otpResendCountdown === 0) {
      setOtpResendDisabled(false);
      setOtpResendCountdown(30);
    }
    return () => clearTimeout(timer);
  }, [otpResendDisabled, otpResendCountdown]);

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    const newNotification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address (e.g., patient@example.com)');
      }

      const checkResponse = await axios.post('/patient/check-email', { email });
      if (checkResponse.data.exists) {
        throw new Error('A patient with this email already exists. Please use a different email.');
      }

      const otpResponse = await axios.post('/patient/send-otp', { email });
      
      if (otpResponse.data.success) {
        setSuccess('A 6-digit verification code has been sent to your email. Please check your inbox (and spam folder).');
        addNotification('Verification code sent', 'success');
        setStep(2);
        setOtpResendDisabled(true);
      } else {
        throw new Error(otpResponse.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error processing your request';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
      console.error('Verification Submit Error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const otpResponse = await axios.post('/patient/send-otp', { email });
      
      if (otpResponse.data.success) {
        setSuccess('A new 6-digit verification code has been sent to your email.');
        addNotification('New verification code sent', 'success');
        setOtpResendDisabled(true);
        setOtpResendCountdown(30);
      } else {
        throw new Error(otpResponse.data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error resending OTP';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }  
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('OTP must be exactly 6 digits');
      }

      const response = await axios.post('/patient/verify-otp', { 
        email,
        otp 
      });
      
      if (!response.data.verified) {
        throw new Error(response.data.message || 'Invalid OTP. Please enter the correct code.');
      }

      setSuccess('OTP verified successfully. Please complete the patient details.');
      addNotification('OTP verified successfully', 'success');
      
      // Navigate to the patient details form with the verified email
      navigate('/staff/StaffOutpatientDetailsForm', { 
        state: { 
          verifiedEmail: email
        } 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error verifying OTP';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
      console.error('OTP Verification Error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const closeError = () => setError('');
  const closeSuccess = () => setSuccess('');

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.lightBg,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <StaffSidebar user={user} />
      
      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: isMobile ? '0' : '280px'
      }}>
        {/* Notification Center */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: isMobile ? '10px' : '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: isMobile ? 'calc(100% - 20px)' : '350px'
        }}>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              style={{
                padding: '15px 20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                backgroundColor: notification.type === 'error' ? colors.errorBg : 
                              notification.type === 'success' ? colors.successBg : colors.infoBg,
                color: notification.type === 'error' ? colors.errorBorder : 
                      notification.type === 'success' ? colors.successBorder : colors.primary,
                borderLeft: `4px solid ${
                  notification.type === 'error' ? colors.errorBorder : 
                  notification.type === 'success' ? colors.successBorder : colors.secondary
                }`,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => removeNotification(notification.id)}
            >
              <div style={{
                marginRight: '15px',
                fontSize: '18px'
              }}>
                {notification.type === 'error' ? <FaExclamationTriangle /> : <FaCheck />}
              </div>
              <div style={{ flex: 1, fontSize: isMobile ? '14px' : 'inherit' }}>{notification.message}</div>
              <button style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '10px'
              }}>
                <FaTimes />
              </button>
            </div>
          ))}
        </div>

        <main style={{
          flex: 1,
          padding: isMobile ? '15px' : '30px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            margin: '0 auto',
            maxWidth: '1400px',
            marginTop: isMobile ? '10px' : '-560px'
          }}>
            <div style={{
              padding: isMobile ? '15px 20px' : '25px 30px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: colors.primary,
              color: colors.white
            }}>
              <h2 style={{
                margin: 0,
                fontSize: isMobile ? '20px' : '24px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaUserPlus /> Register New CAPD Patient
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
                fontSize: '14px',
                color: colors.secondary,
                flexWrap: 'wrap'
              }}>
                <Link to="/staff/StaffDashboard" style={{
                  color: colors.white,
                  textDecoration: 'none',
                  ':hover': {
                    textDecoration: 'underline'
                  }
                }}>Dashboard</Link>
                <span> / </span>
                <Link to="/staff/OutpatientList" style={{
                  color: colors.white,
                  textDecoration: 'none',
                  ':hover': {
                    textDecoration: 'underline'
                  }
                }}>CAPD Patient</Link>
                <span> / </span>
                <span>New Patient</span>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              padding: isMobile ? '15px' : '20px 30px',
              gap: isMobile ? '10px' : '20px',
              borderBottom: '1px solid #e5e7eb',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'space-between',
                minWidth: isMobile ? '100%' : 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  minWidth: isMobile ? '80px' : 'auto'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: step >= 1 ? colors.primary : '#e5e7eb',
                    color: step >= 1 ? colors.white : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    {step > 1 ? <FaCheck /> : '1'}
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '500',
                    color: step >= 1 ? '#111827' : '#9ca3af',
                    textAlign: 'center'
                  }}>Email Verification</div>
                  {step > 1 && <div style={{
                    position: 'absolute',
                    top: '18px',
                    left: '50%',
                    right: '-50%',
                    height: '2px',
                    backgroundColor: colors.primary,
                    zIndex: 1
                  }}></div>}
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  minWidth: isMobile ? '80px' : 'auto'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: step >= 2 ? colors.primary : '#e5e7eb',
                    color: step >= 2 ? colors.white : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    {step > 2 ? <FaCheck /> : '2'}
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '500',
                    color: step >= 2 ? '#111827' : '#9ca3af',
                    textAlign: 'center'
                  }}>OTP Confirmation</div>
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    left: '-50%',
                    right: '50%',
                    height: '2px',
                    backgroundColor: step >= 2 ? colors.primary : '#e5e7eb',
                    zIndex: 1
                  }}></div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  minWidth: isMobile ? '80px' : 'auto'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#e5e7eb',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600'
                  }}>
                    3
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: '500',
                    color: '#9ca3af',
                    textAlign: 'center'
                  }}>Patient Details</div>
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '15px 20px',
                backgroundColor: colors.errorBg,
                color: colors.errorBorder,
                display: 'flex',
                alignItems: 'center',
                margin: isMobile ? '10px 15px' : '20px 30px',
                borderRadius: '8px',
                borderLeft: `4px solid ${colors.errorBorder}`
              }}>
                <div style={{ marginRight: '15px', fontSize: '18px' }}>
                  <FaExclamationTriangle />
                </div>
                <div style={{ flex: 1, fontSize: isMobile ? '14px' : 'inherit' }}>{error}</div>
                <button onClick={closeError} style={{
                  background: 'none',
                  border: 'none',
                  color: colors.errorBorder,
                  cursor: 'pointer',
                  padding: '0'
                }}>
                  <FaTimes />
                </button>
              </div>
            )}
            
            {success && (
              <div style={{
                padding: '15px 20px',
                backgroundColor: colors.successBg,
                color: colors.successBorder,
                display: 'flex',
                alignItems: 'center',
                margin: isMobile ? '10px 15px' : '20px 30px',
                borderRadius: '8px',
                borderLeft: `4px solid ${colors.successBorder}`
              }}>
                <FaCheck style={{ marginRight: '15px', fontSize: '18px' }} />
                <div style={{ flex: 1, fontSize: isMobile ? '14px' : 'inherit' }}>{success}</div>
                <button onClick={closeSuccess} style={{
                  background: 'none',
                  border: 'none',
                  color: colors.successBorder,
                  cursor: 'pointer',
                  padding: '0'
                }}>
                  <FaTimes />
                </button>
              </div>
            )}

            <div style={{
              display: 'flex',
              padding: isMobile ? '15px' : '30px',
              gap: isMobile ? '15px' : '30px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <div style={{
                flex: 2,
                padding: isMobile ? '20px' : '30px',
                backgroundColor: '#f9fafb',
                borderRadius: '10px',
                minWidth: 0 // Prevent flex overflow
              }}>
                {step === 1 && (
                  <form onSubmit={handleVerificationSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                  }}>
                    <div style={{
                      marginBottom: '10px'
                    }}>
                      <h3 style={{
                        margin: '0 0 10px 0',
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: '600',
                        color: colors.primary
                      }}>Patient Email Verification</h3>
                      <p style={{
                        margin: 0,
                        color: '#6b7280',
                        fontSize: isMobile ? '14px' : '15px'
                      }}>
                        Verify the patient's email address to begin the registration process. 
                        A verification code will be sent to the provided email address. 
                        <strong> This will be used for important communications like appointment reminders and Documents.</strong>
                      </p>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <label htmlFor="email" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        <FaEnvelope style={{ color: '#6b7280' }} />
                        Patient Email Address (or Guardian) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="NewCAPDpatient@example.com"
                        required
                        style={{
                          padding: '12px 15px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'all 0.2s',
                          outline: 'none',
                          width: '100%',
                          boxSizing: 'border-box',
                          ':focus': {
                            borderColor: colors.primary,
                            boxShadow: `0 0 0 3px ${colors.secondary}20`
                          }
                        }}
                        ref={emailInputRef}
                      />
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#6b7280',
                        marginTop: '5px'
                      }}>
                        <FaInfoCircle /> This will be used for all patient communications
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: '15px'
                    }}>
                      <button 
                        type="submit" 
                        style={{
                          padding: '12px 24px',
                          backgroundColor: loading || !email ? colors.secondary : colors.primary,
                          color: colors.white,
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '500',
                          cursor: loading || !email ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s',
                          width: isMobile ? '100%' : 'auto',
                          justifyContent: 'center',
                          ':hover': {
                            backgroundColor: loading || !email ? colors.secondary : '#2d4668'
                          }
                        }}
                        disabled={loading || !email}
                      >
                        {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : null}
                        {loading ? 'Sending...' : 'Send Verification Code'}
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleOtpSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                  }}>
                    <div style={{
                      marginBottom: '10px'
                    }}>
                      <h3 style={{
                        margin: '0 0 10px 0',
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: '600',
                        color: colors.primary
                      }}>OTP Verification</h3>
                      <p style={{
                        margin: '0 0 5px 0',
                        color: '#6b7280',
                        fontSize: isMobile ? '14px' : '15px'
                      }}>
                        Please enter the 6-digit verification code sent to{' '}
                        <strong style={{ color: '#111827' }}>{email}</strong>
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: colors.primary,
                        fontSize: '14px',
                        marginTop: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <FaShieldAlt /> For security reasons, this code will expire in 10 minutes
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <label htmlFor="otp" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        <FaLock style={{ color: '#6b7280' }} />
                        Verification Code <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                        }}
                        placeholder="Enter 6-digit code"
                        required
                        maxLength="6"
                        pattern="\d{6}"
                        style={{
                          padding: '12px 15px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '15px',
                          transition: 'all 0.2s',
                          outline: 'none',
                          width: '100%',
                          boxSizing: 'border-box',
                          ':focus': {
                            borderColor: colors.primary,
                            boxShadow: `0 0 0 3px ${colors.secondary}20`
                          }
                        }}
                        ref={otpInputRef}
                      />
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '5px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        {otpResendDisabled ? (
                          <span style={{
                            fontSize: '13px',
                            color: '#6b7280'
                          }}>Resend code available in {otpResendCountdown} seconds</span>
                        ) : (
                          <button 
                            type="button" 
                            style={{
                              background: 'none',
                              border: 'none',
                              color: colors.primary,
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 0',
                              ':hover': {
                                textDecoration: 'underline'
                              }
                            }}
                            onClick={resendOtp}
                            disabled={otpResendDisabled || loading}
                          >
                            <FaRedo /> Resend code
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: '15px',
                      gap: '15px',
                      flexDirection: isMobile ? 'column' : 'row'
                    }}>
                      <button 
                        type="button" 
                        style={{
                          padding: '12px 24px',
                          backgroundColor: 'transparent',
                          color: '#6b7280',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s',
                          justifyContent: 'center',
                          width: isMobile ? '100%' : 'auto',
                          ':hover': {
                            backgroundColor: '#f3f4f6'
                          }
                        }}
                        onClick={() => {
                          setStep(1);
                          setOtp('');
                        }}
                      >
                        <FaArrowLeft /> Back
                      </button>
                      <button 
                        type="submit" 
                        style={{
                          padding: '12px 24px',
                          backgroundColor: loading || otp.length !== 6 ? colors.secondary : colors.primary,
                          color: colors.white,
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: '500',
                          cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s',
                          justifyContent: 'center',
                          width: isMobile ? '100%' : 'auto',
                          ':hover': {
                            backgroundColor: loading || otp.length !== 6 ? colors.secondary : '#2d4668'
                          }
                        }}
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : null}
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div style={{
                flex: 1,
                padding: isMobile ? '20px' : '25px',
                backgroundColor: '#f9fafb',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                minWidth: 0 // Prevent flex overflow
              }}>
                <div style={{
                  marginBottom: '25px'
                }}>
                  <h3 style={{
                    margin: '0 0 15px 0',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    color: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaStethoscope style={{ color: colors.primary }} /> Next Steps
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '15px'
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: colors.primary,
                        color: colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        1
                      </div>
                      <div>
                        <strong style={{
                          display: 'block',
                          marginBottom: '5px',
                          color: '#111827',
                          fontSize: isMobile ? '14px' : 'inherit'
                        }}>Email Verification</strong>
                        <p style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: isMobile ? '13px' : '14px'
                        }}>Verify patient's email address to ensure valid communication</p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '15px'
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: step >= 2 ? colors.primary : '#e5e7eb',
                        color: step >= 2 ? colors.white : '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        2
                      </div>
                      <div>
                        <strong style={{
                          display: 'block',
                          marginBottom: '5px',
                          color: '#111827',
                          fontSize: isMobile ? '14px' : 'inherit'
                        }}>Patient Details</strong>
                        <p style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: isMobile ? '13px' : '14px'
                        }}>Collect personal information, medical history, and contact details</p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '15px'
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: '#e5e7eb',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        3
                      </div>
                      <div>
                        <strong style={{
                          display: 'block',
                          marginBottom: '5px',
                          color: '#111827',
                          fontSize: isMobile ? '14px' : 'inherit'
                        }}>Insurance & Consent</strong>
                        <p style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: isMobile ? '13px' : '14px'
                        }}>Verify insurance information and obtain necessary consents</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{
                    margin: '0 0 15px 0',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: '600',
                    color: colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaInfoCircle style={{ color: colors.primary }} /> Why Verify Email?
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: colors.primary,
                        color: colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '12px'
                      }}>
                        <FaCheck />
                      </div>
                      <div>
                        <p style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: isMobile ? '13px' : '14px'
                        }}>
                          <strong style={{ color: '#111827' }}>Secure Registration:</strong> Ensures only valid email addresses are registered
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: colors.primary,
                        color: colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '12px'
                      }}>
                        <FaCheck />
                      </div>
                      <div>
                        <p style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: isMobile ? '13px' : '14px'
                        }}>
                          <strong style={{ color: '#111827' }}>Appointment Reminders:</strong> Patient will receive timely notifications
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: colors.primary,
                        color: colors.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '12px'
                      }}>
                        <FaCheck />
                      </div>
                      <div>
                        <p style={{
                          margin: 0,
                          color: '#6b7280',
                          fontSize: isMobile ? '13px' : '14px'
                        }}>
                          <strong style={{ color: '#111827' }}>Test Results:</strong> Important medical information can be delivered securely
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffOutpatientEmailVerification;