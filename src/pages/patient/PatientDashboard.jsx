import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../css/PatientDashboard.css';
import Notification from '../../components/Notification';
import TermsAndConditions from '../../components/TermsAndConditions';
import DwellTimerModal from './DwellTimerModal';
import NewPatientWelcome from './NewPatientWelcome';
import PatientDashboardContent from './PatientDashboardContent';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiLogOut } from 'react-icons/fi';

const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ongoingTreatment, setOngoingTreatment] = useState(null);
  const [treatmentLoading, setTreatmentLoading] = useState(true);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [drainAlarm, setDrainAlarm] = useState(false);
  const [drainAlarmMessage, setDrainAlarmMessage] = useState('');
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [healthTips, setHealthTips] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState({
    completed: 0,
    remaining: 3,
    needsReminder: true
  });
  const [missedDays, setMissedDays] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [confirmationStatus, setConfirmationStatus] = useState(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showDwellTimer, setShowDwellTimer] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);
  const [currentDwellTime, setCurrentDwellTime] = useState(null);
  const [treatmentStartTime, setTreatmentStartTime] = useState(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightBg: '#F5F8FC',
    alert: '#FF6B6B',
    warning: '#FFA500',
    success: '#4CAF50',
    info: '#17a2b8',
    textMuted: '#6c757d'
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const checkPatientStatus = async () => {
      try {
        const response = await axios.get('/patient/status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setIsNewPatient(response.data.isNewPatient);
      } catch (error) {
        console.error('Error checking patient status:', error);
      }
    };

    if (user && termsAccepted) {
      checkPatientStatus();
    }
  }, [user, termsAccepted]);

  useEffect(() => {
    const checkOngoingTreatment = async () => {
      try {
        const dwellTime = localStorage.getItem('currentDwellTime');
        const startTime = localStorage.getItem('treatmentStartTime');
        
        if (dwellTime && startTime) {
          setCurrentDwellTime(parseInt(dwellTime));
          setTreatmentStartTime(new Date(startTime));
          setShowDwellTimer(true);
        }
      } catch (error) {
        console.error('Error checking ongoing treatment:', error);
      }
    };

    checkOngoingTreatment();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkTerms = async () => {
      try {
        const response = await axios.get('/patient/terms-status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.AccStatus === 'pending' || response.data.TermsAndCondition !== 'agreed') {
          setTermsAccepted(false);
        } else {
          setTermsAccepted(true);
        }
      } catch (error) {
        console.error('Error checking terms status:', error);
      }
    };

    if (user) {
      checkTerms();
    }
  }, [user]);

  const convertToPHTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Date(date.getTime() + (8 * 60 * 60 * 1000));
  };

  const fetchConfirmationStatus = async () => {
    try {
      const response = await axios.get('/patient/confirmation-status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setConfirmationStatus(response.data);
      if (response.data.requiresConfirmation) {
        setReminders(prev => [...prev, {
          id: 'confirmation-reminder',
          type: 'urgent',
          message: `Please confirm your appointment for ${formatDateOnly(response.data.appointmentDate)}`,
          action: () => navigate('/confirm-appointment')
        }]);
      }
    } catch (error) {
      console.error('Error fetching confirmation status:', error);
    }
  };

  const fetchDailyLimitStatus = async (date) => {
    try {
      const response = await axios.get('/patient/daily-limit-status', {
        params: { date },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDailyLimitReached(response.data.limitReached);
    } catch (error) {
      console.error('Error fetching daily limit status:', error);
    }
  };

  const calculateMissedDays = useCallback((treatments) => {
    if (treatments.length === 0) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pastWeekDates = [];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      pastWeekDates.push(date);
    }

    const missedDaysList = pastWeekDates.filter(date => {
      const treatmentsOnDate = treatments.filter(treatment => {
        const treatmentDate = convertToPHTime(treatment.treatmentDate);
        return (
          treatmentDate.getDate() === date.getDate() &&
          treatmentDate.getMonth() === date.getMonth() &&
          treatmentDate.getFullYear() === date.getFullYear() &&
          treatment.TreatmentStatus.toLowerCase() === 'completed'
        );
      });
      return treatmentsOnDate.length < 3;
    });

    return missedDaysList;
  }, []);

  const checkDrainTime = useCallback(() => {
    if (!ongoingTreatment?.outSolution?.DrainStarted || ongoingTreatment.outSolution.DrainFinished) {
      setDrainAlarm(false);
      return;
    }

    const now = new Date();
    const drainTime = convertToPHTime(ongoingTreatment.outSolution.DrainStarted);
    const dwellTimeHours = ongoingTreatment.inSolution?.Dwell || 0;
    
    const expectedDrainTime = new Date(drainTime.getTime() + (dwellTimeHours * 60 * 60 * 1000));
    const warningTime = new Date(expectedDrainTime.getTime() - (15 * 60 * 1000));
    
    if (now >= expectedDrainTime) {
      setDrainAlarm(true);
      setDrainAlarmMessage('Drain process overdue! Please complete the drain immediately for your safety.');
    } else if (now >= warningTime) {
      setDrainAlarm(true);
      const minutesRemaining = Math.ceil((expectedDrainTime - now) / (60 * 1000));
      setDrainAlarmMessage(`Prepare to drain soon. Your treatment will be more effective if completed on schedule.`);
    } else {
      setDrainAlarm(false);
    }
  }, [ongoingTreatment]);

  const analyzeHealthData = useCallback(() => {
    if (!treatmentHistory.length) return;
    
    const alerts = [];
    const tips = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const recentUFVolumes = treatmentHistory
      .filter(treatment => {
        const treatmentDate = convertToPHTime(treatment.treatmentDate);
        return treatmentDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      })
      .map(treatment => {
        const uf = treatment.outSolution?.VolumeOut - treatment.inSolution?.VolumeIn;
        return isNaN(uf) ? null : uf;
      })
      .filter(uf => uf !== null);
    
    if (recentUFVolumes.length > 3) {
      const avgUF = recentUFVolumes.reduce((a, b) => a + b, 0) / recentUFVolumes.length;
      const lastUF = recentUFVolumes[recentUFVolumes.length - 1];
      
      if (lastUF > avgUF * 1.3) {
        alerts.push({
          type: 'warning',
          message: 'Higher than average fluid removal detected. Monitor for dehydration symptoms.',
          priority: 2
        });
      } else if (lastUF < avgUF * 0.7) {
        alerts.push({
          type: 'warning',
          message: 'Lower than average fluid removal detected. Watch for swelling or shortness of breath.',
          priority: 2
        });
      }
    }
    
    tips.push({
      type: 'info',
      message: 'Maintain a balanced diet with controlled sodium and potassium intake for better treatment outcomes.'
    });
    
    tips.push({
      type: 'info',
      message: 'Regular gentle exercise between treatments can improve circulation and overall wellbeing.'
    });
    
    tips.push({
      type: 'info',
      message: 'Monitor your weight daily at the same time to track fluid balance effectively.'
    });
    
    alerts.sort((a, b) => b.priority - a.priority);
    setHealthAlerts(alerts);
    setHealthTips(tips);
  }, [treatmentHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkDrainTime();
    }, 60000);
    
    checkDrainTime();

    return () => clearInterval(interval);
  }, [checkDrainTime]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("No authentication data found");
        }

        if (userData.userLevel !== 'patient') {
          throw new Error("Unauthorized access level");
        }

        setUser(userData);
        setNotification({
          message: `Welcome back, ${userData.first_name}!`,
          type: 'success',
        });
        await fetchConfirmationStatus();
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

  const fetchOngoingTreatment = async () => {
    try {
      setTreatmentLoading(true);
      const response = await axios.get('/patient/treatments/ongoing', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success && response.data.has_ongoing) {
        setOngoingTreatment(response.data.treatment);
      } else {
        setOngoingTreatment(null);
      }
    } catch (error) {
      console.error('Error fetching ongoing treatment:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to load treatment data',
        type: 'error'
      });
    } finally {
      setTreatmentLoading(false);
    }
  };

  const fetchTreatmentHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get('/patient/treatments/recent', {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        const treatments = response.data.treatments || [];
        setTreatmentHistory(treatments);
        
        if (treatments.length === 0) {
          setFirstTimeUser(true);
        } else {
          setFirstTimeUser(false);
        }
        
        const completedToday = treatments.filter(t => {
          const treatmentDate = convertToPHTime(t.treatmentDate);
          const now = new Date();
          return (
            treatmentDate.getDate() === now.getDate() &&
            treatmentDate.getMonth() === now.getMonth() &&
            treatmentDate.getFullYear() === now.getFullYear() &&
            t.TreatmentStatus.toLowerCase() === 'completed'
          );
        }).length;

        setComplianceStatus({
          completed: completedToday,
          remaining: Math.max(0, 3 - completedToday),
          needsReminder: completedToday < 3
        });
        
        setMissedDays(calculateMissedDays(treatments));
      }
    } catch (error) {
      console.error('Error fetching treatment history:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to load treatment history',
        type: 'error'
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOngoingTreatment();
      fetchTreatmentHistory();
    }
  }, [user]);

  useEffect(() => {
    analyzeHealthData();
  }, [treatmentHistory, analyzeHealthData]);

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = convertToPHTime(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Manila'
    };
    return date.toLocaleDateString('en-PH', options);
  };

  const handleEndTreatmentEarly = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/patient/treatments/ongoing', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.has_ongoing) {
        await axios.patch(`/patient/treatments/${response.data.treatment.Treatment_ID}`, {
          status: 'completed',
          early_termination: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        localStorage.removeItem('currentDwellTime');
        localStorage.removeItem('treatmentStartTime');
        
        setShowDwellTimer(false);
        fetchOngoingTreatment();
        fetchTreatmentHistory();
        
        setNotification({
          message: 'Treatment ended successfully',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Error ending treatment:', error);
      setNotification({
        message: error.response?.data?.message || 'Failed to end treatment',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: colors.lightBg,
        zIndex: 9999,
        height: '100dvh',
        width: '100vw',
      }}>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid #e0e0e0',
          borderTop: `6px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{
          color: colors.primary,
          fontSize: '16px',
          fontFamily: 'Arial, sans-serif'
        }}>
          Please wait while we get things ready…
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user && !termsAccepted) {
    return <TermsAndConditions 
             patient={user} 
             onAgree={() => setTermsAccepted(true)} 
           />;
  }

  if (isNewPatient) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: colors.lightBg,
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: colors.primary,
          color: colors.white,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>DialiEase</h1>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <span>Welcome, {user.first_name}</span>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${colors.white}`,
                color: colors.white,
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </header>
        
        <main style={{
          flex: 1,
          padding: '30px',
          transition: 'all 0.3s ease',
        }}>
          <NewPatientWelcome colors={colors} user={user} />
        </main>
      </div>
    );
  }

  return (
    <PatientDashboardContent
      user={user}
      notification={notification}
      ongoingTreatment={ongoingTreatment}
      treatmentLoading={treatmentLoading}
      treatmentHistory={treatmentHistory}
      historyLoading={historyLoading}
      drainAlarm={drainAlarm}
      drainAlarmMessage={drainAlarmMessage}
      healthAlerts={healthAlerts}
      healthTips={healthTips}
      complianceStatus={complianceStatus}
      missedDays={missedDays}
      showHistoryModal={showHistoryModal}
      reminders={reminders}
      confirmationStatus={confirmationStatus}
      dailyLimitReached={dailyLimitReached}
      firstTimeUser={firstTimeUser}
      navigate={navigate}
      termsAccepted={termsAccepted}
      currentDateTime={currentDateTime}
      showDwellTimer={showDwellTimer}
      isTimerMinimized={isTimerMinimized}
      currentDwellTime={currentDwellTime}
      treatmentStartTime={treatmentStartTime}
      isNewPatient={isNewPatient}
      mobileMenuOpen={mobileMenuOpen}
      colors={colors}
      handleLogout={handleLogout}
      handleCloseNotification={handleCloseNotification}
      setShowHistoryModal={setShowHistoryModal}
      setIsTimerMinimized={setIsTimerMinimized}
      handleEndTreatmentEarly={handleEndTreatmentEarly}
      formatDateOnly={formatDateOnly}
      fetchDailyLimitStatus={fetchDailyLimitStatus}
    />
  );
};

export default PatientDashboard;