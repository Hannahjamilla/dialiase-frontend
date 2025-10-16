import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiAlertTriangle, 
  FiBell, 
  FiCalendar, 
  FiFilter, 
  FiEye, 
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiSearch,
  FiThermometer,
  FiDroplet,
  FiUser,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiMessageSquare,
  FiActivity
} from 'react-icons/fi';
import { FaRegCalendarAlt, FaProcedures, FaRegChartBar, FaExclamationTriangle, FaHospital } from 'react-icons/fa';
import { BsClipboard2Pulse, BsSortDown } from 'react-icons/bs';
import PatientDetailModal from './PatientDetailsModal';
import EmergencyActionsPanel from './EmergencyActionsPanel';
import debounce from 'lodash.debounce';

// Color constants
const colors = {
  primary: '#395886',
  secondary: '#638ECB',
  white: '#FFFFFF',
  green: '#477977',
  danger: '#dc3545',
  warning: '#ffc107',
  success: '#28a745',
  info: '#17a2b8',
  lightDanger: '#f8d7da',
  lightWarning: '#fff3cd',
  lightSuccess: '#d4edda'
};

// Initial data to prevent loading states
const initialData = {
  patients: [],
  adultPatients: [],
  pediatricPatients: [],
  emergencyPatients: [],
  summary: {
    total_patients: 0,
    total_treatments: 0,
    non_compliant_patients: 0,
    fluid_retention_alerts: 0,
    abnormal_color_alerts: 0,
    severe_retention_cases: 0
  },
  criticalAlerts: [],
  quickStats: {
    avgUf: 0,
    complianceRate: 0,
    alertTrend: 'down'
  }
};

