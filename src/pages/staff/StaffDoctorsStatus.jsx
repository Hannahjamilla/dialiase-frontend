import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserMd, 
  FaStethoscope, 
  FaCalendarAlt,
  FaNotesMedical,
  FaClock,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaProcedures,
  FaUserClock,
  FaUserSlash,
  FaEllipsisV,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilePdf,
  FaBars,
  FaBell
} from 'react-icons/fa';
import { IoMdAlert } from 'react-icons/io';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../api/axios';
import Notification from '../../components/Notification';
import StaffSidebar from './StaffSidebar';
import logoImage from "../../assets/images/logo.PNG";

const StaffDoctorsStatus = () => {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    consulting: 0,
    waiting: 0,
    offDuty: 0,
    change: 0,
    avgConsultationTime: 0
  });
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [specialties, setSpecialties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [itemsPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  const fetchDoctorsStatus = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const response = await api.get('/staff/doctors-status');

      if (response.data.success) {
        const previousCount = doctors.length;
        const doctorsData = response.data.doctors || [];
        setDoctors(doctorsData);

        const uniqueSpecialties = [...new Set(
          doctorsData.map(d => d.specialty).filter(Boolean)
        )];
        setSpecialties(uniqueSpecialties);

        const consultingCount = doctorsData.filter(d => d.status === 'Consulting').length;
        const waitingCount = doctorsData.filter(d => d.status === 'Waiting').length;
        const offDutyCount = doctorsData.filter(d => d.status === 'Off Duty').length;
        
        const avgTime = consultingCount > 0 ? 
          Math.round(doctorsData.reduce((sum, doc) => sum + (doc.average_consultation_time || 0), 0) / consultingCount) : 0;

        setStats({
          totalDoctors: doctorsData.length,
          consulting: consultingCount,
          waiting: waitingCount,
          offDuty: offDutyCount,
          change: doctorsData.length - previousCount,
          avgConsultationTime: avgTime
        });
      } else {
        setNotification({
          message: response.data.message || 'Failed to fetch doctors status',
          type: 'error'
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load data. Please try again later.';
      setNotification({
        message: errorMessage,
        type: 'error'
      });

      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctorsStatus();
    const interval = setInterval(fetchDoctorsStatus, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const filteredData = useMemo(() => {
    let results = doctors;
    
    if (searchTerm) {
      results = results.filter(doctor => 
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(doctor => doctor.status === statusFilter);
    }
    
    if (specialtyFilter !== 'all') {
      results = results.filter(doctor => doctor.specialty === specialtyFilter);
    }
    
    return results;
  }, [doctors, searchTerm, statusFilter, specialtyFilter]);

  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const closeNotification = () => setNotification(null);

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchDoctorsStatus();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Consulting':
        return <FaProcedures size={14} />;
      case 'Waiting':
        return <FaUserClock size={14} />;
      case 'Off Duty':
        return <FaUserSlash size={14} />;
      default:
        return <FaUserMd size={14} />;
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("Poppins");
      doc.setFontSize(18);
      doc.text('Doctors Status Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      if (user) {
        doc.text(`Generated by: ${user.first_name} ${user.last_name || ''}`, 14, 38);
      }

      const headers = ['Doctor', 'Specialty', 'Status', 'Current Patient', 'Avg Time', 'Upcoming'];
      const columns = [
        doctor => doctor.name || 'Unknown',
        doctor => doctor.specialty || 'General',
        doctor => doctor.status || 'Unknown',
        doctor => doctor.current_patient || 'None',
        doctor => doctor.average_consultation_time ? `${doctor.average_consultation_time} min` : '--',
        doctor => doctor.upcoming_appointments || 0
      ];

      autoTable(doc, {
        startY: user ? 50 : 40,
        head: [headers],
        body: filteredData.map(doctor => columns.map(col => col(doctor))),
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

      doc.save(`doctors-status-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      setNotification({
        message: 'Failed to generate PDF. Please try again.',
        type: 'error'
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end === totalPages) {
      start = Math.max(1, end - 4);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      position: 'relative',
      width: '100vw',
      overflowX: 'hidden',
      marginTop: isMobile ? '0' : '-910px',
    },
    content: {
      flex: 1,
      padding: isMobile ? '15px' : '20px 30px',
      transition: 'margin-left 0.3s ease',
      marginLeft: sidebarOpen ? (isMobile ? '0' : '270px') : '0',
      width: sidebarOpen ? (isMobile ? '100%' : 'calc(100vw - 250px)') : '100vw',
      minWidth: 0,
      maxWidth: '100%'
    },
    mobileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      backgroundColor: '#395886',
      color: 'white',
      marginBottom: '20px',
      borderRadius: '5px',
      width: '100%'
    },
    mobileMenu: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
    },
    notificationButton: {
      background: 'none',
      border: 'none',
      color: 'white',
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
      color: '#395886',
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
      color: '#638ECB',
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
      color: '#638ECB',
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
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      minWidth: '150px'
    },
    summaryCardPrimary: {
      backgroundColor: '#395886',
    },
    summaryCardSecondary: {
      backgroundColor: '#638ECB',
    },
    summaryCardSuccess: {
      backgroundColor: '#477977',
    },
    summaryCardGray: {
      backgroundColor: '#64748b',
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
      color: '#638ECB',
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
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: '180px',
    },
    filterLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '5px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontWeight: '500',
    },
    filterSelect: {
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      appearance: 'none',
      paddingRight: '35px',
      backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '1em',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      color: '#334155',
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
      backgroundColor: '#395886',
      color: 'white',
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
      backgroundColor: '#395886',
      color: 'white',
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
      color: '#638ECB',
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
      color: '#395886',
      fontWeight: '600',
      borderBottom: '2px solid #ddd',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      userSelect: 'none'
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
    },
    doctorCell: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    doctorName: {
      fontWeight: '600',
      color: '#395886',
    },
    doctorSpecialty: {
      fontSize: '13px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    statusBadge: {
      padding: '5px 10px',
      borderRadius: '6px',
      fontWeight: '500',
      fontSize: '13px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      width: 'fit-content',
    },
    patientInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    patientName: {
      fontWeight: '500',
      color: '#395886',
      fontSize: '14px',
    },
    patientDetail: {
      fontSize: '12px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    priorityBadge: {
      fontSize: '11px',
      padding: '2px 5px',
      borderRadius: '4px',
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      color: '#b91c1c',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      marginLeft: '5px',
    },
    hiddenOnMobile: {
      '@media (max-width: 768px)': {
        display: 'none'
      }
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
      color: '#638ECB',
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
      color: '#395886',
      minWidth: '32px',
      textAlign: 'center'
    },
    paginationButtonActive: {
      backgroundColor: '#395886',
      color: 'white',
      borderColor: '#395886',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    emptyState: {
      padding: '40px 20px',
      textAlign: 'center',
      width: '100%'
    },
    emptyStateContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    emptyStateIcon: {
      fontSize: '32px',
      color: '#cbd5e1',
      marginBottom: '15px',
    },
    emptyStateText: {
      color: '#638ECB',
      marginBottom: '15px',
      textAlign: 'center'
    },
    clearFilters: {
      padding: '5px 15px',
      backgroundColor: '#395886',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    },
    loadingState: {
      padding: '40px 20px',
      textAlign: 'center',
      width: '100%'
    },
    loadingSpinner: {
      border: '3px solid rgba(99, 142, 203, 0.2)',
      borderTop: '3px solid #638ECB',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 15px'
    },
    filterSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap'
    },
    filterLabelText: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <div style={styles.container}>
      <StaffSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div style={styles.content}>
        {/* Mobile Header */}
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
                    <FaUserMd /> Doctors' Queue Status
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
                        <span style={styles.userRole}>Healthcare Staff</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.headerTitle}>
                <p style={styles.subHeading}>Real-time monitoring of {stats.totalDoctors} doctors across the facility</p>
                <p style={styles.datetime}>
                  {new Date().toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </>
          )}

          {/* Summary Cards */}
          <div style={styles.summaryCards}>
            <div style={{ ...styles.summaryCard, ...styles.summaryCardPrimary }}>
              <div style={styles.summaryCardContent}>
                <h3>Total Doctors</h3>
                <p>{stats.totalDoctors}</p>
                {stats.change !== 0 && (
                  <small>{stats.change > 0 ? '+' : ''}{stats.change} today</small>
                )}
              </div>
              <div style={styles.summaryCardIcon}>
                <FaUserMd />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardSecondary }}>
              <div style={styles.summaryCardContent}>
                <h3>Consulting</h3>
                <p>{stats.consulting}</p>
                <small>{stats.consulting > 0 ? `${stats.avgConsultationTime} min avg` : 'No active consultations'}</small>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaProcedures />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardSuccess }}>
              <div style={styles.summaryCardContent}>
                <h3>Available</h3>
                <p>{stats.waiting}</p>
                <small>{stats.waiting > 0 ? 'Ready for patients' : 'No doctors available'}</small>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaUserClock />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardGray }}>
              <div style={styles.summaryCardContent}>
                <h3>Off Duty</h3>
                <p>{stats.offDuty}</p>
                <small>{stats.offDuty > 0 ? 'Not on shift' : 'All doctors on duty'}</small>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaUserSlash />
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div style={styles.headerControls}>
            <div style={styles.searchBox} ref={searchRef}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search doctors by name or specialty..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={styles.filterSection}>
              <span style={styles.filterLabelText}>Filter by:</span>
              
              <div style={styles.filterGroup}>
                <select
                  style={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Waiting">Available</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>

              {specialties.length > 0 && (
                <div style={styles.filterGroup}>
                  <select
                    style={styles.filterSelect}
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                  >
                    <option value="all">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div style={styles.actionButtons}>
                <button 
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={generatePDF}
                  disabled={filteredData.length === 0}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <FaFilePdf style={styles.buttonIcon} />
                  {isMobile ? '' : 'Export'}
                </button>
                
                <button 
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <FaSyncAlt style={styles.buttonIcon} className={isRefreshing ? 'spin' : ''} />
                  {isMobile ? '' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {notification && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span> 
            <div style={{ flex: 1 }}>
              <strong>Error:</strong> 
              <span> {notification.message}</span>
            </div>
            <button 
              style={styles.retryButton}
              onClick={closeNotification}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content */}
        <div style={styles.tableWrapper}>
          <div style={styles.tableHeader}>
            <div style={styles.resultsCount}>
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} doctors
            </div>
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th 
                    style={styles.th}
                    onClick={() => requestSort('name')}
                  >
                    Doctor {getSortIcon('name')}
                  </th>
                  <th 
                    style={styles.th}
                    onClick={() => requestSort('specialty')}
                  >
                    Specialty {getSortIcon('specialty')}
                  </th>
                  <th 
                    style={styles.th}
                    onClick={() => requestSort('status')}
                  >
                    Status {getSortIcon('status')}
                  </th>
                  <th 
                    style={styles.th}
                    onClick={() => requestSort('current_patient')}
                  >
                    Current Patient {getSortIcon('current_patient')}
                  </th>
                  <th 
                    style={{ ...styles.th, ...(isMobile ? styles.hiddenOnMobile : {}) }}
                    onClick={() => requestSort('average_consultation_time')}
                  >
                    Avg. Time {getSortIcon('average_consultation_time')}
                  </th>
                  <th 
                    style={{ ...styles.th, ...(isMobile ? styles.hiddenOnMobile : {}) }}
                    onClick={() => requestSort('upcoming_appointments')}
                  >
                    Upcoming {getSortIcon('upcoming_appointments')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={styles.loadingState}>
                      <div style={styles.loadingSpinner} />
                      <div>Loading doctor data...</div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyState}>
                      <div style={styles.emptyStateContent}>
                        <div style={styles.emptyStateIcon}>
                          <FaUserMd />
                        </div>
                        <h3 style={styles.emptyStateText}>
                          {doctors.length === 0 
                            ? 'No doctors in the system' 
                            : 'No matching doctors found'}
                        </h3>
                        {(searchTerm || statusFilter !== 'all' || specialtyFilter !== 'all') && (
                          <button 
                            style={styles.clearFilters}
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                              setSpecialtyFilter('all');
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((doctor, index) => (
                    <tr 
                      key={index} 
                      style={{ 
                        ...styles.tr,
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                        ':hover': { backgroundColor: '#f0f4f8' } 
                      }}
                    >
                      <td style={styles.td} data-label="Doctor">
                        <div style={styles.doctorCell}>
                          <div style={styles.doctorName}>{doctor.name || 'Unknown'}</div>
                          <div style={styles.doctorSpecialty}>
                            <FaNotesMedical size={12} /> {doctor.specialty || 'General'}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td} data-label="Specialty">
                        {doctor.specialty || 'General'}
                      </td>
                      <td style={styles.td} data-label="Status">
                        <span style={{ 
                          ...styles.statusBadge,
                          backgroundColor: doctor.status === 'Consulting' ? 'rgba(99, 142, 203, 0.1)' :
                            doctor.status === 'Waiting' ? 'rgba(71, 121, 119, 0.1)' : 
                            doctor.status === 'Off Duty' ? '#e2e8f0' : 'rgba(57, 88, 134, 0.1)',
                          color: doctor.status === 'Consulting' ? '#638ECB' :
                            doctor.status === 'Waiting' ? '#477977' : 
                            doctor.status === 'Off Duty' ? '#334155' : '#395886'
                        }}>
                          {getStatusIcon(doctor.status)}
                          {doctor.status || 'Unknown'}
                        </span>
                      </td>
                      <td style={styles.td} data-label="Current Patient">
                        {doctor.current_patient ? (
                          <div style={styles.patientInfo}>
                            <div style={styles.patientName}>
                              {doctor.current_patient}
                              {doctor.priority && (
                                <span style={styles.priorityBadge}>
                                  <IoMdAlert size={10} /> Priority
                                </span>
                              )}
                            </div>
                            <div style={styles.patientDetail}>
                              <FaClock size={10} /> {doctor.waiting_time || 0} min
                            </div>
                          </div>
                        ) : (
                          <div style={styles.patientDetail}>No current patient</div>
                        )}
                      </td>
                      <td style={{ ...styles.td, ...(isMobile ? styles.hiddenOnMobile : {}) }} data-label="Avg. Time">
                        <div style={styles.patientDetail}>
                          {doctor.average_consultation_time || '--'} min
                        </div>
                      </td>
                      <td style={{ ...styles.td, ...(isMobile ? styles.hiddenOnMobile : {}) }} data-label="Upcoming">
                        <div style={styles.patientDetail}>
                          {doctor.upcoming_appointments || 0} appointments
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredData.length > 0 && (
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
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  {isMobile ? '‹' : <FaChevronLeft />}
                </button>
                
                {getPaginationGroup().map(number => (
                  <button
                    key={number}
                    style={{ ...styles.paginationButton, ...(number === currentPage ? styles.paginationButtonActive : {}) }}
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  style={{ ...styles.paginationButton, ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) }}
                  onClick={handleNextPage}
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
        </div>
      </div>
    </div>
  );
};

export default StaffDoctorsStatus;