import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import PreTreatmentReminderModal from './PreTreatmentReminderModal';

Modal.setAppElement('#root');

const TreatmentEnd = () => {
  const navigate = useNavigate();
  const [treatmentData, setTreatmentData] = useState(null);
  const [formData, setFormData] = useState({
    drainFinished: '',
    volume: '',
    color: 'Clear',
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState({
    running: false,
    seconds: 0,
    minutes: 0,
    hours: 0
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [treatmentResult, setTreatmentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drainStartTime, setDrainStartTime] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [userName, setUserName] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [step, setStep] = useState(1); // 1: preparation, 2: draining, 3: completion
  const [currentWeight, setCurrentWeight] = useState(0);
  const [initialWeight, setInitialWeight] = useState(0);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [drainDetected, setDrainDetected] = useState(false);
  const [drainStartWeight, setDrainStartWeight] = useState(0);

  // Audio for drain completion
  const completionSound = new Audio('/sounds/completion.mp3');

  const playSound = (sound) => {
    try {
      sound.currentTime = 0;
      sound.play().catch(e => console.error('Audio play failed:', e));
    } catch (e) {
      console.error('Sound error:', e);
    }
  };

  // Load user data and saved timer from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUserName(`${userData.first_name} ${userData.last_name}`);
    }

    const savedTimer = localStorage.getItem('drainTimer');
    if (savedTimer) {
      setTimer(JSON.parse(savedTimer));
      setStep(2);
    } else {
      setShowReminderModal(true);
    }
  }, []);

  // Save timer to localStorage when it changes
  useEffect(() => {
    if (timer.running) {
      localStorage.setItem('drainTimer', JSON.stringify(timer));
    }
  }, [timer]);

  const fetchOngoingTreatment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/patient/treatments/ongoing', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data.has_ongoing) {
        toast.info('No ongoing treatment found');
        navigate('/patient/PatientDashboard');
        return;
      }

      setTreatmentData(response.data.treatment);
    } catch (error) {
      console.error('Error fetching ongoing treatment:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch ongoing treatment');
      navigate('/patient/PatientDashboard');
    }
  };

  useEffect(() => {
    fetchOngoingTreatment();
  }, [navigate]);

  // Check device connection and fetch weight data
  useEffect(() => {
    const checkDeviceConnection = async () => {
      try {
        const response = await axios.get('/iot/device-status');
        if (response.data.connected) {
          setDeviceConnected(true);
          setConnectionError(null);
        } else {
          setDeviceConnected(false);
          setConnectionError('IoT scale not connected. Please check connection.');
        }
      } catch (error) {
        console.error('Error checking device connection:', error);
        setDeviceConnected(false);
        setConnectionError('Failed to check device status');
      }
    };

    checkDeviceConnection();
    const connectionInterval = setInterval(checkDeviceConnection, 5000);

    return () => clearInterval(connectionInterval);
  }, []);

  // Fetch weight data periodically when device is connected
  useEffect(() => {
    if (!deviceConnected) return;

    const fetchWeightData = async () => {
      try {
        const response = await axios.get('/iot/weight');
        if (response.data && typeof response.data.weight !== 'undefined') {
          const weight = parseFloat(response.data.weight);
          if (!isNaN(weight)) {
            setCurrentWeight(weight);

            // Detect drainage start (weight increasing by 200ml/0.2kg)
            if (!drainDetected && weight > (initialWeight + 0.2)) {
              setDrainDetected(true);
              setDrainStartWeight(weight);
              if (!timer.running) {
                startStopTimer(); // Start timer automatically
                toast.info('Drainage detected. Timer started automatically.');
              }
            }

            // Detect drainage completion (weight decreasing back near initial)
            if (drainDetected && weight <= (drainStartWeight - 1.5)) {
              playSound(completionSound);
              toast.success('Drainage completed! Please stop the timer.');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching weight:', error);
      }
    };

    const weightInterval = setInterval(fetchWeightData, 2000);
    return () => clearInterval(weightInterval);
  }, [deviceConnected, timer.running, drainDetected, initialWeight, drainStartWeight]);

  // Set initial weight when treatment data loads
  useEffect(() => {
    if (treatmentData?.inSolution?.DeviceWeight) {
      setInitialWeight(parseFloat(treatmentData.inSolution.DeviceWeight));
    }
  }, [treatmentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const validateVolume = (volume) => {
  const vol = parseInt(volume);
  return !isNaN(vol); // Now just checks if it's a number, no range validation
};

  const validateForm = () => {
    const newErrors = {};
    if (!formData.drainFinished) newErrors.drainFinished = 'Drain finished time is required';
    if (!formData.volume) {
      newErrors.volume = 'Volume is required';
    } else if (!validateVolume(formData.volume)) {
      newErrors.volume = 'Volume must be between 1000-2500 mL';
    }
    if (!formData.color) newErrors.color = 'Color is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const startStopTimer = () => {
  if (!timer.running) {
    // Starting the timer
    setDrainStartTime(new Date());
    setStep(2);
  } else {
    // Stopping the timer - removed volume validation
    const now = new Date();
    const drainedVolume = Math.round(currentWeight * 1000); // Convert kg to ml
    
    setFormData(prev => ({
      ...prev,
      drainFinished: format(now, "yyyy-MM-dd'T'HH:mm"),
      volume: drainedVolume.toString()
    }));
    
    localStorage.removeItem('drainTimer');
    setStep(3);
    
    // Play completion sound
    playSound(completionSound);
    toast.success(`Drainage completed! Volume out: ${drainedVolume}ml`);
  }
  setTimer(prev => ({ ...prev, running: !prev.running }));
};

  useEffect(() => {
    let interval;
    if (timer.running) {
      interval = setInterval(() => {
        setTimer(prev => {
          let { seconds, minutes, hours } = prev;
          seconds++;
          if (seconds >= 60) {
            seconds = 0;
            minutes++;
          }
          if (minutes >= 60) {
            minutes = 0;
            hours++;
          }
          return { ...prev, seconds, minutes, hours };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.running]);

  const formatTimerValue = (value) => String(value).padStart(2, '0');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem("user"));

      if (!treatmentData || !treatmentData.Treatment_ID) {
        throw new Error('No ongoing treatment data available');
      }

      const response = await axios.post(
        '/patient/treatments/complete',
        {
          treatmentId: treatmentData.Treatment_ID,
          drainFinished: formData.drainFinished,
          volumeOut: parseInt(formData.volume),
          color: formData.color,
          notes: formData.note
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setTreatmentResult({
          volumeIn: treatmentData.inSolution?.VolumeIn || 0,
          volumeOut: formData.volume,
          Balances: response.data.Balances,
          patientName: userName || `${userData.first_name} ${userData.last_name}`,
          message: response.data.message
        });
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data.message || 'Failed to complete treatment');
      }
    } catch (error) {
      console.error('Error submitting treatment:', error);
      let errorMessage = 'Failed to complete treatment. Please try again.';
      
      if (error.response) {
        if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join('\n');
        } else {
          errorMessage = error.response.data.message || error.response.statusText;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/patient/PatientDashboard');
  };

  const handleReminderConfirm = () => {
    setShowReminderModal(false);
    setStep(1);
  };

  if (!treatmentData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',              
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <p style={{ marginTop: '20px', color: '#555' }}>Loading treatment data...</p>
      </div>
    );
  }

  return (
    <>
      <PreTreatmentReminderModal 
        isOpen={showReminderModal}
        onRequestClose={() => setShowReminderModal(false)}
        onConfirm={handleReminderConfirm}
      />

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onRequestClose={closeSuccessModal}
        style={{
          content: {
            width: '600px',
            maxWidth: '90%',
            margin: 'auto',
            borderRadius: '10px',
            padding: '0',
            border: 'none',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            animation: 'modalFadeIn 0.3s ease-out'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }
        }}
      >
        <div style={{
          padding: '25px'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#2ecc71',
              marginBottom: '15px'
            }}>Treatment Completed Successfully!</h2>
          </div>
          
          <div style={{
            marginBottom: '25px'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'inline-block',
                width: '80px',
                height: '80px',
                backgroundColor: '#e8f5e9',
                borderRadius: '50%',
                padding: '15px',
                marginBottom: '15px',
                animation: 'scaleIn 0.5s ease-out'
              }}>
                <svg viewBox="0 0 24 24" style={{
                  width: '100%',
                  height: '100%',
                  fill: '#2ecc71'
                }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p style={{
                color: '#555',
                lineHeight: '1.6'
              }}>Your peritoneal dialysis treatment has been successfully recorded.</p>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px',
                textAlign: 'left',
                animation: 'fadeInUp 0.5s ease-out'
              }}>
                <h3 style={{
                  color: '#333',
                  marginBottom: '10px'
                }}>Important Reminder</h3>
                <p style={{
                  color: '#555',
                  marginBottom: '8px'
                }}>Please remember to perform your next treatment tomorrow</p>
                <p style={{
                  color: '#555'
                }}>Maintain proper hygiene and follow all safety protocols.</p>
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#f1f8fe',
              padding: '15px',
              borderRadius: '8px',
              marginTop: '20px',
              animation: 'fadeInUp 0.5s ease-out'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#333'
                }}>Patient:</span>
                <span style={{
                  color: '#555'
                }}>{treatmentResult?.patientName}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#333'
                }}>Volume In:</span>
                <span style={{
                  color: '#555'
                }}>{treatmentResult?.volumeIn} mL</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#333'
                }}>Volume Out:</span>
                <span style={{
                  color: '#555'
                }}>{treatmentResult?.volumeOut} mL</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0'
              }}>
                <span style={{
                  fontWeight: '600',
                  color: '#333'
                }}>Balances:</span>
                <span style={{
                  color: '#555'
                }}>{treatmentResult?.Balances} mL</span>
              </div>
            </div>
          </div>
          
          <div style={{
            textAlign: 'center'
          }}>
            <button 
              onClick={closeSuccessModal}
              style={{
                backgroundColor: '#2ecc71',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#27ae60';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2ecc71';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </Modal>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        // marginTop: '120px',
        width: '380%',
        marginLeft: '-30%',
        marginTop: '210px',
        marginBottom: '30px',
      }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes highlight {
            0% { background-color: rgba(255, 255, 0, 0.3); }
            100% { background-color: transparent; }
          }
        `}</style>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '15px',
          borderBottom: '1px solid #eee',
         
        }}>
          <button 
            onClick={() => navigate('/patient/PatientDashboard')}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginRight: '20px',
              transition: 'all 0.2s',
              
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderColor = '#bbb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            &larr; Back to Dashboard
          </button>
          <h1 style={{
            margin: '0',
            color: '#333'
          }}>End Treatment</h1>
          {userName && (
            <div style={{
              marginLeft: 'auto',
              padding: '8px 15px',
              backgroundColor: '#f0f8ff',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#4682b4',
              animation: 'fadeInUp 0.5s ease-out'
            }}>
              {userName}
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '0',
            right: '0',
            height: '4px',
            backgroundColor: '#eee',
            zIndex: '1'
          }}></div>
          
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: '2'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: step >= stepNumber ? '#3498db' : '#eee',
                color: step >= stepNumber ? 'white' : '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                marginBottom: '8px',
                border: '3px solid white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                transition: 'all 0.3s',
                transform: step === stepNumber ? 'scale(1.1)' : 'scale(1)'
              }}>
                {stepNumber}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: step >= stepNumber ? '#3498db' : '#999',
                textAlign: 'center'
              }}>
                {stepNumber === 1 ? 'Preparation' : 
                 stepNumber === 2 ? 'Draining' : 'Completion'}
              </span>
            </div>
          ))}
        </div>

        {submitError && (
          <div style={{
            backgroundColor: '#fdecea',
            color: '#d32f2f',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeInUp 0.5s ease-out'
          }}>
            <svg style={{ width: '20px', height: '20px', fill: '#d32f2f' }} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {step === 1 && (
          <div style={{
            backgroundColor: '#fff9e6',
            padding: '25px',
            borderRadius: '8px',
            marginBottom: '30px',
            textAlign: 'center',
            animation: 'fadeInUp 0.5s ease-out'
          }}>
            <h2 style={{
              marginTop: '0',
              color: '#d35400'
            }}>Ready to Start Draining</h2>
            <p style={{
              color: '#555',
              marginBottom: '20px'
            }}>Please review the preparation checklist before starting the drain process.</p>
            
            {deviceConnected ? (
              <div style={{
                backgroundColor: '#e8f5e9',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <p style={{ margin: '0', color: '#2e7d32' }}>
                  <strong>IoT Scale Connected:</strong> Timer will start automatically when drainage begins.
                </p>
                <p style={{ margin: '10px 0 0', color: '#2e7d32' }}>
                  Current Weight: {currentWeight.toFixed(3)}kg ({Math.round(currentWeight * 1000)}ml)
                </p>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#ffebee',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <p style={{ margin: '0', color: '#c62828' }}>
                  <strong>IoT Scale Not Connected:</strong> You'll need to start the timer manually.
                </p>
              </div>
            )}
            
            <button
              type="button"
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              onClick={startStopTimer}
              disabled={isSubmitting || (deviceConnected && !drainDetected)}
              onMouseOver={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#2980b9';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }
              }}
              onMouseOut={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#3498db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                }
              }}
            >
              {deviceConnected ? 'Waiting for Drainage...' : 'Start Draining Process'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          opacity: step >= 2 ? 1 : 0.5,
          pointerEvents: step >= 2 ? 'auto' : 'none'
        }}>
          {/* Treatment Details Section */}
          <div style={{
            backgroundColor: '#f9f9f9',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            animation: step >= 2 ? 'fadeInUp 0.5s ease-out' : 'none'
          }}>
            <h2 style={{
              marginTop: '0',
              marginBottom: '20px',
              color: '#444',
              borderBottom: '1px solid #ddd',
              paddingBottom: '10px'
            }}>Treatment Details</h2>
            <div style={{
              marginBottom: '15px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#555'
              }}>Bag Serial Number</label>
              <div style={{
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {treatmentData.bagSerialNumber || 'N/A'}
              </div>
            </div>
            <div style={{
              marginBottom: '15px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#555'
              }}>Volume In</label>
              <div style={{
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {treatmentData.inSolution?.VolumeIn || 'N/A'} mL
              </div>
            </div>
            <div style={{
              marginBottom: '15px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#555'
              }}>PD Solution</label>
              <div style={{
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {treatmentData.inSolution?.Dialysate || 'N/A'} %
              </div>
            </div>
            <div style={{
              marginBottom: '15px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#555'
              }}>Dwell Time</label>
              <div style={{
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {treatmentData.inSolution?.Dwell || 'N/A'} hours
              </div>
            </div>
            <div style={{
              marginBottom: '15px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#555'
              }}>Start Time</label>
              <div style={{
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {treatmentData.inSolution?.InStarted ?
                  format(parseISO(treatmentData.inSolution.InStarted), 'MMM d, yyyy h:mm a') : 'N/A'}
              </div>
            </div>
            <div style={{
              marginBottom: '15px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: '600',
                color: '#555'
              }}>Finish Time</label>
              <div style={{
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                {treatmentData.inSolution?.InFinished ?
                  format(parseISO(treatmentData.inSolution.InFinished), 'MMM d, yyyy h:mm a') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Drain Information Section */}
          <div style={{
            backgroundColor: '#f9f9f9',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            animation: step >= 2 ? 'fadeInUp 0.5s ease-out' : 'none'
          }}>
            <h2 style={{
              marginTop: '0',
              marginBottom: '20px',
              color: '#444',
              borderBottom: '1px solid #ddd',
              paddingBottom: '10px'
            }}>Drain Information</h2>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '25px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                width: '100%',
                maxWidth: '300px',
                animation: step >= 2 ? 'pulse 2s infinite' : 'none'
              }}>
                <h3 style={{
                  marginTop: '0',
                  color: '#555'
                }}>Drain Timer</h3>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  margin: '15px 0',
                  fontFamily: 'monospace',
                  color: '#333'
                }}>
                  {formatTimerValue(timer.hours)}:
                  {formatTimerValue(timer.minutes)}:
                  {formatTimerValue(timer.seconds)}
                </div>
                <button
                  type="button"
                  style={{
                    backgroundColor: timer.running ? '#e74c3c' : '#2ecc71',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                  }}
                  onClick={startStopTimer}
                  disabled={isSubmitting}
                  onMouseOver={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = timer.running ? '#c0392b' : '#27ae60';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = timer.running ? '#e74c3c' : '#2ecc71';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {timer.running ? 'Stop Timer' : 'Start Timer'}
                </button>
              </div>
            </div>

            {deviceConnected && (
              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0', color: '#1565c0' }}>
                  <strong>IoT Scale Status:</strong> {deviceConnected ? 'Connected' : 'Disconnected'}
                </p>
                <p style={{ margin: '10px 0 0', color: '#1565c0' }}>
                  Current Weight: {currentWeight.toFixed(3)}kg ({Math.round(currentWeight * 1000)}ml)
                </p>
                {initialWeight > 0 && (
                  <p style={{ margin: '10px 0 0', color: '#1565c0' }}>
                    Drained: {Math.round((initialWeight - currentWeight) * 1000)}ml
                  </p>
                )}
              </div>
            )}

            <div style={{
              marginBottom: '20px',
              animation: step >= 3 ? 'highlight 1.5s ease-out' : 'none'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#555'
              }}>Drain Finished Time *</label>
              <input
                type="datetime-local"
                name="drainFinished"
                value={formData.drainFinished}
                onChange={handleInputChange}
                disabled={isSubmitting || !timer.running}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: errors.drainFinished ? '1px solid #e74c3c' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  transition: 'all 0.3s'
                }}
                aria-label="Drain finished time"
                aria-required="true"
                aria-invalid={!!errors.drainFinished}
              />
              {errors.drainFinished && <span style={{
                color: '#e74c3c',
                fontSize: '14px',
                marginTop: '5px',
                display: 'block'
              }}>{errors.drainFinished}</span>}
            </div>

            <div style={{
              marginBottom: '20px',
              animation: step >= 3 ? 'highlight 1.5s ease-out 0.3s' : 'none'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#555'
              }}>Volume Out (mL) *</label>
             <input
              type="number"
              name="volume"
              value={formData.volume}
              onChange={handleInputChange}
              min="1000"
              max="2500"
              placeholder="1000-2500 mL"
              disabled={isSubmitting || deviceConnected}
              style={{
                width: '100%',
                padding: '10px',
                border: errors.volume ? '1px solid #e74c3c' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                transition: 'all 0.3s'
              }}
              aria-label="Volume out"
              aria-required="true"
              aria-invalid={!!errors.volume}
            />
              {errors.volume && <span style={{
                color: '#e74c3c',
                fontSize: '14px',
                marginTop: '5px',
                display: 'block'
              }}>{errors.volume}</span>}
            </div>

            <div style={{
              marginBottom: '20px',
              animation: step >= 3 ? 'highlight 1.5s ease-out 0.6s' : 'none'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#555'
              }}>Solution Color *</label>
              <select
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                border: errors.color ? '1px solid #e74c3c' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: '#fff',
                transition: 'all 0.3s'
              }}
              aria-label="Solution color"
              aria-required="true"
              aria-invalid={!!errors.color}
            >
              <option value="Clear">Clear</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Reddish">Reddish</option>
            </select>
              {errors.color && <span style={{
                color: '#e74c3c',
                fontSize: '14px',
                marginTop: '5px',
                display: 'block'
              }}>{errors.color}</span>}
            </div>

            <div style={{
              marginBottom: '20px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#555'
              }}>Notes</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Any observations or notes about the treatment..."
                rows="3"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  minHeight: '100px',
                  transition: 'all 0.3s'
                }}
                aria-label="Treatment notes"
              />
            </div>
          </div>

          {step >= 3 && (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px',
              marginTop: '20px',
              animation: 'fadeInUp 0.5s ease-out'
            }}>
              <button
                type="button"
                onClick={() => navigate('/patient/PatientDashboard')}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ddd',
                  padding: '12px 25px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                disabled={isSubmitting}
                onMouseOver={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#e0e0e0';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: isSubmitting ? '#95a5a6' : '#3498db',
                  color: 'white',
                  border: 'none',
                  padding: '12px 25px',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.3s',
                  boxShadow: isSubmitting ? 'none' : '0 2px 5px rgba(0,0,0,0.2)'
                }}
                disabled={isSubmitting}
                onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#2980b9')}
                onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#3498db')}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></span>
                    Processing...
                  </>
                ) : 'End Treatment'}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default TreatmentEnd;