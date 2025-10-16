import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaTimes, 
  FaFlask, 
  FaIndustry, 
  FaPills,
  FaInfoCircle,
  FaExclamationCircle,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease;
  border: 1px solid #e5e7eb;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  background-color: #ffffff;
  border-radius: 16px 16px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.75rem;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: #f9fafb;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.75rem;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    color: #4b5563;
    background-color: #f3f4f6;
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  grid-column: ${props => props.fullWidth ? '1 / -1' : 'auto'};
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  color: #374151;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    background-color: white;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 140px;
  resize: vertical;
  transition: all 0.3s ease;
  background-color: #ffffff;
  line-height: 1.6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    background-color: white;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.25rem;
  padding: 1.75rem 2rem;
  border-top: 1px solid #f3f4f6;
  background-color: #ffffff;
  border-radius: 0 0 16px 16px;
  position: sticky;
  bottom: 0;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CancelButton = styled(Button)`
  background-color: #ffffff;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #f9fafb;
    color: #4b5563;
    border-color: #d1d5db;
  }
`;

const SaveButton = styled(Button)`
  background-color: #6366f1;
  color: white;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: #4f46e5;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
    transform: none;
  }
`;

const InstructionBox = styled.div`
  grid-column: 1 / -1;
  background-color: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const InstructionTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const InstructionText = styled.p`
  margin: 0;
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.7;
`;

const RequiredIndicator = styled.span`
  color: #ef4444;
  margin-left: 0.25rem;
`;

const IconWrapper = styled.span`
  color: ${props => props.color || '#6366f1'};
  font-size: 1.1rem;
