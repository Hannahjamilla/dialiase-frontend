import React from 'react';
import { FiAlertTriangle, FiInfo, FiBell } from 'react-icons/fi';

const Reminders = ({ reminders }) => {
    if (!reminders || reminders.length === 0) return null;

    return (
        <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                color: '#2c3e50'
            }}>
                <FiBell style={{ marginRight: '12px', fontSize: '20px' }} />
                <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600' }}>Checkup Reminders</h3>
            </div>
            <div>
                {reminders.map((reminder, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        backgroundColor: 
                            reminder.priority === 3 ? '#fff3e0' : 
                            reminder.priority === 2 ? '#fff8e1' : '#e8f4f8',
                        borderLeft: `4px solid ${
                            reminder.priority === 3 ? '#ff9800' : 
                            reminder.priority === 2 ? '#ffc107' : '#03a9f4'
                        }`,
                        opacity: reminder.isPast ? 0.7 : 1
                    }}>
                        <div style={{
                            marginRight: '12px',
                            color: 
                                reminder.priority === 3 ? '#e65100' : 
                                reminder.priority === 2 ? '#ff8f00' : '#0288d1',
                            fontSize: '20px'
                        }}>
                            {reminder.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ 
                                margin: '0 0 8px 0', 
                                fontWeight: '500',
                                color: '#2c3e50'
                            }}>{reminder.message}</p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '0.85rem',
                                color: '#7f8c8d'
                            }}>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: '16px'
                                }}>
                                    {new Date(reminder.date).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                                {reminder.confirmationStatus && (
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        Confirmation: {reminder.confirmationStatus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reminders;