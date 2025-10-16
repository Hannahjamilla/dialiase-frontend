import React, { useState, useEffect, useRef } from 'react';
import { FaUserNurse, FaSearch, FaFilePdf, FaPlus, FaChevronLeft, FaChevronRight, FaEye, FaPhone, FaEnvelope, FaColumns, FaBars, FaTimes, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StaffSidebar from './StaffSidebar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HCproviderList = () => {
    const [providers, setProviders] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [providersPerPage] = useState(8);
    const [user, setUser] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        employeeNumber: true,
        name: true,
        specialization: true,
        gender: true,
        email: true,
        phone: true,
        status: true
    });
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Column options for toggle
    const columnOptions = [
        { id: 'employeeNumber', label: 'Employee #' },
        { id: 'name', label: 'Name' },
        { id: 'specialization', label: 'Specialization' },
        { id: 'gender', label: 'Gender' },
        { id: 'email', label: 'Email' },
        { id: 'phone', label: 'Contact No.' },
        { id: 'status', label: 'Status' }
    ];

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
            if (window.innerWidth >= 992) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            const loggedInUser = JSON.parse(localStorage.getItem('user'));
            setUser(loggedInUser);
            fetchProviders(token);
        }

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [navigate]);

    const fetchProviders = async (token) => {
        try {
            const response = await axios.get('http://localhost:8000/api/staff/providers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.success) {
                const sortedProviders = (response.data.data || []).sort((a, b) => {
                    const dateA = new Date(a.created_at || 0);
                    const dateB = new Date(b.created_at || 0);
                    return dateB - dateA;
                });
                setProviders(sortedProviders);
            } else {
                setError(response.data?.message || 'Failed to fetch providers');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error fetching providers');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleViewProvider = (provider) => {
        setSelectedProvider(provider);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProvider(null);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (value.length > 1) {
            const suggestions = providers.filter(provider => {
                const searchLower = value.toLowerCase();
                return (
                    provider.employeeNumber?.toString().includes(value) ||
                    provider.name?.toLowerCase().includes(searchLower) ||
                    provider.specialization?.toLowerCase().includes(searchLower) ||
                    provider.email?.toLowerCase().includes(searchLower) ||
                    provider.phone_number?.includes(value) ||
                    provider.gender?.toLowerCase().includes(searchLower)
                );
            }).slice(0, 5);
            
            setSearchSuggestions(suggestions);
            setShowSuggestions(true);
        } else {
            setSearchSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (provider) => {
        setSearchTerm(provider.name);
        setShowSuggestions(false);
    };

    const isNewProvider = (provider) => {
        if (!provider.created_at) return false;
        const registrationTime = new Date(provider.created_at).getTime();
        const currentTime = new Date().getTime();
        return (currentTime - registrationTime) < 3600000;
    };

    const filteredProviders = providers.filter(provider => {
        const searchLower = searchTerm.toLowerCase();
        return (
            provider.employeeNumber?.toString().includes(searchTerm) ||
            provider.name?.toLowerCase().includes(searchLower) ||
            provider.specialization?.toLowerCase().includes(searchLower) ||
            provider.email?.toLowerCase().includes(searchLower) ||
            provider.phone_number?.includes(searchTerm) ||
            provider.gender?.toLowerCase().includes(searchLower)
        );
    });

    const lastIndex = currentPage * providersPerPage;
    const firstIndex = lastIndex - providersPerPage;
    const currentProviders = filteredProviders.slice(firstIndex, lastIndex);
    const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

    const generatePDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFont("Poppins");
            doc.setFontSize(18);
            doc.text('Healthcare Providers List', 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            
            if (user) {
                doc.text(`Generated by: ${user.first_name} ${user.last_name || ''}`, 14, 38);
            }

            const headers = [];
            const columns = [];
            
            if (visibleColumns.employeeNumber) {
                headers.push('Employee #');
                columns.push(provider => provider.employeeNumber || 'N/A');
            }
            if (visibleColumns.name) {
                headers.push('Name');
                columns.push(provider => provider.name || 'N/A');
            }
            if (visibleColumns.specialization) {
                headers.push('Specialization');
                columns.push(provider => provider.specialization || 'N/A');
            }
            if (visibleColumns.gender) {
                headers.push('Gender');
                columns.push(provider => provider.gender ? provider.gender.charAt(0).toUpperCase() + provider.gender.slice(1) : 'N/A');
            }
            if (visibleColumns.email) {
                headers.push('Email');
                columns.push(provider => provider.email || 'N/A');
            }
            if (visibleColumns.phone) {
                headers.push('Contact No.');
                columns.push(provider => provider.phone_number || 'N/A');
            }
            if (visibleColumns.status) {
                headers.push('Status');
                columns.push(provider => provider.EmpStatus === 'registered' ? 'Active' : 'Inactive');
            }

            autoTable(doc, {
                startY: user ? 50 : 40,
                head: [headers],
                body: filteredProviders.map(provider => columns.map(col => col(provider))),
                styles: {
                    font: "Poppins",
                    fontSize: 8,
                    cellPadding: 2,
                    textColor: 20
                },
                headStyles: {
                    fillColor: [79, 70, 229],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 255]
                }
            });

            doc.save(`providers-list-${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. Please check console for details.');
        }
    };

    const getPaginationGroup = () => {
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, start + 3);
        
        if (end === totalPages) {
            start = Math.max(1, end - 3);
        }
        
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const toggleSelectProvider = (providerId) => {
        setSelectedProviders(prev => 
            prev.includes(providerId) 
                ? prev.filter(id => id !== providerId) 
                : [...prev, providerId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedProviders.length === currentProviders.length) {
            setSelectedProviders([]);
        } else {
            setSelectedProviders(currentProviders.map(p => p.id));
        }
    };

    const handleCall = (phoneNumber) => {
        if (phoneNumber) {
            window.open(`tel:${phoneNumber}`);
        } else {
            alert('No phone number available for this provider');
        }
    };

    const handleEmail = (email) => {
        if (email) {
            window.open(`mailto:${email}`);
        } else {
            alert('No email available for this provider');
        }
    };

    const handleBatchCall = () => {
        const providersToCall = providers.filter(p => selectedProviders.includes(p.id) && p.phone_number);
        if (providersToCall.length === 0) {
            alert('No selected providers have phone numbers');
            return;
        }
        handleCall(providersToCall[0].phone_number);
    };

    const handleBatchEmail = () => {
        const providersToEmail = providers.filter(p => selectedProviders.includes(p.id) && p.email);
        if (providersToEmail.length === 0) {
            alert('No selected providers have email addresses');
            return;
        }
        const emails = providersToEmail.map(p => p.email).join(',');
        handleEmail(emails);
    };

    const newProvidersCount = providers.filter(p => new Date(p.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f5f7fa',
            fontFamily: "'Poppins', sans-serif"
        }}>
            {/* Sidebar */}
            <div style={{
                width: sidebarOpen ? '250px' : '0',
                minHeight: '100vh',
                backgroundColor: '#fff',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                position: 'fixed',
                zIndex: '1000'
            }}>
                <StaffSidebar />
            </div>
            
            {/* Main Content */}
            <div style={{
                flex: '1',
                padding: '20px',
                marginLeft: sidebarOpen ? '250px' : '0',
                transition: 'margin-left 0.3s ease'
            }}>
                {/* Mobile Header */}
                {isMobile && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <button 
                            onClick={toggleSidebar}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                color: '#4f46e5',
                                cursor: 'pointer',
                                marginRight: '15px'
                            }}
                        >
                            <FaBars />
                        </button>
                        <h1 style={{
                            margin: '0',
                            fontSize: '18px',
                            color: '#2c3e50',
                            fontWeight: '600'
                        }}>Healthcare Providers</h1>
                    </div>
                )}
                
                {/* Desktop Header */}
                {!isMobile && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        marginTop: '220px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                        }}>
                            <h1 style={{
                                margin: '0',
                                fontSize: '24px',
                                color: '#2c3e50',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <FaUserNurse style={{ color: '#4f46e5' }} />
                                Healthcare Providers
                            </h1>
                            {user && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    
                                }}>
                                    <span style={{
                                        color: '#7f8c8d',
                                        fontSize: '14px'
                                    }}>Welcome, {user.first_name}!</span>
                                </div>
                            )}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <p style={{
                                margin: '0',
                                color: '#7f8c8d',
                                fontSize: '14px'
                            }}>View all healthcare provider records</p>
                            <p style={{
                                margin: '0',
                                color: '#7f8c8d',
                                fontSize: '14px'
                            }}>
                                {new Date().toLocaleString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        borderLeft: '4px solid #4f46e5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{
                                margin: '0 0 5px 0',
                                color: '#7f8c8d',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>Total Providers</h3>
                            <p style={{
                                margin: '0',
                                color: '#2c3e50',
                                fontSize: '28px',
                                fontWeight: '600'
                            }}>{providers.length}</p>
                        </div>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4f46e5',
                            fontSize: '20px'
                        }}>
                            <FaUserNurse />
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        borderLeft: '4px solid #10b981',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{
                                margin: '0 0 5px 0',
                                color: '#7f8c8d',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>New Providers</h3>
                            <p style={{
                                margin: '0',
                                color: '#2c3e50',
                                fontSize: '28px',
                                fontWeight: '600'
                            }}>{newProvidersCount}</p>
                        </div>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            fontSize: '20px'
                        }}>
                            <FaUserNurse />
                        </div>
                    </div>
                </div>

                {/* Search and Actions */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '15px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            position: 'relative',
                            flex: '1'
                        }} ref={searchRef}>
                            <div style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#7f8c8d'
                            }}>
                                <FaSearch />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, employee #, or contact..."
                                style={{
                                    width: '100%',
                                    padding: '12px 20px 12px 40px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border 0.3s',
                                    boxSizing: 'border-box',
                                    ':focus': {
                                        borderColor: '#4f46e5'
                                    }
                                }}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
                            />
                            {showSuggestions && searchSuggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '0',
                                    right: '0',
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: '1000',
                                    marginTop: '5px',
                                    overflow: 'hidden'
                                }}>
                                    {searchSuggestions.map((provider, index) => (
                                        <div 
                                            key={index}
                                            style={{
                                                padding: '12px 15px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                ':hover': {
                                                    backgroundColor: '#f8f9fa'
                                                }
                                            }}
                                            onClick={() => handleSuggestionClick(provider)}
                                        >
                                            <div style={{
                                                fontWeight: '500',
                                                color: '#2c3e50',
                                                marginBottom: '3px'
                                            }}>
                                                {provider.name}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#7f8c8d'
                                            }}>
                                                {provider.employeeNumber} • {provider.specialization}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            position: 'relative'
                        }}>
                            <button 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 15px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#2c3e50',
                                    transition: 'all 0.2s',
                                    ':hover': {
                                        backgroundColor: '#f8f9fa'
                                    }
                                }}
                                onClick={() => setShowColumnSelector(!showColumnSelector)}
                            >
                                <FaColumns />
                                {!isMobile && 'Columns'}
                            </button>
                            {showColumnSelector && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: '1000',
                                    padding: '15px',
                                    width: '200px',
                                    marginTop: '10px'
                                }}>
                                    <h4 style={{
                                        margin: '0 0 10px 0',
                                        fontSize: '14px',
                                        color: '#2c3e50'
                                    }}>Visible Columns</h4>
                                    {columnOptions.map(column => (
                                        <label key={column.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px',
                                            cursor: 'pointer'
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns[column.id]}
                                                onChange={() => setVisibleColumns(prev => ({
                                                    ...prev,
                                                    [column.id]: !prev[column.id]
                                                }))}
                                                style={{
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            {column.label}
                                        </label>
                                    ))}
                                </div>
                            )}
                            <button 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 15px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#2c3e50',
                                    transition: 'all 0.2s',
                                    ':hover': {
                                        backgroundColor: '#f8f9fa'
                                    },
                                    ':disabled': {
                                        opacity: '0.6',
                                        cursor: 'not-allowed'
                                    }
                                }}
                                onClick={generatePDF}
                                disabled={filteredProviders.length === 0}
                            >
                                <FaFilePdf />
                                {!isMobile && 'Download PDF'}
                            </button>
                            <button 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 15px',
                                    backgroundColor: '#4f46e5',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#fff',
                                    transition: 'all 0.2s',
                                    ':hover': {
                                        backgroundColor: '#4338ca'
                                    }
                                }}
                                onClick={() => navigate('/staff/StaffPreRegister')}
                            >
                                <FaPlus />
                                {!isMobile && 'Pre-register Provider'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fff5f5',
                        borderLeft: '4px solid #ef4444',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ color: '#ef4444', fontSize: '20px' }}>⚠️</span> 
                        <div>
                            <strong style={{ color: '#2c3e50' }}>Error:</strong> 
                            <span style={{ color: '#7f8c8d', marginLeft: '5px' }}>{error}</span>
                        </div>
                        <button 
                            style={{
                                marginLeft: 'auto',
                                padding: '5px 10px',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'background-color 0.2s',
                                ':hover': {
                                    backgroundColor: '#dc2626'
                                }
                            }}
                            onClick={() => fetchProviders(localStorage.getItem('token'))}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Table Container */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    {selectedProviders.length > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            marginBottom: '15px'
                        }}>
                            <span style={{
                                color: '#2c3e50',
                                fontSize: '14px'
                            }}>{selectedProviders.length} selected</span>
                            <div style={{
                                display: 'flex',
                                gap: '10px'
                            }}>
                                <button 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '8px 12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#2c3e50',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: '#f1f5f9'
                                        }
                                    }}
                                    onClick={handleBatchEmail}
                                >
                                    <FaEnvelope />
                                    {!isMobile && 'Email'}
                                </button>
                                <button 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '8px 12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#2c3e50',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: '#f1f5f9'
                                        }
                                    }}
                                    onClick={handleBatchCall}
                                >
                                    <FaPhone />
                                    {!isMobile && 'Call'}
                                </button>
                                <button 
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#ef4444',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: '#f1f5f9'
                                        }
                                    }}
                                    onClick={() => setSelectedProviders([])}
                                >
                                    {isMobile ? '×' : 'Clear'}
                                </button>
                            </div>
                        </div>
                    )}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }}>
                        <div style={{
                            color: '#7f8c8d',
                            fontSize: '14px'
                        }}>
                            Showing {firstIndex + 1}-{Math.min(lastIndex, filteredProviders.length)} of {filteredProviders.length} providers
                        </div>
                        {!isMobile && (
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '8px 12px',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#2c3e50',
                                transition: 'all 0.2s',
                                ':hover': {
                                    backgroundColor: '#f1f5f9'
                                }
                            }}>
                                <FaFilter /> Filter
                            </button>
                        )}
                    </div>
                    <div style={{
                        overflowX: 'auto'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: '#f8f9fa',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <th style={{
                                        padding: '12px 15px',
                                        textAlign: 'left',
                                        fontSize: '14px',
                                        color: '#7f8c8d',
                                        fontWeight: '500',
                                        width: '40px'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProviders.length === currentProviders.length && currentProviders.length > 0}
                                            onChange={toggleSelectAll}
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </th>
                                    {visibleColumns.employeeNumber && (
                                        <th style={{
                                            padding: '12px 15px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>Employee #</th>
                                    )}
                                    {visibleColumns.name && (
                                        <th style={{
                                            padding: '12px 15px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>Provider Name</th>
                                    )}
                                    {visibleColumns.specialization && (
                                        <th style={{
                                            padding: '12px 15px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>Specialization</th>
                                    )}
                                    {visibleColumns.gender && (
                                        <th style={{
                                            padding: '12px 15px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>Gender</th>
                                    )}
                                    {visibleColumns.email && (
                                        <th style={{
                                            padding: '12px 15px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>Email</th>
                                    )}
                                    {visibleColumns.phone && (
                                        <th style={{
                                            padding: '12px 15px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>Contact No.</th>
                                    )}
                                    {visibleColumns.status && (
                                        <th style={{
                                            padding: '12px 15px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>Status</th>
                                    )}
                                    <th style={{
                                        padding: '12px 15px',
                                        textAlign: 'left',
                                        fontSize: '14px',
                                        color: '#7f8c8d',
                                        fontWeight: '500'
                                    }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProviders.length > 0 ? (
                                    currentProviders.map((provider, index) => (
                                        <tr key={index} style={{
                                            borderBottom: '1px solid #eee',
                                            ':hover': {
                                                backgroundColor: '#f8f9fa'
                                            }
                                        }}>
                                            <td style={{
                                                padding: '12px 15px',
                                                textAlign: 'left',
                                                fontSize: '14px'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProviders.includes(provider.id)}
                                                    onChange={() => toggleSelectProvider(provider.id)}
                                                    style={{
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </td>
                                            {visibleColumns.employeeNumber && (
                                                <td style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#2c3e50'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        {provider.employeeNumber || 'N/A'}
                                                        {isNewProvider(provider) && (
                                                            <span style={{
                                                                backgroundColor: '#10b981',
                                                                color: '#fff',
                                                                fontSize: '10px',
                                                                padding: '2px 6px',
                                                                borderRadius: '10px'
                                                            }}>New</span>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            {visibleColumns.name && (
                                                <td style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#2c3e50',
                                                    fontWeight: '500'
                                                }}>
                                                    {provider.name || 'N/A'}
                                                </td>
                                            )}
                                            {visibleColumns.specialization && (
                                                <td style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#7f8c8d'
                                                }}>
                                                    {provider.specialization || 'N/A'}
                                                </td>
                                            )}
                                            {visibleColumns.gender && (
                                                <td style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#7f8c8d'
                                                }}>
                                                    {provider.gender ? provider.gender.charAt(0).toUpperCase() + provider.gender.slice(1) : 'N/A'}
                                                </td>
                                            )}
                                            {visibleColumns.email && (
                                                <td style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#7f8c8d',
                                                    maxWidth: '200px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {provider.email || 'N/A'}
                                                </td>
                                            )}
                                            {visibleColumns.phone && (
                                                <td style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    fontSize: '14px',
                                                    color: '#7f8c8d'
                                                }}>
                                                    {provider.phone_number || 'N/A'}
                                                </td>
                                            )}
                                            {visibleColumns.status && (
                                                <td style={{
                                                    padding: '12px 15px',
                                                    textAlign: 'left',
                                                    fontSize: '14px'
                                                }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        backgroundColor: provider.EmpStatus === 'registered' ? '#e0f7fa' : '#fff5f5',
                                                        color: provider.EmpStatus === 'registered' ? '#00acc1' : '#ef4444'
                                                    }}>
                                                        {provider.EmpStatus === 'registered' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            )}
                                            <td style={{
                                                padding: '12px 15px',
                                                textAlign: 'left',
                                                fontSize: '14px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                }}>
                                                    <button 
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            padding: '8px 12px',
                                                            backgroundColor: '#f1f5f9',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            color: '#2c3e50',
                                                            transition: 'all 0.2s',
                                                            ':hover': {
                                                                backgroundColor: '#e2e8f0'
                                                            }
                                                        }}
                                                        onClick={() => handleViewProvider(provider)}
                                                    >
                                                        <FaEye />
                                                        {!isMobile && 'View'}
                                                    </button>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '5px'
                                                    }}>
                                                        {/* <button 
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: '#f1f5f9',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                color: '#2c3e50',
                                                                transition: 'all 0.2s',
                                                                ':hover': {
                                                                    backgroundColor: '#e2e8f0'
                                                                },
                                                                ':disabled': {
                                                                    opacity: '0.5',
                                                                    cursor: 'not-allowed'
                                                                }
                                                            }}
                                                            onClick={() => handleCall(provider.phone_number)}
                                                            disabled={!provider.phone_number}
                                                        >
                                                            <FaPhone />
                                                        </button> */}
                                                        <button 
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                backgroundColor: '#f1f5f9',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                color: '#2c3e50',
                                                                transition: 'all 0.2s',
                                                                ':hover': {
                                                                    backgroundColor: '#e2e8f0'
                                                                },
                                                                ':disabled': {
                                                                    opacity: '0.5',
                                                                    cursor: 'not-allowed'
                                                                }
                                                            }}
                                                            onClick={() => handleEmail(provider.email)}
                                                            disabled={!provider.email}
                                                        >
                                                            <FaEnvelope />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} style={{
                                            padding: '40px 20px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '15px'
                                            }}>
                                                <img 
                                                    src="/images/no-results.svg" 
                                                    alt="No results" 
                                                    style={{
                                                        width: '150px',
                                                        opacity: '0.7'
                                                    }}
                                                />
                                                <h3 style={{
                                                    margin: '0',
                                                    color: '#2c3e50',
                                                    fontSize: '16px'
                                                }}>
                                                    {providers.length === 0 
                                                        ? 'No providers in the database' 
                                                        : 'No matching providers found'}
                                                </h3>
                                                {providers.length > 0 && searchTerm && (
                                                    <button 
                                                        style={{
                                                            padding: '8px 16px',
                                                            backgroundColor: '#4f46e5',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px',
                                                            transition: 'background-color 0.2s',
                                                            ':hover': {
                                                                backgroundColor: '#4338ca'
                                                            }
                                                        }}
                                                        onClick={() => setSearchTerm('')}
                                                    >
                                                        Clear search
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredProviders.length > 0 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '20px',
                            paddingTop: '15px',
                            borderTop: '1px solid #eee'
                        }}>
                            <div style={{
                                color: '#7f8c8d',
                                fontSize: '14px'
                            }}>
                                Page {currentPage} of {totalPages}
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '5px'
                            }}>
                                <button
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        color: currentPage === 1 ? '#7f8c8d' : '#2c3e50',
                                        opacity: currentPage === 1 ? '0.6' : '1',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: currentPage === 1 ? '#f1f5f9' : '#f8f9fa'
                                        }
                                    }}
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    {isMobile ? '«' : <><FaChevronLeft /><FaChevronLeft /></>}
                                </button>
                                <button
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: currentPage === 1 ? '#f1f5f9' : '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        color: currentPage === 1 ? '#7f8c8d' : '#2c3e50',
                                        opacity: currentPage === 1 ? '0.6' : '1',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: currentPage === 1 ? '#f1f5f9' : '#f8f9fa'
                                        }
                                    }}
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    {isMobile ? '‹' : <FaChevronLeft />}
                                </button>
                                
                                {getPaginationGroup().map(number => (
                                    <button
                                        key={number}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: number === currentPage ? '#4f46e5' : '#fff',
                                            border: number === currentPage ? '1px solid #4f46e5' : '1px solid #ddd',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            color: number === currentPage ? '#fff' : '#2c3e50',
                                            transition: 'all 0.2s',
                                            ':hover': {
                                                backgroundColor: number === currentPage ? '#4f46e5' : '#f8f9fa'
                                            }
                                        }}
                                        onClick={() => setCurrentPage(number)}
                                    >
                                        {number}
                                    </button>
                                ))}
                                
                                <button
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        color: currentPage === totalPages ? '#7f8c8d' : '#2c3e50',
                                        opacity: currentPage === totalPages ? '0.6' : '1',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#f8f9fa'
                                        }
                                    }}
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    {isMobile ? '›' : <FaChevronRight />}
                                </button>
                                <button
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        color: currentPage === totalPages ? '#7f8c8d' : '#2c3e50',
                                        opacity: currentPage === totalPages ? '0.6' : '1',
                                        transition: 'all 0.2s',
                                        ':hover': {
                                            backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#f8f9fa'
                                        }
                                    }}
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    {isMobile ? '»' : <><FaChevronRight /><FaChevronRight /></>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Provider Details Modal */}
            {showModal && selectedProvider && (
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: '2000',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px',
                            borderBottom: '1px solid #eee',
                            position: 'sticky',
                            top: '0',
                            backgroundColor: '#fff',
                            zIndex: '10'
                        }}>
                            <h2 style={{
                                margin: '0',
                                fontSize: '20px',
                                color: '#2c3e50',
                                fontWeight: '600'
                            }}>Provider Details</h2>
                            <button 
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    color: '#7f8c8d',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s',
                                    ':hover': {
                                        color: '#2c3e50'
                                    }
                                }}
                                onClick={closeModal}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div style={{
                            padding: '20px'
                        }}>
                            <div style={{
                                marginBottom: '25px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 15px 0',
                                    fontSize: '16px',
                                    color: '#4f46e5',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#4f46e5',
                                        borderRadius: '50%'
                                    }}></span>
                                    Basic Information
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: '15px'
                                }}>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Employee Number:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.employeeNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Full Name:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.name || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Specialization:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.specialization || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Gender:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.gender || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginBottom: '25px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 15px 0',
                                    fontSize: '16px',
                                    color: '#4f46e5',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#4f46e5',
                                        borderRadius: '50%'
                                    }}></span>
                                    Contact Information
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: '15px'
                                }}>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Email:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.email || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Phone Number:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.phone_number || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginBottom: '25px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 15px 0',
                                    fontSize: '16px',
                                    color: '#4f46e5',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#4f46e5',
                                        borderRadius: '50%'
                                    }}></span>
                                    Professional Information
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: '15px'
                                }}>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>License Number:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.licenseNumber || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Department:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>{selectedProvider.department || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{
                                    margin: '0 0 15px 0',
                                    fontSize: '16px',
                                    color: '#4f46e5',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#4f46e5',
                                        borderRadius: '50%'
                                    }}></span>
                                    Additional Information
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                    gap: '15px'
                                }}>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Registration Date:</span>
                                        <span style={{
                                            fontSize: '15px',
                                            color: '#2c3e50'
                                        }}>
                                            {new Date(selectedProvider.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            color: '#7f8c8d',
                                            marginBottom: '5px'
                                        }}>Status:</span>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            backgroundColor: selectedProvider.EmpStatus === 'registered' ? '#e0f7fa' : '#fff5f5',
                                            color: selectedProvider.EmpStatus === 'registered' ? '#00acc1' : '#ef4444'
                                        }}>
                                            {selectedProvider.EmpStatus === 'registered' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            padding: '20px',
                            borderTop: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button 
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#2c3e50',
                                    transition: 'all 0.2s',
                                    ':hover': {
                                        backgroundColor: '#f8f9fa'
                                    }
                                }}
                                onClick={closeModal}
                            >
                                Close
                            </button>
                            <button 
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#4f46e5',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#fff',
                                    transition: 'all 0.2s',
                                    ':hover': {
                                        backgroundColor: '#4338ca'
                                    }
                                }}
                                onClick={() => {
                                    closeModal();
                                    navigate(`/staff/provider/${selectedProvider.id}/edit`);
                                }}
                            >
                                Edit Provider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HCproviderList;