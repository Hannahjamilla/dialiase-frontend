import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaThermometerHalf,
  FaTint,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaTimes,
  FaRegChartBar
} from 'react-icons/fa';
import { BsClipboard2Pulse, BsDropletHalf } from 'react-icons/bs';
import { GiKidneys } from 'react-icons/gi';
import { MdBloodtype } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const TreatmentReviewModal = ({ patientId, onClose }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalTreatments: 0,
    avgVolumeIn: 0,
    avgVolumeOut: 0,
    avgNetUF: 0,
    complianceRate: 0,
    abnormalColorCount: 0,
    fluidRetentionCount: 0
  });
  const [fontSize, setFontSize] = useState(16);
  const [showFluidGuide, setShowFluidGuide] = useState(false);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/patient/${patientId}/treatments`, {
          params: {
            search: searchTerm,
            date_from: dateFrom,
            date_to: dateTo
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          setTreatments(response.data.treatments);
          // Update stats from the API response
          setStats({
            totalTreatments: response.data.stats.total_treatments,
            avgVolumeIn: response.data.stats.avg_volume_in,
            avgVolumeOut: response.data.stats.avg_volume_out,
            avgNetUF: response.data.stats.avg_net_uf,
            complianceRate: response.data.stats.completed_treatments > 0 
              ? Math.round((response.data.stats.completed_treatments / response.data.stats.total_treatments) * 100)
              : 0,
            abnormalColorCount: response.data.stats.abnormal_colors,
            fluidRetentionCount: response.data.stats.fluid_retention_cases
          });
        } else {
          setError(response.data.message || 'Failed to fetch treatments');
        }
      } catch (err) {
        console.error('Error fetching treatments:', err);
        setError(err.response?.data?.message || 'Failed to fetch treatment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, [patientId, searchTerm, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const getColorClass = (color) => {
    if (!color) return '';
    color = color.toLowerCase();
    
    if (color === 'clear') return 'color-clear';
    if (color === 'yellow' || color === 'amber') return 'color-normal';
    return 'color-abnormal';
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': 
        return <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: '#28a74520',
          color: '#28a745',
          fontSize: '0.8rem',
          fontWeight: '500',
          textTransform: 'capitalize',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}><FaCheckCircle /> Completed</span>;
      case 'ongoing': 
        return <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: '#ffc10720',
          color: '#ffc107',
          fontSize: '0.8rem',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}>Ongoing</span>;
      case 'cancelled': 
        return <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: '#dc354520',
          color: '#dc3545',
          fontSize: '0.8rem',
          fontWeight: '500',
          textTransform: 'capitalize',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}><FaTimesCircle /> Cancelled</span>;
      default: 
        return <span style={{
          display: 'inline-block',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          backgroundColor: '#6c757d20',
          color: '#6c757d',
          fontSize: '0.8rem',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}>Unknown</span>;
    }
  };

  const calculateDailyBalances = () => {
    const dailyData = {};
    
    treatments.forEach(treatment => {
      const date = new Date(treatment.treatmentDate).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          formattedDate: formatDate(date),
          treatments: [],
          volumeIn: 0,
          volumeOut: 0,
          netBalance: 0,
          bloodPressure: treatment.BloodPressure || null
        };
      }
      
      const balance = (treatment.VolumeIn || 0) - (treatment.VolumeOut || 0);
      
      dailyData[date].treatments.push({
        ...treatment,
        balance: balance,
        formattedBalance: balance > 0 ? `+${balance}mL` : `${balance}mL`,
        interpretation: balance <= 0 
          ? 'Good: Excess fluid removed' 
          : 'Warning: Fluid retention detected'
      });
      
      dailyData[date].volumeIn += treatment.VolumeIn || 0;
      dailyData[date].volumeOut += treatment.VolumeOut || 0;
      dailyData[date].netBalance += balance;
      
      if (!dailyData[date].bloodPressure && treatment.BloodPressure) {
        dailyData[date].bloodPressure = treatment.BloodPressure;
      }
    });
    
    let totalBalance = 0;
    Object.values(dailyData).forEach(day => {
      totalBalance += day.netBalance;
    });
    
    return {
      dailyData: Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date)),
      totalBalance: {
        value: totalBalance,
        formatted: totalBalance > 0 ? `+${totalBalance}mL` : `${totalBalance}mL`,
        isPositive: totalBalance > 0,
        interpretation: totalBalance <= 0 
          ? 'Good: Overall fluid removal' 
          : 'Warning: Overall fluid retention'
      }
    };
  };

  const { dailyData, totalBalance } = calculateDailyBalances();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const treatmentFrequency = () => {
    if (dailyData.length < 2) return 'Insufficient data';
    
    const firstDate = new Date(dailyData[dailyData.length - 1].date);
    const lastDate = new Date(dailyData[0].date);
    const daysBetween = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    const treatmentsPerWeek = (dailyData.length / daysBetween) * 7;
    
    if (treatmentsPerWeek > 5) return 'Intensive (6-7 times/week)';
    if (treatmentsPerWeek > 3) return 'Standard (4-5 times/week)';
    return 'Minimal (1-3 times/week)';
  };

  const averageFluidRemoval = () => {
    if (dailyData.length === 0) return 'N/A';
    
    const totalRemoval = dailyData.reduce((sum, day) => sum + day.volumeOut, 0);
    const avgRemoval = totalRemoval / dailyData.length;
    
    return `${Math.round(avgRemoval)}mL per session`;
  };

  const prepareChartData = () => {
    return dailyData
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14)
      .map(day => ({
        date: day.formattedDate,
        volumeIn: day.volumeIn,
        volumeOut: day.volumeOut,
        netUF: day.netBalance,
        treatmentCount: day.treatments.length
      }));
  };

  const chartData = prepareChartData();

  const getFluidGuideText = () => {
    return {
      negative: 'Good, excess fluid removed (Volume Out greater than Volume In)',
      positive: 'Warning, fluid retention detected (Volume In greater than Volume Out)'
    };
  };

  const fluidGuide = getFluidGuideText();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '95%',
          maxWidth: '1400px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
          position: 'relative',
          fontSize: `${fontSize}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 5
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#6f42c1',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1.5rem',
              fontSize: '1.2rem'
            }}>
              <BsClipboard2Pulse />
            </div>
            <div>
              <h2 style={{ 
                margin: 0,
                color: '#2c3e50',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Treatment History Review
              </h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.8rem',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: '#f0f4f8',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px'
                }}>
                  <span style={{ 
                    color: '#4a5568',
                    fontWeight: '500',
                    fontSize: '0.8rem'
                  }}>Patient ID:</span>
                  <span style={{ 
                    color: '#2c3e50',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>{patientId}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: '#f0f4f8',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px'
                }}>
                  <span style={{ 
                    color: '#4a5568',
                    fontWeight: '500',
                    fontSize: '0.8rem'
                  }}>Total Treatments:</span>
                  <span style={{ 
                    color: '#2c3e50',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>{stats.totalTreatments}</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: '#f0f4f8',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px'
                }}>
                  <span style={{ 
                    color: '#4a5568',
                    fontWeight: '500',
                    fontSize: '0.8rem'
                  }}>Compliance Rate:</span>
                  <span style={{ 
                    color: '#2c3e50',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>{stats.complianceRate}%</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
              style={{
                background: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.8rem' }}>A-</span>
            </button>
            <button 
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              style={{
                background: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.3rem 0.6rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.8rem' }}>A+</span>
            </button>
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6c757d',
                zIndex: 10
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Doctor's Quick Assessment Section */}
          <div style={{ 
            marginBottom: '2rem',
            backgroundColor: '#f8fafc',
            borderLeft: '4px solid #3498db',
            padding: '1rem',
            borderRadius: '4px'
          }}>
            <h3 style={{ 
              color: '#2c3e50',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BsClipboard2Pulse /> Treatment Summary
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                padding: '1rem',
                border: '1px solid #eee',
                position: 'relative'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#2c3e50'
                }}>
                  <GiKidneys /> Kidney Function Status
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: '#4a5568',
                  lineHeight: '1.5'
                }}>
                  {totalBalance.isPositive ? (
                    <>
                      <span style={{ color: '#e53e3e', fontWeight: '500' }}>Fluid Overload Detected</span> - Consider adjusting UF goals. Total fluid retention: {totalBalance.formatted}. Patient may need stricter fluid restrictions.
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#38a169', fontWeight: '500' }}>Adequate Fluid Removal</span> - Current UF goals appear appropriate. Total fluid removed: {totalBalance.formatted.replace('-', '')}.
                    </>
                  )}
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                padding: '1rem',
                border: '1px solid #eee'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#2c3e50'
                }}>
                  <BsDropletHalf /> Fluid Management
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: '#4a5568',
                  lineHeight: '1.5'
                }}>
                  {dailyData.filter(day => day.netBalance > 0).length > dailyData.length * 0.3 ? (
                    <>
                      <span style={{ color: '#e53e3e', fontWeight: '500' }}>Frequent Fluid Retention</span> - {dailyData.filter(day => day.netBalance > 0).length} of {dailyData.length} days show retention. Review dietary counseling and consider adjusting dialysis prescription.
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#38a169', fontWeight: '500' }}>Stable Fluid Balance</span> - Patient appears compliant with fluid restrictions. Only {dailyData.filter(day => day.netBalance > 0).length} of {dailyData.length} days show retention.
                    </>
                  )}
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                padding: '1rem',
                border: '1px solid #eee'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: '#2c3e50'
                }}>
                  <FaThermometerHalf /> Treatment Frequency
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: '#4a5568',
                  lineHeight: '1.5'
                }}>
                  <span style={{ fontWeight: '500' }}>{treatmentFrequency()}</span> - Average fluid removal: {averageFluidRemoval()}. Consider adjusting frequency if symptoms persist.
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '6px',
                padding: '1rem',
                border: '1px solid #eee',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: '#f0f4f8'
                }
              }} onClick={() => setShowFluidGuide(!showFluidGuide)}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: showFluidGuide ? '0.5rem' : 0,
                  color: '#2c3e50'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaInfoCircle /> Fluid Balance Guide
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>
                    {showFluidGuide ? 'Hide' : 'Show'}
                  </div>
                </div>
                {showFluidGuide && (
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: '#4a5568',
                    lineHeight: '1.5',
                    marginTop: '0.5rem'
                  }}>
                    <div style={{ marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: '500', color: '#38a169' }}>Negative (-) Balance:</span> {fluidGuide.negative}
                    </div>
                    <div>
                      <span style={{ fontWeight: '500', color: '#e53e3e' }}>Positive (+) Balance:</span> {fluidGuide.positive}
                    </div>
                    <div style={{ 
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: '#fff4e5',
                      borderRadius: '4px',
                      borderLeft: '3px solid #ffa502'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <FaInfoCircle style={{ color: '#ffa502', flexShrink: 0 }} />
                        <div>
                          <strong>Clinical Note:</strong> Persistent positive balance may indicate inadequate dialysis, non-compliance with fluid restrictions, or cardiac dysfunction.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Treatment Controls */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '1rem',
                  color: '#7f8c8d',
                  fontSize: '0.9rem'
                }} />
                <input
                  type="text"
                  placeholder="Search treatments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem 0.5rem 2.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)} 
                style={{
                  background: showFilters ? '#6f42c1' : '#f8f9fa',
                  color: showFilters ? '#fff' : '#2c3e50',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                <FaFilter /> Filters
              </button>
            </div>

            {showFilters && (
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                padding: '1rem',
                border: '1px solid #eee',
                marginBottom: '1rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>Date Range</label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      flex: 1,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <FaCalendarAlt style={{
                        position: 'absolute',
                        left: '1rem',
                        color: '#7f8c8d',
                        fontSize: '0.9rem'
                      }} />
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="From"
                        style={{
                          flex: 1,
                          padding: '0.5rem 1rem 0.5rem 2.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <span style={{ color: '#7f8c8d' }}>to</span>
                    <div style={{
                      flex: 1,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <FaCalendarAlt style={{
                        position: 'absolute',
                        left: '1rem',
                        color: '#7f8c8d',
                        fontSize: '0.9rem'
                      }} />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="To"
                        style={{
                          flex: 1,
                          padding: '0.5rem 1rem 0.5rem 2.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <button 
                    onClick={clearFilters}
                    style={{
                      background: 'none',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '0.5rem 1rem',
                      cursor: 'pointer',
                      color: '#6c757d',
                      transition: 'all 0.2s',
                      ':hover': {
                        backgroundColor: '#f1f1f1'
                      }
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              color: '#4a5568'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}></div>
              Loading treatment history...
            </div>
          ) : error ? (
            <div style={{
              backgroundColor: '#fff4e5',
              borderRadius: '6px',
              padding: '1.5rem',
              borderLeft: '4px solid #ffa502',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <FaTimesCircle style={{ 
                color: '#e53e3e',
                fontSize: '1.5rem',
                flexShrink: 0
              }} />
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Error Loading Data</h4>
                <p style={{ margin: 0, color: '#4a5568' }}>{error}</p>
              </div>
            </div>
          ) : treatments.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              color: '#4a5568',
              textAlign: 'center'
            }}>
              <FaHistory style={{ 
                fontSize: '2rem',
                color: '#a0aec0',
                marginBottom: '1rem'
              }} />
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>No Treatments Found</h4>
              <p style={{ margin: 0 }}>No treatments match your current search criteria</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                  borderLeft: '4px solid #3498db'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#3498db'
                  }}>
                    <BsClipboard2Pulse /> Total Treatments
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}>
                    {stats.totalTreatments}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: '#7f8c8d',
                    marginTop: '0.3rem'
                  }}>
                    Across {dailyData.length} days
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                  borderLeft: '4px solid #e74c3c'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#e74c3c'
                  }}>
                    <FaThermometerHalf /> Fluid Retention Days
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}>
                    {stats.fluidRetentionCount}
                    <div style={{ 
                      fontSize: '0.8rem',
                      color: '#7f8c8d',
                      marginTop: '0.3rem'
                    }}>
                      {Math.round((stats.fluidRetentionCount / dailyData.length) * 100)}% of days
                    </div>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                  borderLeft: '4px solid #28a745'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#28a745'
                  }}>
                    <FaTint /> Net UF (Balance)
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: totalBalance.isPositive ? '#dc3545' : '#28a745'
                  }}>
                    {totalBalance.formatted}
                    <div style={{ 
                      fontSize: '0.8rem',
                      color: '#7f8c8d',
                      marginTop: '0.3rem'
                    }}>
                      {totalBalance.interpretation}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                  borderLeft: '4px solid #6f42c1'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#6f42c1'
                  }}>
                    <FaTint /> Average Daily UF
                  </div>
                  <div style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}>
                    {dailyData.length > 0 
                      ? (totalBalance.value / dailyData.length > 0 
                          ? `+${Math.round(totalBalance.value / dailyData.length)}mL`
                          : `${Math.round(totalBalance.value / dailyData.length)}mL`)
                      : '0mL'}
                    <div style={{ 
                      fontSize: '0.8rem',
                      color: '#7f8c8d',
                      marginTop: '0.3rem'
                    }}>
                      Per day average
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: '#2c3e50',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaRegChartBar /> Treatment History (Last 14 Days)
                </h3>
                <div style={{ 
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid #eee',
                  height: '350px'
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="date" stroke="#7f8c8d" />
                      <YAxis yAxisId="left" stroke="#7f8c8d" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name) => {
                          if (name === 'netUF') {
                            const isPositive = value > 0;
                            return [`${isPositive ? '+' : ''}${value}mL`, name];
                          }
                          return [`${value}mL`, name];
                        }}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="volumeIn" 
                        name="Volume In (mL)" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="volumeOut" 
                        name="Volume Out (mL)" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="netUF" 
                        name="Net UF (mL)" 
                        stroke="#ff7300" 
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Treatment List Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ 
                    color: '#2c3e50',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BsClipboard2Pulse /> Treatment Details
                  </h3>
                  <div style={{ 
                    fontSize: '0.9rem',
                    color: '#7f8c8d'
                  }}>
                    Showing {treatments.length} treatments
                  </div>
                </div>
                
                <div style={{ 
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                    padding: '0.8rem 1rem',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #eee',
                    fontWeight: '500',
                    color: '#2c3e50',
                    fontSize: '0.9rem',
                    gap: '0.5rem'
                  }}>
                    <div>Date</div>
                    <div>Volume In</div>
                    <div>Volume Out</div>
                    <div>
                      Net UF (Balance)
                      <div style={{ 
                        fontSize: '0.7rem',
                        fontWeight: 'normal',
                        color: '#7f8c8d'
                      }}>
                        Input - Output
                      </div>
                    </div>
                    <div>Color</div>
                    <div>Status</div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#fff',
                    borderRadius: '0 0 8px 8px'
                  }}>
                    {treatments.map((treatment, index) => {
                      const netUF = (treatment.VolumeOut || 0) - (treatment.VolumeIn || 0);
                      const isPositive = netUF >= 0;
                      const colorClass = getColorClass(treatment.Color);
                      
                      return (
                        <div key={index} style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                          padding: '0.8rem 1rem',
                          borderBottom: index === treatments.length - 1 ? 'none' : '1px solid #eee',
                          fontSize: '0.9rem',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <div>
                            {formatDate(treatment.treatmentDate)}
                          </div>
                          <div style={{ fontWeight: '500' }}>
                            {treatment.VolumeIn || 0}mL
                          </div>
                          <div style={{ fontWeight: '500' }}>
                            {treatment.VolumeOut || 0}mL
                          </div>
                          <div style={{
                            fontWeight: '600',
                            color: isPositive ? '#28a745' : '#dc3545'
                          }}>
                            {isPositive ? '+' : ''}{netUF}mL
                          </div>
                          <div>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: colorClass === 'color-clear' ? '#e3f2fd' : 
                                          colorClass === 'color-normal' ? '#e8f5e9' : '#ffebee',
                              color: colorClass === 'color-clear' ? '#1976d2' : 
                                  colorClass === 'color-normal' ? '#2e7d32' : '#c62828',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}>
                              {treatment.Color || 'N/A'}
                            </span>
                          </div>
                          <div>
                            {getStatusBadge(treatment.TreatmentStatus)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentReviewModal;