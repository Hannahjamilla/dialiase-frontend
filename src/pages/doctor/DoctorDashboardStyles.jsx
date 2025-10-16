import styled from 'styled-components';
import { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

export const DashboardContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa;
  color: #2c3e50;
  min-height: 100vh;
  margin-top: -770px;
  width: 101%;
  margin-right: 80px;

  @media (max-width: 1200px) {
    flex-direction: column;
    padding: 1rem;
  }
`;

export const PatientCountBadge = styled.span`
  background-color: #477977;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
`;

export const ConfirmedBadge = styled.span`
  background-color: #e6f2f1;
  color: #477977;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const PendingBadge = styled.span`
  background-color: #fff8e6;
  color: #cc8e35;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const MainContent = styled.main`
  flex: 2.5;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 1200px) {
    margin-left: 0;
  }
`;

export const Sidebar = styled.div`
  flex: 1.3;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 1200px) {
    flex-direction: row;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0,0,0,0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  color: #395886;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const DateTime = styled.p`
  margin: 0.5rem 0 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const NotificationButton = styled.button`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
  }

  span {
    color: #2c3e50;
    font-size: 0.9rem;
  }
`;

export const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  }
`;

export const UserAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #395886 0%, #477977 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

export const UserName = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
`;

export const UserRole = styled.span`
  color: #7f8c8d;
  font-size: 0.75rem;
  display: block;
`;

export const ErrorContainer = styled.div`
  background: #ffebee;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border-left: 5px solid #f44336;
  animation: ${fadeIn} 0.3s ease-out;

  h3, h4 {
    margin-top: 0;
    color: #d32f2f;
    font-size: 1.1rem;
  }

  p {
    color: #d32f2f;
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }

  ul {
    margin-bottom: 0;
    padding-left: 1.5rem;
    font-size: 0.9rem;
  }

  li {
    color: #d32f2f;
    margin-bottom: 0.25rem;
  }
`;

