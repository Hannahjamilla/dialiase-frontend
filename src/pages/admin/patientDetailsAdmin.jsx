import React, { useState } from 'react';
import {
  FaTimes, FaCalendarAlt, FaEnvelope,
  FaArchive, FaUser, FaIdCard, FaVenusMars,
  FaCheckCircle, FaCopy
} from 'react-icons/fa';

const PatientDetailsAdmin = ({ patient, onClose }) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
      background: patient.AccStatus === 'active' ? '#d1fae5' : '#fee2e2',
      color: patient.AccStatus === 'active' ? '#065f46' : '#991b1b'
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
              <span style={styles.status}>{patient.AccStatus === 'active' ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#000', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span><FaIdCard style={{ marginRight: '6px', color: '#4a5568' }} /> {patient.hospitalNumber || 'No ID'}</span>
              <span><FaUser style={{ marginRight: '6px', color: '#4a5568' }} /> {calculateAge(patient.date_of_birth)} years</span>
              <span><FaVenusMars style={{ marginRight: '6px', color: '#4a5568' }} /> {patient.gender || 'N/A'}</span>
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

        {/* Content */}
        <div style={styles.content}>
          {/* Personal Info */}
          <div style={styles.card}>
            <div style={styles.cardHeader}><FaUser style={{ marginRight: '10px', color: '#4299e1' }} /> Personal Information</div>
            <div style={styles.infoGrid}>
              <InfoRow 
                label="Full Name" 
                value={`${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.replace(/\s+/g, ' ')} 
                onCopy={() => copyToClipboard(`${patient.first_name} ${patient.middle_name || ''} ${patient.last_name}`.replace(/\s+/g, ' '), 'name')} 
                copied={copied === 'name'} 
              />
              <InfoRow 
                label="Date of Birth" 
                value={formatDate(patient.date_of_birth)} 
                subValue={`${calculateAge(patient.date_of_birth)} years old`} 
                icon={<FaCalendarAlt />} 
              />
              <InfoRow 
                label="Gender" 
                value={patient.gender} 
                icon={<FaVenusMars />} 
              />
              <InfoRow 
                label="Hospital ID" 
                value={patient.hospitalNumber} 
                onCopy={() => copyToClipboard(patient.hospitalNumber, 'hospital')} 
                copied={copied === 'hospital'} 
                icon={<FaIdCard />} 
              />
              <InfoRow 
                label="Email" 
                value={patient.email} 
                isEmail 
                onCopy={() => copyToClipboard(patient.email, 'email')} 
                copied={copied === 'email'} 
                icon={<FaEnvelope />} 
              />
              <InfoRow 
                label="Account Status" 
                value={patient.AccStatus === 'active' ? 'Active' : 'Inactive'} 
                subValue={patient.AccStatus === 'active' ? 'Patient has active access' : 'Patient account is inactive'} 
              />
            </div>
          </div>
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
              onClick={() => {
                if (window.confirm(`Are you sure you want to archive ${patient.first_name} ${patient.last_name}? This action cannot be undone.`)) {
                  setIsArchiving(true);
                  setTimeout(() => {
                    setIsArchiving(false);
                    onClose();
                  }, 1500);
                }
              }}
              style={styles.btn(
                isArchiving ? '#feb2b2' : '#f56565', 
                '#fff', 
                isArchiving ? '#feb2b2' : '#e53e3e'
              )}
              disabled={isArchiving}
            >
              <FaArchive /> {isArchiving ? 'Archiving...' : 'Archive Patient'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, subValue, icon, isEmail, isPhone, multiLine, onCopy, copied }) => (
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
        color: '#000', // All values black
        lineHeight: '1.4'
      }}>
        {isEmail && value ? (
          <a href={`mailto:${value}`} style={{ color: '#000', textDecoration: 'underline' }}>{value}</a>
        ) : isPhone && value ? (
          <a href={`tel:${value}`} style={{ color: '#000', textDecoration: 'underline' }}>{value}</a>
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

export default PatientDetailsAdmin;
