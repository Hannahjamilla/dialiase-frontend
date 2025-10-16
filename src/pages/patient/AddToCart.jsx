import React from 'react';
import { FiPlus, FiPackage, FiStar, FiHeart, FiX, FiShoppingCart, FiEye } from 'react-icons/fi';

// Color palette
const colors = {
  primary: '#395886',
  white: '#FFFFFF',
  green: '#477876', // Updated to #477876
  secondary: '#6B7280',
  lightBg: '#F8FAFC',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  cardBg: '#FFFFFF',
  success: '#477876', // Updated to #477876
  warning: '#F59E0B',
  alert: '#EF4444',
  background: '#FFFFFF',
  subtle: '#F3F4F6'
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, onImageClick, onToggleFavorite, onShowReviews, isFavorite, isInWishlist, getProductImage }) => {
  
  const handleImageHover = (e, scale) => {
    const img = e.currentTarget.querySelector('img');
    if (img) {
      img.style.transform = `scale(${scale})`;
    }
  };

  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${colors.border}`,
      position: 'relative',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }}
    >
      {product.isFeatured && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          backgroundColor: colors.primary,
          color: colors.white,
          padding: '0.4rem 0.8rem',
          borderRadius: '16px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          zIndex: 2
        }}>
          ⭐ Featured
        </div>
      )}

      {/* Action Buttons Container */}
      <div style={{
        position: 'absolute',
        top: '0.75rem',
        right: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 2
      }}>
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.supplyID);
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: `1px solid ${isInWishlist ? colors.green : colors.border}`,
            backgroundColor: isInWishlist ? colors.green : colors.white,
            color: isInWishlist ? colors.white : colors.textMuted,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isInWishlist) {
              e.target.style.borderColor = colors.green;
              e.target.style.color = colors.green;
              e.target.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isInWishlist) {
              e.target.style.borderColor = colors.border;
              e.target.style.color = colors.textMuted;
              e.target.style.transform = 'scale(1)';
            }
          }}
        >
          <FiHeart fill={isInWishlist ? colors.green : 'transparent'} />
        </button>

        {/* Reviews Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowReviews(product);
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.white,
            color: colors.textMuted,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = colors.primary;
            e.target.style.color = colors.primary;
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = colors.border;
            e.target.style.color = colors.textMuted;
            e.target.style.transform = 'scale(1)';
          }}
        >
          <FiStar />
        </button>
      </div>

      <div 
        onClick={() => onImageClick(product)}
        style={{
          width: '100%',
          height: '200px',
          backgroundColor: colors.lightBg,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.primary;
          handleImageHover(e, 1.05);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border;
          handleImageHover(e, 1);
        }}
      >
        <img 
          src={getProductImage(product)} 
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.parentElement.querySelector('.image-fallback');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="image-fallback" style={{
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <FiPackage size={48} />
          <span style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: '500' }}>
            No image available
          </span>
        </div>
      </div>

      {product.stock <= (product.minStock || 5) && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: product.isFeatured ? '4.5rem' : '1rem',
          backgroundColor: product.stock === 0 ? colors.alert : colors.warning,
          color: colors.white,
          padding: '0.4rem 0.8rem',
          borderRadius: '16px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          zIndex: 2
        }}>
          {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
        </div>
      )}

      <div style={{ flex: 1, marginBottom: '1.25rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
          gap: '1rem'
        }}>
          <h3 style={{ 
            margin: 0,
            color: colors.primary,
            fontSize: '1.1rem',
            fontWeight: '600',
            lineHeight: '1.3',
            flex: 1
          }}>
            {product.name}
          </h3>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              color: colors.primary,
              fontSize: '1.3rem',
              fontWeight: '700'
            }}>
              ₱{product.price ? product.price.toLocaleString() : '0'}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.1rem' }}>
            {[1,2,3,4,5].map(star => (
              <FiStar 
                key={star}
                size={14}
                fill={star <= Math.floor(product.rating || 0) ? colors.warning : 'transparent'}
                color={star <= Math.floor(product.rating || 0) ? colors.warning : colors.border}
              />
            ))}
          </div>
          <span style={{
            color: colors.textMuted,
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {product.rating ? product.rating.toFixed(1) : '4.0'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowReviews(product);
            }}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: colors.textMuted,
              fontSize: '0.7rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = colors.primary;
              e.target.style.backgroundColor = `${colors.primary}10`;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = colors.textMuted;
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            See Reviews
          </button>
        </div>

        <p style={{
          color: colors.textMuted,
          fontSize: '0.9rem',
          margin: '0 0 1rem 0',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description || 'No description available.'}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <span style={{
            color: product.stock > 10 ? colors.green : 
                  product.stock > 0 ? colors.warning : colors.alert,
            fontSize: '0.85rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: `${product.stock > 10 ? colors.green : 
                            product.stock > 0 ? colors.warning : colors.alert}15`,
            padding: '0.4rem 0.8rem',
            borderRadius: '16px'
          }}>
            <FiPackage size={14} />
            {product.stock || 0} in stock
          </span>
          <span style={{
            color: colors.textMuted,
            fontSize: '0.8rem',
            fontWeight: '500',
            backgroundColor: colors.lightBg,
            padding: '0.4rem 0.8rem',
            borderRadius: '16px',
            textTransform: 'capitalize'
          }}>
            {product.category || 'uncategorized'}
          </span>
        </div>
      </div>

      <button
        onClick={(e) => onAddToCart(product, e)}
        disabled={!product.stock || product.stock === 0}
        style={{
          width: '100%',
          padding: '1rem',
          background: (!product.stock || product.stock === 0) 
            ? colors.border 
            : colors.primary,
          color: colors.white,
          border: 'none',
          borderRadius: '8px',
          cursor: (!product.stock || product.stock === 0) ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '0.95rem',
          opacity: (!product.stock || product.stock === 0) ? 0.6 : 1,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
          if (product.stock > 0) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (product.stock > 0) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }
        }}
      >
        <FiPlus />
        {(!product.stock || product.stock === 0) ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
};

// Product List Item Component
const ProductListItem = ({ product, onAddToCart, onImageClick, onToggleFavorite, onShowReviews, isFavorite, isInWishlist, getProductImage }) => {
  
  const handleImageHover = (e, scale) => {
    const img = e.currentTarget.querySelector('img');
    if (img) {
      img.style.transform = `scale(${scale})`;
    }
  };

  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center',
      border: `1px solid ${colors.border}`,
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }}
    >
      <div 
        onClick={() => onImageClick(product)}
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: colors.lightBg,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.primary;
          handleImageHover(e, 1.1);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border;
          handleImageHover(e, 1);
        }}
      >
        <img 
          src={getProductImage(product)} 
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            const fallback = e.target.parentElement.querySelector('.image-fallback');
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="image-fallback" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}>
          <FiPackage size={32} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h3 style={{ 
                margin: 0,
                color: colors.primary,
                fontSize: '1.1rem',
                fontWeight: '600',
                flex: 1
              }}>
                {product.name}
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Reviews Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowReviews(product);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: colors.textMuted
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.color = colors.primary;
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.color = colors.textMuted;
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <FiStar size={14} />
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(product.supplyID);
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${isInWishlist ? colors.green : colors.border}`,
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: isInWishlist ? colors.green : colors.textMuted
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.color = colors.green;
                    e.target.style.borderColor = colors.green;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    if (!isInWishlist) {
                      e.target.style.color = colors.textMuted;
                      e.target.style.borderColor = colors.border;
                    }
                  }}
                >
                  <FiHeart size={16} fill={isInWishlist ? colors.green : 'transparent'} />
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', gap: '0.1rem' }}>
                {[1,2,3,4,5].map(star => (
                  <FiStar 
                    key={star}
                    size={14}
                    fill={star <= Math.floor(product.rating || 0) ? colors.warning : 'transparent'}
                    color={star <= Math.floor(product.rating || 0) ? colors.warning : colors.border}
                  />
                ))}
              </div>
              <span style={{
                color: colors.textMuted,
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {product.rating ? product.rating.toFixed(1) : '4.0'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowReviews(product);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: colors.textMuted,
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = colors.primary;
                  e.target.style.backgroundColor = `${colors.primary}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colors.textMuted;
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                See Reviews
              </button>
            </div>

            <p style={{
              color: colors.textMuted,
              fontSize: '0.9rem',
              margin: '0 0 1rem 0',
              lineHeight: '1.5'
            }}>
              {product.description || 'No description available.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                color: product.stock > 10 ? colors.green : 
                      product.stock > 0 ? colors.warning : colors.alert,
                fontSize: '0.85rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: `${product.stock > 10 ? colors.green : 
                                product.stock > 0 ? colors.warning : colors.alert}15`,
                padding: '0.4rem 0.8rem',
                borderRadius: '16px'
              }}>
                <FiPackage size={14} />
                {product.stock || 0} in stock
              </span>
              <span style={{
                color: colors.textMuted,
                fontSize: '0.8rem',
                fontWeight: '500',
                backgroundColor: colors.lightBg,
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                textTransform: 'capitalize'
              }}>
                {product.category || 'uncategorized'}
              </span>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', minWidth: '120px' }}>
            <span style={{
              color: colors.primary,
              fontSize: '1.4rem',
              fontWeight: '700',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              ₱{product.price ? product.price.toLocaleString() : '0'}
            </span>
            
            <button
              onClick={(e) => onAddToCart(product, e)}
              disabled={!product.stock || product.stock === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: (!product.stock || product.stock === 0) 
                  ? colors.border 
                  : colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: (!product.stock || product.stock === 0) ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                opacity: (!product.stock || product.stock === 0) ? 0.6 : 1,
                minWidth: '140px',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (product.stock > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <FiPlus />
              {(!product.stock || product.stock === 0) ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Modal Component
const ImageModal = ({ image, onClose, onAddToCart, onToggleFavorite, isFavorite }) => {
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
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease-out',
      padding: '1.5rem'
    }} onClick={onClose}>
      
      <div style={{
        width: '95vw',
        maxWidth: '1000px',
        height: 'auto',
        maxHeight: '90vh',
        backgroundColor: colors.white,
        borderRadius: '12px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        animation: 'scaleIn 0.4s ease-out',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.white,
            color: colors.textMuted,
            fontSize: '1.2rem',
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
          padding: '2rem',
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
              borderRadius: '8px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)';
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
              top: '1.5rem',
              left: '1.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: `1px solid ${isFavorite ? colors.green : colors.border}`,
              backgroundColor: isFavorite ? colors.green : colors.white,
              color: isFavorite ? colors.white : colors.textMuted,
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              if (!isFavorite) {
                e.target.style.borderColor = colors.green;
                e.target.style.color = colors.green;
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
            <FiHeart fill={isFavorite ? colors.green : 'transparent'} />
          </button>
        </div>

        {/* Content Section - Right Side */}
        <div style={{
          flex: 1,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          overflowY: 'auto',
          maxHeight: '90vh'
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
                  backgroundColor: colors.primary,
                  color: colors.white,
                  padding: '0.4rem 0.8rem',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Featured
                </span>
              )}
              <span style={{
                backgroundColor: colors.green,
                color: colors.white,
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {image.category || 'Medical Supply'}
              </span>
            </div>

            <h1 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.75rem',
              fontWeight: '700',
              color: colors.primary,
              lineHeight: '1.2'
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
                    size={16}
                    color={star <= Math.floor(image.rating || 4) ? colors.warning : colors.border}
                    fill={star <= Math.floor(image.rating || 4) ? colors.warning : 'transparent'}
                  />
                ))}
              </div>
              <span style={{
                color: colors.textMuted,
                fontWeight: '500',
                fontSize: '0.9rem'
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
                fontSize: '2rem',
                fontWeight: '700',
                color: colors.primary
              }}>
                ₱{image.price?.toLocaleString()}
              </span>
              
              <span style={{
                fontSize: '0.9rem',
                color: colors.textMuted,
                backgroundColor: image.stock > 10 ? `${colors.green}15` : `${colors.warning}15`,
                color: image.stock > 10 ? colors.green : colors.warning,
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
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
              fontSize: '1.2rem',
              fontWeight: '600',
              color: colors.primary
            }}>
              Product Description
            </h3>
            <p style={{
              margin: 0,
              color: colors.textMuted,
              lineHeight: '1.6',
              fontSize: '0.95rem'
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
                padding: '1rem 2rem',
                background: image.stock <= 0 
                  ? colors.border 
                  : colors.primary,
                color: colors.white,
                border: 'none',
                borderRadius: '8px',
                cursor: image.stock <= 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                if (image.stock > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (image.stock > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <FiShoppingCart size={18} />
              {image.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '1rem 2rem',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: colors.textMuted,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.95rem',
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

// Bounce Animation Component
const BounceAnimation = ({ startPos, product }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: startPos.x,
        top: startPos.y,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: colors.green, // Updated to use the green color
        color: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        fontWeight: '600',
        zIndex: 9999,
        animation: `bounceToCart 0.6s ease-in-out forwards`,
        boxShadow: '0 4px 12px rgba(71, 120, 118, 0.3)', // Updated shadow color
        border: `2px solid ${colors.white}`
      }}
    >
      <FiPlus />
      <style>{`
        @keyframes bounceToCart {
          0% {
            transform: scale(1) translate(0, 0);
            opacity: 1;
          }
          25% {
            transform: scale(1.2) translate(0, -20px);
          }
          50% {
            transform: scale(1.1) translate(0, 10px);
          }
          75% {
            transform: scale(0.9) translate(0, -5px);
          }
          100% {
            transform: scale(0) translate(0, 0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Pulse & Fade Animation Component
const PulseFadeAnimation = ({ startPos, product }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: startPos.x - 20,
        top: startPos.y - 20,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: colors.green, // Updated to use the green color
        color: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        fontWeight: '600',
        zIndex: 9999,
        animation: `pulseFade 0.8s ease-out forwards`,
        boxShadow: '0 0 0 0 rgba(71, 120, 118, 0.7)', // Updated shadow color
        border: `2px solid ${colors.white}`
      }}
    >
      ✓
      <style>{`
        @keyframes pulseFade {
          0% {
            transform: scale(0.8);
            opacity: 1;
            boxShadow: 0 0 0 0 rgba(71, 120, 118, 0.7);
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
            boxShadow: 0 0 0 15px rgba(71, 120, 118, 0);
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
            boxShadow: 0 0 0 30px rgba(71, 120, 118, 0);
          }
        }
      `}</style>
    </div>
  );
};

// Scale & Spin Animation Component
const ScaleSpinAnimation = ({ startPos, product }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: startPos.x,
        top: startPos.y,
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: colors.green, // Updated to use the green color
        color: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        fontWeight: '600',
        zIndex: 9999,
        animation: `scaleSpin 0.7s ease-in-out forwards`,
        boxShadow: '0 4px 12px rgba(71, 120, 118, 0.3)' // Updated shadow color
      }}
    >
      <FiShoppingCart />
      <style>{`
        @keyframes scaleSpin {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Floating Numbers Animation Component
const FloatingNumbersAnimation = ({ startPos, product }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: startPos.x,
        top: startPos.y,
        color: colors.green, // Updated to use the green color
        fontSize: '1.3rem',
        fontWeight: '700',
        zIndex: 9999,
        animation: `floatUp 1s ease-out forwards`,
        textShadow: '0 2px 8px rgba(71, 120, 118, 0.4)', // Updated shadow color
        pointerEvents: 'none'
      }}
    >
      +1
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-25px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-50px) scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Confetti Burst Animation Component
const ConfettiBurstAnimation = ({ startPos }) => {
  const confettiPieces = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45) * (Math.PI / 180);
    const distance = 40;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: [colors.primary, colors.green, colors.warning, colors.alert][i % 4],
      delay: i * 0.1
    };
  });

  return (
    <>
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          style={{
            position: 'fixed',
            left: startPos.x,
            top: startPos.y,
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: piece.color,
            zIndex: 9999,
            animation: `confettiBurst 0.8s ease-out ${piece.delay}s forwards`,
            boxShadow: '0 0 3px rgba(255,255,255,0.8)'
          }}
        />
      ))}
      <style>{`
        @keyframes confettiBurst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(${confettiPieces[0]?.x || 0}px, ${confettiPieces[0]?.y || 0}px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

// Ripple Wave Animation Component
const RippleWaveAnimation = ({ startPos }) => {
  const ripples = Array.from({ length: 2 }, (_, i) => ({
    id: i,
    size: 30 + (i * 25),
    delay: i * 0.2
  }));

  return (
    <>
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          style={{
            position: 'fixed',
            left: startPos.x - ripple.size / 2,
            top: startPos.y - ripple.size / 2,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            borderRadius: '50%',
            border: `1px solid ${colors.green}`, // Updated to use the green color
            zIndex: 9999,
            animation: `rippleWave 0.8s ease-out ${ripple.delay}s forwards`,
            pointerEvents: 'none'
          }}
        />
      ))}
      <style>{`
        @keyframes rippleWave {
          0% {
            transform: scale(0.1);
            opacity: 1;
            border-width: 2px;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
            border-width: 1px;
          }
        }
      `}</style>
    </>
  );
};

// Export all components
const AddToCart = {
  ProductCard,
  ProductListItem,
  ImageModal,
  FlyingItem: BounceAnimation, // Default animation
  BounceAnimation,
  PulseFadeAnimation,
  ScaleSpinAnimation,
  FloatingNumbersAnimation,
  ConfettiBurstAnimation,
  RippleWaveAnimation
};

export default AddToCart;