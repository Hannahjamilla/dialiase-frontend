import React, { useState, useEffect } from 'react';
import { 
  FiX, FiArrowRight, FiShield, FiHeart, FiStar, 
  FiCheckCircle, FiMessageSquare, FiCalendar, 
  FiUser, FiAward, FiTrendingUp, FiZap, FiGift,
  FiPlay, FiPercent
} from 'react-icons/fi';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const PromosModal = ({ isOpen, onClose, colors, supplyID }) => {
  const [activeTab, setActiveTab] = useState('protection');
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(127);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && supplyID) {
      setLoading(true);
      setTimeout(() => {
        setReviews([
          {
            reviewID: 1,
            userName: "Sarah Johnson",
            rating: 5,
            comment: "Life-changing quality! These supplies made my CAPD treatment so much more comfortable and worry-free.",
            created_at: "2024-01-15",
            isAnonymous: false
          },
          {
            reviewID: 2,
            userName: "Mike Chen",
            rating: 5,
            comment: "Exceptional reliability. Never had any issues with delivery or product quality. Highly recommended!",
            created_at: "2024-01-10",
            isAnonymous: false
          }
        ]);
        setLoading(false);
      }, 1000);
    }
  }, [isOpen, supplyID]);

  if (!isOpen) return null;

  const features = [
    {
      title: "Infection Protection",
      description: "85% fewer infection risks with sterilized medical supplies",
      icon: <FiShield size={24} />,
      color: colors.primary,
      stat: "85%"
    },
    {
      title: "Treatment Reliability",
      description: "Medical-grade products for consistent performance",
      icon: <FiZap size={24} />,
      color: colors.green,
      stat: "99%"
    },
    {
      title: "Patient Safety",
      description: "Meets international safety standards",
      icon: <FiAward size={24} />,
      color: colors.warning,
      stat: "100%"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        size={16}
        style={{
          color: i < rating ? '#FFD700' : '#E5E7EB',
          fill: i < rating ? '#FFD700' : 'transparent',
          marginRight: 2
        }}
      />
    ));
  };

  return (
    <div style={{
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(0,0,0,0.92)',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      zIndex: 9999, 
      backdropFilter: 'blur(15px)',
      padding: '1rem'
    }}>
      <style>
        {`
          @keyframes slideInFromRight {
            from { 
              opacity: 0; 
              transform: translateX(40px) scale(0.95); 
            }
            to { 
              opacity: 1; 
              transform: translateX(0) scale(1); 
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.4); }
            50% { box-shadow: 0 0 40px rgba(255, 107, 107, 0.8); }
          }
          .discount-card {
            animation: pulseGlow 3s infinite;
          }
        `}
      </style>

      {/* Sidebar + Main Content Layout */}
      <div style={{
        display: 'flex',
        background: `linear-gradient(135deg, ${colors.white}, #F8FAFC)`,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        animation: 'slideInFromRight 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${colors.border}`
      }}>
        
        {/* Left Sidebar - Discount & Features */}
        <div style={{
          flex: '0 0 380px',
          background: `linear-gradient(135deg, ${colors.primary}15, ${colors.green}10)`,
          padding: '2.5rem 2rem',
          borderRight: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Fixed Discount Card - Improved Layout */}
          <div className="discount-card" style={{
            background: `linear-gradient(135deg, #FF6B6B, #FF8E53)`,
            color: 'white',
            padding: '1.5rem',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.3)',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%'
            }} />
            
            {/* Header Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1rem', 
              marginBottom: '1rem',
              flex: '0 0 auto'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '0.75rem',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiPlay size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.9,
                  fontWeight: '700',
                  marginBottom: '0.25rem',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  CHECKOUT GAME
                </div>
                <div style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: '800',
                  lineHeight: '1.1',
                  marginBottom: '0.5rem'
                }}>
                  Win 5% Discount!
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ 
                margin: 0,
                fontSize: '0.85rem',
                opacity: 0.95,
                lineHeight: '1.4',
                flex: 1
              }}>
                Play our quick game at checkout to unlock a <strong>5% discount</strong> on your order.
              </p>
              
              <div style={{
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                borderLeft: '3px solid rgba(255,255,255,0.5)',
                flexShrink: 0
              }}>
                <p style={{ 
                  margin: 0,
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                  opacity: 0.9,
                  lineHeight: '1.3'
                }}>
                  Enjoy smoother dialysis treatment with more affordable, consistent care
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h3 style={{ 
              margin: '0 0 1.5rem 0',
              color: colors.primary,
              fontSize: '1.2rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiTrendingUp size={18} />
              Why Choose Us
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              maxHeight: '300px',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}>
              {features.map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: colors.white,
                  borderRadius: '16px',
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${feature.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${feature.color}, ${feature.color}DD)`,
                    color: colors.white,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {feature.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <h4 style={{ 
                        margin: 0,
                        color: feature.color,
                        fontSize: '1rem',
                        fontWeight: '700',
                        lineHeight: '1.2'
                      }}>
                        {feature.title}
                      </h4>
                      <div style={{
                        background: `${feature.color}15`,
                        color: feature.color,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        flexShrink: 0,
                        marginLeft: '0.5rem'
                      }}>
                        {feature.stat}
                      </div>
                    </div>
                    <p style={{ 
                      margin: 0,
                      fontSize: '0.85rem',
                      color: colors.textMuted,
                      lineHeight: '1.5'
                    }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '2rem 2.5rem 1.5rem 2.5rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            background: colors.white
          }}>
            <div>
              <h1 style={{ 
                margin: '0 0 0.5rem 0',
                fontWeight: '800',
                fontSize: '2rem',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.green})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}>
                Enhanced CAPD Experience
              </h1>
              <p style={{ 
                margin: 0,
                color: colors.textMuted,
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Experience safer, more comfortable dialysis treatment
              </p>
            </div>
            
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: `linear-gradient(135deg, ${colors.primary}12, ${colors.green}08)`,
                color: colors.primary,
                fontSize: '1.25rem',
                cursor: 'pointer',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `linear-gradient(135deg, ${colors.primary}, ${colors.green})`;
                e.target.style.color = colors.white;
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `linear-gradient(135deg, ${colors.primary}12, ${colors.green}08)`;
                e.target.style.color = colors.primary;
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              <FiX />
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem'
          }}>
            {/* Hero Section */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              background: `linear-gradient(135deg, ${colors.primary}08, ${colors.green}05)`,
              padding: '2rem',
              borderRadius: '20px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ 
                flex: '0 0 auto',
                animation: 'float 4s ease-in-out infinite'
              }}>
                <DotLottieReact
                  src="https://lottie.host/6ec20ccc-6bbd-491c-ad6e-44591f506a34/mxQPTJHQnj.lottie"
                  loop 
                  autoplay
                  style={{ width: '100px', height: '100px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  margin: '0 0 0.75rem 0',
                  fontSize: '1.5rem',
                  color: colors.primary,
                  fontWeight: '700'
                }}>
                  Better Dialysis Experience Starts Here
                </h2>
                <p style={{ 
                  margin: 0,
                  color: colors.textDark,
                  fontSize: '0.95rem',
                  lineHeight: '1.6'
                }}>
                  Join thousands of patients who have transformed their CAPD treatment with our 
                  premium medical supplies. Experience the difference that quality and reliability 
                  can make in your daily life.
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  margin: 0,
                  color: colors.textDark,
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FiMessageSquare size={20} />
                  Patient Stories
                </h3>
                
                {/* Rating Summary */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  background: `linear-gradient(135deg, ${colors.primary}08, ${colors.green}08)`,
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  border: `1px solid ${colors.border}`
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.green})`,
                    color: colors.white,
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.25rem' }}>
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: colors.textMuted,
                      fontWeight: '600'
                    }}>
                      {totalReviews} reviews
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Grid */}
              {!loading && reviews.length > 0 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem'
                }}>
                  {reviews.map((review) => (
                    <div 
                      key={review.reviewID}
                      style={{
                        background: colors.white,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          background: `${colors.primary}10`,
                          padding: '0.5rem',
                          borderRadius: '10px',
                          color: colors.primary
                        }}>
                          <FiUser size={16} />
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: '600', 
                            fontSize: '0.9rem',
                            color: colors.textDark
                          }}>
                            {review.userName}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: colors.textMuted,
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            <FiCalendar size={12} />
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                        {renderStars(review.rating)}
                      </div>
                      
                      <p style={{ 
                        fontSize: '0.9rem', 
                        margin: 0,
                        lineHeight: '1.6',
                        color: colors.textDark
                      }}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {loading && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  color: colors.textMuted,
                  background: colors.white,
                  borderRadius: '16px',
                  border: `1px solid ${colors.border}`
                }}>
                  Loading patient stories...
                </div>
              )}
            </div>

            {/* Final CTA */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.green})`,
              color: colors.white,
              textAlign: 'center',
              padding: '2.5rem',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }} />
              
              <h3 style={{ 
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                position: 'relative',
                zIndex: 2,
                fontWeight: '700'
              }}>
                Ready for Better Treatment?
              </h3>
              <p style={{ 
                fontSize: '1rem', 
                opacity: 0.9, 
                margin: '0 0 2rem 0',
                position: 'relative',
                zIndex: 2,
                lineHeight: '1.5'
              }}>
                Join our community of satisfied patients and experience the difference today
              </p>
              <button
                onClick={onClose}
                style={{
                  background: colors.white,
                  color: colors.primary,
                  border: 'none',
                  padding: '1rem 2.5rem',
                  borderRadius: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  position: 'relative',
                  zIndex: 2,
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  margin: '0 auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                }}
              >
                Start Your Journey 
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromosModal;