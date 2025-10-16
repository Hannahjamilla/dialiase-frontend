import React, { useState } from 'react';
import { FiAlertCircle, FiInfo, FiHeart, FiActivity, FiArrowRight, FiX } from 'react-icons/fi';
import { FaWeight, FaExclamationTriangle, FaTemperatureHigh, FaShower } from 'react-icons/fa';
import { GiMedicinePills } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { FiDroplet } from 'react-icons/fi';
import { FiShield } from 'react-icons/fi';
import { FiCalendar } from 'react-icons/fi';
import { FiMoon } from 'react-icons/fi';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const modalSlideIn = keyframes`
  from { transform: translateY(20px); }
  to { transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const shake = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
  75% { transform: rotate(-2deg); }
  100% { transform: rotate(0deg); }
`;

// Styled Components
const SectionContainer = styled(motion.div)`
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
  }
  
  .header-icon {
    font-size: 1.5rem;
    margin-right: 12px;
    color: ${props => props.$iconColor || '#4a90e2'};
    animation: ${float} 3s ease-in-out infinite;
  }
`;

const AlertItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background-color: ${props => 
    props.$type === 'critical' ? 'rgba(208, 2, 27, 0.08)' : 
    props.$type === 'warning' ? 'rgba(245, 166, 35, 0.08)' : 
    'rgba(74, 144, 226, 0.08)'};
  border-left: 4px solid ${props => 
    props.$type === 'critical' ? '#d0021b' : 
    props.$type === 'warning' ? '#f5a623' : 
    '#4a90e2'};
  animation: ${fadeIn} 0.4s ease-out forwards;
  
  .alert-icon {
    font-size: 1.25rem;
    margin-right: 12px;
    color: ${props => 
      props.$type === 'critical' ? '#d0021b' : 
      props.$type === 'warning' ? '#f5a623' : 
      '#4a90e2'};
    animation: ${props => props.$type === 'critical' ? `${shake} 0.5s ease-in-out 2` : 'none'};
  }
  
  p {
    margin: 0;
    color: #333;
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const TipItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f7ff;
    transform: translateX(5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  
  .tip-icon {
    font-size: 1.25rem;
    margin-right: 12px;
    color: ${props => props.$iconColor || '#4caf50'};
    min-width: 24px;
    animation: ${pulse} 2s infinite;
  }
  
  p {
    margin: 0;
    color: #333;
    font-size: 0.95rem;
    line-height: 1.5;
  }
`;

const GuidanceItem = styled(motion.div)`
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  background-color: #f9f9f9;
  border-left: 4px solid #6a5acd;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  h4 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 1rem;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 8px;
      color: #6a5acd;
      animation: ${float} 3s ease-in-out infinite;
    }
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.6;
  }
`;

const ViewAllButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  padding: 10px 16px;
  background-color: transparent;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  width: 100%;
  
  &:hover {
    background-color: rgba(74, 144, 226, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(74, 144, 226, 0.2);
  }
  
  svg {
    margin-left: 6px;
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(3px);
  }
`;

const LanguageToggle = styled(motion.button)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  z-index: 100;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #3a7bc8;
    transform: translateY(-2px);
  }
`;

// Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${modalFadeIn} 0.3s ease-out;
`;

const ModalContainer = styled(motion.div)`
  background-color: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1000px;
  height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: ${modalSlideIn} 0.3s ease-out;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
  
  h3 {
    margin: 0;
    font-size: 1.75rem;
    color: #333;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 12px;
      color: #4caf50;
      font-size: 1.5rem;
      animation: ${pulse} 2s infinite;
    }
  }
  
  button {
    background: none;
    border: none;
    font-size: 1.75rem;
    cursor: pointer;
    color: #666;
    transition: all 0.2s ease;
    
    &:hover {
      color: #d0021b;
      transform: rotate(90deg);
    }
  }
`;

const ModalContent = styled.div`
  padding: 32px 40px;
  flex: 1;
  overflow-y: auto;
`;

const ModalTipItem = styled(motion.div)`
  padding: 24px;
  margin-bottom: 20px;
  border-radius: 16px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f7ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .tip-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    svg {
      font-size: 1.5rem;
      margin-right: 16px;
      color: ${props => props.$iconColor || '#4caf50'};
      animation: ${pulse} 2s infinite;
    }
    
    h4 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
      font-weight: 500;
    }
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 1.05rem;
    line-height: 1.7;
    padding-left: 40px;
  }
`;

