import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactModal = ({ isOpen, onClose }) => {
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
                  Contact Us
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Get in touch with the DialiEase team
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
                aria-label="Close contact modal"
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
                    <strong>Quick Links</strong>
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    margin: 0
                  }}>
                    Select a contact method below
                  </p>
                </div>
                
                <nav>
                  {[
                    { icon: '✉️', title: "General Inquiries" },
                    { icon: '🛠️', title: "Technical Support" },
                    { icon: '🏢', title: "Mailing Address" },
                    { icon: '🚨', title: "Emergency" },
                    { icon: '💬', title: "Feedback" },
                    { icon: '📱', title: "Social Media" }
                  ].map((item, index) => (
                    <motion.button
                      key={index}
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
                        marginRight: '0.75rem',
                        fontSize: '1rem'
                      }}>
                        {item.icon}
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
                {/* General Inquiries */}
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
                      fontSize: '1rem'
                    }}>
                      ✉️
                    </span>
                    General Inquiries
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
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
                        Email
                      </h4>
                      <p style={{ 
                        margin: 0,
                        fontSize: '0.9375rem',
                        color: '#3b82f6'
                      }}>
                        info@dialiease.com
                      </p>
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
                        Phone
                      </h4>
                      <p style={{ 
                        margin: 0,
                        fontSize: '0.9375rem',
                        color: '#10b981'
                      }}>
                        (800) 555-1234
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Technical Support */}
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
                      fontSize: '1rem'
                    }}>
                      🛠️
                    </span>
                    Technical Support
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      borderLeft: "4px solid #3b82f6"
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        margin: '0 0 0.75rem 0',
                        color: '#111827'
                      }}>
                        Email
                      </h4>
                      <p style={{ 
                        margin: 0,
                        fontSize: '0.9375rem',
                        color: '#3b82f6'
                      }}>
                       dialiease@gmail.com
                      </p>
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
                        Phone
                      </h4>
                      <p style={{ 
                        margin: 0,
                        fontSize: '0.9375rem',
                        color: '#10b981'
                      }}>
                        (800) 555-5678
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <h4 style={{ 
                        fontWeight: '600', 
                        margin: '0 0 0.75rem 0',
                        color: '#111827'
                      }}>
                        Hours
                      </h4>
                      <p style={{ 
                        margin: 0,
                        fontSize: '0.9375rem',
                        color: '#f59e0b'
                      }}>
                        Monday-Friday<br/>
                        8:00 AM - 8:00 PM EST
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Mailing Address */}
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
                      fontSize: '1rem'
                    }}>
                      🏢
                    </span>
                    Mailing Address
                  </h3>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    borderLeft: '4px solid #8b5cf6'
                  }}>
                    <p style={{ 
                      margin: '0 0 0.5rem 0',
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      DialiEase Inc.
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>123 Healthcare Way</p>
                    <p style={{ margin: '0.25rem 0' }}>Boston, MA 02115</p>
                    <p style={{ margin: '0.25rem 0 0 0' }}>United States</p>
                  </div>
                </motion.section>

                {/* Emergency Contact */}
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
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      marginRight: '1rem',
                      fontSize: '1rem'
                    }}>
                      🚨
                    </span>
                    Emergency Contact
                  </h3>
                  <div style={{
                    backgroundColor: '#fef2f2',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <p style={{ 
                      margin: 0,
                      color: '#7f1d1d'
                    }}>
                      For medical emergencies, please call <strong>911</strong> or your local emergency number immediately.
                    </p>
                  </div>
                </motion.section>

                {/* Feedback */}
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
                      fontSize: '1rem'
                    }}>
                      💬
                    </span>
                    Feedback
                  </h3>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>
                      We welcome your feedback to help us improve our services.
                    </p>
                    <p style={{ 
                      margin: 0,
                      fontWeight: '600',
                      color: '#3b82f6'
                    }}>
                      feedback@dialiease.com
                    </p>
                  </div>
                </motion.section>

                {/* Social Media */}
                <motion.section 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
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
                      fontSize: '1rem'
                    }}>
                      📱
                    </span>
                    Social Media
                  </h3>
                  <p style={{ marginBottom: '1rem' }}>Connect with us on:</p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {[
                      { 
                        platform: 'Twitter',
                        handle: '@DialiEase',
                        color: '#1da1f2'
                      },
                      { 
                        platform: 'Facebook',
                        handle: 'facebook.com/DialiEase',
                        color: '#1877f2'
                      },
                      { 
                        platform: 'LinkedIn',
                        handle: 'linkedin.com/company/DialiEase',
                        color: '#0a66c2'
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.5rem',
                          padding: '1rem',
                          borderLeft: `3px solid ${item.color}`
                        }}
                      >
                        <p style={{ 
                          margin: '0 0 0.25rem 0',
                          fontWeight: '600',
                          color: item.color
                        }}>
                          {item.platform}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.9375rem' }}>{item.handle}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                {/* Footer */}
                <div style={{
                  marginTop: '3rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    We typically respond within 24-48 hours.
                  </p>
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

export default ContactModal;