`;

const ValidationMessage = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${props => 
    props.type === 'success' ? '#ecfdf5' : 
    props.type === 'error' ? '#fef2f2' : 
    '#eff6ff'};
  color: ${props => 
    props.type === 'success' ? '#065f46' : 
    props.type === 'error' ? '#b91c1c' : 
    '#1e40af'};
  border-left: 4px solid ${props => 
    props.type === 'success' ? '#10b981' : 
    props.type === 'error' ? '#ef4444' : 
    '#3b82f6'};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const AddNewMedsModal = ({ isOpen, onClose, onSave }) => {
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    generic_name: '',
    description: '',
    category: '',
    manufacturer: ''
  });
  
  const [validationState, setValidationState] = useState({
    name: { isValid: null, message: '', loading: false },
    generic_name: { isValid: null, message: '', loading: false }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Validate medicine name using OpenFDA API
  const validateMedicineName = async (field, value) => {
    if (!value) {
      setValidationState(prev => ({
        ...prev,
        [field]: { isValid: null, message: '', loading: false }
      }));
      return;
    }

    setValidationState(prev => ({
      ...prev,
      [field]: { ...prev[field], loading: true }
    }));

    try {
      // Using OpenFDA API for drug validation
      const response = await axios.get(
        `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${value}"+OR+openfda.generic_name:"${value}"&limit=1`
      );
      
      if (response.data.results && response.data.results.length > 0) {
        setValidationState(prev => ({
          ...prev,
          [field]: { 
            isValid: true, 
            message: 'Valid medicine name found in FDA database',
            loading: false
          }
        }));
      } else {
        // Fallback to RxNorm API if FDA doesn't find it
        const rxNormResponse = await axios.get(
          `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${value}&search=1`
        );
        
        if (rxNormResponse.data.idGroup && rxNormResponse.data.idGroup.rxnormId) {
          setValidationState(prev => ({
            ...prev,
            [field]: { 
              isValid: true, 
              message: 'Valid medicine name found in RxNorm database',
              loading: false
            }
          }));
        } else {
          setValidationState(prev => ({
            ...prev,
            [field]: { 
              isValid: false, 
              message: 'No matching medicine found in databases. Please verify the name.',
              loading: false
            }
          }));
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState(prev => ({
        ...prev,
        [field]: { 
          isValid: false, 
          message: 'Validation service unavailable. Please verify the medicine name manually.',
          loading: false
        }
      }));
    }
  };

  // Debounced validation function
  const debouncedValidate = debounce(validateMedicineName, 500);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMedicine(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate medicine names in real-time
    if (name === 'name' || name === 'generic_name') {
      debouncedValidate(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Final validation before submission
    try {
      await Promise.all([
        validateMedicineName('name', newMedicine.name),
        validateMedicineName('generic_name', newMedicine.generic_name)
      ]);
      
      // Check if both names are valid
      if (validationState.name.isValid && validationState.generic_name.isValid) {
        onSave(newMedicine);
        setNewMedicine({
          name: '',
          generic_name: '',
          description: '',
          category: '',
          manufacturer: ''
        });
        setValidationState({
          name: { isValid: null, message: '', loading: false },
          generic_name: { isValid: null, message: '', loading: false }
        });
      } else {
        alert('Please ensure both brand and generic names are valid medicines before submitting.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred during validation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <IconWrapper>
              <FaPills />
            </IconWrapper>
            Add New Medicine
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <InstructionBox>
            <InstructionTitle>
              <IconWrapper color="#3b82f6">
                <FaExclamationCircle />
              </IconWrapper>
              Important Instructions
            </InstructionTitle>
            <InstructionText>
              Please fill out all required fields marked with <RequiredIndicator>*</RequiredIndicator>. 
              Provide accurate information to ensure proper medication management. 
              Brand name refers to the commercial name, while generic name is the pharmaceutical name. 
              The description should include key details about usage, dosage, and potential side effects.
              <br /><br />
              <strong>Note:</strong> All medicine names will be validated against FDA and RxNorm databases 
              to ensure only legitimate medications are added.
            </InstructionText>
          </InstructionBox>
          
          <form onSubmit={handleSubmit} style={{ gridColumn: '1 / -1', display: 'contents' }}>
            <InputGroup>
              <InputLabel>
                <IconWrapper>
                  <FaPills />
                </IconWrapper>
                Brand Name <RequiredIndicator>*</RequiredIndicator>
              </InputLabel>
              <InputField
                type="text"
                name="name"
                value={newMedicine.name}
                onChange={handleInputChange}
                placeholder="e.g., Panadol, Advil, Lipitor"
                required
              />
              {validationState.name.loading && (
                <ValidationMessage type="info">
                  <LoadingSpinner /> Validating medicine name...
                </ValidationMessage>
              )}
              {!validationState.name.loading && validationState.name.isValid !== null && (
                <ValidationMessage type={validationState.name.isValid ? 'success' : 'error'}>
                  {validationState.name.isValid ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  {validationState.name.message}
                </ValidationMessage>
              )}
            </InputGroup>
            
            <InputGroup>
              <InputLabel>
                <IconWrapper>
                  <FaFlask />
                </IconWrapper>
                Generic Name <RequiredIndicator>*</RequiredIndicator>
              </InputLabel>
              <InputField
                type="text"
                name="generic_name"
                value={newMedicine.generic_name}
                onChange={handleInputChange}
                placeholder="e.g., Paracetamol, Ibuprofen, Atorvastatin"
                required
              />
              {validationState.generic_name.loading && (
                <ValidationMessage type="info">
                  <LoadingSpinner /> Validating generic name...
                </ValidationMessage>
              )}
              {!validationState.generic_name.loading && validationState.generic_name.isValid !== null && (
                <ValidationMessage type={validationState.generic_name.isValid ? 'success' : 'error'}>
                  {validationState.generic_name.isValid ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  {validationState.generic_name.message}
                </ValidationMessage>
              )}
            </InputGroup>
            
            <InputGroup fullWidth>
              <InputLabel>
                <IconWrapper>
                  <FaInfoCircle />
                </IconWrapper>
                Description
              </InputLabel>
              <TextArea
                name="description"
                value={newMedicine.description}
                onChange={handleInputChange}
                placeholder="Enter detailed description including usage instructions, effects, contraindications, and any important notes"
              />
            </InputGroup>
            
            <InputGroup>
              <InputLabel>
                <IconWrapper>
                  <FaInfoCircle />
                </IconWrapper>
                Category <RequiredIndicator>*</RequiredIndicator>
              </InputLabel>
              <InputField
                type="text"
                name="category"
                value={newMedicine.category}
                onChange={handleInputChange}
                placeholder="e.g., Analgesic, Antibiotic, Antihypertensive"
                required
              />
            </InputGroup>
            
            <InputGroup>
              <InputLabel>
                <IconWrapper>
                  <FaIndustry />
                </IconWrapper>
                Manufacturer <RequiredIndicator>*</RequiredIndicator>
              </InputLabel>
              <InputField
                type="text"
                name="manufacturer"
                value={newMedicine.manufacturer}
                onChange={handleInputChange}
                placeholder="e.g., Pfizer, GlaxoSmithKline, Novartis"
                required
              />
            </InputGroup>
          </form>
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
          <SaveButton 
            onClick={handleSubmit}
            disabled={
              !newMedicine.name || 
              !newMedicine.generic_name || 
              !newMedicine.category || 
              !newMedicine.manufacturer ||
              validationState.name.isValid === false ||
              validationState.generic_name.isValid === false ||
              isSubmitting
            }
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner /> Saving...
              </>
            ) : 'Save Medicine'}
          </SaveButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddNewMedsModal;