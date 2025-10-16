import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaFilePdf, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaInfoCircle, FaUser, FaPills, FaNotesMedical } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ShowPrescribeModal = ({ 
  isOpen = false, 
  onClose = () => {}, 
  patientName = '',
  patientHospitalNumber = '',
  medicines = [], 
  pdData = {}, 
  additionalInstructions = '',
  onSaveSuccess = () => {}
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (isOpen) {
      generatePdfPreview();
    }
  }, [isOpen]);

  const generatePdfPreview = async () => {
    try {
      setIsGeneratingPdf(true);
      setError(null);

      if (!patientName) throw new Error('Patient name is required');

      const payload = {
        patientName,
        patientHospitalNumber,
        medicines: medicines.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        })),
        additional_instructions: additionalInstructions,
        pd_data: pdData || null
      };

      const response = await api.post('/prescriptions/generate-pdf', payload, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setError(err.message || 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!patientName) throw new Error('Patient name is required');
      if (!medicines || medicines.length === 0) throw new Error('At least one medicine is required');

      const payload = {
        patientName,
        patientHospitalNumber,
        medicines: medicines.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        })),
        additional_instructions: additionalInstructions,
        pd_data: (pdData && (pdData.bags?.length > 0 || pdData.first || pdData.second || pdData.third)) ? pdData : null
      };

      const response = await api.post('/prescriptions/generate', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save prescription');
      }

      // Enhanced success toast with more details
      toast.success(
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Prescription Saved Successfully!
          </div>
          <div style={{ fontSize: '14px' }}>
            For: {patientName}
          </div>
          <div style={{ fontSize: '14px' }}>
            {medicines.length} medication(s) prescribed
          </div>
        </div>, 
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );

      // Show success modal and trigger success callback
      setShowSuccessModal(true);
      onSaveSuccess();
      
      // Navigate to DoctorDashboard after a short delay
      setTimeout(() => {
        navigate('/doctor/DoctorDashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Prescription submission error:', err);

      let errorMessage = 'Failed to save prescription';
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '90rem',
        maxHeight: '95vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1e293b',
              marginBottom: '0.25rem'
            }}>
              Prescription Review
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Verify all details before submission
            </p>
          </div>
          <button 
            onClick={() => onClose(false)} 
            style={{
              color: '#64748b',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              transition: 'color 0.2s',
              ':hover': {
                color: '#475569'
              }
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Left Panel - Prescription Details */}
          <div style={{
            flex: '0 0 45%',
            padding: '2rem',
            overflowY: 'auto',
            borderRight: '1px solid #e5e7eb'
          }}>
            {/* Instructions */}
            <div style={{
              backgroundColor: '#f0f9ff',
              borderLeft: '4px solid #0ea5e9',
              padding: '1.25rem',
              borderRadius: '0.375rem',
              marginBottom: '2rem',
              display: 'flex',
              gap: '1rem'
            }}>
              <FaInfoCircle style={{ 
                color: '#0ea5e9', 
                fontSize: '1.5rem', 
                flexShrink: 0,
                marginTop: '0.25rem'
              }} />
              <div>
                <p style={{ 
                  fontWeight: 600, 
                  marginBottom: '0.75rem', 
                  color: '#0369a1',
                  fontSize: '1rem'
                }}>
                  Final Verification Checklist
                </p>
                <ol style={{ 
                  listStyleType: 'decimal', 
                  paddingLeft: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#334155'
                }}>
                  <li>Confirm patient identity matches the prescription</li>
                  <li>Verify all medication details are accurate</li>
                  <li>Check dosage, frequency and duration are correct</li>
                  <li>Review the PDF preview for proper formatting</li>
                </ol>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                padding: '1rem',
                borderRadius: '0.375rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid #fecaca'
              }}>
                <FaExclamationTriangle style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Patient Information Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              marginBottom: '2rem',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <FaUser style={{ color: '#64748b' }} />
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600,
                  color: '#334155'
                }}>
                  Patient Information
                </h3>
              </div>
              <div style={{
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#64748b', 
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Full Name
                  </p>
                  <p style={{ 
                    fontWeight: 500, 
                    fontSize: '1rem',
                    color: '#1e293b'
                  }}>
                    {patientName}
                  </p>
                </div>
                {patientHospitalNumber && (
                  <div>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      marginBottom: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Hospital Number
                    </p>
                    <p style={{ 
                      fontWeight: 500, 
                      fontSize: '1rem',
                      color: '#1e293b'
                    }}>
                      {patientHospitalNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medications Card */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              marginBottom: '2rem',
              overflow: 'hidden'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <FaPills style={{ color: '#64748b' }} />
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600,
                  color: '#334155'
                }}>
                  Prescribed Medications ({medicines.length})
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  minWidth: '600px'
                }}>
                  <thead style={{ backgroundColor: '#f1f5f9' }}>
                    <tr>
                      <th style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>
                        #
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>
                        Medication
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>
                        Dosage
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>
                        Frequency
                      </th>
                      <th style={{ 
                        padding: '0.75rem 1rem', 
                        textAlign: 'left', 
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 500
                      }}>
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((medicine, index) => (
                      <tr 
                        key={index} 
                        style={{ 
                          borderBottom: '1px solid #e2e8f0',
                          ':last-child': { borderBottom: 'none' }
                        }}
                      >
                        <td style={{ 
                          padding: '1rem', 
                          fontSize: '0.875rem',
                          color: '#475569'
                        }}>
                          {index + 1}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          fontSize: '0.875rem',
                          color: '#1e293b',
                          fontWeight: 500
                        }}>
                          {medicine.name}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          fontSize: '0.875rem',
                          color: '#475569'
                        }}>
                          {medicine.dosage || '-'}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          fontSize: '0.875rem',
                          color: '#475569'
                        }}>
                          {medicine.frequency || '-'}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          fontSize: '0.875rem',
                          color: '#475569'
                        }}>
                          {medicine.duration || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PD Solution Card (if exists) */}
            {pdData && (pdData.bags?.length > 0 || pdData.first || pdData.second || pdData.third) && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <FaNotesMedical style={{ color: '#64748b' }} />
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 600,
                    color: '#334155'
                  }}>
                    PD Solution Details
                  </h3>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#64748b', 
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        System
                      </p>
                      <p style={{ 
                        fontWeight: 500, 
                        fontSize: '0.875rem',
                        color: '#1e293b'
                      }}>
                        {pdData.system || '-'}
                      </p>
                    </div>
                    <div>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#64748b', 
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Total Exchanges
                      </p>
                      <p style={{ 
                        fontWeight: 500, 
                        fontSize: '0.875rem',
                        color: '#1e293b'
                      }}>
                        {pdData.totalExchanges || '-'}
                      </p>
                    </div>
                    <div>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#64748b', 
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Dwell Time
                      </p>
                      <p style={{ 
                        fontWeight: 500, 
                        fontSize: '0.875rem',
                        color: '#1e293b'
                      }}>
                        {pdData.dwellTime ? `${pdData.dwellTime} hours` : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Exchange Schedule
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse',
                        border: '1px solid #e2e8f0'
                      }}>
                        <thead style={{ backgroundColor: '#f1f5f9' }}>
                          <tr>
                            <th style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500
                            }}>
                              Dwell Time
                            </th>
                            <th style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500
                            }}>
                              1st
                            </th>
                            <th style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500
                            }}>
                              2nd
                            </th>
                            <th style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500
                            }}>
                              3rd
                            </th>
                            {pdData.fourth && <th style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500
                            }}>
                              4th
                            </th>}
                            {pdData.fifth && <th style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500
                            }}>
                              5th
                            </th>}
                            {pdData.sixth && <th style={{ 
                              padding: '0.5rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 500
                            }}>
                              6th
                            </th>}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}>
                              {pdData.dwellTime ? `${pdData.dwellTime} hours` : '-'}
                            </td>
                            <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}>
                              {pdData.first || '-'}
                            </td>
                            <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}>
                              {pdData.second || '-'}
                            </td>
                            <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}>
                              {pdData.third || '-'}
                            </td>
                            {pdData.fourth && <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}>
                              {pdData.fourth}
                            </td>}
                            {pdData.fifth && <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}>
                              {pdData.fifth}
                            </td>}
                            {pdData.sixth && <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #e2e8f0', 
                              textAlign: 'center', 
                              fontSize: '0.875rem',
                              color: '#475569'
                            }}>
                              {pdData.sixth}
                            </td>}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {pdData.bags?.length > 0 && (
                    <div>
                      <p style={{ 
                        fontSize: '0.75rem', 
                        color: '#64748b', 
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Solutions
                      </p>
                      <ul style={{ 
                        listStyleType: 'disc', 
                        paddingLeft: '1.5rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#475569'
                      }}>
                        {pdData.bags.map((bag, index) => (
                          <li key={index}>
                            {bag.percentage ? `${bag.percentage}% - ` : ''}{bag.count} bags
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Instructions Card */}
            {additionalInstructions && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <FaNotesMedical style={{ color: '#64748b' }} />
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 600,
                    color: '#334155'
                  }}>
                    Additional Instructions
                  </h3>
                </div>
                <div style={{
                  padding: '1.25rem',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: '#475569'
                }}>
                  {additionalInstructions}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - PDF Preview */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f8fafc',
            padding: '2rem',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600,
                color: '#1e293b'
              }}>
                Prescription Preview
              </h3>
              <button 
                onClick={generatePdfPreview}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  color: '#334155',
                  fontWeight: 500,
                  ':hover': {
                    backgroundColor: '#f1f5f9',
                    borderColor: '#94a3b8'
                  }
                }}
              >
                <FaFilePdf size={14} /> Regenerate PDF
              </button>
            </div>
            
            {isGeneratingPdf ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px dashed #cbd5e1'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <FaSpinner className="animate-spin" size={28} style={{ color: '#64748b' }} />
                  <p style={{ 
                    color: '#475569',
                    fontWeight: 500
                  }}>
                    Generating prescription preview...
                  </p>
                  <p style={{ 
                    color: '#64748b',
                    fontSize: '0.875rem',
                    maxWidth: '300px'
                  }}>
                    This may take a few moments depending on the complexity of the prescription.
                  </p>
                </div>
              </div>
            ) : pdfUrl ? (
              <div style={{
                flex: 1,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <p style={{ 
                    fontSize: '0.75rem',
                    color: '#64748b',
                    fontWeight: 500
                  }}>
                    PRESCRIPTION_PREVIEW.pdf
                  </p>
                  <a 
                    href={pdfUrl} 
                    download={`Prescription_${patientName.replace(/\s+/g, '_')}.pdf`}
                    style={{
                      fontSize: '0.75rem',
                      color: '#3b82f6',
                      fontWeight: 500,
                      textDecoration: 'none',
                      ':hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Download
                  </a>
                </div>
                <div style={{ flex: 1 }}>
                  <iframe 
                    src={pdfUrl} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      border: 'none',
                      minHeight: '500px'
                    }}
                    title="Prescription PDF Preview"
                  />
                </div>
              </div>
            ) : error ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                border: '1px dashed #fca5a5',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <FaExclamationTriangle size={32} style={{ color: '#dc2626', marginBottom: '1rem' }} />
                <h4 style={{ 
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#b91c1c',
                  marginBottom: '0.5rem'
                }}>
                  Failed to Generate Preview
                </h4>
                <p style={{ 
                  color: '#64748b',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                  maxWidth: '400px'
                }}>
                  {error}
                </p>
                <button 
                  onClick={generatePdfPreview}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s',
                    ':hover': {
                      backgroundColor: '#dc2626'
                    }
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 2rem',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <p style={{ 
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              Review all details carefully before submission.
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '1rem'
          }}>
            <button
              onClick={() => onClose(false)}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                background: 'white',
                fontWeight: 500,
                fontSize: '0.875rem',
                color: '#334155',
                transition: 'all 0.2s',
                ':hover': {
                  backgroundColor: '#f1f5f9',
                  borderColor: '#94a3b8'
                }
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving || !pdfUrl || !patientName}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: (isSaving || !pdfUrl || !patientName) ? '#93c5fd' : '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                cursor: (isSaving || !pdfUrl || !patientName) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'background-color 0.2s',
                ':hover': (isSaving || !pdfUrl || !patientName) ? {} : {
                  backgroundColor: '#1d4ed8'
                }
              }}
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Confirm & Send Prescription
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ShowPrescribeModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  patientName: PropTypes.string.isRequired,
  patientHospitalNumber: PropTypes.string,
  medicines: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    dosage: PropTypes.string,
    frequency: PropTypes.string,
    duration: PropTypes.string
  })),
  pdData: PropTypes.object,
  additionalInstructions: PropTypes.string,
  onSaveSuccess: PropTypes.func
};

export default ShowPrescribeModal;