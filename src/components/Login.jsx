import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowRight, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaCheckCircle,
  FaTimes,
  FaSync
} from "react-icons/fa";
import { FiAlertCircle, FiMail, FiLock, FiUser, FiCheck, FiX } from "react-icons/fi";
import logoImage from "../assets/images/logo.png";
import staffPic from "../assets/images/staffPic.png";

import PrivacyPolicyModal from "./PrivacyPolicyModal";
import TermsModal from "./TermsModal";
import ContactModal from "./ContactModal";
import CredentialChangeModal from "./CredentialChangeModal"; // New modal

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const navigate = useNavigate();

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [userData, setUserData] = useState(null);

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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
    
    if (!formData.email.trim()) {
      newErrors.email = "opps! Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "opps! Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // First get CSRF cookie
      await fetch('https://dialiease-backend-1.onrender.com/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include'
      });

      // Then make login request
      const response = await fetch('https://dialiease-backend-1.onrender.com/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const result = await response.json();

      if (!response.ok) {
        setApiError(result.message || 'Invalid credentials');
        setNotification({ message: result.message || 'Invalid credentials', type: 'error' });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Check if credential change is required
      if (result.requires_credential_change) {
        setUserData(result.user);
        setShowCredentialModal(true);
        setNotification({ 
          message: 'Please update your credentials to complete registration', 
          type: 'info' 
        });
        return;
      }

      setNotification({ message: 'Login successful!', type: 'success' });

      setTimeout(() => {
        if (result.user.userLevel === 'admin') {
          navigate('/admin/AdminDashboard');
        } else if (result.user.userLevel === 'nurse' || result.user.userLevel === 'staff') {
          navigate('/staff/StaffDashboard');
        } else if (result.user.userLevel === 'patient') {
          navigate('/patient/PatientDashboard');
        } else if (result.user.userLevel === 'doctor') {
          navigate('/doctor/DoctorDashboard');
        }
      }, 1000);
      
    } catch (error) {
      setApiError("Server error. Please try again later.");
      setNotification({ message: 'Server error. Please try again later.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialChangeComplete = () => {
    setShowCredentialModal(false);
    setNotification({ 
      message: 'Credentials updated successfully! Please login with your new credentials.', 
      type: 'success' 
    });
    
    // Clear form and redirect to login
    setFormData({ email: "", password: "" });
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
      error: { bg: '#fee2e2', text: '#b91c1c' },
      info: { bg: '#dbeafe', text: '#1e40af' }
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
      width: '100vw',
      overflowX: 'hidden',
      margin: 0,
      padding: 0,
      position: 'relative',
      marginTop: '180px',
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

      {/* Header */}
      <header style={{
        padding: '0.5rem 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100vw',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: theme.logoColor,
            fontWeight: '600',
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            gap: '0.75rem'
          }}>
            <motion.img 
              src={logoImage} 
              alt="DialiEase Logo" 
              style={{
                height: 'clamp(40px, 8vw, 50px)'
              }}
              whileHover={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            />
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              DialiEase
            </motion.span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: windowSize.width < 768 ? '0.5rem' : '1rem',
        width: '100vw',
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
              Welcome Back to <span style={{ 
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
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.25rem)',
                color: theme.secondaryText,
                marginBottom: '2rem',
                lineHeight: '1.6',
                maxWidth: '600px'
              }}
            >
              Modern dialysis care simplified with intuitive technology that enhances patient care and clinical workflows.
            </motion.p> 
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

          {/* Right Side - Login Form */}
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
                  <FaLock size={windowSize.width < 768 ? 20 : 24} />
                </div>
                
                <h2 style={{
                  fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                  fontWeight: '700',
                  color: theme.text,
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.5px',
                  textAlign: 'center'
                }}>
                  Glad you're back! Log in now
                </h2>
                <p style={{
                  color: theme.secondaryText,
                  marginBottom: '0',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  textAlign: 'center'
                }}>
                  Let's get you back on track — log in to begin!
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
                {/* Email Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: theme.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Email Address
                  </label>
                  <motion.div 
                    style={{ 
                      position: 'relative',
                      borderRadius: '0.75rem',
                      border: `1px solid ${errors.email ? '#f87171' : theme.border}`,
                      backgroundColor: theme.inputBg,
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)'
                    }}
                    whileHover={{ 
                      borderColor: errors.email ? '#f87171' : theme.accent,
                      boxShadow: `0 0 0 3px rgba(71, 121, 119, 0.1)`
                    }}
                  >
                    <FaEnvelope style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.email ? '#f87171' : theme.secondaryText,
                      fontSize: windowSize.width < 768 ? '14px' : '16px'
                    }} />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
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
                      disabled={isLoading}
                    />
                  </motion.div>
                  {errors.email && (
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
                      {errors.email}
                    </motion.span>
                  )}
                </div>

                {/* Password Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: theme.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem'
                  }}>
                    Password
                  </label>
                  <motion.div 
                    style={{ 
                      position: 'relative',
                      borderRadius: '0.75rem',
                      border: `1px solid ${errors.password ? '#f87171' : theme.border}`,
                      backgroundColor: theme.inputBg,
                      backdropFilter: 'blur(5px)',
                      WebkitBackdropFilter: 'blur(5px)'
                    }}
                    whileHover={{ 
                      borderColor: errors.password ? '#f87171' : theme.accent,
                      boxShadow: `0 0 0 3px rgba(71, 121, 119, 0.1)`
                    }}
                  >
                    <FaLock style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: errors.password ? '#f87171' : theme.secondaryText,
                      fontSize: windowSize.width < 768 ? '14px' : '16px'
                    }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
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
                      disabled={isLoading}
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
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? 
                          <FaEyeSlash size={windowSize.width < 768 ? 16 : 18} /> : 
                          <FaEye size={windowSize.width < 768 ? 16 : 18} />
                        }
                      </motion.button>
                    </div>
                  </motion.div>
                  {errors.password && (
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
                      {errors.password}
                    </motion.span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link to="/ForgotPassword" style={{
                      color: theme.accent,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textDecoration: 'none'
                    }}>
                      Forgot Password?
                    </Link>
                  </motion.div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 10px 15px -3px rgba(71, 121, 119, 0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: windowSize.width < 768 ? '0.8rem' : 'clamp(0.8rem, 2vw, 1rem)',
                    backgroundColor: theme.accent,
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
                    overflow: 'hidden'
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Login 
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
                  {isHovering && !isLoading && (
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
        borderTop: `1px solid ${theme.border}`,
        width: '100vw'
      }}>
        <div style={{
          width: '100%',
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
      
      {/* Credential Change Modal */}
      {showCredentialModal && userData && (
        <CredentialChangeModal
          user={userData}
          onClose={handleCredentialChangeComplete}
          onSuccess={handleCredentialChangeComplete}
        />
      )}

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

        /* Ensure full width on all devices */
        html, body {
          width: 100vw;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}

export default Login;