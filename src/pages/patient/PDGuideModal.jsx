import React from 'react';
import '../../css/PDGuideModal.css';
import { FiX, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const PDGuideModal = ({ onClose }) => {
  const pdInfo = {
    steps: [
      "1. Wash hands thoroughly before handling any equipment",
      "2. Check dialysis solution for clarity and expiration date",
      "3. Warm the solution to body temperature if needed",
      "4. Ensure clean environment to prevent infection",
      "5. Monitor for any pain or discomfort during exchange"
    ],
    warnings: [
      "Report cloudy dialysis solution immediately",
      "Watch for fever or abdominal pain - signs of peritonitis",
      "Ensure proper aseptic technique to prevent infection",
      "Monitor blood pressure during treatment"
    ],
    tips: [
      "Keep all supplies organized and within reach",
      "Record all treatment details for your healthcare team",
      "Maintain a consistent treatment schedule",
      "Stay hydrated between treatments"
    ]
  };

  return (
    <div className="pd-guide-modal-overlay">
      <div className="pd-guide-modal">
        <div className="pd-guide-header">
          <h3><FiInfo /> Peritoneal Dialysis Treatment Guide</h3>
          <button onClick={onClose} className="pd-guide-close-button">
            <FiX size={24} />
          </button>
        </div>

        <div className="pd-guide-content">
          <div className="pd-guide-intro">
            <p>Welcome to your dialysis treatment. This guide will help you through the process safely and effectively.</p>
            <div className="treatment-time-estimate">
              <div className="time-estimate-card">
                <div className="time-icon">⏱️</div>
                <div className="time-text">
                  <h4>Estimated Time</h4>
                  <p>30-40 minutes per exchange</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pd-guide-section">
            <h4 className="section-title steps-title">Step-by-Step Process</h4>
            <div className="step-cards">
              {pdInfo.steps.map((step, index) => (
                <div key={`step-${index}`} className="step-card">
                  <div className="step-number">{index + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pd-guide-section warning-section">
            <h4 className="section-title"><FiAlertTriangle /> Important Safety Warnings</h4>
            <ul>
              {pdInfo.warnings.map((warning, index) => (
                <li key={`warning-${index}`}>
                  <span className="warning-icon">⚠️</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>

          <div className="pd-guide-section tips-section">
            <h4 className="section-title"><FiCheckCircle /> Helpful Tips for Success</h4>
            <div className="tips-grid">
              {pdInfo.tips.map((tip, index) => (
                <div key={`tip-${index}`} className="tip-card">
                  <div className="tip-icon">💡</div>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="emergency-reminder">
            <h4><FiAlertTriangle /> Emergency Contact</h4>
            <p>If you experience severe symptoms like high fever, severe abdominal pain, or difficulty breathing, contact your healthcare provider immediately.</p>
          </div>
        </div>

        <div className="pd-guide-footer">
          <button onClick={onClose} className="pd-guide-confirm-button">
            I Understand, Begin Treatment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDGuideModal;