// AnimatedDrainTimer.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedDrainTimer = ({ timer, onStartStop, isRunning }) => {
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(() => setShowTimer(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowTimer(false);
    }
  }, [isRunning]);

  const formatTimerValue = (value) => String(value).padStart(2, '0');

  return (
    <div className="timer-container">
      <AnimatePresence>
        {!isRunning && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="start-state"
          >
            <h2>Ready to Start Drain</h2>
            <p>Click the button below when you begin draining</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartStop}
              className="start-button"
            >
              Start Drain Timer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="running-state"
          >
            <div className="timer-content">
              <h2>Drain in Progress</h2>
              <div className="time-display">
                {formatTimerValue(timer.hours)}:
                {formatTimerValue(timer.minutes)}:
                {formatTimerValue(timer.seconds)}
              </div>
              <p className="status-message">The solution is draining from your abdomen...</p>
              
              <div className="drain-info">
                <h3>Drain Finished</h3>
                <p>{new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="time-note">Drain time should be 10 seconds</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartStop}
              className="stop-button"
            >
              Stop Drain
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .timer-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          min-height: 300px;
          display: flex;
          flex-direction: column;
        }

        .start-state, .running-state {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .start-state {
          text-align: center;
          justify-content: center;
          align-items: center;
          gap: 15px;
        }

        .running-state {
          justify-content: space-between;
        }

        h2 {
          color: #2d3748;
          font-size: 1.2rem;
          margin: 0 0 10px 0;
          font-weight: 600;
        }

        h3 {
          color: #4a5568;
          font-size: 1rem;
          margin: 0 0 5px 0;
          font-weight: 600;
        }

        p {
          color: #718096;
          margin: 0 0 15px 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .time-note {
          color: #e53e3e;
          font-size: 0.8rem;
          margin-top: 5px;
        }

        .timer-content {
          flex: 1;
        }

        .time-display {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2b6cb0;
          font-family: 'Roboto Mono', monospace;
          text-align: center;
          margin: 20px 0;
        }

        .status-message {
          text-align: center;
          margin-bottom: 30px;
        }

        .drain-info {
          background: #f7fafc;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .start-button, .stop-button {
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          max-width: 200px;
          margin: 0 auto;
          transition: all 0.2s;
        }

        .start-button {
          background-color: #4299e1;
          color: white;
          box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
        }

        .start-button:hover {
          background-color: #3182ce;
        }

        .stop-button {
          background-color: #e53e3e;
          color: white;
          box-shadow: 0 2px 4px rgba(229, 62, 62, 0.3);
          margin-top: auto;
        }

        .stop-button:hover {
          background-color: #c53030;
        }
      `}</style>
    </div>
  );
};

export default AnimatedDrainTimer;