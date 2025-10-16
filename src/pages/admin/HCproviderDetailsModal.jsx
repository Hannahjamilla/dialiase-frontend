import React from 'react';
import { FaTimes, FaUserNurse, FaPhone, FaEnvelope, FaVenusMars, FaIdCard, FaInfoCircle } from 'react-icons/fa';

const HCproviderDetailsModal = ({ show, onClose, provider }) => {
    if (!show || !provider) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                width: '90%',
                maxWidth: '800px',  // Changed from 600px to 800px
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '25px',
                position: 'relative'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    <FaTimes />
                </button>

                <h2 style={{
                    color: '#395886',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FaUserNurse />
                    Provider Details
                </h2>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        paddingBottom: '15px',
                        borderBottom: '1px solid #eee'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#f0f7ff',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '2rem',
                            color: '#395886',
                            fontWeight: 'bold'
                        }}>
                            {provider.name ? provider.name.charAt(0) : 'P'}
                        </div>
                        <div>
                            <h3 style={{ 
                                margin: '0 0 5px 0',
                                fontSize: '1.4rem',
                                color: '#2c3e50'
                            }}>
                                {provider.name || 'N/A'}
                            </h3>
                            <p style={{ 
                                margin: '0',
                                color: '#7f8c8d',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <FaIdCard />
                                {provider.employeeNumber || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: '10px',
                        padding: '20px'
                    }}>
                        <h4 style={{
                            marginTop: '0',
                            marginBottom: '15px',
                            color: '#395886',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <FaInfoCircle />
                            Basic Information
                        </h4>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px'
                        }}>
                            <div>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.85rem',
                                    color: '#7f8c8d'
                                }}>Specialization</p>
                                <p style={{
                                    margin: '0',
                                    fontWeight: '500'
                                }}>{provider.specialization || 'N/A'}</p>
                            </div>

                            <div>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.85rem',
                                    color: '#7f8c8d'
                                }}>Gender</p>
                                <p style={{
                                    margin: '0',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <FaVenusMars />
                                    {provider.gender ? provider.gender.charAt(0).toUpperCase() + provider.gender.slice(1) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: '10px',
                        padding: '20px'
                    }}>
                        <h4 style={{
                            marginTop: '0',
                            marginBottom: '15px',
                            color: '#395886',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <FaInfoCircle />
                            Contact Information
                        </h4>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px'
                        }}>
                            <div>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.85rem',
                                    color: '#7f8c8d'
                                }}>Email</p>
                                <p style={{
                                    margin: '0',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <FaEnvelope />
                                    {provider.email || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.85rem',
                                    color: '#7f8c8d'
                                }}>Phone Number</p>
                                <p style={{
                                    margin: '0',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <FaPhone />
                                    {provider.phone_number || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: '10px',
                        padding: '20px'
                    }}>
                        <h4 style={{
                            marginTop: '0',
                            marginBottom: '15px',
                            color: '#395886',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <FaInfoCircle />
                            Status Information
                        </h4>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px'
                        }}>
                            <div>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.85rem',
                                    color: '#7f8c8d'
                                }}>Account Status</p>
                                <p style={{
                                    margin: '0',
                                    fontWeight: '500'
                                }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: provider.EmpStatus === 'registered' ? '#e6f7ee' : '#fff0e6',
                                        color: provider.EmpStatus === 'registered' ? '#477977' : '#d46b08'
                                    }}>
                                        {provider.EmpStatus === 'registered' ? 'Active' : 'Inactive'}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <p style={{
                                    margin: '0 0 5px 0',
                                    fontSize: '0.85rem',
                                    color: '#7f8c8d'
                                }}>Registration Date</p>
                                <p style={{
                                    margin: '0',
                                    fontWeight: '500'
                                }}>
                                    {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HCproviderDetailsModal;