import React from 'react';
import { FiCheckCircle, FiX, FiDownload, FiMail, FiAlertCircle } from 'react-icons/fi';

const BulkSuccessModal = ({ show, onClose, results, onDownload }) => {
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
          width: '700px',
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
            Group Registration Results
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '8px 12px', borderRadius: '6px' }}>
              <p style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: '500' }}>
                Success: {results.success_count}
              </p>
            </div>
            <div style={{ backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px' }}>
              <p style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: '500' }}>
                Failed/Skipped: {results.error_count}
              </p>
            </div>
          </div>

          <p style={{ marginBottom: '14px', fontWeight: '500' }}>
            Group registration of {results.success_count + results.error_count} employees completed.
          </p>

          {/* Results Summary */}
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              marginBottom: '16px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  <th style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result, index) => (
                  <tr 
                    key={index} 
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: result.status === 'success' ? '#f0fdf4' : 
                                     result.status === 'skipped' ? '#fffbeb' : '#fef2f2'
                    }}
                  >
                    <td style={{ padding: '8px 12px' }}>
                      {result.employee.first_name} {result.employee.last_name}
                    </td>
                    <td style={{ padding: '8px 12px', color: 
                        result.status === 'success' ? '#15803d' : 
                        result.status === 'skipped' ? '#b45309' : '#b91c1c'
                      }}>
                      {result.status === 'success' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiCheckCircle size={14} /> Success
                        </span>
                      ) : result.status === 'skipped' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiAlertCircle size={14} /> Skipped
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FiX size={14} /> Failed
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {result.message || (result.status === 'success' ? 'Registered successfully' : '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <FiMail /> Credentials have been sent to all successfully registered employees
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
            Download Full Report
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

export default BulkSuccessModal;