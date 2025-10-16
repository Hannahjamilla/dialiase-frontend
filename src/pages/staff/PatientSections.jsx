import React, { useMemo, useState } from "react";
import { 
  FaUserClock,
  FaExchangeAlt,
  FaInfoCircle,
  FaFilter,
  FaChevronRight,
  FaChevronLeft,
  FaRegClock,
  FaChartLine,
  FaNotesMedical,
  FaSync,
  FaPlus,
  FaUserInjured,
  FaCalendarAlt,
  FaCheckCircle,
  FaSearch,
  FaUserMd,
  FaProcedures,
  FaClinicMedical,
  FaUsers,
  FaCalendarTimes
} from 'react-icons/fa';
import { MdClose, MdOutlineSick } from 'react-icons/md';
import { GiHealthNormal } from 'react-icons/gi';
import { BsCalendar2Week, BsGraphUp } from 'react-icons/bs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PatientSections = ({
  dashboardData,
  stats,
  activeTab,
  setActiveTab,
  todaySearchTerm,
  setTodaySearchTerm,
  tomorrowSearchTerm,
  setTomorrowSearchTerm,
  nextWeekSearchTerm,
  setNextWeekSearchTerm,
  searchTerm,
  setSearchTerm,
  timeRange,
  setTimeRange,
  handleMarkAsCompleted,
  handleApproveReschedule,
  calculateAge,
  formatDate,
  navigate,
  fetchDashboardData
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Filter functions for different tabs
  const filteredTodayPatients = useMemo(() => {
    return dashboardData.patientsToday.filter(patient => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
      const hn = patient.hospitalNumber ? patient.hospitalNumber.toLowerCase() : '';
      return fullName.includes(todaySearchTerm.toLowerCase()) || 
             hn.includes(todaySearchTerm.toLowerCase());
    });
  }, [dashboardData.patientsToday, todaySearchTerm]);

  const filteredTomorrowPatients = useMemo(() => {
    return dashboardData.patientsTomorrow.filter(patient => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
      const hn = patient.hospitalNumber ? patient.hospitalNumber.toLowerCase() : '';
      return fullName.includes(tomorrowSearchTerm.toLowerCase()) || 
             hn.includes(tomorrowSearchTerm.toLowerCase());
    });
  }, [dashboardData.patientsTomorrow, tomorrowSearchTerm]);

  const filteredNextWeekPatients = useMemo(() => {
    return dashboardData.nextWeekPatients.filter(patient => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
      const hn = patient.hospitalNumber ? patient.hospitalNumber.toLowerCase() : '';
      return fullName.includes(nextWeekSearchTerm.toLowerCase()) || 
             hn.includes(nextWeekSearchTerm.toLowerCase());
    });
  }, [dashboardData.nextWeekPatients, nextWeekSearchTerm]);

  const filteredConfirmed = useMemo(() => {
    return dashboardData.confirmedPatients.filter(patient => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
      const hn = patient.hospitalNumber ? patient.hospitalNumber.toLowerCase() : '';
      return fullName.includes(searchTerm.toLowerCase()) || 
             hn.includes(searchTerm.toLowerCase());
    });
  }, [dashboardData.confirmedPatients, searchTerm]);

  const filteredRescheduled = useMemo(() => {
    return dashboardData.rescheduledPatients.filter(patient => {
      const fullName = `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase();
      const hn = patient.hospitalNumber ? patient.hospitalNumber.toLowerCase() : '';
      return fullName.includes(searchTerm.toLowerCase()) || 
             hn.includes(searchTerm.toLowerCase());
    });
  }, [dashboardData.rescheduledPatients, searchTerm]);

  // Helper function to categorize patients by age group
  const getAgeGroup = (birthDate) => {
    if (!birthDate) return 'Unknown';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    if (age < 18) return 'Minors (0-17)';
    if (age < 65) return 'Adults (18-64)';
    return 'Seniors (65+)';
  };

  // Filter patients by selected date
  const getPatientsByDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dashboardData.confirmedPatients.filter(patient => {
      const appointmentDate = new Date(patient.appointment_date).toISOString().split('T')[0];
      return appointmentDate === dateStr;
    });
  };

  // Week Patient Overview Data
  const weekPatientData = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Get next week dates (next 7 days from tomorrow)
    const nextWeekDates = [];
    for (let i = 2; i <= 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      nextWeekDates.push(date);
    }

    // Group next week patients by day
    const nextWeekPatientsByDay = nextWeekDates.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      return {
        date,
        patients: dashboardData.nextWeekPatients.filter(patient => {
          const appointmentDate = new Date(patient.appointment_date).toISOString().split('T')[0];
          return appointmentDate === dateStr;
        })
      };
    });

    // Calculate age groups for each time period
    const calculateAgeGroups = (patients) => {
      const ageGroups = {
        'Minors (0-17)': 0,
        'Adults (18-64)': 0,
        'Seniors (65+)': 0,
        'Unknown': 0
      };

      patients.forEach(patient => {
        const ageGroup = getAgeGroup(patient.date_of_birth);
        ageGroups[ageGroup]++;
      });

      return ageGroups;
    };

    // Today's data
    const todayAgeGroups = calculateAgeGroups(dashboardData.patientsToday);
    const todayData = {
      name: 'Today',
      date: today,
      total: dashboardData.patientsToday.length,
      ...todayAgeGroups
    };

    // Tomorrow's data
    const tomorrowAgeGroups = calculateAgeGroups(dashboardData.patientsTomorrow);
    const tomorrowData = {
      name: 'Tomorrow',
      date: tomorrow,
      total: dashboardData.patientsTomorrow.length,
      ...tomorrowAgeGroups
    };

    // Next week data - we'll take the day with the most appointments
    let busiestNextWeekDay = null;
    let maxPatients = 0;
    
    nextWeekPatientsByDay.forEach(day => {
      if (day.patients.length > maxPatients) {
        maxPatients = day.patients.length;
        busiestNextWeekDay = day;
      }
    });

    let nextWeekData = {
      name: 'Next Week',
      date: null,
      total: 0,
      'Minors (0-17)': 0,
      'Adults (18-64)': 0,
      'Seniors (65+)': 0,
      'Unknown': 0
    };

    if (busiestNextWeekDay) {
      const nextWeekAgeGroups = calculateAgeGroups(busiestNextWeekDay.patients);
      nextWeekData = {
        name: formatDate(busiestNextWeekDay.date),
        date: busiestNextWeekDay.date,
        total: busiestNextWeekDay.patients.length,
        ...nextWeekAgeGroups
      };
    }

    return [todayData, tomorrowData, nextWeekData].filter(day => day.total > 0);
  }, [dashboardData, formatDate]);

  // Patient statistics data for charts
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
      patients: count,
      avg: Math.round(count * 0.7), // For demonstration of multiple data series
      peak: Math.round(count * 1.2)  // For demonstration
    }));
  }, [dashboardData.patientStats]);

  // Age distribution data for pie chart
  const ageDistributionData = useMemo(() => {
    const allPatients = [
      ...dashboardData.patientsToday,
      ...dashboardData.patientsTomorrow,
      ...dashboardData.nextWeekPatients,
      ...dashboardData.confirmedPatients
    ];

    let minors = 0;
    let adults = 0;
    let seniors = 0;

    allPatients.forEach(patient => {
      if (patient.date_of_birth) {
        const age = calculateAge(patient.date_of_birth);
        if (age < 18) {
          minors++;
        } else if (age >= 18 && age < 65) {
          adults++;
        } else {
          seniors++;
        }
      }
    });

    return [
      { name: 'Minors (<18)', value: minors, color: '#FF6384', fill: '#FF6384' },
      { name: 'Adults (18-64)', value: adults, color: '#36A2EB', fill: '#36A2EB' },
      { name: 'Seniors (65+)', value: seniors, color: '#FFCE56', fill: '#FFCE56' }
    ];
  }, [dashboardData, calculateAge]);

  // Gender distribution data
  const genderDistributionData = useMemo(() => {
    const allPatients = [
      ...dashboardData.patientsToday,
      ...dashboardData.patientsTomorrow,
      ...dashboardData.nextWeekPatients,
      ...dashboardData.confirmedPatients
    ];

    let male = 0;
    let female = 0;
    let other = 0;

    allPatients.forEach(patient => {
      if (patient.gender) {
        if (patient.gender.toLowerCase() === 'male') {
          male++;
        } else if (patient.gender.toLowerCase() === 'female') {
          female++;
        } else {
          other++;
        }
      }
    });

    return [
      { name: 'Male', value: male, color: '#36A2EB', fill: '#36A2EB' },
      { name: 'Female', value: female, color: '#FF6384', fill: '#FF6384' },
      { name: 'Other', value: other, color: '#FFCE56', fill: '#FFCE56' }
    ];
  }, [dashboardData]);

  // Enhanced responsive styles with professional design
  const responsiveStyles = {
    sectionContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
      border: '1px solid #eaeff5',
      marginBottom: '24px',
      width: '100%',
      transition: 'box-shadow 0.3s ease',
      ':hover': {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
      }
    },
    sectionTitle: {
      color: '#1a365d',
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingBottom: '12px',
      borderBottom: '1px solid #edf2f7'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    chartContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      border: '1px solid #eaeff5',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }
    },
    chartHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px'
    },
    chartTitle: {
      margin: 0,
      color: '#2d3748',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    timeRangeButtons: {
      display: 'flex',
      gap: '8px',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
      padding: '4px',
      flexWrap: 'wrap'
    },
    timeRangeButton: (active) => ({
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: active ? '#3182ce' : 'transparent',
      color: active ? 'white' : '#4a5568',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      ':hover': {
        backgroundColor: active ? '#2c5282' : '#ebf8ff'
      }
    }),
    chartWrapper: {
      height: '400px',
      minWidth: '280px',
      position: 'relative'
    },
    noDataContainer: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#a0aec0',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
    },
    tabButtonsContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      overflowX: 'auto',
      paddingBottom: '8px',
      scrollbarWidth: 'none',
      '::-webkit-scrollbar': {
        display: 'none'
      }
    },
    tabButton: (active, color) => ({
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: active ? color : '#edf2f7',
      color: active ? 'white' : '#4a5568',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      fontSize: '14px',
      flexShrink: 0,
      ':hover': {
        backgroundColor: active ? color : '#e2e8f0'
      }
    }),
    contentContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      border: '1px solid #eaeff5'
    },
    actionButtonsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '20px'
    },
    actionButton: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      color: '#4a5568',
      fontWeight: '500',
      ':hover': {
        backgroundColor: '#f7fafc',
        borderColor: '#cbd5e0'
      }
    },
    primaryActionButton: {
      backgroundColor: '#3182ce',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      fontWeight: '500',
      ':hover': {
        backgroundColor: '#2b6cb0'
      }
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border 0.2s ease',
      boxSizing: 'border-box',
      maxWidth: '100%',
      marginBottom: '20px',
      ':focus': {
        borderColor: '#3182ce',
        boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)'
      }
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      backgroundColor: 'white',
      minWidth: '600px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    },
    tableHeader: {
      padding: '12px 16px',
      textAlign: 'left',
      color: '#4a5568',
      backgroundColor: '#f7fafc',
      borderBottom: '1px solid #e2e8f0',
      whiteSpace: 'nowrap',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    tableCell: {
      padding: '12px 16px',
      textAlign: 'left',
      borderBottom: '1px solid #e2e8f0',
      color: '#4a5568',
      fontSize: '14px'
    },
    statusBadge: (backgroundColor) => ({
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: backgroundColor,
      color: 'white',
      display: 'inline-block',
      whiteSpace: 'nowrap'
    }),
    iconButton: (backgroundColor) => ({
      padding: '6px',
      backgroundColor: backgroundColor,
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginRight: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      ':hover': {
        opacity: 0.9,
        transform: 'translateY(-1px)'
      }
    }),
    noPatientsContainer: {
      textAlign: 'center',
      padding: '32px 16px',
      width: '100%',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px dashed #e2e8f0'
    },
    noPatientsIcon: {
      width: '48px',
      height: '48px',
      backgroundColor: '#ebf8ff',
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
      color: '#3182ce',
      fontSize: '20px'
    },
    noPatientsTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#2d3748'
    },
    noPatientsMessage: {
      color: '#718096',
      marginBottom: '24px',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: '14px'
    },
    summaryContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      marginTop: '24px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '16px'
    },
    summaryItem: {
      textAlign: 'center',
      minWidth: '120px',
      padding: '8px'
    },
    summaryValue: (color) => ({
      color: color,
      fontWeight: 'bold',
      fontSize: '24px',
      marginBottom: '4px'
    }),
    summaryLabel: {
      color: '#718096',
      fontSize: '14px'
    },
    chartTooltip: {
      backgroundColor: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
      padding: '12px',
      fontSize: '14px',
      color: '#4a5568'
    },
    chartTooltipLabel: {
      fontWeight: '600',
      marginBottom: '8px',
      color: '#2d3748'
    },
    chartTooltipValue: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px'
    },
    chartTooltipColor: (color) => ({
      width: '12px',
      height: '12px',
      backgroundColor: color,
      borderRadius: '2px',
      marginRight: '8px'
    }),
    datePickerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    },
    datePickerLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#4a5568'
    },
    datePicker: {
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      ':focus': {
        borderColor: '#3182ce',
        boxShadow: '0 0 0 3px rgba(49, 130, 206, 0.1)'
      }
    },
    dateStatsContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    dateStatCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '160px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      flex: '1 1 0'
    },
    dateStatValue: (color) => ({
      fontSize: '20px',
      fontWeight: '600',
      color: color,
      marginBottom: '4px'
    }),
    dateStatLabel: {
      fontSize: '12px',
      color: '#718096',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    datePickerWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      margin: '1rem 0',
      maxWidth: '280px',
      fontFamily: 'Segoe UI, sans-serif',
    },
    datePickerInput: {
      padding: '10px 12px',
      fontSize: '0.95rem',
      border: '1px solid #ccc',
      borderRadius: '8px',
      outline: 'none',
      width: '100%',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    },
    datePickerLabelEnhanced: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    noAppointmentsMessage: {
      backgroundColor: '#f8fafc',
      border: '1px dashed #e2e8f0',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '12px',
      textAlign: 'center',
      color: '#718096',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={responsiveStyles.chartTooltip}>
          <div style={responsiveStyles.chartTooltipLabel}>{label}</div>
          {payload.map((entry, index) => (
            <div key={`tooltip-${index}`} style={responsiveStyles.chartTooltipValue}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={responsiveStyles.chartTooltipColor(entry.color)} />
                <span>{entry.name}:</span>
              </div>
              <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                {entry.value} {entry.name.includes('Patients') ? 'patients' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Get patients for selected date
  const selectedDatePatients = useMemo(() => {
    return getPatientsByDate(selectedDate);
  }, [selectedDate, dashboardData.confirmedPatients]);

  // Calculate age groups for selected date
  const selectedDateAgeGroups = useMemo(() => {
    const ageGroups = {
      'Minors (0-17)': 0,
      'Adults (18-64)': 0,
      'Seniors (65+)': 0,
      'Unknown': 0
    };

    selectedDatePatients.forEach(patient => {
      const ageGroup = getAgeGroup(patient.date_of_birth);
      ageGroups[ageGroup]++;
    });

    return ageGroups;
  }, [selectedDatePatients]);

  return (
    <div style={{ width: '100%' }}>
      {/* Week Patient Overview Section */}
      <div style={responsiveStyles.sectionContainer}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid #edf2f7',
          paddingBottom: '16px'
        }}>
          <h3 style={{
            color: '#1a365d',
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: 0
          }}>
            <FaCalendarAlt style={{ color: '#3182ce' }} /> 
            Week Patient Overview
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            color: '#718096'
          }}>
            <FaInfoCircle /> 
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
        
        <div style={responsiveStyles.chartContainer}>
        {/* Enhanced Date Picker - Compact Layout */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '14px',
            color: '#4a5568',
            fontWeight: '500'
          }}>
            <FaCalendarAlt style={{ 
              color: '#3182ce', 
              marginRight: '8px',
              fontSize: '16px'
            }} />
            View appointments for specific date:
          </div>
          
          <div style={{
            width: '200px',
            position: 'relative'
          }}>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              popperPlacement="bottom-start"
              calendarClassName="react-datepicker-calendar"
              wrapperClassName="date-picker-wrapper"
              className="custom-datepicker-input"
              customInput={
                <input
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    width: '100%',
                    fontSize: '0.875rem',
                    lineHeight: '1.25rem',
                    color: '#111827',
                    backgroundColor: '#fff',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    ':hover': {
                      borderColor: '#9ca3af',
                    },
                    ':focus': {
                      outline: 'none',
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
                      ring: '1px solid #3b82f6',
                    },
                    '::placeholder': {
                      color: '#9ca3af',
                    }
                  }}
                />
              }
            />
          </div>
          
          {selectedDatePatients.length === 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',  // Light red background
            borderRadius: '8px',
            border: '1px solid #fee2e2',  // Soft red border
            color: '#7f1d1d',            // Darker red text
            fontSize: '14px',
            fontWeight: '500',
            marginLeft: 'auto',
            flex: 1,
            minWidth: '320px',
            maxWidth: '100%',
            boxShadow: '0 1px 2px rgba(185, 28, 28, 0.05)',  // Red-tinted shadow
            transition: 'all 0.2s ease',
            ':hover': {
              backgroundColor: '#fee2e2'  // Slightly darker red on hover
            }
          }}>
            <FaCalendarTimes style={{ 
              marginRight: '10px',
              color: '#ef4444',           // True red icon
              fontSize: '16px',
              flexShrink: 0
            }} />
            <span>
              No confirmed appointments for{" "}
              <span style={{
                fontWeight: '600',
                color: '#b91c1c'          // Dark red for date
              }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </span>
          </div>
              )}
            </div>

          {/* Statistics for selected date */}
          {selectedDatePatients.length > 0 && (
            <div style={responsiveStyles.dateStatsContainer}>
              <div style={responsiveStyles.dateStatCard}>
                <div style={responsiveStyles.dateStatValue('#3182ce')}>
                  {selectedDatePatients.length}
                </div>
                <div style={responsiveStyles.dateStatLabel}>Total Patients</div>
              </div>
              <div style={responsiveStyles.dateStatCard}>
                <div style={responsiveStyles.dateStatValue('#38a169')}>
                  {selectedDateAgeGroups['Adults (18-64)']}
                </div>
                <div style={responsiveStyles.dateStatLabel}>Adults (18-64)</div>
              </div>
              <div style={responsiveStyles.dateStatCard}>
                <div style={responsiveStyles.dateStatValue('#dd6b20')}>
                  {selectedDateAgeGroups['Seniors (65+)']}
                </div>
                <div style={responsiveStyles.dateStatLabel}>Seniors (65+)</div>
              </div>
              <div style={responsiveStyles.dateStatCard}>
                <div style={responsiveStyles.dateStatValue('#d53f8c')}>
                  {selectedDateAgeGroups['Minors (0-17)']}
                </div>
                <div style={responsiveStyles.dateStatLabel}>Minors (0-17)</div>
              </div>
            </div>
          )}
  
  <div style={responsiveStyles.chartWrapper}>
    {weekPatientData.length > 0 ? (
      <>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={weekPatientData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#718096', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e0' }}
              tickLine={{ stroke: '#cbd5e0' }}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              stroke="#3182ce"
              tick={{ fill: '#718096', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e0' }}
              tickLine={{ stroke: '#cbd5e0' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#38a169"
              tick={{ fill: '#718096', fontSize: 12 }}
              axisLine={{ stroke: '#cbd5e0' }}
              tickLine={{ stroke: '#cbd5e0' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconSize={12}
              wrapperStyle={{ fontSize: '12px', color: '#4a5568' }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="total"
              name="Total Patients"
              stroke="#3182ce"
              fill="#3182ce"
              fillOpacity={0.1}
              strokeWidth={2}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#ffffff', stroke: '#3182ce' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Adults (18-64)"
              name="Adults (18-64)"
              stroke="#36A2EB"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#36A2EB' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Seniors (65+)"
              name="Seniors (65+)"
              stroke="#FFCE56"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#FFCE56' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Minors (0-17)"
              name="Minors (0-17)"
              stroke="#FF6384"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#FF6384' }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Summary statistics */}
        <div style={responsiveStyles.summaryContainer}>
          {weekPatientData.map((day) => (
            <div key={day.name} style={responsiveStyles.summaryItem}>
              <div style={responsiveStyles.summaryValue('#3182ce')}>
                {day.total}
              </div>
              <div style={responsiveStyles.summaryLabel}>
                {day.name}
              </div>
            </div>
          ))}
          <div style={responsiveStyles.summaryItem}>
            <div style={responsiveStyles.summaryValue('#38a169')}>
              {weekPatientData.reduce((sum, day) => sum + day.total, 0)}
            </div>
            <div style={responsiveStyles.summaryLabel}>
              Total Week Patients
            </div>
          </div>
          <div style={responsiveStyles.summaryItem}>
            <div style={responsiveStyles.summaryValue('#805ad5')}>
              {Math.round(
                weekPatientData.reduce((sum, day) => sum + day.total, 0) / 
                Math.max(weekPatientData.length, 1)
              )}
            </div>
            <div style={responsiveStyles.summaryLabel}>
              Average Daily
            </div>
          </div>
        </div>
      </>
    ) : (
      <div style={responsiveStyles.noDataContainer}>
        <FaCalendarTimes size={24} style={{ marginBottom: '12px', color: '#a0aec0' }} />
        <div style={{ 
          fontSize: '15px',
          color: '#4a5568',
          backgroundColor: '#f7fafc',
          padding: '12px 16px',
          borderRadius: '8px',
          borderLeft: '4px solid #e2e8f0',
          display: 'inline-block',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: '500'
        }}>
          No confirmed appointments for this week
        </div>
        <button 
          style={{ 
            ...responsiveStyles.primaryActionButton,
            marginTop: '16px',
            fontSize: '13px',
            padding: '8px 16px'
          }}
          onClick={fetchDashboardData}
        >
          <FaSync style={{ marginRight: '8px' }} /> Refresh Data
        </button>
      </div>
    )}
  </div>
</div>
      </div>
    </div>
  );
};

export default PatientSections;