const HealthOverview = ({ healthAlerts, healthTips, navigate, hasOngoingTreatments }) => {
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [language, setLanguage] = useState('english');
  
  // Enhanced health tips with icons and translations
  const enhancedHealthTips = [
    { 
      message: 'Eat healthy with less salt, potassium, and phosphorus', 
      tagalog: 'Kumain ng masustansyang pagkain na mababa sa asin, potassium, at phosphorus',
      type: 'nutrition',
      icon: <FiHeart color="#4caf50" />,
      details: 'Avoid salty foods and limit bananas, oranges, dairy, and nuts. Eat fresh vegetables and lean meat. Talk to your dietitian to make a meal plan that fits your needs.',
      tagalogDetails: 'Iwasan ang maalat na pagkain at limitahan ang saging, dalandan, gatas, at mani. Kumain ng sariwang gulay at lean meat. Makipag-usap sa inyong dietitian para sa meal plan na akma sa inyong pangangailangan.'
    },
    { 
      message: 'Check your blood pressure every day', 
      tagalog: 'Suriin ang inyong blood pressure araw-araw',
      type: 'monitoring',
      icon: <FiActivity color="#2196f3" />,
      details: 'Measure your BP at the same time each morning. Record your results in a notebook or app. Normal range is around 90/60 to 140/90 mmHg.',
      tagalogDetails: 'Sukatin ang BP sa parehong oras tuwing umaga. Itala ang resulta sa notebook or app. Normal na range ay nasa 90/60 hanggang 140/90 mmHg.'
    },
    { 
      message: 'Weigh yourself daily to watch your fluid levels', 
      tagalog: 'Timbangin ang sarili araw-araw para subaybayan ang fluid levels',
      type: 'weight',
      icon: <FaWeight color="#6a5acd" />,
      details: 'Weigh yourself in the morning after going to the bathroom and before eating. Sudden weight gain may mean too much fluid in the body.',
      tagalogDetails: 'Timbangin ang sarili sa umaga pagkatapos gumamit ng banyo at bago kumain. Biglaang pagtaas ng timbang ay maaaring senyales ng sobrang fluid sa katawan.'
    },
    { 
      message: 'Take your medicine exactly as told by your doctor', 
      tagalog: 'Inumin ang gamot ayon sa itinakda ng doktor',
      type: 'medication',
      icon: <GiMedicinePills color="#9c27b0" />,
      details: 'Don\'t miss your doses. Use a pill organizer or alarm if needed. Always tell your doctor about any side effects or new medicines you take.',
      tagalogDetails: 'Huwag laktawan ang inyong gamot. Gumamit ng pill organizer o alarm kung kinakailangan. Ipaalam agad sa doktor ang anumang side effects o bagong gamot na iniinom.'
    },
    { 
      message: 'Move your body with light exercise', 
      tagalog: 'Gumalaw-galaw sa pamamagitan ng magaan na ehersisyo',
      type: 'activity',
      icon: <FiActivity color="#ff9800" />,
      details: 'Try walking, stretching, or other light activities for 20–30 minutes most days. Stop if you feel dizzy or tired. Ask your doctor what exercises are safe for you.',
      tagalogDetails: 'Subukan ang paglalakad, pag-unat, o iba pang magaang aktibidad ng 20-30 minuto karamihan ng araw. Huminto kung nahihilo o napapagod. Tanungin ang doktor kung anong ehersisyo ang ligtas para sa inyo.'
    },
    { 
      message: 'Drink the right amount of water your doctor advised', 
      tagalog: 'Uminom ng tamang dami ng tubig ayon sa payo ng doktor',
      type: 'hydration',
      icon: <FiDroplet color="#00bcd4" />,
      details: 'Some patients need to limit fluids. Follow your fluid allowance. Too much water can cause swelling and breathing problems.',
      tagalogDetails: 'Ang ilang pasyente ay kailangang limitahan ang fluid. Sundin ang inyong fluid allowance. Ang sobrang tubig ay maaaring magdulot ng pamamaga at hirap sa paghinga.'
    },
    { 
      message: 'Keep your dialysis area and equipment clean', 
      tagalog: 'Panatilihing malinis ang dialysis area at mga kagamitan',
      type: 'hygiene',
      icon: <FiShield color="#8bc34a" />,
      details: 'Wash your hands before handling supplies. Keep your catheter site clean and dry to avoid infection. Report any redness or pain to your doctor.',
      tagalogDetails: 'Maghugas ng kamay bago humawak ng mga supply. Panatilihing malinis at tuyo ang catheter site para maiwasan ang impeksyon. I-report ang anumang pamumula o sakit sa doktor.'
    },
    { 
      message: 'Attend all your clinic or dialysis appointments', 
      tagalog: 'Dumalo sa lahat ng clinic o dialysis appointments',
      type: 'appointments',
      icon: <FiCalendar color="#03a9f4" />,
      details: 'Don\'t skip sessions. Always follow your schedule. These visits help monitor your health and adjust your treatment if needed.',
      tagalogDetails: 'Huwag laktawan ang mga session. Laging sundin ang iskedyul. Ang mga pagbisitang ito ay tumutulong subaybayan ang inyong kalusugan at i-adjust ang treatment kung kinakailangan.'
    },
    {
      message: 'Get enough sleep every night',
      tagalog: 'Matulog ng sapat gabi-gabi',
      type: 'rest',
      icon: <FiMoon color="#607d8b" />,
      details: 'Aim for 7–9 hours of rest. Sleep helps your body recover and keeps your energy up. Avoid caffeine late in the day.',
      tagalogDetails: 'Layunin ang 7-9 oras ng pahinga. Ang tulog ay tumutulong sa katawan na makabawi at panatilihing mataas ang enerhiya. Iwasan ang caffeine sa huling bahagi ng araw.'
    },
    ...healthTips.map(tip => ({
      ...tip,
      details: tip.details || 'More helpful details will be added to this tip.',
      tagalogDetails: tip.tagalogDetails || 'Karagdagang kapaki-pakinabang na detalye ay idadagdag sa tip na ito.'
    }))
  ];

  // Treatment guidance with translations
  const treatmentGuidance = [
    {
      title: 'Treatment Effectiveness',
      tagalogTitle: 'Epektibidad ng Treatment',
      icon: <GiMedicinePills />,
      content: 'Complete all treatments as prescribed to maintain optimal fluid balance and toxin removal. Inconsistent treatments can lead to complications like fluid overload or inadequate toxin clearance.',
      tagalogContent: 'Kumpletuhin ang lahat ng treatment ayon sa itinakda para mapanatili ang optimal na fluid balance at pag-alis ng toxins. Ang hindi regular na treatment ay maaaring magdulot ng komplikasyon tulad ng fluid overload o hindi sapat na pag-alis ng toxins.'
    },
    {
      title: 'Solution Temperature',
      tagalogTitle: 'Temperatura ng Solution',
      icon: <FaTemperatureHigh />,
      content: 'Warm your dialysate solution to body temperature before use for greater comfort and improved peritoneal membrane function. Avoid microwaving - use a heating pad instead.',
      tagalogContent: 'Painitin ang dialysate solution sa temperatura ng katawan bago gamitin para sa mas komportableng pakiramdam at mas mahusay na function ng peritoneal membrane. Iwasan ang microwave - gumamit ng heating pad sa halip.'
    },
    {
      title: 'Exit Site Care',
      tagalogTitle: 'Pangangalaga sa Exit Site',
      icon: <FaShower />,
      content: 'Clean your catheter exit site daily with antiseptic solution and check for signs of infection like redness, swelling, or drainage. Keep the area dry and secure the catheter.',
      tagalogContent: 'Linisin ang catheter exit site araw-araw gamit ang antiseptic solution at suriin ang mga senyales ng impeksyon tulad ng pamumula, pamamaga, o drainage. Panatilihing tuyo ang lugar at siguraduhin ang catheter.'
    }
  ];

  const openTipsModal = () => {
    setIsTipsModalOpen(true);
  };

  const closeTipsModal = () => {
    setIsTipsModalOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'tagalog' : 'english');
  };

  return (
    <>
      {/* Language Toggle Button */}
      <LanguageToggle
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleLanguage}
      >
        {language === 'english' ? 'Switch to Tagalog' : 'Lumipat sa English'}
      </LanguageToggle>

      {/* Health Alerts - Only show if there are ongoing treatments AND alerts */}
      {hasOngoingTreatments && healthAlerts.length > 0 && (
        <SectionContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader $iconColor="#d0021b">
            <FiAlertCircle className="header-icon" />
            <h3>{language === 'english' ? 'Health Alerts' : 'Mga Health Alert'}</h3>
          </SectionHeader>
          <div className="alerts-container">
            {healthAlerts.slice(0, 3).map((alert, index) => (
              <AlertItem
                key={index}
                $type={alert.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="alert-icon">
                  {alert.type === 'critical' ? 
                    <FaExclamationTriangle /> : 
                    <FiAlertCircle />}
                </div>
                <div>
                  <p>{language === 'english' ? alert.message : alert.tagalogMessage || alert.message}</p>
                </div>
              </AlertItem>
            ))}
          </div>
          {healthAlerts.length > 3 && (
            <ViewAllButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/patient/health-alerts')}
            >
              {language === 'english' ? 'View All Alerts' : 'Tingnan Lahat ng Alert'} <FiArrowRight />
            </ViewAllButton>
          )}
        </SectionContainer>
      )}

      {/* Health Tips */}
      <SectionContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SectionHeader $iconColor="#4caf50">
          <FiInfo className="header-icon" />
          <h3>{language === 'english' ? 'Health Tips' : 'Mga Health Tip'}</h3>
        </SectionHeader>
        <div className="tips-container">
          {enhancedHealthTips.slice(0, 3).map((tip, index) => (
            <TipItem
              key={index}
              $iconColor={tip.type === 'nutrition' ? '#4caf50' : 
                        tip.type === 'monitoring' ? '#2196f3' : 
                        tip.type === 'weight' ? '#6a5acd' : 
                        tip.type === 'medication' ? '#9c27b0' : '#ff9800'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={openTipsModal}
            >
              <div className="tip-icon">
                {tip.icon}
              </div>
              <div>
                <p>{language === 'english' ? tip.message : tip.tagalog}</p>
              </div>
            </TipItem>
          ))}
        </div>
        <ViewAllButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openTipsModal}
        >
          {language === 'english' ? 'View More Tips' : 'Tingnan Pa ang Mga Tip'} <FiArrowRight />
        </ViewAllButton>
      </SectionContainer>

      {/* Treatment Guidance */}
      <SectionContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SectionHeader $iconColor="#6a5acd">
          <FiInfo className="header-icon" />
          <h3>{language === 'english' ? 'Treatment Guidance' : 'Gabay sa Treatment'}</h3>
        </SectionHeader>
        
        <div className="guidance-items">
          {treatmentGuidance.map((guidance, index) => (
            <GuidanceItem
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <h4>{guidance.icon} {language === 'english' ? guidance.title : guidance.tagalogTitle}</h4>
              <p>{language === 'english' ? guidance.content : guidance.tagalogContent}</p>
            </GuidanceItem>
          ))}
        </div>
      </SectionContainer>

      {/* Health Tips Modal */}
      <AnimatePresence>
        {isTipsModalOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTipsModal}
          >
            <ModalContainer
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <h3>
                  <FiInfo />
                  {language === 'english' ? 'Comprehensive Health Tips' : 'Mga Komprehensibong Health Tip'}
                </h3>
                <button onClick={closeTipsModal}>
                  <FiX />
                </button>
              </ModalHeader>
              <ModalContent>
                {enhancedHealthTips.map((tip, index) => (
                  <ModalTipItem 
                    key={index}
                    $iconColor={tip.type === 'nutrition' ? '#4caf50' : 
                              tip.type === 'monitoring' ? '#2196f3' : 
                              tip.type === 'weight' ? '#6a5acd' : 
                              tip.type === 'medication' ? '#9c27b0' : '#ff9800'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="tip-header">
                      {tip.icon}
                      <h4>{language === 'english' ? tip.message : tip.tagalog}</h4>
                    </div>
                    <p>{language === 'english' ? tip.details : tip.tagalogDetails}</p>
                  </ModalTipItem>
                ))}
              </ModalContent>
            </ModalContainer>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default HealthOverview;