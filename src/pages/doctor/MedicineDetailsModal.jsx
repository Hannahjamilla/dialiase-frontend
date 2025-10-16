import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaPills, FaClock, FaCalendarAlt, FaSyringe, FaNotesMedical } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid #e1e5e9;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2.5rem;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(90deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.75rem;
  color: #1e40af;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: #f1f5f9;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e2e8f0;
    color: #475569;
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 2.5rem;
`;

const MedicineInfo = styled.div`
  background: linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.75rem;
  border-radius: 12px;
  margin-bottom: 2.5rem;
  border-left: 4px solid #0ea5e9;
  box-shadow: 0 4px 6px rgba(14, 165, 233, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MedicineNameSection = styled.div`
  flex: 1;
`;

const MedicineName = styled.h3`
  font-size: 1.5rem;
  color: #0c4a6e;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
`;

const MedicineGeneric = styled.p`
  color: #475569;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.75rem;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: #f8fafc;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    background-color: #ffffff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  background-color: #f8fafc;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.25rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    background-color: #ffffff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s;
  background-color: #f8fafc;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    background-color: #ffffff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const Button = styled.button`
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${({ $primary }) => $primary ? `
    background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
    color: white;
    box-shadow: 0 4px 6px rgba(79, 70, 229, 0.25);

    &:hover {
      background: linear-gradient(90deg, #4338ca 0%, #4f46e5 100%);
      box-shadow: 0 6px 8px rgba(79, 70, 229, 0.3);
      transform: translateY(-2px);
    }
  ` : `
    background-color: #f1f5f9;
    color: #475569;
    border: 1px solid #cbd5e1;

    &:hover {
      background-color: #e2e8f0;
      transform: translateY(-2px);
    }
  `}
`;

const CustomOption = styled.option`
  padding: 0.75rem;
`;

const dosageOptions = [
  '1 tablet', '2 tablets', '1/2 tablet', '1 capsule', 
  '5mg', '10mg', '20mg', '50mg', '100mg', '250mg', '500mg',
  '1 teaspoon', '2 teaspoons', '5ml', '10ml', '15ml',
  '8.00MG TAB', '4CMG TABLET', '0.25 MG', '100MG', '650MG',
  '500 MG', '325 MG', '5MG', '10,000 UNITS', '3.36.5ML SYRUP',
  '75 MG', '20 MG', '30MG MR', '6.25 MG'
];

const frequencyOptions = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
  'Before meals', 'After meals', 'At bedtime', 'As needed',
  'THREE TIMES A DAY WITH MEALS', 'ONCE A DAY', 'EVERY 8 HOURS FOR PAIN',
  '3 TIMES A DAY', '3 TIMES PER DAY', '2 TIMES A DAY', '3 TIMES A WEEK',
  'AS NEEDED', 'ONCE A DAY AT BEDTIME', 'ONCE DAILY'
];

const durationOptions = [
  '1 day', '3 days', '5 days', '7 days', '10 days', '14 days',
  '21 days', '1 month', '2 months', '3 months', 'Until finished'
];

const MedicineDetailsModal = ({ isOpen, onClose, medicine, onAdd }) => {
  const [medicineDetails, setMedicineDetails] = useState({
    medicine_id: medicine?.id || '',
    name: medicine?.name || '',
    generic_name: medicine?.generic_name || '',
    dosage: medicine?.common_dosage || '',
    frequency: medicine?.common_frequency || '',
    duration: medicine?.common_duration || '1 month',
    instructions: medicine?.common_instructions || ''
  });

  const handleChange = (field, value) => {
    setMedicineDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdd = () => {
    if (!medicineDetails.dosage || !medicineDetails.frequency || !medicineDetails.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    onAdd(medicineDetails);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaPills />
            Add Medicine to Prescription
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <MedicineInfo>
            <MedicineNameSection>
              <MedicineName>{medicine.name}</MedicineName>
              {medicine.generic_name && (
                <MedicineGeneric>Generic: {medicine.generic_name}</MedicineGeneric>
              )}
            </MedicineNameSection>
          </MedicineInfo>

          <FormGrid>
            <FormGroup>
              <Label>
                <FaSyringe />
                Dosage
              </Label>
              <Select
                value={medicineDetails.dosage}
                onChange={(e) => handleChange('dosage', e.target.value)}
                required
              >
                <option value="">Select dosage</option>
                {dosageOptions.map(option => (
                  <CustomOption key={option} value={option}>{option}</CustomOption>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <FaClock />
                Frequency
              </Label>
              <Select
                value={medicineDetails.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                required
              >
                <option value="">Select frequency</option>
                {frequencyOptions.map(option => (
                  <CustomOption key={option} value={option}>{option}</CustomOption>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                <FaCalendarAlt />
                Duration
              </Label>
              <Select
                value={medicineDetails.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                required
              >
                <option value="">Select duration</option>
                {durationOptions.map(option => (
                  <CustomOption key={option} value={option}>{option}</CustomOption>
                ))}
              </Select>
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>
              <FaNotesMedical />
              Additional Instructions
            </Label>
            <TextArea
              value={medicineDetails.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Enter any special instructions for this medicine..."
            />
          </FormGroup>

          <ButtonGroup>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button $primary onClick={handleAdd}>
              Add to Prescription
            </Button>
          </ButtonGroup>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default MedicineDetailsModal;