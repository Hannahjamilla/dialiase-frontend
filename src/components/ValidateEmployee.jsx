import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaKey, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import logoImage from "../assets/images/logo.PNG";
import staffPic from "../assets/images/staffPic.PNG";

import PrivacyPolicyModal from "./PrivacyPolicyModal";
import TermsModal from "./TermsModal";
import ContactModal from "./ContactModal";
import EmpEmailVerifModal from "./EmpEmailVerifModal";
import EmployeeRegisterModal from "./EmployeeRegisterModal";

function ValidateEmployee() {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    registrationCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showEmailVerifModal, setShowEmailVerifModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateEmployeeNumber = (number) => {
    return /^EMP-[0-9]{6}$/i.test(number);
  };

  const validateRegistrationCode = (code) => {
    return /^[A-Za-z0-9-]{8,50}$/.test(code);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim(),
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeNumber.trim()) {
      newErrors.employeeNumber = "opps! Employee number is required";
    } else if (!validateEmployeeNumber(formData.employeeNumber)) {
      newErrors.employeeNumber = "Format must be EMP- followed by 6 digits (e.g. EMP-123456)";
    }
    
    if (!formData.registrationCode.trim()) {
      newErrors.registrationCode = "opps! Registration code is required";
    } else if (!validateRegistrationCode(formData.registrationCode)) {
      newErrors.registrationCode = "Invalid registration code format";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setValidationSuccess(false);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/validate-employee', formData);
      
      if (response.data.success) {
        if (response.data.data.EmpStatus === 'pre-signup') {
          setNotification({ 
            message: 'No need to complete registration. Please proceed to login and change your password.', 
            type: 'info' 
          });
          setTimeout(() => {
            navigate('/employee-change-credentials', { 
              state: { 
                userData: response.data.data 
              } 
            });
          }, 2000);
        } else {
          setUserData(response.data.data);
          setShowEmailVerifModal(true);
          setNotification({ message: 'Validation successful!', type: 'success' });
        }
      } else {
        throw new Error(response.data.message || 'Validation failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Validation failed. Please check your details and try again.');
      setNotification({ message: error.response?.data?.message || 'Validation failed. Please check your details and try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = (verifiedEmail) => {
    setShowEmailVerifModal(false);
    setShowRegisterModal(true);
    setUserData(prev => ({
      ...prev,
      email: verifiedEmail
    }));
  };

  // Theme variables
  const theme = {
    bg: '#f8fafc',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    text: '#1e293b',
    secondaryText: '#64748b',
    accent: '#477977',
    accentHover: '#3a6361',
    border: 'rgba(203, 213, 225, 0.5)',
    inputBg: 'rgba(241, 245, 249, 0.7)',
    logoColor: '#395886',
    shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glass: 'rgba(255, 255, 255, 0.25)',
    notification: {
      success: { bg: '#d1fae5', text: '#065f46' },
      error: { bg: '#fee2e2', text: '#b91c1c' }
    },
    gradient: 'linear-gradient(135deg, #477977 0%, #638ecb 100%)',
    pulse: 'rgba(71, 121, 119, 0.5)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.bg,
      fontFamily: "'Inter', sans-serif",
      width: '100%',
      overflowX: 'hidden',
      margin: 0,
      padding: 0,
      position: 'relative',
      marginTop: '-900px',
    }}>
      {/* Floating decorative elements */}
      {windowSize.width > 768 && (
        <>
          <motion.div 
            style={{
              position: 'absolute',
              top: '20%',
              left: '5%',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.pulse} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              opacity: 0.6,
              zIndex: 0
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          <motion.div 
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.pulse} 0%, transparent 70%)`,
              filter: 'blur(30px)',
              opacity: 0.4,
              zIndex: 0
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            }}
          />
        </>
      )}

      {/* Notification */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              padding: '1rem',
              backgroundColor: theme.notification[notification.type].bg,
              color: theme.notification[notification.type].text,
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minWidth: 'min(300px, 90vw)',
              maxWidth: '100%',
              borderLeft: `4px solid ${theme.notification[notification.type].text}`,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiAlertCircle size={18} />
              <span style={{ wordBreak: 'break-word' }}>{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification({ message: '', type: '' })}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                marginLeft: '1rem',
                opacity: 0.7,
                transition: 'opacity 0.2s ease'
              }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: windowSize.width < 768 ? '0.5rem' : '1rem',
        width: '100%',
        backgroundColor: theme.bg,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: windowSize.width < 1024 ? 'column' : 'row',
          width: '100%',
          maxWidth: '1800px',
          margin: '0 auto',
          gap: windowSize.width < 768 ? '1rem' : '2rem',
          alignItems: 'center',
          padding: windowSize.width < 768 ? '0.5rem' : '2rem'
        }}>
          {/* Left Side */}
          <motion.div 
            style={{
              flex: '1',
              padding: windowSize.width < 768 ? '1rem' : '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: windowSize.width < 768 ? 'center' : 'flex-start',
              textAlign: windowSize.width < 768 ? 'center' : 'left',
              position: 'relative',
              zIndex: 2,
              maxWidth: windowSize.width < 1024 ? '800px' : 'none'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                fontWeight: '700',
                lineHeight: '1.2',
                marginBottom: '1.5rem',
                color: theme.text
              }}
            >
              Welcome To <span style={{ 
                color: theme.accent, 
                fontWeight: 800, 
                fontSize: 'clamp(2rem, 6vw, 3rem)', 
                letterSpacing: '1.2px', 
                textShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
                padding: '0 0.3rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4))',
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone'
              }}>
                DialiEase
              </span>
            </motion.h1>
            
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 1.1rem)',
                color: theme.secondaryText,
                marginBottom: '1.5rem',
                lineHeight: '1.5',
                maxWidth: '620px',
                listStyle: 'disc',
                paddingLeft: '1.2rem'
              }}
            >
              <li>Good day, CAPD employee!</li>
              <li>Locate your registration PDF — it lists your <strong>Employee Number</strong>, <strong>Registration Code</strong>, and <strong>Temporary Password</strong>.</li>
              <li>Click <strong>Complete Registration</strong>, create a secure password, and verify your email.</li>
              <li>If anything looks incorrect, please <strong>reach out to your system administrator</strong>.</li>
            </motion.ul>

            {windowSize.width > 768 && (
              <motion.div 
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  borderRadius: '1.5rem',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                whileHover={{ scale: 1.01 }}
              >
                <img 
                  src={staffPic} 
                  alt="Medical staff using DialiEase" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </motion.div>
            )}
          </motion.div>

          {/* Right Side - Validation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              width: '100%',
              maxWidth: windowSize.width < 768 ? '100%' : '42rem',
              minWidth: windowSize.width < 768 ? 'auto' : '300px',
              backgroundColor: theme.cardBg,
              padding: windowSize.width < 768 ? '1.5rem' : 'clamp(1.5rem, 3vw, 2.5rem)',
              borderRadius: '1.5rem',
              boxShadow: theme.shadow,
              margin: '1rem 0',
              alignSelf: 'center',
              border: `1px solid ${theme.border}`,
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            }}
            whileHover={{ 
              boxShadow: windowSize.width > 768 ? '0 25px 50px -12px rgba(71, 121, 119, 0.25)' : theme.shadow
            }}
          >
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: theme.gradient,
              borderRadius: '0 0 0 100%',
              zIndex: 0,
              opacity: 0.15
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '80px',
              height: '80px',
              background: theme.gradient,
              borderRadius: '0 100% 0 0',
              zIndex: 0,
              opacity: 0.1
            }}></div>
            
            <div style={{
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <div style={{
                  width: 'clamp(60px, 8vw, 80px)',
                  height: 'clamp(60px, 8vw, 80px)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme.gradient,
                  color: 'white',
                  marginBottom: '1rem',
                  boxShadow: `0 4px 15px rgba(71, 121, 119, 0.3)`
                }}>
                  <FaUser size={windowSize.width < 768 ? 20 : 24} />
                </div>
                
                <h2 style={{
                  fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                  fontWeight: '700',
                  color: theme.text,
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.5px',
                  textAlign: 'center'
                }}>
                  Validate Employee Details
                </h2>
                <p style={{
                  color: theme.secondaryText,
                  marginBottom: '0',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  textAlign: 'center'
                }}>
                  Verify your employee details to proceed with registration
                  <br />
                  <span style={{ fontSize: '0.8rem', color: theme.tertiaryText }}>
                    (Note: This is only for CAPD employees)
                  </span>
                </p>
              </div>

              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: theme.notification.error.bg,
                    color: theme.notification.error.text,
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    borderLeft: `4px solid ${theme.notification.error.text}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backdropFilter: 'blur(5px)',
                    WebkitBackdropFilter: 'blur(5px)'
                  }}
                >
                  <FiAlertCircle size={16} />
                  <span>{apiError}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
                {/* Employee Number Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: theme.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Employee Number
                  </label>
                  <motion.div 
                    style={{ 
                      position: 'relative',
                      borderRadius: '0.75rem',
                      border: `1px solid ${errors.employeeNumber ? '#f87171' : theme.border}`,
                      backgroundColor: theme.inputBg,
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)'
                    }}
                    whileHover={{ 
                      borderColor: errors.employeeNumber ? '#f87171' : theme.accent,
                      boxShadow: `0 0 0 3px rgba(71, 121, 119, 0.1)`
                    }}
                  >
                    <FaUser style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.employeeNumber ? '#f87171' : theme.secondaryText,
                      fontSize: windowSize.width < 768 ? '14px' : '16px'
                    }} />
                    <input
                      type="text"
                      name="employeeNumber"
                      placeholder="Enter your employee number"
                      value={formData.employeeNumber}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: windowSize.width < 768 ? '0.6rem 1rem 0.6rem 2.5rem' : '0.75rem 1rem 0.75rem 2.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        outline: 'none',
                        fontSize: windowSize.width < 768 ? '14px' : '16px',
                        backgroundColor: 'transparent',
                        color: theme.text
                      }}
                      disabled={isLoading || validationSuccess}
                    />
                  </motion.div>
                  {errors.employeeNumber && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'block'
                      }}
                    >
                      {errors.employeeNumber}
                    </motion.span>
                  )}
                </div>

                {/* Registration Code Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: theme.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Registration Number
                  </label>
                  <motion.div 
                    style={{ 
                      position: 'relative',
                      borderRadius: '0.75rem',
                      border: `1px solid ${errors.registrationCode ? '#f87171' : theme.border}`,
                      backgroundColor: theme.inputBg,
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)'
                    }}
                    whileHover={{ 
                      borderColor: errors.registrationCode ? '#f87171' : theme.accent,
                      boxShadow: `0 0 0 3px rgba(71, 121, 119, 0.1)`
                    }}
                  >
                    <FaKey style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.registrationCode ? '#f87171' : theme.secondaryText,
                      fontSize: windowSize.width < 768 ? '14px' : '16px'
                    }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="registrationCode"
                      placeholder="Enter your registration Number"
                      value={formData.registrationCode}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: windowSize.width < 768 ? '0.6rem 3rem 0.6rem 2.5rem' : '0.75rem 3rem 0.75rem 2.5rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        outline: 'none',
                        fontSize: windowSize.width < 768 ? '14px' : '16px',
                        backgroundColor: 'transparent',
                        color: theme.text
                      }}
                      disabled={isLoading || validationSuccess}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.secondaryText,
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        whileHover={{ color: theme.accent }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={showPassword ? "Hide code" : "Show code"}
                      >
                        {showPassword ? 
                          <FaEyeSlash size={windowSize.width < 768 ? 16 : 18} /> : 
                          <FaEye size={windowSize.width < 768 ? 16 : 18} />
                        }
                      </motion.button>
                    </div>
                  </motion.div>
                  {errors.registrationCode && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'block'
                      }}
                    >
                      {errors.registrationCode}
                    </motion.span>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 10px 15px -3px rgba(71, 121, 119, 0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || validationSuccess}
                  style={{
                    width: '100%',
                    padding: windowSize.width < 768 ? '0.8rem' : 'clamp(0.8rem, 2vw, 1rem)',
                    backgroundColor: validationSuccess ? '#10b981' : theme.accent,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: windowSize.width < 768 ? '0.9rem' : 'clamp(0.9rem, 2vw, 1rem)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLoading ? 0.8 : 1,
                    boxShadow: '0 4px 6px -1px rgba(71, 121, 119, 0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                  }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: '0.5rem'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.5)',
                          margin: '0 2px',
                          display: 'inline-block',
                          animation: 'pulse 1.4s infinite ease-in-out both'
                        }}></div>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.5)',
                          margin: '0 2px',
                          display: 'inline-block',
                          animation: 'pulse 1.4s infinite ease-in-out both',
                          animationDelay: '0.2s'
                        }}></div>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255,255,255,0.5)',
                          margin: '0 2px',
                          display: 'inline-block',
                          animation: 'pulse 1.4s infinite ease-in-out both',
                          animationDelay: '0.4s'
                        }}></div>
                      </div>
                      Validating...
                    </>
                  ) : validationSuccess ? (
                    "Validated Successfully"
                  ) : (
                    <>
                      Validate 
                      <motion.div
                        style={{
                          marginLeft: '0.5rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        animate={{
                          x: isHovering ? [0, 5, 0] : 0
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: isHovering ? Infinity : 0
                        }}
                      >
                        <FaArrowRight size={windowSize.width < 768 ? 14 : 16} />
                      </motion.div>
                    </>
                  )}
                  
                  {/* Button hover effect */}
                  {isHovering && !isLoading && !validationSuccess && (
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transform: 'rotate(30deg)'
                      }}
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                  )}
                </motion.button>
              </form>

              <div style={{
                textAlign: 'center',
                color: theme.secondaryText,
                fontSize: '0.875rem',
                marginTop: '2rem',
                borderTop: `1px solid ${theme.border}`,
                paddingTop: '1.5rem'
              }}>
                Already have an account? {" "}
                <motion.div
                  style={{ display: 'inline-block' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to="/login" style={{
                    color: theme.accent,
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}>
                    Login here
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: theme.secondaryText,
        fontSize: '0.875rem',
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: `1px solid ${theme.border}`
      }}>
        <div style={{
          maxWidth: '1800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            fontSize: 'clamp(0.8rem, 2vw, 0.875rem)'
          }}>
            <motion.button
              whileHover={{ scale: 1.05, color: theme.accent }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.secondaryText,
                cursor: 'pointer',
                padding: '0.25rem 0',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setShowPrivacyModal(true)}
            >
              Privacy Policy
            </motion.button>
            <span style={{ color: theme.border }}>•</span>
            <motion.button
              whileHover={{ scale: 1.05, color: theme.accent }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.secondaryText,
                cursor: 'pointer',
                padding: '0.25rem 0',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setShowTermsModal(true)}
            >
              Terms of Service
            </motion.button>
            <span style={{ color: theme.border }}>•</span>
            <motion.button
              whileHover={{ scale: 1.05, color: theme.accent }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'none',
                border: 'none',
                color: theme.secondaryText,
                cursor: 'pointer',
                padding: '0.25rem 0',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setShowContactModal(true)}
            >
              Contact Us
            </motion.button>
          </div>
          <p style={{ margin: 0, fontSize: 'clamp(0.8rem, 2vw, 0.875rem)' }}>© {new Date().getFullYear()} DialiEase. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
      
      {/* Email Verification Modal */}
      <EmpEmailVerifModal
        isOpen={showEmailVerifModal}
        onClose={() => setShowEmailVerifModal(false)}
        userData={userData}
        onVerificationComplete={handleVerificationComplete}
      />

      {/* Employee Register Modal */}
      <EmployeeRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        userData={userData}
      />

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        /* Ensure inputs have proper font size on mobile */
        input {
          font-size: 16px;
        }

        /* Prevent zooming on input focus on mobile */
        @media screen and (max-width: 480px) {
          input, select, textarea {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default ValidateEmployee;