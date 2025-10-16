import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaFileMedical } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f8fafc;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    color: #475569;
    background-color: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f8fafc;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background-color: #395886;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2d466c;
  }
`;

const SummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SummaryItem = styled.div`
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  position: relative;
`;

const SummaryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const SummaryItemName = styled.h3`
  font-size: 1rem;
  color: #1e293b;
  margin: 0;
  flex: 1;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  color: #ef4444;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fee2e2;
  }
`;

const SummaryItemDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  font-size: 0.9rem;
`;

const SummaryDetail = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  color: #64748b;
  font-weight: 500;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  color: #1e293b;
  font-weight: 600;
  font-size: 0.85rem;
`;

const AdditionalInstructions = styled.div`
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const InstructionsTitle = styled.h4`
  font-size: 1rem;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InstructionsContent = styled.p`
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  background-color: #f8fafc;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #395886;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.2rem;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

const EmptyDescription = styled.p`
  font-size: 0.9rem;
  margin: 0;
`;

const PrescriptionSummaryModal = ({
  isOpen,
  onClose,
  selectedMedicines,
  prescriptionDetails,
  onRemoveMedicine
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaFileMedical />
            Prescription Summary
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {selectedMedicines.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <FaFileMedical />
              </EmptyIcon>
              <EmptyTitle>No medicines added yet</EmptyTitle>
              <EmptyDescription>
                Search for medicines or use the ready prescription button to get started
              </EmptyDescription>
            </EmptyState>
          ) : (
            <>
              <SummaryList>
                {selectedMedicines.map((medicine, index) => (
                  <SummaryItem key={`${medicine.medicine_id}-${index}`}>
                    <SummaryItemHeader>
                      <SummaryItemName>
                        {index + 1}. {medicine.name}
                        {medicine.generic_name && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>
                            {medicine.generic_name}
                          </div>
                        )}
                      </SummaryItemName>
                      <RemoveButton 
                        onClick={() => onRemoveMedicine(medicine.medicine_id)}
                        aria-label={`Remove ${medicine.name}`}
                      >
                        <FaTimes size={12} />
                      </RemoveButton>
                    </SummaryItemHeader>
                    
                    <SummaryItemDetails>
                      <SummaryDetail>
                        <DetailLabel>Dosage</DetailLabel>
                        <DetailValue>{medicine.dosage || 'Not specified'}</DetailValue>
                      </SummaryDetail>
                      
                      <SummaryDetail>
                        <DetailLabel>Frequency</DetailLabel>
                        <DetailValue>{medicine.frequency || 'Not specified'}</DetailValue>
                      </SummaryDetail>
                      
                      <SummaryDetail>
                        <DetailLabel>Duration</DetailLabel>
                        <DetailValue>{medicine.duration || 'Not specified'}</DetailValue>
                      </SummaryDetail>
                      
                      {medicine.instructions && (
                        <SummaryDetail style={{ gridColumn: '1 / -1' }}>
                          <DetailLabel>Instructions</DetailLabel>
                          <DetailValue>{medicine.instructions}</DetailValue>
                        </SummaryDetail>
                      )}
                    </SummaryItemDetails>
                  </SummaryItem>
                ))}
              </SummaryList>
              
              {prescriptionDetails.additionalInstructions && (
                <AdditionalInstructions>
                  <InstructionsTitle>Additional Instructions</InstructionsTitle>
                  <InstructionsContent>
                    {prescriptionDetails.additionalInstructions}
                  </InstructionsContent>
                </AdditionalInstructions>
              )}
            </>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PrescriptionSummaryModal;