import React, { useState, useEffect } from 'react';
import { FiX, FiPackage, FiCalendar, FiDollarSign, FiEye, FiClock, FiCheckCircle, FiTruck } from 'react-icons/fi';
import api from '../../api/axios';

const OrderHistoryModal = ({ isOpen, onClose, colors }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

const fetchOrders = async () => {
  try {
    setLoading(true);
    setError('');
    console.log('🔍 Starting to fetch orders...');
    
    const response = await api.get('/patient/orders');
    console.log('📦 API Response:', response);
    console.log('📊 Response data:', response.data);
    console.log('✅ Success flag:', response.data.success);
    console.log('📋 Orders data:', response.data.orders);
    
    if (response.data.success) {
      console.log(`🎉 Found ${response.data.orders?.length || 0} orders`);
      setOrders(response.data.orders || []);
    } else {
      console.error('❌ API returned success: false');
      throw new Error(response.data.message || 'Failed to fetch orders');
    }
  } catch (err) {
    console.error('💥 Error fetching orders:', err);
    console.error('Error details:', err.response?.data);
    setError('Failed to load your orders. Please try again.');
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.primary;
      case 'cancelled':
      case 'failed':
        return colors.alert;
      case 'shipped':
        return colors.green;
      default:
        return colors.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <FiCheckCircle />;
      case 'pending':
        return <FiClock />;
      case 'processing':
        return <FiPackage />;
      case 'shipped':
        return <FiTruck />;
      default:
        return <FiPackage />;
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '2rem',
    }}>
      {/* Main Orders Modal */}
      {!showOrderDetails ? (
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '16px',
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{
            padding: '2rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.primary,
            color: colors.white,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FiPackage size={24} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                  My Orders
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                  View your order history and track current orders
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: colors.white,
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'rotate(0deg)';
              }}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{
            padding: '2rem',
            maxHeight: 'calc(90vh - 120px)',
            overflowY: 'auto',
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem',
                flexDirection: 'column',
                gap: '1rem',
                color: colors.textMuted,
              }}>
                <div style={{ animation: 'spin 1s linear infinite' }}>
                  <FiPackage size={32} />
                </div>
                <p style={{ margin: 0, fontWeight: '500' }}>Loading your orders...</p>
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: colors.textMuted,
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>📦</div>
                <h3 style={{ color: colors.primary, marginBottom: '1rem' }}>Unable to Load Orders</h3>
                <p style={{ marginBottom: '2rem' }}>{error}</p>
                <button
                  onClick={fetchOrders}
                  style={{
                    padding: '1rem 2rem',
                    background: colors.primary,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                color: colors.textMuted,
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.7 }}>🛒</div>
                <h3 style={{ color: colors.primary, marginBottom: '1rem' }}>No Orders Yet</h3>
                <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                  You haven't placed any orders yet. Start shopping for medical supplies!
                </p>
                <button
                  onClick={onClose}
                  style={{
                    padding: '1rem 2rem',
                    background: colors.primary,
                    color: colors.white,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(57, 88, 134, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                {orders.map((order) => (
                  <div
                    key={order.orderID}
                    style={{
                      backgroundColor: colors.white,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => viewOrderDetails(order)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.5rem',
                        }}>
                          <h4 style={{
                            margin: 0,
                            color: colors.primary,
                            fontSize: '1.1rem',
                            fontWeight: '600',
                          }}>
                            Order #{order.orderID}
                          </h4>
                          <span style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: getStatusColor(order.order_status) + '20',
                            color: getStatusColor(order.order_status),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}>
                            {getStatusIcon(order.order_status)}
                            {order.order_status || 'Pending'}
                          </span>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2rem',
                          flexWrap: 'wrap',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: colors.textMuted,
                            fontSize: '0.9rem',
                          }}>
                            <FiCalendar size={14} />
                            <span>{formatDate(order.order_date)}</span>
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: colors.textMuted,
                            fontSize: '0.9rem',
                          }}>
                            <FiPackage size={14} />
                            <span>{order.items?.length || 0} items</span>
                          </div>
                          
                          {order.scheduled_pickup_date && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              color: colors.textMuted,
                              fontSize: '0.9rem',
                            }}>
                              <FiTruck size={14} />
                              <span>Pickup: {formatDate(order.scheduled_pickup_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{
                        textAlign: 'right',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          justifyContent: 'flex-end',
                        }}>
                          <FiDollarSign size={16} color={colors.primary} />
                          <span style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: colors.primary,
                          }}>
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        
                        <button
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: `1px solid ${colors.primary}`,
                            color: colors.primary,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = colors.primary;
                            e.target.style.color = colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = colors.primary;
                          }}
                        >
                          <FiEye size={14} />
                          View Details
                        </button>
                      </div>
                    </div>
                    
                    {/* Order Items Preview */}
                    {order.items && order.items.slice(0, 2).map((item, index) => (
                      <div
                        key={item.order_itemID}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem',
                          backgroundColor: colors.lightBg,
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: colors.border,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          color: colors.textMuted,
                          fontWeight: '600',
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: '600',
                            color: colors.primary,
                            fontSize: '0.9rem',
                          }}>
                            {item.product_name || `Item ${index + 1}`}
                          </div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: colors.textMuted,
                          }}>
                            Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                          </div>
                        </div>
                        <div style={{
                          fontWeight: '600',
                          color: colors.primary,
                          fontSize: '0.9rem',
                        }}>
                          {formatCurrency(item.total_price)}
                        </div>
                      </div>
                    ))}
                    
                    {order.items && order.items.length > 2 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '0.5rem',
                        color: colors.textMuted,
                        fontSize: '0.8rem',
                        fontWeight: '500',
                      }}>
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Order Details Modal */
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '16px',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{
            padding: '2rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.primary,
            color: colors.white,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={closeOrderDetails}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: colors.white,
                  padding: '0.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiX size={16} />
              </button>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                  Order Details
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                  #{selectedOrder?.orderID}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: colors.white,
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Order Details Content */}
          {selectedOrder && (
            <div style={{
              padding: '2rem',
              maxHeight: 'calc(90vh - 120px)',
              overflowY: 'auto',
            }}>
              {/* Order Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: colors.lightBg,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
              }}>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: colors.textMuted,
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}>
                    ORDER STATUS
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: getStatusColor(selectedOrder.order_status) + '20',
                      color: getStatusColor(selectedOrder.order_status),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      {getStatusIcon(selectedOrder.order_status)}
                      {selectedOrder.order_status || 'Pending'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: colors.textMuted,
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}>
                    ORDER DATE
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: colors.primary,
                  }}>
                    {formatDate(selectedOrder.order_date)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  color: colors.primary,
                  marginBottom: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                }}>
                  Order Items
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}>
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={item.order_itemID}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        backgroundColor: colors.white,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: colors.border,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        color: colors.textMuted,
                        fontWeight: '600',
                        flexShrink: 0,
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '600',
                          color: colors.primary,
                          marginBottom: '0.25rem',
                        }}>
                          {item.product_name || `Medical Supply Item`}
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: colors.textMuted,
                        }}>
                          Quantity: {item.quantity}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right',
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: colors.primary,
                          marginBottom: '0.25rem',
                        }}>
                          {formatCurrency(item.total_price)}
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: colors.textMuted,
                        }}>
                          {formatCurrency(item.unit_price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div style={{
                backgroundColor: colors.lightBg,
                padding: '1.5rem',
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
              }}>
                <h3 style={{
                  color: colors.primary,
                  marginBottom: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                }}>
                  Order Summary
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: colors.textMuted, fontWeight: '500' }}>Subtotal:</span>
                    <span style={{ fontWeight: '600' }}>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  
                  {selectedOrder.discount_amount > 0 && (
                    <>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ color: colors.textMuted, fontWeight: '500' }}>Discount:</span>
                        <span style={{ fontWeight: '600', color: colors.success }}>
                          -{formatCurrency(selectedOrder.discount_amount)}
                        </span>
                      </div>
                      {selectedOrder.discount_percentage > 0 && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ color: colors.textMuted, fontWeight: '500' }}>Discount Rate:</span>
                          <span style={{ fontWeight: '600', color: colors.success }}>
                            {selectedOrder.discount_percentage}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: `1px solid ${colors.border}`,
                  }}>
                    <span style={{ color: colors.primary, fontWeight: '600', fontSize: '1.1rem' }}>Total:</span>
                    <span style={{ fontWeight: '700', color: colors.primary, fontSize: '1.2rem' }}>
                      {formatCurrency(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{
                  color: colors.primary,
                  marginBottom: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                }}>
                  Payment Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: colors.textMuted,
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                    }}>
                      PAYMENT METHOD
                    </div>
                    <div style={{
                      fontWeight: '600',
                      color: colors.primary,
                    }}>
                      {selectedOrder.payment_method || 'Not specified'}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '1rem',
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      color: colors.textMuted,
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                    }}>
                      PAYMENT STATUS
                    </div>
                    <div style={{
                      fontWeight: '600',
                      color: getStatusColor(selectedOrder.payment_status),
                    }}>
                      {selectedOrder.payment_status || 'Pending'}
                    </div>
                  </div>
                  
                  {selectedOrder.payment_reference && (
                    <div style={{
                      padding: '1rem',
                      backgroundColor: colors.white,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                    }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: colors.textMuted,
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                      }}>
                        REFERENCE NUMBER
                      </div>
                      <div style={{
                        fontWeight: '600',
                        color: colors.primary,
                        fontSize: '0.9rem',
                      }}>
                        {selectedOrder.payment_reference}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pickup Information */}
              {selectedOrder.scheduled_pickup_date && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{
                    color: colors.primary,
                    marginBottom: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                  }}>
                    Pickup Information
                  </h3>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}>
                    <FiTruck size={20} color={colors.primary} />
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: colors.primary,
                        marginBottom: '0.25rem',
                      }}>
                        Scheduled Pickup
                      </div>
                      <div style={{
                        color: colors.textMuted,
                        fontSize: '0.9rem',
                      }}>
                        {formatDate(selectedOrder.scheduled_pickup_date)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OrderHistoryModal;