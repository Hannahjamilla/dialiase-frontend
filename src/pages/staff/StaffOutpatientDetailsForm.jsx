import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUserPlus, FaSpinner, FaArrowLeft, FaCheck, FaPhone, 
  FaBirthdayCake, FaVenusMars, FaIdCard, 
  FaUser, FaInfoCircle, FaLock,
  FaExclamationTriangle, FaTimes, FaCalendarAlt,
  FaEnvelope, FaQuestionCircle, FaStethoscope,
  FaCalendarCheck, FaFilePdf, FaShieldAlt, FaMobileAlt
} from 'react-icons/fa';
import axios from 'axios';
import StaffSidebar from './StaffSidebar';
import StaffRegistrationCompleteModal from './StaffRegistrationCompleteModal';

axios.defaults.baseURL = 'http://localhost:8000/api';

const StaffOutpatientDetailsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [age, setAge] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [datesError, setDatesError] = useState('');
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const formRef = useRef(null);
  const [allowSpecialChars, setAllowSpecialChars] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    date_of_birth: '',
    phone_number: ''
  });

  // Get the verified email from navigation state
  const email = location.state?.verifiedEmail || '';

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    legalRepresentative: '',
    autoGenerateHN: true,
    appointment_date: ''
  });

  // Calculate follow-up date (28 days after appointment)
  const calculateFollowUpDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setDate(date.getDate() + 28);
    return date;
  };

  // Fetch available dates on component mount
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoadingDates(true);
        setDatesError('');
        
        const response = await axios.get('/schedules/available-dates');
        
        if (response.data?.success) {
          setAvailableDates(response.data.dates);
          // Set today's date as default if available
          const today = new Date().toISOString().split('T')[0];
          const todayAvailable = response.data.dates.find(date => date.date === today);
          
          setFormData(prev => ({ 
            ...prev, 
            appointment_date: todayAvailable ? today : response.data.dates[0].date 
          }));
        }
      } catch (error) {
        console.error('Error fetching dates:', error);
        setDatesError('Failed to load available dates. Using default schedule.');
        
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + 30);
        
        const fallbackDates = [];
        const currentDate = new Date(today);
        while (currentDate <= endDate) {
          fallbackDates.push({
            date: currentDate.toISOString().split('T')[0],
            available_slots: 100,
            formatted_date: currentDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setAvailableDates(fallbackDates);
        setFormData(prev => ({ 
          ...prev, 
          appointment_date: fallbackDates[0].date 
        }));
      } finally {
        setLoadingDates(false);
      }
    };
    
    fetchAvailableDates();
  }, []);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      setAge(calculatedAge);
      
      // Calculate months for infants
      if (calculatedAge === 0) {
        const months = today.getMonth() - birthDate.getMonth();
        setAge(months < 0 ? 12 + months : months);
      }
    } else {
      setAge(null);
    }
  }, [formData.date_of_birth]);

  const validateField = (name, value) => {
    const newErrors = { ...inputErrors };
    
    switch (name) {
      case 'first_name':
        if (!allowSpecialChars && !/^[A-Za-z\s-]{2,}$/.test(value)) {
          newErrors.first_name = 'Name must contain at least 2 letters (only letters, spaces, and hyphens allowed)';
        } else if (value.trim().length < 2) {
          newErrors.first_name = 'Name must be at least 2 characters';
        } else {
          newErrors.first_name = '';
        }
        break;
        
      case 'middle_name':
        if (value && !/^[A-Za-z\s-]{2,}$/.test(value)) {
          newErrors.middle_name = 'Middle name must contain only letters, spaces, and hyphens if provided';
        } else {
          newErrors.middle_name = '';
        }
        break;
        
      case 'last_name':
        if (!/^[A-Za-z\s-]{2,}$/.test(value)) {
          newErrors.last_name = 'Last name must contain at least 2 letters (only letters, spaces, and hyphens allowed)';
        } else {
          newErrors.last_name = '';
        }
        break;
        
      case 'suffix':
        if (value && !/^[A-Za-z.]{1,5}$/.test(value)) {
          newErrors.suffix = 'Suffix must be 1-5 characters (letters or dot) if provided';
        } else {
          newErrors.suffix = '';
        }
        break;
        
      case 'date_of_birth':
        if (!value) {
          newErrors.date_of_birth = 'Date of birth is required';
        } else {
          const dob = new Date(value);
          const today = new Date();
          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - 150);
          
          if (dob >= today) {
            newErrors.date_of_birth = 'Date of birth must be in the past';
          } else if (dob < minDate) {
            newErrors.date_of_birth = 'Date of birth seems unrealistic';
          } else {
            newErrors.date_of_birth = '';
          }
        }
        break;
        
      case 'phone_number':
        if (value && !/^09\d{9}$/.test(value)) {
          newErrors.phone_number = 'Please enter a valid Philippine mobile number (09xxxxxxxxx)';
        } else {
          newErrors.phone_number = '';
        }
        break;
        
      default:
        break;
    }
    
    setInputErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender', 
      'appointment_date', 'legalRepresentative'
    ];
    
    // Validate all fields first
    let isValid = true;
    Object.keys(formData).forEach(field => {
      if (requiredFields.includes(field)) {
        isValid = validateField(field, formData[field]) && isValid;
      }
    });

    // Check for any remaining errors
    if (!isValid || Object.values(inputErrors).some(error => error !== '')) {
      setError('Please correct the errors in the form before submitting');
      return false;
    }

    // Additional validation for age (minimum 1 month)
    if (age !== null) {
      if (typeof age === 'number' && age >= 1) {
        // Valid (1 year or older)
      } else if (typeof age === 'number' && age < 1) {
        const dob = new Date(formData.date_of_birth);
        const today = new Date();
        const months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
        
        if (months < 1) {
          setError('Patient must be at least 1 month old');
          return false;
        }
      } else {
        setError('Invalid date of birth');
        return false;
      }
    }

    return true;
  };

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setRegistrationDetails(null);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
  
    try {
      const patientData = {
        ...formData,
        email: email,
        middle_name: formData.middle_name || null,
        suffix: formData.suffix || null,
        phone_number: formData.phone_number || null,
        allow_special_chars: allowSpecialChars
      };
  
      const response = await axios.post('/patient/register', patientData);
      
      if (response.data.success) {
        const successMsg = `Patient registered successfully! Hospital Number: ${response.data.hospitalNumber}`;
        
        setSuccess(successMsg);
        
        const registrationData = {
          hospitalNumber: response.data.hospitalNumber,
          initialAppointment: formData.appointment_date,
          followUpDate: response.data.followUpDate,
          patientName: `${formData.first_name} ${formData.last_name}`,
          email: email
        };

        setRegistrationDetails(registrationData);
        setShowRegistrationModal(true);
      }
    } catch (err) {
      let errorMsg = 'Registration failed. Please try again.';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        errorMsg = `Validation error: ${firstError}`;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const closeError = () => setError('');
  const closeSuccess = () => setSuccess('');

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const downloadRegistrationCertificate = async () => {
    try {
      const response = await axios.post('/patient/generate-certificate', {
        patientDetails: registrationDetails
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Registration_Certificate_${registrationDetails.hospitalNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setError('Failed to download certificate. Please try again.');
    }
  };

  const handleRegisterAnother = () => {
    setShowRegistrationModal(false);
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      date_of_birth: '',
      gender: '',
      phone_number: '',
      legalRepresentative: '',
      autoGenerateHN: true,
      appointment_date: availableDates[0]?.date || ''
    });
    setInputErrors({
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      date_of_birth: '',
      phone_number: ''
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      overflowX: 'hidden',
      marginLeft: '274px', 
      marginTop: '410px' 
    }}>
      <StaffSidebar />
      
      <div style={{
        flex: 1,
        padding: '20px',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: '#395886',
          padding: '15px 20px',
          borderRadius: '8px',
          color: 'white'
        }}>
          <button 
            onClick={() => navigate('/staff/StaffOutpatientEmailVerification')}
            disabled={loading}
            style={{
              backgroundColor: '#638ECB',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <FaArrowLeft /> Back
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            <FaUserPlus style={{ marginRight: '10px' }} />
            Complete New CAPD Patient Registration
          </h1>
          <div style={{ width: '100px' }}></div>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#477977',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px'
            }}>
              <FaCheck />
            </div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Email Verification</p>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#477977',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px'
            }}>
              <FaCheck />
            </div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>OTP Confirmation</p>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#395886',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px'
            }}>
              3
            </div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Patient Details</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            borderLeft: '4px solid #f44336',
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaExclamationTriangle style={{ color: '#f44336', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{error}</div>
            <button onClick={closeError} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FaTimes style={{ color: '#f44336' }} />
            </button>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#e8f5e9',
            borderLeft: '4px solid #4caf50',
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FaCheck style={{ color: '#4caf50', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>{success}</div>
            <button onClick={closeSuccess} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FaTimes style={{ color: '#4caf50' }} />
            </button>
          </div>
        )}

        {/* Main Form Content */}
        <div ref={formRef} style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '25px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          overflowX: 'hidden'
        }}>
          <form onSubmit={handleFormSubmit}>
            {/* Form Introduction */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                color: '#395886', 
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                Patient Information
              </h2>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                Please fill in all required details for the new CAPD patient. Fields marked with <span style={{ color: 'red' }}>*</span> are mandatory.
              </p>
              
              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '15px',
                borderRadius: '6px',
                display: 'flex',
                gap: '15px',
                alignItems: 'flex-start'
              }}>
                <FaInfoCircle style={{ color: '#395886', fontSize: '20px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#395886' }}>Important:</strong> This form will create a new patient record and schedule their first appointment. 
                  A secure password will be automatically generated and emailed to the patient.
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <FaUser style={{ color: '#395886' }} />
                <h3 style={{ 
                  color: '#395886', 
                  margin: 0 
                }}>
                  Personal Information
                </h3>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaIdCard style={{ marginRight: '8px', color: '#638ECB' }} />
                    First Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Hannah Jamilla"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: inputErrors.first_name ? '1px solid #f44336' : '1px solid #ddd',
                      fontSize: '16px'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginTop: '5px',
                    gap: '10px'
                  }}>
                    <input
                      type="checkbox"
                      id="allowSpecialChars"
                      checked={allowSpecialChars}
                      onChange={() => setAllowSpecialChars(!allowSpecialChars)}
                    />
                    <label htmlFor="allowSpecialChars" style={{ fontSize: '12px', color: '#777' }}>
                      Allow special characters/numbers in name (for unique cases)
                    </label>
                  </div>
                  {inputErrors.first_name && (
                    <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                      {inputErrors.first_name}
                    </div>
                  )}
                  {!inputErrors.first_name && (
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                      {allowSpecialChars 
                        ? 'Special characters and numbers allowed' 
                        : 'Only letters, spaces, and hyphens allowed'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaIdCard style={{ marginRight: '8px', color: '#638ECB' }} />
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    placeholder="Del Rosario"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: inputErrors.middle_name ? '1px solid #f44336' : '1px solid #ddd',
                      fontSize: '16px'
                    }}
                  />
                  {inputErrors.middle_name ? (
                    <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                      {inputErrors.middle_name}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                      Optional, letters and spaces allowed
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaIdCard style={{ marginRight: '8px', color: '#638ECB' }} />
                    Last Name <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Peralta"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: inputErrors.last_name ? '1px solid #f44336' : '1px solid #ddd',
                      fontSize: '16px'
                    }}
                  />
                  {inputErrors.last_name ? (
                    <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                      {inputErrors.last_name}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                      Minimum 2 letters, spaces and hyphens allowed
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaIdCard style={{ marginRight: '8px', color: '#638ECB' }} />
                    Suffix
                  </label>
                  <input
                    type="text"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleChange}
                    placeholder="Jr., Sr., III"
                    maxLength="5"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: inputErrors.suffix ? '1px solid #f44336' : '1px solid #ddd',
                      fontSize: '16px'
                    }}
                  />
                  {inputErrors.suffix ? (
                    <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                      {inputErrors.suffix}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                      Optional (e.g., Jr., Sr.)
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaBirthdayCake style={{ marginRight: '8px', color: '#638ECB' }} />
                    Date of Birth <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: inputErrors.date_of_birth ? '1px solid #f44336' : '1px solid #ddd',
                      fontSize: '16px'
                    }}
                  />
                  {formData.date_of_birth && (
                    <div style={{ 
                      marginTop: '8px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      Age: {age !== null ? 
                        (typeof age === 'number' && age < 1 ? 
                          `${age} month${age !== 1 ? 's' : ''}` : 
                          `${age} year${age !== 1 ? 's' : ''}`) : 
                        'Invalid date'}
                    </div>
                  )}
                  {inputErrors.date_of_birth ? (
                    <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                      {inputErrors.date_of_birth}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                      Patient must be at least 1 month old
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaVenusMars style={{ marginRight: '8px', color: '#638ECB' }} />
                    Gender <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                    For medical record purposes
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <FaEnvelope style={{ color: '#395886' }} />
                <h3 style={{ 
                  color: '#395886', 
                  margin: 0 
                }}>
                  Contact Information
                </h3>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaEnvelope style={{ marginRight: '8px', color: '#638ECB' }} />
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={email}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                    Verified in previous step
                  </div>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaMobileAlt style={{ marginRight: '8px', color: '#638ECB' }} />
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="09123456789"
                    maxLength="11"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: inputErrors.phone_number ? '1px solid #f44336' : '1px solid #ddd',
                      fontSize: '16px'
                    }}
                  />
                  {inputErrors.phone_number ? (
                    <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                      {inputErrors.phone_number}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                      Optional - format: 09xxxxxxxxx
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#555'
                  }}>
                    <FaUser style={{ marginRight: '8px', color: '#638ECB' }} />
                    Legal Representative/Guardian <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="legalRepresentative"
                    value={formData.legalRepresentative}
                    onChange={handleChange}
                    placeholder="Name of legal representative/guardian"
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '16px'
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#777', marginTop: '5px' }}>
                    Required for minors or incapacitated patients
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Scheduling Section */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <FaCalendarAlt style={{ color: '#395886' }} />
                <h3 style={{ 
                  color: '#395886', 
                  margin: 0 
                }}>
                  Appointment Scheduling
                </h3>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#555'
                }}>
                  <FaCalendarCheck style={{ marginRight: '8px', color: '#638ECB' }} />
                  Appointment Date <span style={{ color: 'red' }}>*</span>
                </label>
                {loadingDates ? (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '5px',
                    textAlign: 'center',
                    color: '#555'
                  }}>
                    <FaSpinner style={{ 
                      animation: 'spin 1s linear infinite',
                      marginRight: '10px'
                    }} />
                    Loading available dates...
                  </div>
                ) : datesError ? (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '5px',
                    color: '#e65100'
                  }}>
                    <FaExclamationTriangle style={{ marginRight: '10px' }} />
                    {datesError}
                  </div>
                ) : availableDates.length > 0 ? (
                  <>
                    <select
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        fontSize: '16px',
                        backgroundColor: 'white'
                      }}
                    >
                      {availableDates.map((dateObj) => (
                        <option key={dateObj.date} value={dateObj.date}>
                          {formatDisplayDate(dateObj.date)}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: '12px', color: '#20B2AA', marginTop: '5px' }}>
                      Follow-up checkup: {formData.appointment_date && 
                        formatDisplayDate(calculateFollowUpDate(formData.appointment_date))}
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '15px',
                    backgroundColor: '#ffebee',
                    borderRadius: '5px',
                    color: '#c62828'
                  }}>
                    <FaExclamationTriangle style={{ marginRight: '10px' }} />
                    No available dates in the next 30 days
                  </div>
                )}
              </div>
              
              <div style={{
                backgroundColor: '#e8f5e9',
                padding: '15px',
                borderRadius: '6px',
                marginTop: '20px'
              }}>
                <h4 style={{ 
                  marginTop: '0',
                  marginBottom: '10px',
                  color: '#2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <FaStethoscope /> Scheduling Information:
                </h4>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '20px',
                  color: '#555'
                }}>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Follow-up:</strong> Each patient will be automatically scheduled for a follow-up in 28 days
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Rescheduling:</strong> Patients can reschedule their appointments if needed
                  </li>
                  <li style={{ marginBottom: '8px' }}>
                    <strong>Reminders:</strong> Automated reminders will be sent 3 days and 1 day before the appointment
                  </li>
                  <li>
                    <strong>Credentials:</strong> Patient will receive their login credentials via email
                  </li>
                </ul>
              </div>
            </div>

            {/* Account Security Section */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <FaShieldAlt style={{ color: '#395886' }} />
                <h3 style={{ 
                  color: '#395886', 
                  margin: 0 
                }}>
                  Account Security
                </h3>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '6px',
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center'
                }}>
                  <FaLock style={{ 
                    color: '#395886', 
                    fontSize: '24px',
                    flexShrink: 0 
                  }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Auto-generated Password</h4>
                    <p style={{ margin: 0, color: '#666' }}>
                      The system will create a strong password containing uppercase, lowercase, numbers, and special characters.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '6px',
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center'
                }}>
                  <FaEnvelope style={{ 
                    color: '#395886', 
                    fontSize: '24px',
                    flexShrink: 0 
                  }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Secure Delivery</h4>
                    <p style={{ margin: 0, color: '#666' }}>
                      The password will be securely sent to the patient's verified email address.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '6px',
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center'
                }}>
                  <FaUser style={{ 
                    color: '#395886', 
                    fontSize: '24px',
                    flexShrink: 0 
                  }} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>First Login</h4>
                    <p style={{ margin: 0, color: '#666' }}>
                      Patient will be prompted to change their password upon first login.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ 
              textAlign: 'center',
              marginTop: '30px'
            }}>
              <button 
                type="submit" 
                disabled={loading || loadingDates || availableDates.length === 0}
                style={{
                  backgroundColor: loading ? '#95a5a6' : '#477977',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: '200px',
                  justifyContent: 'center'
                }}
              >
                {loading ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Processing...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
              
              <div style={{ 
                marginTop: '15px',
                fontSize: '14px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <FaInfoCircle style={{ color: '#395886' }} />
                By submitting this form, you confirm that all provided information is accurate and complete.
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Registration Complete Modal */}
      {showRegistrationModal && registrationDetails && (
        <StaffRegistrationCompleteModal
          registrationDetails={registrationDetails}
          onClose={() => setShowRegistrationModal(false)}
          onDownloadCertificate={downloadRegistrationCertificate}
          onRegisterAnother={handleRegisterAnother}
        />
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow-x: hidden;
        }
        
        input, select, button {
          font-family: inherit;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .read-only-input {
          background-color: '#f5f5f5';
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default StaffOutpatientDetailsForm;