import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserInjured, 
  FaClock, 
  FaCheckCircle, 
  FaSearch, 
  FaPrescription,
  FaHistory,
  FaArrowRight,
  FaCalendarDay,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner,
  FaArrowLeft,
  FaUserCircle,
  FaNotesMedical
} from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';
import Notification from '../../components/Notification';
import TreatmentHistoryModal from './PatientTreatmentHistoryModal';
import PatientScheduleModal from './PatientScheduleModal';

const API_BASE_URL = 'http://localhost:8000';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const MainContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  width: 100%;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem 5rem;
  min-height: 100vh;
  background-color: #f8fafc;
  width: 100%;
  max-width: 2100px;
  margin: 0 auto;
  margin-top: -340px;

  @media (max-width: 2000px) {
    padding: 2rem 4rem;
  }

  @media (max-width: 1600px) {
    padding: 2rem 3rem;
  }

  @media (max-width: 1200px) {
    padding: 2rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0.5rem 0;
  font-weight: 600;
  transition: all 0.2s;
  border-radius: 6px;
  padding: 0.5rem 1.5rem;

  &:hover {
    color: #4338ca;
    background-color: #eef2ff;
  }
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
`;

const TitleContainer = styled.div`
  flex: 1;
  min-width: 400px;
`;

const Title = styled.h1`
  font-size: 2.75rem;
  margin-bottom: 0.5rem;
  color: #1e1b4b;
  font-weight: 800;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  color: #64748b;
  margin-bottom: 0;
  font-size: 1.2rem;
  max-width: 900px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  min-width: 220px;
  border-left: 5px solid ${props => {
    if (props.type === 'queue') return '#60a5fa';
    if (props.type === 'current') return '#f59e0b';
    if (props.type === 'completed') return '#10b981';
    return '#8b5cf6';
  }};
`;

const StatTitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  margin: 0;
  color: #1e293b;
  font-weight: 700;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 2rem;
  background: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  width: 100%;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button.attrs(props => ({
  'data-active': props.active ? 'true' : 'false'
}))`
  padding: 0.85rem 2rem;
  background-color: ${props => props.active ? '#4f46e5' : '#f1f5f9'};
  color: ${props => props.active ? 'white' : '#475569'};
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(79, 70, 229, 0.2)' : 'none'};

  &:hover {
    background-color: ${props => props.active ? '#4338ca' : '#e2e8f0'};
    transform: ${props => props.active ? 'none' : 'translateY(-2px)'};
  }
`;

const ScheduleButton = styled.button`
  padding: 0.85rem 2rem;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);

  &:hover {
    background-color: #6d28d9;
    transform: translateY(-2px);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 550px;
  min-width: 350px;

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem 1rem 3.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.05rem;
  outline: none;
  transition: all 0.2s;
  background-color: #f8fafc;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    background-color: white;
  }
`;

const ContentCard = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  min-height: 600px;
  border: 1px solid #e2e8f0;
  width: 100%;

  @media (max-width: 1600px) {
    padding: 2.5rem;
  }

  @media (max-width: 1200px) {
    padding: 2rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    min-height: 500px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.75rem;
  color: #1e1b4b;
  margin-bottom: 2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PatientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(550px, 1fr));
  gap: 2.5rem;

  @media (max-width: 2000px) {
    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  }

  @media (max-width: 1600px) {
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PatientCardContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
  opacity: ${props => props.loading ? 0.7 : 1};
  position: relative;
  min-height: 250px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;

  &:hover {
    transform: ${props => props.loading ? 'none' : 'translateY(-5px)'};
    box-shadow: ${props => props.loading ? 'none' : '0 10px 20px -3px rgba(0, 0, 0, 0.1)'};
    border-color: #c7d2fe;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 1;
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  color: #4f46e5;
  font-size: 2rem;
`;

const PatientAvatar = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background-color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2rem;
  color: #4f46e5;
  font-weight: bold;
  font-size: 1.75rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const PatientDetails = styled.div`
  flex: 1;
`;

const PatientName = styled.h4`
  margin: 0;
  color: #1e293b;
  font-weight: 700;
  font-size: 1.5rem;
`;

const PatientHN = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 1.1rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PatientStatus = styled.span`
  font-size: 0.9rem;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  background-color: ${props => {
    if (props.status === 'queue') return '#dbeafe';
    if (props.status === 'current') return '#fef3c7';
    if (props.status === 'completed') return '#d1fae5';
    return '#ede9fe';
  }};
  color: ${props => {
    if (props.status === 'queue') return '#1d4ed8';
    if (props.status === 'current') return '#92400e';
    if (props.status === 'completed') return '#065f46';
    return '#5b21b6';
  }};
  font-weight: 600;
  margin-left: 0.75rem;
`;

const PatientActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.85rem 1.5rem;
  background-color: ${props => {
    if (props.variant === 'primary') return '#4f46e5';
    if (props.variant === 'success') return '#10b981';
    if (props.variant === 'secondary') return '#f1f5f9';
    return '#4f46e5';
  }};
  color: ${props => {
    if (props.variant === 'secondary') return '#475569';
    return 'white';
  }};
  border: none;
  border-radius: 10px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  font-size: 1.05rem;
  flex: 1;
  justify-content: center;
  box-shadow: ${props => !props.disabled && props.variant !== 'secondary' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    background-color: ${props => {
      if (props.variant === 'primary' && !props.disabled) return '#4338ca';
      if (props.variant === 'success' && !props.disabled) return '#059669';
      if (props.variant === 'secondary' && !props.disabled) return '#e2e8f0';
      return props.variant === 'primary' ? '#4f46e5' : '#f1f5f9';
    }};
    transform: ${props => !props.disabled ? 'translateY(-2px)' : 'none'};
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #fee2e2;
  border-radius: 10px;
  border-left: 5px solid #dc2626;
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: #64748b;
  background-color: #f8fafc;
  border-radius: 16px;
  margin-top: 2rem;
  border: 2px dashed #e2e8f0;
  width: 100%;
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;
  color: #cbd5e1;
`;

const EmptyStateTitle = styled.h4`
  margin: 0;
  font-size: 1.75rem;
  color: #475569;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const EmptyStateMessage = styled.p`
  margin: 0;
  font-size: 1.15rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const FullPageLoader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f8fafc;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
`;

const LoaderText = styled.p`
  margin-top: 2rem;
  color: #4f46e5;
  font-size: 1.25rem;
  font-weight: 500;
`;

const PatientCard = ({ patient, children, loading, status }) => (
  <PatientCardContainer loading={loading}>
    {loading && (
      <LoadingOverlay>
        <Spinner />
      </LoadingOverlay>
    )}
    <PatientInfo>
      <PatientAvatar>
        {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
      </PatientAvatar>
      <PatientDetails>
        <PatientName>
          {patient.first_name} {patient.last_name}
        </PatientName>
        <PatientHN>
          <FaUserCircle /> HN: {patient.hospitalNumber || 'N/A'}
          {status && <PatientStatus status={status}>
            {status === 'queue' && 'In Queue'}
            {status === 'current' && 'In Progress'}
            {status === 'completed' && 'Completed'}
          </PatientStatus>}
        </PatientHN>
      </PatientDetails>
    </PatientInfo>
    {children}
  </PatientCardContainer>
);

const QueueTab = ({ patients, searchTerm, onStartCheckup, onViewHistory, loading }) => (
  <div>
    <SectionTitle>
      <FaUserInjured /> Patients in Queue
    </SectionTitle>
    
    {patients.length > 0 ? (
      <PatientsGrid>
        {patients.map((patient) => (
          <PatientCard key={patient.patientID} patient={patient} loading={loading} status="queue">
            <PatientActions>
              <ActionButton 
                variant="secondary"
                onClick={() => onViewHistory(patient)}
                disabled={loading}
              >
                <FaHistory /> History
              </ActionButton>
              <ActionButton 
                variant="primary"
                onClick={() => onStartCheckup(patient.patientID, patient.schedule_id)}
                disabled={loading}
              >
                Start Checkup <FaArrowRight />
              </ActionButton>
            </PatientActions>
          </PatientCard>
        ))}
      </PatientsGrid>
    ) : (
      <EmptyState 
        icon={<FaUserInjured />}
        title={searchTerm ? 'No matching patients' : 'No patients in queue'}
        message={searchTerm ? 'Try a different search term' : 'All patients are being checked or completed'}
      />
    )}
  </div>
);

const CurrentTab = ({ patients, searchTerm, onCompleteCheckup, onViewHistory, onPrescribe, loading, errors }) => (
  <div>
    <SectionTitle>
      <FaClock /> Current Checkups
    </SectionTitle>
    
    {patients.length > 0 ? (
      <PatientsGrid>
        {patients.map((patient) => (
          <PatientCard key={patient.patientID} patient={patient} loading={loading} status="current">
            {errors.patientId && (
              <ErrorMessage>
                <FaExclamationTriangle /> {errors.patientId}
              </ErrorMessage>
            )}
            <PatientActions>
              <ActionButton 
                variant="secondary"
                onClick={() => onViewHistory(patient)}
                disabled={loading}
              >
                <FaHistory /> History
              </ActionButton>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <ActionButton 
                  variant="primary"
                  onClick={() => onPrescribe(patient)}
                  disabled={loading}
                >
                  <FaPrescription /> Prescribe
                </ActionButton>
                <ActionButton 
                  variant="success"
                  onClick={() => onCompleteCheckup(patient.patientID, patient.schedule_id)}
                  disabled={loading}
                >
                  <FaCheckCircle /> Complete
                </ActionButton>
              </div>
            </PatientActions>
          </PatientCard>
        ))}
      </PatientsGrid>
    ) : (
      <EmptyState 
        icon={<FaClock />}
        title={searchTerm ? 'No matching patients' : 'No current checkups'}
        message={searchTerm ? 'Try a different search term' : 'Select a patient from the queue to start'}
      />
    )}
  </div>
);

const CompletedTab = ({ patients, searchTerm, onViewHistory, onPrescribe, loading }) => (
  <div>
    <SectionTitle>
      <FaCheckCircle /> Completed Checkups
    </SectionTitle>
    
    {patients.length > 0 ? (
      <PatientsGrid>
        {patients.map((patient) => (
          <PatientCard key={patient.patientID} patient={patient} loading={loading} status="completed">
            <PatientActions>
              <ActionButton 
                variant="secondary"
                onClick={() => onViewHistory(patient)}
                disabled={loading}
              >
                <FaHistory /> History
              </ActionButton>
              <ActionButton 
                variant="primary"
                onClick={() => onPrescribe(patient)}
                disabled={loading}
              >
                <FaPrescription /> Prescribe
              </ActionButton>
            </PatientActions>
          </PatientCard>
        ))}
      </PatientsGrid>
    ) : (
      <EmptyState 
        icon={<FaCheckCircle />}
        title={searchTerm ? 'No matching patients' : 'No completed checkups'}
        message={searchTerm ? 'Try a different search term' : 'Complete some checkups to see them here'}
      />
    )}
  </div>
);

const EmptyState = ({ icon, title, message }) => (
  <EmptyStateContainer>
    <EmptyStateIcon>
      {icon}
    </EmptyStateIcon>
    <EmptyStateTitle>{title}</EmptyStateTitle>
    <EmptyStateMessage>{message}</EmptyStateMessage>
  </EmptyStateContainer>
);

const DoctorCheckup = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPatients, setCurrentPatients] = useState([]);
  const [queuePatients, setQueuePatients] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [allPatientsToday, setAllPatientsToday] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('queue');
  const [apiErrors, setApiErrors] = useState({});
  const navigate = useNavigate();

  const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    console.error('Response Data:', error.response?.data);
    console.error('Status Code:', error.response?.status);
    
    let errorMessage = defaultMessage;
    let errorDetails = '';
    let autoClose = true;
    let icon = <FaExclamationTriangle />;
    
    if (error.response) {
      const { data } = error.response;
      errorMessage = data.message || defaultMessage;
      errorDetails = data.error_details || '';
      
      if (data.error_code === 'UNAUTHENTICATED' || error.response.status === 401) {
        autoClose = false;
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }, 3000);
      }
      
      if (data.error_code === 'VALIDATION_ERROR' && data.errors) {
        setApiErrors(data.errors);
      } else {
        setApiErrors({});
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
      icon = <FaInfoCircle />;
    } else {
      errorMessage = error.message || defaultMessage;
    }
    
    setNotification({
      message: errorMessage,
      details: errorDetails,
      type: 'error',
      autoClose,
      icon
    });
  };

  const fetchCheckupData = async (doctorId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/doctor/checkup`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          response: {
            data: errorData,
            status: response.status
          }
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw {
          response: {
            data: {
              message: data.message || 'Request failed',
              error_code: data.error_code
            }
          }
        };
      }

      setAllPatientsToday(data.data?.allPatientsToday || []);
      setCurrentPatients(data.data?.currentPatients || []);
      setQueuePatients(data.data?.queuePatients || []);
      setCompletedPatients(data.data?.completedPatients || []);
      
    } catch (error) {
      handleApiError(error, "Failed to load checkup data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCheckup = async (patientId, scheduleId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/doctor/start-checkup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ patientId, scheduleId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          response: {
            data: errorData,
            status: response.status
          }
        };
      }

      const data = await response.json();
      
      setNotification({
        message: data.message || 'Checkup started successfully',
        type: 'success',
        icon: <FaCheckCircle />
      });

      await fetchCheckupData(user.userID);
    } catch (error) {
      handleApiError(error, "Failed to start checkup");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCheckup = async (patientId, scheduleId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/doctor/complete-checkup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ patientId, scheduleId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          response: {
            data: errorData,
            status: response.status
          }
        };
      }

      const data = await response.json();
      
      setNotification({
        message: data.message || 'Checkup completed successfully',
        type: 'success',
        icon: <FaCheckCircle />
      });

      await fetchCheckupData(user.userID);
    } catch (error) {
      handleApiError(error, "Failed to complete checkup");
    } finally {
      setLoading(false);
    }
  };

  const handlePrescribe = (patient) => {
    navigate('/doctor/prescription', { state: { patient } });
  };

  const handleViewHistory = (patient) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  const handleViewSchedule = () => {
    setShowScheduleModal(true);
  };

  const handleBackToDashboard = () => {
    navigate('/doctor/DoctorDashboard');
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const filteredPatients = (patients) => {
    if (!searchTerm) return patients;
    
    return patients.filter(patient => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const hospitalNum = patient.hospitalNumber ? patient.hospitalNumber.toLowerCase() : '';
      return fullName.includes(searchTerm.toLowerCase()) || 
             hospitalNum.includes(searchTerm.toLowerCase());
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("Your session has expired. Please login again.");
        }

        if (userData.userLevel !== 'doctor') {
          throw new Error("You don't have permission to access this page.");
        }

        setUser(userData);
        await fetchCheckupData(userData.userID);
      } catch (error) {
        handleApiError(error, "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    const interval = setInterval(() => {
      if (user?.userID) {
        fetchCheckupData(user.userID);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [navigate, user?.userID]);

  if (loading && !user) {
    return (
      <FullPageLoader>
        <Spinner size={48} />
        <LoaderText>Loading checkup data...</LoaderText>
      </FullPageLoader>
    );
  }

  if (!user) return null;

  return (
    <MainContainer>
      <MainContent>
        <BackButton onClick={handleBackToDashboard}>
          <FaArrowLeft /> Back to Dashboard
        </BackButton>
        
        <Header>
          <TitleContainer>
            <Title>Patient Checkup Management</Title>
            <Subtitle>
              Review and manage all patient checkups in your queue. View patient history, prescribe medications, and track treatment progress.
            </Subtitle>
          </TitleContainer>
          
          <StatsContainer>
            <StatCard type="queue">
              <StatTitle>In Queue</StatTitle>
              <StatValue>{queuePatients.length}</StatValue>
            </StatCard>
            <StatCard type="current">
              <StatTitle>In Progress</StatTitle>
              <StatValue>{currentPatients.length}</StatValue>
            </StatCard>
            <StatCard type="completed">
              <StatTitle>Completed</StatTitle>
              <StatValue>{completedPatients.length}</StatValue>
            </StatCard>
          </StatsContainer>
        </Header>

        {notification && (
          <Notification
            message={notification.message}
            details={notification.details}
            type={notification.type}
            onClose={closeNotification}
            autoClose={notification.autoClose !== false}
            icon={notification.icon}
          />
        )}

        <ControlBar>
          <TabButtons>
            <TabButton 
              active={activeTab === 'queue'}
              data-active={activeTab === 'queue' ? 'true' : 'false'}
              onClick={() => setActiveTab('queue')}
            >
              <FaUserInjured /> Queue ({queuePatients.length})
            </TabButton>
            <TabButton 
              active={activeTab === 'current'}
              data-active={activeTab === 'current' ? 'true' : 'false'}
              onClick={() => setActiveTab('current')}
            >
              <FaClock /> In Progress ({currentPatients.length})
            </TabButton>
            <TabButton 
              active={activeTab === 'completed'}
              data-active={activeTab === 'completed' ? 'true' : 'false'}
              onClick={() => setActiveTab('completed')}
            >
              <FaCheckCircle /> Completed ({completedPatients.length})
            </TabButton>
            <ScheduleButton onClick={handleViewSchedule}>
              <FaCalendarDay /> Today's Schedule
            </ScheduleButton>
          </TabButtons>

          <SearchContainer>
            <SearchIcon />
            <SearchInput 
              type="text" 
              placeholder="Search by name or hospital number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </ControlBar>

        <ContentCard>
          {activeTab === 'queue' && (
            <QueueTab 
              patients={filteredPatients(queuePatients)} 
              searchTerm={searchTerm}
              onStartCheckup={handleStartCheckup}
              onViewHistory={handleViewHistory}
              loading={loading}
            />
          )}

          {activeTab === 'current' && (
            <CurrentTab 
              patients={filteredPatients(currentPatients)} 
              searchTerm={searchTerm}
              onCompleteCheckup={handleCompleteCheckup}
              onViewHistory={handleViewHistory}
              onPrescribe={handlePrescribe}
              loading={loading}
              errors={apiErrors}
            />
          )}

          {activeTab === 'completed' && (
            <CompletedTab 
              patients={filteredPatients(completedPatients)} 
              searchTerm={searchTerm}
              onViewHistory={handleViewHistory}
              onPrescribe={handlePrescribe}
              loading={loading}
            />
          )}
        </ContentCard>
      </MainContent>

      {showHistoryModal && (
        <TreatmentHistoryModal
          show={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          patientId={selectedPatient?.patientID}
          apiBaseUrl={API_BASE_URL}
        />
      )}

      {showScheduleModal && (
        <PatientScheduleModal
          show={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          patients={allPatientsToday}
        />
      )}
    </MainContainer>
  );
};

export default DoctorCheckup;