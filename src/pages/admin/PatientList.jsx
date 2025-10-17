import React, { useEffect, useState, useRef } from 'react';
import { 
  FaSearch, FaFilePdf, FaChevronLeft, FaChevronRight, FaUserPlus, 
  FaTimes, FaBell, FaEye, FaPhone, FaEnvelope, FaColumns, 
  FaBars, FaChartLine, FaCalendarAlt, FaVideo
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffSidebar from './AdminSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PatientDetailsModal from './patientDetailsAdmin';
import PatientListAnalyticsModal from './PatientListAnalyticsModal';
import logoImage from "../../images/logo.png";
import staffPic from "../../assets/images/staffPic.png";
import noResultsImage from '../../assets/images/no-results.png';

const PatientList = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);
  const [user, setUser] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState('list');
  const [recentActivities, setRecentActivities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Refs
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Helper functions for age and duration calculations
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatePatientDuration = (createdAt) => {
    if (!createdAt) return 'N/A';
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
    }
  };

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      setUser(loggedInUser);
      fetchPatients(token);
    }

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  // Data fetching functions
  const fetchPatients = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const sortedPatients = response.data.map(patient => ({
          ...patient,
          status: patient.status || 'active',
          userID: patient.userID,
          last_name: patient.last_name || '',
          first_name: patient.first_name || '',
          email: patient.email || '',
          phone_number: patient.phone_number || '',
          hospitalNumber: patient.hospitalNumber || '',
          created_at: patient.created_at,
          dob: patient.dob || null
        })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setPatients(sortedPatients);
      } else {
        setPatients([]);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error fetching patients');
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setPatients([]);
    }
  };

  const fetchRecentActivities = async (token) => {
    try {
      const mockActivities = [
        { id: 1, type: 'appointment', patientId: 101, patientName: 'John Doe', date: new Date(Date.now() - 1000 * 60 * 5), details: 'Follow-up scheduled' },
        { id: 2, type: 'registration', patientId: 102, patientName: 'Jane Smith', date: new Date(Date.now() - 1000 * 60 * 60 * 24), details: 'New patient registered' }
      ];
      
      setRecentActivities(mockActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  // Helper functions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      const suggestions = patients.filter(patient => {
        const searchLower = value.toLowerCase();
        return (
          patient.hospitalNumber?.toString().includes(value) ||
          `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchLower)
        );
      }).slice(0, 5);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (patient) => {
    setSearchTerm(`${patient.first_name} ${patient.last_name}`);
    setShowSuggestions(false);
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.hospitalNumber?.toString().includes(searchTerm) ||
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("Poppins");
      doc.setFontSize(18);
      doc.text('Patient List Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      if (user) {
        doc.text(`Generated by: ${user.first_name} ${user.last_name || ''}`, 14, 38);
      }

      const headers = ['Hospital No.', 'Name', 'Patient Duration'];
      const columns = [
        patient => patient.hospitalNumber || 'N/A',
        patient => `${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim() || 'N/A',
        patient => calculateAge(patient.dob),
        patient => calculatePatientDuration(patient.created_at)
      ];

      autoTable(doc, {
        startY: user ? 50 : 40,
        head: [headers],
        body: filteredPatients.map(patient => columns.map(col => col(patient))),
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

      doc.save(`patient-list-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 3);
    
    if (end === totalPages) {
      start = Math.max(1, end - 3);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const toggleSelectPatient = (patientId) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId) 
        : [...prev, patientId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPatients.length === currentPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(currentPatients.map(p => p.userID));
    }
  };


  const handleEmail = (email) => {
    if (email) {
      window.open(`mailto:${email}`);
    } else {
      alert('No email available for this patient');
    }
  };

  const handleBatchEmail = () => {
    const emails = selectedPatients
      .map(id => {
        const patient = patients.find(p => p.userID === id);
        return patient?.email;
      })
      .filter(email => email);
    
    if (emails.length > 0) {
      window.open(`mailto:${emails.join(',')}`);
    } else {
      alert('No emails available for selected patients');
    }
  };

  const newPatientsCount = patients.filter(p => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  // Styles
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      position: 'relative',
      marginTop: '-930px',
      width: '130%',
      marginLeft: isMobile ? '0' : '-179px',
    },
    content: {
      flex: 1,
      padding: isMobile ? '15px' : '20px 40px',
      transition: 'margin-left 0.3s ease',
      maxWidth: 'calc(100vw - 250px)',
      marginLeft: '250px',
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
    },
    mobileMenu: {
      background: 'none',
      border: 'none',
      color: 'white',
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
      color: 'white',
      fontSize: '18px',
      position: 'relative',
      cursor: 'pointer',
    },
    notificationBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      backgroundColor: '#ff4757',
      color: 'white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      marginBottom: '20px',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
    },
    heading: {
      marginLeft: '15px',
      color: '#395886',
      fontSize: '24px',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
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
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: '15px',
    },
    welcomeText: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
    userRole: {
      fontSize: '12px',
      color: '#638ECB',
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    subHeading: {
      color: '#638ECB',
      fontSize: '16px',
    },
    datetime: {
      color: '#777',
      fontSize: '14px',
    },
    summaryCards: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: '15px',
      marginBottom: '20px',
    },
    summaryCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      borderRadius: '10px',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      minWidth: '200px',
    },
    summaryCardPrimary: {
      backgroundColor: '#395886',
    },
    summaryCardSuccess: {
      backgroundColor: '#477977',
    },
    summaryCardWarning: {
      backgroundColor: '#b88b58',
    },
    summaryCardDanger: {
      backgroundColor: '#a55858',
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
    },
    searchBox: {
      position: 'relative',
      flex: isMobile ? '1' : '0.8',
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
    searchInputFocus: {
      border: '1px solid #395886',
    },
    searchSuggestions: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '5px',
      zIndex: '100',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      maxHeight: '300px',
      overflowY: 'auto',
      width: '100%',
    },
    searchSuggestion: {
      padding: '10px 15px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    searchSuggestionHover: {
      backgroundColor: '#f5f7fa',
    },
    suggestionName: {
      fontWeight: 'bold',
      color: '#395886',
    },
    suggestionDetails: {
      fontSize: '12px',
      color: '#777',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
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
      padding: '25px',
      marginBottom: '20px',
      width: '102%',
    },
    batchActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      backgroundColor: '#f5f7fa',
      borderRadius: '5px',
      marginBottom: '15px',
    },
    batchButtons: {
      display: 'flex',
      gap: '10px',
    },
    batchButton: {
      display: 'flex',
      alignItems: 'center',
      padding: '5px 10px',
      backgroundColor: '#395886',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    batchClear: {
      padding: '5px 10px',
      backgroundColor: 'transparent',
      color: '#395886',
      border: '1px solid #395886',
      borderRadius: '3px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    resultsCount: {
      color: '#638ECB',
      fontSize: '14px',
    },
    tableResponsive: {
      overflowX: 'auto',
      width: '100%',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '12px 15px',
      textAlign: 'left',
      backgroundColor: '#f5f7fa',
      color: '#395886',
      fontWeight: '600',
      borderBottom: '2px solid #ddd',
      minWidth: '200px',
    },
    thCheckbox: {
      width: '40px',
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
      minWidth: '150px',
    },
    tdCheckbox: {
      textAlign: 'center',
    },
    highlightText: {
      color: '#395886',
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
    },
    rowActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
    },
    buttonView: {
      padding: '5px 10px',
      backgroundColor: '#477977',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      fontSize: '12px',
      minWidth: '80px',
      justifyContent: 'center',
    },
    quickActions: {
      display: 'flex',
      gap: '10px',
    },
    quickAction: {
      background: 'none',
      border: 'none',
      color: '#638ECB',
      cursor: 'pointer',
      fontSize: '14px',
    },
    quickActionDisabled: {
      color: '#ccc',
      cursor: 'not-allowed',
    },
    noResults: {
      padding: '40px 20px',
      textAlign: 'center',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateImage: {
      width: '150px',
      marginBottom: '20px',
      opacity: '0.7',
    },
    emptyStateText: {
      color: '#638ECB',
      marginBottom: '15px',
    },
    clearSearch: {
      padding: '5px 15px',
      backgroundColor: '#395886',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '20px',
    },
    paginationInfo: {
      color: '#638ECB',
      fontSize: '14px',
    },
    paginationControls: {
      display: 'flex',
      gap: '5px',
    },
    paginationButton: {
      padding: '5px 10px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '3px',
      cursor: 'pointer',
      color: '#395886',
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
    activityPanel: {
      position: 'fixed',
      top: '0',
      right: '0',
      bottom: '0',
      width: isMobile ? '90%' : '35%',
      maxWidth: '800px',
      backgroundColor: 'white',
      boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
      zIndex: '1000',
      transform: showActivityPanel ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease',
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      borderBottom: '1px solid #eee',
    },
    activityClose: {
      background: 'none',
      border: 'none',
      color: '#395886',
      fontSize: '18px',
      cursor: 'pointer',
    },
    activityList: {
      padding: '15px',
      height: 'calc(100% - 60px)',
      overflowY: 'auto',
    },
    activityItem: {
      display: 'flex',
      padding: '15px 0',
      borderBottom: '1px solid #f5f5f5',
    },
    activityIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#f5f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '15px',
      color: '#395886',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontWeight: '600',
      color: '#395886',
      marginBottom: '5px',
    },
    activityDetails: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '5px',
    },
    activityTime: {
      color: '#999',
      fontSize: '12px',
    },
    activityEmpty: {
      textAlign: 'center',
      color: '#638ECB',
      padding: '40px 20px',
    },
  };

  return (
    <div style={styles.container}>
      <StaffSidebar />
      
      <div style={styles.content}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={styles.mobileHeader}>
            <button style={styles.mobileMenu} onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div style={styles.logoMobile}>
              <img src={logoImage} alt="Clinic Logo" style={styles.logoImage} />
            </div>
            <button 
              style={styles.notificationButton}
              onClick={() => setShowActivityPanel(!showActivityPanel)}
            >
              <FaBell />
              {recentActivities.length > 0 && (
                <span style={styles.notificationBadge}>
                  {recentActivities.length > 9 ? '9+' : recentActivities.length}
                </span>
              )}
            </button>
          </div>
        )}
        
        <div style={styles.header}>
          {!isMobile && (
            <>
              <div style={styles.headerTop}>
                <div style={styles.logo}>
                  <img src={logoImage} alt="Clinic Logo" style={{ height: '50px' }} />
                  <h1 style={styles.heading}>
                    Peritoneal Dialysis Patient Information
                  </h1>
                </div>
                <div style={styles.userInfo}>
                  {user && (
                    <div style={styles.userWelcome}>
                      <img 
                        src={staffPic} 
                        alt="Staff" 
                        style={styles.userAvatar}
                      />
                      <div style={styles.userDetails}>
                        <span style={styles.welcomeText}>Good Day, {user.first_name}!</span>
                        <span style={styles.userRole}>Administrator</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.headerTitle}>
                <p style={styles.subHeading}>A complete and easy-to-use system for managing all patient records, appointments, and care in one place.</p>
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
                <h3>Total Patients</h3>
                <p>{patients.length}</p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaUserPlus />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardSuccess }}>
              <div style={styles.summaryCardContent}>
                <h3>New Patients</h3>
                <p>{newPatientsCount}</p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaUserPlus />
              </div>
            </div>
          </div>

          {/* Search and Action Bar */}
          <div style={styles.headerControls}>
            <div style={styles.searchBox} ref={searchRef}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, hospital number..."
                style={{ ...styles.searchInput, ...(showSuggestions ? styles.searchInputFocus : {}) }}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={styles.searchSuggestions}>
                  {searchSuggestions.map((patient, index) => (
                    <div 
                      key={index}
                      style={styles.searchSuggestion}
                      onClick={() => handleSuggestionClick(patient)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={styles.suggestionName}>
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div style={styles.suggestionDetails}>
                        {patient.hospitalNumber}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={styles.actionButtons}>
              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={generatePDF}
                disabled={filteredPatients.length === 0}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaFilePdf style={styles.buttonIcon} />
                {isMobile ? '' : 'Export'}
              </button>

              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={() => setShowAnalyticsModal(true)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaChartLine style={styles.buttonIcon} />
                {isMobile ? '' : 'Analytics'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span> 
            <div>
              <strong>Error:</strong> 
              <span>{error}</span>
            </div>
            <button 
              style={styles.retryButton}
              onClick={() => fetchPatients(localStorage.getItem('token'))}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        <div style={styles.tableWrapper}>
          {selectedPatients.length > 0 && (
            <div style={styles.batchActions}>
              <span>{selectedPatients.length} selected</span>
              <div style={styles.batchButtons}>
                <button 
                  style={styles.batchButton}
                  onClick={handleBatchEmail}
                >
                  <FaEnvelope /> {isMobile ? '' : 'Email'}
                </button>

                <button 
                  style={styles.batchClear}
                  onClick={() => setSelectedPatients([])}
                >
                  {isMobile ? '×' : 'Clear'}
                </button>
              </div>
            </div>
          )}
          <div style={styles.tableHeader}>
            <div style={styles.resultsCount}>
              Showing {indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
            </div>
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={{ ...styles.th, ...styles.thCheckbox }}>
                    <input
                      type="checkbox"
                      checked={selectedPatients.length === currentPatients.length && currentPatients.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th style={styles.th}>Hospital No.</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Dialysis Journey</th>
                  {/* <th style={styles.th}>Status</th> */}
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length > 0 ? (
                  currentPatients.map((patient, index) => (
                    <tr key={index} style={{ ...styles.tr, ':hover': { backgroundColor: '#f9f9f9' } }}>
                      <td style={{ ...styles.td, ...styles.tdCheckbox }}>
                        <input
                          type="checkbox"
                          checked={selectedPatients.includes(patient.userID)}
                          onChange={() => toggleSelectPatient(patient.userID)}
                        />
                      </td>
                      <td style={styles.td} data-label="Hospital No.">
                        <span style={styles.highlightText}>
                          {patient.hospitalNumber || 'N/A'}
                        </span>
                      </td>
                      <td style={styles.td} data-label="Name">
                        <div style={styles.primaryText}>
                          {`${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.trim()}
                        </div>
                        <div style={styles.secondaryText}>
                          {patient.email || 'No email'}
                        </div>
                      </td>
                      <td style={styles.td} data-label="Patient Duration">
                        {calculatePatientDuration(patient.created_at)}
                      </td>
                      {/* <td style={styles.td} data-label="Status">
                        <span style={{ 
                          color: patient.status === 'active' ? '#477977' : '#a55858',
                          fontWeight: '500'
                        }}>
                          {patient.status || 'unknown'}
                        </span>
                      </td> */}
                      <td style={styles.td} data-label="Actions">
                        <div style={styles.rowActions}>
                          <button 
                            style={styles.buttonView}
                            onClick={() => handleViewPatient(patient)}
                          >
                            {isMobile ? <FaEye /> : <><FaEye /> View</>}
                          </button>
                          <div style={styles.quickActions}>
                            <button 
                              style={{ ...styles.quickAction, ...(!patient.email ? styles.quickActionDisabled : {}) }}
                              onClick={() => handleEmail(patient.email)}
                              disabled={!patient.email}
                              title="Email"
                            >
                              <FaEnvelope />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={styles.noResults}>
                      <div style={styles.emptyState}>
                        <img 
                          src={noResultsImage} 
                          alt="No results" 
                          style={styles.emptyStateImage}
                        />
                        <h3 style={styles.emptyStateText}>
                          {patients.length === 0 
                            ? 'No patients in the List' 
                            : 'No matching patients found'}
                        </h3>
                        {patients.length > 0 && searchTerm && (
                          <button 
                            style={styles.clearSearch}
                            onClick={() => setSearchTerm('')}
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredPatients.length > 0 && (
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
        </div>

        {/* Activity Panel */}
        {showActivityPanel && (
          <div style={styles.activityPanel}>
            <div style={styles.activityHeader}>
              <h3>Recent Activities</h3>
              <button 
                style={styles.activityClose}
                onClick={() => setShowActivityPanel(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={styles.activityList}>
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div key={activity.id} style={styles.activityItem}>
                    <div style={styles.activityIcon}>
                      {activity.type === 'appointment' && <FaCalendarAlt />}
                      {activity.type === 'registration' && <FaUserPlus />}
                    </div>
                    <div style={styles.activityContent}>
                      <div style={styles.activityTitle}>
                        {activity.patientName}
                      </div>
                      <div style={styles.activityDetails}>
                        {activity.details}
                      </div>
                      <div style={styles.activityTime}>
                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.activityEmpty}>
                  No recent activities
                </div>
              )}
            </div>
          </div>
        )}

        {/* Patient Details Modal */}
        {showModal && selectedPatient && (
          <PatientDetailsModal 
            patient={selectedPatient} 
            user={user}
            onClose={closeModal}
          />
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && (
          <PatientListAnalyticsModal
            patients={patients}
            onClose={() => setShowAnalyticsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PatientList;