import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaUserInjured, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaSearch, 
  FaUserClock,
  FaExchangeAlt,
  FaInfoCircle,
  FaChartLine,
  FaSync,
  FaQuoteLeft,
  FaPlus,
  FaChevronRight,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaBell,
  FaClipboardList,
  FaEye,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaListOl 
} from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { BsGraphUp } from 'react-icons/bs';
import StaffSidebar from './StaffSidebar';
import Notification from '../../components/Notification';
import staffPic from "../../assets/images/staffPic.png";
import PatientSections from './PatientSections';
import PatientDetailsModal from '../doctor/Patient_Details';
import MissedAppointmentsNotification from './MissedAppointmentsNotification';
import { format, addDays } from 'date-fns';
import StatusSummaryCard from './StatusSummaryCard';
import TodayStatusModal from './TodayStatusModal';
import styled from 'styled-components';
import QueueModal from './QueueModal';
import CompletedCheckupsModal from './CompletedCheckupsModal';

//e-commerce part (staff_ecommerce folder)
import GotoEcommerce from './Staff_ecommerce/GotoEcommerce';

const API_BASE_URL = 'http://localhost:8000/api';

const StaffDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    patientsToday: [],
    patientsTomorrow: [],
    nextWeekPatients: [],
    upcomingAppointments: [],
    confirmedPatients: [],
    rescheduledPatients: [],
    allSchedules: [],
    patientStats: [],
    counts: {
      pending: 0,
      completed: 0,
      rescheduled: 0,
      unrescheduled: 0,
      yesterday_unrescheduled: 0
    }
  });
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    rescheduled: 0,
    missed: 0
  });
  const [showMissedNotification, setShowMissedNotification] = useState(false);
  const [missedCount, setMissedCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [todaySearchTerm, setTodaySearchTerm] = useState("");
  const [tomorrowSearchTerm, setTomorrowSearchTerm] = useState("");
  const [nextWeekSearchTerm, setNextWeekSearchTerm] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('today');
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [newMissedAlert, setNewMissedAlert] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedCheckups, setCompletedCheckups] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showQueueModal, setShowQueueModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkMissedAppointments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/staff/missed-appointments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        if (response.data.appointments && response.data.appointments.length > 0) {
          const yesterdayCount = response.data.appointments.filter(app => 
            new Date(app.appointment_date).toDateString() === 
            new Date(Date.now() - 86400000).toDateString()
          ).length;
          
          if (yesterdayCount > 0 || response.data.appointments.length > 0) {
            setNewMissedAlert(true);
          }
        }
      } catch (error) {
        console.error("Error checking missed appointments:", error);
      }
    };

    const interval = setInterval(checkMissedAppointments, 60000);
    checkMissedAppointments();
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("No authentication data found");
        }

        if (!['nurse', 'staff'].includes(userData.userLevel)) {
          throw new Error("Unauthorized access level");
        }

        setUser(userData);
        await fetchDashboardData();
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

  useEffect(() => {
    if (user) {
      checkTodaysStatus();
    }
  }, [user]);

  const fetchCompletedCheckups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/completed-checkups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      setCompletedCheckups(response.data.completedCheckups || []);
      setPrescriptions(response.data.prescriptions || []);
      setCompletedCount(response.data.completedCheckups?.length || 0);
      setShowCompletedModal(true);
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to fetch completed checkups",
        type: 'error'
      });
    }
  };

  const checkTodaysStatus = async () => {
    try {
      const today = new Date().toLocaleDateString();
      const lastStatusUpdate = localStorage.getItem('lastStatusUpdate');
      
      const isAdminUser = user.userLevel === 'admin' || user.role === 'admin';
      
      if ((user.TodaysStatus !== 'in Duty' && user.TodaysStatus !== 'on duty') || 
          (lastStatusUpdate !== today && !isAdminUser)) {
        setShowStatusModal(true);
      }
      
      setIsCheckingStatus(false);
    } catch (error) {
      console.error('Error checking status:', error);
      setIsCheckingStatus(false);
    }
  };

  const handleConfirmDuty = async () => {
    try {
      setStatusUpdateLoading(true);
      setStatusUpdateError(null);
      
      const response = await axios.post(`${API_BASE_URL}/staff/update-status`, 
        { status: 'in Duty' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = response.data;

      if (!response.status === 200) {
        throw new Error(data.message || 'Failed to update status');
      }

      const updatedUser = { ...user, TodaysStatus: 'in Duty' };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      const today = new Date().toLocaleDateString();
      localStorage.setItem('lastStatusUpdate', today);
      
      setShowStatusModal(false);
    } catch (error) {
      console.error('Status update error:', error);
      setStatusUpdateError(error.message || 'Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleCancelDuty = async () => {
    try {
      setStatusUpdateLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/staff/update-status`, 
        { status: 'off duty' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = response.data;

      if (!response.status === 200) {
        throw new Error(data.message || 'Failed to update status');
      }

      const updatedUser = { ...user, TodaysStatus: 'off duty' };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setShowStatusModal(false);
      setNotification({
        message: 'You must be on duty to access the dashboard',
        type: 'error'
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error('Status update error:', error);
      setStatusUpdateError(error.message || 'Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/staff/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
      
      const allSchedules = response.data.allSchedules || [];
      
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

      const counts = response.data.counts || {
        pending: 0,
        completed: 0,
        rescheduled: 0,
        unrescheduled: 0,
        yesterday_unrescheduled: 0
      };

      setDashboardData({
        patientsToday,
        patientsTomorrow,
        nextWeekPatients,
        upcomingAppointments: response.data.upcomingAppointments || [],
        confirmedPatients: response.data.confirmedPatients || [],
        rescheduledPatients: response.data.rescheduledPatients || [],
        allSchedules,
        patientStats: response.data.patientStats || [],
        counts
      });

      setStats({
        pending: counts.pending || 0,
        completed: counts.completed || 0,
        rescheduled: response.data.rescheduledPatients?.length || 0,
        missed: counts.unrescheduled || 0
      });

      if (counts.yesterday_unrescheduled > 0 || counts.unrescheduled > 0) {
        setMissedCount(counts.unrescheduled);
        setShowMissedNotification(false);
        setNewMissedAlert(true);
      }

    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to fetch dashboard data",
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (patientId) => {
    try {
      await axios.post(`${API_BASE_URL}/staff/mark-completed`, 
        { patient_id: patientId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setNotification({
        message: 'Patient marked as completed successfully',
        type: 'success'
      });
      
      await fetchDashboardData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to mark as completed",
        type: 'error'
      });
    }
  };

  const handleApproveReschedule = async (scheduleId, approve) => {
    try {
      await axios.post(`${API_BASE_URL}/staff/approve-reschedule`, 
        { schedule_id: scheduleId, approve },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setNotification({
        message: `Reschedule request ${approve ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });
      
      await fetchDashboardData();
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to process reschedule request",
        type: 'error'
      });
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCloseNotification = () => {
    setNotification(null);
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

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const closePatientModal = () => {
    setShowPatientModal(false);
    setSelectedPatient(null);
  };

  const filteredAppointments = useMemo(() => {
    return dashboardData.upcomingAppointments.filter(appointment => {
      const fullName = `${appointment.first_name || ''} ${appointment.last_name || ''}`.toLowerCase();
      const hn = appointment.hospitalNumber ? appointment.hospitalNumber.toLowerCase() : '';
      return fullName.includes(searchTerm.toLowerCase()) || 
             hn.includes(searchTerm.toLowerCase());
    });
  }, [dashboardData.upcomingAppointments, searchTerm]);

  if (loading || isCheckingStatus) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#EEF0F5',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <div style={{
          width: 'clamp(50px, 10vw, 80px)',
          height: 'clamp(50px, 10vw, 80px)',
          border: '5px solid rgba(243, 243, 243, 0.6)',
          borderTop: '5px solid #395886',
          borderRight: '5px solid rgba(57, 88, 134, 0.7)',
          borderBottom: '5px solid rgba(57, 88, 134, 0.4)',
          borderRadius: '50%',
          animation: 'spin 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
          willChange: 'transform',
          boxShadow: '0 4px 12px rgba(57, 88, 134, 0.1)',
        }}></div>
        
        <p style={{
          color: '#395886',
          fontSize: 'clamp(16px, 3vw, 20px',
          fontWeight: 500,
          fontFamily: 'sans-serif',
          animation: 'fadePulse 1.5s ease-in-out infinite'
        }}>
          Wait for a second<span style={{
            display: 'inline-block',
            animation: 'dotPulse 1.5s infinite'
          }}>......</span>
        </p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadePulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          
          @keyframes dotPulse {
            0% { opacity: 0.2; transform: translateY(0); }
            20% { opacity: 1; transform: translateY(-3px); }
            40%, 100% { opacity: 0.2; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  if (user.TodaysStatus !== 'in Duty' && user.TodaysStatus !== 'on duty' && !showStatusModal) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#EEF0F5',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>Access Restricted</h3>
        <p style={{ color: '#4b5563', marginBottom: '24px' }}>
          You must confirm your duty status to access the dashboard.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#395886',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <StaffSidebar user={user} />
      
      <div style={{
        flex: 1,
        padding: '32px',
        marginLeft: '270px',
        transition: 'margin 0.3s ease',
        maxWidth: 'calc(100vw - 250px)',
        marginTop: '-300px',
      }}>
        <div style={{
          display: 'flex',
          gap: '32px',
          maxWidth: '1800px',
          margin: '0 auto',
          width: '95%',
          marginLeft: '-10px',
        }}>
          <div style={{
            flex: 3,
            minWidth: 0
          }}>
            {dashboardData.rescheduledPatients.length > 0 && (
              <div style={{
                backgroundColor: '#e8f4fd',
                borderLeft: '4px solid #3498db',
                padding: '16px 20px',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaExchangeAlt style={{ color: '#3498db', fontSize: '22px' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#2c3e50', fontSize: '15px' }}>
                      You have <strong>{dashboardData.rescheduledPatients.length} pending reschedule request(s)</strong>
                    </p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                      Please review and approve or reject these requests.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('rescheduled')}
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px'
                  }}
                >
                  <FaExchangeAlt /> View Requests
                </button>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '24px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>CAPD Medical Staff Homepage</h1>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: 0
                }}>
                  Stay organized with the CAPD staff dashboard—view patients, see schedules, and keep up with appointments.
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button 
                  onClick={fetchDashboardData}
                  style={{
                    backgroundColor: '#395886',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaSync /> Refresh
                </button>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#395886',
              borderRadius: '16px',
              padding: '24px',
              color: 'white',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                flex: 1,
                zIndex: 1
              }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  Good Day, <span style={{ fontWeight: '700' }}>{user.first_name}!</span>
                </h1>
                <p style={{
                  fontSize: '15px',
                  opacity: 0.9,
                  marginBottom: '20px',
                  maxWidth: '500px'
                }}>
                  Your dedication ensures every patient receives the care they deserve. 
                  You have <strong>{dashboardData.patientsToday.length}</strong> appointments today.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px'
                }}>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaUserInjured color="#fff" size={18} />
                    <span style={{ fontSize: '14px' }}>
                      {dashboardData.patientsToday.length} Today
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaCalendarAlt color="#fff" size={16} />
                    <span style={{ fontSize: '14px' }}>
                      {dashboardData.patientsTomorrow.length} Tomorrow
                    </span>
                  </div>
                </div>
              </div>
             
              <img src={staffPic} alt="staff" style={{
                width: '350px',
                height: '350px',
                objectFit: 'contain',
                zIndex: 1,
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <div style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                top: '-50px',
                right: '-50px'
              }}></div>
              <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                bottom: '-100px',
                right: '-100px'
              }}></div>
            </div>

            {/* Missed Appointments Notification */}
            {dashboardData.counts.unrescheduled > 0 && (
            <div style={{ 
              backgroundColor: '#e8f4fd',
              borderLeft: '4px solid #3498db',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaCalendarTimes style={{ color: '#3498db', fontSize: '22px' }} />
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#2c3e50', fontSize: '15px' }}>
                    <strong>{dashboardData.counts.unrescheduled} missed appointment(s)</strong> need to be rescheduled
                  </p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                    Patients have been notified via email about their new appointment dates.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMissedNotification(true)}
                style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                <FaCalendarTimes /> View Details
              </button>
            </div>
          )}

          {/* Queue Notification */}
          <div style={{ 
            backgroundColor: '#e8f4fd',
            borderLeft: '4px solid #3498db',
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaListOl style={{ color: '#3498db', fontSize: '22px' }} />
              <div>
                <p style={{ margin: 0, fontWeight: '600', color: '#2c3e50', fontSize: '15px' }}>
                  <strong>Patient Queue</strong> is available
                </p>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#2c3e50' }}>
                  View and manage today's patient queue
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowQueueModal(true)}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              View Queue
            </button>
          </div>

          {/* Queue Modal */}
          {showQueueModal && (
            <QueueModal onClose={() => setShowQueueModal(false)} />
          )}
            
            
            <PatientSections 
              dashboardData={dashboardData}
              stats={stats}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              todaySearchTerm={todaySearchTerm}
              setTodaySearchTerm={setTodaySearchTerm}
              tomorrowSearchTerm={tomorrowSearchTerm}
              setTomorrowSearchTerm={setTomorrowSearchTerm}
              nextWeekSearchTerm={nextWeekSearchTerm}
              setNextWeekSearchTerm={setNextWeekSearchTerm}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              handleMarkAsCompleted={handleMarkAsCompleted}
              handleApproveReschedule={handleApproveReschedule}
              calculateAge={calculateAge}
              formatDate={formatDate}
              navigate={navigate}
              fetchDashboardData={fetchDashboardData}
            />
          </div>

          <div style={{
            flex: 1,
            minWidth: '360px',
            maxWidth: '400px'
          }}>


            {/* Completed Checkups Section - Modern Card Layout */}
            <div style={{
              marginBottom: '28px',
              marginTop: '24px',
              width: '125%'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #bbf7d0',
                borderRadius: '20px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(34, 197, 94, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: '180px'
              }}
              onClick={fetchCompletedCheckups}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(34, 197, 94, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(34, 197, 94, 0.15)';
              }}
              >
                {/* Abstract background shapes */}
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                  zIndex: 0
                }}></div>
                
                <div style={{
                  position: 'absolute',
                  bottom: '-60px',
                  left: '-60px',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(34, 197, 94, 0.03) 100%)',
                  zIndex: 0
                }}></div>

                {/* Main content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  {/* Header section */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                    marginTop: '25px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div>
                        <h3 style={{
                          margin: 0,
                          fontSize: '22px',
                          fontWeight: 800,
                          color: '#064e3b',
                          letterSpacing: '-0.02em',
                          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>COMPLETED CHECKUPS</h3>
                        <p style={{
                          margin: '8px 0 0 0',
                          fontSize: '16px',
                          color: '#059669',
                          fontWeight: 500,
                          maxWidth: '400px',
                          lineHeight: 1.5
                        }}>
                        Patients with completed monthly checkup, ready for PD solution
                        </p>
                      </div>
                    </div>

                    {/* Counter badge */}
                    <div style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      padding: '16px 24px',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                      border: '2px solid #d1fae5',
                      minWidth: '100px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '42px',
                        fontWeight: 900,
                        color: '#065f46',
                        lineHeight: 1,
                        marginBottom: '4px',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}>{dashboardData.counts.completed || 0}</div>
                      <div style={{
                        fontSize: '14px',
                        color: '#059669',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>READY</div>
                    </div>
                  </div>

                  {/* Action section */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '16px',
                    border: '2px solid #bbf7d0',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#064e3b' }}>
                          Review patient details and Bag Distribution
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 24px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                      border: '2px solid transparent'
                    }}>
                      View
                      <FaArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </div>
                  </div>
                </div>

                {/* Corner accent */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, transparent 0%, transparent 50%, #10b981 50%, #059669 100%)',
                  borderBottomLeftRadius: '20px',
                  zIndex: 1
                }}></div>
              </div>
            </div>
          <StatusSummaryCard 
            confirmedCount={dashboardData.confirmedPatients ? dashboardData.confirmedPatients.length : 0}
            pendingCount={dashboardData.counts?.pending || 0}
            rescheduledCount={dashboardData.counts?.rescheduled || 0}
            missedCount={dashboardData.counts?.unrescheduled || 0}
            yesterdayMissedCount={dashboardData.counts?.yesterday_unrescheduled || 0}
            olderMissedCount={dashboardData.counts?.older_unrescheduled || 0}
            fetchDashboardData={fetchDashboardData}
          />       
            {/* Quick Actions Panel */}
          <GotoEcommerce 
            dashboardData={dashboardData}
            stats={stats}
            onViewQueue={() => setShowQueueModal(true)}
            onViewCompleted={fetchCompletedCheckups}
            onViewMissed={() => setShowMissedNotification(true)}
          />

          </div>
        </div>
      </div>

      {showPatientModal && (
        <PatientDetailsModal 
          patient={selectedPatient} 
          onClose={closePatientModal} 
        />
      )}
      
        {showCompletedModal && (
      <CompletedCheckupsModal 
        isOpen={showCompletedModal}
        onClose={() => setShowCompletedModal(false)}
        completedCheckups={completedCheckups}
        prescriptions={prescriptions}
        fetchDashboardData={fetchDashboardData}
      />
    )}

      
      {showMissedNotification && (
        <MissedAppointmentsNotification 
          onClose={() => setShowMissedNotification(false)}
          missedCount={missedCount}
          fetchDashboardData={fetchDashboardData}
        />
      )}

      {showStatusModal && (
        <TodayStatusModal 
          onConfirm={handleConfirmDuty}
          onCancel={handleCancelDuty}
          loading={statusUpdateLoading}
          error={statusUpdateError}
        />
      )}

      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
};

export default StaffDashboard;