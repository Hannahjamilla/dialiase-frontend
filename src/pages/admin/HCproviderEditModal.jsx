import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

const HCproviderEditModal = ({ show, onClose, provider, onUpdate }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        employeeNumber: '',
        specialization: '',
        gender: 'male',
        date_of_birth: '',
        userLevel: 'doctor'
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (provider) {
            setFormData({
                first_name: provider.first_name,
                last_name: provider.last_name,
                email: provider.email,
                phone_number: provider.phone_number,
                employeeNumber: provider.employeeNumber,
                specialization: provider.specialization,
                gender: provider.gender || 'male',
                date_of_birth: provider.date_of_birth || '',
                userLevel: provider.userLevel
            });
        }
    }, [provider]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            const response = await axios.put(
                `http://localhost:8000/api/admin/providers/${provider.userID}`,
                formData
            );
            
            if (response.data.success) {
                onClose();
                onUpdate();
            } else {
                setError(response.data.message || 'Failed to update provider');
            }
        } catch (err) {
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(', ');
                setError(`Validation error: ${errorMessages}`);
            } else {
                setError(err.response?.data?.message || 'Error updating provider');
            }
        } finally {
            setIsSubmitting(false);
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
                width: '600px',
                maxWidth: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Edit Healthcare Provider</h3>
                    <button 
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            color: '#6b7280'
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
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>First Name</label>
                            <input 
                                type="text" 
                                name="first_name" 
                                value={formData.first_name} 
                                onChange={handleInputChange} 
                                required 
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Last Name</label>
                            <input 
                                type="text" 
                                name="last_name" 
                                value={formData.last_name} 
                                onChange={handleInputChange} 
                                required 
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Email</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                required 
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Phone Number</label>
                            <input 
                                type="tel" 
                                name="phone_number" 
                                value={formData.phone_number} 
                                onChange={handleInputChange} 
                                required 
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Employee Number</label>
                            <input 
                                type="text" 
                                name="employeeNumber" 
                                value={formData.employeeNumber} 
                                onChange={handleInputChange} 
                                required 
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Gender</label>
                            <select 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleInputChange} 
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Date of Birth</label>
                            <input 
                                type="date" 
                                name="date_of_birth" 
                                value={formData.date_of_birth} 
                                onChange={handleInputChange} 
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Role</label>
                            <select 
                                name="userLevel" 
                                value={formData.userLevel} 
                                onChange={handleInputChange} 
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="doctor">Doctor</option>
                                <option value="nurse">Nurse</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151'
                        }}>Specialization</label>
                        <input 
                            type="text" 
                            name="specialization" 
                            value={formData.specialization} 
                            onChange={handleInputChange} 
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #d1d5db',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <button 
                            type="button" 
                            onClick={onClose}
                            disabled={isSubmitting}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                opacity: isSubmitting ? '0.5' : '1'
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                opacity: isSubmitting ? '0.5' : '1'
                            }}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Provider'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HCproviderEditModal;