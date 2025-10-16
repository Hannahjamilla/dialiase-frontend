import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheck, FiHeart, FiAlertCircle, FiStar, FiClock, FiVolume2, FiVolumeX, FiAward } from 'react-icons/fi';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const CAPDQuizGame = ({ isOpen, onClose, colors, onDiscountEarned }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [animateQuestion, setAnimateQuestion] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [dailyTips, setDailyTips] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoProceed, setAutoProceed] = useState(true);
  const [discountEarned, setDiscountEarned] = useState(0);
  const [processing, setProcessing] = useState(false);
  
  const speechSynthesisRef = useRef(null);
  const currentUtteranceRef = useRef(null);

  // Enhanced questions with more detailed explanations and practical tips
  const questions = [
    {
      question: "What is the most important step before starting CAPD exchange?",
      options: [
        "Wash hands thoroughly and wear a mask",
        "Check blood pressure",
        "Take your medications",
        "Have a meal"
      ],
      correctAnswer: 0,
      explanation: "Proper hand hygiene and wearing a mask are crucial to prevent infections during CAPD exchanges. Wash hands for at least 60 seconds with antibacterial soap, dry with clean paper towels, and wear a surgical mask covering both nose and mouth.",
      practicalTip: "Keep your nails short and clean. Avoid jewelry during exchanges. Always perform exchanges in a clean, well-lit area away from pets and drafts.",
      emergencyInfo: "If you accidentally touch the connection site, stop immediately and contact your healthcare team."
    },
    {
      question: "How often should you check your exit site for signs of infection?",
      options: [
        "Once a week",
        "Every day during shower",
        "Only when it hurts",
        "Once a month"
      ],
      correctAnswer: 1,
      explanation: "Check your exit site daily for redness, swelling, tenderness, or drainage to catch infections early. Look for pus, crusting, or unusual discharge.",
      practicalTip: "Use a magnifying mirror for better visibility. Document any changes in a diary. Shower daily with antibacterial soap and secure the catheter during bathing.",
      emergencyInfo: "If you notice pus, increasing redness, fever, or pain at the site, contact your healthcare team immediately."
    },
    {
      question: "What should you do if your dialysis fluid looks cloudy?",
      options: [
        "Use it as normal",
        "Contact your healthcare team immediately",
        "Shake the bag and use it",
        "Wait and see if it clears up"
      ],
      correctAnswer: 1,
      explanation: "Cloudy dialysis fluid may indicate peritonitis - a serious infection. Contact your healthcare team right away as this requires immediate medical attention.",
      practicalTip: "Always check fluid clarity before infusion. Keep a sample of cloudy fluid in a clean container for testing. Note any abdominal pain or fever.",
      emergencyInfo: "Peritonitis requires prompt antibiotic treatment. Delayed treatment can lead to serious complications."
    },
    {
      question: "Which of these foods should CKD patients typically limit?",
      options: [
        "Fresh fruits and vegetables",
        "Potassium-rich foods like bananas and potatoes",
        "All types of bread",
        "Water and fluids only"
      ],
      correctAnswer: 1,
      explanation: "CKD patients often need to limit high-potassium foods (bananas, potatoes, tomatoes, oranges) and high-phosphorus foods (dairy, nuts, beans) to prevent dangerous blood levels.",
      practicalTip: "Soak potatoes before cooking to reduce potassium. Choose apples, berries, and green beans instead of high-potassium options. Work with a renal dietitian.",
      emergencyInfo: "High potassium can cause irregular heartbeat. Watch for muscle weakness, numbness, or palpitations."
    },
    {
      question: "What is the recommended position during CAPD drain phase?",
      options: [
        "Standing up and walking around",
        "Sitting upright or lying down",
        "Exercising lightly",
        "Bending forward frequently"
      ],
      correctAnswer: 1,
      explanation: "Sitting upright or lying down helps the fluid drain completely from your abdomen. Changing positions slightly can help improve drainage if it's slow.",
      practicalTip: "If drainage is slow, try turning from side to side, coughing gently, or massaging your abdomen. Ensure the drainage bag is lower than your abdomen.",
      emergencyInfo: "Persistent poor drainage may indicate catheter problems - contact your healthcare team."
    },
    {
      question: "How should you store your CAPD supplies?",
      options: [
        "Anywhere with space",
        "In a clean, dry area at room temperature",
        "In direct sunlight to keep warm",
        "In a damp bathroom cabinet"
      ],
      correctAnswer: 1,
      explanation: "Store supplies in a clean, dry area at room temperature (15-30°C). Avoid direct sunlight, moisture, and extreme temperatures that can damage the solutions.",
      practicalTip: "Designate a specific storage area. Rotate supplies using first-in-first-out method. Check expiration dates regularly.",
      emergencyInfo: "Never use solutions that are cloudy, expired, or have damaged packaging."
    },
    {
      question: "What is the maximum time dialysate should remain in your abdomen?",
      options: [
        "2-4 hours",
        "4-8 hours depending on prescription",
        "12 hours or more",
        "As long as convenient"
      ],
      correctAnswer: 1,
      explanation: "Dwell times typically range from 4-8 hours depending on your prescription. Longer dwells can lead to glucose absorption and less effective clearance.",
      practicalTip: "Set alarms to remind you of exchange times. Keep a log of exchange times and any symptoms. Follow your prescribed schedule strictly.",
      emergencyInfo: "Significantly prolonged dwell times can lead to fluid overload or inadequate clearance."
    },
    {
      question: "What should you do if you experience severe abdominal pain during exchange?",
      options: [
        "Ignore it and continue",
        "Take pain medication and wait",
        "Stop the exchange and contact your healthcare team",
        "Increase the flow rate to finish faster"
      ],
      correctAnswer: 2,
      explanation: "Severe abdominal pain during exchange could indicate peritonitis, catheter problems, or other complications. Stop immediately and seek medical advice.",
      practicalTip: "Keep your healthcare team's emergency contact numbers readily available. Note the characteristics of the pain (sharp, dull, cramping) for accurate reporting.",
      emergencyInfo: "Severe pain with fever, nausea, or cloudy fluid requires immediate medical attention."
    },
    {
      question: "How can you prevent fluid overload between exchanges?",
      options: [
        "Drink more water",
        "Follow fluid restrictions and monitor weight daily",
        "Skip exchanges when busy",
        "Use stronger dialysis solution always"
      ],
      correctAnswer: 1,
      explanation: "Monitor your weight daily at the same time and follow prescribed fluid restrictions. Sudden weight gain may indicate fluid overload.",
      practicalTip: "Weigh yourself each morning after emptying your bladder. Use smaller cups for drinking. Suck on ice chips instead of drinking large amounts.",
      emergencyInfo: "Fluid overload can cause breathing difficulties and heart problems. Contact your team if you gain more than 2kg in 24 hours."
    },
    {
      question: "What is the purpose of using different strength dialysis solutions?",
      options: [
        "For variety in treatment",
        "To remove different amounts of fluid based on needs",
        "Because some are cheaper",
        "To prevent boredom"
      ],
      correctAnswer: 1,
      explanation: "Different strength solutions (1.5%, 2.5%, 4.25% dextrose) remove different amounts of fluid. Stronger solutions remove more fluid but are used cautiously.",
      practicalTip: "Follow your prescribed solution strengths exactly. Record which strength you use and how much fluid is removed. Report significant changes to your team.",
      emergencyInfo: "Using the wrong strength solution can lead to dehydration or fluid overload. Always verify the solution before use."
    }
  ];

  // Daily care tips for CAPD patients
  const careTips = [
    "Weigh yourself daily at the same time to monitor fluid status",
    "Check blood pressure as recommended by your healthcare team",
    "Keep emergency contact numbers readily available",
    "Maintain a stock of extra supplies for emergencies",
    "Record your intake and output measurements daily",
    "Inspect all supplies for damage before use",
    "Always have a backup plan for exchanges when away from home",
    "Attend all scheduled medical appointments",
    "Carry your CAPD patient identification card at all times",
    "Practice proper exit site care as taught by your nurse"
  ];

  // Stop speech function
  const stopSpeech = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  };

  // Initialize text-to-speech
  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    
    // Get daily tips on component mount
    const shuffledTips = [...careTips].sort(() => 0.5 - Math.random()).slice(0, 3);
    setDailyTips(shuffledTips);

    return () => {
      // Clean up speech synthesis
      stopSpeech();
    };
  }, []);

  // Text-to-speech function
  const speakText = (text, rate = 0.8, onEnd = null) => {
    if (!speechEnabled || !speechSynthesisRef.current) return;

    // Cancel any ongoing speech
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Get available voices and try to use a pleasant one
    const voices = speechSynthesisRef.current.getVoices();
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Karen') || voice.name.includes('Samantha'))
    );
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      currentUtteranceRef.current = utterance;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      if (onEnd) onEnd();
    };

    speechSynthesisRef.current.speak(utterance);
  };

  // Toggle speech functionality
  const toggleSpeech = () => {
    if (speechEnabled) {
      stopSpeech();
    }
    setSpeechEnabled(!speechEnabled);
  };

  useEffect(() => {
    let timer;
    if (gameStatus === 'playing' && timeLeft > 0 && !showResult && !isSpeaking) {
      timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult && !isSpeaking) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [timeLeft, gameStatus, showResult, isSpeaking]);

  useEffect(() => {
    if (gameStatus === 'playing') {
      setAnimateQuestion(true);
      const timer = setTimeout(() => setAnimateQuestion(false), 500);
      
      // Speak the question when it changes
      if (speechEnabled) {
        setTimeout(() => {
          speakText(`Question ${currentQuestion + 1}: ${questions[currentQuestion].question}`);
        }, 600);
      }
      
      return () => {
        clearTimeout(timer);
        stopSpeech();
      };
    }
  }, [currentQuestion, gameStatus]);

  const completeGame = async () => {
    setProcessing(true);
    
    // Calculate discount based on performance (10 points per question)
    const performancePercentage = (score / 100) * 100;
    
    // Award 5% discount if they score 80% or higher
    const discount = performancePercentage >= 80 ? 5 : 0;
    setDiscountEarned(discount);

    try {
      // Store discount in localStorage instead of database
      if (discount > 0) {
        const discountData = {
          discount: discount,
          earnedAt: new Date().toISOString(),
          quizScore: score,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        localStorage.setItem('capd_quiz_discount', JSON.stringify(discountData));
        
        // Notify parent component about discount
        if (onDiscountEarned) {
          onDiscountEarned(discount);
        }
      }
    } catch (error) {
      console.error('Error storing discount:', error);
    } finally {
      setProcessing(false);
      setGameStatus('completed');
    }
  };

  const startGame = () => {
    stopSpeech();
    setScore(0);
    setCurrentQuestion(0);
    setGameStatus('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setDiscountEarned(0);
    
    // Speak welcome message
    if (speechEnabled) {
      setTimeout(() => {
        speakText("Welcome to the CAPD Care Quiz. Answer 10 questions correctly to earn a 5% discount on your medical supplies!");
      }, 500);
    }
  };

  const proceedToNextQuestion = () => {
    stopSpeech();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      completeGame();
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || isSpeaking) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    stopSpeech();

    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 10); // 10 points per question
    }

    // Speak the answer and explanation
    if (speechEnabled) {
      const feedback = isCorrect 
        ? "Correct! " + questions[currentQuestion].explanation
        : "Incorrect. " + questions[currentQuestion].explanation;
      
      speakText(feedback, 0.8, () => {
        if (autoProceed) {
          setTimeout(proceedToNextQuestion, 1000);
        }
      });
    } else if (autoProceed) {
      setTimeout(proceedToNextQuestion, 4000);
    }
  };

  const handleTimeUp = () => {
    if (isSpeaking) return;
    
    setSelectedAnswer(-1);
    setShowResult(true);
    stopSpeech();
    
    if (speechEnabled) {
      speakText("Time's up! " + questions[currentQuestion].explanation, 0.8, () => {
        if (autoProceed) {
          setTimeout(proceedToNextQuestion, 1000);
        }
      });
    } else if (autoProceed) {
      setTimeout(proceedToNextQuestion, 3000);
    }
  };

  const speakQuestion = () => {
    speakText(questions[currentQuestion].question);
  };

  const skipSpeech = () => {
    stopSpeech();
    if (showResult && autoProceed) {
      proceedToNextQuestion();
    }
  };

  const getAnswerStyle = (answerIndex) => {
    const baseStyle = {
      padding: '1.2rem 1.5rem',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      textAlign: 'left',
      transition: 'all 0.3s ease',
      width: '100%',
      cursor: (selectedAnswer !== null || isSpeaking) ? 'default' : 'pointer',
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center'
    };

    if (!showResult) {
      return {
        ...baseStyle,
        backgroundColor: colors.white,
        border: `2px solid ${colors.border}`,
        color: colors.text,
        ':hover': {
          transform: (selectedAnswer === null && !isSpeaking) ? 'translateY(-2px)' : 'none',
          borderColor: (selectedAnswer === null && !isSpeaking) ? colors.primary : colors.border
        }
      };
    }

    if (answerIndex === questions[currentQuestion].correctAnswer) {
      return {
        ...baseStyle,
        backgroundColor: `${colors.success}15`,
        border: `2px solid ${colors.success}`,
        color: colors.success
      };
    }
    
    if (answerIndex === selectedAnswer && answerIndex !== questions[currentQuestion].correctAnswer) {
      return {
        ...baseStyle,
        backgroundColor: `${colors.alert}15`,
        border: `2px solid ${colors.alert}`,
        color: colors.alert
      };
    }
    
    return {
      ...baseStyle,
      backgroundColor: colors.white,
      border: `2px solid ${colors.border}`,
      color: colors.textMuted,
      opacity: 0.6
    };
  };

  const resetGame = () => {
    stopSpeech();
    setCurrentQuestion(0);
    setScore(0);
    setGameStatus('idle');
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setDiscountEarned(0);
    setProcessing(false);
  };

  const handleClose = () => {
    resetGame();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '20px',
        padding: '2.5rem',
        width: '98%',
        maxWidth: '1200px',
        maxHeight: '95vh',
        overflow: 'auto',
        border: `2px solid ${colors.border}`,
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: `2px solid ${colors.border}`
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              color: colors.primary,
              fontSize: '2rem',
              fontWeight: '800'
            }}>
              CAPD Care Quiz
            </h2>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: colors.textMuted,
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Score 80% or higher to earn 5% discount on medical supplies!
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isSpeaking && (
              <button
                onClick={skipSpeech}
                style={{
                  background: 'none',
                  border: `2px solid ${colors.alert}`,
                  fontSize: '0.8rem',
                  color: colors.alert,
                  cursor: 'pointer',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}
              >
                Skip
              </button>
            )}
            <button
              onClick={toggleSpeech}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.3rem',
                color: speechEnabled ? colors.primary : colors.textMuted,
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={speechEnabled ? "Disable voice" : "Enable voice"}
            >
              {speechEnabled ? <FiVolume2 /> : <FiVolumeX />}
            </button>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: colors.textMuted,
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px'
              }}
            >
              <FiX />
            </button>
          </div>
        </div>

        {gameStatus === 'idle' && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DotLottieReact
                src="https://lottie.host/728033bf-8d99-423b-843f-15c623f86007/bIdnCdkKNw.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <h3 style={{
              color: colors.primary,
              marginBottom: '1rem',
              fontSize: '1.8rem',
              fontWeight: '800'
            }}>
              CAPD Patient Education Center
            </h3>
            <p style={{
              color: colors.textMuted,
              marginBottom: '2rem',
              fontSize: '1.1rem',
              lineHeight: '1.5',
              maxWidth: '800px',
              margin: '0 auto 2rem'
            }}>
              Test your knowledge about CAPD procedures and CKD management. Answer 10 questions correctly to earn a <strong style={{ color: colors.accent }}>5% discount</strong> on your medical supplies!
            </p>
            
            {/* Discount Banner */}
            <div style={{
              backgroundColor: `${colors.accent}15`,
              border: `2px solid ${colors.accent}30`,
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <FiAward size={24} color={colors.accent} />
                <span style={{ fontWeight: '700', color: colors.accent, fontSize: '1.2rem' }}>
                  Discount Reward: 5% OFF
                </span>
              </div>
              <p style={{ margin: 0, color: colors.textMuted, fontSize: '0.9rem' }}>
                Score 80% or higher (8 out of 10 questions correct) to unlock your discount
              </p>
            </div>

            {/* Daily Care Tips */}
            <div style={{
              backgroundColor: colors.subtle,
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              textAlign: 'left',
              maxWidth: '800px',
              margin: '0 auto 2rem'
            }}>
              <h4 style={{ 
                color: colors.primary, 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.3rem'
              }}>
                <FiStar />
                Today's Care Reminders:
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1rem', 
                color: colors.textMuted,
                lineHeight: '1.6',
                fontSize: '1rem'
              }}>
                {dailyTips.map((tip, index) => (
                  <li key={index} style={{ marginBottom: '0.8rem' }}>{tip}</li>
                ))}
              </ul>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
              maxWidth: '900px',
              margin: '0 auto 2rem'
            }}>
              <div style={{
                backgroundColor: `${colors.success}15`,
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: colors.success, marginBottom: '0.8rem' }}>
                  Infection Prevention
                </div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                  Learn proper techniques to avoid peritonitis
                </div>
              </div>
              
              <div style={{
                backgroundColor: `${colors.primary}15`,
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: colors.primary, marginBottom: '0.8rem' }}>
                  Daily Routine
                </div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                  Master your exchange procedure
                </div>
              </div>
              
              <div style={{
                backgroundColor: `${colors.accent}15`,
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: colors.accent, marginBottom: '0.8rem' }}>
                  Emergency Signs
                </div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
                  Recognize when to seek help
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoProceed}
                  onChange={(e) => setAutoProceed(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
                  Auto-proceed to next question
                </span>
              </label>
            </div>

            <button
              onClick={startGame}
              style={{
                backgroundColor: colors.warning,
                color: colors.white,
                border: 'none',
                padding: '1.2rem 3rem',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: `0 8px 25px ${colors.warning}50`,
                marginBottom: '1rem'
              }}
            >
              Start Quiz & Earn 5% Off
            </button>
            
            <div style={{ fontSize: '0.9rem', color: colors.textMuted }}>
              Voice guidance is {speechEnabled ? 'enabled' : 'disabled'} - click speaker icon to toggle
            </div>
          </div>
        )}

        {gameStatus === 'playing' && (
          <div>
            {/* Progress and Score */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: colors.subtle,
              borderRadius: '12px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  QUESTION
                </div>
                <div style={{ color: colors.primary, fontSize: '1.3rem', fontWeight: '800' }}>
                  {currentQuestion + 1} / {questions.length}
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: timeLeft < 10 ? colors.alert : colors.primary,
                  fontSize: '1.5rem', 
                  fontWeight: '800',
                  fontFamily: 'monospace'
                }}>
                  <FiClock />
                  {timeLeft}s
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                  SCORE
                </div>
                <div style={{ color: colors.primary, fontSize: '1.8rem', fontWeight: '800' }}>
                  {score}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              backgroundColor: colors.border,
              borderRadius: '8px',
              height: '8px',
              marginBottom: '2.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                backgroundColor: colors.primary,
                height: '100%',
                transition: 'width 0.5s ease',
                borderRadius: '8px'
              }} />
            </div>

            {/* Question */}
            <div style={{
              backgroundColor: colors.subtle,
              padding: '2.5rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: `2px solid ${colors.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{
                  color: colors.primary,
                  margin: 0,
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  lineHeight: '1.4',
                  flex: 1
                }}>
                  {questions[currentQuestion].question}
                </h3>
                <button
                  onClick={speakQuestion}
                  disabled={isSpeaking}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.3rem',
                    color: isSpeaking ? colors.textMuted : colors.primary,
                    cursor: isSpeaking ? 'default' : 'pointer',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    opacity: isSpeaking ? 0.6 : 1
                  }}
                  title="Read question aloud"
                >
                  <FiVolume2 />
                </button>
              </div>

              {/* Answers */}
              <div style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}>
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    style={getAnswerStyle(index)}
                    disabled={selectedAnswer !== null || isSpeaking}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: colors.white,
                        border: `2px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span style={{ fontSize: '1rem', lineHeight: '1.4', textAlign: 'left', flex: 1 }}>
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation and Practical Tips */}
            {showResult && (
              <div style={{
                backgroundColor: selectedAnswer === questions[currentQuestion].correctAnswer ? 
                  `${colors.success}15` : `${colors.alert}15`,
                padding: '2rem',
                borderRadius: '12px',
                border: `2px solid ${selectedAnswer === questions[currentQuestion].correctAnswer ? 
                  colors.success : colors.alert}`,
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  marginBottom: '1.5rem',
                  color: selectedAnswer === questions[currentQuestion].correctAnswer ? 
                    colors.success : colors.alert,
                  fontWeight: '700',
                  fontSize: '1.1rem'
                }}>
                  {selectedAnswer === questions[currentQuestion].correctAnswer ? (
                    <>
                      <FiCheck />
                      Correct! +10 points! 🎉
                    </>
                  ) : selectedAnswer === -1 ? (
                    <>
                      <FiAlertCircle />
                      Time's Up! Remember this tip! ⏰
                    </>
                  ) : (
                    <>
                      <FiAlertCircle />
                      Important reminder! 💡
                    </>
                  )}
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    fontWeight: '700', 
                    color: colors.text, 
                    marginBottom: '0.8rem',
                    fontSize: '1.1rem'
                  }}>
                    Explanation:
                  </div>
                  <p style={{
                    margin: 0,
                    color: colors.text,
                    lineHeight: '1.5',
                    fontSize: '1rem'
                  }}>
                    {questions[currentQuestion].explanation}
                  </p>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ 
                    fontWeight: '700', 
                    color: colors.primary, 
                    marginBottom: '0.8rem',
                    fontSize: '1.1rem'
                  }}>
                    Practical Tip:
                  </div>
                  <p style={{
                    margin: 0,
                    color: colors.text,
                    lineHeight: '1.5',
                    fontSize: '1rem'
                  }}>
                    {questions[currentQuestion].practicalTip}
                  </p>
                </div>
                
                <div>
                  <div style={{ 
                    fontWeight: '700', 
                    color: colors.alert, 
                    marginBottom: '0.8rem',
                    fontSize: '1.1rem'
                  }}>
                    Emergency Information:
                  </div>
                  <p style={{
                    margin: 0,
                    color: colors.text,
                    lineHeight: '1.5',
                    fontSize: '1rem'
                  }}>
                    {questions[currentQuestion].emergencyInfo}
                  </p>
                </div>

                {!autoProceed && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '1.5rem',
                    paddingTop: '1.5rem',
                    borderTop: `1px solid ${colors.border}`
                  }}>
                    <button
                      onClick={proceedToNextQuestion}
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                        border: 'none',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Next Question →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Question Progress Dots */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.8rem',
              marginBottom: '0.5rem'
            }}>
              {questions.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 
                      index === currentQuestion ? colors.primary :
                      index < currentQuestion ? colors.success : colors.border,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {gameStatus === 'completed' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '150px',
              height: '150px',
              margin: '0 auto 1.5rem'
            }}>
              <DotLottieReact
                src="https://lottie.host/728033bf-8d99-423b-843f-15c623f86007/bIdnCdkKNw.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
            <h3 style={{
              color: score >= 80 ? colors.success : colors.primary,
              marginBottom: '1rem',
              fontSize: '2.2rem',
              fontWeight: '800'
            }}>
              {score >= 80 ? 'Congratulations!' : 'Great Effort!'}
            </h3>
            
            <div style={{
              fontSize: '1.1rem',
              color: colors.textMuted,
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              {score >= 80 
                ? 'You have demonstrated excellent knowledge of CAPD care and earned a discount!'
                : 'Keep learning and practicing your CAPD care techniques.'
              }
            </div>

            {/* Score Display */}
            <div style={{
              backgroundColor: colors.subtle,
              padding: '2.5rem',
              borderRadius: '16px',
              marginBottom: '2.5rem',
              border: `2px solid ${score >= 80 ? colors.success : colors.border}`
            }}>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: '800',
                color: score >= 80 ? colors.success : colors.primary,
                marginBottom: '0.5rem'
              }}>
                {score}%
              </div>
              <div style={{
                color: colors.textMuted,
                fontSize: '1.1rem',
                marginBottom: '1.5rem'
              }}>
                Final Score
              </div>
              
              <div style={{
                display: 'inline-block',
                backgroundColor: score >= 80 ? colors.success : colors.primary,
                color: colors.white,
                padding: '0.5rem 1.5rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                {score >= 80 ? 'Discount Unlocked! 🎊' : `${10 - (score / 10)} more correct answers needed for discount`}
              </div>
            </div>

            {/* Discount Award Section */}
            {discountEarned > 0 && (
              <div style={{
                backgroundColor: `${colors.accent}15`,
                border: `2px solid ${colors.accent}`,
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
                maxWidth: '500px',
                margin: '0 auto 2rem'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <FiAward size={32} color={colors.accent} />
                  <span style={{ fontWeight: '800', color: colors.accent, fontSize: '1.5rem' }}>
                    {discountEarned}% Discount Earned!
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: colors.text, 
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  Your {discountEarned}% discount has been saved and will be automatically applied 
                  to your next medical supplies purchase in the checkout.
                </p>
              </div>
            )}

            {/* Performance Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2.5rem',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{
                backgroundColor: `${colors.success}15`,
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: colors.success, marginBottom: '0.5rem' }}>
                  {score / 10}/10
                </div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600' }}>
                  Correct Answers
                </div>
              </div>
              
              <div style={{
                backgroundColor: `${colors.primary}15`,
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: colors.primary, marginBottom: '0.5rem' }}>
                  {Math.round((score / 100) * 100)}%
                </div>
                <div style={{ fontSize: '0.9rem', color: colors.textMuted, fontWeight: '600' }}>
                  Success Rate
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={startGame}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiHeart />
                Play Again
              </button>
              
              <button
                onClick={handleClose}
                style={{
                  backgroundColor: 'transparent',
                  color: colors.textMuted,
                  border: `2px solid ${colors.border}`,
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close Quiz
              </button>
            </div>

            {/* Motivational Message */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: colors.subtle,
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '2rem auto 0'
            }}>
              <p style={{
                margin: 0,
                color: colors.textMuted,
                fontSize: '0.95rem',
                lineHeight: '1.5',
                fontStyle: 'italic'
              }}>
                {score >= 80 
                  ? "Your dedication to learning proper CAPD care techniques is commendable. Continue practicing safe procedures to maintain your health and well-being."
                  : "CAPD care requires consistent practice and learning. Review the educational materials and try again to improve your knowledge and earn your discount."
                }
              </p>
            </div>
          </div>
        )}

        {processing && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '20px',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: `4px solid ${colors.border}`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              color: colors.primary,
              fontWeight: '600',
              fontSize: '1.1rem'
            }}>
              Processing your results...
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CAPDQuizGame;