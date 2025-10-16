import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUserInjured, FaHospital, FaIdCard, FaHistory } from 'react-icons/fa';
import { GiMedicalPack } from "react-icons/gi";
import PatientTreatmentModal from './PatientTreatmentModal';

const Container = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0 2rem;
`;

const Section = styled.section`
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  border: 1px solid #e8ecef;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f3f5;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
`;

const PatientID = styled.span`
  background: #f7fafc;
  color: #4a5568;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
`;

const PatientInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: #fafbfc;
  border: 1px solid #e8ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d0d7de;
    background: #f8f9fa;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f3f5;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #edf2ff;
  border-radius: 8px;
  color: #3b82f6;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  color: #2d3748;
  margin: 0;
  font-weight: 600;
`;

const InfoContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: #2d3748;
  font-weight: 600;
  
  &:not([data-available="true"]) {
    color: #a0aec0;
    font-style: italic;
    font-weight: 500;
  }
`;

const ActionSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e8ecef;
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ActionTitle = styled.h4`
  font-size: 1.1rem;
  color: #2d3748;
  margin: 0;
  font-weight: 600;
`;

const ActionDescription = styled.p`
  color: #718096;
  font-size: 0.95rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const TreatmentsButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PatientInfoTab = ({ prescriptionDetails }) => {
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);

  const handleShowTreatmentModal = () => {
    setShowTreatmentModal(true);
  };

  const isDataAvailable = (value) => value && value !== 'Not available';

  return (
    <Container>
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <FaUserInjured color="#3b82f6" size={28} />
            <SectionTitle>Patient Information</SectionTitle>
          </HeaderLeft>
          <PatientID>ID: {prescriptionDetails.patientID || 'N/A'}</PatientID>
        </SectionHeader>
        
        <PatientInfoGrid>
          <InfoCard>
            <CardHeader>
              <CardIcon>
                <FaUserInjured size={20} />
              </CardIcon>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <InfoContent>
              <InfoRow>
                <InfoLabel>
                  <FaUserInjured size={14} />
                  Full Name
                </InfoLabel>
                <InfoValue data-available={isDataAvailable(prescriptionDetails.patientName)}>
                  {prescriptionDetails.patientName || 'Not available'}
                </InfoValue>
              </InfoRow>
            </InfoContent>
          </InfoCard>

          <InfoCard>
            <CardHeader>
              <CardIcon>
                <FaHospital size={20} />
              </CardIcon>
              <CardTitle>Hospital Information</CardTitle>
            </CardHeader>
            <InfoContent>
              <InfoRow>
                <InfoLabel>
                  <FaHospital size={14} />
                  Hospital Number
                </InfoLabel>
                <InfoValue data-available={isDataAvailable(prescriptionDetails.hospitalNumber)}>
                  {prescriptionDetails.hospitalNumber || 'Not available'}
                </InfoValue>
              </InfoRow>
            </InfoContent>
          </InfoCard>
        </PatientInfoGrid>

        <ActionSection>
          <ActionHeader>
            <GiMedicalPack color="#3b82f6" size={24} />
            <ActionTitle>Medical History</ActionTitle>
          </ActionHeader>
          <ActionDescription>
            Access comprehensive treatment history for this patient.
          </ActionDescription>
          <TreatmentsButton 
            onClick={handleShowTreatmentModal}
            disabled={!prescriptionDetails.patientID}
          >
            <FaHistory size={16} />
            View Treatment History
          </TreatmentsButton>
        </ActionSection>
      </Section>

      <PatientTreatmentModal
        isOpen={showTreatmentModal}
        onClose={() => setShowTreatmentModal(false)}
        patientId={prescriptionDetails.patientID}
        patientName={prescriptionDetails.patientName}
        hospitalNumber={prescriptionDetails.hospitalNumber}
      />
    </Container>
  );
};

export default PatientInfoTab;