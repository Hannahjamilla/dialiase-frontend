import React, { useState } from 'react';
import { FiCalendar, FiX, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    scheduleId, 
    onConfirmationSuccess 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post('/patient/confirm-appointment', {
                schedule_id: scheduleId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                onConfirmationSuccess(response.data.message);
                onClose();
            } else {
                setError(response.data.message || 'Failed to confirm appointment');
            }
        } catch (err) {
            console.error('Confirmation error:', err);
            setError(err.response?.data?.message || 'Failed to confirm appointment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                width: '100%',
                maxWidth: '500px',
                padding: '24px',
                position: 'relative',
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#7f8c8d'
                    }}
                >
                    <FiX />
                </button>

                <h3 style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    color: '#2c3e50',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <FiCheckCircle style={{ marginRight: '12px', color: '#2ecc71' }} />
                    Confirm Appointment
                </h3>

                {error && (
                    <div style={{
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        padding: '12px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <FiAlertCircle style={{ marginRight: '8px' }} />
                        {error}
                    </div>
                )}

                <p style={{ marginBottom: '24px', color: '#2c3e50' }}>
                    By confirming this appointment, you acknowledge that you will attend your scheduled check-up. 
                    Please arrive on time to ensure you receive your treatment.
                </p>

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#f5f5f5',
                            color: '#2c3e50',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#2ecc71',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;