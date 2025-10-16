import React from 'react';
import { 
  FaInfoCircle, FaStar, FaRegStar, FaPlus 
} from 'react-icons/fa';
import { MdOutlineDescription, MdWarning } from 'react-icons/md';

const MedicineInfoView = ({ 
  medicine, 
  onBack, 
  onAddMedicine, 
  fontSize, 
  darkMode,
  isFavorite,
  onToggleFavorite
}) => (
  <div className={`medicine-info-view ${darkMode ? 'dark-mode' : ''}`}>
    <div className="info-header">
      <div className="header-left">
        <FaInfoCircle className="header-icon" />
        <h3 style={{ fontSize: `calc(${fontSize}px * 1.15)` }}>Medicine Information</h3>
      </div>
      <div className="header-right">
        <button 
          onClick={() => onToggleFavorite(medicine.name)}
          className="favorite-button"
        >
          {isFavorite ? (
            <FaStar className="favorite-icon active" />
          ) : (
            <FaRegStar className="favorite-icon" />
          )}
          {isFavorite ? 'Saved' : 'Save'}
        </button>
        <button 
          onClick={onBack}
          className="back-button"
          style={{ fontSize: `calc(${fontSize}px * 0.9)` }}
        >
          Back to Search
        </button>
      </div>
    </div>
    
    <div className="medicine-details">
      <div className="medicine-title">
        <h4 style={{ fontSize: `calc(${fontSize}px * 1.1)` }}>
          {medicine.name} <span className="generic-name">({medicine.genericName})</span>
        </h4>
        <button 
          onClick={onAddMedicine}
          className="add-from-info-button"
          style={{ fontSize: `calc(${fontSize}px * 0.9)` }}
        >
          <FaPlus /> Add to Prescription
        </button>
      </div>
      
      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-label">Dosage Form:</div>
          <div>{medicine.dosageForm}</div>
        </div>
        
        <div className="detail-card">
          <div className="detail-label">Route:</div>
          <div>{medicine.route}</div>
        </div>
        
        <div className="detail-card">
          <div className="detail-label">Manufacturer:</div>
          <div>{medicine.manufacturer}</div>
        </div>
        
        <div className="detail-card">
          <div className="detail-label">DEA Schedule:</div>
          <div>{medicine.deaSchedule}</div>
        </div>
        
        <div className="detail-card">
          <div className="detail-label">Pregnancy Category:</div>
          <div>{medicine.pregnancyCategory}</div>
        </div>
      </div>
      
      {medicine.description && (
        <div className="detail-section">
          <div className="section-header">
            <MdOutlineDescription className="section-icon" />
            <h5>Description</h5>
          </div>
          <p>{medicine.description}</p>
        </div>
      )}
      
      {medicine.mechanismOfAction && (
        <div className="detail-section">
          <div className="section-header">
            <FaInfoCircle className="section-icon" />
            <h5>Mechanism of Action</h5>
          </div>
          <p>{medicine.mechanismOfAction}</p>
        </div>
      )}
      
      {medicine.activeIngredients.length > 0 && (
        <div className="detail-section">
          <div className="section-header">
            <FaInfoCircle className="section-icon" />
            <h5>Active Ingredients</h5>
          </div>
          <ul>
            {medicine.activeIngredients.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
        </div>
      )}
      
      {medicine.indications && (
        <div className="detail-section">
          <div className="section-header">
            <FaInfoCircle className="section-icon" />
            <h5>Indications</h5>
          </div>
          <p>{Array.isArray(medicine.indications) ? medicine.indications.join(' ') : medicine.indications}</p>
        </div>
      )}
      
      {medicine.warnings.length > 0 && (
        <div className="detail-section warnings">
          <div className="section-header">
            <MdWarning className="section-icon" />
            <h5>Warnings</h5>
          </div>
          <ul>
            {medicine.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {medicine.adverseEffects.length > 0 && (
        <div className="detail-section adverse-effects">
          <div className="section-header">
            <MdWarning className="section-icon" />
            <h5>Adverse Effects</h5>
          </div>
          <ul>
            {medicine.adverseEffects.map((effect, idx) => (
              <li key={idx}>{effect}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
    
    <style jsx>{`
      .medicine-info-view {
        padding: 20px;
        flex: 1;
        overflow: auto;
        background-color: #f9f9f9;
      }
      
      .dark-mode.medicine-info-view {
        background-color: #1a202c;
      }
      
      .info-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      
      .dark-mode .info-header {
        border-bottom-color: #4a5568;
      }
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .header-icon {
        font-size: calc(${fontSize}px * 1.4);
        color: #3182ce;
      }
      
      .dark-mode .header-icon {
        color: #63b3ed;
      }
      
      .favorite-button {
        padding: 8px 16px;
        background-color: rgba(0, 0, 0, 0.05);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: calc(${fontSize}px * 0.85);
      }
      
      .dark-mode .favorite-button {
        background-color: rgba(255, 255, 255, 0.1);
        color: #e2e8f0;
      }
      
      .favorite-icon {
        font-size: calc(${fontSize}px * 0.9);
      }
      
      .favorite-icon.active {
        color: #f6e05e;
      }
      
      .back-button {
        padding: 8px 16px;
        background-color: #3182ce;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .dark-mode .back-button {
        background-color: #2c5282;
      }
      
      .back-button:hover {
        background-color: #2c5282;
      }
      
      .dark-mode .back-button:hover {
        background-color: #1a365d;
      }
      
      .medicine-details {
        background-color: white;
        border-radius: 10px;
        padding: 25px;
        border: 1px solid #eee;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      
      .dark-mode .medicine-details {
        background-color: #2d3748;
        border-color: #4a5568;
      }
      
      .medicine-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #eee;
      }
      
      .dark-mode .medicine-title {
        border-bottom-color: #4a5568;
      }
      
      .medicine-title h4 {
        margin: 0;
        color: #2c3e50;
      }
      
      .dark-mode .medicine-title h4 {
        color: #e2e8f0;
      }
      
      .generic-name {
        font-weight: normal;
        color: #718096;
        font-size: calc(${fontSize}px * 0.9);
      }
      
      .add-from-info-button {
        padding: 10px 16px;
        background-color: #38a169;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .dark-mode .add-from-info-button {
        background-color: #2f855a;
      }
      
      .add-from-info-button:hover {
        background-color: #2f855a;
      }
      
      .dark-mode .add-from-info-button:hover {
        background-color: #276749;
      }
      
      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .detail-card {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 12px;
        border-left: 4px solid #3182ce;
      }
      
      .dark-mode .detail-card {
        background-color: #4a5568;
        border-left-color: #63b3ed;
      }
      
      .detail-label {
        font-weight: 500;
        color: #4a5568;
        margin-bottom: 5px;
        font-size: calc(${fontSize}px * 0.85);
      }
      
      .dark-mode .detail-label {
        color: #cbd5e0;
      }
      
      .detail-section {
        margin-top: 25px;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        color: #2c3e50;
      }
      
      .dark-mode .section-header {
        color: #e2e8f0;
      }
      
      .section-icon {
        font-size: calc(${fontSize}px * 1.1);
      }
      
      .detail-section h5 {
        margin: 0;
        font-size: calc(${fontSize}px * 1.05);
      }
      
      .detail-section p {
        margin: 0 0 0 30px;
        line-height: 1.6;
        font-size: calc(${fontSize}px * 0.95);
        color: #4a5568;
      }
      
      .dark-mode .detail-section p {
        color: #cbd5e0;
      }
      
      .detail-section ul {
        margin: 0 0 0 30px;
        padding-left: 20px;
      }
      
      .detail-section li {
        margin-bottom: 8px;
        line-height: 1.5;
        color: #4a5568;
      }
      
      .dark-mode .detail-section li {
        color: #cbd5e0;
      }
      
      .detail-section.warnings {
        background-color: #fff5f5;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #e53e3e;
      }
      
      .dark-mode .detail-section.warnings {
        background-color: #742a2a;
        border-left-color: #fc8181;
      }
      
      .detail-section.warnings .section-icon {
        color: #e53e3e;
      }
      
      .detail-section.adverse-effects {
        background-color: #fffaf0;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #dd6b20;
      }
      
      .dark-mode .detail-section.adverse-effects {
        background-color: #7b341e;
        border-left-color: #f6ad55;
      }
      
      .detail-section.adverse-effects .section-icon {
        color: #dd6b20;
      }
    `}</style>
  </div>
);

export default MedicineInfoView;