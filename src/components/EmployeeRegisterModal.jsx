import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaIdCard, FaBriefcaseMedical, FaFileAlt, FaEnvelope, FaArrowRight, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaLock } from 'react-icons/fa';
import { FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';

const EmployeeRegisterModal = ({ 
  isOpen, 
  onClose, 
  userData
}) => {
  const [formData, setFormData] = useState({
    employeeNumber: userData?.employeeNumber || '',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    specialization: '',
    Doc_license: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [specializationSuggestions, setSpecializationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const specializations = [
    'Nephrologist',
    'Dialysis Nurse',
    'Dialysis Technician',
    'Dietitian',
    'Janitor',
    'Cardiologist',
    'General Practitioner',
    'Pediatrician',
    'Surgeon',
    'Radiologist'
  ];

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
    successText: '#065F46',
    warningBg: '#FFFBEB',
    warningText: '#B45309',
    infoBg: '#EFF6FF',
    infoText: '#1E40AF',
    accent: '#4F46E5'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'specialization') {
      if (value.length > 0) {
        const filtered = specializations.filter(spec =>
          spec.toLowerCase().includes(value.toLowerCase())
        );
        setSpecializationSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const selectSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      specialization: suggestion
    }));
    setShowSuggestions(false);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }
    
    if (!formData.Doc_license.trim()) {
      newErrors.Doc_license = "License number is required";
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one special character";
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/hcp-register', {
        employeeNumber: formData.employeeNumber,
        specialization: formData.specialization,
        Doc_license: formData.Doc_license,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        setSuccess('Registration completed successfully! You can now login with your new password.');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          backgroundColor: colors.white,
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '1400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem',
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem',
            cursor: 'pointer', 
            color: colors.gray,
            zIndex: 10
          }}
        >
          <FaTimes />
        </button>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '3rem'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: colors.lightBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: `3px solid ${colors.secondary}`,
              boxShadow: '0 4px 12px rgba(57, 88, 134, 0.15)'
            }}>
              <FaBriefcaseMedical size={28} color={colors.primary} />
            </div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: colors.darkGray,
              marginBottom: '0.75rem',
              letterSpacing: '-0.5px'
            }}>
              Complete Your Professional Registration
            </h1>
            <p style={{ 
              color: colors.gray, 
              fontSize: '1rem',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Please provide accurate professional details and set a new password to complete your account setup
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '3rem',
            flex: 1
          }}>
            {/* Left Column - User Info and Important Notes */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}>
              {/* User Info Card */}
              <div style={{
                backgroundColor: colors.lightBlue,
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: colors.darkGray,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <FaUser size={20} color={colors.primary} />
                  Personal Information
                </h2>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem'
                }}>
                  <div>
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: colors.gray,
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      First Name
                    </p>
                    <p style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.darkGray
                    }}>
                      {formData.firstName}
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: colors.gray,
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Last Name
                    </p>
                    <p style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.darkGray
                    }}>
                      {formData.lastName}
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: colors.gray,
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Employee Number
                    </p>
                    <p style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.darkGray
                    }}>
                      {formData.employeeNumber}
                    </p>
                  </div>
                  
                  <div>
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: colors.gray,
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      Email Address
                    </p>
                    <p style={{ 
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.darkGray
                    }}>
                      {formData.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notes Card */}
