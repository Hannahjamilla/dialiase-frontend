import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiMinimize2, FiMaximize2, FiX, FiDroplet, FiAlertTriangle } from 'react-icons/fi';
import alarmSound from '../../assets/sounds/alarm.mp3';
import notificationSound from '../../assets/sounds/notification.mp3';

const DwellTimerModal = ({ 
  dwellTime, 
  onClose, 
  onEndTreatment,
  colors,
  isMinimized,
  onToggleMinimize
}) => {
  // Calculate total seconds (dwellTime is in hours)
  const totalSeconds = dwellTime * 3600;
  
  // Load remaining time from localStorage or initialize with totalSeconds
  const [remainingTime, setRemainingTime] = useState(() => {
    const savedTime = localStorage.getItem('dwellTimerRemainingTime');
    return savedTime ? parseInt(savedTime) : totalSeconds;
  });
  
  const [lastPlayedSound, setLastPlayedSound] = useState(null);
  const [showFinal30SecWarning, setShowFinal30SecWarning] = useState(false);
  const [show30SecWarning, setShow30SecWarning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);
  const alarmRef = useRef(null);
  const notificationRef = useRef(null);
  const alertIntervalRef = useRef(null);
  
  useEffect(() => {
    // Save remaining time to localStorage whenever it changes
    localStorage.setItem('dwellTimerRemainingTime', remainingTime.toString());
  }, [remainingTime]);

  useEffect(() => {
    // Initialize audio with higher volume
    alarmRef.current = new Audio(alarmSound);
    alarmRef.current.volume = 1.0;
    notificationRef.current = new Audio(notificationSound);
    notificationRef.current.volume = 1.0;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set initial position to center
    if (modalRef.current && !isMinimized) {
      const { width, height } = modalRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth / 2 - width / 2,
        y: window.innerHeight / 2 - height / 2
      });
    }

    return () => {
      clearInterval(timer);
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current = null;
      }
      if (notificationRef.current) {
        notificationRef.current.pause();
        notificationRef.current = null;
      }
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
      }
    };
  }, [dwellTime, isMinimized]);

  useEffect(() => {
    // Check if we're in the final 30 seconds of the total dwell time
    if (remainingTime === totalSeconds - 30) {
      playAlertSound();
      setShowFinal30SecWarning(true);
      
      // Show the warning for 5 seconds
      const timeout = setTimeout(() => {
        setShowFinal30SecWarning(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [remainingTime, totalSeconds]);

  useEffect(() => {
    // Handle last 30 seconds countdown display and continuous alert
    if (remainingTime <= 30 && remainingTime > 0) {
      setShow30SecWarning(true);
      
      // Start continuous alert every 5 seconds
      if (!alertIntervalRef.current) {
        playAlertSound();
        alertIntervalRef.current = setInterval(playAlertSound, 5000);
      }
    } else {
      setShow30SecWarning(false);
      if (alertIntervalRef.current) {
        clearInterval(alertIntervalRef.current);
        alertIntervalRef.current = null;
      }
    }
  }, [remainingTime, isMinimized]);

  const playAlertSound = () => {
    if (isMinimized) return;
    if (alarmRef.current) {
      alarmRef.current.loop = false;
      alarmRef.current.volume = 1.0;
      alarmRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  };

  useEffect(() => {
    // Don't play sounds if minimized
    if (isMinimized) return;

    // Play sounds at specific intervals
    if (remainingTime <= 0 && lastPlayedSound !== 'alarm') {
      // Time is up - play alarm continuously
      if (alarmRef.current) {
        alarmRef.current.loop = true;
        alarmRef.current.volume = 1.0;
        alarmRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('alarm');
      }
    } else if (remainingTime <= 20 && remainingTime > 0 && lastPlayedSound !== '20sec') {
      // 20 seconds remaining - play urgent alarm
      if (alarmRef.current) {
        alarmRef.current.loop = false;
        alarmRef.current.volume = 1.0;
        alarmRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('20sec');
      }
    } else if (remainingTime <= 30 && remainingTime > 20 && lastPlayedSound !== '30sec') {
      // 30 seconds remaining - play alarm once
      if (alarmRef.current) {
        alarmRef.current.loop = false;
        alarmRef.current.volume = 1.0;
        alarmRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('30sec');
      }
    } else if (remainingTime <= 180 && remainingTime > 30 && lastPlayedSound !== '3min') {
      // 3 minutes remaining - play notification
      if (notificationRef.current) {
        notificationRef.current.volume = 1.0;
        notificationRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('3min');
      }
    } else if (remainingTime === totalSeconds - 30 && lastPlayedSound !== '30sec-start') {
      // 30 seconds into the total time (e.g., 3:59:30 for 4 hours)
      if (notificationRef.current) {
        notificationRef.current.volume = 1.0;
        notificationRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('30sec-start');
      }
    }
  }, [remainingTime, isMinimized, lastPlayedSound, totalSeconds]);

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't drag if clicking a button
    
    const rect = modalRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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

  const getMessage = () => {
    if (remainingTime <= 0) {
      return 'Dwell time completed! Please drain the solution now.';
    } else if (remainingTime <= 20) {
      return 'CRITICAL: Less than 20 seconds remaining! Drain immediately!';
    } else if (remainingTime <= 30) {
      return 'URGENT: Less than 30 seconds remaining! Prepare to drain immediately.';
    } else if (remainingTime <= 180) {
      return 'Prepare to drain. Less than 3 minutes remaining.';
    } else if (remainingTime <= 600) {
      return 'Treatment in progress. About 10 minutes remaining.';
    } else if (remainingTime === totalSeconds - 30) {
      return '30 seconds have passed.';
    } else {
      return 'Treatment in progress. Dwell time counting down.';
    }
  };

  // Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('dwellTimerRemainingTime');
    };
  }, []);

  if (isMinimized) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: colors.white,
          borderRadius: '8px',
          padding: '10px 15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          cursor: 'pointer',
          borderLeft: `4px solid ${remainingTime <= 180 ? colors.alert : colors.secondary}`,
          transition: 'all 0.3s ease',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.3)'
          }
        }}
        onClick={onToggleMinimize}
      >
        <FiClock style={{ 
          color: remainingTime <= 180 ? colors.alert : colors.secondary 
        }} />
        <span style={{ 
          fontWeight: 'bold',
          color: remainingTime <= 180 ? colors.alert : colors.primary,
          fontSize: '1.1rem'
        }}>
          {formatTime(remainingTime)}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: colors.primary,
            cursor: 'pointer',
            marginLeft: '10px',
            opacity: 0.7,
            transition: 'all 0.2s ease',
            ':hover': {
              opacity: 1,
              transform: 'scale(1.1)'
            }
          }}
        >
          <FiX size={16} />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={modalRef}
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        backgroundColor: colors.white,
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        zIndex: 1000,
        border: `1px solid ${colors.lightGray}`,
        transition: 'all 0.3s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ 
          margin: 0,
          color: colors.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          <FiDroplet style={{ color: colors.secondary }} />
          Dwell Timer
        </h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={onToggleMinimize}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary,
              cursor: 'pointer',
              fontSize: '1.2rem',
              opacity: 0.7,
              transition: 'all 0.2s ease',
              ':hover': {
                opacity: 1,
                transform: 'scale(1.1)'
              }
            }}
          >
            <FiMinimize2 />
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary,
              cursor: 'pointer',
              fontSize: '1.2rem',
              opacity: 0.7,
              transition: 'all 0.2s ease',
              ':hover': {
                opacity: 1,
                transform: 'scale(1.1)'
              }
            }}
          >
            <FiX />
          </button>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        margin: '30px 0'
      }}>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          color: remainingTime <= 180 ? colors.alert : colors.secondary,
          margin: '20px 0',
          textShadow: remainingTime <= 180 ? `0 0 10px ${colors.alert}80` : `0 0 10px ${colors.secondary}30`,
          padding: '20px',
          borderRadius: '12px',
          background: remainingTime <= 180 ? `${colors.alert}10` : `${colors.secondary}05`,
          boxShadow: remainingTime <= 180 ? `0 0 20px ${colors.alert}30` : `0 0 20px ${colors.secondary}20`,
          transition: 'all 0.3s ease'
        }}>
          {formatTime(remainingTime)}
        </div>
        
        {/* Status message with enhanced styling */}
        <div style={{
          backgroundColor: remainingTime <= 30 ? `${colors.alert}15` : `${colors.secondary}10`,
          padding: '15px',
          borderRadius: '12px',
          margin: '25px 0',
          borderLeft: `5px solid ${remainingTime <= 30 ? colors.alert : colors.secondary}`,
          transition: 'all 0.3s ease'
        }}>
          <p style={{ 
            color: remainingTime <= 30 ? colors.alert : colors.primary,
            margin: 0,
            fontWeight: remainingTime <= 30 ? 'bold' : '600',
            fontSize: '1.1rem',
            lineHeight: '1.5'
          }}>
            {getMessage()}
          </p>
        </div>

        {/* 30-second start warning message */}
        {showFinal30SecWarning && (
          <div style={{
            backgroundColor: `${colors.secondary}20`,
            padding: '15px',
            borderRadius: '10px',
            margin: '25px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            boxShadow: `0 0 15px ${colors.secondary}20`,
            border: `1px solid ${colors.secondary}30`,
            animation: 'pulse 1s infinite'
          }}>
            <FiAlertTriangle style={{ color: colors.secondary, fontSize: '1.5rem' }} />
            <span style={{ 
              color: colors.secondary,
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              30 seconds have passed. Treatment has begun.
            </span>
          </div>
        )}

        {/* 30-second end warning message */}
        {show30SecWarning && (
          <div style={{
            backgroundColor: `${colors.alert}20`,
            padding: '15px',
            borderRadius: '10px',
            margin: '25px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            boxShadow: `0 0 15px ${colors.alert}20`,
            border: `1px solid ${colors.alert}30`,
            animation: 'pulse 0.5s infinite'
          }}>
            <FiAlertTriangle style={{ color: colors.alert, fontSize: '1.5rem' }} />
            <span style={{ 
              color: colors.alert,
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              WARNING: Only {formatTime(remainingTime)} remaining!
            </span>
          </div>
        )}
      </div>

      {/* Progress bar to visualize time remaining */}
      <div style={{
        height: '8px',
        backgroundColor: colors.lightGray,
        borderRadius: '4px',
        margin: '20px 0',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(remainingTime / totalSeconds) * 100}%`,
          height: '100%',
          backgroundColor: remainingTime <= 180 ? colors.alert : colors.secondary,
          transition: 'width 1s linear, background-color 0.3s ease'
        }} />
      </div>
    </div>
  );
};

export default DwellTimerModal;