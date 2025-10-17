import React from 'react';
import { FiX, FiStar, FiPackage, FiShoppingCart, FiHeart } from 'react-icons/fi';

const ImageModal = ({ image, onClose, colors, onAddToCart, onToggleFavorite, isFavorite }) => {
  if (!image) return null;

  const handleAddToCart = (e) => {
    if (onAddToCart) {
      onAddToCart(image, e);
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(image.id || image.supplyID);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease-out',
      backdropFilter: 'blur(8px)',
      padding: '1.5rem'
    }} onClick={onClose}>
      
      <div style={{
        width: '95vw',
        maxWidth: '1100px',
        height: 'auto',
        maxHeight: '90vh',
        backgroundColor: colors.white,
        borderRadius: '20px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: `2px solid ${colors.border}`,
            backgroundColor: colors.white,
            color: colors.textMuted,
            fontSize: '1.3rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = colors.alert;
            e.target.style.color = colors.alert;
            e.target.style.transform = 'rotate(90deg) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.color = colors.textMuted;
            e.target.style.transform = 'rotate(0deg) scale(1)';
          }}
        >
          <FiX />
        </button>

        {/* Image Section - Left Side */}
        <div style={{
          flex: '0 0 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          backgroundColor: colors.lightBg,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img 
            src={image.url} 
            alt={image.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              border: `2px solid ${isFavorite ? colors.alert : colors.border}`,
              backgroundColor: isFavorite ? colors.alert : colors.white,
              color: isFavorite ? colors.white : colors.textMuted,
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              if (!isFavorite) {
                e.target.style.borderColor = colors.alert;
                e.target.style.color = colors.alert;
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isFavorite) {
                e.target.style.borderColor = colors.border;
                e.target.style.color = colors.textMuted;
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            <FiHeart fill={isFavorite ? colors.alert : 'transparent'} />
          </button>
        </div>

        {/* Content Section - Right Side */}
        <div style={{
          flex: 1,
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          overflowY: 'auto',
          maxHeight: '90vh',
          background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.lightBg} 100%)`
        }} className="modal-details">

          {/* Header */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              {image.isFeatured && (
                <span style={{
                  backgroundColor: colors.premium,
                  color: colors.white,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Featured
                </span>
              )}
              <span style={{
                backgroundColor: colors.accent,
                color: colors.white,
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {image.category || 'Medical Supply'}
              </span>
            </div>

            <h1 style={{
              margin: '0 0 1rem 0',
              fontSize: '2rem',
              fontWeight: '800',
              color: colors.primary,
              lineHeight: '1.2',
              letterSpacing: '-0.5px'
            }}>
              {image.name}
            </h1>

            {/* Rating */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={18}
                    color={star <= Math.floor(image.rating || 4) ? '#FFD700' : colors.border}
                    fill={star <= Math.floor(image.rating || 4) ? '#FFD700' : 'transparent'}
                  />
                ))}
              </div>
              <span style={{
                color: colors.textMuted,
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                {image.rating ? image.rating.toFixed(1) : '4.0'} rating
              </span>
            </div>

            {/* Price and Stock */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '2.2rem',
                fontWeight: '800',
                color: colors.accent,
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ₱{image.price?.toLocaleString()}
              </span>
              
              <span style={{
                backgroundColor: image.stock > 10 ? `${colors.success}15` : `${colors.warning}15`,
                color: image.stock > 10 ? colors.success : colors.warning,
                padding: '0.5rem 1rem',
                borderRadius: '16px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <FiPackage size={14} />
                {image.stock > 10 ? `${image.stock} in stock` : `Only ${image.stock} left`}
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.3rem',
              fontWeight: '700',
              color: colors.primary
            }}>
              Product Description
            </h3>
            <p style={{
              margin: 0,
              color: colors.textMuted,
              lineHeight: '1.7',
              fontSize: '1rem'
            }}>
              {image.description || 'High-quality medical supply designed for professional healthcare use. This product meets all medical standards and provides reliable performance for medical professionals.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: 'auto'
          }}>
            <button
              onClick={handleAddToCart}
              disabled={image.stock <= 0}
              style={{
                flex: 2,
                padding: '1.1rem 2rem',
                background: image.stock <= 0 
                  ? colors.border 
                  : `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
                color: colors.white,
                border: 'none',
                borderRadius: '12px',
                cursor: image.stock <= 0 ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '1.05rem',
                transition: 'all 0.3s ease',
                boxShadow: image.stock <= 0 ? 'none' : '0 8px 25px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (image.stock > 0) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (image.stock > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }
              }}
            >
              <FiShoppingCart size={20} />
              {image.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '1.1rem 2rem',
                border: `2px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: colors.textMuted,
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.color = colors.primary;
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.color = colors.textMuted;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .modal-details::-webkit-scrollbar {
          width: 6px;
        }
        
        .modal-details::-webkit-scrollbar-track {
          background: ${colors.lightBg};
        }
        
        .modal-details::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 3px;
        }
        
        .modal-details::-webkit-scrollbar-thumb:hover {
          background: ${colors.textMuted};
        }
      `}</style>
    </div>
  );
};

export default ImageModal;