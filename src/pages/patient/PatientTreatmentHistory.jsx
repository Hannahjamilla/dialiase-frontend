import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiFilter, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PatientSidebar from './PatientSidebar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PatientTreatmentHistory = () => {
  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    red: '#EF4444',
    yellow: '#F59E0B',
    teal: '#0D9488',
    gray: '#F3F4F6'
  };

  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTreatments, setTotalTreatments] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [todaysTreatments, setTodaysTreatments] = useState([]);
  const [requiredDailyTreatments, setRequiredDailyTreatments] = useState(4); // Default value
  const [expandedTreatmentId, setExpandedTreatmentId] = useState(null);

  const convertToPHTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Date(date.getTime() + (8 * 60 * 60 * 1000));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = convertToPHTime(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/patient/treatments', {
        params: {
          page: currentPage,
          search: searchTerm,
          status: filters.status,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setTreatments(response.data.treatments);
      setTotalPages(response.data.totalPages);
      setTotalTreatments(response.data.totalTreatments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/patient/treatments/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTodaysTreatments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get('/patient/treatments', {
        params: {
          dateFrom: today,
          dateTo: today
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTodaysTreatments(response.data.treatments);
    } catch (error) {
      console.error('Error fetching today\'s treatments:', error);
    }
  };

  const fetchPatientSettings = async () => {
    try {
      const response = await axios.get('/patient/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRequiredDailyTreatments(response.data.requiredDailyTreatments || 4);
    } catch (error) {
      console.error('Error fetching patient settings:', error);
    }
  };

  useEffect(() => {
    fetchTreatments();
    fetchStats();
    fetchTodaysTreatments();
    fetchPatientSettings();
  }, [currentPage, searchTerm, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchTreatments();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const groupTreatmentsByDate = () => {
    const grouped = {};
    
    treatments.forEach(treatment => {
      const phDate = convertToPHTime(treatment.TreatmentDate);
      const dateKey = phDate.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(treatment);
    });
    
    return grouped;
  };

  const groupedTreatments = groupTreatmentsByDate();

  const prepareChartData = () => {
    if (!treatments.length) return null;
    
    const last7Treatments = [...treatments].slice(0, 7).reverse();
    const labels = last7Treatments.map(t => 
      convertToPHTime(t.TreatmentDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
    );
    
    const volumeInData = last7Treatments.map(t => t.inSolution?.VolumeIn || 0);
    const volumeOutData = last7Treatments.map(t => t.outSolution?.VolumeOut || 0);
    const balanceData = last7Treatments.map(t => 
      (t.outSolution?.VolumeOut || 0) - (t.inSolution?.VolumeIn || 0)
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Volume In (mL)',
          data: volumeInData,
          backgroundColor: colors.secondary,
          borderColor: colors.primary,
          borderWidth: 1
        },
        {
          label: 'Volume Out (mL)',
          data: volumeOutData,
          backgroundColor: colors.green,
          borderColor: '#3a5f5e',
          borderWidth: 1
        },
        {
          label: 'Balance (mL)',
          data: balanceData,
          backgroundColor: colors.teal,
          borderColor: '#0b766e',
          borderWidth: 1,
          type: 'line',
          pointBackgroundColor: colors.white,
          pointBorderColor: colors.teal,
          pointBorderWidth: 2
        }
      ]
    };
  };

  const chartData = prepareChartData();

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return { bg: '#ECFDF5', text: '#047857' };
      case 'in progress':
        return { bg: '#E6F0FF', text: colors.primary };
      case 'scheduled':
        return { bg: '#FEF9E7', text: '#B45309' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getBalanceMessage = (treatment) => {
    const volumeIn = treatment.inSolution?.VolumeIn || 0;
    const volumeOut = treatment.outSolution?.VolumeOut || 0;
    const balance = volumeOut - volumeIn;

    if (balance > 0) {
      return {
        type: 'positive',
        title: '✅ Mas marami ang nailabas',
        english: `This is normal or desired — it means there is ultrafiltration. The body is removing excess fluid, which is a sign that the dialysis is working properly.`,
        tagalog: `Ito ay normal o kanais-nais — ibig sabihin ay may ultrafiltration. Natatanggal ang sobrang likido mula sa katawan, senyales na maayos ang pag-andar ng dialysis.`
      };
    } else if (balance < 0) {
      return {
        type: 'negative',
        title: '⚠️ Mas kaunti ang nailabas',
        english: `This may indicate fluid retention or a problem with the dialysis process. It should be closely monitored because it can lead to edema (swelling), high blood pressure, or fluid overload.`,
        tagalog: `Maaaring senyales ito ng pananatili ng sobrang likido sa katawan o problema sa dialysis. Dapat itong bantayan dahil maaaring magdulot ng pamamaga, mataas na presyon ng dugo, o sobrang likido sa katawan.`
      };
    }
    return null;
  };

  const toggleTreatmentDetails = (treatmentId) => {
    if (expandedTreatmentId === treatmentId) {
      setExpandedTreatmentId(null);
    } else {
      setExpandedTreatmentId(treatmentId);
    }
  };

  const completedToday = todaysTreatments.filter(t => t.TreatmentStatus === 'Completed').length;
  const remainingTreatments = Math.max(0, requiredDailyTreatments - completedToday);

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.gray
    }}>
      {/* Sidebar */}
      <PatientSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: '2rem',
        marginLeft: sidebarOpen ? '250px' : '0',
        transition: 'margin-left 0.3s ease',
        width: 'calc(100% - 250px)',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        <div style={{ 
          maxWidth: '1800px', 
          margin: '0 auto'
        }}>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: '700', 
            color: colors.primary, 
            marginBottom: '1.5rem'
          }}>
            Treatment History
          </h1>
          
          {/* Treatment Status Alert */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {remainingTreatments === 0 ? (
                <>
                  <FiCheckCircle size={32} color="#10B981" />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.primary }}>
                      Congratulations!
                    </h3>
                    <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>
                      You've completed all {requiredDailyTreatments} required treatments today.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FiAlertCircle size={32} color={colors.yellow} />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: colors.primary }}>
                      Today's Treatment Status
                    </h3>
                    <p style={{ color: '#6B7280', marginTop: '0.25rem' }}>
                      You've completed {completedToday} of {requiredDailyTreatments} required treatments today. 
                      {remainingTreatments > 0 && ` You have ${remainingTreatments} more to complete.`}
                    </p>
                  </div>
                </>
              )}
            </div>
            {remainingTreatments > 0 && (
              <button style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: colors.primary,
                color: colors.white,
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: colors.secondary
                }
              }}>
                Start New Treatment
              </button>
            )}
          </div>
          
          {/* Stats Overview */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem'
            }}>
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                padding: '1.75rem',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '0.875rem',
                    borderRadius: '12px',
                    backgroundColor: '#e6f0ff',
                    color: colors.primary,
                    marginRight: '1.25rem',
                    flexShrink: 0
                  }}>
                    <FiTrendingUp size={28} />
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.25rem' }}>Total Treatments</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.2' }}>{stats.totalTreatments}</p>
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                padding: '1.75rem',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '0.875rem',
                    borderRadius: '12px',
                    backgroundColor: '#e6f7f7',
                    color: colors.green,
                    marginRight: '1.25rem',
                    flexShrink: 0
                  }}>
                    <FiTrendingUp size={28} />
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.25rem' }}>Avg. Volume In</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.2' }}>{stats.avgVolumeIn} mL</p>
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                padding: '1.75rem',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '0.875rem',
                    borderRadius: '12px',
                    backgroundColor: '#fef2f2',
                    color: colors.red,
                    marginRight: '1.25rem',
                    flexShrink: 0
                  }}>
                    <FiTrendingDown size={28} />
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.25rem' }}>Avg. Balance</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '700', lineHeight: '1.2' }}>{stats.avgBalance} mL</p>
                  </div>
                </div>
              </div>
              
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                padding: '1.75rem',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '0.875rem',
                    borderRadius: '12px',
                    backgroundColor: '#fef9e7',
                    color: colors.yellow,
                    marginRight: '1.25rem',
                    flexShrink: 0
                  }}>
                    <FiClock size={28} />
                  </div>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '0.25rem' }}>Last Treatment</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.2' }}>
                      {stats.lastTreatmentDate ? formatDate(stats.lastTreatmentDate).split(',')[0] : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Charts */}
          {chartData && (
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              padding: '2rem',
              marginBottom: '2.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: colors.primary,
                marginBottom: '1.5rem'
              }}>
                Recent Treatment Volume
              </h2>
              <div style={{ height: '400px' }}>
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Volume (mL)',
                          font: {
                            size: 14,
                            weight: 'bold'
                          }
                        },
                        ticks: {
                          font: {
                            size: 12
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 12
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            size: 14
                          },
                          padding: 20
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${context.raw} mL`;
                          }
                        },
                        bodyFont: {
                          size: 14
                        },
                        titleFont: {
                          size: 16,
                          weight: 'bold'
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            <div>
              {/* Search and Filter Bar */}
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <div style={{ 
                    position: 'relative', 
                    flexGrow: 1,
                    minWidth: '400px'
                  }}>
                    <FiSearch style={{ 
                      position: 'absolute', 
                      left: '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#9ca3af',
                      fontSize: '1.25rem'
                    }} />
                    <input
                      type="text"
                      placeholder="Search treatments by status, dialysate, or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && fetchTreatments()}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem 0.875rem 3rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        outline: 'none',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s',
                        ':focus': {
                          borderColor: colors.secondary,
                          boxShadow: `0 0 0 3px ${colors.secondary}20`
                        }
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid',
                        borderColor: showFilters ? colors.secondary : '#d1d5db',
                        backgroundColor: showFilters ? '#f0f5ff' : colors.white,
                        color: showFilters ? colors.primary : '#374151',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      <FiFilter size={20} /> Filters
                    </button>
                    
                    <button
                      onClick={resetFilters}
                      style={{
                        padding: '0.875rem 1.5rem',
                        backgroundColor: colors.white,
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        ':hover': {
                          backgroundColor: '#f9fafb'
                        }
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                
                {/* Filter Dropdown */}
                {showFilters && (
                  <div style={{ 
                    marginTop: '1.5rem', 
                    paddingTop: '1.5rem', 
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '1rem', 
                          fontWeight: '500', 
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          Status
                        </label>
                        <select
                          name="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none',
                            fontSize: '1rem',
                            backgroundColor: colors.white,
                            transition: 'border-color 0.2s',
                            ':focus': {
                              borderColor: colors.secondary,
                              boxShadow: `0 0 0 3px ${colors.secondary}20`
                            }
                          }}
                        >
                          <option value="">All Statuses</option>
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Scheduled">Scheduled</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '1rem', 
                          fontWeight: '500', 
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          From Date
                        </label>
                        <input
                          type="date"
                          name="dateFrom"
                          value={filters.dateFrom}
                          onChange={handleFilterChange}
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none',
                            fontSize: '1rem',
                            backgroundColor: colors.white,
                            transition: 'border-color 0.2s',
                            ':focus': {
                              borderColor: colors.secondary,
                              boxShadow: `0 0 0 3px ${colors.secondary}20`
                            }
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '1rem', 
                          fontWeight: '500', 
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          To Date
                        </label>
                        <input
                          type="date"
                          name="dateTo"
                          value={filters.dateTo}
                          onChange={handleFilterChange}
                          min={filters.dateFrom}
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            outline: 'none',
                            fontSize: '1rem',
                            backgroundColor: colors.white,
                            transition: 'border-color 0.2s',
                            ':focus': {
                              borderColor: colors.secondary,
                              boxShadow: `0 0 0 3px ${colors.secondary}20`
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      marginTop: '1.5rem'
                    }}>
                      <button
                        onClick={applyFilters}
                        style={{
                          padding: '0.875rem 1.75rem',
                          backgroundColor: colors.primary,
                          color: colors.white,
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s',
                          ':hover': {
                            backgroundColor: colors.secondary
                          }
                        }}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Treatments List */}
              <div style={{ 
                backgroundColor: colors.white, 
                borderRadius: '0.75rem', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                {loading ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '20rem'
                  }}>
                    <div style={{ 
                      width: '4rem',
                      height: '4rem',
                      border: '4px solid #f3f4f6',
                      borderTop: `4px solid ${colors.primary}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : treatments.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem', 
                    color: '#6b7280',
                    fontSize: '1.125rem'
                  }}>
                    No treatments found matching your criteria
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid #e5e7eb' }}>
                    {Object.keys(groupedTreatments).map(dateKey => (
                      <div key={dateKey} style={{ padding: '2rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          marginBottom: '1.5rem', 
                          paddingBottom: '1rem',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <FiCalendar style={{ 
                            marginRight: '0.75rem', 
                            color: '#6b7280',
                            fontSize: '1.25rem'
                          }} />
                          <h3 style={{ 
                            fontSize: '1.375rem', 
                            fontWeight: '600', 
                            color: colors.primary
                          }}>
                            {convertToPHTime(dateKey).toLocaleDateString('en-PH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                        </div>
                        
                        <div style={{ overflowX: 'auto', borderRadius: '0.5rem' }}>
                          <table style={{ 
                            minWidth: '100%', 
                            borderCollapse: 'separate',
                            borderSpacing: 0
                          }}>
                            <thead style={{ backgroundColor: '#f9fafb' }}>
                              <tr>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Time
                                </th>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Volume In
                                </th>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Dialysate
                                </th>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Dwell
                                </th>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Volume Out
                                </th>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Balance
                                </th>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Status
                                </th>
                                <th style={{ 
                                  padding: '1rem 1.75rem',
                                  textAlign: 'left',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  Notes
                                </th>
                              </tr>
                            </thead>
                            <tbody style={{ backgroundColor: colors.white }}>
                              {groupedTreatments[dateKey].map((treatment) => {
                                const balanceMessage = getBalanceMessage(treatment);
                                
                                return (
                                  <React.Fragment key={treatment.Treatment_ID}>
                                    <tr style={{ 
                                      borderBottom: '1px solid #e5e7eb',
                                      transition: 'background-color 0.2s',
                                      ':hover': {
                                        backgroundColor: '#f9fafb'
                                      }
                                    }}>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        fontSize: '1rem',
                                        color: '#6b7280',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {convertToPHTime(treatment.TreatmentDate).toLocaleTimeString('en-PH', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </td>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        color: colors.primary,
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {treatment.inSolution?.VolumeIn || 'N/A'} mL
                                      </td>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        fontSize: '1rem',
                                        color: '#6b7280',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {treatment.inSolution?.Dialysate || 'N/A'}
                                      </td>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        fontSize: '1rem',
                                        color: '#6b7280',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {treatment.inSolution?.Dwell || 'N/A'}h
                                      </td>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        fontSize: '1rem',
                                        color: '#6b7280',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {treatment.outSolution?.VolumeOut || 'N/A'} mL
                                      </td>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        <span style={{ 
                                          color: (treatment.outSolution?.VolumeOut - treatment.inSolution?.VolumeIn) > 0 ? 
                                            '#10b981' : '#ef4444'
                                        }}>
                                          {(treatment.outSolution?.VolumeOut - treatment.inSolution?.VolumeIn) || 'N/A'} mL
                                        </span>
                                      </td>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        <span style={{ 
                                          padding: '0.5rem 1rem',
                                          display: 'inline-flex',
                                          fontSize: '0.875rem',
                                          fontWeight: '600',
                                          borderRadius: '9999px',
                                          backgroundColor: getStatusColor(treatment.TreatmentStatus).bg,
                                          color: getStatusColor(treatment.TreatmentStatus).text
                                        }}>
                                          {treatment.TreatmentStatus}
                                        </span>
                                      </td>
                                      <td style={{ 
                                        padding: '1.25rem 1.75rem',
                                        fontSize: '1rem',
                                        color: '#6b7280',
                                        whiteSpace: 'normal',
                                        maxWidth: '300px'
                                      }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span>{treatment.outSolution?.Notes || 'No notes'}</span>
                                          {balanceMessage && (
                                            <button 
                                              onClick={() => toggleTreatmentDetails(treatment.Treatment_ID)}
                                              style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: colors.primary,
                                                marginLeft: '1rem'
                                              }}
                                            >
                                              <FiInfo size={18} />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                    {expandedTreatmentId === treatment.Treatment_ID && balanceMessage && (
                                      <tr>
                                        <td colSpan="8" style={{ 
                                          padding: '1.25rem 1.75rem',
                                          backgroundColor: balanceMessage.type === 'positive' ? '#ECFDF5' : '#FEF2F2',
                                          borderLeft: `4px solid ${balanceMessage.type === 'positive' ? '#10B981' : '#EF4444'}`
                                        }}>
                                          <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                                            {balanceMessage.title} (e.g., ipinasok {treatment.inSolution?.VolumeIn || 0} mL, nailabas {treatment.outSolution?.VolumeOut || 0} mL)
                                          </div>
                                          <div style={{ display: 'flex', gap: '2rem' }}>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>English:</div>
                                              <div>{balanceMessage.english}</div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Tagalog:</div>
                                              <div>{balanceMessage.tagalog}</div>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {treatments.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '2rem'
                }}>
                  <div style={{ color: '#6b7280', fontSize: '1rem' }}>
                    Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalTreatments)} of {totalTreatments} treatments
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: currentPage === 1 ? '#e5e7eb' : colors.primary,
                        color: currentPage === 1 ? '#9ca3af' : colors.white,
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                        ':hover': {
                          backgroundColor: currentPage === 1 ? '#e5e7eb' : colors.secondary
                        }
                      }}
                    >
                      <FiChevronLeft size={20} /> Previous
                    </button>
                    
                    <div style={{ 
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              width: '3rem',
                              height: '3rem',
                              borderRadius: '0.5rem',
                              border: 'none',
                              backgroundColor: currentPage === pageNum ? colors.primary : '#f3f4f6',
                              color: currentPage === pageNum ? colors.white : '#6b7280',
                              cursor: 'pointer',
                              fontWeight: currentPage === pageNum ? '600' : '500',
                              fontSize: '1rem',
                              transition: 'all 0.2s',
                              ':hover': {
                                backgroundColor: currentPage === pageNum ? colors.primary : '#e5e7eb'
                              }
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '0.75rem 1.25rem',
                        backgroundColor: currentPage === totalPages ? '#e5e7eb' : colors.primary,
                        color: currentPage === totalPages ? '#9ca3af' : colors.white,
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                        ':hover': {
                          backgroundColor: currentPage === totalPages ? '#e5e7eb' : colors.secondary
                        }
                      }}
                    >
                      Next <FiChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTreatmentHistory;