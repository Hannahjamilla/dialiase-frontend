import React from 'react';
import { FiCheckCircle, FiX, FiDownload, FiMail } from 'react-icons/fi';

const SuccessRegisterEmplModal = ({ show, onClose, employeeData, onDownload }) => {
  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease',
        }}
      ></div>

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1)',
          backgroundColor: '#638ECB',
          borderRadius: '14px',
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.35)',
          width: '600px',
          maxWidth: '95%',
          zIndex: 1001,
          padding: '28px',
          animation: 'scaleUp 0.3s ease',
          color: '#fff',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            paddingBottom: '10px',
          }}
        >
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FiCheckCircle style={{ color: '#477977', fontSize: '1.9rem' }} />
            Registration Successful
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: 'rgba(255,255,255,0.7)',
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.color = '#fff')}
            onMouseOut={(e) => (e.target.style.color = 'rgba(255,255,255,0.7)')}
          >
            <FiX />
          </button>
        </div>

        {/* Info Box */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            padding: '18px',
            marginBottom: '20px',
            boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.08)',
            color: '#333',
          }}
        >
          <p style={{ marginBottom: '14px', fontWeight: '500' }}>
            {employeeData.first_name} {employeeData.last_name} has been successfully registered.
          </p>

          {/* Employee Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              fontSize: '0.95rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Employee Number</p>
              <p style={{ fontWeight: '600' }}>{employeeData.employeeNumber}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Position</p>
              <p style={{ fontWeight: '600' }}>{employeeData.userLevel}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Email</p>
              <p style={{ fontWeight: '600' }}>{employeeData.email}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Temporary Password</p>
              <p style={{ fontWeight: '600' }}>{employeeData.password}</p>
            </div>
          </div>

          {/* Email Sent Notice */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'rgba(57, 88, 134, 0.1)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              color: '#395886',
              border: '1px solid rgba(57, 88, 134, 0.2)',
            }}
          >
            <FiMail /> Credentials have been sent to the employee's email
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            onClick={onDownload}
            style={{
              backgroundColor: '#153d3dff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#3c6a64')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#477977')}
          >
            <FiDownload />
            Download Credentials
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}
      </style>
    </>
  );
};

export default SuccessRegisterEmplModal;