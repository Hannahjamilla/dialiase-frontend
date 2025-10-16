import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaFilePdf, FaChevronLeft, FaChevronRight, FaBars, 
  FaBell, FaSearch, FaSort, FaCalendarAlt, FaExclamationTriangle
} from 'react-icons/fa';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  Chip,
  Grid,
  Collapse
} from '@mui/material';
import { format, parseISO, isToday } from 'date-fns';
import StaffSidebar from './StaffSidebar';
import logoImage from "../../assets/images/logo.PNG";
import noResultsImage from '../../assets/images/no-results.PNG';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Notification from '../../components/Notification';

// CSS variables for consistent colors
const colors = {
  primary: '#395886',
  secondary: '#638ECB',
  white: '#FFFFFF',
  green: '#477977'
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const groupSchedulesByDate = (schedules) => {
  if (!schedules || schedules.length === 0) return [];
  
  const grouped = {};
  schedules.forEach(schedule => {
    const dateKey = format(parseISO(schedule.appointment_date), 'yyyy-MM-dd');
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: schedule.appointment_date,
        schedules: []
      };
    }
    grouped[dateKey].schedules.push(schedule);
  });
  
  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

const PatientScheduleList = () => {
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [missedSchedules, setMissedSchedules] = useState([]);
  const [completedSchedules, setCompletedSchedules] = useState([]);
  const [todaysMissedSchedules, setTodaysMissedSchedules] = useState([]);
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'appointment_date', direction: 'desc' });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      if (!isNowMobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const fetchSchedules = async () => {
    try {
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };

      const allResponse = await axios.get('/patient-schedules', { headers });
      setSchedules(allResponse.data.data);

      const upcomingResponse = await axios.get('/patient-schedules/upcoming', { headers });
      setUpcomingSchedules(upcomingResponse.data.data);

      const missedResponse = await axios.get('/patient-schedules/missed', { headers });
      const missedData = missedResponse.data.data;
      setMissedSchedules(missedData);
      
      // Filter for today's missed appointments only
      const todayMissed = missedData.filter(schedule => 
        isToday(parseISO(schedule.appointment_date))
      );
      setTodaysMissedSchedules(todayMissed);

      const completedResponse = await axios.get('/patient-schedules/completed', { headers });
      setCompletedSchedules(completedResponse.data.data);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch schedules');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSchedules = React.useMemo(() => {
    let sortableItems = [...schedules];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [schedules, sortConfig]);

  const sortedUpcomingSchedules = React.useMemo(() => {
    let sortableItems = [...upcomingSchedules];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [upcomingSchedules, sortConfig]);

  const sortedMissedSchedules = React.useMemo(() => {
    let sortableItems = [...todaysMissedSchedules]; // Using todaysMissedSchedules instead of all missed
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [todaysMissedSchedules, sortConfig]);

  const sortedCompletedSchedules = React.useMemo(() => {
    let sortableItems = [...completedSchedules];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [completedSchedules, sortConfig]);

  const filteredSchedules = sortedSchedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${schedule.patient?.first_name || ''} ${schedule.patient?.last_name || ''}`.toLowerCase().trim();
    
    return (
      schedule.patient?.hospitalNumber?.toString().includes(searchTerm) ||
      patientName.includes(searchLower)
    );
  });

  const filteredUpcomingSchedules = sortedUpcomingSchedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${schedule.patient?.first_name || ''} ${schedule.patient?.last_name || ''}`.toLowerCase().trim();
    
    return (
      schedule.patient?.hospitalNumber?.toString().includes(searchTerm) ||
      patientName.includes(searchLower)
    );
  });

  const filteredMissedSchedules = sortedMissedSchedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${schedule.patient?.first_name || ''} ${schedule.patient?.last_name || ''}`.toLowerCase().trim();
    
    return (
      schedule.patient?.hospitalNumber?.toString().includes(searchTerm) ||
      patientName.includes(searchLower)
    );
  });

  const filteredCompletedSchedules = sortedCompletedSchedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${schedule.patient?.first_name || ''} ${schedule.patient?.last_name || ''}`.toLowerCase().trim();
    
    return (
      schedule.patient?.hospitalNumber?.toString().includes(searchTerm) ||
      patientName.includes(searchLower)
    );
  });

  const getCurrentTabData = () => {
    switch (value) {
      case 0: return filteredSchedules;
      case 1: return filteredUpcomingSchedules;
      case 2: return filteredMissedSchedules;
      case 3: return filteredCompletedSchedules;
      default: return [];
    }
  };

  const currentTabData = getCurrentTabData();
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = currentTabData.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(currentTabData.length / patientsPerPage);

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end === totalPages) {
      start = Math.max(1, end - 4);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      case 'missed':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} size="small" />;
  };

  const checkConsistency = (patientId) => {
    const patientAppointments = schedules.filter(s => s.patient?.patientID === patientId);
    const missedCount = patientAppointments.filter(s => s.checkup_status === 'missed').length;
    
    return missedCount >= 2;
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("Poppins");
      doc.setFontSize(18);
      doc.text('Patient Schedules Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      if (user) {
        doc.text(`Generated by: ${user.first_name} ${user.last_name || ''}`, 14, 38);
      }

      const tabTitles = ['All Schedules', 'Upcoming', 'Missed (Today)', 'Completed'];
      doc.text(`Report Type: ${tabTitles[value]}`, 14, 46);

      const headers = ['Hospital No.', 'Appointment Date', 'Status', 'Consistency'];
      const columns = [
        schedule => schedule.patient?.hospitalNumber || '',
        schedule => format(parseISO(schedule.appointment_date), 'MMM dd, yyyy'),
        schedule => schedule.checkup_status || '',
        schedule => checkConsistency(schedule.patient?.patientID) ? 'Inconsistent' : 'Consistent'
      ];

      autoTable(doc, {
        startY: 58,
        head: [headers],
        body: currentTabData.map(schedule => columns.map(col => col(schedule))),
        styles: {
          font: "Poppins",
          fontSize: 8,
          cellPadding: 2,
          textColor: 20
        },
        headStyles: {
          fillColor: [57, 88, 134],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 255]
        }
      });

      doc.save(`patient-schedules-${tabTitles[value].toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      setNotification({
        message: 'Failed to generate PDF. Please check console for details.',
        type: 'error'
      });
    }
  };

  const handleRefresh = () => {
    fetchSchedules();
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      position: 'relative',
      width: '98vw',
      overflowX: 'hidden',
      marginTop: isMobile ? '0' : '-800px',
    },
    content: {
      flex: 1,
      padding: isMobile ? '15px' : '20px 30px',
      transition: 'margin-left 0.3s ease',
      marginLeft: sidebarOpen ? (isMobile ? '0' : '250px') : '0',
      width: sidebarOpen ? (isMobile ? '100%' : 'calc(100vw - 250px)') : '100vw',
      minWidth: 0,
      maxWidth: '100%',
    },
    mobileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      backgroundColor: colors.primary,
      color: colors.white,
      marginBottom: '20px',
      borderRadius: '5px',
      width: '100%'
    },
    mobileMenu: {
      background: 'none',
      border: 'none',
      color: colors.white,
      fontSize: '20px',
      cursor: 'pointer',
    },
    logoMobile: {
      height: '40px',
    },
    logoImage: {
      height: '100%',
    },
    notificationButton: {
      background: 'none',
      border: 'none',
      color: colors.white,
      fontSize: '18px',
      position: 'relative',
      cursor: 'pointer',
    },
    header: {
      marginBottom: '20px',
      width: '100%'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px'
    },
    heading: {
      color: colors.primary,
      fontSize: '24px',
      margin: 0
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px'
    },
    userWelcome: {
      display: 'flex',
      alignItems: 'center',
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      marginRight: '10px',
      objectFit: 'cover'
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: '15px',
    },
    welcomeText: {
      fontSize: '14px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap'
    },
    userRole: {
      fontSize: '12px',
      color: colors.secondary,
      whiteSpace: 'nowrap'
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    subHeading: {
      color: colors.secondary,
      fontSize: '16px',
      margin: 0
    },
    datetime: {
      color: '#777',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      margin: 0
    },
    summaryCards: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px',
      width: '100%'
    },
    summaryCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      borderRadius: '10px',
      color: colors.white,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      minWidth: '150px'
    },
    summaryCardPrimary: {
      backgroundColor: colors.primary,
    },
    summaryCardSuccess: {
      backgroundColor: colors.green,
    },
    summaryCardWarning: {
      backgroundColor: '#d9534f',
    },
    summaryCardContent: {
      display: 'flex',
      flexDirection: 'column',
    },
    summaryCardIcon: {
      fontSize: '24px',
    },
    headerControls: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      marginBottom: '20px',
      gap: '15px',
      width: '100%'
    },
    searchBox: {
      position: 'relative',
      flex: isMobile ? '1' : '0.8',
      minWidth: isMobile ? '100%' : '300px'
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.secondary,
    },
    searchInput: {
      width: '100%',
      padding: '12px 20px 12px 45px',
      borderRadius: '30px',
      border: '1px solid #ddd',
      fontSize: '14px',
      outline: 'none',
      transition: 'border 0.3s',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    },
    searchInputFocus: {
      border: `1px solid ${colors.primary}`,
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: isMobile ? 'center' : 'flex-end'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 15px',
      borderRadius: '30px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '14px',
      fontWeight: '600',
      minWidth: '120px',
      whiteSpace: 'nowrap'
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
      color: colors.white,
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
    buttonIcon: {
      marginRight: isMobile ? '0' : '8px',
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      backgroundColor: '#fff3f3',
      borderLeft: '4px solid #ff4757',
      borderRadius: '5px',
      marginBottom: '20px',
      width: '100%'
    },
    errorIcon: {
      marginRight: '10px',
      fontSize: '20px',
    },
    retryButton: {
      marginLeft: '15px',
      padding: '5px 10px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
    },
    tableWrapper: {
      backgroundColor: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      padding: '20px',
      marginBottom: '20px',
      width: '100%',
      overflowX: 'auto'
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      width: '100%'
    },
    resultsCount: {
      color: colors.secondary,
      fontSize: '14px',
      whiteSpace: 'nowrap'
    },
    tableResponsive: {
      overflowX: 'auto',
      width: '100%',
      WebkitOverflowScrolling: 'touch'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: '800px'
    },
    th: {
      padding: '12px 15px',
      textAlign: 'left',
      backgroundColor: '#f5f7fa',
      color: colors.primary,
      fontWeight: '600',
      borderBottom: '2px solid #ddd',
      whiteSpace: 'nowrap'
    },
    tr: {
      borderBottom: '1px solid #eee',
    },
    trHover: {
      backgroundColor: '#f9f9f9',
    },
    td: {
      padding: '15px',
      verticalAlign: 'middle',
      whiteSpace: 'nowrap'
    },
    highlightText: {
      color: colors.primary,
      fontWeight: '600',
    },
    primaryText: {
      color: '#333',
      fontWeight: '500',
    },
    secondaryText: {
      color: '#777',
      fontSize: '13px',
      marginTop: '5px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '200px'
    },
    noResults: {
      padding: '40px 20px',
      textAlign: 'center',
      width: '100%'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    emptyStateImage: {
      width: '150px',
      marginBottom: '20px',
      opacity: '0.7',
    },
    emptyStateText: {
      color: colors.secondary,
      marginBottom: '15px',
      textAlign: 'center'
    },
    clearSearch: {
      padding: '5px 15px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
      width: '100%',
      flexWrap: 'wrap',
      gap: '15px'
    },
    paginationInfo: {
      color: colors.secondary,
      fontSize: '14px',
      whiteSpace: 'nowrap'
    },
    paginationControls: {
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap'
    },
    paginationButton: {
      padding: '5px 10px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '3px',
      cursor: 'pointer',
      color: colors.primary,
      minWidth: '32px',
      textAlign: 'center'
    },
    paginationButtonActive: {
      backgroundColor: colors.primary,
      color: colors.white,
      borderColor: colors.primary,
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    sortIcon: {
      marginLeft: '5px',
    },
    dateHeader: {
      backgroundColor: '#f0f4f8',
      fontWeight: 'bold',
      color: colors.primary,
      padding: '10px 15px',
      borderBottom: '1px solid #ddd'
    },
    dateGroup: {
      marginBottom: '20px',
      border: '1px solid #eee',
      borderRadius: '5px',
      overflow: 'hidden'
    },
    inconsistentBadge: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '3px 8px',
      borderRadius: '10px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }
  };

  return (
    <div style={styles.container}>
      <StaffSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div style={styles.content}>
        {isMobile && (
          <div style={styles.mobileHeader}>
            <button 
              onClick={toggleSidebar}
              style={styles.mobileMenu}
            >
              <FaBars />
            </button>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logoImage} alt="Clinic Logo" style={{ height: '30px' }} />
            </div>
            <button 
              style={styles.notificationButton}
            >
              <FaBell />
            </button>
          </div>
        )}
        
        <div style={styles.header}>
          {!isMobile && (
            <>
              <div style={styles.headerTop}>
                <div style={styles.logo}>
                  <h1 style={styles.heading}>
                    Patient Schedules
                  </h1>
                </div>
                <div style={styles.userInfo}>
                  {user && (
                    <div style={styles.userWelcome}>
                      <img 
                        src={logoImage} 
                        alt="Staff" 
                        style={styles.userAvatar}
                      />
                      <div style={styles.userDetails}>
                        <span style={styles.welcomeText}>Welcome, {user.first_name}!</span>
                        <span style={styles.userRole}>Healthcare Provider</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.headerTitle}>
                <p style={styles.subHeading}>View and manage patient appointments</p>
                <p style={styles.datetime}>
                  {new Date().toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </>
          )}

          <div style={styles.summaryCards}>
            <div style={{ ...styles.summaryCard, ...styles.summaryCardPrimary }}>
              <div style={styles.summaryCardContent}>
                <h3>Total Appointments</h3>
                <p>{schedules.length}</p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaCalendarAlt />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardSuccess }}>
              <div style={styles.summaryCardContent}>
                <h3>Upcoming</h3>
                <p>{upcomingSchedules.length}</p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaCalendarAlt />
              </div>
            </div>

            <div style={{ ...styles.summaryCard, ...styles.summaryCardWarning }}>
              <div style={styles.summaryCardContent}>
                <h3>Missed (Today)</h3>
                <p>{todaysMissedSchedules.length}</p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaCalendarAlt />
              </div>
            </div>
          </div>

          <div style={styles.headerControls}>
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or hospital number..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={styles.actionButtons}>
              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={generatePDF}
                disabled={currentTabData.length === 0}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaFilePdf style={styles.buttonIcon} />
                {isMobile ? '' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span> 
            <div style={{ flex: 1 }}>
              <strong>Error:</strong> 
              <span> {error}</span>
            </div>
            <button 
              style={styles.retryButton}
              onClick={handleRefresh}
            >
              Retry
            </button>
          </div>
        )}

        <div style={styles.tableWrapper}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="schedule tabs"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="All Schedules" {...a11yProps(0)} />
                <Tab label="Upcoming" {...a11yProps(1)} />
                <Tab label="Missed (Today)" {...a11yProps(2)} />
                <Tab label="Completed" {...a11yProps(3)} />
              </Tabs>
            </Box>
          </Box>

          <div style={styles.tableHeader}>
            <div style={styles.resultsCount}>
              Showing {indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, currentTabData.length)} of {currentTabData.length} appointments
            </div>
          </div>

          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : currentPatients.length === 0 ? (
            <div style={styles.noResults}>
              <div style={styles.emptyState}>
                <img 
                  src={noResultsImage} 
                  alt="No results" 
                  style={styles.emptyStateImage}
                />
                <h3 style={styles.emptyStateText}>
                  {currentTabData.length === 0 
                    ? 'No appointments found' 
                    : 'No matching appointments found'}
                </h3>
                {searchTerm && (
                  <button 
                    style={styles.clearSearch}
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div style={styles.tableResponsive}>
                {groupSchedulesByDate(currentPatients).map((group, groupIndex) => (
                  <div key={groupIndex} style={styles.dateGroup}>
                    <div style={styles.dateHeader}>
                      {format(parseISO(group.date), 'MMMM dd, yyyy')} ({group.schedules.length} appointments)
                    </div>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tr}>
                          <th style={styles.th}>Hospital No.</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Check up Consistency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.schedules.map((schedule, index) => (
                          <tr 
                            key={index} 
                            style={{ 
                              ...styles.tr,
                              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                              ':hover': { backgroundColor: '#f0f4f8' } 
                            }}
                          >
                            <td style={styles.td} data-label="Hospital No.">
                              <span style={styles.primaryText}>
                                {schedule.patient?.hospitalNumber}
                              </span>
                            </td>
                            <td style={styles.td} data-label="Status">
                              {getStatusChip(schedule.checkup_status)}
                            </td>
                            <td style={styles.td} data-label="Consistency">
                              {checkConsistency(schedule.patient?.patientID) ? (
                                <span style={styles.inconsistentBadge}>
                                  <FaExclamationTriangle /> Inconsistent
                                </span>
                              ) : (
                                <span>Consistent</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              {currentTabData.length > 0 && (
                <div style={styles.pagination}>
                  <div style={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <div style={styles.paginationControls}>
                    <button
                      style={{ ...styles.paginationButton, ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) }}
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      {isMobile ? '«' : <><FaChevronLeft /><FaChevronLeft /></>}
                    </button>
                    <button
                      style={{ ...styles.paginationButton, ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) }}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      {isMobile ? '‹' : <FaChevronLeft />}
                    </button>
                    
                    {getPaginationGroup().map(number => (
                      <button
                        key={number}
                        style={{ ...styles.paginationButton, ...(number === currentPage ? styles.paginationButtonActive : {}) }}
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      style={{ ...styles.paginationButton, ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) }}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {isMobile ? '›' : <FaChevronRight />}
                    </button>
                    <button
                      style={{ ...styles.paginationButton, ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) }}
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      {isMobile ? '»' : <><FaChevronRight /><FaChevronRight /></>}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notification */}
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

export default PatientScheduleList;