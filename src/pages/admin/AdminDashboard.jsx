import React, { useEffect, useState, useMemo } from 'react';
import { 
  FaUserMd, 
  FaUserInjured, 
  FaBell,
  FaTrash,
  FaUserNurse,
  FaPlus,
  FaCheck,
  FaCog,
  FaCalendarCheck,
  FaSyncAlt,
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaFileMedical,
  FaClinicMedical,
  FaRegClock,
  FaBars
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import AdminSidebar from './AdminSidebar';
import AdminMetrics from './AdminMetrics';
import Notification from '../../components/Notification';
import Calendar from "../../components/Calendar/calendar";
import adminPic from "../../assets/images/adminPic.png";
import AgeDistributionChart from './AgeDistributionChart';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState("");
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [appointmentCounts, setAppointmentCounts] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      setUser(loggedInUser);
      showNotification(`Welcome back, ${loggedInUser.first_name}!`, 'success');
      fetchReminders();
      fetchDashboardStats();
      fetchAppointmentCounts();
    }
  }, [navigate]);

  const fetchReminders = async () => {
    setLoadingReminders(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        const formattedReminders = response.data.data.map(reminder => ({
          ...reminder,
          date: reminder.date || new Date().toISOString().split('T')[0],
          completed: Boolean(reminder.completed)
        }));
        setReminders(formattedReminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to load reminders';
      showNotification(errorMsg, 'error');
    } finally {
      setLoadingReminders(false);
    }
  };

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setDashboardStats(response.data.data);
      } else {
        showNotification(response.data.message || 'Failed to load dashboard statistics', 'error');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to load dashboard statistics';
      showNotification(errorMsg, 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAppointmentCounts = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/appointment-counts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        setAppointmentCounts(response.data.data);
      } else {
        showNotification(response.data.message || 'Failed to load appointment counts', 'error');
      }
    } catch (error) {
      console.error('Error fetching appointment counts:', error);
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to load appointment counts';
      showNotification(errorMsg, 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid date';
    }
  };

  const addReminder = async () => {
    if (!newReminder.trim()) {
      showNotification("Reminder text cannot be empty", "warning");
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/admin/reminders',
        {
          text: newReminder.trim(),
          date: new Date().toISOString().split('T')[0],
          completed: false
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setReminders([{
          id: response.data.data.id,
          text: response.data.data.text,
          date: response.data.data.date,
          completed: response.data.data.completed,
          created_at: response.data.data.created_at
        }, ...reminders]);
        setNewReminder("");
        showNotification("Reminder added successfully!", "success");
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      const errorMsg = error.response?.data?.message || 
                      "Failed to add reminder";
      showNotification(errorMsg, "error");
    }
  };

  const toggleReminder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const reminder = reminders.find(r => r.id === id);
      
      const response = await axios.put(
        `http://localhost:8000/api/admin/reminders/${id}`,
        { completed: !reminder.completed },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setReminders(reminders.map(r => 
          r.id === id ? {...r, completed: !r.completed} : r
        ));
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      showNotification("Failed to update reminder", "error");
    }
  };

  const deleteReminder = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:8000/api/admin/reminders/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setReminders(reminders.filter(r => r.id !== id));
        showNotification("Reminder deleted successfully", "success");
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      showNotification("Failed to delete reminder", "error");
    }
  };

  const refreshReminders = async () => {
    await fetchReminders();
  };

  const refreshDashboard = async () => {
    await fetchDashboardStats();
    await fetchAppointmentCounts();
    await fetchReminders();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
      
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
            
          }}></div>
          <p style={{ color: '#4b5563', margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userInitials = user ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}` : '';

  return (
    <div style={{
      display: 'flex',
      flexDirection: windowWidth <= 768 ? 'column' : 'row',
      gap: '1.5rem',
      padding: windowWidth <= 768 ? '1rem' : '2rem',
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: '#f8f9fa',
      color: '#2c3e50',
      minHeight: '100vh',
      position: 'relative',
      marginTop: '-450px',
      width: '100%',
      marginRight:'40px',
    
      
    }}>
      {/* Mobile Sidebar Toggle Button */}
      {windowWidth <= 768 && (
        <button 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1001,
            background: '#395886',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar - Conditionally rendered based on screen size */}
      {(sidebarOpen || windowWidth > 768) && (
        <div style={{
          position: windowWidth <= 768 ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          zIndex: 1000,
          width: windowWidth <= 768 ? '280px' : 'auto',
          height: windowWidth <= 768 ? '100vh' : 'auto',
          backgroundColor: windowWidth <= 768 ? 'rgba(0,0,0,0.5)' : 'transparent',
          display: 'flex'
        }}>
          <AdminSidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onClose={() => setSidebarOpen(false)}
            isMobile={windowWidth <= 768}
          />
          {windowWidth <= 768 && (
            <div 
              style={{
                flex: 1,
                backgroundColor: 'transparent'
              }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      )}
      
      <main style={{
        flex: '2.5',
        marginLeft: windowWidth > 768 ? '280px' : '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '100%',
        marginTop: windowWidth <= 768 ? '60px' : '0'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: windowWidth <= 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: windowWidth <= 768 ? 'flex-start' : 'center',
          marginBottom: '1rem',
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          gap: windowWidth <= 768 ? '1rem' : '0'
        }}>
          <div>
            <h1 style={{
              fontSize: windowWidth <= 768 ? '1.5rem' : '1.8rem',
              margin: 0,
              color: '#395886',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: '600'
            }}>
              <FaUserMd style={{ color: '#477977' }} />
              CAPD Admin Homepage
            </h1>
            <p style={{
              margin: '0.25rem 0 0 0',
              color: '#7f8c8d',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <FaRegClock style={{ fontSize: '0.8rem' }} />
              {currentDateTime.toLocaleTimeString()}, {currentDateTime.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              width: windowWidth <= 480 ? '100%' : 'auto'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#395886',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem',
                flexShrink: 0
              }}>
                {userInitials}
              </div>
              <div style={{
                display: windowWidth <= 480 ? 'none' : 'block'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '0.9rem'
                }}>{user.first_name} {user.last_name}</span>
                <span style={{
                  color: '#7f8c8d',
                  fontSize: '0.75rem',
                  display: 'block'
                }}>Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={handleCloseNotification}
          />
        )}

        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #395886 0%, #2c3e50 100%)',
          borderRadius: '16px',
          padding: windowWidth <= 768 ? '1.5rem' : '2rem',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: windowWidth <= 768 ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          height: windowWidth <= 768 ? 'auto' : '250px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            maxWidth: windowWidth <= 768 ? '100%' : '60%',
            zIndex: '2',
            marginBottom: windowWidth <= 768 ? '1.5rem' : '0'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>Good Day, {user.first_name}!</h2>
            <p style={{
              margin: '0 0 1.5rem 0',
              fontSize: '0.95rem',
              opacity: '0.9',
              lineHeight: '1.5'
            }}>
              You have full system access to manage users, appointments, and system settings. 
              Here's what's happening with your hospital today.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaUsers />
                <span>{dashboardStats?.doctorCount + dashboardStats?.nurseCount || 0} CAPD employees</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaUserInjured />
                <span>{dashboardStats?.patientCount || 0} patients registered</span>
              </div>
            </div>
          </div>
          <img 
            src={adminPic} 
            alt="Admin" 
            style={{
              width: windowWidth <= 768 ? '100%' : '40%',
              height: 'auto',
              objectFit: 'contain',
              position: windowWidth <= 768 ? 'relative' : 'absolute',
              right: 0,
              bottom: 0,
              zIndex: '1',
              marginTop: windowWidth <= 768 ? '1rem' : '0'
            }} 
          />
        </div>

        <AdminMetrics 
          dashboardStats={dashboardStats} 
          appointmentCounts={appointmentCounts} 
          loadingStats={loadingStats} 
        />
          
        {/* Age Distribution Chart */}
        <AgeDistributionChart 
          dashboardStats={dashboardStats} 
          windowWidth={windowWidth} 
        />
      </main>
      
      {/* Right Sidebar - Conditionally rendered based on screen size */}
      {windowWidth > 1024 && (
        <div style={{
          flex: '1.3',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          position: 'sticky',
          top: '2rem',
          height: 'fit-content'
        }}>
          {/* Reminders Section */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: '#395886',
                fontSize: '1rem',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}>
                <FaBell style={{ color: '#477977', fontSize: '0.9rem' }} />
                Admins’ To-Do Task List
              </h3>
              <button onClick={refreshReminders} style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                ':hover': {
                  color: '#3b82f6'
                }
              }}>
                <FaSyncAlt size={14} />
              </button>
            </div>
            <div style={{
              marginBottom: '1rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                placeholder="Add a new reminder..."
                onKeyPress={(e) => e.key === 'Enter' && addReminder()}
                disabled={loadingReminders}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }
                }}
              />
              <button 
                onClick={addReminder}
                disabled={loadingReminders || !newReminder.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#2563eb'
                  },
                  ':disabled': {
                    backgroundColor: '#9ca3af',
                    cursor: 'not-allowed'
                  }
                }}
              >
                <FaPlus size={14} />
              </button>
            </div>
            
            {loadingReminders ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
                color: '#6b7280'
              }}>Loading reminders...</div>
            ) : (
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '0.5rem'
              }}>
                {reminders.length === 0 ? (
                  <p style={{
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '1rem'
                  }}>No reminders yet. Add one above!</p>
                ) : (
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {reminders.map(reminder => (
                      <li key={reminder.id} style={{
                        padding: '0.75rem 0',
                        borderBottom: '1px solid #f3f4f6',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        opacity: reminder.completed ? 0.7 : 1
                      }}>
                        <button
                          onClick={() => toggleReminder(reminder.id)}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${reminder.completed ? '#10b981' : '#d1d5db'}`,
                            backgroundColor: reminder.completed ? '#10b981' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginTop: '2px',
                            ':hover': {
                              borderColor: reminder.completed ? '#059669' : '#9ca3af'
                            }
                          }}
                          disabled={loadingReminders}
                        >
                          {reminder.completed && <FaCheck size={10} color="white" />}
                        </button>
                        <div style={{ flex: 1 }}>
                          <p style={{
                            margin: 0,
                            textDecoration: reminder.completed ? 'line-through' : 'none',
                            color: reminder.completed ? '#6b7280' : '#111827'
                          }}>{reminder.text}</p>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginTop: '0.25rem'
                          }}>
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#6b7280'
                            }}>{formatDate(reminder.date)}</span>
                            {reminder.created_at && (
                              <span style={{
                                fontSize: '0.75rem',
                                color: '#9ca3af'
                              }}>• Added: {formatDate(reminder.created_at)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            ':hover': {
                              color: '#ef4444'
                            }
                          }}
                          disabled={loadingReminders}
                        >
                          <FaTrash size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaCog />
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => navigate('/admin/HCproviderList')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #e0f2fe',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#e0f2fe',
                    borderColor: '#bae6fd'
                  }
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <FaUserMd size={14} />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#1e40af'
                }}>CAPD Employee List</span>
              </button>

              <button
                onClick={() => navigate('/admin/PatientList')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    backgroundColor: '#d1fae5',
                    borderColor: '#a7f3d0'
                  }
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <FaUserNurse size={14} />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#047857'
                }}>CAPD Patient List</span>
              </button>
            </div>
          </div>

          {/* Calendar Section */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            marginTop: '1rem'
          }}>
            <h3 style={{
              color: '#395886',
              fontSize: '1rem',
              margin: '0 0 1.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600'
            }}>
              <FaCalendarAlt />
              Calendar
            </h3>
            <div>
              <Calendar 
                events={[
                  {
                    title: "Staff Meeting",
                    start: new Date(new Date().setHours(10, 0, 0, 0)),
                    end: new Date(new Date().setHours(11, 0, 0, 0)),
                    color: "#3b82f6"
                  },
                  {
                    title: "Patient Review",
                    start: new Date(new Date().setDate(new Date().getDate() + 1)),
                    end: new Date(new Date().setDate(new Date().getDate() + 1)),
                    color: "#10b981"
                  }
                ]}
                onEventClick={(event) => {
                  showNotification(`Event: ${event.title}`, "info");
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {windowWidth <= 1024 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.75rem 0',
          zIndex: 100
        }}>
          <button 
            onClick={() => navigate('/admin/HCproviderList')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#395886'
            }}
          >
            <FaUserMd size={20} />
            <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Doctors</span>
          </button>
          <button 
            onClick={() => navigate('/admin/PatientList')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#395886'
            }}
          >
            <FaUserInjured size={20} />
            <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Patients</span>
          </button>
          <button 
            onClick={() => navigate('/admin/appointments')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#395886'
            }}
          >
            <FaCalendarAlt size={20} />
            <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Calendar</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#395886'
            }}
          >
            <FaCog size={20} />
            <span style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;