import React from 'react';
import styled from 'styled-components';
import { FaClipboardList, FaTimes, FaUserInjured, FaInfoCircle, FaCalculator } from 'react-icons/fa';

const Container = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0 1.5rem;
`;

const Section = styled.section`
  background-color: var(--color-white);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--color-gray-800);
  margin: 0;
  font-weight: 600;
`;

const MedicineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const MedicineItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background-color: var(--color-gray-50);
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const MedicineInfo = styled.div`
  flex: 1;
`;

const MedicineName = styled.div`
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const MedicineDetails = styled.div`
  font-size: 1rem;
  color: var(--color-gray-600);
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
`;

const RemoveButton = styled.button`
  background-color: var(--color-error);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  width: 38px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #dc2626;
    transform: translateY(-1px);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.8rem;
  margin-bottom: 1.5rem;
`;

const InfoCard = styled.div`
  padding: 1.5rem;
  background-color: var(--color-gray-50);
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
`;

const InfoCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 1.1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--color-gray-200);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: var(--color-gray-600);
  font-size: 1rem;
`;

const InfoValue = styled.span`
  color: var(--color-gray-800);
  font-weight: 500;
  font-size: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--color-gray-400);
  
  svg {
    font-size: 3.5rem;
    margin-bottom: 1.2rem;
  }
  
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;

const SummaryTab = ({ selectedMedicines, prescriptionDetails, onRemoveMedicine }) => {
  // Safely access pd_data with fallback
  const pdData = prescriptionDetails.pd_data || {
    system: '',
    modality: '',
    totalExchanges: '',
    fillVolume: '',
    dwellTime: '',
    bagPercentages: [],
    bagCounts: []
  };

  return (
    <Container>
      <Section>
        <SectionHeader>
          <FaClipboardList color="var(--color-primary)" size={28} />
          <SectionTitle>Prescription Summary</SectionTitle>
        </SectionHeader>
        
        {selectedMedicines.length > 0 ? (
          <MedicineList>
            {selectedMedicines.map((medicine) => (
              <MedicineItem key={medicine.medicine_id || medicine.id}>
                <MedicineInfo>
                  <MedicineName>{medicine.name}</MedicineName>
                  <MedicineDetails>
                    <span>Dosage: {medicine.dosage || 'Not specified'}</span>
                    <span>Frequency: {medicine.frequency || 'Not specified'}</span>
                    <span>Duration: {medicine.duration || 'Not specified'}</span>
                    {medicine.instructions && (
                      <span>Instructions: {medicine.instructions}</span>
                    )}
                  </MedicineDetails>
                </MedicineInfo>
                <RemoveButton onClick={() => onRemoveMedicine(medicine.medicine_id || medicine.id)}>
                  <FaTimes size={14} />
                </RemoveButton>
              </MedicineItem>
            ))}
          </MedicineList>
        ) : (
          <EmptyState>
            <FaClipboardList />
            <p>No medicines added to prescription yet</p>
          </EmptyState>
        )}
      </Section>
      
      <InfoGrid>
        <InfoCard>
          <InfoCardHeader>
            <FaUserInjured color="var(--color-primary)" size={20} />
            Patient Information
          </InfoCardHeader>
          <div>
            <InfoItem>
              <InfoLabel>Name:</InfoLabel>
              <InfoValue>{prescriptionDetails.patientName || 'Not available'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Hospital Number:</InfoLabel>
              <InfoValue>{prescriptionDetails.hospitalNumber || 'Not available'}</InfoValue>
            </InfoItem>

          </div>
        </InfoCard>
        
        <InfoCard>
          <InfoCardHeader>
            <FaInfoCircle color="var(--color-primary)" size={20} />
            PD Solution Information
          </InfoCardHeader>
          <div>
            <InfoItem>
              <InfoLabel>System:</InfoLabel>
              <InfoValue>{pdData.system || 'Not specified'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Modality:</InfoLabel>
              <InfoValue>{pdData.modality || 'Not specified'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Exchanges per day:</InfoLabel>
              <InfoValue>{pdData.totalExchanges || 'Not specified'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Fill Volume:</InfoLabel>
              <InfoValue>{pdData.fillVolume ? `${pdData.fillVolume}L` : 'Not specified'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Dwell Time:</InfoLabel>
              <InfoValue>{pdData.dwellTime ? `${pdData.dwellTime} hours` : 'Not specified'}</InfoValue>
            </InfoItem>
          </div>
        </InfoCard>
        
        <InfoCard>
          <InfoCardHeader>
            <FaCalculator color="var(--color-primary)" size={20} />
            PD Solution Bags
          </InfoCardHeader>
          <div>
            {pdData.bagPercentages && pdData.bagPercentages.length > 0 ? (
              pdData.bagPercentages.map((percentage, index) => (
                <InfoItem key={index}>
                  <InfoLabel>{percentage}:</InfoLabel>
                  <InfoValue>{pdData.bagCounts && pdData.bagCounts[index] || 0} bags</InfoValue>
                </InfoItem>
              ))
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-gray-400)' }}>
                No bag types configured
              </div>
            )}
            {pdData.totalExchanges && (
              <InfoItem>
                <InfoLabel>Total needed (28 days):</InfoLabel>
                <InfoValue>{parseInt(pdData.totalExchanges) * 28} bags</InfoValue>
              </InfoItem>
            )}
          </div>
        </InfoCard>
      </InfoGrid>
    </Container>
  );
};

export default SummaryTab;