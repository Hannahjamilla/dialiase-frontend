import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiArrowLeft, FiPackage } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const BuyMedprod = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightBg: '#F5F8FC',
    alert: '#FF6B6B',
    warning: '#FFA500',
    success: '#4CAF50',
    info: '#17a2b8',
    textMuted: '#6c757d'
  };

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/medical-products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('/api/medical-products/cart');
      if (response.data.success) {
        setCartItems(response.data.cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setCartLoading(true);
      const response = await axios.post('/api/medical-products/cart/add', {
        product_id: productId,
        quantity: quantity
      });

      if (response.data.success) {
        toast.success('Product added to cart!');
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await axios.delete(`/api/medical-products/cart/remove/${cartItemId}`);
      if (response.data.success) {
        toast.success('Product removed from cart');
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove product from cart');
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await axios.put(`/api/medical-products/cart/update/${cartItemId}`, {
        quantity: newQuantity
      });
      if (response.data.success) {
        fetchCartItems();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const getCategories = () => {
    const categories = ['All', ...new Set(products.map(product => product.category))];
    return categories;
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: colors.lightBg
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `4px solid ${colors.primary}20`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.lightBg
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: colors.white,
        padding: '1rem 2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/patient-dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: colors.primary,
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 style={{ 
              margin: 0, 
              color: colors.primary,
              fontSize: '1.5rem'
            }}>
              Medical Products Store
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: colors.primary,
              color: colors.white,
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <FiShoppingCart size={20} />
              <span>Cart ({cartItems.length})</span>
              {cartItems.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: colors.alert,
                  color: colors.white,
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Categories Filter */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {getCategories().map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '0.75rem 1.5rem',
                border: `1px solid ${activeCategory === category ? colors.primary : '#ddd'}`,
                backgroundColor: activeCategory === category ? colors.primary : colors.white,
                color: activeCategory === category ? colors.white : colors.primary,
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        }}>
          {/* Products Grid */}
          <div>
            <h2 style={{ 
              color: colors.primary,
              marginBottom: '1.5rem'
            }}>
              Available Products ({filteredProducts.length})
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredProducts.map(product => (
                <div key={product.product_id} style={{
                  backgroundColor: colors.white,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease',
                  border: `1px solid ${colors.primary}10`
                }}>
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: colors.lightBg,
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <FiPackage size={48} color={colors.textMuted} />
                    )}
                  </div>
                  
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0',
                    color: colors.primary,
                    fontSize: '1.1rem'
                  }}>
                    {product.name}
                  </h3>
                  
                  <p style={{
                    color: colors.textMuted,
                    fontSize: '0.9rem',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.4'
                  }}>
                    {product.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      color: colors.primary,
                      fontSize: '1.25rem',
                      fontWeight: '600'
                    }}>
                      ${product.price}
                    </span>
                    
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: product.stock_quantity > 0 ? `${colors.success}15` : `${colors.alert}15`,
                      color: product.stock_quantity > 0 ? colors.success : colors.alert,
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => addToCart(product.product_id, 1)}
                    disabled={product.stock_quantity === 0 || cartLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: product.stock_quantity > 0 ? colors.primary : '#ccc',
                      color: colors.white,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: product.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Shopping Cart */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            height: 'fit-content',
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{ 
              color: colors.primary,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiShoppingCart /> Shopping Cart
            </h3>
            
            {cartItems.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 0',
                color: colors.textMuted
              }}>
                <FiShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  marginBottom: '1.5rem'
                }}>
                  {cartItems.map(item => (
                    <div key={item.cart_item_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem 0',
                      borderBottom: `1px solid ${colors.lightBg}`
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: colors.lightBg,
                        borderRadius: '6px',
                        marginRight: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FiPackage size={20} color={colors.textMuted} />
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.9rem',
                          color: colors.primary
                        }}>
                          {item.product.name}
                        </h4>
                        <span style={{
                          color: colors.primary,
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}>
                          ${item.product.price}
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: `1px solid ${colors.primary}`,
                            backgroundColor: 'transparent',
                            color: colors.primary,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FiMinus size={14} />
                        </button>
                        
                        <span style={{
                          minWidth: '30px',
                          textAlign: 'center',
                          fontWeight: '500'
                        }}>
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: `1px solid ${colors.primary}`,
                            backgroundColor: 'transparent',
                            color: colors.primary,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FiPlus size={14} />
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.cart_item_id)}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: `1px solid ${colors.alert}`,
                            backgroundColor: 'transparent',
                            color: colors.alert,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '0.5rem'
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{
                  borderTop: `2px solid ${colors.primary}20`,
                  paddingTop: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <button
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: colors.success,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BuyMedprod;