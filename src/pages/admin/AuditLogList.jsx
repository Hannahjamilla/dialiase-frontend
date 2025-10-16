import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSearch, FaFilePdf, FaChevronLeft, FaChevronRight, 
  FaTimes, FaBars, FaChartBar, FaFilter,
  FaHistory, FaDatabase, FaUserCog, FaSync, FaExclamationTriangle,
  FaUsers, FaCalendarAlt, FaClock, FaArchive
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AnalyticsModal from './AnalyticsModal';
import logoImage from "../../images/logo.PNG";
import staffPic from "../../assets/images/staffPic.PNG";
import noResultsImage from '../../assets/images/no-results.PNG';
import ArchiveListModal from './ArchiveListModal';

const AuditLogList = () => {
  // State management
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  
  // Refs and hooks
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Convert to Philippine Time (UTC+8)
  const toPhilippineTime = (date) => {
    if (!date) return null;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null;
    
    const localOffset = dateObj.getTimezoneOffset() * 60000;
    const philippineOffset = 8 * 60 * 60000;
    
    return new Date(dateObj.getTime() + localOffset + philippineOffset);
  };

  // Date formatting functions
  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = toPhilippineTime(dateString);
      if (!date || isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = toPhilippineTime(dateString);
      if (!date || isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = toPhilippineTime(dateString);
      if (!date || isNaN(date.getTime())) return 'Invalid Time';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Time formatting error:', e);
      return 'Invalid Time';
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    try {
      const date = toPhilippineTime(dateString);
      const today = toPhilippineTime(new Date());
      
      if (!date || !today || isNaN(date.getTime()) || isNaN(today.getTime())) return false;
      
      return date.getFullYear() === today.getFullYear() &&
             date.getMonth() === today.getMonth() &&
             date.getDate() === today.getDate();
    } catch (e) {
      console.error('Date comparison error:', e);
      return false;
    }
  };

  const isYesterday = (dateString) => {
    if (!dateString) return false;
    try {
      const date = toPhilippineTime(dateString);
      const yesterday = toPhilippineTime(new Date());
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (!date || !yesterday || isNaN(date.getTime()) || isNaN(yesterday.getTime())) return false;
      
      return date.getFullYear() === yesterday.getFullYear() &&
             date.getMonth() === yesterday.getMonth() &&
             date.getDate() === yesterday.getDate();
    } catch (e) {
      console.error('Date comparison error:', e);
      return false;
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    
    if (isToday(dateString)) {
      return `Today at ${formatTime(dateString)}`;
    }
    
    if (isYesterday(dateString)) {
      return `Yesterday at ${formatTime(dateString)}`;
    }
    
    return formatDateTime(dateString);
  };

  // Effects
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 992);
      
      if (width >= 992) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
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
      fetchLogs(token);
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
  const fetchLogs = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/admin/audit-logs', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setLogs(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to fetch audit logs');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Error fetching audit logs');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      fetchLogs(token);
    }
  };

  // Helper functions
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      const suggestions = logs.filter(log => {
        const searchLower = value.toLowerCase();
        return (
          log.audit_id?.toString().includes(value) ||
          log.user_name?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower) ||
          log.user_type?.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower)
        );
      }).slice(0, 5);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (log) => {
    setSearchTerm(log.user_name || log.action || '');
    setShowSuggestions(false);
  };

  // Get unique action types for filter
  const getActionTypes = () => {
    const actions = [...new Set(logs.map(log => log.action).filter(Boolean))];
    return actions.sort();
  };

  // Get unique user types for filter
  const getUserTypes = () => {
    const types = [...new Set(logs.map(log => log.user_type).filter(Boolean))];
    return types.sort();
  };

  // Filter logs based on search term, type filter, date filter, and action filter
  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      log.audit_id?.toString().includes(searchTerm) ||
      log.user_name?.toLowerCase().includes(searchLower) ||
      log.user_type?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower) ||
      log.timestamp?.toLowerCase().includes(searchLower)
    );
    
    // Apply type filter
    let matchesType = true;
    if (filterType !== 'all') {
      matchesType = log.user_type?.toLowerCase() === filterType.toLowerCase();
    }
    
    // Apply action filter
    let matchesAction = true;
    if (actionFilter !== 'all') {
      matchesAction = log.action?.toLowerCase() === actionFilter.toLowerCase();
    }
    
    // Apply date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = toPhilippineTime(log.timestamp);
      const today = toPhilippineTime(new Date());
      
      if (!logDate || !today || isNaN(logDate.getTime()) || isNaN(today.getTime())) {
        return false;
      }
      
      switch(dateFilter) {
        case 'today':
          matchesDate = isToday(log.timestamp);
          break;
        case 'yesterday':
          matchesDate = isYesterday(log.timestamp);
          break;
        case 'week':
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          matchesDate = logDate >= lastWeek;
          break;
        case 'month':
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          matchesDate = logDate >= lastMonth;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesType && matchesDate && matchesAction;
  });

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(18);
      doc.text('Audit Logs Report', 14, 22);
      doc.setFontSize(10);
      doc.text(`Generated on: ${formatFullDate(new Date())}`, 14, 30);
      if (user) {
        doc.text(`Generated by: ${user.first_name} ${user.last_name || ''}`, 14, 38);
      }

      // Add summary information
      doc.setFontSize(12);
      doc.text('Audit Log Summary', 14, 50);
      doc.setFontSize(10);
      doc.text(`• Total logs: ${logs.length}`, 20, 60);
      doc.text(`• Filtered logs: ${filteredLogs.length}`, 20, 70);
      doc.text(`• Date range: ${dateFilter === 'all' ? 'All time' : dateFilter}`, 20, 80);

      autoTable(doc, {
        startY: 90,
        head: [['Log ID', 'User', 'User Type', 'Action', 'Details', 'Timestamp']],
        body: filteredLogs.map(log => [
          log.audit_id || 'N/A',
          log.user_name || 'System',
          log.user_type || 'N/A',
          log.action || 'N/A',
          log.details || 'No details',
          log.timestamp ? formatDateTime(log.timestamp) : 'N/A'
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: 20,
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

      doc.save(`audit-logs-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please check console for details.');
    }
  };

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    
    if (end === totalPages) {
      start = Math.max(1, end - 2);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Get log statistics (3 cards only)
  const getLogStats = () => {
    const todayLogs = logs.filter(log => isToday(log.timestamp));
    const weekLogs = logs.filter(log => {
      const logDate = toPhilippineTime(log.timestamp);
      const today = toPhilippineTime(new Date());
      if (!logDate || !today || isNaN(logDate.getTime()) || isNaN(today.getTime())) return false;
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      return logDate >= lastWeek;
    });

    return {
      total: logs.length,
      today: todayLogs.length,
      week: weekLogs.length,
    };
  };

  const stats = getLogStats();

  // Get action type color
  const getActionTypeColor = (action) => {
    if (!action) return styles.userTypeSystem;
    
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login') || actionLower.includes('logout')) {
      return styles.userTypeSuccess;
    } else if (actionLower.includes('create') || actionLower.includes('add')) {
      return styles.userTypePrimary;
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return styles.userTypeWarning;
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return styles.userTypeDanger;
    } else if (actionLower.includes('error') || actionLower.includes('fail')) {
      return styles.userTypeDanger;
    }
    return styles.userTypeInfo;
  };

  // Enhanced responsive styles
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      position: 'relative',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      marginTop: isMobile ? '0' : '-320px',
    },
    content: {
      flex: 1,
      padding: isMobile ? '10px' : isTablet ? '15px 20px' : '20px 40px',
      transition: 'all 0.3s ease',
      marginLeft: isMobile ? '0' : sidebarOpen ? '250px' : '0',
      width: isMobile ? '100%' : sidebarOpen ? 'calc(100% - 250px)' : '100%',
    },
    mobileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 15px',
      backgroundColor: '#395886',
      color: 'white',
      marginBottom: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    mobileMenu: {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      transition: 'background-color 0.3s',
    },
    logoMobile: {
      height: '35px',
    },
    logoImage: {
      height: '100%',
      borderRadius: '4px',
    },
    header: {
      marginBottom: '20px',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
      flexWrap: 'wrap',
      gap: '15px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      minWidth: isMobile ? '100%' : 'auto',
    },
    heading: {
      marginLeft: '15px',
      color: '#395886',
      fontSize: isMobile ? '20px' : '24px',
      fontWeight: '600',
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
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      marginRight: '12px',
      objectFit: 'cover',
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: '15px',
    },
    welcomeText: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#395886',
    },
    userRole: {
      fontSize: '12px',
      color: '#638ECB',
      fontWeight: '500',
    },
    headerTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      marginBottom: '20px',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '10px',
    },
    subHeading: {
      color: '#638ECB',
      fontSize: isMobile ? '14px' : '16px',
      lineHeight: '1.4',
      flex: 1,
    },
    datetime: {
      color: '#777',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
    },
    summaryCards: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '15px',
      marginBottom: '25px',
    },
    summaryCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      minHeight: '100px',
    },
    summaryCardHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    },
    summaryCardPrimary: {
      background: 'linear-gradient(135deg, #395886 0%, #638ECB 100%)',
    },
    summaryCardSuccess: {
      background: 'linear-gradient(135deg, #477977 0%, #6ba8a5 100%)',
    },
    summaryCardWarning: {
      background: 'linear-gradient(135deg, #b88b58 0%, #d4ac7d 100%)',
    },
    summaryCardContent: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    summaryCardTitle: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: '500',
      marginBottom: '8px',
      opacity: '0.9',
    },
    summaryCardValue: {
      fontSize: isMobile ? '24px' : '28px',
      fontWeight: '700',
    },
    summaryCardIcon: {
      fontSize: isMobile ? '28px' : '32px',
      opacity: '0.8',
      marginLeft: '15px',
    },
    filterSection: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    },
    filterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    filterTitle: {
      color: '#395886',
      fontSize: isMobile ? '16px' : '18px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    filterControls: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '20px',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    filterLabel: {
      fontSize: '14px',
      color: '#638ECB',
      marginBottom: '8px',
      fontWeight: '500',
    },
    filterSelect: {
      padding: '12px 15px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer',
      transition: 'border-color 0.3s',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 15px center',
      backgroundSize: '8px',
    },
    filterSelectFocus: {
      borderColor: '#395886',
      boxShadow: '0 0 0 2px rgba(57, 88, 134, 0.1)',
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
      flex: isMobile ? '1' : '0.7',
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#638ECB',
      zIndex: 2,
    },
    searchInput: {
      width: '100%',
      padding: '14px 20px 14px 45px',
      borderRadius: '30px',
      border: '1px solid #ddd',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      backgroundColor: 'white',
    },
    searchInputFocus: {
      borderColor: '#395886',
      boxShadow: '0 2px 12px rgba(57, 88, 134, 0.15)',
    },
    searchSuggestions: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      zIndex: '1000',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      maxHeight: '300px',
      overflowY: 'auto',
      width: '100%',
    },
    searchSuggestion: {
      padding: '12px 15px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      borderBottom: '1px solid #f0f0f0',
    },
    searchSuggestionHover: {
      backgroundColor: '#f8fafc',
    },
    suggestionName: {
      fontWeight: '600',
      color: '#395886',
      fontSize: '14px',
      marginBottom: '2px',
    },
    suggestionDetails: {
      fontSize: '12px',
      color: '#666',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      justifyContent: isMobile ? 'center' : 'flex-end',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '10px' : '12px 20px',
      borderRadius: '30px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '14px',
      fontWeight: '600',
      minWidth: isMobile ? 'calc(33.333% - 7px)' : '120px',
      flex: isMobile ? '1' : 'none',
    },
    buttonPrimary: {
      backgroundColor: '#395886',
      color: 'white',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    buttonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed',
      transform: 'none !important',
    },
    buttonIcon: {
      marginRight: isMobile ? '0' : '8px',
      fontSize: isMobile ? '14px' : '16px',
    },
    buttonText: {
      display: isMobile ? 'none' : 'block',
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      backgroundColor: '#fff3f3',
      borderLeft: '4px solid #ff4757',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
    },
    errorIcon: {
      marginRight: '10px',
      fontSize: '18px',
      color: '#ff4757',
    },
    retryButton: {
      marginLeft: '15px',
      padding: '8px 15px',
      backgroundColor: '#395886',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'background-color 0.3s',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      marginBottom: '20px',
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #395886',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    tableWrapper: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      padding: isMobile ? '15px' : '25px',
      marginBottom: '20px',
      overflowX: 'auto',
      minHeight: loading ? '400px' : 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '10px',
    },
    resultsCount: {
      color: '#638ECB',
      fontSize: '14px',
      fontWeight: '500',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: isMobile ? '600px' : '800px',
    },
    th: {
      padding: isMobile ? '10px 8px' : '15px 12px',
      textAlign: 'left',
      backgroundColor: '#f8fafc',
      color: '#395886',
      fontWeight: '600',
      borderBottom: '2px solid #e2e8f0',
      fontSize: isMobile ? '12px' : '14px',
      whiteSpace: 'nowrap',
    },
    tr: {
      borderBottom: '1px solid #f1f1f1',
      transition: 'background-color 0.2s',
    },
    trHover: {
      backgroundColor: '#f8fafc',
    },
    td: {
      padding: isMobile ? '10px 8px' : '15px 12px',
      verticalAlign: 'top',
      fontSize: isMobile ? '12px' : '14px',
    },
    highlightText: {
      color: '#395886',
      fontWeight: '600',
    },
    primaryText: {
      color: '#2d3748',
      fontWeight: '500',
    },
    secondaryText: {
      color: '#718096',
      fontSize: isMobile ? '11px' : '13px',
      marginTop: '4px',
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
      width: isMobile ? '120px' : '150px',
      marginBottom: '20px',
      opacity: '0.7',
    },
    emptyStateText: {
      color: '#638ECB',
      marginBottom: '15px',
      fontSize: isMobile ? '14px' : '16px',
      textAlign: 'center',
    },
    clearSearch: {
      padding: '8px 20px',
      backgroundColor: '#395886',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'background-color 0.3s',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '25px',
      flexWrap: 'wrap',
      gap: '15px',
    },
    paginationInfo: {
      color: '#638ECB',
      fontSize: '14px',
      fontWeight: '500',
    },
    paginationControls: {
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap',
    },
    paginationButton: {
      padding: '8px 12px',
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#395886',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s',
      minWidth: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paginationButtonActive: {
      backgroundColor: '#395886',
      color: 'white',
      borderColor: '#395886',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      backgroundColor: '#f7f7f7',
    },
    userTypeBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: isMobile ? '10px' : '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    userTypeAdmin: {
      backgroundColor: '#ecfdf5',
      color: '#059669',
    },
    userTypeStaff: {
      backgroundColor: '#eff6ff',
      color: '#2563eb',
    },
    userTypeSystem: {
      backgroundColor: '#f3e8ff',
      color: '#7e22ce',
    },
    userTypePrimary: {
      backgroundColor: '#e3f2fd',
      color: '#1565c0',
    },
    userTypeSuccess: {
      backgroundColor: '#e8f5e8',
      color: '#2e7d32',
    },
    userTypeWarning: {
      backgroundColor: '#fff3e0',
      color: '#ef6c00',
    },
    userTypeDanger: {
      backgroundColor: '#ffebee',
      color: '#c62828',
    },
    userTypeInfo: {
      backgroundColor: '#e0f2f1',
      color: '#00695c',
    },
    detailsText: {
      fontSize: isMobile ? '11px' : '12px',
      color: '#666',
      maxWidth: isMobile ? '150px' : '200px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  };

  return (
    <div style={styles.container}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div style={styles.content}>
        {/* Mobile Header */}
        {isMobile && (
          <div style={styles.mobileHeader}>
            <button 
              style={styles.mobileMenu} 
              onClick={toggleSidebar}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FaBars />
            </button>
            <div style={styles.logoMobile}>
              <img src={logoImage} alt="Clinic Logo" style={styles.logoImage} />
            </div>
            <div style={{ width: '40px' }}></div> {/* Spacer for balance */}
          </div>
        )}
        
        <div style={styles.header}>
          {!isMobile && (
            <>
              <div style={styles.headerTop}>
                <div style={styles.logo}>
                  <img src={logoImage} alt="Clinic Logo" style={{ height: '50px', borderRadius: '6px' }} />
                  <h1 style={styles.heading}>
                    System Activity History
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
                <p style={styles.subHeading}>
                  Comprehensive monitoring of all system activities, user interactions, and administrative changes for security and compliance
                </p>
                <p style={styles.datetime}>
                  {formatFullDate(toPhilippineTime(currentTime))} at {formatTime(toPhilippineTime(currentTime))}
                </p>
              </div>
            </>
          )}

          {/* Summary Cards - 3 Cards Only */}
          <div style={styles.summaryCards}>
            <div 
              style={{ ...styles.summaryCard, ...styles.summaryCardPrimary }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={styles.summaryCardContent}>
                <div style={styles.summaryCardTitle}>Total Logs</div>
                <div style={styles.summaryCardValue}>{stats.total}</div>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaDatabase />
              </div>
            </div>
            
            <div 
              style={{ ...styles.summaryCard, ...styles.summaryCardSuccess }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={styles.summaryCardContent}>
                <div style={styles.summaryCardTitle}>Today's Activities</div>
                <div style={styles.summaryCardValue}>{stats.today}</div>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaHistory />
              </div>
            </div>
            
            <div 
              style={{ ...styles.summaryCard, ...styles.summaryCardWarning }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={styles.summaryCardContent}>
                <div style={styles.summaryCardTitle}>This Week</div>
                <div style={styles.summaryCardValue}>{stats.week}</div>
              </div>
              <div style={styles.summaryCardIcon}>
                <FaCalendarAlt />
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div style={styles.filterSection}>
            <div style={styles.filterHeader}>
              <h3 style={styles.filterTitle}>
                <FaFilter />
                Filter Logs
              </h3>
            </div>
            
            <div style={styles.filterControls}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>User Type</label>
                <select 
                  style={styles.filterSelect}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = '#395886'}
                  onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
                >
                  <option value="all">All User Types</option>
                  {getUserTypes().map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Action Type</label>
                <select 
                  style={styles.filterSelect}
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = '#395886'}
                  onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
                >
                  <option value="all">All Actions</option>
                  {getActionTypes().map(action => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Time Period</label>
                <select 
                  style={styles.filterSelect}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = '#395886'}
                  onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search and Action Bar */}
          <div style={styles.headerControls}>
            <div style={styles.searchBox} ref={searchRef}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by user, action, details, timestamp..."
                style={{ 
                  ...styles.searchInput, 
                  ...(showSuggestions ? styles.searchInputFocus : {}) 
                }}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={styles.searchSuggestions}>
                  {searchSuggestions.map((log, index) => (
                    <div 
                      key={index}
                      style={styles.searchSuggestion}
                      onClick={() => handleSuggestionClick(log)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={styles.suggestionName}>
                        {log.user_name || 'System'} • {log.user_type || 'System'}
                      </div>
                      <div style={styles.suggestionDetails}>
                        {log.action} - {log.details || 'No details'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={styles.actionButtons}>
              <button 
                style={{ 
                  ...styles.button, 
                  ...styles.buttonPrimary
                }}
                onClick={() => setShowArchiveModal(true)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaArchive style={styles.buttonIcon} />
                <span style={styles.buttonText}>Archive Users</span>
              </button>
              
              <button 
                style={{ 
                  ...styles.button, 
                  ...styles.buttonPrimary,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                onClick={refreshData}
                disabled={loading}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaSync style={styles.buttonIcon} />
                <span style={styles.buttonText}>Refresh</span>
              </button>

              <button 
                style={{ 
                  ...styles.button, 
                  ...styles.buttonPrimary,
                  ...(logs.length === 0 ? styles.buttonDisabled : {})
                }}
                onClick={() => setShowAnalyticsModal(true)}
                disabled={logs.length === 0}
                onMouseEnter={e => logs.length > 0 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaChartBar style={styles.buttonIcon} />
                <span style={styles.buttonText}>Analytics</span>
              </button>

              <button 
                style={{ 
                  ...styles.button, 
                  ...styles.buttonPrimary,
                  ...(filteredLogs.length === 0 ? styles.buttonDisabled : {})
                }}
                onClick={generatePDF}
                disabled={filteredLogs.length === 0}
                onMouseEnter={e => filteredLogs.length > 0 && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <FaFilePdf style={styles.buttonIcon} />
                <span style={styles.buttonText}>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <FaExclamationTriangle style={styles.errorIcon} />
            <div>
              <strong>Error:</strong> 
              <span> {error}</span>
            </div>
            <button 
              style={styles.retryButton}
              onClick={refreshData}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2d4a7a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#395886'}
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content with Loading State */}
        <div style={styles.tableWrapper}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
            </div>
          ) : (
            <>
              <div style={styles.tableHeader}>
                <div style={styles.resultsCount}>
                  Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
                  {searchTerm && ` for "${searchTerm}"`}
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tr}>
                      <th style={styles.th}>Log ID</th>
                      <th style={styles.th}>User</th>
                      <th style={styles.th}>User Type</th>
                      <th style={styles.th}>Action</th>
                      <th style={styles.th}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.length > 0 ? (
                      currentLogs.map((log, index) => (
                        <tr 
                          key={index} 
                          style={styles.tr}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={styles.td} data-label="Log ID">
                            <span style={styles.highlightText}>
                              #{log.audit_id || 'N/A'}
                            </span>
                          </td>
                          <td style={styles.td} data-label="User">
                            <div style={styles.primaryText}>
                              {log.user_name || 'System'}
                            </div>
                          </td>
                          <td style={styles.td} data-label="User Type">
                            <span style={{
                              ...styles.userTypeBadge,
                              ...(log.user_type === 'admin' ? styles.userTypeAdmin : 
                                  log.user_type === 'staff' ? styles.userTypeStaff : 
                                  styles.userTypeSystem)
                            }}>
                              {log.user_type || 'System'}
                            </span>
                          </td>
                          <td style={styles.td} data-label="Action">
                            <span style={{
                              ...styles.userTypeBadge,
                              ...getActionTypeColor(log.action)
                            }}>
                              {log.action || 'N/A'}
                            </span>
                          </td>
                          <td style={styles.td} data-label="Timestamp">
                            <div style={styles.primaryText}>
                              {formatDateForDisplay(log.timestamp)}
                            </div>
                            <div style={styles.secondaryText}>
                              {formatFullDate(log.timestamp)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={styles.noResults}>
                          <div style={styles.emptyState}>
                            <img 
                              src={noResultsImage} 
                              alt="No results" 
                              style={styles.emptyStateImage}
                            />
                            <h3 style={styles.emptyStateText}>
                              {logs.length === 0 
                                ? 'No audit logs in the system' 
                                : 'No matching logs found'}
                            </h3>
                            {logs.length > 0 && searchTerm && (
                              <button 
                                style={styles.clearSearch}
                                onClick={() => setSearchTerm('')}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2d4a7a'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#395886'}
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

              {filteredLogs.length > 0 && (
                <div style={styles.pagination}>
                  <div style={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                  </div>
                  <div style={styles.paginationControls}>
                    <button
                      style={{ 
                        ...styles.paginationButton, 
                        ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) 
                      }}
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      {isMobile ? '«' : <><FaChevronLeft /><FaChevronLeft /></>}
                    </button>
                    <button
                      style={{ 
                        ...styles.paginationButton, 
                        ...(currentPage === 1 ? styles.paginationButtonDisabled : {}) 
                      }}
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      {isMobile ? '‹' : <FaChevronLeft />}
                    </button>
                    
                    {getPaginationGroup().map(number => (
                      <button
                        key={number}
                        style={{ 
                          ...styles.paginationButton, 
                          ...(number === currentPage ? styles.paginationButtonActive : {}) 
                        }}
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      style={{ 
                        ...styles.paginationButton, 
                        ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) 
                      }}
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      {isMobile ? '›' : <FaChevronRight />}
                    </button>
                    <button
                      style={{ 
                        ...styles.paginationButton, 
                        ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}) 
                      }}
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

        {/* Analytics Modal */}
        {showAnalyticsModal && (
          <AnalyticsModal 
            isOpen={showAnalyticsModal}
            onClose={() => setShowAnalyticsModal(false)}
            logs={logs}
          />
        )}
        
        {/* Archive Modal */}
        {showArchiveModal && (
          <ArchiveListModal 
            isOpen={showArchiveModal}
            onClose={() => setShowArchiveModal(false)}
          />
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AuditLogList;