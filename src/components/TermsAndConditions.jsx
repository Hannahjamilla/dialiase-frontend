import React, { useState } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const TermsAndConditions = ({ patient, onAgree }) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAgree = async () => {
    if (!accepted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/patient/accept-terms', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        onAgree();
      } else {
        setError(response.data.message || 'Failed to accept terms and conditions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while accepting terms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f8fc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#395886',
          color: 'white',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Terms and Conditions</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
            Please read and accept our terms and conditions to continue
          </p>
        </div>
        
        <div style={{ 
          padding: '24px', 
          maxHeight: '400px', 
          overflowY: 'auto',
          border: '1px solid #e1e5eb',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2>Welcome to DialiEase</h2>
          <p>
            By using our services, you agree to the following terms and conditions. Please read them carefully.
          </p>
          
          <h3>1. Patient Responsibilities</h3>
          <p>
            As a patient, you are responsible for providing accurate information about your health status, 
            following the treatment plans prescribed by your healthcare providers, and reporting any 
            adverse effects or concerns promptly.
          </p>
          
          <h3>2. Data Privacy</h3>
          <p>
            We are committed to protecting your personal health information. Your data will be stored 
            securely and will only be accessed by authorized healthcare professionals involved in your care.
          </p>
          
          <h3>3. Treatment Compliance</h3>
          <p>
            Regular dialysis treatment is essential for your health. You agree to adhere to your 
            prescribed treatment schedule and inform your care team of any difficulties you encounter.
          </p>
          
          <h3>4. Emergency Situations</h3>
          <p>
            In case of medical emergencies, please contact your healthcare provider immediately or 
            visit the nearest emergency room. This platform is not intended for emergency medical care.
          </p>
          
          <h3>5. Communication</h3>
          <p>
            You consent to receive important notifications, reminders, and health information through 
            this platform. Please ensure your contact information is always up to date.
          </p>
          
          <h3>6. Acceptance of Terms</h3>
          <p>
            By accepting these terms, you acknowledge that you have read, understood, and agree to 
            comply with all the conditions outlined above.
          </p>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            borderLeft: '4px solid #f44336',
            padding: '12px 16px',
            margin: '0 20px 20px 20px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiAlertCircle color="#f44336" />
            <span style={{ color: '#d32f2f' }}>{error}</span>
          </div>
        )}
        
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e1e5eb',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span>I have read and agree to the terms and conditions</span>
          </label>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              style={{
                padding: '10px 20px',
                border: '1px solid #dc3545',
                color: '#dc3545',
                backgroundColor: 'transparent',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiX /> Decline
            </button>
            
            <button
              onClick={handleAgree}
              disabled={!accepted || loading}
              style={{
                padding: '10px 20px',
                border: 'none',
                color: 'white',
                backgroundColor: accepted ? '#28a745' : '#6c757d',
                borderRadius: '6px',
                cursor: accepted ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <FiCheck /> Accept & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;