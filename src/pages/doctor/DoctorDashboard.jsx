import React, { useEffect, useState, useMemo } from "react";
import { FaCheck, FaClock } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { 
  FaUserInjured, 
  FaProcedures, 
  FaCheckCircle, 
  FaSearch, 
  FaPrescription, 
  FaFileUpload, 
  FaFlask, 
  FaCalendarAlt,
  FaInfoCircle,
  FaFilter,
  FaExchangeAlt,
  FaUserMd,
  FaStethoscope,
  FaChevronRight,
  FaChevronLeft,
  FaRegClock,
  FaChartLine,
  FaNotesMedical
} from 'react-icons/fa';
import { MdClose, MdOutlineSick } from 'react-icons/md';
import { GiHealthNormal, GiMedicines } from 'react-icons/gi';
import { BsGraphUp, BsCalendar2Week, BsCalendar2Month } from 'react-icons/bs';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { TbReportMedical } from 'react-icons/tb';
import DoctorSidebar from './DoctorSidebar';
import Notification from '../../components/Notification';
import Calendar from "../../components/Calendar/calendar";
import doctorPic from "../../assets/images/picDoc.png";
import PatientAvatar from '../../components/PatientAvatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as S from './DoctorDashboardStyles';
import PatientDetailsModal from './Patient_Details';
import TodayStatusModal from './TodayStatusModal';
import CheckupToday from './CheckupToday'; // Import the CheckupToday component

