import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaPrescription, 
  FaNotesMedical, 
  FaUserInjured, 
  FaCalendarAlt,
  FaUserMd,
  FaStethoscope,
  FaChartLine,
  FaClock,
  FaUserCheck
} from 'react-icons/fa';
import { 
  BsCalendar2Week, 
  BsArrowLeft, 
  BsArrowRight, 
  BsClock as BsClockIcon, 
  BsGenderMale, 
  BsGenderFemale,
  BsGraphUp
} from 'react-icons/bs';
import { GiStethoscope, GiMedicines } from 'react-icons/gi';
import { MdOutlineSick, MdOutlineMedicalServices } from 'react-icons/md';
import PatientAvatar from '../../components/PatientAvatar';
import styled from 'styled-components';

const Container = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
  border: 1px solid #e0e6ed;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e6ed;
  background-color: #f8f9fa;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${({ $active }) => $active ? '#ffffff' : 'transparent'};
  color: ${({ $active, $color }) => $active ? $color : '#6b7280'};
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: ${({ $active, $color }) => $active ? `3px solid ${$color}` : 'none'};
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: ${({ $active }) => $active ? '#ffffff' : '#f1f5f9'};
  }
`;

const CountBadge = styled.span`
  background-color: ${({ $color }) => $color};
  color: white;
  border-radius: 10px;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  margin-left: 0.5rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7280;
  font-size: 1rem;
  text-align: center;
  padding: 2rem;
  background-color: #f9fafb;
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const PatientCard = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.2s ease;
  border-left: 4px solid ${({ $borderColor }) => $borderColor};
  cursor: pointer;
  border: 1px solid #e0e6ed;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
    border-color: ${({ $borderColor }) => $borderColor};
  }
`;

const PriorityBadge = styled.span`
  background-color: ${({ $priority }) => 
    $priority === 'emergency' ? '#ef4444' : 
    $priority === 'urgent' ? '#f59e0b' : '#10b981'};
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ActionButton = styled.button`
  background-color: ${({ $bgColor }) => $bgColor || '#f3f4f6'};
  color: ${({ $primary }) => $primary ? 'white' : '#334155'};
  border: none;
  border-radius: 6px;
  padding: 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${({ $hoverColor }) => $hoverColor || '#e5e7eb'};
    color: ${({ $hoverTextColor }) => $hoverTextColor || 'inherit'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const StatsCard = styled.div`
  flex: 1;
  min-width: 200px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e6ed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #e0e6ed;
  background-color: #f8f9fa;
  border-radius: 0 0 8px 8px;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  border: 1px solid #e0e6ed;
  flex: 1;
  min-width: 250px;
  max-width: 500px;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 0.9rem;
  color: #374151;
  padding-left: 0.5rem;

  &::placeholder {
    color: #9ca3af;
  }
`;

const StatsSummary = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const PatientGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const ConsultationBadge = styled.span`
  background-color: #3b82f6;
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
`;

const UpcomingScheduleOverview = ({
  filteredTodayPatients,
  dashboardData,
  todaySearchTerm,
  setTodaySearchTerm,
  filteredTomorrowPatients,
  tomorrowSearchTerm,
  setTomorrowSearchTerm,
  filteredNextWeekPatients,
  nextWeekSearchTerm,
  setNextWeekSearchTerm,
  navigate,
  handlePrescribe,
  handleViewPatientDetails
}) => {
  const [activeTab, setActiveTab] = React.useState('today');
  const [currentPage, setCurrentPage] = React.useState(1);
  const patientsPerPage = 4;

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '--';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const filterConfirmedPatients = (patients) => {
    return patients.filter(patient => 
      patient.confirmation_status === 'confirmed' && 
      patient.checkup_status !== 'Completed'
    );
  };

  const handlePrescribeClick = (patient) => {
    navigate(`/prescription/${patient.patientID}`, { 
      state: { 
        patientName: `${patient.first_name} ${patient.last_name}`,
        hospitalNumber: patient.hospitalNumber,
        legalRepresentative: patient.legalRepresentative
      } 
    });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const getCurrentPatients = () => {
    switch (activeTab) {
      case 'today':
        return filterConfirmedPatients(filteredTodayPatients);
      case 'tomorrow':
        return filterConfirmedPatients(filteredTomorrowPatients);
      case 'nextWeek':
        return filterConfirmedPatients(filteredNextWeekPatients);
      default:
        return [];
    }
  };

  const getTotalPatients = () => {
    switch (activeTab) {
      case 'today':
        return filterConfirmedPatients(dashboardData.patientsToday).length;
      case 'tomorrow':
        return filterConfirmedPatients(dashboardData.patientsTomorrow).length;
      case 'nextWeek':
        return filterConfirmedPatients(dashboardData.nextWeekPatients).length;
      default:
        return 0;
    }
  };

  const getPaginatedPatients = () => {
    const patients = getCurrentPatients();
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    return patients.slice(indexOfFirstPatient, indexOfLastPatient);
  };

  const totalPages = Math.ceil(getCurrentPatients().length / patientsPerPage);

  const getTabConfig = () => {
    switch (activeTab) {
      case 'today': 
        return { 
          color: '#3b82f6', 
          lightColor: '#EFF6FF',
          text: 'Today',
          icon: <FaCalendarAlt />
        };
      case 'tomorrow': 
        return { 
          color: '#8b5cf6', 
          lightColor: '#F5F3FF',
          text: 'Tomorrow',
          icon: <BsCalendar2Week />
        };
      case 'nextWeek': 
        return { 
          color: '#10b981', 
          lightColor: '#ECFDF5',
          text: 'Next Week',
          icon: <BsGraphUp />
        };
      default: 
        return { 
          color: '#3b82f6', 
          lightColor: '#EFF6FF',
          text: '',
          icon: null
        };
    }
  };

  // New function to check if patient is in queue
  const isPatientInQueue = (patientId) => {
    if (!dashboardData.todayQueues) return false;
    return dashboardData.todayQueues.some(queue => 
      queue.patient_id === patientId || 
      queue.hospital_number === patientId.toString()
    );
  };

  // New function to get queue status for a patient
  const getPatientQueueStatus = (patientId) => {
    if (!dashboardData.todayQueues) return null;
    const queue = dashboardData.todayQueues.find(queue => 
      queue.patient_id === patientId || 
      queue.hospital_number === patientId.toString()
    );
    return queue ? queue.status : null;
  };

  const renderQueueStatusBadge = (patientId) => {
    const status = getPatientQueueStatus(patientId);
    if (!status) return null;

    const statusConfig = {
      'waiting': { color: '#f59e0b', icon: <FaClock />, text: 'Waiting' },
      'in-progress': { color: '#3b82f6', icon: <FaUserCheck />, text: 'In Progress' },
      'completed': { color: '#10b981', icon: <FaCheckCircle />, text: 'Completed' },
      'cancelled': { color: '#ef4444', icon: <FaTimesCircle />, text: 'Cancelled' }
    };

    const config = statusConfig[status] || { color: '#6b7280', icon: null, text: status };

    return (
      <span style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        padding: '0.3rem 0.7rem',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        marginLeft: '0.5rem'
      }}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const renderEmptyState = () => {
    const tabConfig = getTabConfig();
    return (
      <EmptyState>
        <EmptyStateIcon $bgColor={tabConfig.lightColor}>
          {React.cloneElement(tabConfig.icon, { 
            style: { fontSize: '2rem', color: tabConfig.color } 
          })}
        </EmptyStateIcon>
        <h4 style={{ margin: '0.5rem 0', color: '#1f2937', fontWeight: 500 }}>
          {activeTab === 'today' && (todaySearchTerm ? 
            'No matching patients found' : 
            'No confirmed Checkup today')}
          {activeTab === 'tomorrow' && (tomorrowSearchTerm ? 
            'No matching patients found' : 
            'No confirmed Checkup tomorrow')}
          {activeTab === 'nextWeek' && (nextWeekSearchTerm ? 
            'No matching patients found' : 
            'No confirmed Checkup next week')}
        </h4>
        <p style={{ 
          margin: 0, 
          fontSize: '0.9rem', 
          color: '#6b7280',
          maxWidth: '300px'
        }}>
          {todaySearchTerm || tomorrowSearchTerm || nextWeekSearchTerm 
            ? 'Try adjusting your search criteria' 
            : 'All clear for this time period. No scheduled Checkup.'}
        </p>
      </EmptyState>
    );
  };

  const renderPatientCard = (patient, index) => {
    const tabConfig = getTabConfig();
    const patientAge = calculateAge(patient.date_of_birth);
    const genderIcon = patient.gender === 'male' ? 
      <BsGenderMale style={{ color: '#3b82f6' }} /> : 
      <BsGenderFemale style={{ color: '#ec4899' }} />;
    
    return (
      <PatientCard 
        key={`patient-${patient.patientID || index}`}
        $borderColor={tabConfig.color}
        onClick={() => handleViewPatientDetails(patient)}
      >
        <div style={{ flexShrink: 0 }}>
          <PatientAvatar 
            firstName={patient.first_name} 
            lastName={patient.last_name} 
            size="56px"
            fontSize="1.2rem"
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <h4 style={{ 
              margin: 0, 
              color: '#111827',
              fontWeight: 600,
              fontSize: '1rem'
            }}>
              {patient.first_name} {patient.last_name}
            </h4>
            <PriorityBadge $priority={patient.priority || 'routine'}>
              {patient.priority || 'routine'}
            </PriorityBadge>
            {activeTab === 'today' && renderQueueStatusBadge(patient.patientID)}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            fontSize: '0.85rem', 
            color: '#6b7280',
            alignItems: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <BsClockIcon style={{ color: '#6b7280' }} /> 
              <span>{patientAge} yrs</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {genderIcon}
              <span>{patient.gender || '--'}</span>
            </span>
            {patient.medical_history?.chronic_conditions && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MdOutlineSick style={{ color: '#ef4444' }} />
                <span>Chronic</span>
              </span>
            )}
          </div>
          {patient.reason && (
            <p style={{ 
              margin: '0.5rem 0 0 0',
              fontSize: '0.85rem',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <MdOutlineMedicalServices style={{ color: tabConfig.color }} />
              <span>{patient.reason.substring(0, 50)}{patient.reason.length > 50 ? '...' : ''}</span>
            </p>
          )}
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem', 
          alignItems: 'flex-end'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ActionButton 
              onClick={(e) => {
                e.stopPropagation();
                handleViewPatientDetails(patient);
              }}
              $bgColor="#f3f4f6"
              $hoverColor="#3b82f6"
              $hoverTextColor="white"
              title="View medical records"
            >
              <FaNotesMedical style={{ color: '#4b5563' }} />
            </ActionButton>
            {activeTab === 'today' && (
              <ActionButton 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrescribeClick(patient);
                }}
                $bgColor={tabConfig.lightColor}
                $hoverColor={tabConfig.color}
                $hoverTextColor="white"
                title="Prescribe medication"
              >
                <FaPrescription style={{ color: tabConfig.color }} />
              </ActionButton>
            )}
          </div>
          <div style={{ 
            fontSize: '0.8rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <GiStethoscope />
            <span>ID: {patient.patientID}</span>
          </div>
        </div>
      </PatientCard>
    );
  };

  const renderPatientList = () => {
    const paginatedPatients = getPaginatedPatients();
    const totalPatients = getCurrentPatients().length;
    const showingText = `Showing ${Math.min((currentPage - 1) * patientsPerPage + 1, totalPatients)}-${Math.min(currentPage * patientsPerPage, totalPatients)} of ${totalPatients}`;
    const tabConfig = getTabConfig();

    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <SearchContainer>
            <FaSearch style={{ color: '#9ca3af' }} />
            <SearchInput
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()} Checkup...`}
              value={activeTab === 'today' ? todaySearchTerm : activeTab === 'tomorrow' ? tomorrowSearchTerm : nextWeekSearchTerm}
              onChange={(e) => {
                if (activeTab === 'today') setTodaySearchTerm(e.target.value);
                if (activeTab === 'tomorrow') setTomorrowSearchTerm(e.target.value);
                if (activeTab === 'nextWeek') setNextWeekSearchTerm(e.target.value);
              }}
            />
          </SearchContainer>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: tabConfig.lightColor,
            color: tabConfig.color,
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            minWidth: 'fit-content',
            border: `1px solid ${tabConfig.color}20`
          }}>
            <FaUserMd style={{ fontSize: '1.1rem' }} />
            <span>
              {filterConfirmedPatients(
                activeTab === 'today' ? filteredTodayPatients : 
                activeTab === 'tomorrow' ? filteredTomorrowPatients : 
                filteredNextWeekPatients
              ).length} confirmed Checkup
            </span>
          </div>
        </div>

        <PatientGrid>
          {paginatedPatients.map((patient, index) => renderPatientCard(patient, index))}
        </PatientGrid>

        <StatsSummary>
          <StatsCard>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: '#1f2937', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 600
            }}>
              <FaUserInjured style={{ color: '#8b5cf6' }} /> Gender Distribution
            </h4>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              height: '10px', 
              borderRadius: '5px', 
              overflow: 'hidden',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                flex: paginatedPatients.filter(p => p.gender === 'male').length || 1,
                backgroundColor: '#3b82f6',
                height: '100%'
              }} />
              <div style={{
                flex: paginatedPatients.filter(p => p.gender === 'female').length || 1,
                backgroundColor: '#ec4899',
                height: '100%'
              }} />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.85rem'
            }}>
              <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                <BsGenderMale style={{ marginRight: '0.3rem' }} />
                Male: {paginatedPatients.filter(p => p.gender === 'male').length}
              </span>
              <span style={{ color: '#ec4899', fontWeight: 500 }}>
                <BsGenderFemale style={{ marginRight: '0.3rem' }} />
                Female: {paginatedPatients.filter(p => p.gender === 'female').length}
              </span>
            </div>
          </StatsCard>

          <StatsCard>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: '#1f2937', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 600
            }}>
              <FaCalendarAlt style={{ color: '#10b981' }} /> Age Groups
            </h4>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              height: '10px', 
              borderRadius: '5px', 
              overflow: 'hidden',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                flex: paginatedPatients.filter(p => {
                  const age = calculateAge(p.date_of_birth);
                  return age !== '--' && age < 18;
                }).length || 1,
                backgroundColor: '#f59e0b',
                height: '100%'
              }} />
              <div style={{
                flex: paginatedPatients.filter(p => {
                  const age = calculateAge(p.date_of_birth);
                  return age !== '--' && age >= 18 && age < 65;
                }).length || 1,
                backgroundColor: '#3b82f6',
                height: '100%'
              }} />
              <div style={{
                flex: paginatedPatients.filter(p => {
                  const age = calculateAge(p.date_of_birth);
                  return age !== '--' && age >= 65;
                }).length || 1,
                backgroundColor: '#10b981',
                height: '100%'
              }} />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#f59e0b', fontWeight: 500 }}>
                Child: {paginatedPatients.filter(p => {
                  const age = calculateAge(p.date_of_birth);
                  return age !== '--' && age < 18;
                }).length}
              </span>
              <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                Adult: {paginatedPatients.filter(p => {
                  const age = calculateAge(p.date_of_birth);
                  return age !== '--' && age >= 18 && age < 65;
                }).length}
              </span>
              <span style={{ color: '#10b981', fontWeight: 500 }}>
                Senior: {paginatedPatients.filter(p => {
                  const age = calculateAge(p.date_of_birth);
                  return age !== '--' && age >= 65;
                }).length}
              </span>
            </div>
          </StatsCard>

          <StatsCard>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: '#1f2937', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: 600
            }}>
              <FaStethoscope style={{ color: '#ef4444' }} /> Clinical Priority
            </h4>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              height: '10px', 
              borderRadius: '5px', 
              overflow: 'hidden',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                flex: paginatedPatients.filter(p => p.priority === 'emergency').length || 1,
                backgroundColor: '#ef4444',
                height: '100%'
              }} />
              <div style={{
                flex: paginatedPatients.filter(p => p.priority === 'urgent').length || 1,
                backgroundColor: '#f59e0b',
                height: '100%'
              }} />
              <div style={{
                flex: paginatedPatients.filter(p => p.priority === 'routine' || !p.priority).length || 1,
                backgroundColor: '#10b981',
                height: '100%'
              }} />
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.85rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#ef4444', fontWeight: 500 }}>
                Emergency: {paginatedPatients.filter(p => p.priority === 'emergency').length}
              </span>
              <span style={{ color: '#f59e0b', fontWeight: 500 }}>
                Urgent: {paginatedPatients.filter(p => p.priority === 'urgent').length}
              </span>
              <span style={{ color: '#10b981', fontWeight: 500 }}>
                Routine: {paginatedPatients.filter(p => p.priority === 'routine' || !p.priority).length}
              </span>
            </div>
          </StatsCard>
        </StatsSummary>

        <PaginationContainer>
          <span style={{ 
            fontSize: '0.85rem', 
            color: '#6b7280',
            fontWeight: 500
          }}>
            {showingText}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ActionButton
              $bgColor={currentPage === 1 ? '#f3f4f6' : tabConfig.lightColor}
              $hoverColor={tabConfig.color}
              $hoverTextColor="white"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              style={{
                color: currentPage === 1 ? '#d1d5db' : tabConfig.color,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
              aria-label="Previous page"
            >
              <BsArrowLeft />
            </ActionButton>
            <span style={{ 
              fontSize: '0.85rem', 
              color: '#6b7280', 
              minWidth: '100px', 
              textAlign: 'center',
              fontWeight: 500
            }}>
              Page {currentPage} of {totalPages}
            </span>
            <ActionButton
              $bgColor={currentPage === totalPages || totalPages === 0 ? '#f3f4f6' : tabConfig.lightColor}
              $hoverColor={tabConfig.color}
              $hoverTextColor="white"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              style={{
                color: currentPage === totalPages || totalPages === 0 ? '#d1d5db' : tabConfig.color,
                cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer'
              }}
              aria-label="Next page"
            >
              <BsArrowRight />
            </ActionButton>
          </div>
        </PaginationContainer>
      </div>
    );
  };

  return (
    <Container>
      <TabContainer>
        <TabButton
          onClick={() => setActiveTab('today')}
          $active={activeTab === 'today'}
          $color="#3b82f6"
        >
          <FaCalendarAlt />
          Today
          {activeTab === 'today' && (
            <CountBadge $color="#3b82f6">
              {filterConfirmedPatients(dashboardData.patientsToday).length}
            </CountBadge>
          )}
        </TabButton>
        <TabButton
          onClick={() => setActiveTab('tomorrow')}
          $active={activeTab === 'tomorrow'}
          $color="#8b5cf6"
        >
          <BsCalendar2Week />
          Tomorrow
          {activeTab === 'tomorrow' && (
            <CountBadge $color="#8b5cf6">
              {filterConfirmedPatients(dashboardData.patientsTomorrow).length}
            </CountBadge>
          )}
        </TabButton>
        <TabButton
          onClick={() => setActiveTab('nextWeek')}
          $active={activeTab === 'nextWeek'}
          $color="#10b981"
        >
          <BsGraphUp />
          Next Week
          {activeTab === 'nextWeek' && (
            <CountBadge $color="#10b981">
              {filterConfirmedPatients(dashboardData.nextWeekPatients).length}
            </CountBadge>
          )}
        </TabButton>
      </TabContainer>
      
      {getPaginatedPatients().length === 0 ? renderEmptyState() : renderPatientList()}
    </Container>
  );
};

export default UpcomingScheduleOverview;