export const RetryButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);

  &:hover {
    background: #d32f2f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  }
`;

export const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, #395886 0%, #2c3e50 100%);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  height: 240px;
  overflow: hidden;
  position: relative;
  margin-bottom: 2rem;
  animation: ${pulse} 8s ease-in-out infinite;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    text-align: center;
    padding: 2rem 1.5rem;
  }
`;

export const WelcomeContent = styled.div`
  max-width: 65%;
  z-index: 2;
  animation: ${fadeIn} 0.6s ease-out;

  h2 {
    margin: 0 0 1.25rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);

    @media (max-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  }

  @media (max-width: 768px) {
    max-width: 100%;
    margin-bottom: 1.5rem;
  }
`;

export const WelcomeMessage = styled.p`
  margin: 0 0 2rem 0;
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 80%;

  @media (max-width: 768px) {
    max-width: 100%;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
`;

export const WelcomeStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 500;

  div {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(5px);
    }

    svg {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const DoctorImage = styled.img`
  width: 45%; /* was 35% */
  height: auto;
  object-fit: contain;
  position: absolute;
  right: 2rem;
  bottom: 0;
  z-index: 1;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
  transition: all 0.5s ease;

  &:hover {
    transform: scale(1.05) rotate(-2deg);
  }

  @media (max-width: 768px) {
    position: relative;
    width: 70%; /* was 60% */
    right: auto;
    margin-top: 1rem;
  }
`;


export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.03);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

export const MetricIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${props => props.$background || '#f5f7fa'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #477977;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
`;

export const MetricContent = styled.div`
  flex: 1;
`;

export const MetricLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

export const MetricValue = styled.div`
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 700;
`;

export const ChartContainer = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid rgba(0,0,0,0.03);
`;

export const ScheduleTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 1.5rem;
`;

export const TabButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.active ? '#f0f7f7' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#477977' : 'transparent'};
  color: ${props => props.active ? '#477977' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.95rem;

  &:hover {
    background: #f0f7f7;
    color: #477977;
  }

  svg {
    font-size: 1rem;
  }
`;

export const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h3 {
    color: #395886;
    font-size: 1.25rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
  }
`;

export const TimeRangeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 0.5rem;
`;

export const TimeRangeButton = styled.button`
  padding: 0.5rem 1.25rem;
  background: ${props => props.$active ? '#477977' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#2c3e50'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#3a6361' : '#e0e8e8'};
  }
`;

export const ChartContent = styled.div`
  height: 280px;
`;

export const EmptyChart = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #7f8c8d;
  font-size: 0.95rem;
  padding: 2rem;
  text-align: center;

  svg {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  p {
    max-width: 300px;
    line-height: 1.6;
  }
`;

export const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ScheduleCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

export const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    color: #395886;
    font-size: 1.1rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
  }
`;

export const PatientCount = styled.span`
  background: #477977;
  color: white;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(71, 121, 119, 0.2);
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #477977;
    box-shadow: 0 0 0 3px rgba(71, 121, 119, 0.1);
  }

  svg {
    color: #7f8c8d;
    margin-right: 10px;
    font-size: 1rem;
  }

  input {
    border: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #2c3e50;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: #95a5a6;
    }
  }
`;

export const PatientList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.75rem;
  max-height: 400px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
`;

export const PatientItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.index % 2 === 0 ? '#f8f9fa' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
  
  &:hover {
    background: #f1f3f5;
    transform: translateX(5px);
  }
`;

export const PatientInfo = styled.div`
  flex: 1;
`;

export const PatientName = styled.p`
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
`;

export const PatientTime = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const PrescribeButton = styled.button`
  background: #477977;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(71, 121, 119, 0.2);
  
  &:hover {
    background: #395886;
    transform: scale(1.05);
  }
`;

export const NotesButton = styled.button`
  background: #f0f7f7;
  color: #477977;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e0efef;
    transform: scale(1.05);
  }
`;

export const EmptySchedule = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #7f8c8d;
  font-size: 0.95rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  svg {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  p {
    max-width: 200px;
    line-height: 1.6;
  }
`;

export const NextPatientCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  h3 {
    color: #395886;
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
  }
`;

export const NextPatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;

  div {
    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      color: #2c3e50;
      font-weight: 600;
    }

    p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
      color: #7f8c8d;
    }
  }
`;

export const NextPatientDetails = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;

  p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    color: #2c3e50;
    line-height: 1.6;
  }
`;

export const NextPatientActions = styled.div`
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;

  div:first-child {
    color: #477977;
    font-size: 0.95rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  div:last-child {
    display: flex;
    gap: 1rem;
  }
`;

export const StatusModal = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 0.4s ease-out;
`;

export const StatusModalHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  
  h3 {
    color: #477977;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

export const ModalBody = styled.div`
  p {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #555;
    font-size: 1rem;
    line-height: 1.6;
  }
`;

export const ConfirmButton = styled.button`
  background-color: #477977;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(71, 121, 119, 0.2);
  font-size: 1rem;
  margin-right: 1rem;

  &:hover {
    background-color: #36615f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(71, 121, 119, 0.3);
  }
`;

export const CancelButton = styled.button`
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover {
    background-color: #e5e5e5;
    transform: translateY(-2px);
  }
`;

export const DetailsButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: transparent;
  color: #477977;
  border: 1px solid #477977;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: #477977;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(71, 121, 119, 0.2);
  }
`;

export const PrescribeButtonMain = styled.button`
  padding: 0.75rem 1.25rem;
  background: #477977;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(71, 121, 119, 0.2);
  
  &:hover {
    background: #395886;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(71, 121, 119, 0.3);
  }
`;

export const AppointmentsCard = styled.div`
  background: linear-gradient(145deg, #ffffff, #f9fbfc);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 8px 20px rgba(57, 88, 134, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  max-height: 420px;
  min-height: 300px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 28px rgba(57, 88, 134, 0.15);
  }
`;

export const AppointmentsHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;

  h3 {
    color: #2c3e50;
    font-size: 1.05rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    letter-spacing: 0.3px;

    svg {
      color: #395886;
      font-size: 1.1rem;
    }
  }
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f6f8fa;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e0e6ed;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: #395886;
    box-shadow: 0 0 0 3px rgba(71, 121, 119, 0.15);
    background: #ffffff;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.9rem;
    color: #2c3e50;

    &::placeholder {
      color: #a0aab5;
      font-size: 0.82rem;
    }
  }

  svg {
    color: #395886;
    font-size: 1rem;
    margin-right: 0.5rem;
  }
`;

export const AppointmentsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 0.35rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c6cfd8;
    border-radius: 10px;
    transition: background 0.3s;

    &:hover {
      background: #a0aab5;
    }
  }
`;

export const AppointmentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  table-layout: fixed;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    word-wrap: break-word;
  }

  th {
    color: #395886;
    font-weight: 700;
    border-bottom: 2px solid #477977;
    position: sticky;
    top: 0;
    background: #f9fbfc;
    z-index: 2;
    font-size: 0.85rem;
    letter-spacing: 0.25px;
  }

  tr {
    transition: background-color 0.25s, transform 0.15s;

    &:hover {
      background-color: #f0f4f7;
      transform: scale(1.002);
    }
  }

  td:last-child {
    text-align: right;
    white-space: nowrap;
  }
