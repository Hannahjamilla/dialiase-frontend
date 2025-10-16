import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUserPlus, FaSpinner } from 'react-icons/fa';
import { MdCheckCircle, MdError } from 'react-icons/md';
import axios from 'axios';
import StaffSidebar from './StaffSidebar';
import '../../css/StaffPreRegister.css';

const StaffPreRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        email: '',
        phone_number: '',
        gender: '',
        userLevel: '',
        specialization: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
    
        try {
            const dataToSend = {
                ...formData,
                specialization: (formData.userLevel === 'doctor' || formData.userLevel === 'nurse') 
                    ? formData.specialization 
                    : null
            };

            const response = await axios.post('http://localhost:8000/api/staff/providers/pre-register', dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
    
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/staff/staff_HCList', {
                        state: {
                            success: true,
                            message: 'Provider pre-registered successfully!'
                        }
                    });
                }, 1500);
            } else {
                setError(response.data.message || 'Failed to pre-register provider');
            }
        } catch (err) {
            let errorMessage = 'Error pre-registering provider';
            
            if (err.response) {
                if (err.response.data) {
                    errorMessage = err.response.data.message || 'No error message provided';
                    if (err.response.data.errors) {
                        errorMessage += ': ' + Object.values(err.response.data.errors).join(', ');
                    }
                } else {
                    errorMessage = `Server responded with status ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const showSpecialization = formData.userLevel === 'doctor' || formData.userLevel === 'nurse';

    return (
        <div className="provider-container" style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f5f7fa'
        }}>
            <StaffSidebar />
            <div className="provider-content" style={{
                flex: 1,
                padding: '2rem',
                marginLeft: '250px'
            }}>
                <div className="provider-header" style={{
                    marginBottom: '2rem'
                }}>
                    <div className="provider-header-top" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <h1 className="provider-heading" style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.8rem',
                            color: '#2c3e50',
                            margin: 0
                        }}>
                            <FaUserPlus style={{
                                marginRight: '0.75rem',
                                color: '#4e73df'
                            }} />
                            Pre-register Healthcare Provider
                        </h1>
                        <div className="provider-user-info">
                            <button
                                className="provider-back-button"
                                onClick={() => navigate('/staff/staff_HCList')}
                                disabled={loading}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#f8f9fc',
                                    border: '1px solid #d1d3e2',
                                    borderRadius: '0.35rem',
                                    color: '#4e73df',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    fontWeight: '600',
                                    ':hover': {
                                        backgroundColor: '#e2e6f0'
                                    },
                                    ':disabled': {
                                        opacity: 0.7,
                                        cursor: 'not-allowed'
                                    }
                                }}
                            >
                                <FaArrowLeft style={{ marginRight: '0.5rem' }} />
                                Back to List
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="provider-error-message" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#fdecea',
                        borderRadius: '0.35rem',
                        borderLeft: '4px solid #f44336',
                        color: '#d32f2f'
                    }}>
                        <MdError style={{ 
                            marginRight: '0.75rem',
                            fontSize: '1.5rem',
                            flexShrink: 0
                        }} />
                        <div>
                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Error:</strong>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="provider-success-message" style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#edf7ed',
                        borderRadius: '0.35rem',
                        borderLeft: '4px solid #4caf50',
                        color: '#2e7d32'
                    }}>
                        <MdCheckCircle style={{ 
                            marginRight: '0.75rem',
                            fontSize: '1.5rem',
                            flexShrink: 0
                        }} />
                        <div>
                            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Success:</strong>
                            <span>Provider pre-registered successfully!</span>
                        </div>
                    </div>
                )}

                <div className="provider-form-container" style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
                    padding: '2rem'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div className="provider-form-row" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#4e73df'
                                }}>First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                />
                            </div>

                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#5a5c69'
                                }}>Middle Name</label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                />
                            </div>

                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#4e73df'
                                }}>Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                />
                            </div>

                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#5a5c69'
                                }}>Suffix</label>
                                <input
                                    type="text"
                                    name="suffix"
                                    value={formData.suffix}
                                    onChange={handleChange}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                />
                            </div>

                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#4e73df'
                                }}>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                />
                            </div>

                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#5a5c69'
                                }}>Phone Number (optional)</label>
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                />
                            </div>

                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#4e73df'
                                }}>Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        backgroundColor: 'white',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="provider-form-group" style={{
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#4e73df'
                                }}>User Level *</label>
                                <select
                                    name="userLevel"
                                    value={formData.userLevel}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d3e2',
                                        borderRadius: '0.35rem',
                                        fontSize: '0.9rem',
                                        backgroundColor: 'white',
                                        transition: 'border-color 0.15s ease-in-out',
                                        ':focus': {
                                            outline: 'none',
                                            borderColor: '#4e73df',
                                            boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#f8f9fc'
                                        }
                                    }}
                                >
                                    <option value="">Select</option>
                                    <option value="staff">Staff</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="nurse">Nurse</option>
                                    <option value="admin">Admin</option>
                                    <option value="distributor">Distributor</option>
                                </select>
                            </div>

                            {showSpecialization && (
                                <div className="provider-form-group" style={{
                                    marginBottom: '1rem'
                                }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: '600',
                                        color: '#4e73df'
                                    }}>Specialization *</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        required={showSpecialization}
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d3e2',
                                            borderRadius: '0.35rem',
                                            fontSize: '0.9rem',
                                            transition: 'border-color 0.15s ease-in-out',
                                            ':focus': {
                                                outline: 'none',
                                                borderColor: '#4e73df',
                                                boxShadow: '0 0 0 0.2rem rgba(78, 115, 223, 0.25)'
                                            },
                                            ':disabled': {
                                                backgroundColor: '#f8f9fc'
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="provider-form-actions" style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '1.5rem'
                        }}>
                            <button 
                                type="submit" 
                                className="provider-submit-button" 
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#4e73df',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.35rem',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    ':hover': {
                                        backgroundColor: '#2e59d9',
                                        transform: 'translateY(-1px)'
                                    },
                                    ':disabled': {
                                        backgroundColor: '#aab7d4',
                                        cursor: 'not-allowed',
                                        transform: 'none'
                                    }
                                }}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="fa-spin" style={{ 
                                            marginRight: '0.5rem',
                                            fontSize: '1rem'
                                        }} />
                                        Processing...
                                    </>
                                ) : (
                                    'Pre-register'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffPreRegister;