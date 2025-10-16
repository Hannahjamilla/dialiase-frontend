import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUpload, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo, FiDroplet, FiActivity } from 'react-icons/fi';
import NotificationModal from './NotificationModal';
import PDGuideModal from './PDGuideModal';
import TreatmentInProgressModal from './TreatmentInProgressModal';
import '../../css/TreatmentStart.css';

// Audio files for alerts (you'll need to add these files to your project)
const completionSound = new Audio('/sounds/completion.mp3');
const warningSound = new Audio('/sounds/warning.mp3');
const reminderSound = new Audio('/sounds/reminder.mp3');

const TreatmentStart = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        volume: '',
        startTime: '',
        finishedTime: '',
        dwellTime: '',
        dialysate: '',
        bagSerialNumber: '',
        patientNotes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [startClicked, setStartClicked] = useState(false);
    const [stopClicked, setStopClicked] = useState(false);
    const [requiredFieldsFilled, setRequiredFieldsFilled] = useState(false);
    const [hasOngoingTreatment, setHasOngoingTreatment] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ type: '', message: '' });
    const [treatmentStage, setTreatmentStage] = useState('preparation');
    const [showGuideModal, setShowGuideModal] = useState(true);
    const [showInProgressModal, setShowInProgressModal] = useState(false);
    const [autoCompleted, setAutoCompleted] = useState(false);
    const navigate = useNavigate();
    
    const [currentWeight, setCurrentWeight] = useState(0);
    const [previousWeight, setPreviousWeight] = useState(0);
    const [isDraining, setIsDraining] = useState(false);
    const [drainStartTime, setDrainStartTime] = useState(null);
    const [drainDuration, setDrainDuration] = useState(0);
    const [treatmentActive, setTreatmentActive] = useState(false);
    const [deviceConnected, setDeviceConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [weightError, setWeightError] = useState(null);
    const [initialWeight, setInitialWeight] = useState(0);
    const [hasWeightData, setHasWeightData] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [manualVolume, setManualVolume] = useState('');
    const [isManualVolumeSet, setIsManualVolumeSet] = useState(false);
    const [weightUnit, setWeightUnit] = useState('kg'); // Default to kg
    const [targetDrainage, setTargetDrainage] = useState(1500); // 1500g target
    const [reminderShown, setReminderShown] = useState(false);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    };

    const playSound = (sound) => {
        try {
            sound.currentTime = 0; // Reset sound to start
            sound.play().catch(e => console.error('Audio play failed:', e));
        } catch (e) {
            console.error('Sound error:', e);
        }
    };

    const handleSetVolume = () => {
        if (currentWeight > 0) {
            const volumeInMl = Math.round(currentWeight * 1000);
            setManualVolume(volumeInMl.toString());
            setIsManualVolumeSet(true);
            setInitialWeight(currentWeight);
            showNotificationModal('success', `Volume set to ${volumeInMl}ml`);
        } else {
            showNotificationModal('warning', 'No valid weight reading available');
        }
    };

    useEffect(() => {
        const checkAuthAndTreatment = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found");
                }

                const response = await axios.get('/patient/treatments/ongoing', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.has_ongoing) {
                    setHasOngoingTreatment(true);
                    showNotificationModal('info', 'You have an ongoing treatment. Please complete it before starting a new one.');
                    navigate('/patient/PatientDashboard');
                }
            } catch (error) {
                console.error('Error:', error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                toast.error(error.response?.data?.message || "Session expired. Please login again.");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndTreatment();
    }, [navigate]);

    useEffect(() => {
        const checkDeviceConnection = async () => {
            try {
                const response = await axios.get('/iot/device-status');
                if (response.data.connected) {
                    setDeviceConnected(true);
                    setConnectionError(null);
                    if (!treatmentActive) {
                        fetchWeightData();
                    }
                } else {
                    setDeviceConnected(false);
                    setConnectionError('IoT scale not connected. Please check: ' + 
                        (response.data.last_seen ? 
                         `Last seen ${new Date(response.data.last_seen).toLocaleTimeString()}` : 
                         'Device never connected'));
                }
            } catch (error) {
                console.error('Error checking device connection:', error);
                setDeviceConnected(false);
                setConnectionError('Failed to check device status. Please refresh the page.');
            }
        };

        checkDeviceConnection();
        const connectionInterval = setInterval(checkDeviceConnection, 5000);

        return () => clearInterval(connectionInterval);
    }, [treatmentActive]);

    useEffect(() => {
        if (!deviceConnected) return;

        const weightInterval = setInterval(() => {
            fetchWeightData();
        }, 2000);

        return () => clearInterval(weightInterval);
    }, [deviceConnected]);

    useEffect(() => {
        if (isDraining && drainStartTime) {
            const interval = setInterval(() => {
                const currentDuration = (new Date() - drainStartTime) / 1000;
                setDrainDuration(currentDuration);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isDraining, drainStartTime]);

    useEffect(() => {
        const fieldsFilled = formData.bagSerialNumber.trim() !== ''
            && formData.dialysate !== '';

        setRequiredFieldsFilled(fieldsFilled);
    }, [formData]);

    useEffect(() => {
        if (autoCompleted) {
            const now = new Date();
            const timezoneOffset = now.getTimezoneOffset() * 60000;
            const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
            
            setFormData(prev => ({
                ...prev,
                finishedTime: localISOTime
            }));
            setStopClicked(true);
            setTreatmentStage('completed');
            setAutoCompleted(false);
        }
    }, [autoCompleted]);

    const fetchWeightData = async () => {
        try {
            const response = await axios.get('/iot/weight');
            if (!response.data || typeof response.data.weight === 'undefined') {
                throw new Error('Invalid response from server');
            }
            
            const weight = parseFloat(response.data.weight);
            if (isNaN(weight)) {
                throw new Error('Invalid weight value received');
            }

            // Check for significant weight decrease (1500g threshold)
            if (initialWeight > 0 && (initialWeight - weight) >= 1.5 && !isDraining) {
                setIsDraining(true);
                setDrainStartTime(new Date());
                playSound(completionSound);
                showNotificationModal('success', 
                    'Drainage of 1500g detected!\n' +
                    'Treatment completed automatically.\n' +
                    'Please clamp your catheter now.');
                setAutoCompleted(true);
            }
            
            // Check for approaching threshold (1000g) for reminder
            if (initialWeight > 0 && (initialWeight - weight) >= 1.0 && !reminderShown) {
                setReminderShown(true);
                playSound(reminderSound);
                showNotificationModal('info', 
                    'Approaching drainage threshold (1000g)\n' +
                    'Please prepare to clamp your catheter soon.');
            }

            // Check if weight has increased again (reset reminder)
            if (weight >= previousWeight) {
                setReminderShown(false);
            }

            setPreviousWeight(weight);
            setCurrentWeight(weight);
            setWeightError(null);
            setHasWeightData(true);
            
            if (startClicked && !stopClicked && initialWeight === 0 && weight > 0) {
                setInitialWeight(weight);
            }
        } catch (error) {
            console.error('Error fetching weight:', error);
            setWeightError('Failed to get weight reading. Please check: ' + 
                (error.response ? 'Server error' : 'Device connection'));
            setHasWeightData(false);
        }
    };

    const attemptReconnect = async () => {
        try {
            setIsLoading(true);
            setConnectionError('Attempting to connect to scale...');
            
            const statusResponse = await axios.get('/iot/device-status');
            if (statusResponse.data.connected) {
                setDeviceConnected(true);
                setConnectionError(null);
                return;
            }

            const response = await axios.post('/iot/connect', {
                force: true
            });

            if (response.data.success) {
                setDeviceConnected(true);
                setConnectionError(null);
                toast.success('IoT scale connected successfully');
                fetchWeightData();
            } else {
                throw new Error(response.data.message || 'Connection failed');
            }
        } catch (error) {
            console.error('Connection attempt failed:', error);
            setConnectionError(`Failed to connect: ${error.message || 'Unknown error'}`);
            setDeviceConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const startTreatmentMonitoring = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (!formData.bagSerialNumber || !formData.dialysate) {
                throw new Error('Missing required treatment data');
            }

            const response = await axios.post('/iot/status', 
                { 
                    action: 'start',
                    status: 'active',
                    device_id: 'pd_scale_01',
                    timestamp: new Date().toISOString(),
                    initial_weight: deviceConnected ? currentWeight : null,
                    bag_serial: formData.bagSerialNumber,
                    dialysate: formData.dialysate,
                    target_drainage: targetDrainage
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to start monitoring');
            }
            
            setTreatmentActive(true);
            return true;
        } catch (error) {
            console.error('Error starting treatment monitoring:', error);
            let errorDetails = error.response?.data?.message || error.message;
            
            if (error.response?.data?.errors) {
                errorDetails += '\n' + Object.entries(error.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
            }
            
            showNotificationModal('error', 
                `Failed to start IoT monitoring: ${errorDetails}\n\n` +
                'Common fixes:\n' +
                '1. Verify all required fields are filled\n' +
                '2. Check the IoT device connection\n' +
                '3. Ensure valid weight reading is available');
            return false;
        }
    };

    const stopTreatmentMonitoring = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (!formData.startTime) {
                throw new Error('Missing required treatment data');
            }

            const endTime = new Date();
            const startTime = new Date(formData.startTime);
            const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

            const response = await axios.post('/iot/status', 
                { 
                    action: 'stop',
                    status: 'inactive',
                    device_id: 'pd_scale_01',
                    timestamp: endTime.toISOString(),
                    final_weight: deviceConnected ? currentWeight : null,
                    duration: durationMinutes,
                    treatment_id: generateUniqueId(),
                    drain_duration: isDraining ? drainDuration : 0,
                    drained_volume: initialWeight > 0 ? (initialWeight - currentWeight) * 1000 : 0
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => {
                        return status >= 200 && status < 300 || status === 422;
                    }
                }
            );

            if (response.status === 422) {
                const errorDetails = response.data.errors 
                    ? Object.entries(response.data.errors).map(([field, messages]) => 
                        `${field}: ${messages.join(', ')}`).join('\n')
                    : response.data.message || 'Validation failed';
                
                throw new Error(`Validation error: ${errorDetails}`);
            }

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to stop monitoring');
            }
            
            setTreatmentActive(false);
            return true;
        } catch (error) {
            console.error('Error stopping treatment monitoring:', error);
            
            let errorMessage = 'Failed to properly stop IoT monitoring.\n';
            
            if (error.response?.data?.errors) {
                errorMessage += 'Validation errors:\n' + 
                    Object.entries(error.response.data.errors)
                        .map(([field, messages]) => `- ${field}: ${messages.join(', ')}`)
                        .join('\n');
            } else {
                errorMessage += `Error Details: ${error.message || 'Unknown error'}\n`;
            }
            
            errorMessage += '\nThe treatment was recorded but device may still be active.';
            
            showNotificationModal('warning', errorMessage);
            return false;
        }
    };

    const generateUniqueId = () => {
        return 'treat-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    };

    const showNotificationModal = (type, message) => {
        setModalContent({ type, message });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetFinishedTime = () => {
        setFormData(prev => ({ ...prev, finishedTime: '' }));
        setStopClicked(false);
        setTreatmentStage('in-progress');
        setInitialWeight(0);
        setElapsedTime(0);
        setReminderShown(false);
    };

    const setCurrentTime = async (field) => {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);

        setFormData((prev) => ({ ...prev, [field]: localISOTime }));

        if (field === 'startTime') {
            const monitoringStarted = await startTreatmentMonitoring();
            if (!monitoringStarted) return;

            setStartClicked(true);
            setTreatmentStage('in-progress');
            setShowInProgressModal(true);
            
            let notificationMessage = `Treatment started at ${now.toLocaleTimeString()}\n\n`;
            
            if (deviceConnected && currentWeight > 0) {
                notificationMessage += `Initial Weight: ${currentWeight.toFixed(3)}kg (${Math.round(currentWeight * 1000)}ml)\n`;
            } else if (!deviceConnected) {
                notificationMessage += `Initial Weight: Not monitored (IoT device not connected)\n`;
            } else {
                notificationMessage += `Initial Weight: Not recorded\n`;
            }
            
            notificationMessage += `Important Reminders:\n` +
                `- Monitor for any discomfort during infusion\n` +
                `- Keep the catheter site clean and dry\n` +
                `- System will alert you when drainage is complete`;
            
            if (!deviceConnected) {
                showNotificationModal('info', 
                    `${notificationMessage}\n\n` +
                    `NOTE: IoT device not connected. Treatment will continue without weight monitoring.`);
            } else if (!hasWeightData) {
                showNotificationModal('warning', 
                    `${notificationMessage}\n\n` +
                    `NOTE: No initial weight reading was recorded. Please verify manually.`);
            } else {
                showNotificationModal('success', notificationMessage);
            }
        } else {
            const monitoringStopped = await stopTreatmentMonitoring();
            if (!monitoringStopped) return;

            setStopClicked(true);
            setTreatmentStage('completed');
            
            const notificationMessage = `Solution in finished at ${now.toLocaleTimeString()}\n\n` +
                `Final Weight: ${deviceConnected && currentWeight > 0 ? 
                    currentWeight.toFixed(3) + 'kg (' + Math.round(currentWeight * 1000) + 'ml)' : 
                    'Not monitored'}\n` +
                `Drain Duration: ${isDraining ? drainDuration.toFixed(0) + 's' : 'N/A'}\n` +
                `Drained Volume: ${initialWeight > 0 ? Math.round((initialWeight - currentWeight) * 1000) + 'ml' : 'N/A'}\n` +
                `Next Steps:\n` +
                `- Record the dwell time accurately\n` +
                `- Monitor drainage volume when complete\n` +
                `- Clamp catheter if not already done`;
            
            showNotificationModal('info', notificationMessage);
        }
    };

    const handleStopFromModal = (elapsedSeconds) => {
        setElapsedTime(elapsedSeconds);
        setShowInProgressModal(false);
        setCurrentTime('finishedTime');
    };

    const validateForm = () => {
        if (!formData.bagSerialNumber) {
            showNotificationModal('warning', 'Please enter bag serial number');
            return false;
        }
        
        if (!formData.dialysate) {
            showNotificationModal('warning', 'Please select dialysate concentration');
            return false;
        }

        if (deviceConnected && !isManualVolumeSet && currentWeight <= 0) {
            showNotificationModal('warning', 'No valid weight reading available. Please set volume manually.');
            return false;
        }

        if (!deviceConnected && !formData.volume) {
            showNotificationModal('warning', 'Please enter volume when IoT device is not connected');
            return false;
        }

        if (!formData.startTime) {
            showNotificationModal('warning', 'Please set start time');
            return false;
        }

        if (!formData.finishedTime) {
            showNotificationModal('warning', 'Please set finish time');
            return false;
        }
        
        if (new Date(formData.finishedTime) <= new Date(formData.startTime)) {
            showNotificationModal('warning', 'Finish time must be after start time');
            resetFinishedTime();
            return false;
        }
        
        const durationMinutes = (new Date(formData.finishedTime) - new Date(formData.startTime)) / (1000 * 60);
        if (durationMinutes < 1) {
            showNotificationModal('warning', 'Treatment duration seems too short. Please verify times.');
            resetFinishedTime();
            return false;
        }

        if (durationMinutes > 120) {
            showNotificationModal('warning', 'Treatment duration seems unusually long. Please verify times.');
            resetFinishedTime();
            return false;
        }

        if (!formData.dwellTime) {
            showNotificationModal('warning', 'Please select dwell time');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        if (hasOngoingTreatment) {
            showNotificationModal('warning', 'You already have an ongoing treatment. Please complete it before starting a new one.');
            return;
        }

        setIsLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Calculate volume in ml and kl
            let volumeInMl;
            if (deviceConnected) {
                volumeInMl = isManualVolumeSet ? parseInt(manualVolume) : Math.round(currentWeight * 1000);
            } else {
                volumeInMl = parseInt(formData.volume);
            }

            if (isNaN(volumeInMl)) {
                throw new Error('Volume must be a valid number');
            }

            const volumeInKl = volumeInMl / 1000000; // Convert to kiloliters

            const treatmentData = {
                volume: volumeInMl,
                volume_kl: volumeInKl,
                startTime: formData.startTime,
                finishedTime: formData.finishedTime,
                dwellTime: formData.dwellTime,
                dialysate: formData.dialysate,
                bagSerialNumber: formData.bagSerialNumber.trim(),
                dry_night: formData.dwellTime === '6' ? 'yes' : 'no',
                device_connected: deviceConnected,
                initial_weight: initialWeight,
                final_weight: deviceConnected ? currentWeight : null,
                drained_volume: initialWeight > 0 ? Math.round((initialWeight - currentWeight) * 1000) : null,
                patient_notes: formData.patientNotes,
                duration_minutes: Math.round(elapsedTime / 60),
                drain_duration: isDraining ? drainDuration : 0,
                status: 'in-progress'
            };

            const response = await axios.post('/patient/treatments', treatmentData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                timeout: 10000
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Treatment submission failed');
            }

            // Store the dwell time and start time in localStorage
            localStorage.setItem('currentDwellTime', formData.dwellTime);
            localStorage.setItem('treatmentStartTime', new Date().toISOString());

            const successMessage = `Treatment recorded successfully!\n` +
                `Total Volume: ${volumeInMl}ml\n` +
                `Drained Volume: ${initialWeight > 0 ? Math.round((initialWeight - currentWeight) * 1000) : 'N/A'}ml`;
            
            showNotificationModal('success', successMessage);

            // Redirect to dashboard after a delay
            setTimeout(() => {
                navigate('/patient/PatientDashboard');
            }, 3000);

        } catch (error) {
            console.error('Treatment submission error:', error);
            showNotificationModal('error', error.response?.data?.message || 'Failed to submit treatment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (startClicked && !stopClicked) {
            showNotificationModal('warning', 
                'You have started a treatment but not finished it.\n' +
                'Are you sure you want to cancel this treatment?');
            return;
        }
        navigate('/patient/PatientDashboard');
    };

    if (loading) {
        return <div className="treatment-fullscreen loading-screen">
            <div className="loading-spinner"></div>
            <p>Loading your treatment information...</p>
        </div>;
    }

    if (hasOngoingTreatment) {
        return (
            <div className="treatment-fullscreen">
                <div className="ongoing-treatment-message">
                    <div className="ongoing-icon">
                        <FiAlertTriangle size={48} />
                    </div>
                    <h2>The solution is currently being implemented.</h2>
                    <p>You currently have an ongoing dialysis treatment session.</p>
                    <p>Please complete your current treatment before starting a new one.</p>
                    <button onClick={handleBack} className="back-button">Return to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="treatment-fullscreen">
            {showGuideModal && (
                <PDGuideModal onClose={() => setShowGuideModal(false)} />
            )}

            {showModal && (
                <NotificationModal
                    type={modalContent.type}
                    message={modalContent.message}
                    onClose={closeModal}
                />
            )}

            {showInProgressModal && (
                <TreatmentInProgressModal 
                    onRequestStop={handleStopFromModal}
                    currentWeight={currentWeight}
                    deviceConnected={deviceConnected}
                    initialWeight={initialWeight}
                    targetDrainage={targetDrainage}
                    onWeightZero={(duration) => {
                        setElapsedTime(duration);
                        setShowInProgressModal(false);
                        setAutoCompleted(true);
                        showNotificationModal('success', 
                            'Treatment completed automatically as weight returned to zero.\n' +
                            `Total duration: ${formatTime(duration)}\n` +
                            'Please review and submit your treatment details.');
                    }}
                />
            )}

            {isDraining && (
                <div className="drain-timer">
                    <FiDroplet className="drain-icon" />
                    <span>Draining: {drainDuration.toFixed(0)}s | Volume: {Math.round((initialWeight - currentWeight) * 1000)}ml</span>
                </div>
            )}

            <div className="treatment-header">
                <div className="treatment-title-container">
                    <h1>Peritoneal Dialysis Treatment</h1>
                    {user && (
                        <div className="patient-name-display">
                            <span>Patient: </span>
                            <strong>{user.first_name} {user.last_name}</strong>
                        </div>
                    )}
                    <div className="treatment-reminder">
                        <em>Please complete all fields carefully before starting your treatment</em>
                    </div>
                    <div className="connection-status">
                        {deviceConnected ? (
                            <div className="connection-badge connected">
                                <FiCheckCircle /> Weighing Scale is Connected
                            </div>
                        ) : (
                            <div className="connection-badge disconnected">
                                <FiAlertTriangle /> IoT Scale Disconnected
                                <button 
                                    onClick={attemptReconnect} 
                                    className="connect-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Connecting...' : 'Connect Scale'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <button 
                    onClick={() => setShowGuideModal(true)} 
                    className="guide-button"
                >
                    <FiInfo /> View Treatment Guide
                </button>
            </div>

            <div className="treatment-container">
                <div className="treatment-content-wrapper">
                    <form onSubmit={handleSubmit} className="treatment-form">
                        <div className="form-section">
                            <h3 className="section-title">Treatment Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="bagSerialNumber">Bag Serial Number: *</label>
                                    <input
                                        type="text"
                                        id="bagSerialNumber"
                                        name="bagSerialNumber"
                                        value={formData.bagSerialNumber}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Enter bag serial number"
                                        required
                                        disabled={startClicked || isLoading}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="volume">Volume In (ml): *</label>
                                    {deviceConnected ? (
                                        <>
                                            <div className="weight-display">
                                                <span className="weight-value">
                                                    {isManualVolumeSet ? 
                                                        `${manualVolume}ml (set)` : 
                                                        (currentWeight > 0 ? 
                                                            `${currentWeight.toFixed(3)}g (${Math.round(currentWeight * 1000)}ml)` : 
                                                            '--')
                                                    }
                                                </span>
                                                {!isManualVolumeSet && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSetVolume}
                                                        className="set-volume-button"
                                                        disabled={currentWeight <= 0 || isLoading}
                                                    >
                                                        Set
                                                    </button>
                                                )}
                                            </div>
                                            {weightError && (
                                                <div className="field-error">
                                                    <FiAlertTriangle size={14} /> {weightError}
                                                </div>
                                            )}
                                            <input
                                                type="hidden"
                                                id="volume"
                                                name="volume"
                                                value={isManualVolumeSet ? manualVolume : (currentWeight > 0 ? Math.round(currentWeight * 1000) : '')}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                type="number"
                                                id="volume"
                                                name="volume"
                                                value={formData.volume}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter volume in ml"
                                                disabled={startClicked || isLoading}
                                                required
                                            />
                                            <div className="input-hint">
                                                Enter the volume in milliliters (ml)
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dialysate">PD-Solution: *</label>
                                    <select
                                        id="dialysate"
                                        name="dialysate"
                                        value={formData.dialysate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        disabled={startClicked || isLoading}
                                    >
                                        <option value="">Select PD-Solution</option>
                                        <option value="1.5">1.5% (Yellow)</option>
                                        <option value="2.5">2.5% (Green)</option>
                                        <option value="4.25">4.25% (Red)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Treatment Timing</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time of Input of Solution: *</label>
                                    <div className="time-input-group">
                                        <input
                                            type="datetime-local"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            readOnly
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setCurrentTime('startTime')}
                                            className={`time-button start ${startClicked ? 'active' : ''}`}
                                            disabled={startClicked || isLoading || !requiredFieldsFilled || (deviceConnected && !hasWeightData && !isManualVolumeSet)}
                                            title={startClicked ? "Treatment already started" : ""}
                                        >
                                            <FiClock className="button-icon" />
                                            {startClicked ? 'Started' : 'Start'}
                                        </button>
                                    </div>
                                    {startClicked && (
                                        <p className="time-status-message">
                                            Treatment started at {new Date(formData.startTime).toLocaleTimeString()}
                                        </p>
                                    )}
                                    {!deviceConnected && (
                                        <p className="device-warning">
                                            <FiInfo /> Treatment will proceed without weight monitoring
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Finished Time of Input of Solution: *</label>
                                    <div className="time-input-group">
                                        <input
                                            type="datetime-local"
                                            name="finishedTime"
                                            value={formData.finishedTime}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            readOnly
                                            required
                                        />
                                        {!stopClicked ? (
                                            <button
                                                type="button"
                                                onClick={() => setCurrentTime('finishedTime')}
                                                className={`time-button stop ${stopClicked ? 'active' : ''}`}
                                                disabled={!startClicked || isLoading}
                                            >
                                                <FiClock className="button-icon" />
                                                {stopClicked ? 'Stopped' : 'Stop'}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={resetFinishedTime}
                                                className="time-button reset"
                                                disabled={isLoading}
                                            >
                                                <FiClock className="button-icon" />
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                    {stopClicked && (
                                        <p className="time-status-message">
                                            Solution in finished at {new Date(formData.finishedTime).toLocaleTimeString()}
                                            <button 
                                                type="button" 
                                                onClick={resetFinishedTime}
                                                className="small-reset-button"
                                            >
                                                (Change)
                                            </button>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="dwellTime">Dwell Time (hours): *</label>
                                    <select
                                        id="dwellTime"
                                        name="dwellTime"
                                        value={formData.dwellTime}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        disabled={!stopClicked || isLoading}
                                    >
                                        <option value="">Select dwell time</option>
                                        <option value="4">4 hours</option>
                                        <option value="6">6 hours</option>
                                        <option value="8">8 hours</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-row button-row">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="secondary-button"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`submit-button ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading || !stopClicked || hasOngoingTreatment}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle className="button-icon" />
                                        Submit Treatment
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TreatmentStart;