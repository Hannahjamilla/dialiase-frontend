import React from 'react';
import { FiLogOut, FiCalendar, FiList, FiAlertTriangle, FiBell, FiAward, FiHeart, FiDroplet, FiInfo, FiPackage, FiShoppingCart } from 'react-icons/fi';
import PatientCheckups from './PatientSched';
import TreatmentStatus from './TreatmentStatus';
import HealthOverview from './HealthOverview';
import BuyMedprod from './BuyMedprod';
import TreatmentHistoryModal from './TreatmentHistoryModal';
import HandHygieneReminder from './HandHygieneReminder';
import DwellTimerModal from './DwellTimerModal';
import CustomNotification from '../../components/Notification';
import staffPic from "../../assets/images/staffPic.png";

import DoctorAlerts from './DoctorAlerts';
import MedsProd from "./MedsProd";
const PatientDashboardContent = ({
  user,
  notification,
  ongoingTreatment,
  treatmentLoading,
  treatmentHistory,
  historyLoading,
  drainAlarm,
  drainAlarmMessage,
  healthAlerts,
  healthTips,
  complianceStatus,
  missedDays,
  showHistoryModal,
  reminders,
  confirmationStatus,
  dailyLimitReached,
  firstTimeUser,
  navigate,
  termsAccepted,
  currentDateTime,
  showDwellTimer,
  isTimerMinimized,
  currentDwellTime,
  treatmentStartTime,
  isNewPatient,
  mobileMenuOpen,
  colors,
  handleLogout,
  handleCloseNotification,
  setShowHistoryModal,
  setIsTimerMinimized,
  handleEndTreatmentEarly,
  formatDateOnly,
  fetchDailyLimitStatus
}) => {
  
  const groupTreatmentsByDate = () => {
    const grouped = {};
    
    treatmentHistory.forEach(treatment => {
      const phDate = convertToPHTime(treatment.treatmentDate);
      const dateKey = phDate.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(treatment);
    });
    
    return grouped;
  };

  const convertToPHTime = (dateString) => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return new Date(date.getTime() + (8 * 60 * 60 * 1000));
  };

  const calculateBalance = (treatment) => {
    const volumeIn = treatment.inSolution?.VolumeIn || 0;
    const volumeOut = treatment.outSolution?.VolumeOut || 0;
    const balance = volumeOut - volumeIn;
    
    if (isNaN(balance)) return '---';
    
    if (volumeOut < volumeIn) {
      return `-${Math.abs(balance)}`;
    }
    return `${balance}`;
  };

  const groupedTreatments = groupTreatmentsByDate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: colors.lightBg,
      marginTop: mobileMenuOpen ? '850px' : '700px',
    }}>

      {/* Header */}
      <header style={{
        backgroundColor: "#ffffff",
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #eee',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {/* Logo / Brand */}
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.5rem', 
          fontWeight: 600,
          color: "#638ECB",
          letterSpacing: '0.5px'
        }}>
          DialiEase
        </h1>

        {/* User Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {/* Profile Circle with Initial */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#638ECB',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '1rem'
          }}>
            {user?.first_name?.charAt(0) || 'U'}
          </div>

          {/* Full Name + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1rem', color: "#333", fontWeight: '500' }}>
              {user?.first_name || 'User'} {user?.last_name || ''}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: "transparent",
                border: '1px solid #ddd',
                color: "#666",
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#638ECB";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.border = "1px solid #638ECB";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#666";
                e.currentTarget.style.border = "1px solid #ddd";
              }}
            >
              <FiLogOut size={16}/> Logout
            </button>
          </div>
        </div>
      </header>

      
      <main style={{
        flex: 1,
        padding: '2rem',
        transition: 'all 0.3s ease',
      }}>

        {/* Welcome Section */}
        <div style={{ 
          marginBottom: '2rem', 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          {/* Main Welcome Card */}
          <div style={{
            backgroundColor: colors.primary,
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '180px'
          }}>
            <div style={{ zIndex: 2, maxWidth: '65%' }}>
              <h1 style={{
                fontSize: '1.75rem',
                color: colors.white,
                margin: '0 0 0.5rem 0',
                fontWeight: '600'
              }}>Good Day, {user?.first_name || 'there'}!</h1>
              <p style={{
                fontSize: '1rem',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                Each session is part of your journey in managing your health — and you're handling it with courage.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem'
              }}>
                <FiHeart /> Progress, one step at a time.
              </div>
            </div>
            <img 
              src={staffPic} 
              alt="Healthcare professional" 
              style={{
                position: 'absolute',
                right: 0,
                height: '100%',
                borderRadius: '0 12px 12px 0',
                objectFit: 'cover',
                opacity: 0.9
              }}
            />
          </div>

          {/* First-time User Welcome or Missed Treatments Section */}
          {firstTimeUser ? (
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderLeft: `4px solid ${colors.info}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.info}15`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '1rem',
                  flexShrink: 0
                }}>
                  <FiAward style={{ 
                    color: colors.info,
                    fontSize: '1.25rem'
                  }} />
                </div>
                <div>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0',
                    color: colors.primary,
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}>Welcome to Your Dialysis Journey!</h3>
                  <p style={{
                    margin: 0,
                    color: '#666',
                    lineHeight: '1.5',
                    fontSize: '0.9rem'
                  }}>
                    We're here to support you every step of the way.
                  </p>
                </div>
              </div>
              
              <button 
                style={{
                  backgroundColor: colors.info,
                  color: colors.white,
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  alignSelf: 'flex-start',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => navigate('/patient-education')}
              >
                <FiInfo /> Learn More
              </button>
            </div>
          ) : (
            !firstTimeUser && missedDays && missedDays.length > 0 && treatmentHistory && treatmentHistory.length > 0 && (
              <div style={{
                backgroundColor: colors.white,
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderLeft: `4px solid ${colors.warning}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.warning}15`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '1rem',
                    flexShrink: 0
                  }}>
                    <FiAlertTriangle style={{ 
                      color: colors.warning,
                      fontSize: '1.25rem'
                    }} />
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0',
                      color: colors.primary,
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>Missed Treatments Detected</h3>
                    <p style={{
                      margin: 0,
                      color: '#666',
                      lineHeight: '1.5',
                      fontSize: '0.9rem'
                    }}>
                      You missed completing all treatments on <strong>{missedDays.length}</strong> day{missedDays.length > 1 ? 's' : ''} in the past week.
                    </p>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {missedDays.slice(0, 3).map((date, index) => (
                    <span key={index} style={{
                      backgroundColor: `${colors.warning}10`,
                      color: colors.warning,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                  {missedDays.length > 3 && (
                    <span style={{
                      backgroundColor: `${colors.warning}10`,
                      color: colors.warning,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      +{missedDays.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
        
        {/* Doctor Alerts */}
        <DoctorAlerts colors={colors} />

        {/* Reminders Section */}
        {reminders && reminders.length > 0 && (
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            borderLeft: `4px solid ${colors.warning}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: `${colors.warning}15`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '1rem'
              }}>
                <FiBell style={{ 
                  color: colors.warning,
                  fontSize: '1.1rem'
                }} />
              </div>
              <h3 style={{ 
                margin: 0,
                color: colors.primary,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>Important Reminders</h3>
            </div>
            
            <div style={{
              display: 'grid',
              gap: '0.75rem'
            }}>
              {reminders.map((reminder, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: reminder.type === 'urgent' ? `${colors.alert}08` : `${colors.secondary}08`,
                  padding: '1rem',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${reminder.type === 'urgent' ? colors.alert : colors.secondary}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      color: reminder.type === 'urgent' ? colors.alert : colors.primary,
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      {reminder.message}
                    </p>
                  </div>
                  {reminder.action && (
                    <button 
                      onClick={reminder.action}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: reminder.type === 'urgent' ? colors.alert : colors.secondary,
                        color: colors.white,
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Take Action
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {notification && (
          <CustomNotification
            message={notification.message}
            type={notification.type}
            onClose={handleCloseNotification}
          />
        )}

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Left Column - Treatment Information */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Treatment Status */}
            <TreatmentStatus 
              ongoingTreatment={ongoingTreatment}
              treatmentLoading={treatmentLoading}
              complianceStatus={complianceStatus}
              drainAlarm={drainAlarm}
              drainAlarmMessage={drainAlarmMessage}
              navigate={navigate}
              colors={colors}
              firstTimeUser={firstTimeUser}
            />

            {/* Treatment History */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: `1px solid ${colors.primary}10`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: `${colors.primary}08`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '1rem'
                  }}>
                    <FiList style={{
                      color: colors.primary,
                      fontSize: '1.1rem'
                    }} />
                  </div>
                  <h3 style={{ 
                    margin: 0,
                    color: colors.primary,
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>Recent Treatment History</h3>
                </div>
                {!firstTimeUser && (
                  <button 
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${colors.primary}50`,
                      color: colors.primary,
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    onClick={() => setShowHistoryModal(true)}
                  >
                    View Full History
                  </button>
                )}
              </div>

              {historyLoading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem 0'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    border: `3px solid ${colors.primary}15`,
                    borderTop: `3px solid ${colors.primary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                  }}></div>
                  <p style={{ 
                    margin: 0,
                    color: `${colors.primary}80`,
                    fontSize: '0.9rem'
                  }}>Loading treatment history...</p>
                </div>
              ) : firstTimeUser ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 1rem',
                  color: `${colors.primary}80`
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: `${colors.primary}08`,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <FiDroplet style={{
                      fontSize: '1.5rem',
                      color: colors.primary
                    }} />
                  </div>
                  <h4 style={{
                    margin: '0 0 0.75rem 0',
                    color: colors.primary,
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>No Treatment History Yet</h4>
                  <p style={{
                    margin: '0 0 1.5rem 0',
                    lineHeight: '1.5',
                    fontSize: '0.9rem'
                  }}>
                    Once you complete your first treatment, your history will appear here to help track your progress.
                  </p>
                </div>
              ) : treatmentHistory && treatmentHistory.length > 0 ? (
                <div>
                  {Object.keys(groupedTreatments).slice(0, 3).map(dateKey => (
                    <div key={dateKey} style={{ marginBottom: '1.5rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        paddingBottom: '0.75rem',
                        borderBottom: `1px solid ${colors.primary}10`
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: `${colors.primary}08`,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: '0.75rem'
                        }}>
                          <FiCalendar style={{
                            color: colors.primary,
                            fontSize: '1rem'
                          }} />
                        </div>
                        <h4 style={{ 
                          margin: 0,
                          color: colors.primary,
                          fontWeight: '500',
                          fontSize: '1rem'
                        }}>{formatDateOnly ? formatDateOnly(dateKey) : new Date(dateKey).toLocaleDateString()}</h4>
                      </div>
                      
                      <div style={{
                        overflowX: 'auto',
                        borderRadius: '6px',
                        border: `1px solid ${colors.primary}10`,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        marginBottom: '1rem'
                      }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          minWidth: '700px'
                        }}>
                          <thead>
                            <tr style={{
                              backgroundColor: `${colors.primary}05`,
                              textAlign: 'left'
                            }}>
                              {['Volume In', 'Dialysate', 'Dwell', 'Volume Out', 'Balance', 'Color', 'Status'].map((header) => (
                                <th key={header} style={{ 
                                  padding: '0.75rem',
                                  color: colors.primary,
                                  fontWeight: '500',
                                  fontSize: '0.85rem',
                                  whiteSpace: 'nowrap'
                                }}>{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {groupedTreatments[dateKey].map((treatment) => (
                              <tr key={treatment.Treatment_ID} style={{
                                borderBottom: `1px solid ${colors.primary}05`,
                              }}>
                                <td style={{ 
                                  padding: '0.75rem',
                                  color: colors.primary,
                                  fontSize: '0.85rem'
                                }}>{treatment.inSolution?.VolumeIn || 'N/A'} mL</td>
                                <td style={{ 
                                  padding: '0.75rem',
                                  color: colors.primary,
                                  fontSize: '0.85rem'
                                }}>{treatment.inSolution?.Dialysate || 'N/A'}%</td>
                                <td style={{ 
                                  padding: '0.75rem',
                                  color: colors.primary,
                                  fontSize: '0.85rem'
                                }}>{treatment.inSolution?.Dwell || 'N/A'}h</td>
                                <td style={{ 
                                  padding: '0.75rem',
                                  color: colors.primary,
                                  fontSize: '0.85rem'
                                }}>{treatment.outSolution?.VolumeOut || 'N/A'} mL</td>
                                <td style={{ 
                                  padding: '0.75rem',
                                  color: calculateBalance(treatment).startsWith('-') ? colors.alert : colors.primary,
                                  fontWeight: '500',
                                  fontSize: '0.85rem'
                                }}>
                                  {calculateBalance(treatment)} mL
                                </td>
                                <td style={{ 
                                  padding: '0.75rem',
                                  fontSize: '0.85rem'
                                }}>
                                  <div 
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '4px',
                                      backgroundColor: treatment.outSolution?.Color ? '#e3f2fd' : '#f0f0f0',
                                      border: `1px solid ${colors.primary}20`,
                                    }}
                                    title={treatment.outSolution?.Color || 'N/A'}
                                  />
                                </td>
                                <td style={{ 
                                  padding: '0.75rem',
                                  fontSize: '0.85rem'
                                }}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.35rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    backgroundColor: 
                                      treatment.TreatmentStatus?.toLowerCase() === 'completed' ? `${colors.success}15` : 
                                      treatment.TreatmentStatus?.toLowerCase() === 'in progress' ? `${colors.secondary}15` : `${colors.alert}15`,
                                    color: 
                                      treatment.TreatmentStatus?.toLowerCase() === 'completed' ? colors.success : 
                                      treatment.TreatmentStatus?.toLowerCase() === 'in progress' ? colors.secondary : colors.alert
                                  }}>
                                    {treatment.TreatmentStatus || 'Unknown'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 0',
                  color: `${colors.primary}80`
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No treatment history found for the last 30 days</p>
                </div>
              )}
              
              <HandHygieneReminder colors={colors} />
            </div>
          </div>

          {/* Right Column - Health Information */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Checkups Component */}
            <div style={{
              backgroundColor: colors.white,
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}>
              <PatientCheckups 
                dailyLimitReached={dailyLimitReached}
                fetchDailyLimitStatus={fetchDailyLimitStatus}
                colors={colors}
                firstTimeUser={firstTimeUser}
              />
            </div>

            {/* Medical Products Card */}
            <div style={{
  background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.lightBg} 100%)`,
  borderRadius: '18px',
  padding: '1.75rem',
  boxShadow: `
    0 8px 30px rgba(0,0,0,0.06),
    0 2px 4px rgba(0,0,0,0.02),
    inset 0 1px 0 rgba(255,255,255,0.9)
  `,
  border: `1px solid ${colors.gray200}`,
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Subtle Accent Background */}
  <div style={{
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80px',
    height: '80px',
    background: `linear-gradient(135deg, ${colors.green}08 0%, transparent 70%)`,
    borderRadius: '0 0 0 40px'
  }}></div>
  
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    position: 'relative',
    zIndex: 2
  }}>
    
    {/* Enhanced Icon Container */}
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '14px',
      background: `linear-gradient(135deg, ${colors.green} 0%, ${colors.green}cc 100%)`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      boxShadow: `
        0 6px 20px ${colors.green}30,
        0 2px 4px ${colors.green}15,
        inset 0 1px 0 rgba(255,255,255,0.2)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Icon Shine Effect */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '-10px',
        width: '20px',
        height: '20px',
        background: 'rgba(255,255,255,0.3)',
        borderRadius: '50%',
        filter: 'blur(8px)'
      }}></div>
      
      <FiPackage style={{ 
        color: colors.white,
        fontSize: '1.4rem',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
        position: 'relative',
        zIndex: 2
      }} />
    </div>
    
    {/* Enhanced Content */}
    <div style={{ flex: 1 }}>
      <h3 style={{ 
        margin: '0 0 0.4rem 0',
        color: colors.primary,
        fontSize: '1.2rem',
        fontWeight: '700',
        letterSpacing: '-0.01em',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Medical Store
      </h3>
      
      <p style={{
        margin: 0,
        color: colors.textMuted,
        fontSize: '0.88rem',
        lineHeight: '1.5',
        fontWeight: '500',
        maxWidth: '200px'
      }}>
        Premium medical supplies and equipment
      </p>
    </div>
    
    {/* Enhanced Button */}
    <button 
      onClick={() => navigate('/medical-products')}
      style={{
        padding: '0.75rem 1.5rem',
        background: `linear-gradient(135deg, ${colors.green} 0%, ${colors.green}dd 100%)`,
        color: colors.white,
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.82rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `
          0 4px 15px ${colors.green}30,
          0 1px 3px ${colors.green}15,
          inset 0 1px 0 rgba(255,255,255,0.2)
        `,
        whiteSpace: 'nowrap',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseOver={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = `
          0 8px 25px ${colors.green}40,
          0 2px 4px ${colors.green}20,
          inset 0 1px 0 rgba(255,255,255,0.3)
        `;
        e.target.style.background = `linear-gradient(135deg, ${colors.green}dd 0%, ${colors.green} 100%)`;
      }}
      onMouseOut={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = `
          0 4px 15px ${colors.green}30,
          0 1px 3px ${colors.green}15,
          inset 0 1px 0 rgba(255,255,255,0.2)
        `;
        e.target.style.background = `linear-gradient(135deg, ${colors.green} 0%, ${colors.green}dd 100%)`;
      }}
    >
      {/* Button Shine Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '50%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transform: 'skewX(-20deg)',
        transition: 'left 0.6s ease'
      }}></div>
      
      <FiShoppingCart size={16} style={{ position: 'relative', zIndex: 2 }} />
      <span style={{ position: 'relative', zIndex: 2 }}>Shop Now</span>
    </button>
  </div>
</div>
            
            <HealthOverview 
              healthAlerts={healthAlerts} 
              healthTips={healthTips} 
              navigate={navigate}
              colors={colors}
              firstTimeUser={firstTimeUser}
              hasOngoingTreatments={ongoingTreatment && ongoingTreatment.TreatmentStatus === 'Ongoing'}
            />
            
            
          </div>
        </div>
      </main>

      {/* Treatment History Modal */}
      {showHistoryModal && (
        <TreatmentHistoryModal 
          onClose={() => setShowHistoryModal(false)}
          patientId={user?.user_id}
          colors={colors}
        />
      )}

      {/* Dwell Timer Modal */}
      {showDwellTimer && currentDwellTime && ongoingTreatment && (
        <DwellTimerModal 
          dwellTime={currentDwellTime}
          onClose={() => {
            setShowDwellTimer(false);
            setIsTimerMinimized(false);
          }}
          onEndTreatment={handleEndTreatmentEarly}
          colors={colors}
          isMinimized={isTimerMinimized}
          onToggleMinimize={() => setIsTimerMinimized(!isTimerMinimized)}
        />
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 1200px) {
            .dashboard-grid {
              grid-template-columns: 1fr !important;
            }
            
            .welcome-section {
              grid-template-columns: 1fr !important;
            }
          }
          
          @media (max-width: 768px) {
            main {
              padding: 1rem !important;
            }
            
            header {
              padding: 1rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PatientDashboardContent;