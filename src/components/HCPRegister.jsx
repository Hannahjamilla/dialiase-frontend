import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaIdCard, FaArrowLeft, FaCheck, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import logoImage from '../images/logo.PNG';

const HCPRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    otp: '',
    newEmail: '',
    newEmailOtp: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [emailChangeMode, setEmailChangeMode] = useState(false);
  const [newEmailOtpSent, setNewEmailOtpSent] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (location.state?.userData) {
      const { userData } = location.state;
      setFormData(prev => ({
        ...prev,
        employeeNumber: userData.employeeNumber,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email || ''
      }));
    } else {
      navigate('/validate-employee');
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await axios.post('/send-otp', {
        email: formData.email,
        employeeNumber: formData.employeeNumber
      });

      if (response.data.success) {
        setOtpSent(true);
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setErrors({ otp: 'Please enter the OTP code' });
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await axios.post('/verify-otp', {
        email: formData.email,
        otp: formData.otp,
        employeeNumber: formData.employeeNumber
      });

      if (response.data.success) {
        setOtpVerified(true);
        setStep(2);
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setEmailChangeMode(true);
    setNewEmailOtpSent(false);
    setFormData(prev => ({ ...prev, newEmail: '', newEmailOtp: '' }));
  };

  const handleSendNewEmailOTP = async () => {
    if (!validateEmail(formData.newEmail)) {
      setErrors({ newEmail: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await axios.post('/send-otp', {
        email: formData.newEmail,
        employeeNumber: formData.employeeNumber
      });

      if (response.data.success) {
        setNewEmailOtpSent(true);
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNewEmailOTP = async () => {
    if (!formData.newEmailOtp) {
      setErrors({ newEmailOtp: 'Please enter the OTP code' });
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await axios.post('/verify-otp', {
        email: formData.newEmail,
        otp: formData.newEmailOtp,
        employeeNumber: formData.employeeNumber
      });

      if (response.data.success) {
        setFormData(prev => ({ ...prev, email: prev.newEmail }));
        setEmailChangeMode(false);
        setOtpSent(false);
        setOtpVerified(false);
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      width: '100vw',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', 
        padding: '1rem 2rem',
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        width: '100%'
      }}>
        <div style={{ 
          maxWidth: '1800px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#395886', 
            fontWeight: 600, 
            fontSize: '1.75rem', 
            gap: '0.75rem',
            cursor: 'pointer'
          }} onClick={() => navigate('/')}>
            <img 
              src={logoImage} 
              alt="Dialiease Logo" 
              style={{ height: '3.5rem', transition: 'all 0.2s' }}
            />
            <span>Dialiease</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #395886',
                color: '#395886',
                fontWeight: '500',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: '#f0f9ff'
                }
              }}
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '3rem 2rem',
        background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1400px',
          gap: '2rem',
          justifyContent: 'center'
        }}>
          {/* Instructions Panel */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '2rem',
                maxWidth: '400px',
                minWidth: '350px'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaInfoCircle /> Registration Guide
                </h3>
                <button 
                  onClick={() => setShowInstructions(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#334155',
                  marginBottom: '0.5rem'
                }}>
                  Email Verification Process
                </h4>
                <ol style={{ 
                  paddingLeft: '1.25rem',
                  color: '#475569',
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  <li style={{ marginBottom: '0.75rem' }}>Enter your official email address</li>
                  <li style={{ marginBottom: '0.75rem' }}>Click "Send OTP" to receive a verification code</li>
                  <li style={{ marginBottom: '0.75rem' }}>Check your email inbox (and spam folder)</li>
                  <li style={{ marginBottom: '0.75rem' }}>Enter the 6-digit OTP code received</li>
                  <li>Click "Verify OTP" to confirm your email</li>
                </ol>
              </div>

              <div style={{ 
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                borderLeft: '4px solid #395886'
              }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#334155',
                  marginBottom: '0.5rem'
                }}>
                  Important Notes
                </h4>
                <ul style={{ 
                  paddingLeft: '1.25rem',
                  color: '#475569',
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>Use your institutional email address</li>
                  <li style={{ marginBottom: '0.5rem' }}>OTP codes expire after 10 minutes</li>
                  <li style={{ marginBottom: '0.5rem' }}>You can request a new OTP after 1 minute</li>
                  <li>If you don't receive the OTP, check your spam folder</li>
                </ul>
              </div>

              <div style={{ 
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '0.5rem',
                border: '1px solid #e0f2fe'
              }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#334155',
                  lineHeight: '1.6'
                }}>
                  <strong>Need help?</strong> Contact our support team at <a href="mailto:support@dialiease.com" style={{ color: '#395886' }}>support@dialiease.com</a> or call +1 (800) 123-4567.
                </p>
              </div>
            </motion.div>
          )}

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              flex: 2,
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              padding: '3rem',
              minWidth: '600px',
              maxWidth: '800px'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '2rem'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold', 
                  color: '#1e293b',
                  marginBottom: '0.5rem'
                }}>
                  Employee Registration
                </h2>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '1rem'
                }}>
                  Please verify your email to complete your registration
                </p>
              </div>
              {!showInstructions && (
                <button 
                  onClick={() => setShowInstructions(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    color: '#395886',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <FaInfoCircle /> Show Guide
                </button>
              )}
            </div>

            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  backgroundColor: '#fee2e2', 
                  borderLeft: '4px solid #ef4444', 
                  color: '#b91c1c', 
                  padding: '1rem', 
                  marginBottom: '1.5rem', 
                  borderRadius: '0.375rem',
                  fontSize: '0.95rem'
                }}
              >
                {apiError}
              </motion.div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  borderRadius: '50%', 
                  backgroundColor: '#e0f2fe', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FaUser style={{ color: '#0ea5e9', fontSize: '1.25rem' }} />
                </div>
                <div>
                  <p style={{ 
                    fontSize: '1rem', 
                    fontWeight: '500', 
                    color: '#334155',
                    marginBottom: '0.25rem'
                  }}>
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FaIdCard /> {formData.employeeNumber}
                  </p>
                </div>
              </div>

              {!emailChangeMode ? (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.95rem', 
                      fontWeight: '500', 
                      color: '#334155', 
                      marginBottom: '0.5rem'
                    }}>
                      Email Address
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={otpSent}
                        style={{ 
                          flex: 1,
                          padding: '0.75rem 1rem',
                          border: `1px solid ${errors.email ? '#fca5a5' : '#cbd5e1'}`,
                          borderRadius: '0.5rem', 
                          outline: 'none',
                          fontSize: '0.95rem',
                          backgroundColor: otpSent ? '#f8fafc' : 'white',
                          color: otpSent ? '#64748b' : '#334155'
                        }}
                      />
                      {!otpSent && (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={isLoading || !formData.email}
                          style={{ 
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#395886',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: isLoading || !formData.email ? 0.7 : 1,
                            pointerEvents: isLoading || !formData.email ? 'none' : 'auto'
                          }}
                        >
                          {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {errors.email && (
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.85rem', 
                        color: '#dc2626'
                      }}>
                        {errors.email}
                      </p>
                    )}
                    {otpSent && (
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.85rem', 
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FaCheck /> OTP sent to {formData.email}
                      </p>
                    )}
                  </div>

                  {otpSent && !otpVerified && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        OTP Code
                      </label>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          placeholder="Enter 6-digit OTP"
                          style={{ 
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: `1px solid ${errors.otp ? '#fca5a5' : '#cbd5e1'}`,
                            borderRadius: '0.5rem', 
                            outline: 'none',
                            fontSize: '0.95rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={isLoading || !formData.otp}
                          style={{ 
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#395886',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: isLoading || !formData.otp ? 0.7 : 1,
                            pointerEvents: isLoading || !formData.otp ? 'none' : 'auto'
                          }}
                        >
                          {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                      {errors.otp && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.otp}
                        </p>
                      )}
                    </div>
                  )}

                  {otpSent && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem'
                    }}>
                      <button
                        type="button"
                        onClick={handleChangeEmail}
                        style={{ 
                          color: '#395886',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textDecoration: 'underline',
                          padding: '0.5rem 0'
                        }}
                      >
                        Change Email Address
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={isLoading}
                        style={{ 
                          color: '#395886',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textDecoration: 'underline',
                          padding: '0.5rem 0',
                          opacity: isLoading ? 0.7 : 1
                        }}
                      >
                        Resend OTP
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.95rem', 
                      fontWeight: '500', 
                      color: '#334155', 
                      marginBottom: '0.5rem'
                    }}>
                      New Email Address
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <input
                        type="email"
                        name="newEmail"
                        value={formData.newEmail}
                        onChange={handleChange}
                        disabled={newEmailOtpSent}
                        style={{ 
                          flex: 1,
                          padding: '0.75rem 1rem',
                          border: `1px solid ${errors.newEmail ? '#fca5a5' : '#cbd5e1'}`,
                          borderRadius: '0.5rem', 
                          outline: 'none',
                          fontSize: '0.95rem',
                          backgroundColor: newEmailOtpSent ? '#f8fafc' : 'white',
                          color: newEmailOtpSent ? '#64748b' : '#334155'
                        }}
                      />
                      {!newEmailOtpSent && (
                        <button
                          type="button"
                          onClick={handleSendNewEmailOTP}
                          disabled={isLoading || !formData.newEmail}
                          style={{ 
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#395886',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: isLoading || !formData.newEmail ? 0.7 : 1,
                            pointerEvents: isLoading || !formData.newEmail ? 'none' : 'auto'
                          }}
                        >
                          {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                    {errors.newEmail && (
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.85rem', 
                        color: '#dc2626'
                      }}>
                        {errors.newEmail}
                      </p>
                    )}
                    {newEmailOtpSent && (
                      <p style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.85rem', 
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FaCheck /> OTP sent to {formData.newEmail}
                      </p>
                    )}
                  </div>

                  {newEmailOtpSent && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '0.95rem', 
                        fontWeight: '500', 
                        color: '#334155', 
                        marginBottom: '0.5rem'
                      }}>
                        OTP Code
                      </label>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <input
                          type="text"
                          name="newEmailOtp"
                          value={formData.newEmailOtp}
                          onChange={handleChange}
                          placeholder="Enter 6-digit OTP"
                          style={{ 
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: `1px solid ${errors.newEmailOtp ? '#fca5a5' : '#cbd5e1'}`,
                            borderRadius: '0.5rem', 
                            outline: 'none',
                            fontSize: '0.95rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyNewEmailOTP}
                          disabled={isLoading || !formData.newEmailOtp}
                          style={{ 
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#395886',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            opacity: isLoading || !formData.newEmailOtp ? 0.7 : 1,
                            pointerEvents: isLoading || !formData.newEmailOtp ? 'none' : 'auto'
                          }}
                        >
                          {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                      {errors.newEmailOtp && (
                        <p style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.85rem', 
                          color: '#dc2626'
                        }}>
                          {errors.newEmailOtp}
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => setEmailChangeMode(false)}
                      style={{ 
                        color: '#395886',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        textDecoration: 'underline',
                        padding: '0.5rem 0'
                      }}
                    >
                      Cancel Email Change
                    </button>
                    {newEmailOtpSent && (
                      <button
                        type="button"
                        onClick={handleSendNewEmailOTP}
                        disabled={isLoading}
                        style={{ 
                          color: '#395886',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textDecoration: 'underline',
                          padding: '0.5rem 0',
                          opacity: isLoading ? 0.7 : 1
                        }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {otpVerified && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/complete-registration', { 
                  state: { 
                    userData: {
                      employeeNumber: formData.employeeNumber,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      email: formData.email
                    }
                  } 
                })}
                style={{ 
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: '#395886',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Continue to Complete Registration
              </motion.button>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'white',
        padding: '1.5rem 2rem',
        borderTop: '1px solid #e2e8f0',
        width: '100%'
      }}>
        <div style={{ 
          maxWidth: '1800px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          fontSize: '0.875rem',
          color: '#64748b',
          width: '100%'
        }}>
          <div>
            © {new Date().getFullYear()} Dialiease. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/privacy" style={{ 
              color: '#64748b',
              textDecoration: 'none'
            }}>
              Privacy Policy
            </a>
            <a href="/terms" style={{ 
              color: '#64748b',
              textDecoration: 'none'
            }}>
              Terms of Service
            </a>
            <a href="/contact" style={{ 
              color: '#64748b',
              textDecoration: 'none'
            }}>
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HCPRegister;