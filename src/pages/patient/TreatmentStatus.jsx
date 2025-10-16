import React, { useEffect, useState } from 'react';
import { FiClock, FiDroplet, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import { BsSpeedometer2 } from 'react-icons/bs';
import { GiWaterDrop } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes, css } from 'styled-components';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Styled Components
const AlarmCard = styled(motion.div)`
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(208, 2, 27, 0.2);
  margin-bottom: 20px;
  border-left: 6px solid #d0021b;
  animation: ${shake} 0.5s ease-in-out 3;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #d0021b, #f5a623);
  }
`;

const StatusCard = styled(motion.div)`
  background-color: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4a90e2, #6a5acd);
  }
`;

const ProgressBar = styled.div`
  background-color: rgba(224, 224, 224, 0.5);
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shimmer} 2s infinite;
  }
`;

const ActionButton = styled(motion.button)`
  margin-top: 12px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a90e2, #6a5acd);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #6a5acd, #4a90e2);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  &:hover {
    box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const IconWrapper = styled.div`
  margin-right: 10px;
  font-size: 24px;
  display: flex;
  align-items: center;
  color: ${props => props.$color || '#4a90e2'};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  font-size: 14px;
  background: ${props => 
    props.$status === 'Ongoing' ? 'linear-gradient(135deg, #2196f3, #21cbf3)' :
    props.$status === 'Completed' ? 'linear-gradient(135deg, #4caf50, #8bc34a)' :
    '#ccc'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TreatmentSummaryCard = styled(motion.div)`
  background: linear-gradient(135deg, #f5f7fa, #e4e8f0);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border-left: 6px solid #4caf50;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 40px;
    height: 40px;
    background-color: rgba(76, 175, 80, 0.1);
    border-radius: 50%;
  }
`;

const PhaseIndicator = styled(motion.div)`
  text-align: center;
  color: ${props => props.$active ? '#4a90e2' : props.$completed ? '#4caf50' : '#aaa'};
  position: relative;
  padding: 0 10px;
  
  ${props => props.$active && css`
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      background-color: #4a90e2;
      border-radius: 50%;
      animation: ${pulse} 1.5s infinite;
    }
  `}
`;

const DetailCard = styled(motion.div)`
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid ${props => props.$color || '#4a90e2'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CompletionCelebration = styled(motion.div)`
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 120px;
    color: rgba(76, 175, 80, 0.05);
    z-index: 0;
  }
`;

const WaterDropIcon = styled(GiWaterDrop)`
  color: #4a90e2;
  animation: ${float} 3s ease-in-out infinite;
