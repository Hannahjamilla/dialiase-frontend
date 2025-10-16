import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaInfoCircle, FaQuestionCircle, FaPlus, FaMinus, FaSyncAlt, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
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

const ResetButton = styled.button`
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
    border-color: #adb5bd;
  }
`;

const ConfigurationSection = styled.div`
  margin-bottom: 2.5rem;
`;

const SectionLabel = styled.h3`
  font-size: 1.1rem;
  color: #495057;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #495057;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.15s ease;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.15s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const HelpIcon = styled(FaQuestionCircle)`
  color: #6c757d;
  cursor: help;
  font-size: 0.9rem;
  
  &:hover {
    color: #495057;
  }
`;

const DropdownSection = styled.div`
  margin-bottom: 2rem;
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  margin-bottom: ${props => props.$isOpen ? '1rem' : '0'};
`;

const DropdownTitle = styled.h4`
  font-size: 1rem;
  color: #495057;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DropdownContent = styled.div`
  padding: 1.5rem;
  background: #fdfdfd;
  border: 1px solid #e9ecef;
  border-top: none;
  border-radius: 0 0 4px 4px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.span`
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 0.95rem;
  color: #495057;
  font-weight: 600;
`;

const ExchangesSection = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 2rem;
  border: 1px solid #e9ecef;
`;

const ExchangesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ExchangesTitle = styled.h3`
  font-size: 1.1rem;
  color: #495057;
  margin: 0;
  font-weight: 600;
`;

const ExchangesCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #495057;
`;

const CounterLabel = styled.span`
  font-weight: 500;
`;

const CounterValue = styled.span`
  font-weight: 600;
  color: #2c3e50;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${props => props.$variant === 'danger' ? '#dc3545' : '#007bff'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.15s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'danger' ? '#c82333' : '#0056b3'};
  }
  
  &:disabled {
    background: #adb5bd;
    cursor: not-allowed;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #dee2e6;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
`;

const TableHeader = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #dee2e6;
  position: relative;
  font-size: 0.9rem;
  min-width: 120px;
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #f8f9fa;
  background: #ffffff;
`;

const SolutionSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.95rem;
  text-align: center;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const RemoveColumnButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  font-size: 10px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f1b0b7;
  }
`;

const InfoBox = styled.div`
  background: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1.5rem;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #004085;
  line-height: 1.5;
`;

