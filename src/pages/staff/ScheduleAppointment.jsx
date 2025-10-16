import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUserClock } from 'react-icons/fa';
import StaffSidebar from './StaffSidebar';
import '../../css/appointment.css';

const ScheduleAppointment = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    appointment_date: '',
    remarks: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchPatientData(token);
    }
  }, [navigate, patientId]);

  const fetchPatientData = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPatient(response.data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching patient data');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const staffUser = JSON.parse(localStorage.getItem('user'));
      
      await axios.post(
        'http://localhost:8000/api/staff/schedule-appointment',
        {
          patient_id: patientId,
          userID: staffUser.userID,
          ...formData
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      navigate('/staff/add-schedule');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error scheduling appointment');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="appointment-container">
        <StaffSidebar />
        <div className="appointment-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="appointment-container">
        <StaffSidebar />
        <div className="appointment-content">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div>
              <strong>Error:</strong>
              <span>{error}</span>
            </div>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-container">
      <StaffSidebar />
      <div className="appointment-content">
        <div className="appointment-header">
          <h1>Schedule Appointment</h1>
          <p>For {patient?.first_name} {patient?.last_name}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>
              <FaCalendarAlt /> Appointment Date and Time
            </label>
            <input
              type="datetime-local"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          
          <div className="form-group">
            <label>
              <FaUserClock /> Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Enter any special instructions..."
            />
          </div>
          
          {error && (
            <div className="form-error">
              <span>⚠️ {error}</span>
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/staff/add-schedule')}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Schedule Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleAppointment;