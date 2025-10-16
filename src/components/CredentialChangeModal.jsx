import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaCheck, 
  FaTimes,
  FaUser,
  FaShieldAlt,
  FaSync,
  FaArrowRight,
  FaInfoCircle
} from 'react-icons/fa';
import { FiAlertCircle, FiMail, FiLock, FiUser, FiCheck, FiX } from 'react-icons/fi';

const CredentialChangeModal = ({ user, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: Verification, 3: Password, 4: Complete
  const [formData, setFormData] = useState({
    email: user?.email || '',
    verification_code: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  const theme = {
    primary: '#395886',
    secondary: '#477977',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    bg: '#f8fafc',
    text: '#1e293b',
    border: '#cbd5e1'
  };

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const feedback = [];

    if (!requirements.minLength) feedback.push('At least 8 characters');
    if (!requirements.hasUpperCase) feedback.push('One uppercase letter');
    if (!requirements.hasLowerCase) feedback.push('One lowercase letter');
    if (!requirements.hasNumber) feedback.push('One number');
    if (!requirements.hasSpecialChar) feedback.push('One special character (@$!%*?&)');

    setPasswordStrength({ score, feedback });

    return score === 5;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'new_password') {
      validatePassword(value);
    }

    setApiError('');
  };

  // Handle OTP input change for box-style input
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow numbers and ensure single character
    if (value && !/^\d$/.test(value)) return;
    
    // Update the verification code
    const newCode = formData.verification_code.split('');
    newCode[index] = value;
    const joinedCode = newCode.join('');
    
    setFormData(prev => ({
      ...prev,
      verification_code: joinedCode
    }));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Auto-focus previous input on backspace
    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }

    if (errors.verification_code) {
      setErrors(prev => ({
        ...prev,
        verification_code: ''
      }));
    }
  };

  // Handle OTP paste event
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      setFormData(prev => ({
        ...prev,
        verification_code: pastedData
      }));
      
      // Focus the last input after paste
      setTimeout(() => {
        const lastFilledIndex = Math.min(pastedData.length - 1, 5);
        const nextInput = document.getElementById(`otp-input-${lastFilledIndex}`);
        if (nextInput) nextInput.focus();
      }, 0);
    }
  };

  const handleSendVerification = async () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email === user?.email) {
      newErrors.email = 'Please enter a new email address different from your current one';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: formData.email })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send verification code');
      }

      setVerificationSent(true);
      setCurrentStep(2);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    const newErrors = {};

    if (!formData.verification_code) {
      newErrors.verification_code = 'Verification code is required';
    } else if (formData.verification_code.length !== 6) {
      newErrors.verification_code = 'Verification code must be 6 digits';
    }

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          verification_code: formData.verification_code
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify email');
      }

      setCurrentStep(3);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateAccount = async () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = 'Current temporary password is required';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (!validatePassword(formData.new_password)) {
      newErrors.new_password = 'Password does not meet requirements';
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Please confirm your password';
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }

    if (!formData.verification_code) {
      newErrors.verification_code = 'Verification code is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/activate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          verification_code: formData.verification_code,
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.new_password_confirmation
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to activate account');
      }

      setCurrentStep(4);
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
      }, 3000);

    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return theme.error;
    if (score <= 3) return theme.warning;
    return theme.success;
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderStepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '2rem',
      gap: '1.5rem'
    }}>
      {[1, 2, 3, 4].map((step) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: currentStep >= step ? theme.primary : theme.border,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}>
            {currentStep > step ? <FaCheck size={16} /> : step}
          </div>
          {step < 4 && (
            <div style={{
              width: '40px',
              height: '3px',
              backgroundColor: currentStep > step ? theme.primary : theme.border
            }}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              backgroundColor: '#e8f4fd',
              border: '1px solid #bee3f8',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FaInfoCircle color="#3182ce" size={18} />
                <div>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#2c5282', fontWeight: '500' }}>
                    Complete Your Registration
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#4a5568' }}>
                    Please update your email and set a new password to activate your account.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.75rem'
              }}>
                New Email Address
              </label>
              <div style={{
                position: 'relative',
                borderRadius: '0.75rem',
                border: `1px solid ${errors.email ? theme.error : theme.border}`,
                backgroundColor: '#f8fafc',
                transition: 'border-color 0.3s ease'
              }}>
                <FaEnvelope style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.email ? theme.error : theme.text,
                  fontSize: '18px'
                }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder="Enter your new email address"
                />
              </div>
              {errors.email && (
                <p style={{ color: theme.error, fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <FiAlertCircle style={{ marginRight: '0.5rem' }} />
                  {errors.email}
                </p>
              )}
            </div>

            <button
              onClick={handleSendVerification}
              disabled={isLoading || !formData.email || !validateEmail(formData.email) || formData.email === user?.email}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: isLoading || !formData.email || !validateEmail(formData.email) || formData.email === user?.email 
                  ? theme.border 
                  : theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: isLoading || !formData.email || !validateEmail(formData.email) || formData.email === user?.email 
                  ? 'not-allowed' 
                  : 'pointer',
                opacity: isLoading ? 0.8 : 1,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                <>
                  <FaSync className="spin" style={{ marginRight: '0.5rem' }} />
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Send Verification Code
                  <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                </>
              )}
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <FaCheck color="#10b981" size={18} />
                <div>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#065f46', fontWeight: '500' }}>
                    Verification Code Sent
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#059669' }}>
                    Check your email at <strong>{formData.email}</strong> for the 6-digit code.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Enter Verification Code
              </label>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={formData.verification_code[index] || ''}
                    onChange={(e) => handleOtpChange(e, index)}
                    onPaste={handleOtpPaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        const prevInput = document.getElementById(`otp-input-${index - 1}`);
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    style={{
                      width: '50px',
                      height: '60px',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      border: `2px solid ${errors.verification_code ? theme.error : theme.border}`,
                      borderRadius: '0.5rem',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      backgroundColor: '#f8fafc'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primary;
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.verification_code ? theme.error : theme.border;
                      e.target.style.backgroundColor = '#f8fafc';
                    }}
                  />
                ))}
              </div>
              
              {errors.verification_code && (
                <p style={{ 
                  color: theme.error, 
                  fontSize: '0.85rem', 
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <FiAlertCircle />
                  {errors.verification_code}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setCurrentStep(1)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: 'transparent',
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.color = theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = theme.border;
                  e.target.style.color = theme.text;
                }}
              >
                Back
              </button>
              <button
                onClick={handleVerifyEmail}
                disabled={isLoading || formData.verification_code.length !== 6}
                style={{
                  flex: 2,
                  padding: '1rem',
                  backgroundColor: isLoading || formData.verification_code.length !== 6 
                    ? theme.border 
                    : theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: isLoading || formData.verification_code.length !== 6 
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <FaSync className="spin" style={{ marginRight: '0.5rem' }} />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 style={{ 
              color: theme.text, 
              marginBottom: '1.5rem', 
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaLock />
              Set Your New Password
            </h3>
            
            <p style={{ 
              color: theme.text, 
              marginBottom: '2rem', 
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              Create a strong password to secure your account.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.75rem'
              }}>
                Current Temporary Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 1rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${errors.current_password ? theme.error : theme.border}`,
                    outline: 'none',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  placeholder="Enter your temporary password"
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.current_password ? theme.error : theme.border;
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.current_password && (
                <p style={{ 
                  color: theme.error, 
                  fontSize: '0.85rem', 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FiAlertCircle />
                  {errors.current_password}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.75rem'
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 1rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${errors.new_password ? theme.error : theme.border}`,
                    outline: 'none',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  placeholder="Enter your new password"
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.new_password ? theme.error : theme.border;
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {formData.new_password && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '6px',
                      backgroundColor: theme.border,
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        height: '100%',
                        backgroundColor: getPasswordStrengthColor(passwordStrength.score),
                        transition: 'all 0.3s ease'
                      }}></div>
                    </div>
                    <span style={{
                      fontSize: '0.9rem',
                      color: getPasswordStrengthColor(passwordStrength.score),
                      fontWeight: '600',
                      minWidth: '60px'
                    }}>
                      {passwordStrength.score === 0 ? 'Very Weak' :
                       passwordStrength.score <= 2 ? 'Weak' :
                       passwordStrength.score <= 3 ? 'Fair' :
                       passwordStrength.score <= 4 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    {[
                      '8+ characters',
                      'Uppercase letter',
                      'Lowercase letter', 
                      'Number',
                      'Special character'
                    ].map((req, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: index < passwordStrength.score ? theme.success : theme.text
                      }}>
                        {index < passwordStrength.score ? (
                          <FaCheck size={12} color={theme.success} />
                        ) : (
                          <FaTimes size={12} color={theme.error} />
                        )}
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {errors.new_password && (
                <p style={{ 
                  color: theme.error, 
                  fontSize: '0.85rem', 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FiAlertCircle />
                  {errors.new_password}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: theme.text,
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.75rem'
              }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 1rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${errors.new_password_confirmation ? theme.error : theme.border}`,
                    outline: 'none',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  placeholder="Confirm your new password"
                  onFocus={(e) => {
                    e.target.style.borderColor = theme.primary;
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.new_password_confirmation ? theme.error : theme.border;
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.new_password_confirmation && (
                <p style={{ 
                  color: theme.error, 
                  fontSize: '0.85rem', 
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FiAlertCircle />
                  {errors.new_password_confirmation}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setCurrentStep(2)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: 'transparent',
                  color: theme.text,
                  border: `2px solid ${theme.border}`,
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = theme.primary;
                  e.target.style.color = theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = theme.border;
                  e.target.style.color = theme.text;
                }}
              >
                Back
              </button>
              <button
                onClick={handleActivateAccount}
                disabled={isLoading}
                style={{
                  flex: 2,
                  padding: '1rem',
                  backgroundColor: isLoading ? theme.border : theme.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? (
                  <>
                    <FaSync className="spin" />
                    Activating Account...
                  </>
                ) : (
                  'Activate Account'
                )}
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', padding: '2rem 0' }}
          >
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: theme.success,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '2.5rem'
            }}>
              <FaCheck />
            </div>
            
            <h3 style={{ 
              color: theme.success, 
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Account Activated Successfully!
            </h3>
            
            <p style={{ 
              color: theme.text, 
              marginBottom: '2rem',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}>
              Your account has been activated. You will be redirected to login shortly.
            </p>
            
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '2rem'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '1rem', 
                color: '#065f46',
                lineHeight: '1.5'
              }}>
                <strong>Please note:</strong> You will need to login again with your new credentials.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          backgroundColor: 'white',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          width: '95%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {currentStep !== 4 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              color: theme.text, 
              margin: 0, 
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FaShieldAlt color={theme.primary} />
              Complete Registration
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: theme.text,
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0.5rem',
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f1f5f9';
                e.target.style.color = theme.error;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.text;
              }}
            >
              <FiX />
            </button>
          </div>
        )}

        {apiError && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #fecaca'
          }}>
            <FiAlertCircle size={18} />
            <span style={{ fontWeight: '500' }}>{apiError}</span>
          </div>
        )}

        {currentStep !== 4 && renderStepIndicator()}
        {renderStepContent()}

        <style>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default CredentialChangeModal;