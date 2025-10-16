import React, { useState } from 'react';
import { 
  FiShoppingCart, 
  FiX, 
  FiMinus, 
  FiPlus, 
  FiTrash2,
  FiCreditCard,
  FiAlertTriangle,
  FiPackage
} from 'react-icons/fi';
import CheckoutModal from './CheckoutModal';

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

const CartModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  getTotalPrice, 
  getTotalCartItems, 
  getProductImage
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [modalWidth] = useState('480px');

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  const handleClose = () => {
    setShowCheckout(false);
    onClose();
  };

  const getStockStatus = (stock) => {
    if (stock > 10) return { status: 'good', text: 'In Stock', color: colors.green };
    if (stock > 5) return { status: 'warning', text: 'Low Stock', color: colors.warning };
    return { status: 'critical', text: 'Almost Gone', color: colors.alert };
  };

  if (showCheckout) {
    return (
      <CheckoutModal
        isOpen={showCheckout}
        onClose={handleCloseCheckout}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
        getTotalCartItems={getTotalCartItems}
        getProductImage={getProductImage}
        colors={colors}
      />
    );
  }

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
    }} onClick={handleClose}>
      
      <div style={{
        width: modalWidth,
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
                background: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                fontSize: '1rem'
              }}>
                <FiShoppingCart />
              </div>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: colors.primary
                }}>
                 Your Cart ({getTotalCartItems()})
                </h2>
              </div>
            </div>
            
            <button
              onClick={handleClose}
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

        {/* Cart Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 1.5rem'
        }}>
          {cart.length === 0 ? (
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
                <FiShoppingCart />
              </div>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                color: colors.primary,
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Your cart is empty
              </h3>
              <p style={{ 
                margin: 0,
                fontSize: '0.9rem',
                lineHeight: '1.4',
                color: colors.textMuted
              }}>
                Add medical supplies to get started
              </p>
            </div>
          ) : (
            <div style={{ padding: '1rem 0' }}>
              {cart.map((item) => {
                const stockStatus = getStockStatus(item.stock);
                return (
                  <div key={item.cartID} style={{
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
                      
                      {/* Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: colors.lightBg,
                          borderRadius: '8px',
                          padding: '0.25rem',
                          border: `1px solid ${colors.border}`
                        }}>
                          <button
                            onClick={() => updateQuantity(item.cartID, item.quantity - 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: colors.white,
                              color: colors.primary,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = colors.alert;
                              e.target.style.color = colors.white;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = colors.white;
                              e.target.style.color = colors.primary;
                            }}
                          >
                            <FiMinus />
                          </button>
                          
                          <span style={{
                            minWidth: '30px',
                            textAlign: 'center',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            color: colors.primary
                          }}>
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.cartID, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: item.quantity >= item.stock ? colors.border : colors.white,
                              color: item.quantity >= item.stock ? colors.textMuted : colors.primary,
                              cursor: item.quantity >= item.stock ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (item.quantity < item.stock) {
                                e.target.style.backgroundColor = colors.green;
                                e.target.style.color = colors.white;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (item.quantity < item.stock) {
                                e.target.style.backgroundColor = colors.white;
                                e.target.style.color = colors.primary;
                              }
                            }}
                          >
                            <FiPlus />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.cartID)}
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: 'transparent',
                            color: colors.alert,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600'
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
                          Remove
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
        {cart.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: `1px solid ${colors.border}`,
            background: colors.white,
            position: 'sticky',
            bottom: 0
          }}>
            {/* Critical Stock Warning */}
            {cart.some(item => item.stock <= 3) && (
              <div style={{
                backgroundColor: `${colors.warning}08`,
                border: `1px solid ${colors.warning}20`,
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <FiAlertTriangle size={14} style={{ color: colors.warning, flexShrink: 0, marginTop: '1px' }} />
                <span style={{
                  fontSize: '0.8rem',
                  color: colors.warning,
                  fontWeight: '500',
                  lineHeight: '1.3'
                }}>
                  Some items are running low. Order soon to avoid missing out.
                </span>
              </div>
            )}

            {/* Total Section */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              padding: '0.75rem 0'
            }}>
              <div>
                <div style={{ 
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: colors.textMuted,
                  marginBottom: '0.25rem'
                }}>
                  Total
                </div>
                <div style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: colors.primary
                }}>
                  ₱{getTotalPrice().toLocaleString()}
                </div>
              </div>
              
              <div style={{
                textAlign: 'right'
              }}>
                <div style={{ 
                  fontSize: '0.8rem',
                  color: colors.textMuted,
                  marginBottom: '0.25rem'
                }}>
                  {getTotalCartItems()} item{getTotalCartItems() !== 1 ? 's' : ''}
                </div>
                <div style={{ 
                  fontSize: '0.8rem',
                  color: colors.textMuted
                }}>
                  {cart.length} product{cart.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              <button
                onClick={clearCart}
                style={{
                  flex: 1,
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
                  e.target.style.borderColor = colors.alert;
                  e.target.style.color = colors.alert;
                  e.target.style.backgroundColor = `${colors.alert}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.textMuted;
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Clear All
              </button>
              
              <button
                onClick={handleCheckout}
                style={{
                  flex: 2,
                  padding: '0.875rem 1.25rem',
                  background: colors.primary,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 8px rgba(57, 88, 134, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2d4669';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = colors.primary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(57, 88, 134, 0.3)';
                }}
              >
                <FiCreditCard size={16} />
                Checkout
              </button>
            </div>
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

export default CartModal;