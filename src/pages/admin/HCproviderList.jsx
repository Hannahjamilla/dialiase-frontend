import React, { useEffect, useState, useRef } from 'react';
import { 
  FaSearch, FaFilePdf, FaChevronLeft, FaChevronRight, FaUserPlus, 
  FaTimes, FaBell, FaEye, FaPhone, FaEnvelope, FaColumns, 
  FaBars, FaChartLine, FaCalendarAlt, FaVideo, FaUserMd, FaUserNurse, FaUserShield, FaTruck, FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StaffSidebar from './AdminSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImage from "../../images/logo.png";
import staffPic from "../../assets/images/staffPic.png";
import noResultsImage from '../../assets/images/no-results.png';
import HCproviderAddModal from './HCproviderAddModal';
import EmployeeListAnalyticsModal from './EmployeeListAnalyticsModal.jsx';
import EmpDetails from './empDetails.jsx';

const HCProviderList = () => {
  // State management
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [providersPerPage] = useState(4);
  const [user, setUser] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeTab, setActiveTab] = useState('list');
  const [recentActivities, setRecentActivities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Refs
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

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
      fetchProviders(token);
    }

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  // Data fetching functions
  const fetchProviders = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/providers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const sortedProviders = response.data.map(provider => ({
          ...provider,
          status: provider.EmpStatus || 'pre-register',
          created_at: provider.created_at,
          // Ensure specialization and Doc_license are properly handled
          specialization: provider.specialization || '-',
          Doc_license: provider.Doc_license || '-'
        })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setProviders(sortedProviders);
      } else {
        setProviders([]);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching healthcare providers');
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setProviders([]);
    }
  };

  // Helper functions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewProvider = (provider) => {
    setSelectedProvider(provider);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProvider(null);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      const suggestions = providers.filter(provider => {
        const searchLower = value.toLowerCase();
        return (
          provider.employeeNumber?.toString().includes(value) ||
          `${provider.first_name} ${provider.last_name}`.toLowerCase().includes(searchLower) ||
          provider.specialization?.toLowerCase().includes(searchLower) ||
          provider.Doc_license?.toString().toLowerCase().includes(searchLower)
        );
      }).slice(0, 5);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (provider) => {
    setSearchTerm(`${provider.first_name} ${provider.last_name}`);
    setShowSuggestions(false);
  };

  const filteredProviders = providers.filter(provider => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      provider.employeeNumber?.toString().includes(searchTerm) ||
      `${provider.first_name} ${provider.last_name}`.toLowerCase().includes(searchLower) ||
      provider.specialization?.toLowerCase().includes(searchLower) ||
      provider.Doc_license?.toString().toLowerCase().includes(searchLower)
    );
    
    const matchesRole = filterRole === 'all' || provider.userLevel === filterRole;
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("Poppins");
      doc.setFontSize(18);
      doc.text('Healthcare Providers List Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      if (user) {
        doc.text(`Generated by: ${user.first_name} ${user.last_name || ''}`, 14, 38);
      }

      const headers = ['Employee No.', 'Name', 'Specialization', 'License No.'];
      const columns = [
        provider => provider.employeeNumber || '-',
        provider => `${provider.first_name} ${provider.middle_name || ''} ${provider.last_name}`.trim() || '-',
        provider => provider.specialization || '-',
        provider => provider.Doc_license || '-'
      ];

      autoTable(doc, {
        startY: user ? 50 : 40,
        head: [headers],
        body: filteredProviders.map(provider => columns.map(col => col(provider))),
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

      doc.save(`hc-providers-list-${new Date().toISOString().slice(0, 10)}.pdf`);
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

  const toggleSelectProvider = (providerId) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId) 
        : [...prev, providerId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProviders.length === currentProviders.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(currentProviders.map(p => p.userID));
    }
  };

  const handleEmail = (email) => {
    if (email) {
      window.open(`mailto:${email}`);
    } else {
      alert('No email available for this provider');
    }
  };

  const handleBatchEmail = () => {
    alert('Batch email functionality would be implemented here');
  };

  const getRoleIcon = (userLevel) => {
    switch(userLevel) {
      case 'nurse': return <FaUserNurse />;
      case 'admin': return <FaUserShield />;
      case 'distributor': return <FaTruck />;
      default: return <FaUserMd />;
    }
  };

  const getRoleColor = (userLevel) => {
    switch(userLevel) {
      case 'nurse': return '#477977';
      case 'admin': return '#a55858';
      case 'distributor': return '#b88b58';
      default: return '#395886';
    }
  };

  const newProvidersCount = providers.filter(p => new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

  // Get unique roles and statuses for filters
  const uniqueRoles = [...new Set(providers.map(p => p.userLevel))];
  const uniqueStatuses = [...new Set(providers.map(p => p.status))];

  // Check if a provider is a doctor
  const isDoctor = (provider) => {
    return provider.userLevel === 'doctor';
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      position: 'relative',
      marginTop: '-855px',
      width: '138%',
      marginLeft: isMobile ? '0' : '-209px',
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
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 15px',
      borderRadius: '30px',
      border: '1px solid #395886',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '14px',
      fontWeight: '600',
      minWidth: '120px',
      backgroundColor: 'white',
      color: '#395886',
    },
    filterDropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '5px',
      zIndex: '100',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      padding: '15px',
      minWidth: '250px',
    },
    filterSection: {
      marginBottom: '15px',
    },
    filterLabel: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '600',
      color: '#395886',
    },
    filterSelect: {
      width: '100%',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
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
      minWidth: '150px',
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
    licenseText: {
      color: '#477977',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '5px',
      fontStyle: 'italic',
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
                    Healthcare Providers Lists
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
                        <span style={styles.welcomeText}>Welcome, {user.first_name}!</span>
                        <span style={styles.userRole}>Administrator</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.headerTitle}>
                <p style={styles.subHeading}>Keep an updated list of doctors, nurses, and staff, with an option to add new team members anytime</p>
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
                <h3>Total Providers</h3>
                <p>{providers.length}</p>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaUserMd />
              </div>
            </div>
            
            <div style={{ ...styles.summaryCard, ...styles.summaryCardSuccess }}>
              <div style={styles.summaryCardContent}>
                <h3>New Providers</h3>
                <p>{newProvidersCount}</p>
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
                placeholder="Search by name, employee number, specialization, license..."
                style={{ ...styles.searchInput, ...(showSuggestions ? styles.searchInputFocus : {}) }}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={styles.searchSuggestions}>
                  {searchSuggestions.map((provider, index) => (
                    <div 
                      key={index}
                      style={styles.searchSuggestion}
                      onClick={() => handleSuggestionClick(provider)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f7fa'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={styles.suggestionName}>
                        {provider.first_name} {provider.last_name}
                      </div>
                      <div style={styles.suggestionDetails}>
                        {provider.employeeNumber} • {provider.specialization}
                        {provider.Doc_license && provider.Doc_license !== '-' && ` • License: ${provider.Doc_license}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={styles.actionButtons}>
              <div style={{ position: 'relative' }} ref={filterRef}>
                <button 
                  style={styles.filterButton}
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <FaFilter style={styles.buttonIcon} />
                  {isMobile ? '' : 'Filter'}
                </button>
                {showFilterDropdown && (
                  <div style={styles.filterDropdown}>
                    <div style={styles.filterSection}>
                      <label style={styles.filterLabel}>Role</label>
                      <select 
                        style={styles.filterSelect}
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        {uniqueRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div style={styles.filterSection}>
                      <label style={styles.filterLabel}>Status</label>
                      <select 
                        style={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        {uniqueStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={generatePDF}
                disabled={filteredProviders.length === 0}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaFilePdf style={styles.buttonIcon} />
                {isMobile ? '' : 'Export'}
              </button>
              
              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={() => setShowAnalyticsModal(true)}
                disabled={providers.length === 0}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaChartLine style={styles.buttonIcon} />
                {isMobile ? '' : 'Analytics'}
              </button>
              
              <button 
                style={{ ...styles.button, ...styles.buttonPrimary }}
                onClick={() => setShowAddModal(true)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaUserPlus style={styles.buttonIcon} />
                {isMobile ? '' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.tableWrapper}>
          {selectedProviders.length > 0 && (
            <div style={styles.batchActions}>
              <span>{selectedProviders.length} selected</span>
              <div style={styles.batchButtons}>
                <button 
                  style={styles.batchButton}
                  onClick={handleBatchEmail}
                >
                  <FaEnvelope /> {isMobile ? '' : 'Email'}
                </button>
                <button 
                  style={styles.batchClear}
                  onClick={() => setSelectedProviders([])}
                >
                  {isMobile ? '×' : 'Clear'}
                </button>
              </div>
            </div>
          )}
          <div style={styles.tableHeader}>
            <div style={styles.resultsCount}>
              Showing {indexOfFirstProvider + 1}-{Math.min(indexOfLastProvider, filteredProviders.length)} of {filteredProviders.length} providers
            </div>
          </div>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={{ ...styles.th, ...styles.thCheckbox }}>
                    <input
                      type="checkbox"
                      checked={selectedProviders.length === currentProviders.length && currentProviders.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th style={styles.th}>Employee No.</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Specialization</th>
                  <th style={styles.th}>License No.</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProviders.length > 0 ? (
                  currentProviders.map((provider, index) => (
                    <tr key={index} style={{ ...styles.tr, ...(index % 2 === 0 ? styles.trHover : {}) }}>
                      <td style={{ ...styles.td, ...styles.tdCheckbox }}>
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(provider.userID)}
                          onChange={() => toggleSelectProvider(provider.userID)}
                        />
                      </td>
                      <td style={styles.td} data-label="Employee No.">
                        <span style={styles.highlightText}>
                          {provider.employeeNumber || '-'}
                        </span>
                      </td>
                      <td style={styles.td} data-label="Name">
                        <div style={styles.primaryText}>
                          {`${provider.first_name} ${provider.middle_name || ''} ${provider.last_name}`.trim()}
                        </div>
                        <div style={styles.secondaryText}>
                          {provider.email || 'No email'}
                        </div>
                        <div style={styles.secondaryText}>
                          Position: {provider.userLevel || '-'}
                        </div>
                      </td>
                      <td style={styles.td} data-label="Specialization">
                        {provider.specialization || '-'}
                      </td>
                      <td style={styles.td} data-label="License No.">
                        {provider.Doc_license || '-'}
                        {isDoctor(provider) && provider.Doc_license && provider.Doc_license !== '-' && (
                          <div style={styles.licenseText}>
                            Doctor License
                          </div>
                        )}
                      </td>
                      <td style={styles.td} data-label="Actions">
                        <div style={styles.rowActions}>
                          <button 
                            style={styles.buttonView}
                            onClick={() => handleViewProvider(provider)}
                          >
                            {isMobile ? <FaEye /> : <><FaEye /> View</>}
                          </button>
                          <div style={styles.quickActions}>
                            <button 
                              style={{ ...styles.quickAction, ...(!provider.email ? styles.quickActionDisabled : {}) }}
                              onClick={() => handleEmail(provider.email)}
                              disabled={!provider.email}
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
                    <td colSpan={6} style={styles.noResults}>
                      <div style={styles.emptyState}>
                        <img 
                          src={noResultsImage} 
                          alt="No results" 
                          style={styles.emptyStateImage}
                        />
                        <h3 style={styles.emptyStateText}>
                          {providers.length === 0 
                            ? 'No healthcare providers in the system' 
                            : 'No matching providers found'}
                        </h3>
                        {providers.length > 0 && (searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
                          <button 
                            style={styles.clearSearch}
                            onClick={() => {
                              setSearchTerm('');
                              setFilterRole('all');
                              setFilterStatus('all');
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredProviders.length > 0 && (
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
                      {activity.type === 'registration' && <FaUserPlus />}
                      {activity.type === 'update' && <FaUserShield />}
                    </div>
                    <div style={styles.activityContent}>
                      <div style={styles.activityTitle}>
                        {activity.providerName}
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

        {/* HC Provider Add Modal */}
        {showAddModal && (
          <HCproviderAddModal 
            showModal={showAddModal}
            setShowModal={setShowAddModal}
            refreshProviders={() => {
              const token = localStorage.getItem('token');
              if (token) {
                fetchProviders(token);
              }
            }}
          />
        )}

        {/* Analytics Modal */}
        {showAnalyticsModal && (
          <EmployeeListAnalyticsModal
            providers={providers}
            onClose={() => setShowAnalyticsModal(false)}
          />
        )}

        {/* Employee Details Modal */}
        {showModal && selectedProvider && (
          <EmpDetails 
            provider={selectedProvider}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default HCProviderList;