`;

const TreatmentStatus = ({ 
  ongoingTreatment, 
  treatmentLoading, 
  complianceStatus, 
  drainAlarm, 
  drainAlarmMessage, 
  navigate 
}) => {
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    if (drainAlarm) {
      const interval = setInterval(() => {
        setPulseAnimation(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [drainAlarm]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Manila'
    };
    return date.toLocaleDateString('en-PH', options);
  };

  const calculateTimeRemaining = (drainTime, dwellHours) => {
    if (!drainTime || dwellHours === undefined || dwellHours === null) return '-';
    
    const now = new Date();
    const drainDateTime = new Date(new Date(drainTime).getTime() + (dwellHours * 60 * 60 * 1000));
    const diffMs = drainDateTime - now;
    
    if (diffMs <= 0) return 'Complete now';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${Math.round(diffMinutes)}m remaining`;
  };

  // Sample completed treatments data
  const sampleCompletedTreatments = [
    {
      Treatment_ID: 12344,
      TreatmentStatus: "Completed",
      treatmentType: "CAPD",
      inSolution: {
        InStarted: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        Dialysate: "1.5",
        VolumeIn: 2000,
        Dwell: 4,
      },
      outSolution: {
        DrainStarted: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        DrainFinished: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        VolumeOut: 2200,
      },
      bagSerialNumber: "BAG-2023-12344"
    },
    {
      Treatment_ID: 12343,
      TreatmentStatus: "Completed",
      treatmentType: "CAPD",
      inSolution: {
        InStarted: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        Dialysate: "2.5",
        VolumeIn: 2000,
        Dwell: 4.5,
      },
      outSolution: {
        DrainStarted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        DrainFinished: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        VolumeOut: 2150,
      },
      bagSerialNumber: "BAG-2023-12343"
    }
  ];

  return (
    <>
      {/* Drain Alarm */}
      <AnimatePresence>
        {drainAlarm && showReminder && (
          <AlarmCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={pulseAnimation ? { opacity: 1, scale: [1, 1.02, 1] } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Header>
              <IconWrapper $color="#d0021b">
                <FiAlertCircle />
              </IconWrapper>
              <h4 style={{ margin: 0 }}>Drain Reminder</h4>
            </Header>
            <p style={{ marginBottom: '16px' }}>{drainAlarmMessage}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ActionButton
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/patient/TreatmentEnd')}
                style={{ background: 'linear-gradient(135deg, #d0021b, #f5a623)' }}
              >
                <FiDroplet /> Complete Drain Process
              </ActionButton>
              <ActionButton
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReminder(false)}
                style={{ background: '#666' }}
              >
                Dismiss
              </ActionButton>
            </div>
          </AlarmCard>
        )}
      </AnimatePresence>

      {/* Daily Treatment Progress */}
      {(!ongoingTreatment || ongoingTreatment.TreatmentStatus === 'Completed') && (
        <StatusCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Header>
            <IconWrapper>
              <FiCheckCircle />
            </IconWrapper>
            <h3 style={{ margin: 0 }}>Today's Treatment Progress</h3>
          </Header>

          <ProgressBar>
            <ProgressFill style={{ width: `${(complianceStatus.completed / 3) * 100}%` }} />
          </ProgressBar>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {complianceStatus.completed} of 3 treatments completed
              </p>
              <p style={{ margin: 0, color: '#666' }}>
                {complianceStatus.remaining > 0 
                  ? `${complianceStatus.remaining} treatments remaining today`
                  : 'All treatments completed for today!'
                }
              </p>
            </div>
            <StatusBadge $status={complianceStatus.completed === 3 ? 'Completed' : 'Ongoing'}>
              {complianceStatus.completed === 3 ? 'Completed' : 'In Progress'}
            </StatusBadge>
          </div>

          {complianceStatus.completed > 0 && (
            <TreatmentSummaryCard
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h4 style={{ marginTop: 0, position: 'relative', zIndex: 1 }}>Last Treatment Summary</h4>
              <div style={{ 
                display: 'grid', 
                gap: '12px', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                position: 'relative',
                zIndex: 1
              }}>
                <div>
                  <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Total Fluid Removed:</p>
                  <p style={{ margin: '4px 0' }}>≈ 4350 mL</p>
                </div>
                <div>
                  <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Average UF:</p>
                  <p style={{ margin: '4px 0' }}>≈ 175 mL per treatment</p>
                </div>
                <div>
                  <p style={{ margin: '4px 0', fontWeight: 'bold' }}>Last Treatment:</p>
                  <p style={{ margin: '4px 0' }}>{formatDate(sampleCompletedTreatments[0]?.outSolution?.DrainFinished)}</p>
                </div>
              </div>
            </TreatmentSummaryCard>
          )}

          {complianceStatus.remaining > 0 ? (
            <ActionButton
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/patient/TreatmentStart')}
            >
              <WaterDropIcon size={20} /> Start Next Treatment
            </ActionButton>
          ) : (
            <CompletionCelebration
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiCheckCircle style={{ fontSize: '48px', color: '#4caf50', position: 'relative', zIndex: 1 }} />
              </motion.div>
              <h3 style={{ color: '#4caf50', position: 'relative', zIndex: 1 }}>Great job today!</h3>
              <p style={{ position: 'relative', zIndex: 1 }}>You've successfully completed all 3 treatments for today.</p>
            </CompletionCelebration>
          )}
        </StatusCard>
      )}

      {/* Ongoing Treatment */}
      {ongoingTreatment && ongoingTreatment.TreatmentStatus === 'Ongoing' && (
        <StatusCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Header>
            <IconWrapper>
              <FiClock />
            </IconWrapper>
            <h3 style={{ margin: 0 }}>Current Treatment Status</h3>
          </Header>

          {treatmentLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '20px' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  width: '50px',
                  height: '50px',
                  border: '5px solid #f3f3f3',
                  borderTop: '5px solid #4a90e2',
                  borderRadius: '50%',
                  margin: '0 auto 20px'
                }}
              />
              <p>Checking for ongoing treatments...</p>
            </motion.div>
          ) : ongoingTreatment ? (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>
                    Treatment #{ongoingTreatment.Treatment_ID}
                    {ongoingTreatment.treatmentType && (
                      <span style={{ fontWeight: 'normal', fontSize: '14px' }}>
                        {' '}({ongoingTreatment.treatmentType})
                      </span>
                    )}
                  </h4>
                  <p style={{ margin: 0, color: '#888' }}>
                    Started on {formatDate(ongoingTreatment.inSolution?.InStarted)}
                  </p>
                </div>
                <StatusBadge $status={ongoingTreatment.TreatmentStatus}>
                  {ongoingTreatment.TreatmentStatus}
                </StatusBadge>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-around', 
                  marginBottom: '10px',
                  position: 'relative'
                }}>
                  {['Fill Phase', 'Dwell Phase', 'Drain Phase'].map((label, i) => {
                    const isActive = (i === 1); // Dwell phase is active
                    const isCompleted = (i === 0); // Fill phase is completed

                    return (
                      <PhaseIndicator 
                        key={label} 
                        $active={isActive}
                        $completed={isCompleted}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                          {i === 0 || i === 2 ? <FiDroplet /> : <FiClock />}
                        </div>
                        <span>{label}</span>
                      </PhaseIndicator>
                    );
                  })}
                </div>
                <ProgressBar>
                  <ProgressFill style={{
                    width: '66%', // 2/3 progress (Fill done, Dwell in progress)
                  }} />
                </ProgressBar>
              </div>

              {/* Treatment Details */}
              <div style={{ 
                display: 'grid', 
                gap: '16px', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                marginBottom: '20px'
              }}>
                {/* Dialysate Solution */}
                <DetailCard 
                  whileHover={{ y: -5 }}
                  $color="#4a90e2"
                >
                  <Header>
                    <IconWrapper>
                      <FiDroplet />
                    </IconWrapper>
                    <h4 style={{ margin: 0 }}>Dialysate Solution</h4>
                  </Header>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Concentration:</strong> {ongoingTreatment.inSolution?.Dialysate}% 
                    <span style={{ fontStyle: 'italic', color: '#888' }}>
                      {ongoingTreatment.dry_night ? ' (Night Exchange)' : ' (Standard)'}
                    </span>
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Volume In:</strong> {ongoingTreatment.inSolution?.VolumeIn || '-'} mL
                  </p>
                  <p style={{ margin: '8px 0', color: '#666' }}>
                    <strong>Bag Serial:</strong> {ongoingTreatment.bagSerialNumber || '-'}
                  </p>
                </DetailCard>

                {/* Volumes */}
                <DetailCard 
                  whileHover={{ y: -5 }}
                  $color="#6a5acd"
                >
                  <Header>
                    <IconWrapper $color="#6a5acd">
                      <BsSpeedometer2 />
                    </IconWrapper>
                    <h4 style={{ margin: 0 }}>Volumes</h4>
                  </Header>
                  <p style={{ margin: '8px 0' }}>
                    <strong>In:</strong> {ongoingTreatment.inSolution?.VolumeIn || '-'} mL
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Out:</strong> {ongoingTreatment.outSolution?.VolumeOut || '-'} mL
                  </p>
                  <p style={{ 
                    margin: '8px 0',
                    color: ongoingTreatment.outSolution?.VolumeOut - ongoingTreatment.inSolution?.VolumeIn > 0 ? '#4caf50' : '#d0021b',
                    fontWeight: 'bold'
                  }}>
                    <strong>Balance:</strong> {(ongoingTreatment.outSolution?.VolumeOut - ongoingTreatment.inSolution?.VolumeIn) || '-'} mL
                  </p>
                </DetailCard>

                {/* Timing */}
                <DetailCard 
                  whileHover={{ y: -5 }}
                  $color="#21cbf3"
                >
                  <Header>
                    <IconWrapper $color="#21cbf3">
                      <FiClock />
                    </IconWrapper>
                    <h4 style={{ margin: 0 }}>Timing</h4>
                  </Header>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Dwell Time:</strong> 
                    {ongoingTreatment.inSolution?.Dwell !== undefined ? 
                      `${ongoingTreatment.inSolution.Dwell} hour${ongoingTreatment.inSolution.Dwell !== 1 ? 's' : ''}` : 
                      '-'}
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Status:</strong> {calculateTimeRemaining(
                      ongoingTreatment.outSolution?.DrainStarted,
                      ongoingTreatment.inSolution?.Dwell
                    )}
                  </p>
                  <p style={{ margin: '8px 0' }}>
                    <strong>Duration:</strong> {ongoingTreatment.inSolution?.InStarted && ongoingTreatment.outSolution?.DrainFinished ? 
                      `${((new Date(ongoingTreatment.outSolution.DrainFinished) - 
                      new Date(ongoingTreatment.inSolution.InStarted)) / (1000 * 60 * 60)).toFixed(1)} hours` : 'In progress'}
                  </p>
                </DetailCard>
              </div>

              {!ongoingTreatment.outSolution?.DrainFinished && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <ActionButton
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/patient/TreatmentEnd')}
                    style={{ marginTop: '16px' }}
                  >
                    {ongoingTreatment.outSolution?.DrainStarted ? 
                      <><FiCheckCircle /> Complete Drain Process</> : 
                      <><FiDroplet /> Begin Drain Process</>}
                  </ActionButton>
                </div>
              )}
            </>
          ) : null}
        </StatusCard>
      )}
    </>
  );
};

export default TreatmentStatus;