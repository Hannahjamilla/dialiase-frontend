import React, { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationModal = ({ type, message, onClose, autoClose = true, autoCloseDuration = 5000 }) => {
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // Trigger animation
        setTimeout(() => setVisible(true), 10);

        if (autoClose) {
            const timer = setInterval(() => {
                setProgress(prev => Math.max(0, prev - (100 / (autoCloseDuration / 50))));
            }, 50);

            const timeout = setTimeout(() => {
                handleClose();
                clearInterval(timer);
            }, autoCloseDuration);

            return () => {
                clearTimeout(timeout);
                clearInterval(timer);
            };
        }
    }, [autoClose, autoCloseDuration, onClose]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onClose(), 300); // Wait for animation to complete
    };

    const colors = {
        primary: '#395886',
        secondary: '#638ECB',
        white: '#FFFFFF',
        green: '#477977',
        red: '#E53E3E',
        orange: '#DD6B20',
        text: '#2F2F2F',
        backdrop: 'rgba(0, 0, 0, 0.4)',
        lightGray: '#F5F7FA',
    };

    const getIcon = () => {
        const baseStyle = {
            fontSize: '36px', // Slightly larger icon
            marginRight: '20px', // More spacing
            flexShrink: 0,
        };

        switch (type) {
            case 'error':
                return <FiAlertCircle style={{ ...baseStyle, color: colors.red }} />;
            case 'success':
                return <FiCheckCircle style={{ ...baseStyle, color: colors.green }} />;
            case 'info':
                return <FiInfo style={{ ...baseStyle, color: colors.secondary }} />;
            case 'warning':
                return <FiAlertCircle style={{ ...baseStyle, color: colors.orange }} />;
            case 'loading':
                return <FiClock style={{ ...baseStyle, color: colors.primary }} />;
            default:
                return <FiInfo style={{ ...baseStyle, color: colors.secondary }} />;
        }
    };

    const getHeaderColor = () => {
        switch (type) {
            case 'error': return colors.red;
            case 'success': return colors.green;
            case 'info': return colors.secondary;
            case 'warning': return colors.orange;
            case 'loading': return colors.primary;
            default: return colors.primary;
        }
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.backdrop,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    };

    const modalStyle = {
        backgroundColor: colors.white,
        borderRadius: '20px', // More rounded corners
        width: '90%',
        maxWidth: '500px', // Slightly wider
        padding: '0',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        fontFamily: `'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif`,
        overflow: 'hidden',
    };

    const progressBarStyle = {
        height: '5px', // Slightly thicker
        width: `${progress}%`,
        backgroundColor: getHeaderColor(),
        transition: 'width 0.05s linear',
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '28px 32px', // More padding
        backgroundColor: colors.lightGray,
        position: 'relative',
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '20px', // More spacing
        right: '20px', // More spacing
        background: 'none',
        border: 'none',
        color: colors.text,
        opacity: 0.6,
        cursor: 'pointer',
        fontSize: '24px', // Slightly larger
        padding: '6px', // More padding
        borderRadius: '50%',
        transition: 'all 0.2s ease',
    };

    const titleStyle = {
        margin: 0,
        fontSize: '22px', // Slightly larger
        color: colors.text,
        fontWeight: 600,
        textTransform: 'capitalize',
        display: 'flex',
        alignItems: 'center',
    };

    const contentStyle = {
        padding: '28px 32px', // More padding
        color: colors.text,
        fontSize: '18px', // Slightly larger
        lineHeight: '1.6',
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0 32px 28px', // More padding
    };

    const buttonStyle = {
        padding: '14px 32px', // More padding
        backgroundColor: colors.primary,
        color: colors.white,
        border: 'none',
        borderRadius: '10px', // More rounded
        cursor: 'pointer',
        fontSize: '16px', // Slightly larger
        fontWeight: 500,
        letterSpacing: '0.3px',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 8px rgba(57, 88, 134, 0.2)',
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    style={modalOverlayStyle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    <motion.div
                        style={modalStyle}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ 
                            type: 'spring',
                            damping: 20,
                            stiffness: 300,
                            duration: 0.3
                        }}
                    >
                        <div style={progressBarStyle} />
                        <div style={headerStyle}>
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring' }}
                            >
                                {getIcon()}
                            </motion.div>
                            <motion.h3 
                                style={titleStyle}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.15 }}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </motion.h3>
                            <motion.button 
                                onClick={handleClose}
                                style={closeButtonStyle}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = 1)}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = 0.6)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiX />
                            </motion.button>
                        </div>
                        <motion.div 
                            style={contentStyle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <p>{message}</p>
                        </motion.div>
                        <motion.div 
                            style={buttonContainerStyle}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                        >
                            <motion.button
                                onClick={handleClose}
                                style={buttonStyle}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.secondary)}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
                                whileHover={{ y: -2, boxShadow: '0 6px 12px rgba(57, 88, 134, 0.3)' }}
                                whileTap={{ y: 1, boxShadow: '0 2px 4px rgba(57, 88, 134, 0.2)' }}
                            >
                                OK
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationModal;