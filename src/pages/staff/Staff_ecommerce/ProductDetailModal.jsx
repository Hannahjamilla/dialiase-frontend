import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaBox, 
  FaPrescriptionBottle, 
  FaSyringe, 
  FaFileMedical,
  FaWarehouse,
  FaTag,
  FaInfoCircle,
  FaCalendarAlt,
  FaTruck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaIdCard,
  FaCube,
  FaEdit,
  FaSave,
  FaTrash
} from 'react-icons/fa';
import api from '../../../api/axios';

const ProductDetailModal = ({ isOpen, onClose, supply, onProductUpdate, onProductDelete }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [currentSupply, setCurrentSupply] = useState(supply);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const colors = {
    primary: '#2563eb',
    primaryLight: '#dbeafe',
    secondary: '#1e293b',
    accent: '#059669',
    accentLight: '#d1fae5',
    white: '#ffffff',
    lightGray: '#f8fafc',
    mediumGray: '#f1f5f9',
    border: '#e2e8f0',
    darkGray: '#64748b',
    textDark: '#1e293b',
    textLight: '#475569',
    error: '#dc2626',
    errorLight: '#fef2f2',
    warning: '#d97706',
    warningLight: '#fffbeb',
    success: '#059669',
    successLight: '#f0fdf4',
    purple: '#8b5cf6',
    purpleLight: '#f3f4f6',
    blue: '#3b82f6',
    blueLight: '#dbeafe',
    indigo: '#6366f1',
    indigoLight: '#e0e7ff'
  };

  const categories = [
    { id: 'medication', name: 'Medications', icon: FaPrescriptionBottle, color: colors.accent, bgColor: colors.accentLight },
    { id: 'injection', name: 'Injections', icon: FaSyringe, color: colors.warning, bgColor: colors.warningLight },
    { id: 'accessory', name: 'Accessories', icon: FaFileMedical, color: colors.purple, bgColor: colors.purpleLight },
    { id: 'equipment', name: 'Medical Equipment', icon: FaBox, color: colors.indigo, bgColor: colors.indigoLight },
    { id: 'CAPD', name: 'CAPD Supplies', icon: FaBox, color: colors.primary, bgColor: colors.primaryLight }
  ];

  useEffect(() => {
    if (supply && supply.image) {
      const imageUrl = supply.imageUrl || `/assets/images/Medical supplies/${supply.image}`;
      setImagePreview(imageUrl);
    }
    setCurrentSupply(supply);
    setEditForm(supply || {});
  }, [supply]);

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : FaBox;
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { 
      status: 'Out of Stock', 
      color: colors.error, 
      bgColor: colors.errorLight,
      icon: FaExclamationTriangle,
      level: 'critical'
    };
    if (stock <= minStock) return { 
      status: 'Low Stock', 
      color: colors.warning, 
      bgColor: colors.warningLight,
      icon: FaExclamationTriangle,
      level: 'warning'
    };
    return { 
      status: 'In Stock', 
      color: colors.success, 
      bgColor: colors.successLight,
      icon: FaCheckCircle,
      level: 'good'
    };
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateTotalValue = () => {
    return (currentSupply?.stock || 0) * (currentSupply?.price || 0);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) return { status: 'Expired', color: colors.error, bgColor: colors.errorLight };
    if (daysUntilExpiry <= 30) return { status: 'Expiring Soon', color: colors.warning, bgColor: colors.warningLight };
    return { status: 'Valid', color: colors.success, bgColor: colors.successLight };
  };

  const handleEditClick = () => {
    setEditForm(currentSupply);
    setIsEditModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditForm(currentSupply);
    setError('');
    setSuccess('');
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productId = currentSupply.supplyID || currentSupply.id;
      
      // Use PATCH method for update
      const response = await api.patch(`/supplies/quick-update/${productId}`, {
        name: editForm.name,
        description: editForm.description,
        stock: parseInt(editForm.stock) || 0,
        minStock: parseInt(editForm.minStock) || 5,
        price: parseFloat(editForm.price) || 0,
        supplier: editForm.supplier,
        expiryDate: editForm.expiryDate,
        category: editForm.category,
        status: editForm.status || 'active'
      });

      if (response.data.success) {
        setCurrentSupply(response.data.supply);
        setSuccess('Product updated successfully!');
        if (onProductUpdate) {
          onProductUpdate(response.data.supply);
        }
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const productId = currentSupply.supplyID || currentSupply.id;
      
      const response = await api.delete(`/supplies/delete/${productId}`);
      
      if (response.data.success) {
        if (onProductDelete) {
          onProductDelete(productId);
        }
        onClose();
      } else {
        setError(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentSupply) return null;

  const IconComponent = getCategoryIcon(currentSupply.category);
  const stockStatus = getStockStatus(currentSupply.stock, currentSupply.minStock || 0);
  const StockStatusIcon = stockStatus.icon;
  const category = categories.find(cat => cat.id === currentSupply.category);
  const expiryStatus = currentSupply.expiryDate ? getExpiryStatus(currentSupply.expiryDate) : null;
  const daysUntilExpiry = currentSupply.expiryDate ? getDaysUntilExpiry(currentSupply.expiryDate) : null;

  return (
    <>
      {/* Main Product Detail Modal */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '20px',
          padding: '0',
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${colors.border}`
        }}>
          {/* Header */}
          <div style={{
            padding: '24px 32px',
            background: colors.white,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: category?.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${category?.color}20`
              }}>
                <IconComponent color={category?.color} size={24} />
              </div>
              
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: colors.textDark,
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {currentSupply.name}
                </h2>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: colors.white,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    fontSize: '12px',
                    fontWeight: '600',
                    color: colors.textLight
                  }}>
                    <IconComponent size={12} color={category?.color} />
                    {category?.name}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: stockStatus.bgColor,
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: stockStatus.color,
                    border: `1px solid ${stockStatus.color}20`
                  }}>
                    <StockStatusIcon size={12} />
                    {stockStatus.status}
                  </div>

                  {expiryStatus && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: expiryStatus.bgColor,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: expiryStatus.color,
                      border: `1px solid ${expiryStatus.color}20`
                    }}>
                      <FaCalendarAlt size={10} />
                      {expiryStatus.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={handleEditClick}
                style={{
                  backgroundColor: colors.primary,
                  color: colors.white,
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.blue;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.primary;
                }}
              >
                <FaEdit size={12} />
                Edit
              </button>

              <button 
                onClick={handleDeleteProduct}
                disabled={loading}
                style={{
                  backgroundColor: colors.error,
                  color: colors.white,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = colors.error;
                  }
                }}
              >
                <FaTrash size={12} />
                Delete
              </button>
              
              <button 
                onClick={onClose}
                style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.border}`,
                  color: colors.darkGray,
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.errorLight;
                  e.target.style.borderColor = colors.error;
                  e.target.style.color = colors.error;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colors.white;
                  e.target.style.borderColor = colors.border;
                  e.target.style.color = colors.darkGray;
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            padding: '32px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: colors.lightGray
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
              alignItems: 'start'
            }}>
              {/* Left Column - Key Information */}
              <div>
                {/* Stock and Price Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {/* Stock Card */}
                  <div style={{
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: colors.blueLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaWarehouse color={colors.blue} size={16} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textDark }}>
                        Current Stock
                      </span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: colors.textDark, marginBottom: '4px' }}>
                      {currentSupply.stock}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textLight, fontWeight: '500' }}>
                      Minimum: {currentSupply.minStock || 5} units
                    </div>
                  </div>
                  
                  {/* Price Card */}
                  <div style={{
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: colors.accentLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaTag color={colors.accent} size={16} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textDark }}>
                        Unit Price
                      </span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: colors.accent, marginBottom: '4px' }}>
                      ₱{formatPrice(currentSupply.price)}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textLight, fontWeight: '500' }}>
                      Total Value: ₱{formatPrice(calculateTotalValue())}
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.textDark,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: colors.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaInfoCircle size={14} color={colors.primary} />
                    </div>
                    Product Description
                  </h3>
                  <div style={{
                    padding: '16px',
                    backgroundColor: colors.lightGray,
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    minHeight: '80px'
                  }}>
                    <p style={{ 
                      fontSize: '14px', 
                      color: colors.textLight, 
                      lineHeight: '1.6', 
                      margin: 0 
                    }}>
                      {currentSupply.description || 'No description available for this product.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Specifications */}
              <div>
                <div style={{
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  height: 'fit-content'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.textDark,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: colors.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaCube size={14} color={colors.primary} />
                    </div>
                    Product Details
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {/* Minimum Stock */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: colors.lightGray,
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: colors.warningLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FaExclamationTriangle size={12} color={colors.warning} />
                        </div>
                        <span style={{ fontSize: '13px', color: colors.textLight, fontWeight: '500' }}>Minimum Stock</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                        {currentSupply.minStock || 5}
                      </span>
                    </div>

                    {/* Supplier */}
                    {currentSupply.supplier && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: colors.lightGray,
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            padding: '8px',
                            borderRadius: '6px',
                            backgroundColor: colors.accentLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FaTruck size={12} color={colors.accent} />
                          </div>
                          <span style={{ fontSize: '13px', color: colors.textLight, fontWeight: '500' }}>Supplier</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                          {currentSupply.supplier}
                        </span>
                      </div>
                    )}

                    {/* Expiry Date */}
                    {currentSupply.expiryDate && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: colors.lightGray,
                        borderRadius: '8px',
                        border: `1px solid ${colors.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            padding: '8px',
                            borderRadius: '6px',
                            backgroundColor: expiryStatus?.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FaCalendarAlt size={12} color={expiryStatus?.color} />
                          </div>
                          <div>
                            <span style={{ fontSize: '13px', color: colors.textLight, fontWeight: '500', display: 'block' }}>Expiry Date</span>
                            {daysUntilExpiry !== null && (
                              <span style={{ fontSize: '11px', color: expiryStatus?.color, fontWeight: '600' }}>
                                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                          {new Date(currentSupply.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Product ID */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: colors.lightGray,
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: colors.purpleLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FaIdCard size={12} color={colors.purple} />
                        </div>
                        <span style={{ fontSize: '13px', color: colors.textLight, fontWeight: '500' }}>Product ID</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textDark, fontFamily: 'monospace' }}>
                        #{currentSupply.supplyID || currentSupply.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.textDark,
                margin: 0
              }}>
                Edit Product
              </h3>
              <button 
                onClick={handleEditClose}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: colors.darkGray,
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: colors.errorLight,
                color: colors.error,
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: '500',
                border: `1px solid ${colors.error}20`
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                backgroundColor: colors.successLight,
                color: colors.success,
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: '500',
                border: `1px solid ${colors.success}20`
              }}>
                {success}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                  Description
                </label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={editForm.stock || ''}
                    onChange={(e) => handleEditChange('stock', parseInt(e.target.value) || 0)}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                    Min Stock *
                  </label>
                  <input
                    type="number"
                    value={editForm.minStock || ''}
                    onChange={(e) => handleEditChange('minStock', parseInt(e.target.value) || 5)}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price || ''}
                  onChange={(e) => handleEditChange('price', parseFloat(e.target.value) || 0)}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                  Supplier
                </label>
                <input
                  type="text"
                  value={editForm.supplier || ''}
                  onChange={(e) => handleEditChange('supplier', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editForm.expiryDate ? new Date(editForm.expiryDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleEditChange('expiryDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                  Category *
                </label>
                <select
                  value={editForm.category || ''}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: colors.white
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: colors.textDark }}>
                  Status *
                </label>
                <select
                  value={editForm.status || 'active'}
                  onChange={(e) => handleEditChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: colors.white
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  color: colors.white,
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <FaSave size={14} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                onClick={handleEditClose}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: colors.white,
                  color: colors.textDark,
                  border: `1px solid ${colors.border}`,
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailModal;