import React from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const HCproviderDeleteModal = ({ show, onClose, provider, onDelete }) => {
    const [error, setError] = React.useState(null);

    const handleSoftDelete = async () => {
        try {
            await axios.put(`http://localhost:8000/api/admin/providers/${provider.userID}/deactivate`);
            onClose();
            onDelete();
        } catch (err) {
            setError(err.response?.data?.message || 'Error deactivating provider');
        }
    };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '500px',
                maxWidth: '90%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Confirm Deactivation</h3>
                    <button 
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            color: '#6b7280',
                            padding: '4px'
                        }}
                        onClick={onClose}
                    >
                        <FaTimes />
                    </button>
                </div>
                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        padding: '12px 16px',
                        margin: '0 20px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: '16px'
                    }}>
                        <span style={{ marginRight: '8px' }}>⚠️</span> 
                        <span>{error}</span>
                    </div>
                )}
                <div style={{ padding: '20px' }}>
                    <p style={{ marginBottom: '12px', color: '#4b5563', lineHeight: '1.5' }}>
                        Are you sure you want to deactivate {provider?.name}?
                    </p>
                    <p style={{ color: '#4b5563', lineHeight: '1.5' }}>
                        This will move them to the pre-register list.
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    padding: '16px 20px',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <button 
                        type="button" 
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSoftDelete}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                        Deactivate
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HCproviderDeleteModal;