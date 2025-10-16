import React from 'react';
import styled from 'styled-components';
import { 
  FaCalendarDay, 
  FaUserInjured, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaInfoCircle,
  FaRegCalendarCheck,
  FaPills,
  FaArrowRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  border-radius: 16px;
  width: 80%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  color: #1e1b4b;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    color: #475569;
    background-color: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const ScheduleCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    border-color: #c7d2fe;
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const PatientAvatar = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background-color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  color: #4f46e5;
  font-weight: bold;
  font-size: 1.25rem;
`;

const PatientDetails = styled.div`
  flex: 1;
`;

const PatientName = styled.h4`
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
`;

const PatientHN = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const ScheduleDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DetailIcon = styled.div`
  color: #64748b;
  font-size: 1rem;
  width: 1.5rem;
  display: flex;
  justify-content: center;
`;

const DetailText = styled.div`
  flex: 1;
  color: #475569;
  font-size: 0.95rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
  background-color: ${props => {
    if (props.status === 'confirmed') return '#d1fae5';
    if (props.status === 'cancelled') return '#fee2e2';
    return '#e0e7ff';
  }};
  color: ${props => {
    if (props.status === 'confirmed') return '#065f46';
    if (props.status === 'cancelled') return '#b91c1c';
    return '#3730a3';
  }};
`;

const PrescribeButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;

  &:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
  background-color: #f8fafc;
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
  width: 100%;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: #cbd5e1;
`;

const EmptyStateTitle = styled.h4`
  margin: 0;
  font-size: 1.5rem;
  color: #475569;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const EmptyStateMessage = styled.p`
  margin: 0;
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.5;
`;

const PatientScheduleModal = ({ show, onClose, patients }) => {
  const navigate = useNavigate();

  if (!show) return null;

  // Filter patients with confirmed status
  const confirmedPatients = patients.filter(
    patient => patient.confirmation_status === 'confirmed'
  );

  // Format time from datetime string
  const formatTime = (datetimeString) => {
    const date = new Date(datetimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrescribe = (patient) => {
    navigate('/doctor/prescription', { state: { patient } });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaCalendarDay /> Today's Patient Schedule
          </ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {confirmedPatients.length > 0 ? (
            <ScheduleGrid>
              {confirmedPatients.map((patient) => (
                <ScheduleCard key={`${patient.patientID}-${patient.schedule_id}`}>
                  <PatientInfo>
                    <PatientAvatar>
                      {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                    </PatientAvatar>
                    <PatientDetails>
                      <PatientName>
                        {patient.first_name} {patient.last_name}
                      </PatientName>
                      <PatientHN>
                        HN: {patient.hospitalNumber || 'N/A'}
                      </PatientHN>
                    </PatientDetails>
                  </PatientInfo>
                  
                  <ScheduleDetails>
                    <DetailRow>
                      <DetailIcon>
                        <FaClock />
                      </DetailIcon>
                      <DetailText>
                        Appointment Time: {formatTime(patient.appointment_time)}
                      </DetailText>
                    </DetailRow>
                    
                    <DetailRow>
                      <DetailIcon>
                        <FaRegCalendarCheck />
                      </DetailIcon>
                      <DetailText>
                        Status: Confirmed
                        <StatusBadge status="confirmed">Confirmed</StatusBadge>
                      </DetailText>
                    </DetailRow>
                  </ScheduleDetails>

                  <PrescribeButton onClick={() => handlePrescribe(patient)}>
                    <FaPills /> Add Prescription <FaArrowRight />
                  </PrescribeButton>
                </ScheduleCard>
              ))}
            </ScheduleGrid>
          ) : (
            <EmptyState>
              <EmptyStateIcon>
                <FaInfoCircle />
              </EmptyStateIcon>
              <EmptyStateTitle>No Confirmed Appointments Today</EmptyStateTitle>
              <EmptyStateMessage>
                There are no confirmed patient appointments scheduled for today.
              </EmptyStateMessage>
            </EmptyState>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PatientScheduleModal;