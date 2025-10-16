import React, { useState } from 'react';
import {
  FaTimes, FaCalendarAlt, FaEnvelope,
  FaUser, FaIdCard, FaUserMd, FaUserNurse,
  FaUserShield, FaTruck, FaCheckCircle, FaCopy, FaStethoscope, FaArchive
} from 'react-icons/fa';
import axios from 'axios';

const EmpDetails = ({ provider, user, onClose }) => {
  const [copied, setCopied] = useState('');

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

  const calculateTimeSinceJoin = (joinDate) => {
    if (!joinDate) return '';
    
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now - join);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Joined today';
    if (diffDays === 1) return 'Joined yesterday';
    if (diffDays < 7) return `Joined ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Joined ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Joined ${months} month${months > 1 ? 's' : ''} ago`;
    }
    
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) {
      return `Joined ${years} year${years > 1 ? 's' : ''} ago`;
    }
    
    return `Joined ${years} year${years > 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} ago`;
  };

  const archiveEmployee = async () => {
    if (window.confirm(`Are you sure you want to archive ${provider.first_name} ${provider.last_name}? This will permanently remove them from the system and move their records to archive. This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/employees/${provider.userID}/archive`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        alert('Employee archived successfully');
        onClose();
        window.location.reload();
      } catch (err) {
        console.error('Error archiving employee:', err);
        alert('Failed to archive employee');
      }
    }
  };

  const getRoleIcon = () => {
    const userLevel = provider.userLevel?.toLowerCase();
    switch(userLevel) {
      case 'nurse': return <FaUserNurse />;
      case 'admin': return <FaUserShield />;
      case 'distributor': return <FaTruck />;
      case 'staff': return <FaUser />;
      case 'doctor': return <FaUserMd />;
      default: return <FaUser />;
    }
  };

  const getRoleName = () => {
    const userLevel = provider.userLevel?.toLowerCase();
    switch(userLevel) {
      case 'doctor': return 'Doctor';
      case 'nurse': return 'Nurse';
      case 'admin': return 'Administrator';
      case 'distributor': return 'Distributor';
      case 'staff': return 'Staff';
      default: return provider.userLevel || 'Employee';
    }
  };

  const getStatusColor = () => {
    switch(provider.EmpStatus) {
      case 'active': return { bg: '#d1fae5', text: '#065f46', label: 'Active' };
      case 'inactive': return { bg: '#fee2e2', text: '#991b1b', label: 'Inactive' };
      case 'on-leave': return { bg: '#fef3c7', text: '#92400e', label: 'On Leave' };
      case 'pre-register': return { bg: '#e0e7ff', text: '#3730a3', label: 'Pre-registered' };
      case 'archived': return { bg: '#e5e7eb', text: '#6b7280', label: 'Archived' };
      default: return { bg: '#e5e7eb', text: '#4b5563', label: provider.EmpStatus || 'Unknown' };
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
              {provider.first_name} {provider.last_name}
              <span style={styles.status}>{statusColors.label}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#000', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span><FaIdCard style={{ marginRight: '6px', color: '#4a5568' }} /> {provider.employeeNumber || 'No ID'}</span>
              <span>{getRoleIcon()} {getRoleName()}</span>
              {provider.specialization && (
                <span><FaStethoscope style={{ marginRight: '6px', color: '#4a5568' }} /> {provider.specialization}</span>
              )}
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
                value={`${provider.first_name} ${provider.middle_name || ''} ${provider.last_name}`.replace(/\s+/g, ' ')} 
              />
              <InfoRow 
                label="Employee ID" 
                value={provider.employeeNumber} 
                onCopy={() => copyToClipboard(provider.employeeNumber, 'employeeId')} 
                copied={copied === 'employeeId'} 
                icon={<FaIdCard />} 
              />
              <InfoRow 
                label="Email" 
                value={provider.email} 
                isEmail 
              />
            </div>
          </div>

          {/* Employment Info */}
          <div style={styles.card}>
            <div style={styles.cardHeader}><FaUserMd style={{ marginRight: '10px', color: '#4299e1' }} /> Employment Information</div>
            <div style={styles.infoGrid}>
              <InfoRow 
                label="Role" 
                value={getRoleName()} 
                subValue={`Access level: ${provider.userLevel}`}
                icon={getRoleIcon()}
              />
              <InfoRow 
                label="Specialization" 
                value={provider.specialization || 'Not specified'} 
                icon={<FaStethoscope />} 
              />
              <InfoRow 
                label="Employment Status" 
                value={statusColors.label} 
                subValue={provider.EmpStatus === 'active' ? 'Currently active' : 'Not currently active'} 
              />
              <InfoRow 
                label="Date Joined" 
                value={formatDate(provider.created_at)} 
                subValue={calculateTimeSinceJoin(provider.created_at)} 
                icon={<FaCalendarAlt />} 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={{ fontSize: '0.8rem', color: '#000' }}>
            Last updated: {formatDate(provider.updated_at || new Date())}
            {provider.created_at && (
              <span style={{ marginLeft: '15px' }}>Created: {formatDate(provider.created_at)}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {provider.EmpStatus !== 'archived' && (
              <button
                onClick={archiveEmployee}
                style={styles.btn('#e53e3e', '#fff', '#c53030')}
              >
                <FaArchive /> Archive Employee
              </button>
            )}
            <button
              onClick={() => window.open(`mailto:${provider.email}`)}
              style={styles.btn('#3182ce', '#fff', '#2c5282')}
              disabled={!provider.email}
            >
              <FaEnvelope /> Send Email
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

export default EmpDetails;