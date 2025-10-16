import React, { useState } from 'react';
import styled from 'styled-components';
import { FaUserInjured, FaInfoCircle, FaCalculator, FaClipboardList } from 'react-icons/fa';
import PatientInfoTab from './PatientInfoTab';
import PDSolutionInfoTab from './PDSolutionInfoTab';
import PDSolutionBagsTab from './PDSolutionBagsTab';
import SummaryTab from './SummaryTab';

const Container = styled.div`
  --color-primary: #395886;
  --color-primary-light: #4a6ba5;
  --color-primary-dark: #2a4270;
  --color-white: #FFFFFF;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-600: #4b5563;
  --color-gray-800: #1f2937;
  
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--color-gray-50);
`;

const TabsContainer = styled.div`
  display: flex;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  padding: 0 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.2rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${({ $active }) => $active ? 'var(--color-primary)' : 'transparent'};
  color: ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--color-gray-600)'};
  font-weight: ${({ $active }) => $active ? '600' : '500'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    background-color: var(--color-gray-50);
    color: var(--color-primary);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.85rem;
    
    span {
      display: none;
    }
  }
`;

const TabContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const TabbedPrescriptionLayout = ({
  selectedMedicines,
  onUpdateMedicine,
  prescriptionDetails,
  setPrescriptionDetails,
  onRemoveMedicine
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    {
      id: 'patient-info',
      label: 'Patient Information',
      icon: <FaUserInjured size={16} />,
      component: (
        <PatientInfoTab 
          prescriptionDetails={prescriptionDetails}
        />
      )
    },
    {
      id: 'pd-solution-info',
      label: 'PD Solution Information',
      icon: <FaInfoCircle size={16} />,
      component: (
        <PDSolutionInfoTab 
          prescriptionDetails={prescriptionDetails}
          setPrescriptionDetails={setPrescriptionDetails}
        />
      )
    },
    {
      id: 'pd-solution-bags',
      label: 'PD Solution Bags',
      icon: <FaCalculator size={16} />,
      component: (
        <PDSolutionBagsTab 
          prescriptionDetails={prescriptionDetails}
          setPrescriptionDetails={setPrescriptionDetails}
        />
      )
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: <FaClipboardList size={16} />,
      component: (
        <SummaryTab 
          selectedMedicines={selectedMedicines}
          prescriptionDetails={prescriptionDetails}
          onRemoveMedicine={onRemoveMedicine}
        />
      )
    }
  ];

  return (
    <Container>
      <TabsContainer>
        {tabs.map((tab, index) => (
          <Tab
            key={tab.id}
            $active={activeTab === index}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Tab>
        ))}
      </TabsContainer>
      
      <TabContent>
        {tabs[activeTab].component}
      </TabContent>
    </Container>
  );
};

export default TabbedPrescriptionLayout;