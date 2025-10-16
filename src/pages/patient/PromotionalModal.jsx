import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FiX, FiUsers, FiMessageCircle, FiAward, FiTrendingUp, FiHeart, FiShare2 } from 'react-icons/fi';

const PromotionalModal = ({ isOpen, onClose, colors, user }) => {
  const modalSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.9)',
    config: { tension: 170, friction: 20 },
  });

  const backdropSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { tension: 180, friction: 20 },
  });

  if (!isOpen) return null;

  return (
    <animated.div
      style={{
        ...backdropSpring,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3000,
        backdropFilter: 'blur(6px)',
        padding: '1rem',
      }}
    >
      <animated.div
        style={{
          ...modalSpring,
          backgroundColor: colors.white,
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          maxWidth: '1200px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          height: 'auto',
        }}
      >
        {/* LEFT SECTION - Visual Engagement */}
        <div
          style={{
            flex: 1,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            color: colors.white,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '3rem',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '600px',
          }}
        >
          {/* Animated Background Elements */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}></div>
          
          <DotLottieReact
            src="https://lottie.host/47fff4b9-c21f-43c8-8cac-90b001420a30/YvpWK0ZRK5.lottie"
            style={{ width: '280px', height: '280px', marginBottom: '2rem', zIndex: 2 }}
            loop
            autoplay
          />

          <div style={{ zIndex: 2, position: 'relative' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                marginBottom: '1rem',
                letterSpacing: '-1px',
                lineHeight: '1.1',
              }}
            >
              Join Our<br />Community
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
              Connect, Share, and Grow Together
            </p>
          </div>
        </div>

        {/* RIGHT SECTION - Interactive Features with Scroll */}
        <div
          style={{
            flex: 1,
            background: colors.white,
            display: 'flex',
            flexDirection: 'column',
            padding: '3rem',
            maxHeight: '600px',
            overflow: 'hidden',
          }}
        >
          {/* Welcome Message */}
          <div style={{ marginBottom: '2rem', flexShrink: 0 }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700', 
              color: colors.primary,
              marginBottom: '0.5rem'
            }}>
              Welcome{user?.name ? `, ${user.name}` : ''}! 👋
            </h2>
            <p style={{ color: colors.textMuted, fontSize: '1rem' }}>
              Unlock exclusive features and connect with our community
            </p>
          </div>

          {/* Scrollable Engagement Features */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            paddingRight: '0.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                {
                  icon: <FiMessageCircle size={22} color={colors.green} />,
                  title: 'Share Your Experience',
                  desc: 'Write reviews and help others make informed decisions about medical supplies',
                  action: 'Start Reviewing',
                  bg: `${colors.green}15`,
                },
                {
                  icon: <FiHeart size={22} color={colors.error} />,
                  title: 'Build Your Favorites',
                  desc: 'Save products you love and get personalized recommendations for your needs',
                  action: 'Create List',
                  bg: `${colors.error}15`,
                },
                {
                  icon: <FiUsers size={22} color={colors.primary} />,
                  title: 'Join Discussions',
                  desc: 'Connect with other patients and healthcare professionals in our community forum',
                  action: 'Join Community',
                  bg: `${colors.primary}15`,
                },
                {
                  icon: <FiAward size={22} color={colors.warning} />,
                  title: 'Earn Rewards',
                  desc: 'Get points for your engagement and redeem exclusive benefits and discounts',
                  action: 'Learn More',
                  bg: `${colors.warning}15`,
                },
                {
                  icon: <FiTrendingUp size={22} color={colors.green} />,
                  title: 'Track Your Health',
                  desc: 'Monitor your medical supply usage and get insights for better management',
                  action: 'Get Started',
                  bg: `${colors.green}15`,
                },
                {
                  icon: <FiShare2 size={22} color={colors.primary} />,
                  title: 'Share Knowledge',
                  desc: 'Contribute to our knowledge base and help others in their healthcare journey',
                  action: 'Contribute',
                  bg: `${colors.primary}15`,
                },
              ].map((item, idx) => (
                <animated.div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.2rem',
                    backgroundColor: colors.lightGray,
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: isOpen ? 1 : 0,
                    transform: `translateX(${isOpen ? 0 : 20}px)`,
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    e.currentTarget.style.backgroundColor = item.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = colors.lightGray;
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: item.bg,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: colors.primary, 
                      marginBottom: '0.3rem',
                      lineHeight: '1.3'
                    }}>
                      {item.title}
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: colors.textMuted,
                      lineHeight: '1.4'
                    }}>
                      {item.desc}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: colors.primary,
                    padding: '0.4rem 0.8rem',
                    backgroundColor: `${colors.primary}15`,
                    borderRadius: '16px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {item.action}
                  </div>
                </animated.div>
              ))}
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexShrink: 0,
            paddingTop: '1rem',
            borderTop: `1px solid ${colors.border}`
          }}>
            <animated.button
              onClick={onClose}
              style={{
                flex: 2,
                padding: '1rem 1.5rem',
                backgroundColor: colors.primary,
                border: 'none',
                color: colors.white,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: `0 6px 20px ${colors.primary}40`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 10px 30px ${colors.primary}60`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 6px 20px ${colors.primary}40`;
              }}
            >
              <FiTrendingUp size={18} />
              Let's Go!
            </animated.button>

          </div>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            color: colors.primary,
            cursor: 'pointer',
            padding: '0.8rem',
            borderRadius: '50%',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.primary;
            e.target.style.color = colors.white;
            e.target.style.transform = 'rotate(90deg) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.95)';
            e.target.style.color = colors.primary;
            e.target.style.transform = 'rotate(0deg) scale(1)';
          }}
        >
          <FiX size={20} />
        </button>

        {/* Custom Scrollbar Styling */}
        <style>
          {`
            .scroll-container::-webkit-scrollbar {
              width: 6px;
            }
            
            .scroll-container::-webkit-scrollbar-track {
              background: ${colors.lightGray};
              border-radius: 3px;
            }
            
            .scroll-container::-webkit-scrollbar-thumb {
              background: ${colors.border};
              border-radius: 3px;
            }
            
            .scroll-container::-webkit-scrollbar-thumb:hover {
              background: ${colors.darkGray};
            }
          `}
        </style>
      </animated.div>
    </animated.div>
  );
};

export default PromotionalModal;