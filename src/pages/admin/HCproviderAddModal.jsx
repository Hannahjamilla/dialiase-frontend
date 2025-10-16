import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { parse } from 'papaparse';
import api from '../../api/axios';
import { FiX, FiUser, FiMail, FiLock, FiInfo, FiHelpCircle, FiCheckCircle, FiUpload, FiDownload, FiAlertCircle, FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import CSVPreviewPanel from './CSVPreviewPanel';
import SuccessRegisterEmplModal from './SuccessRegisterEmplModal';
import BulkSuccessModal from './BulkSuccessModal';
import styles from './HCproviderAddModalStyle';

const FiIdCard = () => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: 'middle' }}
  >
    <rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <line x1="8" y1="6" x2="8" y2="6"></line>
    <line x1="16" y1="6" x2="16" y2="6"></line>
    <line x1="8" y1="18" x2="8" y2="18"></line>
  </svg>
);

const HCproviderAddModal = ({ showModal, setShowModal, refreshProviders }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    employeeNumber: '',
    userLevel: '',
    newUserLevel: '',
    specialization: '',
    Doc_license: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [nameValid, setNameValid] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkEntries, setBulkEntries] = useState([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [registeredEmployees, setRegisteredEmployees] = useState([]);
  const [validationStatus, setValidationStatus] = useState({
    first_name: { valid: null, message: 'Enter first name' },
    middle_name: { valid: null, message: 'Middle name is optional' },
    last_name: { valid: null, message: 'Enter last name' },
    suffix: { valid: null, message: 'Suffix is optional' },
    userLevel: { valid: null, message: 'Select position' },
    Doc_license: { valid: null, message: 'Enter license number if applicable' }
  });
  const [currentEmployeeMatch, setCurrentEmployeeMatch] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBulkSuccessModal, setShowBulkSuccessModal] = useState(false);
  const [registeredEmployeeData, setRegisteredEmployeeData] = useState(null);
  const [bulkResults, setBulkResults] = useState(null);
  const [nameSuggestions, setNameSuggestions] = useState({
    first_name: [],
    last_name: [],
    showSuggestions: false,
    activeField: null
  });
  const [registrationMode, setRegistrationMode] = useState('direct');
  const [fieldTouched, setFieldTouched] = useState({
    first_name: false,
    last_name: false,
    email: false,
    userLevel: false,
    Doc_license: false,
    newUserLevel: false
  });

  // Check if Doc_license is required based on userLevel
  const isLicenseRequired = () => {
    return formData.userLevel === 'doctor' || formData.userLevel === 'nurse';
  };

  const generateEmployeeNumber = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `EMP-${randomNum}`;
  };

  useEffect(() => {
    if (showModal) {
      fetchRegisteredEmployees();
      setFormData(prev => ({
        ...prev,
        employeeNumber: generateEmployeeNumber()
      }));
    }
  }, [showModal]);

  useEffect(() => {
    if (registrationMode === 'csv' && (formData.first_name || formData.middle_name || formData.last_name || formData.suffix)) {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      setTypingTimeout(setTimeout(() => {
        validateEmployeeData();
      }, 500));
    }

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [formData.first_name, formData.middle_name, formData.last_name, formData.suffix, registrationMode]);

  useEffect(() => {
    if (formData.Doc_license && fieldTouched.Doc_license) {
      const timeoutId = setTimeout(() => {
        validateDocLicense();
      }, 800);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.Doc_license, fieldTouched.Doc_license]);

  useEffect(() => {
    if (registrationMode === 'direct') {
      const timeoutId = setTimeout(() => {
        validateDirectRegistration();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData.first_name, formData.last_name, formData.middle_name, formData.suffix, formData.userLevel, formData.Doc_license, registrationMode, fieldTouched]);

  const validateDocLicense = async () => {
    if (!formData.Doc_license || !fieldTouched.Doc_license) return;

    try {
      const response = await api.get(`admin/check-doc-license/${formData.Doc_license}`);
      const isUnique = response.data.is_unique;

      setValidationStatus(prev => ({
        ...prev,
        Doc_license: { 
          valid: isUnique, 
          message: isUnique ? '✓ License number is available' : '✗ License number already exists'
        }
      }));

      if (!isUnique) {
        setErrors(prev => ({ ...prev, Doc_license: 'License number already exists' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.Doc_license;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error validating license:', error);
    }
  };

  const validateDirectRegistration = () => {
    const newErrors = {};
    const newValidationStatus = { ...validationStatus };

    if (fieldTouched.first_name) {
      if (!formData.first_name.trim()) {
        newValidationStatus.first_name = { valid: false, message: '✗ First name is required' };
        newErrors.first_name = 'First name is required';
      } else {
        newValidationStatus.first_name = { valid: true, message: '✓ Valid first name' };
      }
    }

    if (fieldTouched.last_name) {
      if (!formData.last_name.trim()) {
        newValidationStatus.last_name = { valid: false, message: '✗ Last name is required' };
        newErrors.last_name = 'Last name is required';
      } else {
        newValidationStatus.last_name = { valid: true, message: '✓ Valid last name' };
      }
    }

    if (fieldTouched.userLevel) {
      if (!formData.userLevel) {
        newValidationStatus.userLevel = { valid: false, message: '✗ Position is required' };
        newErrors.userLevel = 'User level is required';
      } else {
        newValidationStatus.userLevel = { valid: true, message: '✓ Valid position' };
      }
    }

    // Validate Doc_license if required
    if (isLicenseRequired() && fieldTouched.Doc_license) {
      if (!formData.Doc_license.trim()) {
        newValidationStatus.Doc_license = { valid: false, message: '✗ License number is required' };
        newErrors.Doc_license = 'License number is required for this position';
      } else {
        newValidationStatus.Doc_license = { valid: true, message: '✓ Valid license number' };
      }
    }

    if (fieldTouched.email && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        if (errors.email) {
          delete newErrors.email;
        }
      }
    }

    if (formData.userLevel === 'custom' && fieldTouched.newUserLevel) {
      if (!formData.newUserLevel.trim()) {
        newErrors.newUserLevel = 'Custom role name is required';
      } else {
        if (errors.newUserLevel) {
          delete newErrors.newUserLevel;
        }
      }
    }

    const isRegistered = registeredEmployees.some(emp => 
      emp.first_name.toLowerCase() === formData.first_name.toLowerCase() && 
      emp.last_name.toLowerCase() === formData.last_name.toLowerCase() &&
      (formData.middle_name ? emp.middle_name?.toLowerCase() === formData.middle_name.toLowerCase() : true) &&
      (formData.suffix ? emp.suffix?.toLowerCase() === formData.suffix.toLowerCase() : true)
    );

    if (isRegistered && fieldTouched.first_name && fieldTouched.last_name) {
      newValidationStatus.first_name = { valid: false, message: '✗ Employee already registered' };
      newValidationStatus.last_name = { valid: false, message: '✗ Employee already registered' };
      newErrors.registration = 'This employee is already registered and cannot be registered again';
    }

    setValidationStatus(newValidationStatus);
    setErrors(newErrors);
  };

  const handleFieldBlur = (fieldName) => {
    setFieldTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const getNameSuggestions = (fieldName, value) => {
    if (!csvUploaded || !value || value.length < 2 || registrationMode !== 'csv') {
      setNameSuggestions(prev => ({
        ...prev,
        [fieldName]: [],
        showSuggestions: false,
        activeField: null
      }));
      return;
    }

    const suggestions = csvData
      .filter(entry => {
        const fieldValue = entry[fieldName] || '';
        return fieldValue.toLowerCase().includes(value.toLowerCase());
      })
      .map(entry => entry[fieldName])
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 5);

    setNameSuggestions(prev => ({
      ...prev,
      [fieldName]: suggestions,
      showSuggestions: suggestions.length > 0,
      activeField: fieldName
    }));
  };

  const handleSuggestionClick = (fieldName, suggestion) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: suggestion
    }));
    
    setNameSuggestions(prev => ({
      ...prev,
      showSuggestions: false,
      activeField: null
    }));
  };

  const validateEmployeeData = () => {
    if (!csvUploaded || csvData.length === 0 || registrationMode !== 'csv') {
      setValidationStatus({
        first_name: { valid: null, message: 'Upload CSV to validate' },
        middle_name: { valid: null, message: 'Upload CSV to validate' },
        last_name: { valid: null, message: 'Upload CSV to validate' },
        suffix: { valid: null, message: 'Upload CSV to validate' },
        userLevel: { valid: null, message: 'Upload CSV to validate' },
        Doc_license: { valid: null, message: 'Enter license number if applicable' }
      });
      setNameValid(null);
      setCurrentEmployeeMatch(null);
      return;
    }

    const nameMatches = csvData.filter(entry => {
      const firstNameMatch = entry.first_name?.toLowerCase() === formData.first_name.toLowerCase();
      const lastNameMatch = entry.last_name?.toLowerCase() === formData.last_name.toLowerCase();
      const middleNameMatch = !formData.middle_name || 
                            !entry.middle_name || 
                            entry.middle_name?.toLowerCase() === formData.middle_name.toLowerCase();
      const suffixMatch = !formData.suffix || 
                        !entry.suffix || 
                        entry.suffix?.toLowerCase() === formData.suffix.toLowerCase();
      
      return firstNameMatch && lastNameMatch && middleNameMatch && suffixMatch;
    });

    const exactMatch = nameMatches.length > 0 ? nameMatches[0] : null;

    const isRegistered = registeredEmployees.some(emp => 
      emp.first_name.toLowerCase() === formData.first_name.toLowerCase() && 
      emp.last_name.toLowerCase() === formData.last_name.toLowerCase() &&
      (formData.middle_name ? emp.middle_name?.toLowerCase() === formData.middle_name.toLowerCase() : true) &&
      (formData.suffix ? emp.suffix?.toLowerCase() === formData.suffix.toLowerCase() : true)
    );

    setCurrentEmployeeMatch(exactMatch);

    setValidationStatus(prev => ({
      first_name: { 
        valid: nameMatches.length > 0 && !isRegistered, 
        message: nameMatches.length > 0 ? 
          (isRegistered ? '✗ Already registered' : '✓ Valid first name') : 
          'First name not found in CSV' 
      },
      middle_name: {
        valid: formData.middle_name ? 
          (nameMatches.length > 0 && nameMatches[0].middle_name?.toLowerCase() === formData.middle_name.toLowerCase()) :
          true,
        message: formData.middle_name ? 
          (nameMatches.length > 0 ? 
            (nameMatches[0].middle_name?.toLowerCase() === formData.middle_name.toLowerCase() ? 
              '✓ Valid middle name' : 
              'Middle name does not match CSV') : 
            'Enter names first to validate') : 
          'Middle name is optional'
      },
      last_name: { 
        valid: nameMatches.length > 0 && !isRegistered, 
        message: nameMatches.length > 0 ? 
          (isRegistered ? '✗ Already registered' : '✓ Valid last name') : 
          'Last name not found in CSV' 
      },
      suffix: {
        valid: formData.suffix ? 
          (nameMatches.length > 0 && nameMatches[0].suffix?.toLowerCase() === formData.suffix.toLowerCase()) :
          true,
        message: formData.suffix ? 
          (nameMatches.length > 0 ? 
            (nameMatches[0].suffix?.toLowerCase() === formData.suffix.toLowerCase() ? 
              '✓ Valid suffix' : 
              'Suffix does not match CSV') : 
            'Enter names first to validate') : 
          'Suffix is optional'
      },
      userLevel: { 
        valid: exactMatch !== null && !isRegistered,
        message: exactMatch ? 
          (isRegistered ? '✗ Already registered' : '✓ Valid position') : 
          nameMatches.length > 0 ? 
            'Position not found in CSV' : 
            'Enter names first to validate position'
      },
      Doc_license: prev.Doc_license
    }));

    const allValid = (
      nameMatches.length > 0 && 
      exactMatch !== null &&
      !isRegistered &&
      (formData.middle_name ? 
        nameMatches[0].middle_name?.toLowerCase() === formData.middle_name.toLowerCase() : 
        true) &&
      (formData.suffix ? 
        nameMatches[0].suffix?.toLowerCase() === formData.suffix.toLowerCase() : 
        true)
    );

    setNameValid(allValid);

    if (allValid && exactMatch) {
      setFormData(prev => ({
        ...prev,
        email: exactMatch.email || prev.email,
        userLevel: exactMatch.userLevel || exactMatch.position || prev.userLevel,
        employeeNumber: exactMatch.employeeNumber || prev.employeeNumber,
        specialization: exactMatch.specialization || prev.specialization,
        Doc_license: exactMatch.Doc_license || prev.Doc_license
      }));
    }
  };

  const fetchRegisteredEmployees = async () => {
    try {
      const response = await api.get('admin/providers');
      setRegisteredEmployees(response.data);
    } catch (error) {
      console.error('Error fetching registered employees:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      email: '',
      employeeNumber: generateEmployeeNumber(),
      userLevel: '',
      newUserLevel: '',
      specialization: '',
      Doc_license: ''
    });
    setErrors({});
    setApiError('');
    setSuccessMessage('');
    setNameValid(null);
    setPreviewData([]);
    setFileName('');
    setValidationStatus({
      first_name: { valid: null, message: 'Enter first name' },
      middle_name: { valid: null, message: 'Middle name is optional' },
      last_name: { valid: null, message: 'Enter last name' },
      suffix: { valid: null, message: 'Suffix is optional' },
      userLevel: { valid: null, message: 'Select position' },
      Doc_license: { valid: null, message: 'Enter license number if applicable' }
    });
    setCurrentEmployeeMatch(null);
    setNameSuggestions({
      first_name: [],
      last_name: [],
      showSuggestions: false,
      activeField: null
    });
    setFieldTouched({
      first_name: false,
      last_name: false,
      email: false,
      userLevel: false,
      Doc_license: false,
      newUserLevel: false
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if ((name === 'first_name' || name === 'last_name') && csvUploaded && registrationMode === 'csv') {
      getNameSuggestions(name, value);
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // If userLevel changes and license becomes required, mark Doc_license as touched
    if (name === 'userLevel') {
      if (value === 'doctor' || value === 'nurse') {
        setFieldTouched(prev => ({ ...prev, Doc_license: true }));
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    parse(file, {
      header: true,
      complete: (results) => {
        if (results.data.length > 0) {
          setCsvData(results.data);
          setPreviewData(results.data.slice(0, 1000));
          setCsvUploaded(true);
          
          if (formData.first_name || formData.last_name) {
            validateEmployeeData();
          }
        }
      },
      error: (error) => {
        setApiError('Error parsing CSV file: ' + error.message);
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.userLevel) newErrors.userLevel = 'User level is required';
    if (!formData.employeeNumber) newErrors.employeeNumber = 'Employee number is required';
    
    // Validate Doc_license if required
    if (isLicenseRequired() && !formData.Doc_license.trim()) {
      newErrors.Doc_license = 'License number is required for this position';
    }
    
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (formData.userLevel === 'custom' && !formData.newUserLevel.trim()) {
      newErrors.newUserLevel = 'Custom role name is required';
    }
    
    if (registrationMode === 'csv' && csvUploaded && nameValid === false) {
      newErrors.csvValidation = 'Name not found in CSV file or already registered';
    }

    const isRegistered = registeredEmployees.some(emp => 
      emp.first_name.toLowerCase() === formData.first_name.toLowerCase() && 
      emp.last_name.toLowerCase() === formData.last_name.toLowerCase() &&
      (formData.middle_name ? emp.middle_name?.toLowerCase() === formData.middle_name.toLowerCase() : true) &&
      (formData.suffix ? emp.suffix?.toLowerCase() === formData.suffix.toLowerCase() : true)
    );

    if (isRegistered) {
      newErrors.registration = 'This employee is already registered and cannot be registered again';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    parse(file, {
      header: true,
      complete: async (results) => {
        if (results.data.length > 0) {
          const entries = results.data.map(entry => {
            return {
              first_name: entry.first_name,
              last_name: entry.last_name,
              middle_name: entry.middle_name,
              suffix: entry.suffix,
              email: entry.email,
              userLevel: entry.userLevel || entry.position,
              newUserLevel: entry.userLevel === 'custom' ? entry.newUserLevel : '',
              specialization: entry.specialization || '',
              Doc_license: entry.Doc_license || ''
            };
          }).filter(entry => entry.first_name && entry.last_name);

          setIsLoading(true);
          setApiError('');
          setSuccessMessage('Processing Group registration...');

          try {
            const response = await api.post('admin/bulk-register-hcproviders', {
              employees: entries
            });

            setBulkResults(response.data);
            setShowBulkSuccessModal(true);
            refreshProviders();
          } catch (error) {
            console.error('Group registration error:', error);
            setApiError('Group registration failed: ' + (error.response?.data?.message || error.message));
          } finally {
            setIsLoading(false);
          }
        }
      },
      error: (error) => {
        setApiError('Error parsing Group CSV file: ' + error.message);
      }
    });
  };
  
// Add this error handling in the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsLoading(true);
  setApiError('');
  setSuccessMessage('');

  try {
    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      middle_name: formData.middle_name?.trim() || '',
      suffix: formData.suffix?.trim() || '',
      email: formData.email?.trim() || '',
      employeeNumber: formData.employeeNumber,
      userLevel: formData.userLevel === 'custom' ? formData.newUserLevel : formData.userLevel,
      specialization: formData.specialization?.trim() || '',
      Doc_license: formData.Doc_license?.trim() || ''
    };

    // Remove empty fields that might cause validation issues
    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    console.log('Sending payload:', payload); // Debug log

    const response = await api.post('admin/pre-register-hcprovider', payload);

    setRegisteredEmployeeData({
      ...payload,
      userID: response.data.userID,
      password: response.data.password
    });

    setShowSuccessModal(true);
    refreshProviders();
    fetchRegisteredEmployees();
    
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response) {
      if (error.response.status === 409) {
        errorMessage = error.response.data?.error || 'This employee is already registered in the system.';
      } else if (error.response.status === 422) {
        const errors = error.response.data?.errors;
        if (errors) {
          errorMessage = Object.values(errors).flat().join('\n');
        } else {
          errorMessage = 'Validation failed. Please check your input.';
        }
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    setApiError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

const handleDownloadCredentials = async () => {
  try {
    if (!registeredEmployeeData || !registeredEmployeeData.userID) {
      setApiError('Missing employee data for PDF generation');
      return;
    }

    console.log('Downloading credentials for:', {
      userID: registeredEmployeeData.userID,
      employeeNumber: registeredEmployeeData.employeeNumber,
      hasPassword: !!registeredEmployeeData.password
    });

    // Use POST method with data in request body
    const response = await api.post('admin/generate-pre-register-pdf', {
      userID: registeredEmployeeData.userID,
      password: registeredEmployeeData.password || ''
    }, {
      responseType: 'blob'
    });

    // Create blob from response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `pre_register_${registeredEmployeeData.employeeNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    setShowSuccessModal(false);
    setShowModal(false);
    resetForm();
  } catch (error) {
    console.error('Error downloading credentials:', error);
    let errorMessage = 'Failed to download credentials. Please try again.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'User not found for PDF generation';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error during PDF generation';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    setApiError(errorMessage);
  }
};

  const handleDownloadBulkReport = () => {
    if (!bulkResults) return;

    const csvContent = [
      ['First Name', 'Last Name', 'Email', 'Employee Number', 'Position', 'Specialization', 'License Number', 'Status', 'Message'],
      ...bulkResults.results.map(result => [
        result.employee.first_name,
        result.employee.last_name,
        result.employee.email,
        result.employeeNumber || '',
        result.employee.userLevel,
        result.employee.specialization || '',
        result.employee.Doc_license || '',
        result.status,
        result.message || ''
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `bulk_registration_report_${new Date().toISOString().slice(0,10)}.csv`);

    setShowBulkSuccessModal(false);
    setShowModal(false);
    resetForm();
  };

  const isFormValid = () => {
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.userLevel) {
      return false;
    }

    // Check if license is required but not provided
    if (isLicenseRequired() && !formData.Doc_license.trim()) {
      return false;
    }

    if (formData.userLevel === 'custom' && !formData.newUserLevel.trim()) {
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return false;
    }

    const isRegistered = registeredEmployees.some(emp => 
      emp.first_name.toLowerCase() === formData.first_name.toLowerCase() && 
      emp.last_name.toLowerCase() === formData.last_name.toLowerCase() &&
      (formData.middle_name ? emp.middle_name?.toLowerCase() === formData.middle_name.toLowerCase() : true) &&
      (formData.suffix ? emp.suffix?.toLowerCase() === formData.suffix.toLowerCase() : true)
    );

    if (isRegistered) {
      return false;
    }

    if (registrationMode === 'csv' && csvUploaded && nameValid === false) {
      return false;
    }

    return true;
  };

  if (!showModal) return null;

  return (
    <>
      <div style={styles.modalOverlay}></div>

      <div style={{
        ...styles.modalContainer,
        filter: (showSuccessModal || showBulkSuccessModal) ? 'blur(4px)' : 'none',
        transition: 'filter 0.3s ease',
        width: registrationMode === 'direct' ? '95%' : '95%',
        maxWidth: registrationMode === 'direct' ? '1200px' : '1600px',
        maxHeight: '95vh'
      }}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            <FiUser style={styles.userIcon} />
            CAPD Healthcare Provider Registration
          </h2>
          <button 
            onClick={() => { setShowModal(false); resetForm(); }}
            style={styles.closeButton}
          >
            <FiX />
          </button>
        </div>

        {/* Mode Toggle */}
        <div style={styles.modeToggleContainer}>
          <div style={styles.modeToggle}>
            <button
              type="button"
              onClick={() => setRegistrationMode('direct')}
              style={{
                ...styles.modeButton,
                backgroundColor: registrationMode === 'direct' ? '#395886' : '#f1f5f9',
                color: registrationMode === 'direct' ? 'white' : '#64748b'
              }}
            >
              <FiUser style={styles.modeIcon} />
              Direct Registration
            </button>
            <button
              type="button"
              onClick={() => setRegistrationMode('csv')}
              style={{
                ...styles.modeButton,
                backgroundColor: registrationMode === 'csv' ? '#395886' : '#f1f5f9',
                color: registrationMode === 'csv' ? 'white' : '#64748b'
              }}
            >
              <FiFileText style={styles.modeIcon} />
              CSV Validation Mode
            </button>
          </div>
        </div>

        <div style={{
          ...styles.modalContent,
          flexDirection: registrationMode === 'direct' ? 'column' : 'row',
          overflow: 'hidden'
        }}>
          {registrationMode === 'direct' ? (
            // Direct Registration - Full Screen Form
            <div style={styles.directRegistrationContainer}>
              <div style={styles.directForm}>
                <div style={styles.directFormSection}>
                  <h3 style={styles.panelTitle}>
                    <FiUser style={styles.infoIcon} />
                    Personal Information
                  </h3>

                  <div style={styles.nameFields}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiUser style={styles.inputIcon} />
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('first_name')}
                        style={{
                          ...styles.inputField,
                          borderColor: errors.first_name ? '#ef4444' : 
                                      (fieldTouched.first_name && validationStatus.first_name.valid === false) ? '#ef4444' : 
                                      (fieldTouched.first_name && validationStatus.first_name.valid) ? '#10b981' : '#cbd5e1'
                        }}
                        placeholder="Hannah"
                      />
                      <div style={styles.validationContainer}>
                        {fieldTouched.first_name && validationStatus.first_name.message && (
                          <p style={{
                            ...styles.validationMessage,
                            color: validationStatus.first_name.valid ? '#16a34a' : 
                                  validationStatus.first_name.valid === false ? '#dc2626' : 
                                  '#64748b'
                          }}>
                            {validationStatus.first_name.valid ? (
                              <FiCheckCircle style={styles.validationIcon} />
                            ) : validationStatus.first_name.valid === false ? (
                              <FiAlertCircle style={styles.validationIcon} />
                            ) : (
                              <FiInfo style={styles.validationIcon} />
                            )}
                            {validationStatus.first_name.message}
                          </p>
                        )}
                        {errors.first_name && fieldTouched.first_name && (
                          <p style={styles.errorMessage}>
                            <FiX style={styles.errorIconSmall} />
                            {errors.first_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiUser style={styles.inputIcon} />
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('last_name')}
                        style={{
                          ...styles.inputField,
                          borderColor: errors.last_name ? '#ef4444' : 
                                      (fieldTouched.last_name && validationStatus.last_name.valid === false) ? '#ef4444' : 
                                      (fieldTouched.last_name && validationStatus.last_name.valid) ? '#10b981' : '#cbd5e1'
                        }}
                        placeholder="Peralta"
                      />
                      <div style={styles.validationContainer}>
                        {fieldTouched.last_name && validationStatus.last_name.message && (
                          <p style={{
                            ...styles.validationMessage,
                            color: validationStatus.last_name.valid ? '#16a34a' : 
                                  validationStatus.last_name.valid === false ? '#dc2626' : 
                                  '#64748b'
                          }}>
                            {validationStatus.last_name.valid ? (
                              <FiCheckCircle style={styles.validationIcon} />
                            ) : validationStatus.last_name.valid === false ? (
                              <FiAlertCircle style={styles.validationIcon} />
                            ) : (
                              <FiInfo style={styles.validationIcon} />
                            )}
                            {validationStatus.last_name.message}
                          </p>
                        )}
                        {errors.last_name && fieldTouched.last_name && (
                          <p style={styles.errorMessage}>
                            <FiX style={styles.errorIconSmall} />
                            {errors.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.nameFields}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiUser style={styles.inputIcon} />
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleChange}
                        style={styles.inputField}
                        placeholder="Del Rosario"
                      />
                      <div style={styles.validationContainer}>
                        <p style={styles.validationMessage}>
                          <FiInfo style={styles.validationIcon} />
                          Middle name is optional
                        </p>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiUser style={styles.inputIcon} />
                        Suffix (optional)
                      </label>
                      <input
                        type="text"
                        name="suffix"
                        value={formData.suffix}
                        onChange={handleChange}
                        style={styles.inputField}
                        placeholder="Jr., Sr., III"
                      />
                      <div style={styles.validationContainer}>
                        <p style={styles.validationMessage}>
                          <FiInfo style={styles.validationIcon} />
                          Suffix is optional
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.directFormSection}>
                  <h3 style={styles.panelTitle}>
                    <FiLock style={styles.infoIcon} />
                    System Information
                  </h3>

                  <div style={styles.systemFields}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiIdCard style={styles.inputIcon} />
                        Employee Number
                      </label>
                      <input
                        type="text"
                        name="employeeNumber"
                        value={formData.employeeNumber}
                        readOnly
                        style={styles.readOnlyField}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiMail style={styles.inputIcon} />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('email')}
                        style={{
                          ...styles.inputField,
                          borderColor: errors.email ? '#ef4444' : '#cbd5e1'
                        }}
                        placeholder="hannah.peralta@example.com"
                      />
                      <div style={styles.validationContainer}>
                        {errors.email && fieldTouched.email && (
                          <p style={styles.errorMessage}>
                            <FiX style={styles.errorIconSmall} />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>
                      <FiLock style={styles.inputIcon} />
                      Position *
                    </label>
                    <select
                      name="userLevel"
                      value={formData.userLevel}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('userLevel')}
                      style={{
                        ...styles.selectField,
                        borderColor: errors.userLevel ? '#ef4444' : 
                                    (fieldTouched.userLevel && validationStatus.userLevel.valid === false) ? '#ef4444' : 
                                    (fieldTouched.userLevel && validationStatus.userLevel.valid) ? '#10b981' : '#cbd5e1'
                      }}
                    >
                      <option value="">Select User Level</option>
                      <option value="admin">Administrator</option>
                      <option value="nurse">Nurse</option>
                      <option value="doctor">Doctor</option>
                      <option value="custom">Custom Role</option>
                    </select>
                    <div style={styles.validationContainer}>
                      {fieldTouched.userLevel && validationStatus.userLevel.message && (
                        <p style={{
                          ...styles.validationMessage,
                          color: validationStatus.userLevel.valid ? '#16a34a' : 
                                validationStatus.userLevel.valid === false ? '#dc2626' : 
                                '#64748b'
                        }}>
                          {validationStatus.userLevel.valid ? (
                            <FiCheckCircle style={styles.validationIcon} />
                          ) : validationStatus.userLevel.valid === false ? (
                            <FiAlertCircle style={styles.validationIcon} />
                          ) : (
                            <FiInfo style={styles.validationIcon} />
                          )}
                          {validationStatus.userLevel.message}
                        </p>
                      )}
                      {errors.userLevel && fieldTouched.userLevel && (
                        <p style={styles.errorMessage}>
                          <FiX style={styles.errorIconSmall} />
                          {errors.userLevel}
                        </p>
                      )}
                    </div>
                  </div>

                  {formData.userLevel === 'custom' && (
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiLock style={styles.inputIcon} />
                        Custom Role Name *
                      </label>
                      <input
                        type="text"
                        name="newUserLevel"
                        value={formData.newUserLevel}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('newUserLevel')}
                        style={{
                          ...styles.inputField,
                          borderColor: errors.newUserLevel ? '#ef4444' : '#cbd5e1'
                        }}
                        placeholder="Enter custom role (e.g. Pharmacist)"
                      />
                      <div style={styles.validationContainer}>
                        {errors.newUserLevel && fieldTouched.newUserLevel && (
                          <p style={styles.errorMessage}>
                            <FiX style={styles.errorIconSmall} />
                            {errors.newUserLevel}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>
                      <FiInfo style={styles.inputIcon} />
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      style={styles.inputField}
                      placeholder="e.g., Cardiology, Pediatrics"
                    />
                  </div>

                  {/* License Number Field - Now required for both doctor and nurse */}
                  {(formData.userLevel === 'doctor' || formData.userLevel === 'nurse' || formData.userLevel === 'custom') && (
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>
                        <FiLock style={styles.inputIcon} />
                        {formData.userLevel === 'doctor' ? 'Doctor License Number' : 
                         formData.userLevel === 'nurse' ? 'Nurse License Number' :
                         formData.userLevel === 'custom' ? `${formData.newUserLevel || 'Custom Role'} License/ID` :
                         `${formData.userLevel.charAt(0).toUpperCase() + formData.userLevel.slice(1)} License/ID`}
                        {(formData.userLevel === 'doctor' || formData.userLevel === 'nurse') ? ' *' : ' (Optional)'}
                      </label>
                      <input
                        type="text"
                        name="Doc_license"
                        value={formData.Doc_license}
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur('Doc_license')}
                        style={{
                          ...styles.inputField,
                          borderColor: errors.Doc_license ? '#ef4444' : 
                                      (fieldTouched.Doc_license && validationStatus.Doc_license.valid === false) ? '#ef4444' : 
                                      (fieldTouched.Doc_license && validationStatus.Doc_license.valid) ? '#10b981' : '#cbd5e1'
                        }}
                        placeholder={formData.userLevel === 'doctor' ? 
                          "Enter doctor license number" : 
                          formData.userLevel === 'nurse' ? "Enter nurse license number" :
                          `Enter ${formData.userLevel === 'custom' ? formData.newUserLevel || 'custom role' : formData.userLevel} license/ID number`}
                      />
                      <div style={styles.validationContainer}>
                        {fieldTouched.Doc_license && validationStatus.Doc_license.message && (
                          <p style={{
                            ...styles.validationMessage,
                            color: validationStatus.Doc_license.valid ? '#16a34a' : 
                                  validationStatus.Doc_license.valid === false ? '#dc2626' : 
                                  '#64748b'
                          }}>
                            {validationStatus.Doc_license.valid ? (
                              <FiCheckCircle style={styles.validationIcon} />
                            ) : validationStatus.Doc_license.valid === false ? (
                              <FiAlertCircle style={styles.validationIcon} />
                            ) : (
                              <FiInfo style={styles.validationIcon} />
                            )}
                            {validationStatus.Doc_license.message}
                          </p>
                        )}
                        {errors.Doc_license && fieldTouched.Doc_license && (
                          <p style={styles.errorMessage}>
                            <FiX style={styles.errorIconSmall} />
                            {errors.Doc_license}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {errors.registration && (
                    <div style={styles.csvErrorPanel}>
                      <FiX style={styles.csvErrorIcon} />
                      <p style={styles.csvErrorMessage}>
                        {errors.registration}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.actionButtons}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={styles.cancelButton}
                >
                  <FiX style={styles.buttonIcon} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  onClick={handleSubmit}
                  style={{
                    ...styles.submitButton,
                    backgroundColor: isLoading || !isFormValid() 
                      ? '#93c5fd' 
                      : '#395886',
                    cursor: isLoading || !isFormValid() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiLock style={styles.buttonIcon} />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // CSV Validation Mode - Two Column Layout
            <>
              <div style={styles.leftPanel}>
                <div style={styles.validationPanel}>
                  <h3 style={styles.panelTitle}>
                    <FiInfo style={styles.infoIcon} />
                    Employee Validation
                  </h3>
                  <p style={styles.panelDescription}>
                    {csvUploaded 
                      ? `${csvData.length} approved employees loaded from ${fileName}` 
                      : 'Upload CSV file with approved employees to validate registration'}
                  </p>
                  <div style={styles.uploadButtons}>
                    <label style={styles.uploadButton}>
                      <FiUpload style={styles.uploadIcon} />
                      Upload Employee List File
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload} 
                        style={styles.fileInput} 
                      />
                    </label>
                    <label style={styles.bulkUploadButton}>
                      <FiUpload style={styles.uploadIcon} />
                      Register All in the List
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleBulkUpload} 
                        style={styles.fileInput} 
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>

                {isLoading && (
                  <div style={styles.loadingPanel}>
                    <div style={styles.spinnerContainer}>
                      <div style={styles.spinner}></div>
                    </div>
                    <p style={styles.loadingText}>Processing registration...</p>
                  </div>
                )}

                {apiError && (
                  <div style={styles.errorPanel}>
                    <div style={styles.errorIconContainer}>
                      <FiX style={styles.errorIcon} />
                    </div>
                    <div>
                      <p style={styles.errorTitle}>
                        Registration Error
                      </p>
                      <p style={styles.errorMessage}>
                        {apiError}
                      </p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div style={styles.successPanel}>
                    <div style={styles.successIconContainer}>
                      <FiCheckCircle style={styles.successIcon} />
                    </div>
                    <div>
                      <p style={styles.successTitle}>
                        Registration Successful
                      </p>
                      <p style={styles.successMessage}>
                        {successMessage}
                      </p>
                    </div>
                  </div>
                )}

                {!isLoading && (
                  <>
                    <div style={styles.personalInfoPanel}>
                      <h3 style={styles.panelTitle}>
                        <FiUser style={styles.infoIcon} />
                        Personal Information
                      </h3>

                      <div style={styles.nameFields}>
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiUser style={styles.inputIcon} />
                            First Name *
                          </label>
                          <div style={styles.suggestionContainer}>
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              style={{
                                ...styles.inputField,
                                borderColor: errors.first_name ? '#ef4444' : 
                                            validationStatus.first_name.valid === false ? '#ef4444' : 
                                            validationStatus.first_name.valid ? '#10b981' : '#cbd5e1'
                              }}
                              placeholder="Hannah"
                              onFocus={() => getNameSuggestions('first_name', formData.first_name)}
                            />
                            {nameSuggestions.showSuggestions && nameSuggestions.activeField === 'first_name' && (
                              <div style={styles.suggestionDropdown}>
                                {nameSuggestions.first_name.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    style={styles.suggestionItem}
                                    onClick={() => handleSuggestionClick('first_name', suggestion)}
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={styles.validationContainer}>
                            {validationStatus.first_name.message && (
                              <p style={{
                                ...styles.validationMessage,
                                color: validationStatus.first_name.valid ? '#16a34a' : 
                                      validationStatus.first_name.valid === false ? '#dc2626' : 
                                      '#64748b'
                              }}>
                                {validationStatus.first_name.valid ? (
                                  <FiCheckCircle style={styles.validationIcon} />
                                ) : validationStatus.first_name.valid === false ? (
                                  <FiAlertCircle style={styles.validationIcon} />
                                ) : (
                                  <FiInfo style={styles.validationIcon} />
                                )}
                                {validationStatus.first_name.message}
                              </p>
                            )}
                            {errors.first_name && (
                              <p style={styles.errorMessage}>
                                <FiX style={styles.errorIconSmall} />
                                {errors.first_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiUser style={styles.inputIcon} />
                            Last Name *
                          </label>
                          <div style={styles.suggestionContainer}>
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              style={{
                                ...styles.inputField,
                                borderColor: errors.last_name ? '#ef4444' : 
                                            validationStatus.last_name.valid === false ? '#ef4444' : 
                                            validationStatus.last_name.valid ? '#10b981' : '#cbd5e1'
                              }}
                              placeholder="Peralta"
                              onFocus={() => getNameSuggestions('last_name', formData.last_name)}
                            />
                            {nameSuggestions.showSuggestions && nameSuggestions.activeField === 'last_name' && (
                              <div style={styles.suggestionDropdown}>
                                {nameSuggestions.last_name.map((suggestion, index) => (
                                  <div
                                    key={index}
                                    style={styles.suggestionItem}
                                    onClick={() => handleSuggestionClick('last_name', suggestion)}
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={styles.validationContainer}>
                            {validationStatus.last_name.message && (
                              <p style={{
                                ...styles.validationMessage,
                                color: validationStatus.last_name.valid ? '#16a34a' : 
                                      validationStatus.last_name.valid === false ? '#dc2626' : 
                                      '#64748b'
                              }}>
                                {validationStatus.last_name.valid ? (
                                  <FiCheckCircle style={styles.validationIcon} />
                                ) : validationStatus.last_name.valid === false ? (
                                  <FiAlertCircle style={styles.validationIcon} />
                                ) : (
                                  <FiInfo style={styles.validationIcon} />
                                )}
                                {validationStatus.last_name.message}
                              </p>
                            )}
                            {errors.last_name && (
                              <p style={styles.errorMessage}>
                                <FiX style={styles.errorIconSmall} />
                                {errors.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={styles.nameFields}>
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiUser style={styles.inputIcon} />
                            Middle Name
                          </label>
                          <input
                            type="text"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            style={{
                              ...styles.inputField,
                              borderColor: validationStatus.middle_name.valid === false ? '#ef4444' : 
                                          validationStatus.middle_name.valid ? '#10b981' : '#cbd5e1'
                            }}
                            placeholder="Del Rosario"
                          />
                          <div style={styles.validationContainer}>
                            {validationStatus.middle_name.message && (
                              <p style={{
                                ...styles.validationMessage,
                                color: validationStatus.middle_name.valid ? '#16a34a' : 
                                      validationStatus.middle_name.valid === false ? '#dc2626' : 
                                      '#64748b'
                              }}>
                                {validationStatus.middle_name.valid ? (
                                  <FiCheckCircle style={styles.validationIcon} />
                                ) : validationStatus.middle_name.valid === false ? (
                                  <FiAlertCircle style={styles.validationIcon} />
                                ) : (
                                  <FiInfo style={styles.validationIcon} />
                                )}
                                {validationStatus.middle_name.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiUser style={styles.inputIcon} />
                            Suffix (optional)
                          </label>
                          <input
                            type="text"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleChange}
                            style={{
                              ...styles.inputField,
                              borderColor: validationStatus.suffix.valid === false ? '#ef4444' : 
                                          validationStatus.suffix.valid ? '#10b981' : '#cbd5e1'
                            }}
                            placeholder="Jr., Sr., III"
                          />
                          <div style={styles.validationContainer}>
                            {validationStatus.suffix.message && (
                              <p style={{
                                ...styles.validationMessage,
                                color: validationStatus.suffix.valid ? '#16a34a' : 
                                      validationStatus.suffix.valid === false ? '#dc2626' : 
                                      '#64748b'
                              }}>
                                {validationStatus.suffix.valid ? (
                                  <FiCheckCircle style={styles.validationIcon} />
                                ) : validationStatus.suffix.valid === false ? (
                                  <FiAlertCircle style={styles.validationIcon} />
                                ) : (
                                  <FiInfo style={styles.validationIcon} />
                                )}
                                {validationStatus.suffix.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {csvUploaded && formData.first_name && formData.last_name && (
                        <div style={{
                          ...styles.validationStatus,
                          backgroundColor: nameValid ? '#ecfdf5' : '#fef2f2',
                          color: nameValid ? '#065f46' : '#b91c1c',
                          border: `1px solid ${nameValid ? '#a7f3d0' : '#fecaca'}`
                        }}>
                          {nameValid ? (
                            <div style={styles.validationStatusIconValid}>
                              <FiCheckCircle style={styles.validationStatusIcon} />
                            </div>
                          ) : (
                            <div style={styles.validationStatusIconInvalid}>
                              <FiX style={styles.validationStatusIcon} />
                            </div>
                          )}
                          <span>
                            {nameValid 
                              ? 'Employee information matches CSV data' 
                              : validationStatus.first_name.message.includes('already registered') 
                                ? 'Employee is already registered' 
                                : 'Employee information does not match CSV data'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={styles.systemInfoPanel}>
                      <h3 style={styles.panelTitle}>
                        <FiLock style={styles.infoIcon} />
                        System Information
                      </h3>

                      <div style={styles.systemFields}>
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiIdCard style={styles.inputIcon} />
                            Employee Number
                          </label>
                          <input
                            type="text"
                            name="employeeNumber"
                            value={formData.employeeNumber}
                            readOnly
                            style={styles.readOnlyField}
                          />
                        </div>

                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiMail style={styles.inputIcon} />
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                              ...styles.inputField,
                              backgroundColor: nameValid ? '#f1f5f9' : '#ffffff'
                            }}
                          />
                        </div>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>
                          <FiLock style={styles.inputIcon} />
                          Position *
                        </label>
                        {nameValid ? (
                          <input
                            type="text"
                            name="userLevel"
                            value={formData.userLevel}
                            readOnly
                            style={{
                              ...styles.readOnlyField,
                              backgroundColor: '#f1f5f9'
                            }}
                          />
                        ) : (
                          <select
                            name="userLevel"
                            value={formData.userLevel}
                            onChange={handleChange}
                            style={{
                              ...styles.selectField,
                              borderColor: errors.userLevel ? '#ef4444' : 
                                          validationStatus.userLevel.valid === false ? '#ef4444' : 
                                          validationStatus.userLevel.valid ? '#10b981' : '#cbd5e1'
                            }}
                          >
                            <option value="">Select User Level</option>
                            <option value="admin">Administrator</option>
                            <option value="nurse">Nurse</option>
                            <option value="doctor">Doctor</option>
                            <option value="custom">Custom Role</option>
                          </select>
                        )}
                        <div style={styles.validationContainer}>
                          {validationStatus.userLevel.message && (
                            <p style={{
                              ...styles.validationMessage,
                              color: validationStatus.userLevel.valid ? '#16a34a' : 
                                    validationStatus.userLevel.valid === false ? '#dc2626' : 
                                    '#64748b'
                            }}>
                              {validationStatus.userLevel.valid ? (
                                <FiCheckCircle style={styles.validationIcon} />
                              ) : validationStatus.userLevel.valid === false ? (
                                <FiAlertCircle style={styles.validationIcon} />
                              ) : (
                                <FiInfo style={styles.validationIcon} />
                              )}
                              {validationStatus.userLevel.message}
                            </p>
                          )}
                          {errors.userLevel && (
                            <p style={styles.errorMessage}>
                              <FiX style={styles.errorIconSmall} />
                              {errors.userLevel}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>
                          <FiInfo style={styles.inputIcon} />
                          Specialization
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          style={styles.inputField}
                          placeholder="e.g., Cardiology, Pediatrics"
                        />
                      </div>

                      {/* License Number Field - Now required for both doctor and nurse in CSV mode */}
                      {(formData.userLevel === 'doctor' || formData.userLevel === 'nurse') && (
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiLock style={styles.inputIcon} />
                            {formData.userLevel === 'doctor' ? 'Doctor License Number *' : 'Nurse License Number *'}
                          </label>
                          <input
                            type="text"
                            name="Doc_license"
                            value={formData.Doc_license}
                            onChange={handleChange}
                            style={{
                              ...styles.inputField,
                              borderColor: errors.Doc_license ? '#ef4444' : '#cbd5e1'
                            }}
                            placeholder={formData.userLevel === 'doctor' ? 
                              "Enter doctor license number" : 
                              "Enter nurse license number"}
                          />
                          <div style={styles.validationContainer}>
                            {errors.Doc_license && (
                              <p style={styles.errorMessage}>
                                <FiX style={styles.errorIconSmall} />
                                {errors.Doc_license}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {formData.userLevel === 'custom' && !nameValid && (
                        <div style={styles.inputGroup}>
                          <label style={styles.inputLabel}>
                            <FiLock style={styles.inputIcon} />
                            New User Level *
                          </label>
                          <input
                            type="text"
                            name="newUserLevel"
                            value={formData.newUserLevel}
                            onChange={handleChange}
                            style={{
                              ...styles.inputField,
                              borderColor: errors.newUserLevel ? '#ef4444' : '#cbd5e1'
                            }}
                            placeholder="Enter custom role (e.g. Pharmacist)"
                          />
                          <div style={styles.validationContainer}>
                            {errors.newUserLevel && (
                              <p style={styles.errorMessage}>
                                <FiX style={styles.errorIconSmall} />
                                {errors.newUserLevel}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {errors.csvValidation && (
                        <div style={styles.csvErrorPanel}>
                          <FiX style={styles.csvErrorIcon} />
                          <p style={styles.csvErrorMessage}>
                            {errors.csvValidation}
                          </p>
                        </div>
                      )}

                      {errors.registration && (
                        <div style={styles.csvErrorPanel}>
                          <FiX style={styles.csvErrorIcon} />
                          <p style={styles.csvErrorMessage}>
                            {errors.registration}
                          </p>
                        </div>
                      )}
                    </div>

                    <div style={styles.actionButtons}>
                      <button
                        type="button"
                        onClick={() => { setShowModal(false); resetForm(); }}
                        style={styles.cancelButton}
                      >
                        <FiX style={styles.buttonIcon} />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || (csvUploaded && nameValid === false)}
                        onClick={handleSubmit}
                        style={{
                          ...styles.submitButton,
                          backgroundColor: isLoading || (csvUploaded && nameValid === false) 
                            ? '#93c5fd' 
                            : '#395886',
                          cursor: isLoading || (csvUploaded && nameValid === false) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isLoading ? (
                          <>
                            <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiLock style={styles.buttonIcon} />
                            Complete Registration
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div style={styles.rightPanel}>
                <CSVPreviewPanel 
                  csvUploaded={csvUploaded} 
                  previewData={previewData} 
                  csvData={csvData} 
                  registeredEmployees={registeredEmployees}
                  currentEmployeeMatch={currentEmployeeMatch}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <SuccessRegisterEmplModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setShowModal(false);
          resetForm();
        }}
        onDownload={handleDownloadCredentials}
        employeeData={registeredEmployeeData}
      />

      <BulkSuccessModal
        show={showBulkSuccessModal}
        onClose={() => {
          setShowBulkSuccessModal(false);
          setShowModal(false);
          resetForm();
        }}
        onDownload={handleDownloadBulkReport}
        results={bulkResults}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default HCproviderAddModal;