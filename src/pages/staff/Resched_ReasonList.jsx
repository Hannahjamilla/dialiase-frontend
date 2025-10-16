import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaCheck, FaTimes, FaSearch, FaFilter, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import Notification from '../../components/Notification';

const API_BASE_URL = 'http://localhost:8000/api';

const Resched_ReasonList = ({ onClose }) => {
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchRescheduleRequests = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/staff/reschedule-requests`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setRescheduleRequests(response.data);
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Failed to fetch reschedule requests",
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRescheduleRequests();
  }, []);

  const handleApproveReschedule = async (scheduleId, isValidReason) => {
    try {
      await axios.post(`${API_BASE_URL}/staff/approve-reschedule`, 
        { 
          schedule_id: scheduleId,
          approve: true,
          is_valid_reason: isValidReason
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setNotification({
        message: `Reschedule request ${isValidReason ? 'approved' : 'rejected'} successfully`,
        type: 'success'
      });
      
      // Refresh the list
      const response = await axios.get(`${API_BASE_URL}/staff/reschedule-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setRescheduleRequests(response.data);
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to process reschedule request",
        type: 'error'
      });
    }
  };

  const handleRejectReschedule = async (scheduleId) => {
    try {
      await axios.post(`${API_BASE_URL}/staff/approve-reschedule`, 
        { 
          schedule_id: scheduleId,
          approve: false
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setNotification({
        message: 'Reschedule request rejected successfully',
        type: 'success'
      });
      
      // Refresh the list
      const response = await axios.get(`${API_BASE_URL}/staff/reschedule-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setRescheduleRequests(response.data);
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to reject reschedule request",
        type: 'error'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredRequests = rescheduleRequests.filter(request => {
    // Filter by search term
    const matchesSearch = 
      `${request.first_name} ${request.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.hospitalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reschedule_reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'pending' && request.confirmation_status === 'pending_reschedule') ||
      (filterStatus === 'approved' && request.confirmation_status === 'confirmed' && request.reschedule_requested_date) ||
      (filterStatus === 'rejected' && request.confirmation_status === 'pending' && request.reschedule_requested_date === null);
    
    return matchesSearch && matchesFilter;
  });

  const handleCloseNotification = () => {
    setNotification(null);
  };

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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaCalendarAlt color="#3498db" /> 
            Patient Reschedule Requests
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#7f8c8d',
              ':hover': {
                color: '#e74c3c'
              }
            }}
          >
            <FaTimesCircle />
          </button>
        </div>
        
        {/* Modal Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Search and Filter Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '16px'
          }}>
            <div style={{
              position: 'relative',
              flex: 1
            }}>
              <FaSearch style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7f8c8d'
              }} />
              <input
                type="text"
                placeholder="Search patients or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#3498db'
                  }
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaFilter color="#7f8c8d" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  cursor: 'pointer',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#3498db'
                  }
                }}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px'
            }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {/* Reschedule Requests Table */}
          {!loading && (
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f1f5f9',
                    borderBottom: '1px solid #ddd'
                  }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Patient</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>HN</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Original Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Requested Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Reason</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Requested On</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request, index) => (
                      <tr 
                        key={index} 
                        style={{
                          borderBottom: '1px solid #eee',
                          ':hover': {
                            backgroundColor: '#f8f9fa'
                          }
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          {request.first_name} {request.last_name}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {request.hospitalNumber}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {formatDate(request.appointment_date)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {request.reschedule_requested_date ? formatDate(request.reschedule_requested_date) : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', maxWidth: '300px' }}>
                          <div style={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {request.reschedule_reason || 'No reason provided'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {formatDate(request.reschedule_request_date)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: 
                              request.confirmation_status === 'pending_reschedule' ? '#fef3c7' :
                              request.confirmation_status === 'confirmed' && request.reschedule_requested_date ? '#dcfce7' :
                              '#fee2e2',
                            color: 
                              request.confirmation_status === 'pending_reschedule' ? '#92400e' :
                              request.confirmation_status === 'confirmed' && request.reschedule_requested_date ? '#166534' :
                              '#991b1b'
                          }}>
                            {request.confirmation_status === 'pending_reschedule' ? 'Pending' :
                             request.confirmation_status === 'confirmed' && request.reschedule_requested_date ? 'Approved' :
                             'Rejected'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {request.confirmation_status === 'pending_reschedule' && (
                            <div style={{
                              display: 'flex',
                              gap: '8px'
                            }}>
                              <button
                                onClick={() => handleApproveReschedule(request.schedule_id, true)}
                                style={{
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  ':hover': {
                                    backgroundColor: '#059669'
                                  }
                                }}
                              >
                                <FaCheck size={12} /> Valid
                              </button>
                              <button
                                onClick={() => handleApproveReschedule(request.schedule_id, false)}
                                style={{
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  ':hover': {
                                    backgroundColor: '#dc2626'
                                  }
                                }}
                              >
                                <FaTimes size={12} /> Invalid
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ padding: '24px', textAlign: 'center' }}>
                        <div style={{
                          color: '#7f8c8d',
                          fontSize: '16px'
                        }}>
                          No reschedule requests found
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
};

export default Resched_ReasonList;