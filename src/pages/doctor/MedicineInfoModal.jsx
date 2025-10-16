import React from 'react';
import styled from 'styled-components';
import { FaPills, FaTimes } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #334155;
    transform: scale(1.1);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const MedicineIcon = styled.div`
  background-color: #E1E9F2;
  color: #395886;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const MedicineTitle = styled.div`
  flex: 1;
`;

const Name = styled.h2`
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
`;

const GenericName = styled.p`
  margin: 0.25rem 0 0 0;
  color: #64748b;
  font-style: italic;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
`;

const InfoItem = styled.div`
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #334155;
  font-weight: 500;
`;

const DescriptionSection = styled.div`
  margin-top: 2rem;
`;

const DescriptionTitle = styled.h3`
  color: #2d3748;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const DescriptionContent = styled.div`
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  line-height: 1.6;
  color: #475569;
`;

const MedicineInfoModal = ({ medicine, onClose }) => {
  if (!medicine) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        
        <ModalHeader>
          <MedicineIcon>
            <FaPills />
          </MedicineIcon>
          <MedicineTitle>
            <Name>{medicine.name}</Name>
            <GenericName>{medicine.generic_name}</GenericName>
          </MedicineTitle>
        </ModalHeader>
        
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Category</InfoLabel>
            <InfoValue>{medicine.category || 'Not specified'}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Manufacturer</InfoLabel>
            <InfoValue>{medicine.manufacturer || 'Not specified'}</InfoValue>
          </InfoItem>
        </InfoGrid>
        
        {medicine.description && (
          <DescriptionSection>
            <DescriptionTitle>Description</DescriptionTitle>
            <DescriptionContent>
              {medicine.description}
            </DescriptionContent>
          </DescriptionSection>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default MedicineInfoModal;