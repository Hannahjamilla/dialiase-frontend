import React, { useState } from 'react';
import { FiCalendar, FiX, FiAlertCircle, FiCheckCircle, FiMail } from 'react-icons/fi';
import axios from 'axios';
import { format, parseISO, addDays, isBefore, add } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const RescheduleRequestModal = ({ 
  isOpen, 
  onClose, 
  request, 
  onRescheduleComplete 
}) => {
  const [newDate, setNewDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Calculate the next available dates (28-day intervals from current appointment)
  const calculateSuggestedDates = () => {
    if (!request?.current_date) return [];
    
    const currentDate = parseISO(request.current_date);
    const suggestedDates = [];
    
    // Add 28 days from current date
    suggestedDates.push(add(currentDate, { days: 28 }));
    
    // Add 56 days from current date (next interval)
    suggestedDates.push(add(currentDate, { days: 56 }));
    
    return suggestedDates;
  };

  const suggestedDates = calculateSuggestedDates();

  const handleDateChange = (date) => {
    setNewDate(date);
    setError(null);
    
    // Auto-generate email content when date is selected
    if (date && request) {
      const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
      setEmailContent(`Dear ${request.first_name} ${request.last_name},\n\n` +
        `Your appointment has been rescheduled to ${formattedDate}.\n\n` +
        `Original appointment date: ${format(parseISO(request.current_date), 'EEEE, MMMM d, yyyy')}\n` +
        `Reason for rescheduling: ${request.reschedule_reason || 'Not specified'}\n\n` +
        `Please arrive 15 minutes before your scheduled time.\n\n` +
        `Best regards,\nClinic Staff`);
    }
  };

  const handleSubmit = async () => {
    if (!newDate) {
      setError('Please select a new appointment date');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/staff/process-reschedule', {
        schedule_id: request.schedule_id,
        new_date: format(newDate, 'yyyy-MM-dd'),
        email_content: emailContent
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onRescheduleComplete();
          onClose();
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to process reschedule request');
      }
    } catch (err) {
      console.error('Reschedule processing error:', err);
      let errorMessage = 'Failed to process reschedule request. Please try again.';
      
      if (err.response) {
        if (err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join(' ');
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button 
          onClick={onClose}
          className="modal-close-button"
          disabled={isSubmitting}
          aria-label="Close modal"
        >
          <FiX />
        </button>

        <h3 className="modal-title">
          <FiCalendar className="icon-spacing" />
          Process Reschedule Request
        </h3>

        {success ? (
          <div className="success-message">
            <FiCheckCircle className="icon-spacing" />
            Reschedule processed successfully!
          </div>
        ) : (
          <>
            {error && (
              <div className="error-message">
                <FiAlertCircle className="icon-spacing" />
                {error}
              </div>
            )}

            <div className="patient-info-section">
              <h4>Patient Information</h4>
              <div className="info-grid">
                <div>
                  <label>Name:</label>
                  <span>{request.first_name} {request.last_name}</span>
                </div>
                <div>
                  <label>HN:</label>
                  <span>{request.hospitalNumber || 'N/A'}</span>
                </div>
                <div>
                  <label>Original Date:</label>
                  <span>{format(parseISO(request.current_date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="reason-section">
              <h4>Patient's Reason for Rescheduling</h4>
              <div className="reason-box">
                {request.reschedule_reason || 'No reason provided'}
              </div>
            </div>

            <div className="date-selection-section">
              <h4>Select New Appointment Date</h4>
              
              <div className="calendar-container">
                <Calendar
                  onChange={handleDateChange}
                  value={newDate}
                  minDate={addDays(new Date(), 1)} // Can't select past dates
                  tileDisabled={({ date }) => {
                    // Disable weekends
                    const day = date.getDay();
                    return day === 0 || day === 6;
                  }}
                />
              </div>

              {suggestedDates.length > 0 && (
                <div className="suggested-dates">
                  <p>Suggested dates (28-day intervals):</p>
                  <div className="date-buttons">
                    {suggestedDates.map((date, index) => (
                      <button
                        key={index}
                        onClick={() => handleDateChange(date)}
                        className={`date-button ${newDate && format(newDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? 'active' : ''}`}
                      >
                        {format(date, 'MMM d, yyyy')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {newDate && (
              <div className="email-preview-section">
                <div className="email-header">
                  <h4>Email Notification Preview</h4>
                  <button 
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="toggle-preview-button"
                  >
                    {showEmailPreview ? 'Hide' : 'Show'} Preview
                  </button>
                </div>
                
                {showEmailPreview && (
                  <div className="email-content">
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      className="email-textarea"
                      rows={8}
                    />
                    <div className="email-actions">
                      <FiMail className="mail-icon" />
                      <span>This will be sent to {request.email || 'patient'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !newDate}
                className="submit-button"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Reschedule'}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 700px;
          padding: 24px;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #7f8c8d;
          transition: color 0.2s;
        }
        
        .modal-close-button:hover {
          color: #2c3e50;
        }
        
        .modal-title {
          margin-top: 0;
          margin-bottom: 24px;
          color: #2c3e50;
          font-size: 20px;
          display: flex;
          align-items: center;
        }
        
        .icon-spacing {
          margin-right: 12px;
        }
        
        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }
        
        .patient-info-section, 
        .reason-section,
        .date-selection-section,
        .email-preview-section {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .patient-info-section h4,
        .reason-section h4,
        .date-selection-section h4,
        .email-preview-section h4 {
          color: #395886;
          margin-top: 0;
          margin-bottom: 15px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .info-grid div {
          display: flex;
          flex-direction: column;
        }
        
        .info-grid label {
          font-weight: 500;
          color: #7f8c8d;
          margin-bottom: 5px;
          font-size: 0.9rem;
        }
        
        .info-grid span {
          color: #2c3e50;
          font-size: 1rem;
        }
        
        .reason-box {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
          color: #2c3e50;
          line-height: 1.5;
        }
        
        .calendar-container {
          margin: 15px 0;
        }
        
        .suggested-dates {
          margin-top: 15px;
        }
        
        .suggested-dates p {
          margin-bottom: 10px;
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .date-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .date-button {
          padding: 8px 15px;
          background-color: #f1f5f9;
          border: 1px solid #ddd;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        
        .date-button:hover {
          background-color: #e2e8f0;
        }
        
        .date-button.active {
          background-color: #395886;
          color: white;
          border-color: #395886;
        }
        
        .email-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .toggle-preview-button {
          background: none;
          border: none;
          color: #395886;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: underline;
        }
        
        .email-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          resize: vertical;
          min-height: 150px;
        }
        
        .email-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          color: #7f8c8d;
          font-size: 0.9rem;
        }
        
        .mail-icon {
          color: #395886;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }
        
        .cancel-button {
          padding: 10px 20px;
          background-color: #f5f5f5;
          color: #2c3e50;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .cancel-button:hover:not(:disabled) {
          background-color: #e0e0e0;
        }
        
        .cancel-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .submit-button {
          padding: 10px 20px;
          background-color: #395886;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .submit-button:hover:not(:disabled) {
          background-color: #2c3e50;
        }
        
        .submit-button:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default RescheduleRequestModal;