const TrackPatientRecords = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState(initialData.patients);
    const [adultPatients, setAdultPatients] = useState(initialData.adultPatients);
    const [pediatricPatients, setPediatricPatients] = useState(initialData.pediatricPatients);
    const [emergencyPatients, setEmergencyPatients] = useState(initialData.emergencyPatients);

    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [summary, setSummary] = useState(initialData.summary);
    const [activeTab, setActiveTab] = useState('all');
    const [criticalAlerts, setCriticalAlerts] = useState(initialData.criticalAlerts);
    const [showFilters, setShowFilters] = useState(false);
    const [statsPeriod, setStatsPeriod] = useState('7d');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [quickStats, setQuickStats] = useState(initialData.quickStats);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPatients, setTotalPatients] = useState(0);
    const containerRef = useRef(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Pagination state for each table
    const [adultPagination, setAdultPagination] = useState({
        currentPage: 1,
        itemsPerPage: 5
    });
    const [pediatricPagination, setPediatricPagination] = useState({
        currentPage: 1,
        itemsPerPage: 5
    });

    const [isRecommending, setIsRecommending] = useState(false);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((searchValue) => {
            fetchTreatments(searchValue, 1, true);
        }, 500),
        []
    );

    const getSurname = useCallback((fullName) => {
        if (!fullName) return { givenNames: '', surname: '' };
        const surnamePrefixes = ['del', 'de la', 'van', 'van der', 'von'];
        const prefix = surnamePrefixes.find(prefix => 
            fullName.toLowerCase().includes(prefix + ' ')
        );
        
        if (prefix) {
            const prefixIndex = fullName.toLowerCase().lastIndexOf(prefix);
            if (prefixIndex > 0) {
                const givenNames = fullName.substring(0, prefixIndex - 1);
                const surname = fullName.substring(prefixIndex);
                return { givenNames, surname };
            }
        }
        
        const lastSpaceIndex = fullName.lastIndexOf(' ');
        if (lastSpaceIndex === -1) return { givenNames: '', surname: fullName };
        
        return {
            givenNames: fullName.substring(0, lastSpaceIndex),
            surname: fullName.substring(lastSpaceIndex + 1)
        };
    }, []);

    const sortPatients = useCallback((patients) => {
        return [...patients].sort((a, b) => {
            const aStats = calculatePatientStats(a);
            const bStats = calculatePatientStats(b);
            
            // Sort by severity first
            const aSeverity = aStats.severityLevel;
            const bSeverity = bStats.severityLevel;
            
            if (aSeverity !== bSeverity) {
                return bSeverity - aSeverity; // Higher severity first
            }
            
            // Then by surname
            const aSurname = getSurname(a.name).surname;
            const bSurname = getSurname(b.name).surname;
            
            return aSurname.localeCompare(bSurname);
        });
    }, [getSurname]);

    const formatNameBySurname = useCallback((fullName) => {
        if (!fullName) return '';
        const { givenNames, surname } = getSurname(fullName);
        return `${surname}, ${givenNames}`;
    }, [getSurname]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    const fetchTreatments = useCallback(async (searchTerm = '', pageNum = 1, isNewSearch = false) => {
        if (isFetching) return;
        
        try {
            setIsFetching(true);
            const params = new URLSearchParams();
            if (searchTerm.length >= 2) params.append('search', searchTerm);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (activeTab !== 'all') params.append('status', activeTab);
            params.append('stats_period', statsPeriod);
            params.append('page', pageNum);
            params.append('limit', 100); // Fetch 100 records per page

            const endpoint = '/doctor/patient-treatments';

            const response = await axios.get(`${endpoint}?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to fetch treatments');
            }

            const newPatients = isNewSearch ? response.data.patients : [...patients, ...response.data.patients];
            const sortedPatients = sortPatients(newPatients);
            
            if (isNewSearch) {
                setPatients(sortedPatients);
                setPage(2); // Reset to page 2 for next load
                setAdultPagination(prev => ({...prev, currentPage: 1}));
                setPediatricPagination(prev => ({...prev, currentPage: 1}));
            } else {
                setPatients(sortedPatients);
                setPage(prevPage => prevPage + 1);
            }

            setTotalPatients(response.data.total_patients || 0);
            setHasMore(response.data.has_more || false);

            // Categorize patients
            const adults = [];
            const pediatric = [];
            const emergency = [];
            
            sortedPatients.forEach(patient => {
                const stats = calculatePatientStats(patient);
                const age = calculateAge(patient.date_of_birth);
                
                if (stats.severityLevel >= 2) {
                    emergency.push(patient);
                } else if (age >= 18) {
                    adults.push(patient);
                } else {
                    pediatric.push(patient);
                }
            });
            
            setAdultPatients(adults);
            setPediatricPatients(pediatric);
            setEmergencyPatients(emergency);
            
            // Calculate quick stats
            let totalNetUF = 0;
            let totalTreatments = 0;
            sortedPatients.forEach(patient => {
                patient.treatments.forEach(treatment => {
                    const volumeIn = treatment.VolumeIn || 0;
                    const volumeOut = treatment.VolumeOut || 0;
                    totalNetUF += (volumeOut - volumeIn);
                    totalTreatments++;
                });
            });
            
            const avgUf = totalTreatments > 0 ? Math.round(totalNetUF / totalTreatments) : 0;
            const compliantPatients = sortedPatients.length - response.data.summary.non_compliant_patients;
            const complianceRate = sortedPatients.length > 0 
                ? Math.round((compliantPatients / sortedPatients.length) * 100) 
                : 0;
            
            setQuickStats({
                avgUf,
                complianceRate,
                alertTrend: response.data.summary.fluid_retention_alerts > 0 ? 'up' : 'down'
            });
            
            setSummary({
                ...response.data.summary,
                total_net_uf: totalNetUF
            });
            
            // Generate alerts
            const alerts = [];
            sortedPatients.forEach(patient => {
                const stats = calculatePatientStats(patient);
                
                if (stats.hasAbnormalColor) {
                    alerts.push({
                        type: 'color',
                        patientId: patient.patientID,
                        patientName: formatNameBySurname(patient.name),
                        message: 'Abnormal drain color detected',
                        severity: 'high'
                    });
                }
                
                if (stats.fluidRetentionAlert) {
                    alerts.push({
                        type: 'fluid',
                        patientId: patient.patientID,
                        patientName: formatNameBySurname(patient.name),
                        message: `Significant fluid retention (${stats.avgVolumeIn - stats.avgVolumeOut}mL)`,
                        severity: stats.severityLevel >= 2 ? 'critical' : 'high'
                    });
                }
                
                if (stats.complianceStatus === 'danger') {
                    alerts.push({
                        type: 'compliance',
                        patientId: patient.patientID,
                        patientName: formatNameBySurname(patient.name),
                        message: 'Non-compliance: Less than 3 treatments on some days',
                        severity: 'medium'
                    });
                }
            });
            
            setCriticalAlerts(alerts);
        } catch (error) {
            console.error('Error fetching treatments:', error);
            
            if (error.response) {
                if (error.response.status === 401) {
                    navigate('/login');
                    return;
                }
                
                setPatients([]);
                setAdultPatients([]);
                setPediatricPatients([]);
                setEmergencyPatients([]);
                setSummary(initialData.summary);
                
                alert(`Error: ${error.response.data.message || 'Failed to load treatments'}`);
            } else if (error.request) {
                alert('Network error - please check your connection');
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            setIsFetching(false);
        }
    }, [patients, dateFrom, dateTo, activeTab, statsPeriod, sortPatients, formatNameBySurname, navigate, isFetching]);

    // Initial load
    useEffect(() => {
        fetchTreatments('', 1, true);
    }, []);

    // Filter changes
    useEffect(() => {
        if (page > 1) { // Only trigger if we're not on initial load
            fetchTreatments(search, 1, true);
        }
    }, [dateFrom, dateTo, activeTab, statsPeriod]);

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current || isFetching || !hasMore) return;
            
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            if (scrollHeight - scrollTop <= clientHeight * 1.2) {
                fetchTreatments(search, page, false);
            }
        };

        const scrollContainer = containerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [fetchTreatments, isFetching, hasMore, page, search]);

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 0;
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    // Calculate patient statistics
    const calculatePatientStats = (patient) => {
        const treatmentCount = patient.treatments.length;
        let totalVolumeIn = 0;
        let totalVolumeOut = 0;
        let hasAbnormalColor = false;
        let lastTreatmentDate = null;
        let firstTreatmentDate = null;
        let incompleteDays = 0;
        let severeRetentionDays = 0;

        const treatmentsByDay = {};
        patient.treatments.forEach(treatment => {
            totalVolumeIn += treatment.VolumeIn || 0;
            totalVolumeOut += treatment.VolumeOut || 0;
            
            const treatmentDate = new Date(treatment.treatmentDate);
            const dayKey = treatmentDate.toISOString().split('T')[0];
            
            if (!treatmentsByDay[dayKey]) {
                treatmentsByDay[dayKey] = {
                    treatments: [],
                    dailyVolumeIn: 0,
                    dailyVolumeOut: 0,
                    dailyNetUF: 0,
                    completedCount: 0,
                    dayBalance: 0,
                    retentionCount: 0
                };
            }
            
            treatmentsByDay[dayKey].treatments.push(treatment);
            treatmentsByDay[dayKey].dailyVolumeIn += treatment.VolumeIn || 0;
            treatmentsByDay[dayKey].dailyVolumeOut += treatment.VolumeOut || 0;
            
            const balance = (treatment.VolumeOut || 0) - (treatment.VolumeIn || 0);
            treatmentsByDay[dayKey].dailyNetUF += balance;
            treatmentsByDay[dayKey].dayBalance += balance;
            
            if (balance < 0) {
                treatmentsByDay[dayKey].retentionCount++;
            }
            
            if (treatment.TreatmentStatus?.toLowerCase() === 'finished') {
                treatmentsByDay[dayKey].completedCount++;
            }
            
            if (!lastTreatmentDate || treatmentDate > lastTreatmentDate) {
                lastTreatmentDate = treatmentDate;
            }
            if (!firstTreatmentDate || treatmentDate < firstTreatmentDate) {
                firstTreatmentDate = treatmentDate;
            }

            const color = treatment.Color ? treatment.Color.toLowerCase() : '';
            if (color && !['clear', 'yellow', 'amber'].includes(color)) {
                hasAbnormalColor = true;
            }
        });

        const today = new Date().toISOString().split('T')[0];
        Object.entries(treatmentsByDay).forEach(([day, dayData]) => {
            if (day < today && dayData.treatments.length < 3) {
                incompleteDays++;
            }
            
            if (dayData.retentionCount === dayData.treatments.length && dayData.treatments.length > 0) {
                severeRetentionDays++;
            }
        });

        const avgVolumeIn = treatmentCount > 0 ? Math.round(totalVolumeIn / treatmentCount) : 0;
        const avgVolumeOut = treatmentCount > 0 ? Math.round(totalVolumeOut / treatmentCount) : 0;
        const fluidDifference = avgVolumeIn - avgVolumeOut;
        const totalNetUF = totalVolumeOut - totalVolumeIn;
        
        // Determine severity level
        let severityLevel = 0;
        if (severeRetentionDays > 0) {
            severityLevel = 2;
        } else if (fluidDifference > 200) {
            severityLevel = 1;
        }
        
        return {
            treatmentCount,
            avgVolumeIn,
            avgVolumeOut,
            fluidDifference,
            totalNetUF,
            fluidRetentionAlert: fluidDifference > 200,
            hasAbnormalColor,
            complianceStatus: incompleteDays > 0 ? 'danger' : 'normal',
            lastTreatmentDate,
            firstTreatmentDate,
            treatmentsByDay,
            incompleteDays,
            severeRetentionDays,
            severityLevel,
            age: calculateAge(patient.date_of_birth)
        };
    };

    // Format date for display
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Get CSS class for fluid color
    const getColorClass = (color) => {
        if (!color) return '';
        color = color.toLowerCase();
        
        if (color === 'clear') return 'color-clear';
        if (color === 'yellow' || color === 'amber') return 'color-normal';
        return 'color-abnormal';
    };

    // Clear all filters
    const clearFilters = () => {
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setActiveTab('all');
        fetchTreatments('', 1, true);
    };

    // View patient details modal
    const viewPatientDetails = (patient) => {
        setSelectedPatient(patient);
    };

    // Close patient details modal
    const closePatientDetails = () => {
        setSelectedPatient(null);
    };

    // Calculate fluid balance
    const calculateBalance = (volumeIn, volumeOut) => {
        const balance = volumeOut - volumeIn;
        const isPositive = balance >= 0;
        
        let formatted;
        if (isPositive) {
            formatted = `-${Math.abs(balance)}mL`;
        } else {
            formatted = `+${Math.abs(balance)}mL`;
        }
        
        return {
            value: balance,
            formatted: formatted,
            isPositive: isPositive,
            interpretation: isPositive 
                ? 'Good: Excess fluid removed' 
                : 'Warning: Fluid retention detected'
        };
    };

    // Get color for treatment status
    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'finished': return colors.success;
            case 'ongoing': return colors.warning;
            case 'scheduled': return colors.info;
            case 'cancelled': return colors.danger;
            default: return '#6c757d';
        }
    };

    // Recommend emergency hospital visit
    const recommendEmergency = async (patientId) => {
        try {
            setIsRecommending(true);
            const response = await axios.post('/doctor/recommend-emergency', {
                patient_id: patientId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                // Refresh the data to update the status
                fetchTreatments(search, 1, true);
                alert('Emergency hospital visit recommended successfully');
            } else {
                alert('Failed to recommend emergency visit: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error recommending emergency:', error);
            alert(`Error: ${error.response?.data?.message || error.message || 'Failed to recommend emergency visit'}`);
        } finally {
            setIsRecommending(false);
        }
    };

    // Recommend emergency to all critical patients
    const recommendEmergencyToAll = async () => {
        if (emergencyPatients.length === 0) {
            alert('No critical patients to recommend emergency visits for');
            return;
        }

        if (!window.confirm(`Are you sure you want to recommend emergency hospital visits to all ${emergencyPatients.length} critical patients?`)) {
            return;
        }

        try {
            setIsRecommending(true);
            const patientIds = emergencyPatients.map(patient => patient.patientID);
            
            const response = await axios.post('/doctor/recommend-emergency-to-all', {
                patient_ids: patientIds
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                // Refresh the data to update the status
                fetchTreatments(search, 1, true);
                alert(`Emergency hospital visits recommended to all ${emergencyPatients.length} critical patients`);
            } else {
                alert('Failed to recommend emergency visits: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error recommending emergency to all:', error);
            alert(`Error: ${error.response?.data?.message || error.message || 'Failed to recommend emergency visits'}`);
        } finally {
            setIsRecommending(false);
        }
    };

    // Pagination handlers
    const handleAdultPageChange = (newPage) => {
        setAdultPagination(prev => ({...prev, currentPage: newPage}));
    };

    const handlePediatricPageChange = (newPage) => {
        setPediatricPagination(prev => ({...prev, currentPage: newPage}));
    };

    // Render pagination controls
    const renderPagination = (currentPage, totalItems, itemsPerPage, onPageChange, section) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return null;

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderTop: '1px solid #eee',
                backgroundColor: colors.white
            }}>
                <div style={{ fontSize: '0.85rem', color: colors.primary }}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} patients
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '0.5rem 0.8rem',
                            backgroundColor: currentPage === 1 ? '#f1f1f1' : colors.secondary,
                            color: currentPage === 1 ? '#999' : colors.white,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.85rem'
                        }}
                    >
                        <FiChevronLeft /> Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show pages around current page
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={`${section}-page-${pageNum}`}
                                onClick={() => onPageChange(pageNum)}
                                style={{
                                    padding: '0.5rem 0.8rem',
                                    backgroundColor: pageNum === currentPage ? colors.primary : colors.white,
                                    color: pageNum === currentPage ? colors.white : colors.primary,
                                    border: `1px solid ${pageNum === currentPage ? colors.primary : '#ddd'}`,
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '0.5rem 0.8rem',
                            backgroundColor: currentPage === totalPages ? '#f1f1f1' : colors.secondary,
                            color: currentPage === totalPages ? '#999' : colors.white,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.85rem'
                        }}
                    >
                        Next <FiChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    // Sort handler
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Render a patient section (adult, pediatric)
    const renderPatientSection = (title, patientsList) => {
        if (patientsList.length === 0 && !isFetching) return null;

        // Determine which pagination to use
        let pagination, handlePageChange;
        if (title === 'Adult Patients') {
            pagination = adultPagination;
            handlePageChange = handleAdultPageChange;
        } else {
            pagination = pediatricPagination;
            handlePageChange = handlePediatricPageChange;
        }

        // Get current page items
        const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
        const currentItems = patientsList.slice(indexOfFirstItem, indexOfLastItem);

        return (
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e1e5eb',
                    margin: 0,
                    color: title === 'Adult Patients' ? colors.primary : colors.green,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                }}>
                    {title === 'Adult Patients' ? (
                        <FiUser style={{ marginRight: '0.8rem', color: colors.primary }} />
                    ) : (
                        <FiUser style={{ marginRight: '0.8rem', color: colors.green }} />
                    )}
                    {title} ({patientsList.length})
                </h3>
                
                <div style={{ overflow: 'hidden' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(300px, 2.5fr) 1fr 1fr 1fr 1fr',
                        padding: '1rem 1.5rem',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #e1e5eb',
                        fontWeight: '600',
                        color: title === 'Adult Patients' ? colors.primary : colors.green,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                            Patient <BsSortDown style={{ marginLeft: '0.3rem' }} />
                        </div>
                        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('status')}>
                            Status <BsSortDown style={{ marginLeft: '0.3rem' }} />
                        </div>
                        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('compliance')}>
                            Compliance <BsSortDown style={{ marginLeft: '0.3rem' }} />
                        </div>
                        <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => handleSort('netUF')}>
                            Net UF <BsSortDown style={{ marginLeft: '0.3rem' }} />
                        </div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                    </div>
                    
                    <div 
                        className="patient-list-container" 
                        style={{
                            minHeight: '200px',
                            overflowY: 'auto',
                            position: 'relative'
                        }}
                    >
                        {patientsList.length === 0 ? (
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#7f8c8d',
                                padding: '2rem'
                            }}>
                                No patients found in this category
                            </div>
                        ) : (
                            <div>
                                {currentItems.map((patient, index) => {
                                    const stats = calculatePatientStats(patient);
                                    const hasAlerts = stats.complianceStatus === 'danger' || stats.hasAbnormalColor || stats.fluidRetentionAlert;
                                    const formattedName = formatNameBySurname(patient.name);
                                    const statusColor = stats.severityLevel === 2 ? colors.danger : 
                                                      stats.severityLevel === 1 ? colors.warning : colors.success;
                                    
                                    return (
                                        <div 
                                            key={`${patient.patientID}-${index}`} 
                                            id={`patient-${patient.patientID}`}
                                            style={{
                                                width: '100%',
                                                borderBottom: '1px solid #eee',
                                                backgroundColor: hasAlerts ? '#fff8f8' : colors.white,
                                                transition: 'background-color 0.2s ease'
                                            }}
                                        >
                                            <div 
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'minmax(300px, 2.5fr) 1fr 1fr 1fr 1fr',
                                                    padding: '1rem 1.5rem',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    minWidth: '300px',
                                                    paddingRight: '1rem'
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        backgroundColor: title === 'Adult Patients' ? colors.primary : colors.green,
                                                        color: colors.white,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '1rem',
                                                        position: 'relative',
                                                        fontWeight: '600',
                                                        fontSize: '1.1rem'
                                                    }}>
                                                        {patient.name.charAt(0)}
                                                        {hasAlerts && <span style={{
                                                            position: 'absolute',
                                                            top: '-3px',
                                                            right: '-3px',
                                                            width: '12px',
                                                            height: '12px',
                                                            borderRadius: '50%',
                                                            backgroundColor: colors.danger,
                                                            border: '2px solid #fff'
                                                        }}></span>}
                                                    </div>
                                                    <div>
                                                        <div style={{ 
                                                            fontWeight: '500',
                                                            color: title === 'Adult Patients' ? colors.primary : colors.green,
                                                            whiteSpace: 'normal',
                                                            wordBreak: 'break-word',
                                                            cursor: 'pointer',
                                                            textDecoration: 'none'
                                                        }}
                                                            onClick={() => viewPatientDetails(patient)}
                                                        >
                                                            {formattedName}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '0.8rem',
                                                            color: '#7f8c8d',
                                                            marginTop: '0.2rem'
                                                        }}>
                                                            {stats.age}y • {patient.gender || 'N/A'} • {stats.treatmentCount} treatments
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div style={{ 
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    justifyContent: 'center'
                                                }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        backgroundColor: statusColor,
                                                        marginRight: '0.5rem'
                                                    }} />
                                                    <span style={{
                                                        color: statusColor,
                                                        fontWeight: '500',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {stats.severityLevel === 2 ? 'Critical' : 
                                                         stats.severityLevel === 1 ? 'Warning' : 'Normal'}
                                                    </span>
                                                </div>
                                                
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '0.3rem 0.8rem',
                                                        borderRadius: '20px',
                                                        backgroundColor: stats.complianceStatus === 'danger' ? '#f8d7da' : '#d4edda',
                                                        color: stats.complianceStatus === 'danger' ? '#721c24' : '#155724',
                                                        fontSize: '0.8rem',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {stats.complianceStatus === 'danger' ? (
                                                            <FiXCircle style={{ marginRight: '0.3rem' }} />
                                                        ) : (
                                                            <FiCheckCircle style={{ marginRight: '0.3rem' }} />
                                                        )}
                                                        {stats.complianceStatus === 'danger' ? 
                                                            `${stats.incompleteDays} day${stats.incompleteDays > 1 ? 's' : ''} incomplete` : 
                                                            'Compliant'}
                                                    </div>
                                                </div>
                                                
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600',
                                                        color: stats.totalNetUF >= 0 ? colors.success : colors.danger
                                                    }}>
                                                        {stats.totalNetUF >= 0 ? '-' : '+'}{Math.abs(stats.totalNetUF)}mL
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '0.7rem',
                                                        color: '#adb5bd'
                                                    }}>
                                                        {stats.avgVolumeIn}mL in / {stats.avgVolumeOut}mL out
                                                    </div>
                                                </div>
                                                
                                                <div style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <button 
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            backgroundColor: '#e9f7fe',
                                                            color: colors.primary,
                                                            border: 'none',
                                                            borderRadius: '5px',
                                                            padding: '0.4rem 0.8rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            fontSize: '0.8rem',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                        onClick={() => viewPatientDetails(patient)}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d4f0fd'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e9f7fe'}
                                                    >
                                                        <FiEye style={{ marginRight: '0.3rem' }} /> Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {patientsList.length > 0 && renderPagination(
                        pagination.currentPage,
                        patientsList.length,
                        pagination.itemsPerPage,
                        handlePageChange,
                        title.toLowerCase().replace(' ', '-')
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            backgroundColor: '#f5f7fa',
            minHeight: '100vh',
            color: '#333',
            position: 'relative',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'hidden',
            margin: 0,
            padding: 0,
            marginTop: '105px'
        }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                backgroundColor: colors.white,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                width: '100%'
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'transparent',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '0.5rem 1rem',
                            marginRight: '1.5rem',
                            cursor: 'pointer',
                            color: '#555',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <FiArrowLeft style={{ marginRight: '0.5rem' }} /> Back
                    </button>
                    <div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.8rem',
                            color: colors.primary,
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                        }}>
                           Peritoneal Dialysis Monitoring
                        </h1>
                        <p style={{
                            margin: '0.2rem 0 0',
                            fontSize: '0.9rem',
                            color: '#7f8c8d',
                            maxWidth: '600px'
                        }}>Track patient treatments, dialysis sessions, and monitor fluid intake and output to ensure proper fluid balance and detection of imbalances or complications.</p>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#7f8c8d',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap'
                }}>
                    <FaRegCalendarAlt style={{ marginRight: '0.5rem' }} /> 
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </header>
            
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                backgroundColor: colors.white,
                margin: '1rem 2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                width: 'calc(100% - 4rem)',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    position: 'relative',
                    flex: '1',
                    maxWidth: '800px'
                }}>
                    <FiSearch style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#95a5a6'
                    }} />
                    <input
                        type="text"
                        placeholder="Search patients by name, ID, or status..."
                        value={search}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 2.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '0.95rem',
                            transition: 'border 0.3s ease',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = colors.secondary}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
                    />
                    {search && (
                        <button 
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#95a5a6',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                setSearch('');
                                fetchTreatments('', 1, true);
                            }}
                        >
                            <FiX />
                        </button>
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button 
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: showFilters ? colors.primary : '#f8f9fa',
                            color: showFilters ? colors.white : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '0.6rem 1rem',
                            marginLeft: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter style={{ marginRight: '0.5rem' }} /> 
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
            </div>

            {showFilters && (
                <div style={{
                    backgroundColor: colors.white,
                    margin: '0 2rem 1rem',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    width: 'calc(100% - 4rem)',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
                        }}>
                            <div style={{ flex: '1', marginRight: '1rem', marginBottom: window.innerWidth < 768 ? '1rem' : 0 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: colors.primary
                                }}>Date Range</label>
                                <div style={{ 
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ 
                                        position: 'relative',
                                        flex: '1'
                                    }}>
                                        <FiCalendar style={{
                                            position: 'absolute',
                                            left: '0.8rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#95a5a6'
                                        }} />
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            placeholder="From"
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem 0.6rem 0.6rem 2rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '5px',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    <span style={{ 
                                        margin: '0 0.5rem',
                                        color: '#7f8c8d'
                                    }}>to</span>
                                    <div style={{ 
                                        position: 'relative',
                                        flex: '1'
                                    }}>
                                        <FiCalendar style={{
                                            position: 'absolute',
                                            left: '0.8rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#95a5a6'
                                        }} />
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            placeholder="To"
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem 0.6rem 0.6rem 2rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '5px',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: '1' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '500',
                                    color: colors.primary
                                }}>Patient Status</label>
                                <div style={{ 
                                    display: 'flex',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    overflow: 'hidden'
                                }}>
                                    <button 
                                        style={{
                                            flex: '1',
                                            padding: '0.6rem',
                                            border: 'none',
                                            backgroundColor: activeTab === 'all' ? colors.primary : '#f8f9fa',
                                            color: activeTab === 'all' ? colors.white : '#333',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.9rem'
                                        }}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        All Patients
                                    </button>
                                    <button 
                                        style={{
                                            flex: '1',
                                            padding: '0.6rem',
                                            borderLeft: '1px solid #ddd',
                                            borderRight: '1px solid ',
                                            backgroundColor: activeTab === 'non-compliant' ? colors.primary : '#f8f9fa',
                                            color: activeTab === 'non-compliant' ? colors.white : '#333',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.9rem'
                                        }}
                                        onClick={() => setActiveTab('non-compliant')}
                                    >
                                        Non-Compliant
                                    </button>
                                    <button 
                                        style={{
                                            flex: '1',
                                            padding: '0.6rem',
                                            border: 'none',
                                            backgroundColor: activeTab === 'abnormal' ? colors.primary : '#f8f9fa',
                                            color: activeTab === 'abnormal' ? colors.white : '#333',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.9rem'
                                        }}
                                        onClick={() => setActiveTab('abnormal')}
                                    >
                                        With Alerts
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <button style={{
                            padding: '0.6rem 1.2rem',
                            backgroundColor: colors.primary,
                            color: colors.white,
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginRight: '1rem',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                            onClick={() => fetchTreatments(search, 1, true)}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.secondary}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                        >
                            Apply Filters
                        </button>
                        <button style={{
                            padding: '0.6rem 1.2rem',
                            backgroundColor: '#f8f9fa',
                            color: '#333',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.9rem'
                        }}
                            onClick={clearFilters}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                display: 'flex',
                margin: '0 2rem 2rem',
                gap: '1.5rem',
                flexDirection: window.innerWidth < 1200 ? 'column' : 'row',
                width: 'calc(100% - 4rem)',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    flex: '3',
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    width: '100%'
                }}>
                    <div style={{
                        padding: '1.2rem 1.5rem',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            color: colors.primary,
                            fontSize: '1.2rem',
                            whiteSpace: 'nowrap'
                        }}>
                            <FaProcedures style={{ 
                                marginRight: '0.8rem',
                                color: colors.primary,
                                fontSize: '1.2rem'
                            }} /> 
                            Continuous Ambulatory Peritoneal Dialysis Patients
                            <span style={{
                                backgroundColor: colors.danger,
                                color: colors.white,
                                borderRadius: '50%',
                                padding: '0.2rem 0.5rem',
                                fontSize: '0.8rem',
                                marginLeft: '0.8rem'
                            }}>{totalPatients}</span>
                        </h3>
                    </div>
                    
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <div style={{ minWidth: '1200px' }}>
                            {renderPatientSection('Adult Patients', adultPatients)}
                            {renderPatientSection('Pediatric Patients', pediatricPatients)}
                        </div>
                    </div>
                </div>
                
                <div style={{
                    flex: '1.2',
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    alignSelf: 'flex-start',
                    position: window.innerWidth < 1200 ? 'static' : 'sticky',
                    top: '1rem',
                    width: '100%'
                }}>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{
                            margin: '0 0 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            color: colors.primary,
                            fontSize: '1.2rem'
                        }}>
                            <FiBarChart2 style={{ 
                                marginRight: '0.8rem',
                                color: colors.primary,
                                fontSize: '1.2rem'
                            }} /> Clinical Summary
                        </h3>
                        
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.8rem'
                            }}>
                                <div style={{ 
                                    fontWeight: '500',
                                    color: colors.primary
                                }}>Patient Compliance</div>
                                <div style={{ 
                                    fontWeight: '600',
                                    color: colors.primary
                                }}>{summary.non_compliant_patients} of {summary.total_patients}</div>
                            </div>
                            <div style={{
                                height: '8px',
                                backgroundColor: '#e9ecef',
                                borderRadius: '4px',
                                marginBottom: '0.8rem',
                                overflow: 'hidden'
                            }}>
                                <div 
                                    style={{ 
                                        height: '100%',
                                        width: `${quickStats.complianceRate}%`,
                                        backgroundColor: colors.success,
                                        transition: 'width 0.5s ease'
                                    }}
                                ></div>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.8rem'
                            }}>
                                <span style={{ color: colors.success }}>Compliant: {summary.total_patients - summary.non_compliant_patients}</span>
                                <span style={{ color: colors.danger }}>Non-Compliant: {summary.non_compliant_patients}</span>
                            </div>
                        </div>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                backgroundColor: '#e9f7fe',
                                borderRadius: '8px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: colors.primary,
                                    marginBottom: '0.5rem'
                                }}>
                                    {summary.total_treatments}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: colors.primary
                                }}>
                                    Total Treatments
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#fff3cd',
                                borderRadius: '8px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: colors.warning,
                                    marginBottom: '0.5rem'
                                }}>
                                    {summary.fluid_retention_alerts}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: colors.warning
                                }}>
                                    Fluid Retention Alerts
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#f8d7da',
                                borderRadius: '8px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: colors.danger,
                                    marginBottom: '0.5rem'
                                }}>
                                    {summary.abnormal_color_alerts}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: colors.danger
                                }}>
                                    Abnormal Color Alerts
                                </div>
                            </div>
                            
                            <div style={{
                                backgroundColor: '#d4edda',
                                borderRadius: '8px',
                                padding: '1rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: colors.success,
                                    marginBottom: '0.5rem'
                                }}>
                                    {Math.round(quickStats.avgUf)}mL
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: colors.success
                                }}>
                                    Average Net UF
                                </div>
                            </div>
                        </div>
                        
                        <EmergencyActionsPanel
                          emergencyPatients={emergencyPatients}
                          isRecommending={isRecommending}
                          recommendEmergency={recommendEmergency}
                          recommendEmergencyToAll={recommendEmergencyToAll}
                          viewPatientDetails={viewPatientDetails}
                          formatNameBySurname={formatNameBySurname}
                          calculatePatientStats={calculatePatientStats}
                        />
                        
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginTop: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.8rem'
                            }}>
                                <div style={{ 
                                    fontWeight: '500',
                                    color: colors.primary
                                }}>Recent Alerts</div>
                                <div style={{ 
                                    fontWeight: '600',
                                    color: colors.primary
                                }}>{criticalAlerts.length}</div>
                            </div>
                            <div>
                                {criticalAlerts.length === 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        backgroundColor: colors.white,
                                        borderRadius: '8px',
                                        color: colors.success,
                                        fontSize: '0.9rem'
                                    }}>
                                        <FiCheckCircle style={{ marginRight: '0.5rem' }} /> No active alerts
                                    </div>
                                ) : (
                                    criticalAlerts.slice(0, 3).map((alert, index) => (
                                        <div key={index} style={{
                                            backgroundColor: colors.white,
                                            borderRadius: '8px',
                                            padding: '0.8rem',
                                            marginBottom: '0.8rem',
                                            borderLeft: `4px solid ${
                                                alert.severity === 'critical' ? colors.danger : 
                                                alert.severity === 'high' ? colors.warning : colors.info
                                            }`
                                        }}>
                                            <div style={{ 
                                                fontWeight: '500',
                                                marginBottom: '0.3rem',
                                                color: colors.primary
                                            }}>{alert.patientName}</div>
                                            <div style={{ 
                                                fontSize: '0.8rem',
                                                color: '#6c757d'
                                            }}>{alert.message}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                    </div>
                </div>
                
            </div>

            {selectedPatient && (
                <PatientDetailModal 
                    patient={selectedPatient} 
                    onClose={closePatientDetails} 
                />
            )}
        </div>
    );
};

export default TrackPatientRecords;