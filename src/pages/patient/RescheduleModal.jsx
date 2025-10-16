import React, { useState, useEffect } from 'react';
import { FiCalendar, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const RescheduleModal = ({ 
    isOpen, 
    onClose, 
    scheduleId, 
    currentDate, 
    onRescheduleSuccess
}) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setReason('');
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            setError('Please provide a reason for rescheduling');
            return;
        }
        
        if (reason.trim().length > 255) {
            setError('Reason should not exceed 255 characters');
            return;
        }
        
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post('/patient/request-reschedule', {
                schedule_id: scheduleId,
                reason: reason.trim()
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onRescheduleSuccess({
                        message: response.data.message,
                        reason: reason.trim()
                    });
                    onClose();
                }, 1500);
            } else {
                setError(response.data.message || 'Failed to request reschedule');
            }
        } catch (err) {
            console.error('Reschedule error:', err);
            let errorMessage = 'Failed to request reschedule. Please try again.';
            
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

    if (!isOpen) return null;

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
                    Request Reschedule
                </h3>

                {success ? (
                    <div className="success-message">
                        <FiCheckCircle className="icon-spacing" />
                        Reschedule request submitted successfully!
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="error-message">
                                <FiAlertCircle className="icon-spacing" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">
                                    Current Appointment Date
                                </label>
                                <div className="current-date-display">
                                    {format(parseISO(currentDate), 'EEEE, MMMM d, yyyy')}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reason" className="form-label">
                                    Reason for Reschedule (Required)
                                </label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Please explain why you missed your checkup..."
                                    className="reason-textarea"
                                    required
                                    maxLength={255}
                                    disabled={isSubmitting}
                                />
                                <small className="input-hint">
                                    {reason.length}/255 characters
                                </small>
                            </div>

                            <div className="button-group">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reason.trim()}
                                    className="submit-button"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
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
                    max-width: 500px;
                    padding: 24px;
                    position: relative;
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
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #2c3e50;
                }
                
                .current-date-display {
                    padding: 12px;
                    background-color: #f5f5f5;
                    border-radius: 4px;
                    color: #2c3e50;
                }
                
                .reason-textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    min-height: 100px;
                    font-size: 16px;
                    resize: vertical;
                    transition: border-color 0.2s;
                }
                
                .reason-textarea:hover {
                    border-color: #3498db;
                }
                
                .reason-textarea:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 2px rgba(52,152,219,0.2);
                }
                
                .input-hint {
                    color: #7f8c8d;
                    margin-top: 4px;
                    display: block;
                    font-size: 0.875rem;
                }
                
                .button-group {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                
                .cancel-button {
                    padding: 12px 24px;
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
                    padding: 12px 24px;
                    background-color: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .submit-button:hover:not(:disabled) {
                    background-color: #2980b9;
                }
                
                .submit-button:disabled {
                    background-color: #bdc3c7;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default RescheduleModal;