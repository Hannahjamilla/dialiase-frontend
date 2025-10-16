import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiActivity, 
  FiX,
  FiPlus,
  FiMinus,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiInfo,
  FiClock,
  FiDroplet,
  FiFilter,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
  FiHeart,
  FiThermometer,
  FiBarChart2,
  FiThumbsUp,
  FiBell,
  FiMessageSquare,
  FiClipboard,
  FiUser,
  FiSearch
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import {
  calculateAge,
  formatDate,
  formatDateTime,
  formatTimeOnly,
  calculateDailyBalances,
  getStatusColor,
  getColorClass,
  analyzeTreatments,
  checkTodayTreatments,
  identifyMissedTreatments,
  prepareChartData,
  prepareAdherenceData,
  pdKnowledge,
  generateTreatmentSuggestions
} from './PatientTreatmentUtils';
import TreatmentSuggestions from './TreatmentSuggestions';

// Styled Components with clean, modern design
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background-color: #fff;
  border-radius: 12px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eaeaea;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 5;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  z-index: 10;
  
  &:hover {
    color: #333;
  }
`;

const ModalContent = styled.div`
  padding: 1.5rem;
`;

const InsightCard = styled.div`
  background-color: ${props => props.$type === 'warning' ? '#fff4e5' : 
                          props.$type === 'danger' ? '#ffecec' : 
                          props.$type === 'success' ? '#f0f9f4' : '#e8f4fd'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 0.8rem 1.2rem;
  background: ${props => props.$active ? '#f0f7ff' : 'transparent'};
  border: none;
  border-bottom: ${props => props.$active ? '3px solid #395886' : 'none'};
  color: ${props => props.$active ? '#395886' : '#6c757d'};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #f8f9fa;
    color: #395886;
  }
`;

const StatCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  height: 100%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const ColorIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 8px;
  display: inline-block;
`;

const SimpleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.8rem;
    text-align: left;
    border-bottom: 1px solid #eaeaea;
  }
  
  th {
    font-weight: 600;
    color: #4a5568;
    background-color: #f8f9fa;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const SuggestionButton = styled.button`
  background-color: #395886;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #2a406c;
  }
  
  &:disabled {
    background-color: #b0b0b0;
    cursor: not-allowed;
  }
`;

const AlertCard = styled.div`
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const AlertIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #6c757d;
  color: white;
  margin-right: 0.8rem;
  flex-shrink: 0;
`;

const AlertTypeBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: #6c757d20;
  color: #6c757d;
  text-transform: capitalize;
`;

