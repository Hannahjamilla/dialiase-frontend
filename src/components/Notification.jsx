import { useEffect, useState } from 'react';
import { FaCheck, FaExclamationTriangle, FaTimes, FaInfoCircle, FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = ({ message, type, onClose, id }) => {
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Custom notification sounds mapped to types
  const soundEffects = {
    success: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
    error: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
    info: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3',
    warning: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'
  };

  // Detect first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    const duration = 5000; // Increased duration for better UX
    const interval = 50;
    const steps = duration / interval;
    const stepAmount = 100 / steps;

    let timer;
    let progressTimer;

    if (!isHovered && !isExiting) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);

      progressTimer = setInterval(() => {
        setProgress(prev => Math.max(0, prev - stepAmount));
      }, interval);
    }

    // Play sound effect only if user has interacted
    if (userInteracted) {
      const sound = new Audio(soundEffects[type] || soundEffects.info);
      sound.volume = 0.2;
      sound.play().catch(e => console.log("Audio play prevented:", e));
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onClose, type, isHovered, isExiting, userInteracted]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 300);
  };

  const handleNotificationClick = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
    const sound = new Audio(soundEffects[type] || soundEffects.info);
    sound.volume = 0.2;
    sound.play().catch(e => console.log("Audio play prevented:", e));
  };

  const getTypeConfig = () => {
    const config = {
      success: {
        bgColor: '#2E7D32',
        icon: <FaCheck />,
        accentColor: '#69F0AE',
        emoji: '✨',
        pattern: 'confetti',
        glow: '0 0 15px rgba(105, 240, 174, 0.5)'
      },
      error: {
        bgColor: '#C62828',
        icon: <FaExclamationTriangle />,
        accentColor: '#FF8A80',
        emoji: '❗',
        pattern: 'zigzag',
        glow: '0 0 15px rgba(255, 138, 128, 0.5)'
      },
      info: {
        bgColor: '#1565C0',
        icon: <FaInfoCircle />,
        accentColor: '#80D8FF',
        emoji: 'ℹ️',
        pattern: 'bubbles',
        glow: '0 0 15px rgba(128, 216, 255, 0.5)'
      },
      warning: {
        bgColor: '#FF8F00',
        icon: <FaExclamationTriangle />,
        accentColor: '#FFE57F',
        emoji: '⚠️',
        pattern: 'waves',
        glow: '0 0 15px rgba(255, 229, 127, 0.5)'
      },
      custom: {
        bgColor: '#6A1B9A',
        icon: <FaBell />,
        accentColor: '#EA80FC',
        emoji: '🔔',
        pattern: 'stars',
        glow: '0 0 15px rgba(234, 128, 252, 0.5)'
      }
    };

    return config[type] || config.info;
  };

  const typeConfig = getTypeConfig();

  const getPatternStyle = () => {
    const patterns = {
      'confetti': `repeating-linear-gradient(
        45deg,
        ${typeConfig.accentColor}40,
        ${typeConfig.accentColor}40 5px,
        transparent 5px,
        transparent 10px
      )`,
      'zigzag': `repeating-linear-gradient(
        -45deg,
        ${typeConfig.bgColor},
        ${typeConfig.bgColor} 5px,
        ${typeConfig.accentColor} 5px,
        ${typeConfig.accentColor} 10px
      )`,
      'bubbles': `radial-gradient(
        circle at 20% 30%,
        ${typeConfig.accentColor}40 3px,
        transparent 3px
      ),
      radial-gradient(
        circle at 80% 70%,
        ${typeConfig.accentColor}40 4px,
        transparent 4px
      )`,
      'waves': `repeating-radial-gradient(
        circle at 10% 50%,
        transparent,
        transparent 7px,
        ${typeConfig.accentColor}40 7px,
        ${typeConfig.accentColor}40 10px
      )`,
      'stars': `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 9px,
        ${typeConfig.accentColor}40 9px,
        ${typeConfig.accentColor}40 10px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 9px,
        ${typeConfig.accentColor}40 9px,
        ${typeConfig.accentColor}40 10px
      )`
    };

    return patterns[typeConfig.pattern] || patterns['bubbles'];
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ x: 300, opacity: 0, scale: 0.9 }}
          animate={{ 
            x: 0, 
            opacity: 1, 
            scale: 1,
            boxShadow: typeConfig.glow
          }}
          exit={{ x: 300, opacity: 0, scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            damping: 20,
            stiffness: 300
          }}
          className="notification-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleNotificationClick}
          role="alert"
          aria-live="assertive"
          style={{
            '--bg-color': typeConfig.bgColor,
            '--accent-color': typeConfig.accentColor,
            '--pattern': getPatternStyle(),
            '--glow': typeConfig.glow,
            cursor: 'pointer'
          }}
        >
          <div className="notification-pattern" />
          
          <div className="notification-content">
            <div className="notification-icon">
              {typeConfig.icon}
              <span className="notification-emoji">{typeConfig.emoji}</span>
            </div>
            
            <div className="notification-message">
              {message}
              <div className="notification-progress" style={{ width: `${progress}%` }} />
            </div>
            
            <motion.button
              className="notification-close"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              aria-label="Close notification"
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>

          <style>{`
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 280px;
    max-width: 320px;
    color: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--glow), 0 8px 32px rgba(0,0,0,0.3);
    z-index: 9999;
    background-color: var(--bg-color);
    border-left: 5px solid var(--accent-color);
    transform-origin: right center;
  }
  
  .notification-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: var(--pattern);
    opacity: 0.4;
    pointer-events: none;
  }
  
  .notification-content {
    position: relative;
    display: flex;
    align-items: center;
    padding: 18px 24px;
    gap: 16px;
    background: linear-gradient(
      to right,
      rgba(0,0,0,0.1) 0%,
      transparent 20%,
      transparent 80%,
      rgba(255,255,255,0.1) 100%
    );
  }
  
  .notification-icon {
    position: relative;
    font-size: 24px;
    color: var(--accent-color);
    flex-shrink: 0;
    text-shadow: 0 0 8px var(--accent-color);
  }
  
  .notification-emoji {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 14px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    animation: float 2s ease-in-out infinite;
  }
  
  .notification-message {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    position: relative;
    padding-bottom: 4px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
  
  .notification-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background-color: var(--accent-color);
    border-radius: 2px;
    transition: width 0.05s linear;
    box-shadow: 0 0 5px var(--accent-color);
  }
  
  .notification-close {
    background: rgba(255,255,255,0.15);
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }
  
  .notification-close:hover {
    background: rgba(255,255,255,0.25);
    color: var(--accent-color);
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;