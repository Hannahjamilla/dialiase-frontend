import React, { useState } from 'react';
import { 
  FaTimes, FaCalendarAlt, FaEnvelope, 
  FaUser, FaIdCard, FaVenusMars, 
  FaNotesMedical, FaFileMedicalAlt, FaCopy, FaArchive
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDetailsModal = ({ patient, user, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState('');
  const navigate = useNavigate();

  const archivePatient = async () => {
    if (window.confirm(`Are you sure you want to archive ${patient.first_name} ${patient.last_name}?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8000/api/patients/${patient.userID}/archive`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        alert('Patient archived successfully');
        onClose();
        window.location.reload();
      } catch (err) {
        console.error('Error archiving patient:', err);
        alert('Failed to archive patient');
      }
    }
  };

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = () => {
    switch(patient.AccStatus) {
      case 'active': return { bg: '#d1fae5', text: '#065f46', label: 'Active' };
      case 'inactive': return { bg: '#fee2e2', text: '#991b1b', label: 'Inactive' };
      default: return { bg: '#e5e7eb', text: '#edf1f5ff', label: patient.AccStatus || '-' };
    }
  };

  const statusColors = getStatusColor();

  const styles = {
    overlay: {
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(4px)', 
      display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 9999, 
      padding: '20px'
    },
    modal: {
      background: '#fff', 
      borderRadius: '12px', 
      width: '90%',
      maxWidth: '1200px',
      maxHeight: '90vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    },
    header: {
      padding: '20px', 
      borderBottom: '1px solid #eee',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
    },
    nameRow: { 
      display: 'flex', 
      alignItems: 'center', 
      fontSize: '1.8rem', 
      fontWeight: 'bold', 
      color: '#000',
      marginBottom: '4px'
    },
    status: {
      marginLeft: '15px', 
      padding: '4px 10px', 
      borderRadius: '20px', 
      fontSize: '0.8rem',
      fontWeight: '500', 
      background: statusColors.bg,
      color: statusColors.text
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      background: '#f8fafc'
    },
    tab: {
      padding: '14px 20px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: '0.95rem',
      color: '#718096',
      position: 'relative',
      fontWeight: '500'
    },
    activeTab: {
      color: '#3182ce',
      fontWeight: '600'
    },
    activeTabIndicator: {
      position: 'absolute',
      bottom: '-1px',
      left: '20px',
      right: '20px',
      height: '3px',
      backgroundColor: '#3182ce'
    },
    content: { 
      flex: 1, 
      overflowY: 'auto', 
      padding: '20px',
      background: '#f8fafc'
    },
    card: {
      border: '1px solid #e2e8f0', 
      borderRadius: '10px', 
      marginBottom: '20px',
      overflow: 'hidden', 
      background: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)', 
      padding: '14px 20px',
      borderBottom: '1px solid #e2e8f0', 
      fontWeight: '600',
      display: 'flex', 
      alignItems: 'center', 
      fontSize: '1rem', 
      color: '#000'
    },
    infoGrid: { 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '20px', 
      padding: '20px'
    },
    footer: {
      padding: '15px 20px', 
      background: '#f8fafc', 
      borderTop: '1px solid #e2e8f0',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center'
    },
    btn: (bg, color, hoverBg) => ({
      padding: '10px 18px', 
      borderRadius: '8px', 
      fontSize: '0.9rem',
      fontWeight: '500', 
      background: bg, 
      color: color, 
      border: '1px solid transparent',
      cursor: 'pointer', 
      transition: '0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      '&:hover': {
        background: hoverBg || bg
      }
    })
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.nameRow}>
              {patient.first_name} {patient.last_name}
              <span style={styles.status}>{statusColors.label}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#000', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span><FaIdCard style={{ marginRight: '6px', color: '#4a5568' }} /> {patient.hospitalNumber || 'No Hospital Number'}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '1.2rem', 
              color: '#a0aec0',
              transition: '0.2s'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('overview')}
          >
            Overview
            {activeTab === 'overview' && <span style={styles.activeTabIndicator}></span>}
          </button>
          <button 
            style={{ ...styles.tab, ...(activeTab === 'medical' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('medical')}
          >
            Medical Records
            {activeTab === 'medical' && <span style={styles.activeTabIndicator}></span>}
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === 'overview' ? (
            <>
              {/* Personal Info */}
              <div style={styles.card}>
                <div style={styles.cardHeader}><FaUser style={{ marginRight: '10px', color: '#4299e1' }} /> Personal Information</div>
                <div style={styles.infoGrid}>
                  <InfoRow 
                    label="Full Name" 
                    value={`${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.replace(/\s+/g, ' ')} 
                  />
                  <InfoRow 
                    label="Hospital Number" 
                    value={patient.hospitalNumber} 
                    onCopy={() => copyToClipboard(patient.hospitalNumber, 'hospitalNumber')} 
                    copied={copied === 'hospitalNumber'} 
                    icon={<FaIdCard />} 
                  />
                  <InfoRow 
                    label="Email" 
                    value={patient.email} 
                    isEmail 
                  />
                </div>
              </div>

              {/* Demographics */}
              <div style={styles.card}>
                <div style={styles.cardHeader}><FaVenusMars style={{ marginRight: '10px', color: '#4299e1' }} /> Demographics</div>
                <div style={styles.infoGrid}>
                  <InfoRow 
                    label="Date of Birth" 
                    value={formatDate(patient.date_of_birth)} 
                    icon={<FaCalendarAlt />} 
                  />
                  <InfoRow 
                    label="Gender" 
                    value={patient.gender || 'Not specified'} 
                    icon={<FaVenusMars />} 
                  />
                </div>
              </div>
            </>
          ) : (
            <div style={styles.card}>
              <div style={styles.cardHeader}><FaNotesMedical style={{ marginRight: '10px', color: '#4299e1' }} /> Medical Records</div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '200px',
                color: '#6c757d',
                fontSize: '1.1rem',
                padding: '40px'
              }}>
                Medical records would be displayed here
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ fontSize: '0.8rem', color: '#000' }}>
            Last updated: {formatDate(patient.updated_at || new Date())}
            {patient.created_at && (
              <span style={{ marginLeft: '15px' }}>Created: {formatDate(patient.created_at)}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={archivePatient}
              style={styles.btn('#e53e3e', '#fff', '#c53030')}
            >
              <FaArchive /> Archive Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, subValue, icon, isEmail, multiLine, onCopy, copied }) => (
  <div>
    <div style={{ 
      fontSize: '0.75rem', 
      textTransform: 'uppercase', 
      color: '#555', 
      marginBottom: '6px', 
      display: 'flex', 
      alignItems: 'center',
      letterSpacing: '0.5px'
    }}>
      {icon && <span style={{ marginRight: '8px', color: '#888' }}>{icon}</span>}
      {label}
    </div>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: multiLine ? 'flex-start' : 'center',
      minHeight: multiLine ? 'auto' : '32px'
    }}>
      <div style={{ 
        whiteSpace: multiLine ? 'pre-line' : 'normal', 
        fontSize: '0.95rem', 
        color: '#000',
        lineHeight: '1.4'
      }}>
        {isEmail && value ? (
          <a href={`mailto:${value}`} style={{ color: '#000', textDecoration: 'underline' }}>{value}</a>
        ) : value ? (
          value
        ) : (
          <span style={{ color: '#888', fontStyle: 'italic' }}>Not specified</span>
        )}
        {subValue && <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>{subValue}</div>}
      </div>
      {onCopy && value && (
        <button 
          onClick={onCopy} 
          style={{ 
            marginLeft: '8px', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: copied ? '#48bb78' : '#aaa',
            transition: '0.2s'
          }}
        >
          {copied ? <FaCheckCircle /> : <FaCopy />}
        </button>
      )}
    </div>
  </div>
);

export default PatientDetailsModal;