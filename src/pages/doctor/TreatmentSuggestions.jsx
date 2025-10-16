// TreatmentSuggestions.jsx
import React from 'react';
import styled from 'styled-components';
import { FiClipboard, FiDroplet, FiActivity, FiAlertTriangle, FiCheckCircle, FiThermometer, FiHeart } from 'react-icons/fi';
import Spinner from '../../components/Spinner';

const SuggestionCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  border-left: 4px solid ${props => props.type === 'prescription' ? '#395886' : 
                             props.type === 'test' ? '#28a745' : 
                             props.type === 'monitoring' ? '#ffc107' : 
                             props.type === 'education' ? '#17a2b8' : '#6c757d'};
`;

const SuggestionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  color: ${props => props.type === 'prescription' ? '#395886' : 
                    props.type === 'test' ? '#28a745' : 
                    props.type === 'monitoring' ? '#ffc107' : 
                    props.type === 'education' ? '#17a2b8' : '#6c757d'};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.type === 'prescription' ? '#39588620' : 
                              props.type === 'test' ? '#28a74520' : 
                              props.type === 'monitoring' ? '#ffc10720' : 
                              props.type === 'education' ? '#17a2b820' : '#6c757d20'};
  margin-right: 0.8rem;
`;

const SuggestionList = styled.ul`
  padding-left: 1.2rem;
  margin: 0;
`;

const SuggestionItem = styled.li`
  margin-bottom: 0.5rem;
  line-height: 1.5;
`;

const GenerateButton = styled.button`
  background-color: #395886;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin: 1rem auto;
  
  &:hover {
    background-color: #2a406c;
  }
  
  &:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
`;

const TreatmentSuggestions = ({ suggestions, patientData, onGenerateNew, generating }) => {
  if (!suggestions) {
    return (
      <EmptyState>
        <FiClipboard size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h3>No suggestions yet</h3>
        <p>Click the button below to generate personalized treatment suggestions</p>
        <GenerateButton onClick={onGenerateNew} disabled={generating}>
          {generating ? <Spinner size="small" /> : 'Generate Suggestions'}
        </GenerateButton>
      </EmptyState>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>Personalized Treatment Suggestions</h3>
        <GenerateButton onClick={onGenerateNew} disabled={generating}>
          {generating ? <Spinner size="small" /> : 'Generate New'}
        </GenerateButton>
      </div>

      {suggestions.prescription && suggestions.prescription.length > 0 && (
        <SuggestionCard type="prescription">
          <SuggestionHeader type="prescription">
            <IconWrapper type="prescription">
              <FiDroplet />
            </IconWrapper>
            <h4 style={{ margin: 0 }}>Prescription Adjustments</h4>
          </SuggestionHeader>
          <SuggestionList>
            {suggestions.prescription.map((item, index) => (
              <SuggestionItem key={index}>{item}</SuggestionItem>
            ))}
          </SuggestionList>
        </SuggestionCard>
      )}

      {suggestions.monitoring && suggestions.monitoring.length > 0 && (
        <SuggestionCard type="monitoring">
          <SuggestionHeader type="monitoring">
            <IconWrapper type="monitoring">
              <FiActivity />
            </IconWrapper>
            <h4 style={{ margin: 0 }}>Monitoring Recommendations</h4>
          </SuggestionHeader>
          <SuggestionList>
            {suggestions.monitoring.map((item, index) => (
              <SuggestionItem key={index}>{item}</SuggestionItem>
            ))}
          </SuggestionList>
        </SuggestionCard>
      )}

      {suggestions.tests && suggestions.tests.length > 0 && (
        <SuggestionCard type="test">
          <SuggestionHeader type="test">
            <IconWrapper type="test">
              <FiThermometer />
            </IconWrapper>
            <h4 style={{ margin: 0 }}>Recommended Tests</h4>
          </SuggestionHeader>
          <SuggestionList>
            {suggestions.tests.map((item, index) => (
              <SuggestionItem key={index}>{item}</SuggestionItem>
            ))}
          </SuggestionList>
        </SuggestionCard>
      )}

      {suggestions.education && suggestions.education.length > 0 && (
        <SuggestionCard type="education">
          <SuggestionHeader type="education">
            <IconWrapper type="education">
              <FiHeart />
            </IconWrapper>
            <h4 style={{ margin: 0 }}>Patient Education</h4>
          </SuggestionHeader>
          <SuggestionList>
            {suggestions.education.map((item, index) => (
              <SuggestionItem key={index}>{item}</SuggestionItem>
            ))}
          </SuggestionList>
        </SuggestionCard>
      )}

      {suggestions.risks && suggestions.risks.length > 0 && (
        <SuggestionCard type="risk">
          <SuggestionHeader type="risk">
            <IconWrapper type="risk">
              <FiAlertTriangle />
            </IconWrapper>
            <h4 style={{ margin: 0 }}>Risk Factors to Address</h4>
          </SuggestionHeader>
          <SuggestionList>
            {suggestions.risks.map((item, index) => (
              <SuggestionItem key={index}>{item}</SuggestionItem>
            ))}
          </SuggestionList>
        </SuggestionCard>
      )}

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px', 
        padding: '1rem', 
        marginTop: '1.5rem',
        fontSize: '0.9rem',
        color: '#6c757d'
      }}>
        <FiCheckCircle style={{ marginRight: '0.5rem' }} />
        These suggestions are based on analysis of {patientData?.treatments?.length || 0} treatments and clinical indicators.
      </div>
    </div>
  );
};

export default TreatmentSuggestions;