<div style={{
  backgroundColor: colors.infoBg,
  padding: '1.5rem',
  borderRadius: '12px',
  borderLeft: `5px solid ${colors.infoText}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
}}>
  <h2 style={{
    fontSize: '1.25rem',
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  }}>
    <FaInfoCircle size={20} color={colors.infoText} />
    Important Information
  </h2>
  
  <div style={{ 
    backgroundColor: colors.white,
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: `1px solid ${colors.border}`
  }}>
    <h3 style={{
      fontSize: '1rem',
      fontWeight: '600',
      color: colors.infoText,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <FaExclamationTriangle color={colors.warningText} />
      Verification Process
    </h3>
    <p style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      marginBottom: '0.75rem'
    }}>
      All professional credentials will be verified with the relevant regulatory bodies within 2-3 business days. 
      Please ensure all information matches your official records exactly as they appear.
    </p>
    <ul style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      paddingLeft: '1.25rem',
      marginBottom: '0'
    }}>
      <li>License numbers must be current and active</li>
      <li>Name spelling must match your government-issued ID</li>
      <li>Specialty designation must align with your primary practice area</li>
    </ul>
  </div>
  
  <div style={{ 
    backgroundColor: colors.white,
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: `1px solid ${colors.border}`
  }}>
    <h3 style={{
      fontSize: '1rem',
      fontWeight: '600',
      color: colors.infoText,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <FaExclamationTriangle color={colors.warningText} />
      System Access & Security
    </h3>
    <p style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      marginBottom: '0.75rem'
    }}>
      Upon successful verification, you'll receive system access credentials via secure email. Please note:
    </p>
    <ul style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      paddingLeft: '1.25rem',
      marginBottom: '0'
    }}>
      <li>First-time login requires immediate password change</li>
      <li>Multi-factor authentication (MFA) will be enforced</li>
      <li>Session timeout after 30 minutes of inactivity</li>
      <li>Access is granted based on your verified credentials</li>
    </ul>
  </div>
  
  <div style={{ 
    backgroundColor: colors.white,
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: `1px solid ${colors.border}`
  }}>
    <h3 style={{
      fontSize: '1rem',
      fontWeight: '600',
      color: colors.infoText,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <FaExclamationTriangle color={colors.warningText} />
      Password Requirements
    </h3>
    <p style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
    }}>
      Your new password must meet the following security standards:
    </p>
    <ul style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      paddingLeft: '1.25rem',
      marginBottom: '0.75rem'
    }}>
      <li>Minimum 12 characters in length (recommended)</li>
      <li>At least one uppercase letter (A-Z)</li>
      <li>At least one number (0-9)</li>
      <li>At least one special character (!@#$%^&*)</li>
    </ul>
  </div>
  
  <div style={{ 
    backgroundColor: colors.white,
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: `1px solid ${colors.border}`
  }}>
    <h3 style={{
      fontSize: '1rem',
      fontWeight: '600',
      color: colors.infoText,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <FaExclamationTriangle color={colors.warningText} />
      Data Protection & Compliance
    </h3>
    <p style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      marginBottom: '0.75rem'
    }}>
      Your professional information will be handled with the highest security standards:
    </p>
    <ul style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem',
      paddingLeft: '1.25rem',
      marginBottom: '0.75rem'
    }}>
      <li>Regular third-party security audits</li>
      <li>Strict access controls with role-based permissions</li>
    </ul>
    <p style={{ 
      color: colors.gray, 
      lineHeight: '1.7',
      fontSize: '0.875rem'
    }}>
      Information will only be used for verification, credentialing, and necessary system operations.
    </p>
  </div>
</div>
            </div>

            {/* Right Column - Form */}
            <div style={{
              flex: 1.5,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Error Message */}
              {apiError && (
                <div style={{
                  backgroundColor: colors.errorBg,
                  color: colors.errorText,
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderLeft: `4px solid ${colors.errorText}`,
                  boxShadow: '0 2px 6px rgba(185, 28, 28, 0.1)'
                }}>
                  <FiAlertCircle size={18} />
                  <span style={{ fontWeight: '500' }}>{apiError}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div style={{
                  backgroundColor: colors.successBg,
                  color: colors.successText,
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderLeft: `4px solid ${colors.successText}`,
                  boxShadow: '0 2px 6px rgba(6, 95, 70, 0.1)'
                }}>
                  <FaCheck size={18} />
                  <span style={{ fontWeight: '500' }}>{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <div style={{
                  backgroundColor: colors.lightBlue,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  border: `1px solid ${colors.border}`
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: colors.darkGray,
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <FaFileAlt size={22} color={colors.primary} />
                    Professional Credentials
                  </h2>
                  
                  {/* Specialization */}
                  <div style={{ 
                    marginBottom: '1.5rem', 
                    position: 'relative'
                  }}>
                    <label style={{
                      display: 'block',
                      color: colors.darkGray,
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      Medical Specialization *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Enter your primary medical specialization"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: `2px solid ${errors.specialization ? colors.errorText : colors.border}`,
                          backgroundColor: colors.white,
                          fontSize: '0.9375rem'
                        }}
                        disabled={isLoading}
                        autoComplete="off"
                      />
                      {showSuggestions && specializationSuggestions.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          maxHeight: '250px',
                          overflowY: 'auto',
                          backgroundColor: colors.white,
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          zIndex: 10,
                          border: `1px solid ${colors.border}`,
                          marginTop: '0.5rem'
                        }}>
                          {specializationSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                borderBottom: `1px solid ${colors.border}`,
                                transition: 'background-color 0.2s ease',
                                ':hover': {
                                  backgroundColor: colors.lightBlue
                                }
                              }}
                              onClick={() => selectSuggestion(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.specialization && (
                      <p style={{ 
                        color: colors.errorText, 
                        fontSize: '0.8125rem', 
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FiAlertCircle /> {errors.specialization}
                      </p>
                    )}
                  </div>

                  {/* License Number */}
                  <div style={{ 
                    marginBottom: '1.5rem'
                  }}>
                    <label style={{
                      display: 'block',
                      color: colors.darkGray,
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      Professional License Number *
                    </label>
                    <input
                      type="text"
                      name="Doc_license"
                      value={formData.Doc_license}
                      onChange={handleChange}
                      placeholder="Enter your current active license number"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: `2px solid ${errors.Doc_license ? colors.errorText : colors.border}`,
                        backgroundColor: colors.white,
                        fontSize: '0.9375rem'
                      }}
                      disabled={isLoading}
                    />
                    <p style={{ 
                      color: colors.gray, 
                      fontSize: '0.8125rem', 
                      marginTop: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      Must match exactly with your official licensing records
                    </p>
                    {errors.Doc_license && (
                      <p style={{ 
                        color: colors.errorText, 
                        fontSize: '0.8125rem', 
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FiAlertCircle /> {errors.Doc_license}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Section */}
                <div style={{
                  backgroundColor: colors.lightBlue,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  border: `1px solid ${colors.border}`
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: colors.darkGray,
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <FaLock size={20} color={colors.primary} />
                    Set New Password
                  </h2>
                  
                  {/* New Password */}
                  <div style={{ 
                    marginBottom: '1.5rem',
                    position: 'relative'
                  }}>
                    <label style={{
                      display: 'block',
                      color: colors.darkGray,
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter your new password"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: `2px solid ${errors.newPassword ? colors.errorText : colors.border}`,
                          backgroundColor: colors.white,
                          fontSize: '0.9375rem',
                          paddingRight: '2.5rem'
                        }}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: colors.gray
                        }}
                      >
                        {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p style={{ 
                        color: colors.errorText, 
                        fontSize: '0.8125rem', 
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FiAlertCircle /> {errors.newPassword}
                      </p>
                    )}
                  </div>
                  
                  {/* Confirm Password */}
                  <div style={{ 
                    marginBottom: '0',
                    position: 'relative'
                  }}>
                    <label style={{
                      display: 'block',
                      color: colors.darkGray,
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      Confirm New Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your new password"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: `2px solid ${errors.confirmPassword ? colors.errorText : colors.border}`,
                          backgroundColor: colors.white,
                          fontSize: '0.9375rem',
                          paddingRight: '2.5rem'
                        }}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: colors.gray
                        }}
                      >
                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p style={{ 
                        color: colors.errorText, 
                        fontSize: '0.8125rem', 
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FiAlertCircle /> {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and Conditions Section - Now expanded */}
                <div style={{
                  backgroundColor: colors.lightGreen,
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  marginBottom: '2rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: colors.darkGray,
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <FaFileAlt size={20} color={colors.green} />
                    Terms & Certification
                  </h2>
                  
                  <div style={{
                    backgroundColor: colors.white,
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    marginBottom: '1.5rem'
                  }}>
                    <p style={{ 
                      color: colors.darkGray, 
                      lineHeight: '1.7',
                      fontSize: '0.9375rem',
                      marginBottom: '1rem'
                    }}>
                      <strong>Certification Statement:</strong>
                    </p>
                    <p style={{ 
                      color: colors.darkGray, 
                      lineHeight: '1.7',
                      fontSize: '0.9375rem',
                      marginBottom: '1.5rem'
                    }}>
                      I hereby certify under penalty of perjury that all information provided in this registration is accurate, 
                      complete, and truthful to the best of my knowledge. I understand that any falsification or misrepresentation 
                      of professional credentials will result in immediate termination of system access and may subject me to legal 
                      action and reporting to the appropriate licensing boards.
                    </p>
                    
                    <p style={{ 
                      color: colors.darkGray, 
                      lineHeight: '1.7',
                      fontSize: '0.9375rem',
                      marginBottom: '1rem'
                    }}>
                      <strong>Data Protection Acknowledgement:</strong>
                    </p>
                    <p style={{ 
                      color: colors.darkGray, 
                      lineHeight: '1.7',
                      fontSize: '0.9375rem'
                    }}>
                      I acknowledge that my professional information will be stored securely using enterprise-grade encryption 
                      and only used for verification purposes in accordance with the privacy policy and HIPAA compliance standards.
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      style={{
                        marginTop: '0.3rem',
                        width: '1.25rem',
                        height: '1.25rem',
                        accentColor: colors.green
                      }}
                    />
                    <label htmlFor="acceptTerms" style={{ 
                      color: colors.darkGray, 
                      lineHeight: '1.7',
                      fontSize: '0.9375rem',
                      fontWeight: '500'
                    }}>
                      I accept and agree to the terms and conditions stated above
                    </label>
                  </div>
                  {errors.terms && (
                    <div style={{ 
                      backgroundColor: colors.errorBg,
                      padding: '0.75rem',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderLeft: `3px solid ${colors.errorText}`,
                      marginTop: '1rem'
                    }}>
                      <FiAlertCircle color={colors.errorText} />
                      <span style={{ 
                        color: colors.errorText, 
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {errors.terms}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: colors.green,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 4px 12px rgba(71, 121, 119, 0.2)'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: `2px solid ${colors.white}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Verifying Credentials...
                    </>
                  ) : (
                    <>
                      Complete Registration & Proceed <FaArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeRegisterModal;