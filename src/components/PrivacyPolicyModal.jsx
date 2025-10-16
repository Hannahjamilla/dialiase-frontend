import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem 1rem',
            overflow: 'hidden'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ x: 50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.95 }}
            transition={{ 
              type: 'spring', 
              damping: 20,
              stiffness: 300
            }}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.5rem',
              width: '90%',
              maxWidth: '1200px',
              height: '90vh',
              maxHeight: '800px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderTopLeftRadius: '1.5rem',
              borderTopRightRadius: '1.5rem'
            }} />
            
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e5e7eb',
              position: 'relative',
              flexShrink: 0
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: '#111827',
                  marginBottom: '0.25rem'
                }}>
                  Privacy Policy for DialiEase
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  How we collect, use, and protect your information
                </p>
              </div>
              <button 
                onClick={onClose}
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0,0,0,0.1)';
                  e.target.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0,0,0,0.05)';
                  e.target.style.color = '#6b7280';
                }}
                aria-label="Close privacy policy"
              >
                &times;
              </button>
            </div>

            {/* Horizontal Content Container */}
            <div style={{
              display: 'flex',
              flex: 1,
              overflow: 'hidden'
            }}>
              {/* Sidebar Navigation */}
              <div style={{
                width: '240px',
                borderRight: '1px solid #e5e7eb',
                padding: '1.5rem 0',
                overflowY: 'auto',
                flexShrink: 0
              }}>
                <div style={{
                  padding: '0 1.5rem 1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{ 
                    fontWeight: '500',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    <strong>Last Updated:</strong> 2025
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    margin: 0
                  }}>
                    DialiEase respects and upholds your privacy rights under Philippine law.
                  </p>
                </div>
                
                <nav>
                  {[
                    { number: 1, title: "Information We Collect" },
                    { number: 2, title: "How We Use Information" },
                    { number: 3, title: "Sharing Information" },
                    { number: 4, title: "Data Security" },
                    { number: 5, title: "User Rights" },
                    { number: 6, title: "Children's Privacy" },
                    { number: 7, title: "IoT Device Use" },
                    { number: 8, title: "Cookies & Analytics" },
                    { number: 9, title: "Policy Updates" },
                    { number: 10, title: "Contact Us" }
                  ].map((item) => (
                    <motion.button
                      key={item.number}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.9375rem',
                        color: '#4b5563'
                      }}
                    >
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: '#e0e7ff',
                        color: '#3b82f6',
                        marginRight: '0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {item.number}
                      </span>
                      {item.title}
                    </motion.button>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div style={{ 
                flex: 1,
                padding: '1.5rem 2rem',
                overflowY: 'auto',
                color: '#374151', 
                lineHeight: '1.7',
                fontSize: '1rem'
              }}>
                {/* Introduction */}
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    This Privacy Policy outlines how we collect, use, disclose, and protect your personal and health-related information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and other applicable laws of the Republic of the Philippines.
                  </p>
                  <p>
                    By using DialiEase, you consent to the collection and processing of your data in accordance with this policy.
                  </p>
                </div>

                {/* Section 1 */}
                <motion.section 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ marginBottom: '2.5rem' }}
                >
                  <h3 style={{ 
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontSize: '1.375rem',
                    fontWeight: '600',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#e0e7ff',
                      color: '#3b82f6',
                      marginRight: '1rem',
                      fontSize: '0.9375rem',
                      fontWeight: '700'
                    }}>
                      1
                    </span>
                    Information We Collect
                  </h3>
                  <p style={{ marginBottom: '1rem' }}>We collect the following types of information:</p>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      borderLeft: '4px solid #3b82f6'
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        margin: '0 0 0.75rem 0',
                        color: '#111827'
                      }}>
                        Personal Identification
                      </h4>
                      <ul style={{ 
                        paddingLeft: '1.25rem',
                        margin: 0,
                        fontSize: '0.9375rem'
                      }}>
                        {["Full name", "Contact details", "Gender & birth date", "Address"].map((item) => (
                          <li key={item} style={{ marginBottom: '0.375rem' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      borderLeft: '4px solid #8b5cf6'
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        margin: '0 0 0.75rem 0',
                        color: '#111827'
                      }}>
                        Health Information
                      </h4>
                      <ul style={{ 
                        paddingLeft: '1.25rem',
                        margin: 0,
                        fontSize: '0.9375rem'
                      }}>
                        {["Dialysis type & schedule", "Dialysate logs", "Ultrafiltration data", "IoT weight readings", "Symptoms", "Prescriptions"].map((item) => (
                          <li key={item} style={{ marginBottom: '0.375rem' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        margin: '0 0 0.75rem 0',
                        color: '#111827'
                      }}>
                        Technical Data
                      </h4>
                      <ul style={{ 
                        paddingLeft: '1.25rem',
                        margin: 0,
                        fontSize: '0.9375rem'
                      }}>
                        {["App usage logs", "IP address", "Session data"].map((item) => (
                          <li key={item} style={{ marginBottom: '0.375rem' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.section>

                {/* Section 2 */}
                <motion.section 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ marginBottom: '2.5rem' }}
                >
                  <h3 style={{ 
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontSize: '1.375rem',
                    fontWeight: '600',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#e0e7ff',
                      color: '#3b82f6',
                      marginRight: '1rem',
                      fontSize: '0.9375rem',
                      fontWeight: '700'
                    }}>
                      2
                    </span>
                    How We Use Your Information
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    {[
                      "Secure login & account management",
                      "Dialysis session analysis",
                      "Fluid balance tracking",
                      "Healthcare communication",
                      "Service improvements",
                      "Appointments reminders"
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        style={{
                          backgroundColor: '#f3f4f6',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{
                          flexShrink: 0,
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {index + 1}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9375rem' }}>{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Section 3 */}
                <motion.section 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ marginBottom: '2.5rem' }}
                >
                  <h3 style={{ 
                    marginTop: 0,
                    marginBottom: '1.5rem',
                    fontSize: '1.375rem',
                    fontWeight: '600',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '0.5rem',
                      backgroundColor: '#e0e7ff',
                      color: '#3b82f6',
                      marginRight: '1rem',
                      fontSize: '0.9375rem',
                      fontWeight: '700'
                    }}>
                      3
                    </span>
                    Sharing and Disclosure
                  </h3>
                  <p style={{ marginBottom: '1rem' }}>We do NOT sell or rent your personal information. However, we may share data with:</p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {[
                      {
                        title: "Healthcare Providers",
                        description: "Your assigned doctors and dialysis staff for medical review and care planning",
                        icon: "👨‍⚕️"
                      },
                      {
                        title: "System Admin",
                        description: "For maintenance, user support, and system performance",
                        icon: "🛠️"
                      },
                      {
                        title: "Regulatory Authorities",
                        description: "When required by law or authorized government request",
                        icon: "🏛️"
                      },
                      {
                        title: "Service Providers",
                        description: "For hosting, analytics, or technical support under confidentiality",
                        icon: "🤝"
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.75rem',
                          padding: '1.25rem',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{
                          fontSize: '1.5rem',
                          marginBottom: '0.75rem'
                        }}>
                          {item.icon}
                        </div>
                        <h4 style={{ 
                          fontWeight: '600', 
                          margin: '0 0 0.5rem 0',
                          color: '#111827'
                        }}>
                          {item.title}
                        </h4>
                        <p style={{ 
                          margin: 0,
                          fontSize: '0.9375rem',
                          color: '#4b5563'
                        }}>
                          {item.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Add more sections as needed following the same pattern */}

                {/* Footer */}
                <div style={{
                  marginTop: '3rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ 
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <strong>Contact:</strong> privacy@dialiease.ph | +63 9366674879
                    </p>
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      By using DialiEase, you confirm you've read and understood this policy.
                    </p>
                  </div>
                  <p style={{ 
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    © 2025 DialiEase. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyPolicyModal;