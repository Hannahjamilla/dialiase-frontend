import React, { useEffect, useState } from 'react';
import { 
  FiCalendar, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import Notification from '../../components/Notification';
import RescheduleModal from './RescheduleModal';
import ConfirmationModal from './ConfirmationModal';

const PatientSched = ({ dailyLimitReached, fetchDailyLimitStatus, colors, firstTimeUser }) => {
    const [checkups, setCheckups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [filter, setFilter] = useState('upcoming');
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [selectedCheckup, setSelectedCheckup] = useState(null);
    const [requiresConfirmation, setRequiresConfirmation] = useState(false);

    const fetchUpcomingCheckups = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/patient/upcoming-checkups', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                setCheckups(response.data.checkups);
                
                const now = new Date();
                const confirmableCheckups = response.data.checkups.filter(checkup => {
                    const appointmentDate = new Date(checkup.appointment_date);
                    const daysDiff = Math.floor((appointmentDate - now) / (1000 * 60 * 60 * 24));
                    return daysDiff >= 0 && daysDiff <= 2 &&
                           checkup.confirmation_status === 'pending' && 
                           checkup.checkup_status !== 'completed' && 
                           checkup.checkup_status !== 'cancelled';
                });
                
                setRequiresConfirmation(confirmableCheckups.length > 0);
            } else {
                setNotification({
                    message: response.data.message || 'Failed to load appointments',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error fetching checkups:', error);
            setNotification({
                message: error.response?.data?.message || 'Failed to load appointments',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUpcomingCheckups();
        const interval = setInterval(fetchUpcomingCheckups, 300000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenRescheduleModal = (checkup) => {
        setSelectedCheckup(checkup);
        fetchDailyLimitStatus(checkup.appointment_date);
        setRescheduleModalOpen(true);
    };

    const handleOpenConfirmationModal = (checkup) => {
        setSelectedCheckup(checkup);
        setConfirmationModalOpen(true);
    };

    const handleRescheduleSuccess = (message) => {
        setNotification({ message, type: 'success' });
        fetchUpcomingCheckups();
    };

    const handleConfirmationSuccess = (message) => {
        setNotification({ message, type: 'success' });
        setRequiresConfirmation(false);
        fetchUpcomingCheckups();
    };

    const handleCloseNotification = () => setNotification(null);

    const formatDate = (dateString) => {
        const options = { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusConfig = (status) => {
        const statusMap = {
            'confirmed': { 
                icon: <FiCheckCircle />, 
                label: 'Confirmed',
                color: '#10b981'
            },
            'pending': { 
                icon: <FiClock />, 
                label: 'Pending',
                color: '#f59e0b'
            },
            'cancelled': { 
                icon: <FiAlertTriangle />, 
                label: 'Cancelled',
                color: '#ef4444'
            },
            'completed': { 
                icon: <FiCheckCircle />, 
                label: 'Completed',
                color: '#6b7280'
            }
        };
        
        return statusMap[status?.toLowerCase()] || statusMap.pending;
    };

    const isInConfirmationWindow = (appointmentDate) => {
        const now = new Date();
        const appointment = new Date(appointmentDate);
        const daysDiff = Math.floor((appointment - now) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 2;
    };

    const filteredCheckups = checkups.filter(checkup => {
        const now = new Date();
        const appointmentDate = new Date(checkup.appointment_date);
        
        if (filter === 'upcoming') return appointmentDate >= now;
        if (filter === 'past') return appointmentDate < now;
        if (filter === 'action') return isInConfirmationWindow(checkup.appointment_date) && 
                                     checkup.confirmation_status === 'pending';
        return true;
    });

    const sortedCheckups = [...filteredCheckups].sort((a, b) => {
        return new Date(a.appointment_date) - new Date(b.appointment_date);
    });

    const StatusBadge = ({ status }) => {
        const config = getStatusConfig(status);
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: `${config.color}15`,
                color: config.color
            }}>
                {React.cloneElement(config.icon, { style: { marginRight: '4px', fontSize: '0.7rem' } })}
                {config.label}
            </div>
        );
    };

    const LoadingSkeleton = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    padding: '1.25rem',
                    border: `1px solid ${colors.gray200}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: colors.gray200,
                        borderRadius: '8px',
                        animation: 'pulse 2s infinite'
                    }}></div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            height: '16px',
                            backgroundColor: colors.gray200,
                            borderRadius: '4px',
                            marginBottom: '8px',
                            animation: 'pulse 2s infinite',
                            width: '60%'
                        }}></div>
                        <div style={{
                            height: '12px',
                            backgroundColor: colors.gray200,
                            borderRadius: '4px',
                            animation: 'pulse 2s infinite',
                            width: '40%'
                        }}></div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (firstTimeUser) {
        return (
            <div style={{
                backgroundColor: colors.white,
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                border: `1px solid ${colors.gray200}`
            }}>
                <FiCalendar style={{
                    fontSize: '2rem',
                    color: colors.primary,
                    marginBottom: '1rem'
                }} />
                <h3 style={{
                    margin: '0 0 0.5rem 0',
                    color: colors.primary,
                    fontSize: '1.25rem',
                    fontWeight: '600'
                }}>No Appointments</h3>
                <p style={{
                    margin: 0,
                    color: colors.textMuted,
                    fontSize: '0.9rem'
                }}>
                    Your appointments will appear here once scheduled.
                </p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                />
            )}
            
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <h2 style={{
                        margin: '0 0 0.25rem 0',
                        color: colors.primary,
                        fontSize: '1.25rem',
                        fontWeight: '600'
                    }}>Appointments</h2>
                    <p style={{
                        margin: 0,
                        color: colors.textMuted,
                        fontSize: '0.85rem'
                    }}>
                        {sortedCheckups.length} scheduled
                    </p>
                </div>
                
                <button
                    onClick={fetchUpcomingCheckups}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'transparent',
                        border: `1px solid ${colors.gray300}`,
                        borderRadius: '6px',
                        color: colors.primary,
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <FiRefreshCw style={{ marginRight: '4px' }} />
                    Refresh
                </button>
            </div>

            {/* Confirmation Alert */}
            {requiresConfirmation && (
                <div style={{
                    backgroundColor: '#fffbeb',
                    border: `1px solid #f59e0b`,
                    borderRadius: '6px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <FiAlertTriangle style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <p style={{
                            margin: 0,
                            color: '#92400e',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                        }}>
                            You have appointments requiring confirmation
                        </p>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem'
            }}>
                {[
                    { key: 'upcoming', label: 'Upcoming' },
                    { key: 'past', label: 'Past' },
                    { key: 'action', label: 'Action Required' }
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: filter === key ? colors.primary : 'transparent',
                            color: filter === key ? colors.white : colors.gray600,
                            fontWeight: '500',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Appointments List */}
            {loading ? (
                <LoadingSkeleton />
            ) : sortedCheckups.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sortedCheckups.map((checkup) => {
                        const isPast = new Date(checkup.appointment_date) < new Date();
                        const canConfirm = isInConfirmationWindow(checkup.appointment_date) && 
                                         checkup.confirmation_status === 'pending' && 
                                         checkup.checkup_status !== 'completed' && 
                                         checkup.checkup_status !== 'cancelled';

                        return (
                            <div 
                                key={checkup.schedule_id} 
                                style={{
                                    backgroundColor: colors.white,
                                    borderRadius: '8px',
                                    padding: '1.25rem',
                                    border: `1px solid ${colors.gray200}`,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '1rem'
                                }}>
                                    {/* Date */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: '50px',
                                        padding: '0.5rem',
                                        backgroundColor: colors.gray50,
                                        borderRadius: '6px',
                                        flexShrink: 0
                                    }}>
                                        <div style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '700',
                                            color: colors.primary,
                                            lineHeight: '1'
                                        }}>
                                            {new Date(checkup.appointment_date).getDate()}
                                        </div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            color: colors.gray600,
                                            textTransform: 'uppercase',
                                            marginTop: '2px'
                                        }}>
                                            {new Date(checkup.appointment_date).toLocaleDateString('en', { month: 'short' })}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div>
                                                <h3 style={{
                                                    margin: '0 0 0.25rem 0',
                                                    color: colors.primary,
                                                    fontSize: '1rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {formatDate(checkup.appointment_date)}
                                                </h3>
                                                <StatusBadge status={checkup.checkup_status} />
                                            </div>
                                            {checkup.confirmation_status !== 'confirmed' && (
                                                <StatusBadge status={checkup.confirmation_status} />
                                            )}
                                        </div>

                                        {checkup.remarks && (
                                            <p style={{
                                                margin: '0.5rem 0 0 0',
                                                color: colors.gray600,
                                                fontSize: '0.85rem',
                                                lineHeight: '1.4'
                                            }}>
                                                {checkup.remarks}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        flexShrink: 0
                                    }}>
                                        {canConfirm && (
                                            <button
                                                onClick={() => handleOpenConfirmationModal(checkup)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    backgroundColor: '#10b981',
                                                    color: colors.white,
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOpenRescheduleModal(checkup)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: isPast ? colors.primary : '#f59e0b',
                                                color: colors.white,
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            Reschedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    border: `1px solid ${colors.gray200}`
                }}>
                    <FiCalendar style={{
                        fontSize: '2rem',
                        color: colors.gray400,
                        marginBottom: '1rem'
                    }} />
                    <p style={{
                        margin: 0,
                        color: colors.gray600,
                        fontSize: '0.9rem'
                    }}>
                        {filter !== 'upcoming' ? `No ${filter} appointments` : 'No appointments scheduled'}
                    </p>
                </div>
            )}

            <RescheduleModal
                isOpen={rescheduleModalOpen}
                onClose={() => setRescheduleModalOpen(false)}
                scheduleId={selectedCheckup?.schedule_id}
                currentDate={selectedCheckup?.appointment_date}
                onRescheduleSuccess={handleRescheduleSuccess}
                dailyLimitReached={dailyLimitReached}
                colors={colors}
            />

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
                scheduleId={selectedCheckup?.schedule_id}
                onConfirmationSuccess={handleConfirmationSuccess}
                colors={colors}
            />

            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default PatientSched;