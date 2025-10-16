import React, { useState, useEffect } from 'react';
import { FiHeart, FiX, FiShoppingCart, FiTrash2, FiPackage, FiAlertCircle } from 'react-icons/fi';
import api from '../../api/axios';

// Color palette
const colors = {
  primary: '#395886',
  white: '#FFFFFF',
  green: '#477977',
  secondary: '#6B7280',
  lightBg: '#F8FAFC',
  textMuted: '#6B7280',
  textDark: '#374151',
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  cardBg: '#FFFFFF',
  success: '#477977',
  warning: '#F59E0B',
  alert: '#EF4444',
  background: '#FFFFFF',
  subtle: '#F3F4F6'
};

const WishlistModal = ({ isOpen, onClose, onAddToCart, getProductImage }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patient/wishlist');
      if (response.data.success) {
        setWishlist(response.data.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (supplyID) => {
    try {
      const response = await api.delete(`/patient/wishlist/remove/${supplyID}`);
      if (response.data.success) {
        setWishlist(prev => prev.filter(item => item.supplyID !== supplyID));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const moveToCart = async (product) => {
    if (onAddToCart) {
      // Create a synthetic event for the addToCart function
      const syntheticEvent = {
        currentTarget: document.createElement('button')
      };
      await onAddToCart(product, syntheticEvent);
      await removeFromWishlist(product.supplyID);
    }
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { status: 'good', text: 'In Stock', color: colors.green };
    if (stock > 5) return { status: 'warning', text: 'Low Stock', color: colors.warning };
    return { status: 'critical', text: 'Almost Gone', color: colors.alert };
  };

  useEffect(() => {
    if (isOpen) {
      fetchWishlist();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease-out'
    }} onClick={onClose}>
      
      <div style={{
        width: '480px',
        height: '100vh',
        backgroundColor: colors.white,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1rem 1.5rem',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.white,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: colors.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                fontSize: '1rem'
              }}>
                <FiHeart />
              </div>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: colors.primary
                }}>
                  My Wishlist ({wishlist.length})
                </h2>
              </div>
            </div>
            
            <button
              onClick={onClose}
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
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = colors.alert;
                e.target.style.color = colors.alert;
                e.target.style.backgroundColor = `${colors.alert}10`;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.color = colors.textMuted;
                e.target.style.backgroundColor = colors.white;
              }}
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Wishlist Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 1.5rem'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: colors.textMuted
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: `3px solid ${colors.border}`,
                borderTopColor: colors.green,
                margin: '0 auto 1rem auto',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading your wishlist...</p>
            </div>
          ) : wishlist.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: colors.textMuted
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: colors.lightBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: colors.textMuted,
                fontSize: '1.5rem'
              }}>
                <FiHeart />
              </div>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                color: colors.primary,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Your wishlist is empty
              </h3>
              <p style={{ 
                margin: 0,
                fontSize: '0.9rem',
                lineHeight: '1.4',
                color: colors.textMuted
              }}>
                Save your favorite medical supplies for later
              </p>
            </div>
          ) : (
            <div style={{ padding: '1rem 0' }}>
              {wishlist.map((item) => {
                const stockStatus = getStockStatus(item.stock);
                return (
                  <div key={item.wishlistID} style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    backgroundColor: colors.white,
                    marginBottom: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    {/* Product Image */}
                    <div style={{
                      position: 'relative',
                      flexShrink: 0
                    }}>
                      <img 
                        src={getProductImage(item)} 
                        alt={item.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          backgroundColor: colors.lightBg
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        backgroundColor: colors.lightBg,
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.textMuted,
                        fontSize: '1.25rem'
                      }}>
                        <FiPackage />
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div style={{ 
                      flex: 1, 
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 0.25rem 0', 
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: colors.primary,
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.name}
                        </h4>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ 
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: colors.primary
                          }}>
                            ₱{item.price?.toLocaleString()}
                          </span>
                          
                          <span style={{
                            fontSize: '0.7rem',
                            backgroundColor: `${stockStatus.color}15`,
                            color: stockStatus.color,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            border: `1px solid ${stockStatus.color}30`
                          }}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={() => moveToCart(item)}
                          disabled={item.stock <= 0}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            background: item.stock <= 0 ? colors.border : colors.primary,
                            color: colors.white,
                            border: 'none',
                            borderRadius: '6px',
                            cursor: item.stock <= 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                          }}
                          onMouseEnter={(e) => {
                            if (item.stock > 0) {
                              e.target.style.background = '#2d4669';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (item.stock > 0) {
                              e.target.style.background = colors.primary;
                            }
                          }}
                        >
                          <FiShoppingCart size={12} />
                          {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        
                        <button
                          onClick={() => removeFromWishlist(item.supplyID)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: 'transparent',
                            color: colors.alert,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.alert;
                            e.target.style.color = colors.white;
                            e.target.style.borderColor = colors.alert;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = colors.alert;
                            e.target.style.borderColor = colors.border;
                          }}
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: `1px solid ${colors.border}`,
            background: colors.white
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              backgroundColor: `${colors.green}08`,
              border: `1px solid ${colors.green}20`,
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <FiAlertCircle size={16} style={{ color: colors.green, flexShrink: 0 }} />
              <span style={{
                fontSize: '0.8rem',
                color: colors.green,
                fontWeight: '500',
                lineHeight: '1.3'
              }}>
                Items in your wishlist are saved for 30 days
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: `1px solid ${colors.border}`,
                backgroundColor: 'transparent',
                color: colors.textMuted,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.color = colors.primary;
                e.target.style.backgroundColor = `${colors.primary}10`;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.color = colors.textMuted;
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${colors.lightBg};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.textMuted};
        }
      `}</style>
    </div>
  );
};

export default WishlistModal;