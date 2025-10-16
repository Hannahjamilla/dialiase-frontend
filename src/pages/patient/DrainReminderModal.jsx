import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiMinimize2, FiMaximize2, FiX, FiDroplet } from 'react-icons/fi';
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
  const [remainingTime, setRemainingTime] = useState(dwellTime * 3600); // in seconds
  const [isEnding, setIsEnding] = useState(false);
  const [lastPlayedSound, setLastPlayedSound] = useState(null);
  const alarmRef = useRef(null);
  const notificationRef = useRef(null);
  
  useEffect(() => {
    // Initialize audio
    alarmRef.current = new Audio(alarmSound);
    notificationRef.current = new Audio(notificationSound);

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

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
    };
  }, [dwellTime]);

  useEffect(() => {
    // Don't play sounds if minimized
    if (isMinimized) return;

    // Play sounds at specific intervals
    if (remainingTime <= 0 && lastPlayedSound !== 'alarm') {
      // Time is up - play alarm continuously
      if (alarmRef.current) {
        alarmRef.current.loop = true;
        alarmRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('alarm');
      }
    } else if (remainingTime <= 30 && remainingTime > 0 && lastPlayedSound !== '30sec') {
      // 30 seconds remaining - play alarm once
      if (alarmRef.current) {
        alarmRef.current.loop = false;
        alarmRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('30sec');
      }
    } else if (remainingTime <= 180 && remainingTime > 30 && lastPlayedSound !== '3min') {
      // 3 minutes remaining - play notification
      if (notificationRef.current) {
        notificationRef.current.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedSound('3min');
      }
    }
  }, [remainingTime, isMinimized, lastPlayedSound]);

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

  const handleEndTreatment = () => {
    setIsEnding(true);
    // Stop any sounds
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
    if (notificationRef.current) {
      notificationRef.current.pause();
      notificationRef.current.currentTime = 0;
    }
    onEndTreatment();
  };

  const getMessage = () => {
    if (remainingTime <= 0) {
      return 'Dwell time completed! Please drain the solution now.';
    } else if (remainingTime <= 30) {
      return 'URGENT: Less than 30 seconds remaining! Prepare to drain immediately.';
    } else if (remainingTime <= 180) {
      return 'Prepare to drain. Less than 3 minutes remaining.';
    } else if (remainingTime <= 600) {
      return 'Treatment in progress. About 10 minutes remaining.';
    } else {
      return 'Treatment in progress. Dwell time counting down.';
    }
  };

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: '10px 15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 1000,
        cursor: 'pointer',
        borderLeft: `4px solid ${remainingTime <= 180 ? colors.alert : colors.secondary}`
      }}
      onClick={onToggleMinimize}
      >
        <FiClock style={{ 
          color: remainingTime <= 180 ? colors.alert : colors.secondary 
        }} />
        <span style={{ 
          fontWeight: 'bold',
          color: colors.primary
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
            marginLeft: '10px'
          }}
        >
          <FiX size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: colors.white,
      borderRadius: '12px',
      padding: '25px',
      maxWidth: '400px',
      width: '90%',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ 
          margin: 0,
          color: colors.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FiDroplet style={{ color: colors.secondary }} />
          Dwell Timer
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onToggleMinimize}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary,
              cursor: 'pointer'
            }}
          >
            {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary,
              cursor: 'pointer'
            }}
          >
            <FiX />
          </button>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        margin: '20px 0'
      }}>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: remainingTime <= 180 ? colors.alert : colors.primary,
          margin: '10px 0'
        }}>
          {formatTime(remainingTime)}
        </div>
        <p style={{ 
          color: remainingTime <= 30 ? colors.alert : colors.primary,
          margin: '10px 0 20px',
          fontWeight: remainingTime <= 30 ? 'bold' : 'normal'
        }}>
          {getMessage()}
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '20px'
      }}>
        <button 
          onClick={handleEndTreatment}
          disabled={isEnding}
          style={{
            padding: '10px 20px',
            backgroundColor: colors.alert,
            color: colors.white,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            ':hover': {
              opacity: 0.9
            },
            ':disabled': {
              opacity: 0.7,
              cursor: 'not-allowed'
            }
          }}
        >
          {isEnding ? 'Ending...' : 'End Treatment Now'}
        </button>
      </div>
    </div>
  );
};

export default DwellTimerModal;