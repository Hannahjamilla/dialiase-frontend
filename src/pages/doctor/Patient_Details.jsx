import React from 'react';
import * as S from './DoctorDashboardStyles';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaEnvelope, 
  FaVenusMars,
  FaIdCard,
  FaNotesMedical,
  FaInfoCircle,
  FaTimes,
  FaRegClock
} from 'react-icons/fa';
import { GiHealthNormal } from 'react-icons/gi';

const PatientDetailsModal = ({ patient, onClose }) => {
  if (!patient) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  // Check if all demographic fields are empty/N/A
  const hasDemographicInfo = () => {
    return patient.gender || 
           patient.phone_number || 
           patient.date_of_birth || 
           patient.email;
  };

  return (
    <S.ModalOverlay>
      <S.ModalContainer>
        <S.ModalHeader>
          <h3>
            <FaUser /> Patient Details
          </h3>
          <S.CloseButton onClick={onClose}>
            <FaTimes />
          </S.CloseButton>
        </S.ModalHeader>

        <S.ModalContent>
          <S.PatientProfileSection>
            <S.PatientAvatarLarge>
              {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
            </S.PatientAvatarLarge>
            <S.PatientName>
              {patient.first_name} {patient.last_name}
            </S.PatientName>
            <S.PatientId>
              <FaIdCard /> HN: {patient.hospitalNumber || 'N/A'}
            </S.PatientId>
          </S.PatientProfileSection>

          {hasDemographicInfo() && (
            <S.DetailsSection>
              <S.SectionTitle>
                <FaUser /> Demographic Information
              </S.SectionTitle>
              
              <S.DetailsGrid>
                {patient.gender && (
                  <S.DetailItem>
                    <S.DetailIcon>
                      <FaVenusMars />
                    </S.DetailIcon>
                    <div>
                      <S.DetailLabel>Gender</S.DetailLabel>
                      <S.DetailValue>{patient.gender}</S.DetailValue>
                    </div>
                  </S.DetailItem>
                )}

                {patient.date_of_birth && (
                  <S.DetailItem>
                    <S.DetailIcon>
                      <GiHealthNormal />
                    </S.DetailIcon>
                    <div>
                      <S.DetailLabel>Age</S.DetailLabel>
                      <S.DetailValue>{getAge(patient.date_of_birth)} years</S.DetailValue>
                    </div>
                  </S.DetailItem>
                )}

                {patient.phone_number && (
                  <S.DetailItem>
                    <S.DetailIcon>
                      <FaPhone />
                    </S.DetailIcon>
                    <div>
                      <S.DetailLabel>Phone</S.DetailLabel>
                      <S.DetailValue>{patient.phone_number}</S.DetailValue>
                    </div>
                  </S.DetailItem>
                )}

                {patient.email && (
                  <S.DetailItem>
                    <S.DetailIcon>
                      <FaEnvelope />
                    </S.DetailIcon>
                    <div>
                      <S.DetailLabel>Email</S.DetailLabel>
                      <S.DetailValue>{patient.email}</S.DetailValue>
                    </div>
                  </S.DetailItem>
                )}
              </S.DetailsGrid>
            </S.DetailsSection>
          )}

          <S.DetailsSection>
            <S.SectionTitle>
              <FaCalendarAlt /> Current Appointment
            </S.SectionTitle>
            
            {patient.appointment_date ? (
              <S.AppointmentDetails>
                <S.AppointmentDateTime>
                  <FaRegClock style={{ marginRight: '8px' }} />
                  {formatDate(patient.appointment_date)}
                </S.AppointmentDateTime>
                <S.AppointmentStatus $status={patient.checkup_status}>
                  Status: {patient.checkup_status || 'Scheduled'}
                </S.AppointmentStatus>
              </S.AppointmentDetails>
            ) : (
              <S.NoAppointment>
                No current appointment scheduled
              </S.NoAppointment>
            )}
          </S.DetailsSection>

          <S.DetailsSection>
            <S.SectionTitle>
              <FaCalendarAlt /> Next Scheduled Appointment
            </S.SectionTitle>
            
            {patient.next_appointment ? (
              <S.AppointmentDetails>
                <S.AppointmentDateTime>
                  <FaCalendarAlt style={{ marginRight: '8px' }} />
                  {formatDate(patient.next_appointment)}
                </S.AppointmentDateTime>
              </S.AppointmentDetails>
            ) : (
              <S.NoAppointment>
                No upcoming appointments scheduled
              </S.NoAppointment>
            )}
          </S.DetailsSection>
        </S.ModalContent>

        <S.ModalFooter>
          <S.ModalButton onClick={onClose}>Close</S.ModalButton>
        </S.ModalFooter>
      </S.ModalContainer>
    </S.ModalOverlay>
  );
};

export default PatientDetailsModal;