const API_BASE_URL = 'http://localhost:8000/api';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    patientsToday: [],
    patientsTomorrow: [],
    nextWeekPatients: [],
    nextMonthPatients: [],
    allSchedules: [],
    upcomingAppointments: [],
    confirmedPatients: [],
    rescheduledPatients: [],
    nextPatient: null,
    patientStats: []
  });
  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [todaySearchTerm, setTodaySearchTerm] = useState("");
  const [tomorrowSearchTerm, setTomorrowSearchTerm] = useState("");
  const [nextWeekSearchTerm, setNextWeekSearchTerm] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [dateFilter, setDateFilter] = useState('all');
  const [apiErrors, setApiErrors] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCheckupToday, setShowCheckupToday] = useState(true); // Set to true to always show
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("No authentication data found");
        }

        if (userData.userLevel === 'patient') {
          throw new Error("Patients cannot access this dashboard");
        }

        setUser(userData);
        await fetchDashboardData(userData.userID);
        
        // Check if status needs to be confirmed
        const today = new Date().toLocaleDateString();
        const lastStatusUpdate = localStorage.getItem('lastStatusUpdate');
        
        if ((userData.TodaysStatus !== 'in Duty' && userData.TodaysStatus !== 'on duty') || 
            (lastStatusUpdate !== today && !userData.isAdmin)) {
          setShowStatusModal(true);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setNotification({
          message: error.message || "Session expired. Please login again.",
          type: 'error',
        });
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchWithErrorHandling = async (url, options) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }
      return await response.json();
    } catch (error) {
      setApiErrors(prev => [...prev, error.message]);
      throw error;
    }
  };

  const fetchDashboardData = async (doctorId) => {
    try {
      setLoading(true);
      setError(null);
      setApiErrors([]);
      
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/doctor/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
      
      const allSchedules = data.allSchedules || [];
      const appointments = data.appointments || [];
      
      const patientsToday = allSchedules.filter(schedule => 
        schedule.appointment_date && 
        schedule.appointment_date.split('T')[0] === today
      );

      const patientsTomorrow = allSchedules.filter(schedule => 
        schedule.appointment_date && 
        schedule.appointment_date.split('T')[0] === tomorrow
      );

      const nextWeekPatients = allSchedules.filter(schedule => {
        if (!schedule.appointment_date) return false;
        const scheduleDate = new Date(schedule.appointment_date);
        const today = new Date();
        const nextWeek = new Date(today.setDate(today.getDate() + 7));
        return scheduleDate >= new Date() && scheduleDate <= nextWeek;
      });

      const nextMonthPatients = allSchedules.filter(schedule => {
        if (!schedule.appointment_date) return false;
        const scheduleDate = new Date(schedule.appointment_date);
        const today = new Date();
        const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
        return scheduleDate >= new Date() && scheduleDate <= nextMonth;
      });

      const nextPatient = allSchedules
        .filter(schedule => 
          schedule.appointment_date &&
          new Date(schedule.appointment_date) >= new Date() && 
          schedule.checkup_status !== 'Completed'
        )
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0] || null;

      setDashboardData({
        patientsToday,
        patientsTomorrow,
        nextWeekPatients,
        nextMonthPatients,
        allSchedules,
        upcomingAppointments: appointments,
        confirmedPatients: data.confirmedPatients || [],
        rescheduledPatients: data.rescheduledPatients || [],
        nextPatient,
        patientStats: data.patientStats || []
      });

      setStats({
        pending: data.counts?.pending || 0,
        in_progress: data.counts?.in_progress || 0,
        completed: data.counts?.completed || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || "Failed to load dashboard data");
      setNotification({
        message: error.message || "Failed to load dashboard data",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTodayPatients = useMemo(() => {
    return dashboardData.patientsToday.filter(patient => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      return fullName.includes(todaySearchTerm.toLowerCase());
    });
  }, [dashboardData.patientsToday, todaySearchTerm]);

  const filteredTomorrowPatients = useMemo(() => {
    return dashboardData.patientsTomorrow.filter(patient => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      return fullName.includes(tomorrowSearchTerm.toLowerCase());
    });
  }, [dashboardData.patientsTomorrow, tomorrowSearchTerm]);

  const filteredNextWeekPatients = useMemo(() => {
    return (dashboardData.nextWeekPatients || []).filter(patient => {
      const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      return fullName.includes(nextWeekSearchTerm.toLowerCase());
    });
  }, [dashboardData.nextWeekPatients, nextWeekSearchTerm]);

  const patientStatsData = useMemo(() => {
    if (!dashboardData.patientStats || dashboardData.patientStats.length === 0) {
      return [];
    }

    const statsByMonth = dashboardData.patientStats.reduce((acc, stat) => {
      const month = new Date(stat.month).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + stat.count;
      return acc;
    }, {});

    return Object.entries(statsByMonth).map(([month, count]) => ({
      name: month,
      patients: count
    }));
  }, [dashboardData.patientStats]);

  const handlePrescribe = (patient) => {
    navigate('/doctor/PrescriptionPage', { state: { patient } });
  };

  const handleViewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleMarkAsCompleted = async (patientId) => {
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/doctor/mark-completed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ patient_id: patientId })
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to mark as completed');
      }

      setNotification({
        message: 'Patient marked as completed successfully',
        type: 'success'
      });

      await fetchDashboardData(user.userID);
    } catch (error) {
      setNotification({
        message: error.message || "Failed to mark as completed",
        type: 'error'
      });
    }
  };

  const handleApproveReschedule = async (scheduleId, approve) => {
    try {
      const data = await fetchWithErrorHandling(`${API_BASE_URL}/doctor/approve-reschedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          schedule_id: scheduleId,
          approve: approve 
        })
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to process reschedule request');
      }

      setNotification({
        message: `Reschedule request ${approve ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });

      await fetchDashboardData(user.userID);
    } catch (error) {
      setNotification({
        message: error.message || "Failed to process reschedule request",
        type: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysDifference = (appointmentDate) => {
    if (!appointmentDate) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointment = new Date(appointmentDate);
    appointment.setHours(0, 0, 0, 0);
    const diffTime = appointment - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const filteredAppointments = (dashboardData.upcomingAppointments || []).filter(appointment => {
    const fullName = `${appointment.first_name} ${appointment.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <S.LoadingContainer>
      <S.LoadingSpinner />
      <S.LoadingText>
        Good Day Doc, wait for a second!<S.LoadingDots>......</S.LoadingDots>
      </S.LoadingText>
    </S.LoadingContainer>;
  }

  if (error) {
    return (
      <S.ErrorContainer>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <S.RetryButton onClick={() => window.location.reload()}>Try Again</S.RetryButton>
      </S.ErrorContainer>
    );
  }

  if (!user) return null;

  if (user && (user.TodaysStatus === 'off duty' || !user.TodaysStatus) && !showStatusModal) {
    return (
      <S.ErrorContainer>
        <h3>Access Restricted</h3>
        <p>You must confirm your duty status to access the dashboard.</p>
        <S.RetryButton onClick={() => window.location.reload()}>Try Again</S.RetryButton>
      </S.ErrorContainer>
    );
  }

  const userInitials = user ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}` : '';
  const doctorTitle = user.gender === 'Female' ? 'Dra.' : 'Dr.';
  const doctorName = `${doctorTitle} ${user.first_name} ${user.last_name}`;

  return (
    <S.DashboardContainer>
      <DoctorSidebar user={user} />
      
      <S.MainContent>
        <S.Header>
          <div>
            <S.Title>
              <FaUserMd style={{ color: '#477977' }} />
              CAPD Provider Homepage
            </S.Title>
            <S.DateTime>
              <FaRegClock style={{ fontSize: '0.8rem' }} />
              {currentDateTime.toLocaleTimeString()}, {currentDateTime.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </S.DateTime>
          </div>
          
          <S.HeaderActions>
            <S.UserProfile>
              <S.UserAvatar>{userInitials}</S.UserAvatar>
              <div>
                <S.UserName>{doctorName}</S.UserName>
                <S.UserRole>Doctor</S.UserRole>
              </div>
            </S.UserProfile>
          </S.HeaderActions>
        </S.Header>

        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={closeNotification}
          />
        )}

        {apiErrors.length > 0 && (
          <S.ErrorContainer>
            <h4>API Errors:</h4>
            <ul>
              {apiErrors.map((error, index) => (
                <li key={`api-error-${index}`}>{error}</li>
              ))}
            </ul>
          </S.ErrorContainer>
        )}

        <S.WelcomeBanner>
          <S.WelcomeContent>
            <h2>Good day, {doctorName}!</h2>
            <S.WelcomeMessage>
              Your expertise and care make a difference in every patient's life—keep up the excellent work!
            </S.WelcomeMessage>
            <S.WelcomeStats>
              <div>
                <FaStethoscope />
                <span>{dashboardData.patientsToday.length} patients scheduled today</span>
              </div>
              <div>
                <FaCalendarAlt />
                <span>{dashboardData.patientsTomorrow.length} patients scheduled tomorrow</span>
              </div>
            </S.WelcomeStats>
          </S.WelcomeContent>
          <S.DoctorImage src={doctorPic} alt="Doctor illustration" />
        </S.WelcomeBanner>

        {/* Display CheckupToday component directly without button */}
        {showCheckupToday && (
          <CheckupToday onClose={() => setShowCheckupToday(false)} />
        )}
      </S.MainContent>
      
      <S.Sidebar>
        {dashboardData.nextPatient && (
          <S.NextPatientCard>
            <h3>
              <FaUserInjured style={{ color: '#477977', fontSize: '0.9rem' }} />
              Upcoming Checkup Date
            </h3>

            <S.NextPatientActions style={{ justifyContent: 'space-between', paddingTop: '0.5rem' }}>
              <div>
                <FaCalendarAlt />
                {formatDate(dashboardData.nextPatient.appointment_date)}
              </div>
              <div>
              </div>
            </S.NextPatientActions>
          </S.NextPatientCard>
        )}

        <S.AppointmentsCard>
          <S.AppointmentsHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3>
                <FaCalendarAlt style={{ color: '#477977', fontSize: '0.9rem' }} />
                Scheduled Patients Overview
              </h3>
              <S.PatientCountBadge>
                {filteredAppointments.filter(a => a.confirmation_status === 'confirmed').length} confirmed
              </S.PatientCountBadge>
            </div>
            <S.SearchContainer>
              <FaSearch />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </S.SearchContainer>
          </S.AppointmentsHeader>
          
          <S.AppointmentsList>
            {filteredAppointments.length > 0 ? (
              <S.AppointmentsTable>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Confirmation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => {
                    const daysDifference = getDaysDifference(appointment.appointment_date);
                    const appointmentDate = new Date(appointment.appointment_date);
                    const isConfirmed = appointment.confirmation_status === 'confirmed';
                    const uniqueKey = `appointment-${appointment.patientID}-${appointment.appointment_date}-${index}`;

                    return (
                      <tr 
                        key={uniqueKey}
                        onClick={() => handleViewPatientDetails(appointment)}
                        style={{ 
                          opacity: isConfirmed ? 1 : 0.7,
                          backgroundColor: isConfirmed ? '#f5f5f5' : 'transparent'
                        }}
                      >
                        <td>
                          {appointment.first_name} {appointment.last_name}
                          {!isConfirmed && <S.PendingBadge>Pending</S.PendingBadge>}
                        </td>
                        <td>
                          {daysDifference === 0 ? (
                            <>
                              <S.TodayIndicator />
                              Today
                            </>
                          ) : daysDifference === 1 ? (
                            <>
                              <S.TomorrowIndicator />
                              Tomorrow
                            </>
                          ) : (
                            appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          )}
                        </td>
                        <td>
                          {isConfirmed ? (
                            <S.ConfirmedBadge>
                              <FaCheck style={{ fontSize: '0.7rem' }} />
                              Confirmed
                            </S.ConfirmedBadge>
                          ) : (
                            <S.PendingBadge>
                              <FaClock style={{ fontSize: '0.7rem' }} />
                              Pending
                            </S.PendingBadge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </S.AppointmentsTable>
            ) : (
              <S.EmptyAppointments>
                <div>
                  <FaCalendarAlt />
                </div>
                <div>
                  {searchTerm ? 'No matching appointments' : 'No Upcoming Appointments'}
                </div>
                <p>
                  {searchTerm ? 
                    'No patients match your search criteria' : 
                    'There are no upcoming appointments in the next 7 days.'}
                </p>
              </S.EmptyAppointments>
            )}
          </S.AppointmentsList>
        </S.AppointmentsCard>

        <S.CalendarCard>
          <h3>
            <BsGraphUp style={{ color: '#477977', fontSize: '0.9rem' }} />
            Calendar
          </h3>
          <div>
            <Calendar 
              events={(dashboardData.upcomingAppointments || []).map(appointment => ({
                title: `${appointment.first_name} ${appointment.last_name}`,
                start: new Date(appointment.appointment_date),
                end: new Date(new Date(appointment.appointment_date).getTime() + 30 * 60000),
                allDay: false,
                extendedProps: {
                  patientId: appointment.patientID
                }
              }))}
              onEventClick={(event) => {
                const patient = dashboardData.upcomingAppointments.find(
                  appt => appt.patientID === event.event.extendedProps.patientId
                );
                if (patient) handleViewPatientDetails(patient);
              }}
            />
          </div>
        </S.CalendarCard>
      </S.Sidebar>

      {showPatientModal && (
        <PatientDetailsModal
          patient={selectedPatient} 
          onClose={() => setShowPatientModal(false)} 
        />
      )}

      {showStatusModal && (
        <TodayStatusModal 
          onConfirm={(updatedUser) => {
            setUser(updatedUser);
            setShowStatusModal(false);
          }}
        />
      )}
    </S.DashboardContainer>
  );
};

export default DoctorDashboard;