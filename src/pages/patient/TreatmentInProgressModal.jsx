import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiAlertCircle, FiCheck, FiX, FiDroplet, FiBell } from 'react-icons/fi';
import '../../css/TreatmentInProgressModal.css';

const TreatmentInProgressModal = ({ 
    onRequestStop, 
    currentWeight, 
    deviceConnected,
    targetDrainage,
    onWeightZero 
}) => {
    // Audio context and nodes
    const audioContextRef = useRef(null);
    const gainNodeRef = useRef(null);
    const oscillatorRef = useRef(null);

    // Constants for weight monitoring
    const STABLE_THRESHOLD = 0.05;
    const HISTORY_SIZE = 5;
    const ZERO_THRESHOLD = 0.01;
    const REMINDER_THRESHOLD = 1.0;
    const COMPLETION_THRESHOLD = 1.5;

    // State management
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [showConfirmStop, setShowConfirmStop] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Waiting for treatment to begin');
    const [drainedVolume, setDrainedVolume] = useState(0);
    const [reminderShown, setReminderShown] = useState(false);
    const [initialWeight, setInitialWeight] = useState(0);
    const [showReminderAlert, setShowReminderAlert] = useState(false);
    
    // Refs for tracking weight history
    const weightHistory = useRef([]);
    const lastSignificantWeight = useRef(0);
    const reminderTimeoutRef = useRef(null);

    // Initialize audio context
    useEffect(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.gain.value = 0.3;
            gainNodeRef.current.connect(audioContextRef.current.destination);
            
            const handleFirstInteraction = () => {
                if (audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume();
                }
                document.removeEventListener('click', handleFirstInteraction);
            };
            document.addEventListener('click', handleFirstInteraction);
        } catch (e) {
            console.error("Audio initialization failed:", e);
        }

        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (reminderTimeoutRef.current) {
                clearTimeout(reminderTimeoutRef.current);
            }
        };
    }, []);

    const playTone = (frequency, duration, type = 'sine', rampTime = 0.02) => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;

        try {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
            }

            oscillatorRef.current = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            
            oscillatorRef.current.type = type;
            oscillatorRef.current.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + rampTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration/1000 - rampTime);
            
            oscillatorRef.current.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            
            oscillatorRef.current.start();
            oscillatorRef.current.stop(audioContextRef.current.currentTime + duration/1000);
        } catch (e) {
            console.error("Error playing tone:", e);
        }
    };

    const playCompletionSound = () => {
        playTone(784, 200);
        setTimeout(() => playTone(1046, 200), 300);
        setTimeout(() => playTone(1318, 300), 600);
    };

    const playWarningSound = () => {
        playTone(392, 800, 'square');
    };

    const playReminderSound = () => {
        // More urgent reminder sound pattern
        playTone(659, 200);
        setTimeout(() => playTone(523, 200), 300);
        setTimeout(() => playTone(659, 200), 600);
        setTimeout(() => playTone(523, 200), 900);
    };

    // Effect for showing/hiding reminder alert
    useEffect(() => {
        if (showReminderAlert) {
            reminderTimeoutRef.current = setTimeout(() => {
                setShowReminderAlert(false);
            }, 10000); // Hide after 10 seconds
        }
        return () => {
            if (reminderTimeoutRef.current) {
                clearTimeout(reminderTimeoutRef.current);
            }
        };
    }, [showReminderAlert]);

    // Main effect for weight monitoring and timer control
    useEffect(() => {
        if (currentWeight >= 0) {
            weightHistory.current.push(currentWeight);
            if (weightHistory.current.length > HISTORY_SIZE) {
                weightHistory.current.shift();
            }
        }

        if (initialWeight > 0) {
            const drained = (initialWeight - currentWeight) * 1000;
            setDrainedVolume(drained);
        }

        if (currentWeight > 0 && initialWeight === 0) {
            setInitialWeight(currentWeight);
            lastSignificantWeight.current = currentWeight;
            setStatusMessage(`Initial weight recorded: ${currentWeight.toFixed(3)}kg`);
            return;
        }

        if (initialWeight > 0 && 
            currentWeight < (lastSignificantWeight.current - STABLE_THRESHOLD) && 
            !isRunning) {
            setIsRunning(true);
            setStatusMessage(`Drainage detected (${currentWeight.toFixed(3)}kg) - timer started`);
            lastSignificantWeight.current = currentWeight;
        }

        if (currentWeight > lastSignificantWeight.current) {
            lastSignificantWeight.current = currentWeight;
        }

        // Enhanced reminder logic with visual alert
        if (initialWeight > 0 && 
            (initialWeight - currentWeight) >= REMINDER_THRESHOLD && 
            !reminderShown) {
            setReminderShown(true);
            setShowReminderAlert(true);
            playReminderSound();
            setStatusMessage(`Approaching completion (${drainedVolume.toFixed(0)}g drained) - prepare to clamp catheter`);
        }

        if (initialWeight > 0 && 
            (initialWeight - currentWeight) >= COMPLETION_THRESHOLD && 
            isRunning) {
            setIsRunning(false);
            playCompletionSound();
            setStatusMessage(`Treatment completed! ${drainedVolume.toFixed(0)}g drained - clamp catheter now`);
            setTimeout(() => onWeightZero(elapsedTime), 2000);
        }

        if (currentWeight <= ZERO_THRESHOLD && initialWeight > 0 && isRunning) {
            setIsRunning(false);
            playCompletionSound();
            setStatusMessage('Treatment completed - weight returned to zero');
            setTimeout(() => onWeightZero(elapsedTime), 2000);
        }

        if (weightHistory.current.length >= HISTORY_SIZE) {
            const avgWeight = weightHistory.current.reduce((a, b) => a + b, 0) / weightHistory.current.length;
            
            if (isRunning && avgWeight < initialWeight - STABLE_THRESHOLD) {
                const weightChanges = [];
                for (let i = 1; i < weightHistory.current.length; i++) {
                    weightChanges.push(Math.abs(weightHistory.current[i] - weightHistory.current[i-1]));
                }
                const isStable = weightChanges.every(change => change < STABLE_THRESHOLD);

                if (isStable) {
                    setStatusMessage(`Weight stable at ${avgWeight.toFixed(3)}kg - treatment in progress`);
                }
            }
        }
    }, [currentWeight, initialWeight, isRunning, elapsedTime, onWeightZero]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

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

    const handleStopClick = () => {
        setShowConfirmStop(true);
        setIsRunning(false);
    };

    const confirmStop = () => {
        onRequestStop(elapsedTime);
    };

    const cancelStop = () => {
        setShowConfirmStop(false);
        if (initialWeight > 0 && currentWeight < initialWeight - STABLE_THRESHOLD) {
            setIsRunning(true);
        }
    };

    const dismissReminder = () => {
        setShowReminderAlert(false);
    };

    return (
        <div className="modal-overlay">
            {/* Reminder Alert Modal */}
            {showReminderAlert && (
                <div className="reminder-alert">
                    <div className="reminder-alert-content">
                        <FiBell className="reminder-bell-icon" />
                        <h3>Catheter Clamp Reminder</h3>
                        <p>Drainage is approaching completion. Please prepare to clamp the catheter when drainage finishes.</p>
                        <button onClick={dismissReminder} className="acknowledge-button">
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}

            <div className="in-progress-modal">
                <div className="modal-header">
                    <h2>PD Solution is now infusing</h2>
                    <div className="timer-display">
                        <FiClock className="timer-icon" />
                        <span>{formatTime(elapsedTime)}</span>
                    </div>
                </div>

                <div className="modal-content">
                    <div className="weight-display">
                        <div className="weight-value">
                            Current Weight: {currentWeight > 0 ? currentWeight.toFixed(3) + 'kg' : '0kg (complete)'}
                        </div>
                        {initialWeight > 0 && (
                            <div className="weight-details">
                                <div className="initial-weight">
                                    Initial Weight: {initialWeight.toFixed(3)}kg
                                </div>
                                <div className="drained-volume">
                                    Solution weight: {drainedVolume.toFixed(0)}g / {targetDrainage}g
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="status-message">
                        <FiAlertCircle className="alert-icon" />
                        <span>{statusMessage}</span>
                    </div>

                    <div className="progress-notes">
                        {initialWeight === 0 ? (
                            <p>Place the bag on the scale to begin monitoring</p>
                        ) : !isRunning ? (
                            currentWeight <= ZERO_THRESHOLD ? (
                                <p>Treatment complete! Returning to dashboard...</p>
                            ) : (
                                <p>Waiting for weight to decrease to start timer</p>
                            )
                        ) : (
                            <>
                                <p>Treatment in progress - timer will stop when target is reached</p>
                                {drainedVolume >= (targetDrainage * 0.8) && (
                                    <div className="reminder-note">
                                        <FiDroplet className="pulse-icon" /> 
                                        <span>Reminder: Prepare catheter clamp for when drainage completes</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    {showConfirmStop ? (
                        <div className="confirmation-buttons">
                            <p>Are you sure you want to stop the treatment?</p>
                            <div className="button-group">
                                <button 
                                    onClick={confirmStop} 
                                    className="confirm-button"
                                >
                                    <FiCheck /> Yes, Stop Treatment
                                </button>
                                <button 
                                    onClick={cancelStop} 
                                    className="cancel-button"
                                >
                                    <FiX /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleStopClick} 
                            className="stop-button"
                            disabled={elapsedTime === 0}
                        >
                            Stop Treatment Manually
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreatmentInProgressModal;