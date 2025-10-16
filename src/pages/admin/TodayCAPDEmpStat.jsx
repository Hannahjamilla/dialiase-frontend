import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  FaUserMd, 
  FaUserNurse, 
  FaUserTie,
  FaUserCheck, 
  FaUserSlash,
  FaSearch,
  FaFilter,
  FaDownload,
  FaStethoscope
} from 'react-icons/fa';
import { MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import Notification from '../../components/Notification';

const TodayCAPDEmpStat = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Color variables
  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977'
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchEmployeeStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employees/statuses/today');
      setEmployees(response.data.employees);
      setFilteredEmployees(response.data.employees);
      setLastUpdated(new Date().toLocaleTimeString());
      
      addNotification('Employee status updated successfully', 'success');
    } catch (error) {
      console.error('Error fetching employee status:', error);
      addNotification('Failed to fetch employee status', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeStatus();
    const interval = setInterval(fetchEmployeeStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let results = employees;
    
    if (searchTerm) {
      results = results.filter(emp => 
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(emp => 
        normalizeStatus(emp.TodaysStatus) === statusFilter
      );
    }
    
    if (roleFilter !== 'all') {
      results = results.filter(emp => 
        emp.userLevel.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    setFilteredEmployees(results);
  }, [searchTerm, statusFilter, roleFilter, employees]);

  const normalizeStatus = (status) => {
    if (!status) return 'off duty';
    const normalized = status.toLowerCase().trim();
    if (normalized === 'in duty' || normalized === 'on duty') return 'on duty';
    return 'off duty';
  };

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'on duty') return <FaUserCheck style={{ color: colors.green }} />;
    return <FaUserSlash style={{ color: '#dc3545' }} />;
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'doctor': return <FaUserMd style={{ color: colors.primary }} />;
      case 'nurse': return <FaUserNurse style={{ color: colors.secondary }} />;
      case 'staff': return <FaUserTie style={{ color: colors.green }} />;
      default: return <FaUserTie style={{ color: '#6c757d' }} />;
    }
  };

  const statusCounts = employees.reduce((acc, emp) => {
    const status = normalizeStatus(emp.TodaysStatus);
    if (status === 'on duty') acc.onDuty++;
    else acc.offDuty++;
    return acc;
  }, { onDuty: 0, offDuty: 0 });

  const exportToCSV = () => {
    try {
      const headers = ['Name', 'Email', 'Role', 'Status', 'Last Updated'];
      const csvContent = [
        headers.join(','),
        ...filteredEmployees.map(emp => [
          `"${emp.first_name} ${emp.last_name}"`,
          `"${emp.email}"`,
          `"${emp.userLevel}"`,
          `"${normalizeStatus(emp.TodaysStatus)}"`,
          `"${emp.statusUpdatedAt ? new Date(emp.statusUpdatedAt).toLocaleString() : 'N/A'}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employee_status_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification('CSV exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      addNotification('Failed to export CSV', 'error');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <AdminSidebar user={user} />
      
      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
          id={notification.id}
        />
      ))}
      
      <div style={{ 
        flex: 1,
        padding: '20px',
        marginLeft: '210px',
        overflow: 'auto',
        height: '100vh',
        width: 'calc(100vw - 200px)',
        marginTop: '-545px',
      }}>
        <div style={{ 
          backgroundColor: colors.white,
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          padding: '20px',
          height: 'calc(100% - 40px)',
          display: 'flex',
          flexDirection: 'column',
          marginLeft: 'auto',
          width: '95%'
        }}>
          {/* Header Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div>
                <h1 style={{ 
                  color: colors.primary,
                  fontSize: '24px',
                  margin: 0
                }}>Today's Employee Status</h1>
                <p style={{ 
                  color: colors.secondary,
                  fontSize: '16px',
                  margin: '5px 0 0'
                }}>View and manage employee statuses for today</p>
              </div>
              <div style={{ 
                color: '#777',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}>
                {new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            {/* Summary Cards */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderRadius: '10px',
                color: colors.white,
                backgroundColor: colors.primary,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>On Duty</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{statusCounts.onDuty}</p>
                </div>
                <FaUserCheck style={{ fontSize: '24px' }} />
              </div>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderRadius: '10px',
                color: colors.white,
                backgroundColor: colors.green,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>Off Duty</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{statusCounts.offDuty}</p>
                </div>
                <FaUserSlash style={{ fontSize: '24px' }} />
              </div>

              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderRadius: '10px',
                color: colors.white,
                backgroundColor: colors.secondary,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px', fontSize: '16px' }}>Total Employees</h3>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{employees.length}</p>
                </div>
                <FaUserTie style={{ fontSize: '24px' }} />
              </div>
            </div>

            {/* Search and Filters */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{ 
                position: 'relative',
                flex: '1',
                minWidth: '300px'
              }}>
                <FaSearch style={{ 
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.secondary
                }} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 20px 12px 45px',
                    borderRadius: '30px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <FaFilter style={{ 
                    position: 'absolute',
                    left: '15px',
                    top: '12px',
                    color: colors.secondary,
                    fontSize: '16px'
                  }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: '10px 10px 10px 40px',
                      borderRadius: '30px',
                      border: `1px solid #e2e8f0`,
                      fontSize: '14px',
                      backgroundColor: colors.white,
                      appearance: 'none',
                      minWidth: '150px',
                      height: '40px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="on duty">On Duty</option>
                    <option value="off duty">Off Duty</option>
                  </select>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <FaFilter style={{ 
                    position: 'absolute',
                    left: '15px',
                    top: '12px',
                    color: colors.secondary,
                    fontSize: '16px'
                  }} />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{
                      padding: '10px 10px 10px 40px',
                      borderRadius: '30px',
                      border: `1px solid #e2e8f0`,
                      fontSize: '14px',
                      backgroundColor: colors.white,
                      appearance: 'none',
                      minWidth: '150px',
                      height: '40px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="doctor">Doctor</option>
                    <option value="nurse">Nurse</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* New View Doctors Button */}
                {/* <button
                  onClick={() => navigate('/staff/StaffDoctorsStatus')}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '30px',
                    border: 'none',
                    backgroundColor: '#6c757d',
                    color: colors.white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    minWidth: '120px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'opacity 0.2s',
                    ':hover': {
                      opacity: 0.9
                    }
                  }}
                >
                  <FaStethoscope />
                  View Doctors
                </button> */}
                
                <button
                  onClick={fetchEmployeeStatus}
                  disabled={loading}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '30px',
                    border: 'none',
                    backgroundColor: colors.green,
                    color: colors.white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    minWidth: '120px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'opacity 0.2s',
                    ':hover': {
                      opacity: 0.9
                    },
                    ':disabled': {
                      opacity: 0.7,
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  <MdRefresh style={{ 
                    fontSize: '18px',
                    animation: loading ? 'spin 1s linear infinite' : 'none'
                  }} />
                  Refresh
                </button>
                
                <button
                  onClick={exportToCSV}
                  style={{
                    padding: '10px 15px',
                    borderRadius: '30px',
                    border: 'none',
                    backgroundColor: colors.primary,
                    color: colors.white,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    minWidth: '120px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'opacity 0.2s',
                    ':hover': {
                      opacity: 0.9
                    }
                  }}
                >
                  <FaDownload />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div style={{ 
            flex: 1,
            overflow: 'auto',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: colors.white
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ 
                color: colors.secondary,
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
              <div style={{ 
                color: '#64748b',
                fontSize: '14px'
              }}>
                Last updated: {lastUpdated}
              </div>
            </div>
            
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: colors.white
            }}>
              <thead style={{ 
                backgroundColor: '#f1f5f9',
                color: colors.primary,
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <tr>
                  <th style={{ 
                    padding: '15px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '30%',
                    borderBottom: `1px solid #e2e8f0`
                  }}>EMPLOYEE</th>
                  <th style={{ 
                    padding: '15px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '20%',
                    borderBottom: `1px solid #e2e8f0`
                  }}>ROLE</th>
                  <th style={{ 
                    padding: '15px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '20%',
                    borderBottom: `1px solid #e2e8f0`
                  }}>STATUS</th>
                  <th style={{ 
                    padding: '15px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    width: '30%',
                    borderBottom: `1px solid #e2e8f0`
                  }}>LAST UPDATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => {
                    const status = normalizeStatus(emp.TodaysStatus);
                    const statusStyle = {
                      'on duty': { 
                        backgroundColor: '#f0fdf4', 
                        color: colors.green,
                        border: `1px solid ${colors.green}`
                      },
                      'off duty': { 
                        backgroundColor: '#fef2f2', 
                        color: '#dc3545',
                        border: `1px solid #dc3545`
                      }
                    }[status];

                    return (
                      <tr key={emp.userID} style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background-color 0.2s',
                        ':hover': { 
                          backgroundColor: '#f8fafc'
                        }
                      }}>
                        <td style={{ 
                          padding: '15px',
                          fontSize: '14px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {getRoleIcon(emp.userLevel)}
                            </div>
                            <div>
                              <div style={{ 
                                fontSize: '15px',
                                fontWeight: '500',
                                marginBottom: '3px',
                                color: '#334155'
                              }}>
                                {emp.first_name} {emp.last_name}
                              </div>
                              <div style={{ 
                                fontSize: '13px',
                                color: '#64748b'
                              }}>
                                {emp.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '15px',
                          textTransform: 'capitalize',
                          fontSize: '14px',
                          color: '#475569'
                        }}>
                          {emp.userLevel}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {getStatusIcon(emp.TodaysStatus)}
                            <span style={{ 
                              padding: '5px 12px',
                              borderRadius: '15px',
                              fontSize: '13px',
                              fontWeight: '500',
                              ...statusStyle
                            }}>
                              {status}
                            </span>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '15px',
                          fontSize: '14px',
                          color: '#475569'
                        }}>
                          {emp.statusUpdatedAt ? new Date(emp.statusUpdatedAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ 
                      padding: '40px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '15px'
                    }}>
                      {loading ? 'Loading employee data...' : 'No matching employees found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        select::-ms-expand {
          display: none;
        }
        
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          text-indent: 1px;
          text-overflow: '';
        }
        
        tr:hover {
          background-color: #f8fafc !important;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default TodayCAPDEmpStat;