`;

export const TodayIndicator = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #477977;
  display: inline-block;
  margin-right: 6px;
  box-shadow: 0 0 0 2px rgba(71, 121, 119, 0.15);
`;

export const TomorrowIndicator = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #395886;
  display: inline-block;
  margin-right: 6px;
  box-shadow: 0 0 0 2px rgba(57, 88, 134, 0.15);
`;

export const EmptyAppointments = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1.5rem;

  div:first-child {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #f3f6f9, #e9eef3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #adb5bd;
    font-size: 1.6rem;
    margin-bottom: 1rem;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  }

  div:nth-child(2) {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #7f8c8d;
    font-size: 0.85rem;
    max-width: 240px;
    line-height: 1.5;
    margin: 0;
  }
`;


export const CalendarCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  margin-top: 1.5rem;
  border: 1px solid rgba(0,0,0,0.03);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  h3 {
    color: #395886;
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
  }
`;

export const ModalOverlay = styled.div`
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
  backdrop-filter: blur(4px);
`;

export const ModalContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.4s ease-out;
`;

export const ModalHeader = styled.div`
  padding: 1.75rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  position: sticky;
  top: 0;
  z-index: 1;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #477977;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
  }
`;

export const ModalContent = styled.div`
  padding: 2rem;
  flex: 1;
`;

export const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  position: sticky;
  bottom: 0;
  z-index: 1;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #777;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: #333;
    transform: rotate(90deg);
  }
`;

export const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #477977;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(71, 121, 119, 0.2);
  font-weight: 500;

  &:hover {
    background-color: #3a6361;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(71, 121, 119, 0.3);
  }
`;

export const PatientProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
`;

export const PatientAvatarLarge = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #395886 0%, #477977 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
`;

export const NextAppointment = styled.div`
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const PatientNameLarge = styled.h4`
  margin: 0.75rem 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
`;

export const PatientId = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
`;

export const DetailsSection = styled.div`
  margin-bottom: 2rem;
`;

export const SectionTitle = styled.h5`
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #477977;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

export const DetailItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f1f3f5;
    transform: translateY(-3px);
  }
`;

export const DetailIcon = styled.div`
  color: #477977;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
`;

export const DetailLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

export const DetailValue = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
`;

export const AppointmentDetails = styled.div`
  background-color: #f0f7f6;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 5px solid #477977;
  margin-bottom: 2rem;
`;

export const AppointmentDateTime = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
`;

export const AppointmentStatus = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background-color: ${props => 
    props.$status === 'Completed' ? '#e8f5e9' : 
    props.$status === 'Cancelled' ? '#ffebee' : 
    props.$status === 'Rescheduled' ? '#fff8e1' : 
    '#e3f2fd'};
  color: ${props => 
    props.$status === 'Completed' ? '#388e3c' : 
    props.$status === 'Cancelled' ? '#d32f2f' : 
    props.$status === 'Rescheduled' ? '#ffa000' : 
    '#1976d2'};
`;

export const AppointmentNotes = styled.div`
  font-size: 0.95rem;
  color: #666;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  line-height: 1.6;

  svg {
    color: #477977;
    flex-shrink: 0;
    font-size: 1.1rem;
    margin-top: 0.2rem;
  }
`;

export const NoAppointment = styled.div`
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  color: #666;
  text-align: center;
  font-size: 0.95rem;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f8f9fa;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
`;

export const LoadingSpinner = styled.div`
  width: clamp(60px, 12vw, 90px);
  height: clamp(60px, 12vw, 90px);
  border: 6px solid rgba(243, 243, 243, 0.6);
  border-top: 6px solid #395886;
  border-right: 6px solid rgba(57, 88, 134, 0.7);
  border-bottom: 6px solid rgba(57, 88, 134, 0.4);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
  will-change: transform;
  box-shadow: 0 6px 18px rgba(57, 88, 134, 0.15);

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  color: #395886;
  font-size: clamp(18px, 4vw, 22px);
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  animation: fadePulse 1.5s ease-in-out infinite;
  margin-top: 2rem;
  text-align: center;
  max-width: 80%;
  line-height: 1.5;

  @keyframes fadePulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
`;

export const LoadingDots = styled.span`
  display: inline-block;
  animation: dotPulse 1.8s infinite;

  @keyframes dotPulse {
    0% { opacity: 0.2; transform: translateY(0); }
    20% { opacity: 1; transform: translateY(-4px); }
    40%, 100% { opacity: 0.2; transform: translateY(0); }
  }
`;