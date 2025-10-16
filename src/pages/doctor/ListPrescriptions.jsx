import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../api/axios';
import { FaSearch, FaFilePdf, FaCalendarAlt, FaHospital, FaUser } from 'react-icons/fa';
import DoctorSidebar from './DoctorSidebar';
import { format } from 'date-fns';

const SIDEBAR_WIDTH = '260px';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f5f7fa;
  margin-top: -937px;
`;

const SidebarWrapper = styled.div`
  width: ${SIDEBAR_WIDTH};
  flex-shrink: 0;
  height: 100%;
`;

const MainContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  height: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ListPanel = styled.div`
  width: 35%;
  padding: 2rem;
  overflow-y: auto;
  border-right: 1px solid #e2e8f0;
  background: #ffffff;

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const ViewerPanel = styled.div`
  flex-grow: 1;
  padding: 2rem;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 500px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 420px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  padding: 0.5rem;
  width: 100%;
  font-size: 1rem;
  color: #4a5568;
`;

const SearchIcon = styled(FaSearch)`
  color: #a0aec0;
  margin-right: 0.5rem;
`;

const PrescriptionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PrescriptionItem = styled.li`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #eef2f8;
    transform: translateY(-2px);
  }

  &.selected {
    border-left: 4px solid #395886;
    background: #e6ecf5;
  }
`;

const PrescriptionTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
    color: #e53e3e;
  }
`;

const PrescriptionDate = styled.div`
  font-size: 0.9rem;
  color: #718096;
  display: flex;
  align-items: center;
  margin-bottom: 0.3rem;

  svg {
    margin-right: 0.4rem;
    color: #a0aec0;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #718096;
`;

const Error = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #e53e3e;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const EmptyTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #718096;
  font-size: 1rem;
  margin: 0;
`;

const ListPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctor/prescriptions');
        setPrescriptions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch prescriptions');
      } finally {
        setLoading(false);
      }
    };

    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }

    fetchPrescriptions();
  }, [navigate]);

  const filteredPrescriptions = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return prescriptions.filter(prescription =>
      (prescription.patient_name?.toLowerCase().includes(searchLower) ||
      prescription.guardian_name?.toLowerCase().includes(searchLower) ||
      prescription.hospital_number?.toLowerCase().includes(searchLower) ||
      prescription.file_name?.toLowerCase().includes(searchLower) ||
      prescription.issued_by?.toLowerCase().includes(searchLower) ||
      format(new Date(prescription.created_at), 'MMM dd, yyyy').toLowerCase().includes(searchLower))
    );
  }, [prescriptions, searchTerm]);

  const handleSelect = (prescription) => {
    setSelectedPrescription(prescription);
  };

  const getPdfUrl = () => {
    if (!selectedPrescription) return '';
    // Add timestamp to prevent caching issues
    return `${selectedPrescription.file_url}?token=${localStorage.getItem('token')}&t=${Date.now()}`;
  };

  if (loading) return (
    <PageContainer>
      <SidebarWrapper>
        <DoctorSidebar user={user} />
      </SidebarWrapper>
      <MainContent><Loading>Loading prescriptions...</Loading></MainContent>
    </PageContainer>
  );

  if (error) return (
    <PageContainer>
      <SidebarWrapper>
        <DoctorSidebar user={user} />
      </SidebarWrapper>
      <MainContent><Error>Error: {error}</Error></MainContent>
    </PageContainer>
  );

  return (
    <PageContainer>
      <SidebarWrapper>
        <DoctorSidebar user={user} />
      </SidebarWrapper>
      <MainContent>
        <ListPanel>
          <Header>
            <Title>Patient Prescriptions</Title>
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </Header>

          {filteredPrescriptions.length === 0 ? (
            <EmptyState>
              <EmptyTitle>No prescriptions found</EmptyTitle>
              <EmptyText>When prescriptions are created, they will appear here.</EmptyText>
            </EmptyState>
          ) : (
            <PrescriptionList>
              {filteredPrescriptions.map(prescription => (
                <PrescriptionItem
                  key={prescription.id}
                  onClick={() => handleSelect(prescription)}
                  className={selectedPrescription?.id === prescription.id ? 'selected' : ''}
                >
                  <PrescriptionTitle>
                    <FaFilePdf />
                    {prescription.file_name || `Prescription_${prescription.id}.pdf`}
                  </PrescriptionTitle>

                  <PrescriptionDate>
                    <FaCalendarAlt />
                    <strong>Date Issued:</strong>&nbsp;
                    {format(new Date(prescription.created_at), 'MMM dd, yyyy - h:mm a')}
                  </PrescriptionDate>

                  <PrescriptionDate>
                    <FaUser />
                    <strong>Doctor:</strong>&nbsp;
                    {prescription.issued_by}
                  </PrescriptionDate>

                  <PrescriptionDate>
                    <FaUser />
                    <strong>Patient:</strong>&nbsp;
                    {prescription.patient_name}
                  </PrescriptionDate>

                  {prescription.guardian_name && (
                    <PrescriptionDate>
                      <strong>Guardian:</strong>&nbsp;
                      {prescription.guardian_name}
                    </PrescriptionDate>
                  )}

                  <PrescriptionDate>
                    <FaHospital />
                    <strong>Hospital No.:</strong>&nbsp;
                    {prescription.hospital_number}
                  </PrescriptionDate>
                </PrescriptionItem>
              ))}
            </PrescriptionList>
          )}
        </ListPanel>

        <ViewerPanel>
          {selectedPrescription ? (
            <iframe 
              src={getPdfUrl()} 
              title="Prescription PDF"
              onError={(e) => {
                console.error('PDF loading error:', e);
                setError('Failed to load PDF. Please try again.');
              }}
            />
          ) : (
            <EmptyState>
              <EmptyTitle>No prescription selected</EmptyTitle>
              <EmptyText>Select a prescription from the list to view it</EmptyText>
            </EmptyState>
          )}
        </ViewerPanel>
      </MainContent>
    </PageContainer>
  );
};

export default React.memo(ListPrescriptions);