const ConcentrationInfo = styled.div`
  background: ${props => {
    switch(props.$type) {
      case 'warning': return '#fff3cd';
      case 'error': return '#f8d7da';
      case 'info': return '#d1ecf1';
      default: return '#f8f9fa';
    }
  }};
  border: 1px solid ${props => {
    switch(props.$type) {
      case 'warning': return '#ffeaa7';
      case 'error': return '#f5c6cb';
      case 'info': return '#bee5eb';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch(props.$type) {
      case 'warning': return '#856404';
      case 'error': return '#721c24';
      case 'info': return '#0c5460';
      default: return '#495057';
    }
  }};
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const SolutionOptions = [
  { value: '', label: 'Select Concentration', description: '' },
  { value: '1.5%', label: '1.5% Dextrose (Low)', description: 'Low glucose absorption - maintenance therapy' },
  { value: '2.5%', label: '2.5% Dextrose (Medium)', description: 'Moderate-high UF - common standard concentration' },
  { value: '3.5%', label: '3.5% Dextrose (High)', description: 'High UF - for significant fluid removal' },
  { value: '4.25%', label: '4.25% Dextrose (Very High)', description: 'Maximum UF - for fluid overloaded patients' }
];

const PDSolutionInfoTab = ({ prescriptionDetails, setPrescriptionDetails }) => {
  const [pdData, setPdData] = useState({
    system: 'Baxter',
    modality: 'CAPD',
    fillVolume: '2',
    dwellTime: '4 hours',
    solutionConcentrations: ['', '', ''],
    visibleColumns: 3,
    totalExchanges: 3,
    ...(prescriptionDetails.pd_data || {})
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customConcentrations, setCustomConcentrations] = useState({});

  useEffect(() => {
    if (prescriptionDetails.pd_data) {
      setPdData(prev => ({
        ...prev,
        ...prescriptionDetails.pd_data
      }));
    }
  }, [prescriptionDetails.pd_data]);

  const handlePdDataChange = (field, value) => {
    const updatedData = {
      ...pdData,
      [field]: value
    };
    
    setPdData(updatedData);
    setPrescriptionDetails(prev => ({
      ...prev,
      pd_data: updatedData
    }));
  };

  const handleSolutionConcentrationChange = (index, value) => {
    const newConcentrations = [...pdData.solutionConcentrations];
    newConcentrations[index] = value;
    
    const updatedData = {
      ...pdData,
      solutionConcentrations: newConcentrations,
      totalExchanges: newConcentrations.filter(conc => conc.trim() !== '').length
    };
    
    setPdData(updatedData);
    setPrescriptionDetails(prev => ({
      ...prev,
      pd_data: updatedData
    }));

    // If custom concentration is cleared, remove from custom concentrations object
    if (value !== 'custom') {
      const newCustomConcentrations = { ...customConcentrations };
      delete newCustomConcentrations[index];
      setCustomConcentrations(newCustomConcentrations);
    }
  };

  const handleCustomConcentrationChange = (index, value) => {
    const newCustomConcentrations = {
      ...customConcentrations,
      [index]: value
    };
    setCustomConcentrations(newCustomConcentrations);
    
    // Update the solution concentration with custom value
    const newConcentrations = [...pdData.solutionConcentrations];
    newConcentrations[index] = 'custom';
    
    const updatedData = {
      ...pdData,
      solutionConcentrations: newConcentrations
    };
    
    setPdData(updatedData);
    setPrescriptionDetails(prev => ({
      ...prev,
      pd_data: updatedData
    }));
  };

  const getSolutionInfo = (concentration) => {
    if (concentration === 'custom') {
      return { description: 'Custom concentration - verify with clinical guidelines' };
    }
    const solution = SolutionOptions.find(opt => opt.value === concentration);
    return solution || { description: '' };
  };

  const getConcentrationWarning = (concentration, index) => {
    if (!concentration) return null;
    
    const dwellTime = pdData.dwellTime;
    const isLongDwell = dwellTime && (dwellTime.includes('8') || dwellTime.includes('10') || dwellTime.includes('12'));
    
    // Custom concentration validation
    if (concentration === 'custom' && customConcentrations[index]) {
      const customValue = parseFloat(customConcentrations[index]);
      if (isNaN(customValue)) {
        return {
          type: 'error',
          message: 'Please enter a valid numeric concentration value'
        };
      }
      if (customValue > 4.25) {
        return {
          type: 'warning',
          message: 'Concentration above 4.25% is not standard. Please verify with pharmacy and clinical guidelines.'
        };
      }
      if (customValue < 1.5) {
        return {
          type: 'warning',
          message: 'Concentration below 1.5% may provide insufficient ultrafiltration.'
        };
      }
      return {
        type: 'info',
        message: `Custom concentration: ${customValue}% dextrose`
      };
    }
    
    // Standard concentration warnings
    const numericValue = parseFloat(concentration);
    
    if (numericValue >= 3.0 && isLongDwell) {
      return {
        type: 'warning',
        message: 'High dextrose concentration with long dwell may cause excessive glucose absorption and membrane damage.'
      };
    }
    
    if (numericValue >= 4.0) {
      return {
        type: 'warning',
        message: 'Very high glucose concentration. Monitor for hyperglycemia and peritoneal membrane health.'
      };
    }
    
    return {
      type: 'info',
      message: getSolutionInfo(concentration).description
    };
  };

  const addExchangeColumn = () => {
    const newConcentrations = [...pdData.solutionConcentrations, ''];
    const updatedData = {
      ...pdData,
      visibleColumns: pdData.visibleColumns + 1,
      totalExchanges: newConcentrations.filter(conc => conc.trim() !== '').length,
      solutionConcentrations: newConcentrations
    };
    
    setPdData(updatedData);
    setPrescriptionDetails(prev => ({
      ...prev,
      pd_data: updatedData
    }));
  };

  const removeExchangeColumn = () => {
    if (pdData.visibleColumns > 1) {
      const newConcentrations = pdData.solutionConcentrations.slice(0, -1);
      const updatedData = {
        ...pdData,
        visibleColumns: pdData.visibleColumns - 1,
        totalExchanges: newConcentrations.filter(conc => conc.trim() !== '').length,
        solutionConcentrations: newConcentrations
      };
      
      setPdData(updatedData);
      setPrescriptionDetails(prev => ({
        ...prev,
        pd_data: updatedData
      }));
      
      toast.info('Exchange removed');
    }
  };

  const removeSpecificColumn = (index) => {
    if (pdData.visibleColumns > 1) {
      const newConcentrations = [...pdData.solutionConcentrations];
      newConcentrations.splice(index, 1);
      
      const updatedData = {
        ...pdData,
        visibleColumns: pdData.visibleColumns - 1,
        totalExchanges: newConcentrations.filter(conc => conc.trim() !== '').length,
        solutionConcentrations: newConcentrations
      };
      
      setPdData(updatedData);
      setPrescriptionDetails(prev => ({
        ...prev,
        pd_data: updatedData
      }));
      
      // Remove custom concentration if exists
      if (customConcentrations[index]) {
        const newCustomConcentrations = { ...customConcentrations };
        delete newCustomConcentrations[index];
        setCustomConcentrations(newCustomConcentrations);
      }
      
      toast.info('Exchange removed');
    }
  };

  const resetPdData = () => {
    const resetData = {
      system: 'Baxter',
      modality: 'CAPD',
      fillVolume: '2',
      dwellTime: '4 hours',
      solutionConcentrations: ['', '', ''],
      visibleColumns: 3,
      totalExchanges: 3
    };
    
    setPdData(resetData);
    setPrescriptionDetails(prev => ({
      ...prev,
      pd_data: resetData
    }));
    
    setCustomConcentrations({});
    toast.info('PD data has been reset to default values');
  };

  const canRemoveExchange = pdData.visibleColumns > 1;

  // Enhanced CAPD Medical Information
  const capdInfo = {
    typicalExchanges: "4-5 exchanges per day",
    dwellTime: "4-8 hours (daytime), 8-10 hours (overnight)",
    fillVolume: "1-3 liters per exchange",
    commonConcentrations: "1.5%-4.25% dextrose",
    purpose: "Continuous toxin removal and fluid balance",
    indications: "End-stage renal disease, suitable for home dialysis",
    glucoseConcentrations: "1.5% (low UF) to 4.25% (maximum UF)",
    concentrationGuide: "1.5%: Low, 2.5%: Medium, 3.5%: High, 4.25%: Very High"
  };

  // Get display value for solution concentration
  const getDisplayConcentration = (concentration, index) => {
    if (concentration === 'custom' && customConcentrations[index]) {
      return `${customConcentrations[index]}% Dextrose (Custom)`;
    }
    const solution = SolutionOptions.find(opt => opt.value === concentration);
    return solution ? solution.label : 'Not selected';
  };

  return (
    <Container>
      <Section>
        <SectionHeader>
          <HeaderLeft>
            <SectionTitle>Peritoneal Dialysis Solution Configuration</SectionTitle>
          </HeaderLeft>
          <ResetButton onClick={resetPdData}>
            <FaSyncAlt size={14} />
            Reset Defaults
          </ResetButton>
        </SectionHeader>
        
        <DropdownSection>
          <DropdownHeader 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            $isOpen={dropdownOpen}
          >
            <DropdownTitle>
              <FaInfoCircle size={16} />
              CAPD (Continuous Ambulatory Peritoneal Dialysis) Information
            </DropdownTitle>
            <FaChevronDown 
              size={14} 
              style={{ 
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} 
            />
          </DropdownHeader>
          
          {dropdownOpen && (
            <DropdownContent>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Typical Exchanges</InfoLabel>
                  <InfoValue>{capdInfo.typicalExchanges}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Dwell Time Range</InfoLabel>
                  <InfoValue>{capdInfo.dwellTime}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Fill Volume Range</InfoLabel>
                  <InfoValue>{capdInfo.fillVolume}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Solution Concentrations</InfoLabel>
                  <InfoValue>{capdInfo.commonConcentrations}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Glucose Range</InfoLabel>
                  <InfoValue>{capdInfo.glucoseConcentrations}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Concentration Guide</InfoLabel>
                  <InfoValue>{capdInfo.concentrationGuide}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Treatment Purpose</InfoLabel>
                  <InfoValue>{capdInfo.purpose}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Indications</InfoLabel>
                  <InfoValue>{capdInfo.indications}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </DropdownContent>
          )}
        </DropdownSection>
        
        <ConfigurationSection>
          <SectionLabel>Treatment Parameters</SectionLabel>
          <FormGrid>
            <FormGroup>
              <Label>
                PD System
                <HelpIcon title="Manufacturer of the PD equipment and solutions" />
              </Label>
              <Select
                value={pdData.system}
                onChange={(e) => handlePdDataChange('system', e.target.value)}
              >
                <option value="Baxter">Baxter</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>
                PD Modality
                <HelpIcon title="Type of peritoneal dialysis treatment" />
              </Label>
              <Select
                value={pdData.modality}
                onChange={(e) => handlePdDataChange('modality', e.target.value)}
              >
                <option value="CAPD">CAPD (Continuous Ambulatory PD)</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>
                Fill Volume (L)
                <HelpIcon title="Volume of dialysis solution used per exchange" />
              </Label>
              <Select
                value={pdData.fillVolume}
                onChange={(e) => handlePdDataChange('fillVolume', e.target.value)}
              >
                <option value="1">1 L</option>
                <option value="2">2 L</option>
                <option value="3">3 L</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>
                Dwell Time
                <HelpIcon title="Duration that dialysis solution remains in peritoneal cavity" />
              </Label>
              <Select
                value={pdData.dwellTime}
                onChange={(e) => handlePdDataChange('dwellTime', e.target.value)}
              >
                <option value="3 hours">3 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="5 hours">5 hours</option>
                <option value="6 hours">6 hours</option>
                <option value="7 hours">7 hours</option>
                <option value="8 hours">8 hours</option>
              </Select>
            </FormGroup>
          </FormGrid>
        </ConfigurationSection>
        
        <ExchangesSection>
          <ExchangesHeader>
            <ExchangesTitle>Solution Exchanges Configuration</ExchangesTitle>
            <ExchangesCounter>
              <CounterLabel>Active Exchanges:</CounterLabel>
              <CounterValue>{pdData.totalExchanges}</CounterValue>
              <CounterLabel>Total Columns:</CounterLabel>
              <CounterValue>{pdData.visibleColumns}</CounterValue>
            </ExchangesCounter>
          </ExchangesHeader>
          
          <ButtonGroup>
            <ActionButton onClick={addExchangeColumn}>
              <FaPlus size={14} />
              Add Exchange
            </ActionButton>
            
            <ActionButton 
              $variant="danger" 
              onClick={removeExchangeColumn} 
              disabled={!canRemoveExchange}
            >
              <FaMinus size={14} />
              Remove Last Exchange
            </ActionButton>
          </ButtonGroup>
          
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <TableHeader>Dwell Time</TableHeader>
                  {pdData.solutionConcentrations.slice(0, pdData.visibleColumns).map((_, index) => (
                    <TableHeader key={index}>
                      Exchange {index + 1}
                      {canRemoveExchange && (
                        <RemoveColumnButton 
                          onClick={() => removeSpecificColumn(index)}
                          title="Remove this exchange"
                        >
                          <FaMinus size={8} />
                        </RemoveColumnButton>
                      )}
                    </TableHeader>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TableCell style={{ fontWeight: '600', background: '#f8f9fa' }}>
                    {pdData.dwellTime || 'Not specified'}
                  </TableCell>
                  {pdData.solutionConcentrations.slice(0, pdData.visibleColumns).map((concentration, index) => (
                    <TableCell key={index}>
                      <SolutionSelect
                        value={concentration}
                        onChange={(e) => handleSolutionConcentrationChange(index, e.target.value)}
                      >
                        {SolutionOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </SolutionSelect>
                      
                      {concentration === 'custom' && (
                        <Input
                          type="text"
                          value={customConcentrations[index] || ''}
                          onChange={(e) => handleCustomConcentrationChange(index, e.target.value)}
                          placeholder="Enter concentration % (e.g., 2.3)"
                          style={{ marginTop: '0.5rem', textAlign: 'center' }}
                        />
                      )}
                      
                      {concentration && (
                        <ConcentrationInfo $type={getConcentrationWarning(concentration, index)?.type}>
                          <FaExclamationTriangle size={12} />
                          {getConcentrationWarning(concentration, index)?.message}
                        </ConcentrationInfo>
                      )}
                    </TableCell>
                  ))}
                </tr>
                <tr>
                  <TableCell style={{ fontWeight: '600', background: '#f8f9fa' }}>
                    Selected Solution
                  </TableCell>
                  {pdData.solutionConcentrations.slice(0, pdData.visibleColumns).map((concentration, index) => (
                    <TableCell key={index} style={{ fontStyle: 'italic', color: '#6c757d' }}>
                      {getDisplayConcentration(concentration, index)}
                    </TableCell>
                  ))}
                </tr>
              </tbody>
            </Table>
          </TableContainer>
        </ExchangesSection>
        
        <InfoBox>
          <InfoText>
            <strong>PD Solution Concentration Guide:</strong> Dextrose concentrations range from 1.5% (low ultrafiltration) 
            to 4.25% (maximum ultrafiltration). Higher concentrations provide greater fluid removal but increase glucose absorption 
            and risk of hyperglycemia. Standard concentrations: 1.5% (Low), 2.5% (Medium), 3.5% (High), 4.25% (Very High).
          </InfoText>
        </InfoBox>
      </Section>
    </Container>
  );
};

export default PDSolutionInfoTab;