const PatientTreatmentModal = ({ isOpen, onClose, patientId, patientName, hospitalNumber }) => {
  const [fontSize, setFontSize] = useState(16);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [todayTreatments, setTodayTreatments] = useState(0);
  const [missedTreatments, setMissedTreatments] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientData();
    }
  }, [isOpen, patientId]);


  const fetchPatientData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // Try both patientID and userID endpoints
    let response;
    try {
      response = await api.get(`/patient-treatments/${patientId}`);
    } catch (err) {
      // If patientID fails, try with userID
      console.log('Trying with userID instead...');
      response = await api.get(`/patient-treatments/${patientId}?type=user`);
    }
    
    if (response.data.success) {
      const data = response.data;
      
      // Process treatments to ensure proper data structure
      const processedTreatments = data.treatments.map(treatment => ({
        ...treatment,
        // Ensure balance is calculated correctly
        balance: treatment.Balances || (treatment.VolumeOut - treatment.VolumeIn),
        formattedBalance: treatment.Balances > 0 ? 
          `+${treatment.Balances}mL` : 
          `${treatment.Balances}mL`
      }));
      
      const processedData = {
        ...data,
        treatments: processedTreatments
      };
      
      setPatientData(processedData);
      
      const newInsights = analyzeTreatments(processedData);
      setInsights(newInsights);
      
      const todayCount = checkTodayTreatments(processedTreatments);
      setTodayTreatments(todayCount);
      
      const missed = identifyMissedTreatments(processedTreatments);
      setMissedTreatments(missed);
      
      console.log('Patient data loaded:', {
        patient: processedData.patient,
        treatmentsCount: processedData.treatments.length,
        treatments: processedData.treatments
      });
    } else {
      setError(response.data.message || 'Failed to load patient data');
      toast.error(response.data.message || 'Failed to load patient data');
    }
  } catch (err) {
    console.error('Error fetching patient data:', err);
    const errorMessage = err.response?.data?.message || 'Failed to load patient treatment data';
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleGenerateSuggestions = async () => {
    if (!patientData) return;
    
    setGeneratingSuggestions(true);
    
    try {
      const generatedSuggestions = await generateTreatmentSuggestions(patientData);
      setSuggestions(generatedSuggestions);
      setShowSuggestions(true);
      setActiveTab('suggestions');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate treatment suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  // Calculate data for display
  const { dailyData, totalBalance } = patientData ? calculateDailyBalances(patientData.treatments || []) : { dailyData: [], totalBalance: { formatted: '0mL', isPositive: false } };
  const chartData = prepareChartData(dailyData, dateRange);
  const adherenceData = prepareAdherenceData(patientData?.treatments || []);
  const ageData = patientData ? calculateAge(patientData.patient.date_of_birth) : { years: 'N/A', isAdult: null, classification: 'Unknown' };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#395886',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {patientName?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 style={{ 
                margin: 0,
                color: '#2c3e50',
                fontSize: '1.3rem'
              }}>{patientName || 'Patient'}</h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.3rem'
              }}>
                <div style={{
                  backgroundColor: '#f0f4f8',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ color: '#4a5568' }}>HN: </span>
                  <span style={{ fontWeight: '600' }}>{hospitalNumber || 'N/A'}</span>
                </div>

                <div style={{
                  backgroundColor: '#f0f4f8',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ color: '#4a5568' }}>Age: </span>
                  <span style={{ fontWeight: '600' }}>{ageData.years} {ageData.years !== 'N/A' && `(${ageData.classification})`}</span>
                </div>

                {patientData?.patient?.gender && (
                  <div style={{
                    backgroundColor: '#f0f4f8',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ color: '#4a5568' }}>Gender: </span>
                    <span style={{ fontWeight: '600' }}>{patientData.patient.gender}</span>
                  </div>
                )}

                {patientData?.patient?.modality && (
                  <div style={{
                    backgroundColor: '#e8f4fd',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ color: '#4a5568' }}>Modality: </span>
                    <span style={{ fontWeight: '600' }}>{patientData.patient.modality}</span>
                  </div>
                )}

                {patientData?.patient?.situationStatus && (
                  <div style={{
                    backgroundColor: patientData.patient.situationStatus === 'InEmergency' ? '#f8d7da' : 
                                   patientData.patient.situationStatus === 'WaitToResponse' ? '#fff4e5' : '#d4edda',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ color: '#4a5568' }}>Status: </span>
                    <span style={{ fontWeight: '600' }}>
                      {patientData.patient.situationStatus === 'AtHome' ? 'At Home' :
                       patientData.patient.situationStatus === 'InEmergency' ? 'In Emergency' :
                       patientData.patient.situationStatus === 'WaitToResponse' ? 'Waiting Response' : 
                       patientData.patient.situationStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => setFontSize(Math.max(14, fontSize - 1))}
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
              <FiMinus size={14} />
            </button>
            <button 
              onClick={() => setFontSize(Math.min(20, fontSize + 1))}
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
              <FiPlus size={14} />
            </button>
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </div>
        </ModalHeader>

        <TabContainer>
          <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </Tab>
          <Tab $active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
            Details
          </Tab>
          <Tab $active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')}>
            Analysis
          </Tab>
          <Tab $active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')}>
            PD Guide
          </Tab>
          <Tab $active={activeTab === 'suggestions'} onClick={() => setActiveTab('suggestions')}>
            Suggestions
          </Tab>
        </TabContainer>

        <ModalContent style={{ fontSize: `${fontSize}px` }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Spinner />
            </div>
          ) : error ? (
            <div style={{ 
              backgroundColor: '#fff4e5',
              borderRadius: '6px',
              padding: '1rem',
              borderLeft: '3px solid #ffa502',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiAlertTriangle style={{ color: '#ffa502' }} />
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <>
                  {/* Today's Status */}
                  <div style={{
                    backgroundColor: todayTreatments >= 3 ? '#d4edda' : '#f8d7da',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}>
                    {todayTreatments >= 3 ? (
                      <FiCheckCircle style={{ color: '#155724', fontSize: '1.5rem' }} />
                    ) : (
                      <FiAlertCircle style={{ color: '#721c24', fontSize: '1.5rem' }} />
                    )}
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem 0', color: todayTreatments >= 3 ? '#155724' : '#721c24' }}>
                        Today's Status
                      </h4>
                      <p style={{ margin: 0, color: todayTreatments >= 3 ? '#155724' : '#721c24' }}>
                        {todayTreatments >= 3 
                          ? `Completed all ${todayTreatments} treatments`
                          : `Only ${todayTreatments} of 3 treatments done`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ 
                      color: '#2c3e50',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FiActivity /> Key Stats
                    </h3>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '1rem'
                    }}>
                      <StatCard>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          color: '#395886'
                        }}>
                          <FiActivity /> Total
                        </div>
                        <div style={{ 
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: '#2c3e50'
                        }}>
                          {patientData?.treatments?.length || 0}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem',
                          color: '#7f8c8d'
                        }}>
                          treatments
                        </div>
                      </StatCard>
                      
                      <StatCard>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          color: '#e74c3c'
                        }}>
                          <FiDroplet /> Retention
                        </div>
                        <div style={{ 
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: '#2c3e50'
                        }}>
                          {dailyData.filter(day => day.netBalance > 0).length}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem',
                          color: '#7f8c8d'
                        }}>
                          fluid retention days
                        </div>
                      </StatCard>
                      
                      <StatCard>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          color: totalBalance.isPositive ? "#e74c3c" : "#28a745"
                        }}>
                          <FiDroplet /> Net Balance
                        </div>
                        <div style={{ 
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: totalBalance.isPositive ? '#dc3545' : '#28a745'
                        }}>
                          {totalBalance.formatted}
                        </div>
                        <div style={{ 
                          fontSize: '0.8rem',
                          color: '#7f8c8d'
                        }}>
                          {totalBalance.isPositive ? 'Fluid retained' : 'Fluid removed'}
                        </div>
                      </StatCard>

                      {patientData?.treatments && patientData.treatments.length > 0 && (
                        <StatCard>
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem',
                            color: '#9b59b6'
                          }}>
                            <FiActivity /> Adherence
                          </div>
                          <div style={{ 
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#2c3e50'
                          }}>
                            {Math.round((patientData.treatments.filter(t => 
                              t.TreatmentStatus && t.TreatmentStatus.toLowerCase() === 'completed'
                            ).length / patientData.treatments.length) * 100)}%
                          </div>
                          <div style={{ 
                            fontSize: '0.8rem',
                            color: '#7f8c8d'
                          }}>
                            treatment completion
                          </div>
                        </StatCard>
                      )}
                    </div>
                  </div>
                  
                  {/* Clinical Insights */}
                  {insights.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ 
                        color: '#2c3e50',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FiInfo /> Clinical Insights
                      </h3>
                      
                      {insights.slice(0, 3).map((insight, index) => (
                        <InsightCard key={index} $type={insight.type}>
                          <div style={{ 
                            fontSize: '1.2rem',
                            color: insight.type === 'warning' ? '#ffa502' : 
                                  insight.type === 'danger' ? '#dc3545' : 
                                  insight.type === 'success' ? '#28a745' : '#395886'
                          }}>
                            {insight.type === 'warning' || insight.type === 'danger' ? 
                              <FiAlertTriangle /> : <FiInfo />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '600',
                              marginBottom: '0.3rem',
                              color: '#2c3e50'
                            }}>
                              {insight.title}
                            </div>
                            <div style={{ 
                              marginBottom: '0.5rem',
                              color: '#4a5568',
                              fontSize: '0.95em'
                            }}>
                              {insight.message}
                            </div>
                          </div>
                        </InsightCard>
                      ))}
                    </div>
                  )}
                  
                  {/* Fluid Balance Chart */}
                  {chartData.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <h3 style={{ 
                          color: '#2c3e50',
                          margin: 0
                        }}>
                          Fluid Balance
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <FiFilter size={14} />
                          <select 
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            style={{ 
                              padding: '0.3rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              fontSize: '0.9rem'
                            }}
                          >
                            <option value={7}>7 days</option>
                            <option value={14}>14 days</option>
                            <option value={30}>30 days</option>
                            <option value={90}>90 days</option>
                            <option value="all">All dates</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ 
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '1rem',
                        border: '1px solid #eee',
                        height: '250px'
                      }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="date" stroke="#7f8c8d" />
                            <YAxis stroke="#7f8c8d" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                              }}
                              formatter={(value, name) => {
                                if (name === 'netUF') {
                                  return [`${value > 0 ? '+' : ''}${value}mL`, 'Net Balance'];
                                }
                                return [`${value}mL`, name === 'volumeIn' ? 'Volume In' : 'Volume Out'];
                              }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="volumeIn" 
                              name="In" 
                              fill="#638ECB" 
                            />
                            <Bar 
                              dataKey="volumeOut" 
                              name="Out" 
                              fill="#477977" 
                            />
                            <ReferenceLine y={0} stroke="#dc3545" strokeDasharray="3 3" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Generate Suggestions Button */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginTop: '2rem' 
                  }}>
                    <SuggestionButton 
                      onClick={handleGenerateSuggestions}
                      disabled={!patientData || generatingSuggestions}
                    >
                      <FiThumbsUp size={16} />
                      {generatingSuggestions ? 'Generating...' : 'Get Treatment Suggestions'}
                    </SuggestionButton>
                  </div>
                </>
              )}
              
              {activeTab === 'details' && (
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ 
                      color: '#2c3e50',
                      margin: 0
                    }}>
                      Treatment Details
                    </h3>
                    <div style={{ 
                      fontSize: '0.9rem',
                      color: '#7f8c8d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FiCalendar />
                      All dates ({dailyData.length} days)
                    </div>
                  </div>
                  
                  {dailyData.length > 0 ? (
                    dailyData.map((day, dayIndex) => (
                      <div key={dayIndex} style={{ 
                        marginBottom: '1.5rem',
                        border: '1px solid #eee',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.8rem 1rem',
                          backgroundColor: '#f8f9fa',
                          borderBottom: '1px solid #eee'
                        }}>
                          <div style={{ 
                            fontWeight: '500',
                            color: '#2c3e50'
                          }}>
                            {day.formattedDate}
                          </div>
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                          }}>
                            <div style={{ fontSize: '0.9rem' }}>
                              <span style={{ color: '#7f8c8d' }}>Treatments: </span>
                              <span style={{ fontWeight: '500' }}>{day.treatments.length}</span>
                              {day.treatments.length < 3 && (
                                <span style={{ 
                                  color: '#dc3545', 
                                  marginLeft: '0.5rem',
                                  fontSize: '0.8rem'
                                }}>
                                  <FiAlertTriangle style={{ display: 'inline', marginRight: '0.2rem' }} />
                                  Incomplete
                                </span>
                              )}
                            </div>
                            <div style={{ 
                              fontWeight: '500',
                              color: day.netBalance > 0 ? '#dc3545' : '#28a745',
                              backgroundColor: day.netBalance > 0 ? '#f8d7da' : '#d4edda',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.9rem'
                            }}>
                              {day.netBalance > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                              {day.netBalance > 0 ? `+${day.netBalance}mL` : `${day.netBalance}mL`}
                            </div>
                          </div>
                        </div>
                        
                        <SimpleTable>
                          <thead>
                            <tr>
                              <th>Volume In</th>
                              <th>Volume Out</th>
                              <th>Net</th>
                              <th>Solution Time</th>
                              <th>Drain Time</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {day.treatments.map((treatment, index) => {
                              const statusColor = getStatusColor(treatment.TreatmentStatus);
                              
                              return (
                                <tr key={index}>
                                  <td style={{ fontWeight: '500' }}>
                                    {treatment.VolumeIn || 0}mL
                                  </td>
                                  <td style={{ fontWeight: '500' }}>
                                    {treatment.VolumeOut || 0}mL
                                  </td>
                                  <td style={{
                                    fontWeight: '600',
                                    color: treatment.balance > 0 ? '#dc3545' : '#28a745'
                                  }}>
                                    {treatment.formattedBalance}
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.85rem' }}>
                                      {formatTimeOnly(treatment.InStarted)} - {formatTimeOnly(treatment.InFinished)}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '0.85rem' }}>
                                      {formatTimeOnly(treatment.DrainStarted)} - {formatTimeOnly(treatment.DrainFinished)}
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '4px',
                                      backgroundColor: `${statusColor}20`,
                                      color: statusColor,
                                      fontSize: '0.8rem',
                                      fontWeight: '500',
                                      textTransform: 'capitalize'
                                    }}>
                                      {treatment.TreatmentStatus || 'Recorded'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </SimpleTable>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '2rem',
                      textAlign: 'center',
                      color: '#7f8c8d'
                    }}>
                      No treatment records found
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'analysis' && (
                <div>
                  <h3 style={{ 
                    color: '#2c3e50',
                    marginBottom: '1rem'
                  }}>
                    Treatment Analysis
                  </h3>
                  
                  {adherenceData.length > 0 ? (
                    <div style={{
                      marginBottom: '2rem'
                    }}>
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '1.2rem',
                        border: '1px solid #eee',
                        height: '250px'
                      }}>
                        <h4 style={{ marginTop: 0, color: '#2c3e50' }}>Balance Analysis</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="date" stroke="#7f8c8d" />
                            <YAxis stroke="#7f8c8d" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                              }}
                              formatter={(value) => [`${value > 0 ? '+' : ''}${value}mL`, 'Net Balance']}
                            />
                            <Line
                              type="monotone"
                              dataKey="netUF"
                              name="Net Balance"
                              stroke="#ff7300"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                            <ReferenceLine y={0} stroke="#dc3545" strokeDasharray="3 3" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '2rem',  
                      textAlign: 'center',
                      color: '#7f8c8d',
                      marginBottom: '2rem'
                    }}>
                      No analysis data available
                    </div>
                  )}
                  
                  <h3 style={{
                    color: '#2c3e50',
                    marginBottom: '1rem'
                  }}>
                    Clinical Indicators
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid #eee'
                    }}>
                      <h4 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiDroplet /> Fluid Status
                      </h4>
                      <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>
                        {totalBalance.isPositive ? (
                          <div>
                            <p>Net fluid retention of <strong>{totalBalance.formatted}</strong>.</p>
                            <p>Review dry weight and sodium intake.</p>
                          </div>
                        ) : (
                          <div>
                            <p>Net fluid removal of <strong>{totalBalance.formatted.replace('-', '')}</strong>.</p>
                            <p>Monitor for dehydration signs.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid #eee'
                    }}>
                      <h4 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiActivity /> Adherence
                      </h4>
                      <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>
                        {patientData?.treatments && patientData.treatments.length > 0 ? (
                          <div>
                            <p>Adherence rate: <strong>{Math.round((patientData.treatments.filter(t => 
                              t.TreatmentStatus && t.TreatmentStatus.toLowerCase() === 'completed'
                            ).length / patientData.treatments.length) * 100)}%</strong></p>
                            <p>{Math.round((patientData.treatments.filter(t => 
                              t.TreatmentStatus && t.TreatmentStatus.toLowerCase() === 'completed'
                            ).length / patientData.treatments.length) * 100) >= 85 ? 
                              'Good adherence.' : 
                              'Review barriers to completion.'}</p>
                          </div>
                        ) : (
                            <p>No treatment data available.</p>
                          )}
                      </div>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid #eee'
                    }}>
                      <h4 style={{ marginTop: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiAlertTriangle /> Risks
                      </h4>
                      <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>
                        {insights.filter(i => i.type === 'danger').length > 0 ? (
                          <div>
                            <p><strong>{insights.filter(i => i.type === 'danger').length}</strong> critical issues.</p>
                            <p>Review clinical insights.</p>
                          </div>
                        ) : (
                            <p>No critical risks identified.</p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'knowledge' && (
                <div>
                  <h3 style={{ 
                    color: '#2c3e50',
                    marginBottom: '1rem'
                  }}>
                    PD Knowledge Guide
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.2rem'
                  }}>
                    {pdKnowledge.map((item, index) => (
                      <div key={index} style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        padding: '1.2rem',
                        border: '1px solid #eee',
                        height: '100%'
                      }}>
                        <h4 style={{ 
                          marginTop: 0, 
                          color: '#395886',
                          borderBottom: '2px solid #638ECB',
                          paddingBottom: '0.5rem',
                          fontSize: '1rem'
                        }}>
                          {item.title}
                        </h4>
                        <p style={{ color: '#4a5568', lineHeight: '1.5', fontSize: '0.95rem' }}>
                          {item.content}
                        </p>
                      </div>
                    ))}
                    
                    <div style={{
                      backgroundColor: '#f0f9f4',
                      borderRadius: '8px',
                      padding: '1.2rem',
                      border: '1px solid #d4edda',
                      gridColumn: '1 / -1'
                    }}>
                      <h4 style={{ 
                        marginTop: 0, 
                        color: '#477977',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <FiInfo /> Fluid Balance Guide
                      </h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.8rem',
                        marginTop: '0.8rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ColorIndicator color="#28a745" />
                          <span style={{ fontWeight: '500', color: '#28a745' }}>Negative:</span>
                          <span style={{ marginLeft: '0.3rem', fontSize: '0.9rem' }}>Good removal</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ColorIndicator color="#dc3545" />
                          <span style={{ fontWeight: '500', color: '#dc3545' }}>Positive:</span>
                          <span style={{ marginLeft: '0.3rem', fontSize: '0.9rem' }}>Needs attention</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ColorIndicator color="#ffc107" />
                          <span style={{ fontWeight: '500', color: '#ffc107' }}>Minimal:</span>
                          <span style={{ marginLeft: '0.3rem', fontSize: '0.9rem' }}>Monitor trend</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'suggestions' && (
                <TreatmentSuggestions 
                  suggestions={suggestions} 
                  patientData={patientData}
                  onGenerateNew={handleGenerateSuggestions}
                  generating={generatingSuggestions}
                />
              )}
            </>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PatientTreatmentModal;