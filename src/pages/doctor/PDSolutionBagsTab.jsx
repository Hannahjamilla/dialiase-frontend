import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCalculator, FaPlus, FaTimes, FaExclamationTriangle, FaSyncAlt, FaInfoCircle, FaBox } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Container = styled.div`
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0 2rem;
`;

const Section = styled.section`
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e0e0e0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f5f5f5;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
  font-family: 'Helvetica Neue', Arial, sans-serif;
`;

const OverviewCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const OverviewItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  padding: 1rem;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #dee2e6;
`;

const OverviewLabel = styled.span`
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
`;

const OverviewValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
`;

const AutoCalculateButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.15s ease;
  margin: 0 auto;
  
  &:hover {
    background: #0056b3;
  }
`;

const CalculationInfo = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const BagAssignmentCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  color: #495057;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background-color 0.15s ease;
  
  &:hover {
    background: #218838;
  }
`;

const BagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BagItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
`;

const BagTypeDisplay = styled.div`
  padding: 0.75rem;
  background: #e9ecef;
  border-radius: 4px;
  text-align: center;
  font-weight: 600;
  color: #495057;
`;

const BagInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  width: 38px;
  transition: background-color 0.15s ease;
  
  &:hover {
    background: #c82333;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const SummaryCard = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SummaryLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #155724;
`;

