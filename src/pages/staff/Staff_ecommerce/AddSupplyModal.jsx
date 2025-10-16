import React, { useState } from 'react';
import { FaTimes, FaSave, FaUpload, FaWarehouse, FaExclamationTriangle, FaInfoCircle, FaSpinner, FaShieldAlt, FaFileAlt, FaClipboardList, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import api from '../../../api/axios';

const AddSupplyModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stock: '',
    minStock: '',
    price: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightGray: '#f8fafc',
    mediumGray: '#e2e8f0',
    darkGray: '#64748b',
    textDark: '#1e293b',
    danger: '#dc2626',
    background: '#fafbfc'
  };

  const steps = [
    { number: 1, title: 'Product Details', icon: FaFileAlt },
    { number: 2, title: 'Inventory Data', icon: FaWarehouse },
    { number: 3, title: 'Final Review', icon: FaClipboardList }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    let processedValue = value;
    if (name === 'stock' || name === 'minStock') {
      processedValue = value === '' ? '' : parseInt(value) || 0;
    } else if (name === 'price') {
      processedValue = value === '' ? '' : parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image (JPEG, PNG, JPG, GIF)'
        }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 2MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Clear any previous image errors
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Supply name is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }

    if (step === 2) {
      if (formData.stock === '' || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
      if (formData.minStock === '' || formData.minStock < 1) newErrors.minStock = 'Minimum stock must be at least 1';
      if (formData.price === '' || formData.price < 0) newErrors.price = 'Valid price is required';
    }

    if (step === 3) {
      if (!formData.image) newErrors.image = 'Supply image is required';
    }

    return newErrors;
  };

  const validateForm = () => {
    const step1Errors = validateStep(1);
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);
    
    return {
      ...step1Errors,
      ...step2Errors,
      ...step3Errors
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      
      // Auto-scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const submitData = new FormData();
      
      // Append all fields with proper formatting
      submitData.append('name', formData.name.trim());
      submitData.append('category', 'CAPD');
      submitData.append('description', formData.description.trim());
      submitData.append('stock', formData.stock.toString());
      submitData.append('minStock', formData.minStock.toString());
      submitData.append('price', parseFloat(formData.price).toFixed(2));
      submitData.append('supplier', 'CAPD');
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await api.post('/supplies/add', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.data.success) {
        // Call onSave with success status
        onSave(true, 'Medical supply added successfully!');
        handleClose();
      }
    } catch (error) {
      console.error('Error adding supply:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to add supply. Please try again.';
      
      if (error.response?.status === 422) {
        // Validation errors from backend
        const backendErrors = error.response.data.errors || {};
        setErrors(backendErrors);
        errorMessage = 'Please check the form for errors.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      }
      
      // Call onSave with error status
      onSave(false, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      stock: '',
      minStock: '',
      price: '',
      image: null
    });
    setErrors({});
    setImagePreview(null);
    setActiveStep(1);
    onClose();
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const nextStep = () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      
      // Auto-scroll to first error
      const firstErrorField = Object.keys(stepErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setActiveStep(prev => Math.min(prev + 1, 3));
    setErrors({}); // Clear errors when moving to next step
  };

  const prevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
    setErrors({}); // Clear errors when going back
  };

  const isStepValid = (step) => {
    const stepErrors = validateStep(step);
    return Object.keys(stepErrors).length === 0;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      boxSizing: 'border-box',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '20px',
        width: '95%',
        maxWidth: '1400px',
        maxHeight: '95vh',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
        animation: 'modalSlideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${colors.mediumGray}`
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px 48px 20px 48px',
          background: colors.white,
          borderBottom: `1px solid ${colors.mediumGray}`,
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                fontSize: '20px',
                boxShadow: `0 4px 16px ${colors.primary}25`
              }}>
                <FaSave />
              </div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '700',
                  color: colors.textDark,
                  letterSpacing: '-0.2px',
                  marginBottom: '4px'
                }}>
                  New Medical Supply
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: colors.darkGray,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FaShieldAlt size={12} />
                  CAPD Inventory Management System
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: `${colors.green}08`,
                color: colors.green,
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                border: `1px solid ${colors.green}20`
              }}>
                STEP {activeStep}/3
              </div>
              
              <button
                onClick={handleClose}
                disabled={loading}
                style={{
                  background: 'none',
                  border: `1px solid ${colors.mediumGray}`,
                  color: colors.darkGray,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = colors.danger;
                    e.target.style.color = colors.white;
                    e.target.style.borderColor = colors.danger;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = colors.darkGray;
                    e.target.style.borderColor = colors.mediumGray;
                  }
                }}
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            background: colors.lightGray,
            borderRadius: '10px',
            padding: '6px',
            border: `1px solid ${colors.mediumGray}`
          }}>
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: activeStep === step.number ? colors.primary : 'transparent',
                    color: activeStep === step.number ? colors.white : colors.darkGray,
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'all 0.3s ease',
                    cursor: isStepValid(step.number) ? 'pointer' : 'not-allowed',
                    opacity: isStepValid(step.number) ? 1 : 0.5
                  }}
                  onClick={() => isStepValid(step.number) && setActiveStep(step.number)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    backgroundColor: activeStep === step.number ? colors.white : 
                                   isStepValid(step.number) ? `${colors.primary}15` : `${colors.darkGray}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: activeStep === step.number ? colors.primary : 
                          isStepValid(step.number) ? colors.primary : colors.darkGray,
                    fontWeight: '700'
                  }}>
                    {activeStep > step.number ? <FaCheckCircle size={10} /> : step.number}
                  </div>
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    width: '1px',
                    height: '16px',
                    backgroundColor: colors.mediumGray
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '48px',
          overflow: 'auto',
          backgroundColor: colors.background,
          display: 'grid',
          gridTemplateColumns: '1fr 450px',
          gap: '48px'
        }}>
          
          {/* Form Section */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '18px',
            padding: '48px',
            border: `1px solid ${colors.mediumGray}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            {/* Error Display */}
            {errors.general && (
              <div style={{
                backgroundColor: `${colors.danger}08`,
                border: `1px solid ${colors.danger}20`,
                color: colors.danger,
                padding: '24px',
                borderRadius: '14px',
                marginBottom: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '16px'
              }}>
                <FaExclamationTriangle size={20} />
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1 }}>
                {/* Step 1: Product Details */}
                {activeStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div>
                      <h3 style={{
                        margin: '0 0 32px 0',
                        fontSize: '24px',
                        fontWeight: '600',
                        color: colors.textDark,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <FaFileAlt size={20} color={colors.primary} />
                        Product Information
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div>
                          <label style={labelStyle}>
                            Supply Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter complete medical supply name"
                            style={{
                              ...inputStyle,
                              borderColor: errors.name ? colors.danger : colors.mediumGray,
                              fontSize: '16px',
                              padding: '16px 20px'
                            }}
                          />
                          {errors.name && <span style={errorTextStyle}>{errors.name}</span>}
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '28px'
                        }}>
                          <div>
                            <label style={labelStyle}>
                              Category
                            </label>
                            <div style={{
                              ...inputStyle,
                              backgroundColor: `${colors.primary}05`,
                              borderColor: colors.primary,
                              color: colors.primary,
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '16px',
                              padding: '16px 20px'
                            }}>
                              <FaShieldAlt size={18} />
                              CAPD Medical Supplies
                            </div>
                          </div>

                          <div>
                            <label style={labelStyle}>
                              Supplier
                            </label>
                            <div style={{
                              ...inputStyle,
                              backgroundColor: `${colors.primary}05`,
                              borderColor: colors.primary,
                              color: colors.primary,
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '16px',
                              padding: '16px 20px'
                            }}>
                              <FaShieldAlt size={18} />
                              CAPD Medical Department
                            </div>
                          </div>
                        </div>

                        <div>
                          <label style={labelStyle}>
                            Description & Specifications *
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Provide detailed description, medical specifications, and usage instructions..."
                            rows="5"
                            required
                            style={{
                              ...textareaStyle,
                              borderColor: errors.description ? colors.danger : colors.mediumGray,
                              fontSize: '16px',
                              padding: '16px 20px',
                              minHeight: '140px'
                            }}
                          />
                          {errors.description && <span style={errorTextStyle}>{errors.description}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Inventory Data */}
                {activeStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <h3 style={{
                      margin: '0 0 32px 0',
                      fontSize: '24px',
                      fontWeight: '600',
                      color: colors.textDark,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <FaWarehouse size={20} color={colors.primary} />
                      Inventory Management
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '28px'
                    }}>
                      <div>
                        <label style={labelStyle}>
                          Current Stock *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                          min="0"
                          placeholder="0"
                          style={{
                            ...inputStyle,
                            borderColor: errors.stock ? colors.danger : colors.mediumGray,
                            fontSize: '16px',
                            padding: '16px 20px'
                          }}
                        />
                        {errors.stock && <span style={errorTextStyle}>{errors.stock}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>
                          Minimum Stock *
                        </label>
                        <input
                          type="number"
                          name="minStock"
                          value={formData.minStock}
                          onChange={handleInputChange}
                          required
                          min="1"
                          placeholder="10"
                          style={{
                            ...inputStyle,
                            borderColor: errors.minStock ? colors.danger : colors.mediumGray,
                            fontSize: '16px',
                            padding: '16px 20px'
                          }}
                        />
                        {errors.minStock && <span style={errorTextStyle}>{errors.minStock}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>
                          Unit Price (PHP) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          style={{
                            ...inputStyle,
                            borderColor: errors.price ? colors.danger : colors.mediumGray,
                            fontSize: '16px',
                            padding: '16px 20px'
                          }}
                        />
                        {errors.price && <span style={errorTextStyle}>{errors.price}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Final Review */}
                {activeStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <h3 style={{
                      margin: '0 0 32px 0',
                      fontSize: '24px',
                      fontWeight: '600',
                      color: colors.textDark,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <FaClipboardList size={20} color={colors.primary} />
                      Final Review & Media
                    </h3>

                    <div>
                      <label style={labelStyle}>
                        Supply Image *
                      </label>
                      <div 
                        style={{
                          border: `2px dashed ${errors.image ? colors.danger : colors.mediumGray}`,
                          borderRadius: '16px',
                          padding: '40px',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          backgroundColor: formData.image ? `${colors.green}05` : `${colors.background}`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          minHeight: '200px'
                        }}
                        onClick={() => document.getElementById('fileInput').click()}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = errors.image ? colors.danger : colors.primary;
                          e.currentTarget.style.backgroundColor = `${colors.primary}03`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = errors.image ? colors.danger : colors.mediumGray;
                          e.currentTarget.style.backgroundColor = formData.image ? `${colors.green}05` : colors.background;
                        }}
                      >
                        <input
                          id="fileInput"
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                        
                        {imagePreview ? (
                          <>
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              style={{
                                maxWidth: '140px',
                                maxHeight: '100px',
                                borderRadius: '10px',
                                marginBottom: '20px'
                              }}
                            />
                            <div style={{ 
                              color: colors.green, 
                              fontSize: '17px',
                              fontWeight: '600'
                            }}>
                              Image Ready for Upload
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                              }}
                              style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: colors.danger,
                                color: colors.white,
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                              }}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <FaUpload size={32} color={colors.darkGray} style={{ marginBottom: '16px', opacity: 0.6 }} />
                            <div style={{ 
                              color: colors.darkGray, 
                              fontSize: '17px',
                              fontWeight: '500'
                            }}>
                              Upload Supply Image
                            </div>
                            <div style={{ 
                              fontSize: '14px',
                              color: colors.darkGray,
                              opacity: 0.6,
                              marginTop: '6px'
                            }}>
                              Required - Supports JPEG, PNG, GIF (Max 2MB)
                            </div>
                          </>
                        )}
                      </div>
                      {errors.image && <span style={errorTextStyle}>{errors.image}</span>}
                    </div>

                    {/* Summary Card */}
                    <div style={{
                      padding: '32px',
                      backgroundColor: `${colors.primary}05`,
                      borderRadius: '14px',
                      border: `1px solid ${colors.primary}10`
                    }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: colors.primary,
                        marginBottom: '20px'
                      }}>
                        Supply Summary
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        fontSize: '15px',
                        color: colors.darkGray
                      }}>
                        <div><strong>Name:</strong> {formData.name || 'Not specified'}</div>
                        <div><strong>Category:</strong> CAPD Medical Supplies</div>
                        <div><strong>Current Stock:</strong> {formData.stock || '0'}</div>
                        <div><strong>Min Stock:</strong> {formData.minStock || 'Not set'}</div>
                        <div><strong>Price:</strong> ₱{formData.price ? parseFloat(formData.price).toFixed(2) : '0.00'}</div>
                        <div><strong>Supplier:</strong> CAPD</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '40px',
                marginTop: '40px',
                borderTop: `1px solid ${colors.mediumGray}`
              }}>
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={activeStep === 1 || loading}
                  style={{
                    padding: '16px 32px',
                    border: `1px solid ${colors.mediumGray}`,
                    backgroundColor: colors.white,
                    color: colors.darkGray,
                    borderRadius: '12px',
                    cursor: activeStep === 1 || loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    fontSize: '15px',
                    opacity: activeStep === 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>

                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={loading}
                    style={{
                      padding: '16px 36px',
                      border: 'none',
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      color: colors.white,
                      borderRadius: '12px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '15px',
                      boxShadow: `0 4px 12px ${colors.primary}30`,
                      opacity: isStepValid(activeStep) ? 1 : 0.6
                    }}
                  >
                    Continue
                    <FaArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isStepValid(3)}
                    style={{
                      padding: '16px 40px',
                      border: 'none',
                      background: `linear-gradient(135deg, ${colors.green} 0%, #5A8F8D 100%)`,
                      color: colors.white,
                      borderRadius: '12px',
                      cursor: loading || !isStepValid(3) ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '15px',
                      boxShadow: `0 4px 12px ${colors.green}30`,
                      opacity: loading || !isStepValid(3) ? 0.6 : 1
                    }}
                  >
                    {loading ? <FaSpinner className="spin" size={16} /> : <FaSave size={16} />}
                    {loading ? 'Adding to Inventory...' : 'Complete Entry'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Information Panel */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            {/* Quick Help */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '18px',
              padding: '40px',
              border: `1px solid ${colors.mediumGray}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                margin: '0 0 24px 0',
                fontSize: '20px',
                fontWeight: '600',
                color: colors.textDark,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaInfoCircle size={18} color={colors.primary} />
                Guidelines
              </h3>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: `${colors.primary}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primary }}>1</div>
                  </div>
                  <div style={{ fontSize: '15px', color: colors.darkGray, lineHeight: '1.5' }}>
                    <strong>Image Required:</strong> All medical supplies must include a clear product image for identification.
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: `${colors.primary}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: colors.primary }}>2</div>
                  </div>
                  <div style={{ fontSize: '15px', color: colors.darkGray, lineHeight: '1.5' }}>
                    Complete each step before proceeding to the next. All required fields must be filled.
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: `${colors.green}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: colors.green }}>3</div>
                  </div>
                  <div style={{ fontSize: '15px', color: colors.darkGray, lineHeight: '1.5' }}>
                    Set realistic minimum stock levels to maintain supply chain efficiency.
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: `${colors.secondary}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: colors.secondary }}>4</div>
                  </div>
                  <div style={{ fontSize: '15px', color: colors.darkGray, lineHeight: '1.5' }}>
                    All supplies must meet CAPD medical standards and quality requirements.
                  </div>
                </div>
              </div>
            </div>

            {/* Required Fields Notice */}
            <div style={{
              padding: '24px',
              backgroundColor: `${colors.primary}05`,
              borderRadius: '14px',
              border: `1px solid ${colors.primary}10`
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: colors.primary,
                marginBottom: '8px'
              }}>
                Required Fields
              </div>
              <div style={{
                fontSize: '14px',
                color: colors.darkGray,
                lineHeight: '1.4'
              }}>
                Fields marked with * are mandatory. <strong>Product image is now required</strong> for all medical supplies.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          input:focus, select:focus, textarea:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 4px ${colors.primary}15 !important;
            outline: none;
          }
        `}
      </style>
    </div>
  );
};

// Professional styles
const labelStyle = {
  display: 'block',
  marginBottom: '10px',
  fontWeight: '600',
  color: '#1e293b',
  fontSize: '15px'
};

const inputStyle = {
  width: '100%',
  border: `1px solid #e2e8f0`,
  borderRadius: '12px',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  fontWeight: '400',
  backgroundColor: '#ffffff'
};

const textareaStyle = {
  width: '100%',
  border: `1px solid #e2e8f0`,
  borderRadius: '12px',
  outline: 'none',
  transition: 'all 0.2s ease',
  resize: 'vertical',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  fontWeight: '400',
  lineHeight: '1.5'
};

const errorTextStyle = {
  color: '#dc2626',
  fontSize: '13px',
  marginTop: '8px',
  display: 'block',
  fontWeight: '500'
};

export default AddSupplyModal;