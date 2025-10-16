import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiCalendar, 
  FiDroplet, 
  FiThermometer, 
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiPrinter
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PatientTreatmentHistoryModal = ({ show, onClose, patientId, apiBaseUrl }) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [expandedTreatments, setExpandedTreatments] = useState({});
  const [timeRange, setTimeRange] = useState('30d');
  const [showGraph, setShowGraph] = useState(true);

  useEffect(() => {
    if (show && patientId) {
      fetchPatientHistory();
    }
  }, [show, patientId, timeRange]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/doctor/patient-history/${patientId}?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient history');
      }

      const data = await response.json();
      
      if (data.success) {
        setPatient(data.patient);
      } else {
        throw new Error(data.message || 'Failed to load patient history');
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTreatmentExpansion = (treatmentId) => {
    setExpandedTreatments(prev => ({
      ...prev,
      [treatmentId]: !prev[treatmentId]
    }));
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateBalance = (volumeIn, volumeOut) => {
    const balance = volumeOut - volumeIn;
    return {
      value: balance,
      formatted: balance >= 0 ? `${balance}mL` : `${balance}mL`,
      isPositive: balance >= 0,
      interpretation: balance >= 0 
        ? 'Good: Excess fluid removed' 
        : 'Warning: Fluid retention detected'
    };
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'finished': return <FiCheckCircle className="status-icon finished" />;
      case 'ongoing': return <FiActivity className="status-icon ongoing" />;
      case 'scheduled': return <FiClock className="status-icon scheduled" />;
      case 'cancelled': return <FiAlertTriangle className="status-icon cancelled" />;
      default: return <FiInfo className="status-icon unknown" />;
    }
  };

  const prepareChartData = () => {
    if (!patient || !patient.treatments) return [];
    
    const dailyData = {};
    
    patient.treatments.forEach(treatment => {
      const date = new Date(treatment.treatmentDate).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: formatDate(date),
          volumeIn: 0,
          volumeOut: 0,
          netUF: 0,
          treatmentCount: 0
        };
      }
      
      dailyData[date].volumeIn += treatment.VolumeIn || 0;
      dailyData[date].volumeOut += treatment.VolumeOut || 0;
      dailyData[date].netUF += (treatment.VolumeOut || 0) - (treatment.VolumeIn || 0);
      dailyData[date].treatmentCount++;
    });
    
    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const calculateComplianceRate = () => {
    if (!patient || !patient.treatments) return 0;
    
    const treatmentsByDay = {};
    const today = new Date().toISOString().split('T')[0];
    
    patient.treatments.forEach(treatment => {
      const date = new Date(treatment.treatmentDate).toISOString().split('T')[0];
      if (date < today) {
        if (!treatmentsByDay[date]) {
          treatmentsByDay[date] = 0;
        }
        treatmentsByDay[date]++;
      }
    });
    
    const compliantDays = Object.values(treatmentsByDay).filter(count => count >= 3).length;
    const totalDays = Object.keys(treatmentsByDay).length;
    
    return totalDays > 0 ? Math.round((compliantDays / totalDays) * 100) : 0;
  };

  const calculateAverageUF = () => {
    if (!patient || !patient.treatments || patient.treatments.length === 0) return 0;
    
    let totalUF = 0;
    patient.treatments.forEach(treatment => {
      totalUF += (treatment.VolumeOut || 0) - (treatment.VolumeIn || 0);
    });
    
    return Math.round(totalUF / patient.treatments.length);
  };

  if (!show) return null;

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem' }}>Loading patient history...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0 }}>Patient History</h3>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <FiX />
            </button>
          </div>
          <p>No patient data available</p>
          <button 
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#395886',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
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
      overflowY: 'auto',
      padding: '2rem 0'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h2 style={{ 
              margin: 0,
              color: '#1e293b',
              fontSize: '1.5rem'
            }}>
              Treatment History for {patient.first_name} {patient.last_name}
            </h2>
            <p style={{ 
              margin: '0.25rem 0 0',
              color: '#64748b',
              fontSize: '0.875rem'
            }}>
              HN: {patient.hospitalNumber || 'N/A'} | {patient.gender || 'Unknown'}, {calculateAge(patient.date_of_birth)} years
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #cbd5e1',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={() => setShowGraph(!showGraph)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e2e8f0',
                color: '#475569',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {showGraph ? 'Hide Graph' : 'Show Graph'}
            </button>
            <button 
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#395886',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiX /> Close
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 80px)'
        }}>
          {/* Patient Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem',
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Total Treatments
              </h4>
              <p style={{ 
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                {patient.treatments?.length || 0}
              </p>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem',
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Compliance Rate
              </h4>
              <p style={{ 
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                {calculateComplianceRate()}%
              </p>
            </div>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                margin: '0 0 0.5rem',
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Average UF
              </h4>
              <p style={{ 
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '600',
                color: calculateAverageUF() >= 0 ? '#166534' : '#b91c1c'
              }}>
                {calculateAverageUF()}mL
              </p>
            </div>
          </div>

          {/* Graph Section */}
          {showGraph && patient.treatments?.length > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                margin: '0 0 1rem',
                color: '#1e293b',
                fontSize: '1.125rem'
              }}>
                Fluid Balance Trend
              </h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={prepareChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.split(',')[0]}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Volume (mL)', 
                        angle: -90, 
                        position: 'insideLeft',
                        fontSize: 12
                      }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.25rem'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="volumeIn" 
                      name="Volume In" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volumeOut" 
                      name="Volume Out" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netUF" 
                      name="Net UF" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Treatments List */}
          <h3 style={{ 
            margin: '0 0 1rem',
            color: '#1e293b',
            fontSize: '1.125rem'
          }}>
            Treatment Records
          </h3>
          
          {patient.treatments?.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#64748b',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px dashed #cbd5e1'
            }}>
              <p style={{ margin: 0 }}>No treatment records found for this patient</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {patient.treatments?.sort((a, b) => new Date(b.treatmentDate) - new Date(a.treatmentDate)).map(treatment => (
                <div 
                  key={treatment.treatmentID}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      cursor: 'pointer',
                      backgroundColor: expandedTreatments[treatment.treatmentID] ? '#f1f5f9' : 'transparent'
                    }}
                    onClick={() => toggleTreatmentExpansion(treatment.treatmentID)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {getStatusIcon(treatment.TreatmentStatus)}
                      <div>
                        <h4 style={{ 
                          margin: 0,
                          color: '#1e293b',
                          fontSize: '1rem'
                        }}>
                          {formatDate(treatment.treatmentDate)}
                        </h4>
                        <p style={{ 
                          margin: '0.25rem 0 0',
                          color: '#64748b',
                          fontSize: '0.875rem'
                        }}>
                          {treatment.dry_night && (
                            <span style={{
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              marginRight: '0.5rem'
                            }}>
                              Dry Night
                            </span>
                          )}
                          Balance: {calculateBalance(treatment.VolumeIn || 0, treatment.VolumeOut || 0).formatted}
                        </p>
                      </div>
                    </div>
                    <div>
                      {expandedTreatments[treatment.treatmentID] ? (
                        <FiChevronUp style={{ color: '#64748b' }} />
                      ) : (
                        <FiChevronDown style={{ color: '#64748b' }} />
                      )}
                    </div>
                  </div>
                  
                  {expandedTreatments[treatment.treatmentID] && (
                    <div style={{
                      padding: '1rem',
                      borderTop: '1px solid #e2e8f0',
                      backgroundColor: 'white'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h5 style={{ 
                            margin: '0 0 0.5rem',
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Volume In
                          </h5>
                          <p style={{ 
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1e293b'
                          }}>
                            {treatment.VolumeIn || 0}mL
                          </p>
                        </div>
                        <div>
                          <h5 style={{ 
                            margin: '0 0 0.5rem',
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Volume Out
                          </h5>
                          <p style={{ 
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1e293b'
                          }}>
                            {treatment.VolumeOut || 0}mL
                          </p>
                        </div>
                        <div>
                          <h5 style={{ 
                            margin: '0 0 0.5rem',
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Net UF
                          </h5>
                          <p style={{ 
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: calculateBalance(treatment.VolumeIn || 0, treatment.VolumeOut || 0).isPositive ? '#166534' : '#b91c1c'
                          }}>
                            {calculateBalance(treatment.VolumeIn || 0, treatment.VolumeOut || 0).formatted}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h5 style={{ 
                            margin: '0 0 0.5rem',
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Treatment Status
                          </h5>
                          <p style={{ 
                            margin: 0,
                            fontSize: '1rem',
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {getStatusIcon(treatment.TreatmentStatus)}
                            {treatment.TreatmentStatus || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <h5 style={{ 
                            margin: '0 0 0.5rem',
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Treatment Duration
                          </h5>
                          <p style={{ 
                            margin: 0,
                            fontSize: '1rem',
                            color: '#1e293b'
                          }}>
                            {treatment.Duration || 'Not recorded'}
                          </p>
                        </div>
                        <div>
                          <h5 style={{ 
                            margin: '0 0 0.5rem',
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}>
                            Notes
                          </h5>
                          <p style={{ 
                            margin: 0,
                            fontSize: '1rem',
                            color: '#1e293b'
                          }}>
                            {treatment.Notes || 'No notes'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export default PatientTreatmentHistoryModal;