const SummaryValue = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #155724;
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  background-color: ${props => {
    if (props.$status === 'error') return '#f8d7da';
    if (props.$status === 'warning') return '#fff3cd';
    return '#d1edf1';
  }};
  color: ${props => {
    if (props.$status === 'error') return '#721c24';
    if (props.$status === 'warning') return '#856404';
    return '#0c5460';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
`;

const PDSolutionBagsTab = ({ prescriptionDetails, setPrescriptionDetails }) => {
  const [pdData, setPdData] = useState({
    bagPercentages: [],
    bagCounts: [],
    ...(prescriptionDetails.pd_data || {})
  });

  const [totalBagsNeeded, setTotalBagsNeeded] = useState(0);

  // Get data from prescription details
  const fillVolume = prescriptionDetails.pd_data?.fillVolume || '';
  const dwellTime = prescriptionDetails.pd_data?.dwellTime || '';
  const solutionConcentrations = prescriptionDetails.pd_data?.solutionConcentrations || [];

  useEffect(() => {
    // Calculate total exchanges from solution concentrations (non-empty values)
    const activeExchanges = solutionConcentrations.filter(conc => conc && conc.trim() !== '').length;
    const total = activeExchanges * 28; // 4 weeks supply
    setTotalBagsNeeded(total);
    
    // Auto-populate bag percentages from solution concentrations
    const uniqueConcentrations = [...new Set(solutionConcentrations.filter(conc => conc && conc.trim() !== ''))];
    
    if (uniqueConcentrations.length > 0 && pdData.bagPercentages.length === 0) {
      const updatedData = {
        ...pdData,
        bagPercentages: uniqueConcentrations,
        bagCounts: Array(uniqueConcentrations.length).fill('')
      };
      
      setPdData(updatedData);
      updatePrescriptionDetails(updatedData);
    }
  }, [solutionConcentrations]);

  const updatePrescriptionDetails = (updatedData) => {
    setPrescriptionDetails(prev => ({
      ...prev,
      pd_data: {
        ...prev.pd_data,
        ...updatedData
      }
    }));
  };

  const handleBagCountChange = (index, value) => {
    // Allow only numbers and empty string
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    const newCounts = [...pdData.bagCounts];
    newCounts[index] = value;
    
    const updatedData = {
      ...pdData,
      bagCounts: newCounts
    };
    
    setPdData(updatedData);
    updatePrescriptionDetails(updatedData);
  };

  const addBagType = () => {
    const updatedData = {
      ...pdData,
      bagPercentages: [...pdData.bagPercentages, 'New Type'],
      bagCounts: [...pdData.bagCounts, '']
    };
    
    setPdData(updatedData);
    updatePrescriptionDetails(updatedData);
  };

  const removeBagType = (index) => {
    if (pdData.bagPercentages.length <= 1) {
      toast.error('At least one bag type is required');
      return;
    }
    
    const updatedData = {
      ...pdData,
      bagPercentages: pdData.bagPercentages.filter((_, i) => i !== index),
      bagCounts: pdData.bagCounts.filter((_, i) => i !== index)
    };
    
    setPdData(updatedData);
    updatePrescriptionDetails(updatedData);
    toast.info('Bag type removed');
  };

  const calculateTotalAssignedBags = () => {
    return pdData.bagCounts.reduce((total, count) => {
      return total + (parseInt(count) || 0);
    }, 0);
  };

  const autoCalculateBags = () => {
    const activeExchanges = solutionConcentrations.filter(conc => conc && conc.trim() !== '').length;
    
    if (activeExchanges <= 0) {
      toast.error('Please configure solution concentrations first');
      return;
    }
    
    const uniqueConcentrations = [...new Set(solutionConcentrations.filter(conc => conc && conc.trim() !== ''))];
    const concentrationCounts = {};
    
    solutionConcentrations.forEach(conc => {
      if (conc && conc.trim() !== '') {
        concentrationCounts[conc] = (concentrationCounts[conc] || 0) + 1;
      }
    });
    
    const defaultCounts = uniqueConcentrations.map(conc => {
      const proportion = concentrationCounts[conc] / activeExchanges;
      return Math.ceil(totalBagsNeeded * proportion);
    });
    
    const updatedData = {
      ...pdData,
      bagPercentages: uniqueConcentrations,
      bagCounts: defaultCounts
    };
    
    setPdData(updatedData);
    updatePrescriptionDetails(updatedData);
    toast.success('Bag distribution calculated automatically');
  };

  const totalAssignedBags = calculateTotalAssignedBags();
  const bagsDifference = totalBagsNeeded - totalAssignedBags;
  const activeExchanges = solutionConcentrations.filter(conc => conc && conc.trim() !== '').length;

  const getStatusMessage = () => {
    if (bagsDifference > 0) {
      return { 
        message: `${bagsDifference} more bags needed to complete monthly supply`, 
        status: 'error',
        icon: FaExclamationTriangle
      };
    }
    if (bagsDifference < 0) {
      return { 
        message: `${Math.abs(bagsDifference)} extra bags allocated`, 
        status: 'warning',
        icon: FaExclamationTriangle
      };
    }
    return { 
      message: 'Monthly supply perfectly allocated', 
      status: 'success',
      icon: FaInfoCircle
    };
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  return (
    <Container>
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <FaBox color="#007bff" size={28} />
            <SectionTitle>Monthly Supply Calculation</SectionTitle>
          </HeaderLeft>
        </SectionHeader>
        
        <OverviewCard>
          <OverviewGrid>
            <OverviewItem>
              <OverviewLabel>Fill Volume</OverviewLabel>
              <OverviewValue>{fillVolume || 'Not set'} L</OverviewValue>
            </OverviewItem>
            
            <OverviewItem>
              <OverviewLabel>Dwell Time</OverviewLabel>
              <OverviewValue>{dwellTime || 'Not set'}</OverviewValue>
            </OverviewItem>
            
            <OverviewItem>
              <OverviewLabel>Daily Exchanges</OverviewLabel>
              <OverviewValue>{activeExchanges}</OverviewValue>
            </OverviewItem>
            
            <OverviewItem>
              <OverviewLabel>Monthly Bags Needed</OverviewLabel>
              <OverviewValue>{totalBagsNeeded} bags</OverviewValue>
            </OverviewItem>
          </OverviewGrid>
          
          <AutoCalculateButton onClick={autoCalculateBags}>
            <FaSyncAlt size={14} />
            Calculate Distribution
          </AutoCalculateButton>
          
          <CalculationInfo>
            <FaInfoCircle size={12} />
            Based on {activeExchanges} exchanges/day × 28 days (4 weeks)
          </CalculationInfo>
        </OverviewCard>
        
        <BagAssignmentCard>
          <CardHeader>
            <CardTitle>
              <FaCalculator size={18} />
              Bag Distribution by Solution Type
            </CardTitle>
            <AddButton onClick={addBagType}>
              <FaPlus size={12} />
              Add Solution Type
            </AddButton>
          </CardHeader>
          
          <BagList>
            {pdData.bagPercentages.length > 0 ? (
              pdData.bagPercentages.map((percentage, index) => (
                <BagItem key={index}>
                  <BagTypeDisplay>{percentage}</BagTypeDisplay>
                  <BagInput
                    type="text"
                    value={pdData.bagCounts[index] || ''}
                    onChange={(e) => handleBagCountChange(index, e.target.value)}
                    placeholder="Number of bags"
                    inputMode="numeric"
                  />
                  <RemoveButton onClick={() => removeBagType(index)} title="Remove this solution type">
                    <FaTimes size={12} />
                  </RemoveButton>
                </BagItem>
              ))
            ) : (
              <EmptyState>
                <FaInfoCircle size={24} />
                <p>No solution types configured. Add solution types or use auto-calculation.</p>
              </EmptyState>
            )}
          </BagList>
        </BagAssignmentCard>
        
        <SummaryCard>
          <SummaryRow>
            <SummaryLabel>Total Bags Allocated:</SummaryLabel>
            <SummaryValue>{totalAssignedBags} / {totalBagsNeeded}</SummaryValue>
          </SummaryRow>
          
          <StatusMessage $status={status.status}>
            <StatusIcon size={14} />
            {status.message}
          </StatusMessage>
        </SummaryCard>
      </Section>
    </Container>
  );
};

export default PDSolutionBagsTab;