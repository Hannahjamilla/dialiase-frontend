import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaBox, 
  FaSyringe, 
  FaPrescriptionBottle,
  FaFileMedical,
  FaShoppingCart,
  FaExclamationTriangle,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaComment,
  FaChartLine,
  FaCalendar,
  FaDollarSign,
  FaWarehouse,
  FaClipboardList,
  FaStar,
  FaReceipt
} from 'react-icons/fa';
import Notification from '../../../components/Notification';
import AddSupplyModal from './AddSupplyModal';
import ProductReviewsManagementModal from './ProductReviewsManagementModal';
import ProductDetailModal from './ProductDetailModal';
import SupplyAnalytics from './SupplyAnalytics';
import api from '../../../api/axios';

const ManageEcom = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [supplies, setSupplies] = useState([]);
  const [filteredSupplies, setFilteredSupplies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isProductDetailModalOpen, setIsProductDetailModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  
  const navigate = useNavigate();

  // Professional color palette
  const colors = {
    primary: '#395886',
    white: '#FFFFFF',
    green: '#477977',
    secondary: '#2d4a6e',
    accent: '#5a8d8a',
    lightGray: '#f8fafc',
    border: '#e2e8f0',
    darkGray: '#64748b',
    textDark: '#1e293b',
    success: '#477977',
    warning: '#d97706',
    error: '#dc2626',
    background: '#ffffff',
    cardBackground: '#f8fafc'
  };
const handleProductUpdate = (updatedProduct) => {
  // Update your supplies list
  setSupplies(prev => prev.map(s => 
    s.supplyID === updatedProduct.supplyID ? updatedProduct : s
  ));
};

const handleProductDelete = (productId) => {
  // Remove from supplies list
  setSupplies(prev => prev.filter(s => s.supplyID !== productId));
};
  const categories = [
    { id: 'all', name: 'All Supplies', icon: FaBox, color: colors.primary },
    { id: 'solutions', name: 'PD Solutions', icon: FaPrescriptionBottle, color: colors.green },
    { id: 'sets', name: 'Transfer Sets', icon: FaSyringe, color: colors.warning },
    { id: 'accessories', name: 'Accessories', icon: FaFileMedical, color: '#8b5cf6' },
    { id: 'equipment', name: 'Medical Equipment', icon: FaBox, color: colors.error }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("No authentication data found");
        }

        if (!['nurse', 'staff'].includes(userData.userLevel)) {
          throw new Error("Unauthorized access level");
        }

        setUser(userData);
        await Promise.all([fetchSupplies(), fetchAnalytics()]);
      } catch (error) {
        setNotification({
          message: error.message || "Session expired. Please login again.",
          type: 'error',
        });
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchSupplies = async () => {
    try {
      const response = await api.get('/supplies/list');
      
      if (response.data.success) {
        setSupplies(response.data.supplies);
        setFilteredSupplies(response.data.supplies);
        setCurrentPage(1);
      } else {
        throw new Error('Failed to fetch supplies');
      }
    } catch (error) {
      console.error('Error fetching supplies:', error);
      setNotification({
        message: error.response?.data?.message || "Failed to fetch medical supplies. Please try again.",
        type: 'error'
      });
      setSupplies([]);
      setFilteredSupplies([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/supplies/analytics/dashboard');
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      calculateAnalyticsFromSupplies();
    }
  };

  const calculateAnalyticsFromSupplies = () => {
    if (!supplies.length) {
      setAnalytics({
        totalSupplies: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        inStockCount: 0,
        totalValue: 0
      });
      return;
    }

    const inStockCount = supplies.filter(s => s.stock > (s.minStock || 5)).length;
    const lowStockCount = supplies.filter(s => s.stock > 0 && s.stock <= (s.minStock || 5)).length;
    const outOfStockCount = supplies.filter(s => s.stock === 0).length;
    const totalValue = supplies.reduce((sum, s) => sum + (s.stock * (s.price || 0)), 0);

    setAnalytics({
      totalSupplies: supplies.length,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      totalValue
    });
  };

  useEffect(() => {
    filterSupplies();
  }, [searchTerm, activeCategory, supplies]);

  const filterSupplies = () => {
    let filtered = supplies;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(supply => supply.category === activeCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(supply =>
        supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supply.description && supply.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supply.supplier && supply.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSupplies(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSupplies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : FaBox;
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { status: 'Out of Stock', color: colors.error };
    if (stock <= minStock) return { status: 'Low Stock', color: colors.warning };
    return { status: 'In Stock', color: colors.green };
  };

  const handleAddSupply = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveSupply = async (success, message) => {
    if (success) {
      setNotification({
        message: message || 'Medical supply added successfully!',
        type: 'success'
      });
      await Promise.all([fetchSupplies(), fetchAnalytics()]);
      setIsAddModalOpen(false);
    } else {
      setNotification({
        message: message || 'Failed to add medical supply',
        type: 'error'
      });
    }
  };

  const handleOpenProductDetail = (supply) => {
    setSelectedSupply(supply);
    setIsProductDetailModalOpen(true);
  };

  const handleCloseProductDetailModal = () => {
    setIsProductDetailModalOpen(false);
    setSelectedSupply(null);
  };

  const handleEditSupply = (supplyId) => {
    setNotification({
      message: `Edit functionality for supply ${supplyId} will be implemented soon`,
      type: 'info'
    });
  };

  const handleDeleteSupply = async (supplyId) => {
    if (window.confirm('Are you sure you want to delete this supply?')) {
      try {
        const response = await api.delete(`/supplies/delete/${supplyId}`);
        
        if (response.data.success) {
          setNotification({
            message: 'Supply deleted successfully!',
            type: 'success'
          });
          await Promise.all([fetchSupplies(), fetchAnalytics()]);
          setIsProductDetailModalOpen(false);
        }
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || 'Failed to delete supply',
          type: 'error'
        });
      }
    }
  };

  const handleOpenReviewsModal = () => {
    const sampleUserId = 123;
    setSelectedUserId(sampleUserId);
    setIsReviewsModalOpen(true);
  };

  const handleCloseReviewsModal = () => {
    setIsReviewsModalOpen(false);
    setSelectedUserId(null);
  };

  const downloadReport = () => {
    try {
      const headers = ['Name', 'Category', 'Description', 'Stock', 'Min Stock', 'Price', 'Supplier', 'Expiry Date', 'Status'];
      
      const csvContent = [
        headers.join(','),
        ...filteredSupplies.map(supply => {
          const stockStatus = getStockStatus(supply.stock, supply.minStock || 0);
          const category = categories.find(cat => cat.id === supply.category)?.name || 'Unknown';
          
          return [
            `"${supply.name.replace(/"/g, '""')}"`,
            `"${category}"`,
            `"${(supply.description || '').replace(/"/g, '""')}"`,
            supply.stock,
            supply.minStock || 0,
            supply.price ? parseFloat(supply.price).toFixed(2) : '0.00',
            `"${(supply.supplier || '').replace(/"/g, '""')}"`,
            supply.expiryDate ? new Date(supply.expiryDate).toLocaleDateString() : 'Not set',
            `"${stockStatus.status}"`
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `medical_supplies_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        message: 'Report downloaded successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setNotification({
        message: 'Failed to download report. Please try again.',
        type: 'error'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleViewPatientOrders = () => {
    navigate('/staff/patient-orders');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="manage-ecom-container">
      {/* Fixed Header */}
      <div className="header-container">
        <div className="header-content">
          <div className="header-main">
            <button 
              onClick={() => navigate('/staff/StaffDashboard')}
              className="back-button"
            >
              <FaArrowLeft /> Home
            </button>
            <h1 className="header-title">
              CAPD Medical Supplies Management
            </h1>
            <p className="header-subtitle">
              Comprehensive inventory management and analytics dashboard
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={handleOpenReviewsModal}
              className="secondary-button"
            >
              <FaComment /> Check CAPD Patient Reviews
            </button>

            <button 
              onClick={handleViewPatientOrders}
              className="primary-button"
              style={{ backgroundColor: colors.green }}
            >
              <FaReceipt />CAPD Patient Orders
            </button>
            
            <button 
              onClick={handleAddSupply}
              className="primary-button"
            >
              <FaPlus /> Add New Supply
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-value">
                  {analytics?.totalSupplies || supplies.length}
                </div>
                <div className="stat-label">Total Supplies</div>
              </div>
              <FaBox className="stat-icon" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-value">
                  {analytics?.inStockCount || supplies.filter(s => s.stock > (s.minStock || 5)).length}
                </div>
                <div className="stat-label">In Stock</div>
              </div>
              <FaShoppingCart className="stat-icon" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-value">
                  {analytics?.lowStockCount || supplies.filter(s => s.stock > 0 && s.stock <= (s.minStock || 5)).length}
                </div>
                <div className="stat-label">Low Stock</div>
              </div>
              <FaExclamationTriangle className="stat-icon" />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div>
                <div className="stat-value">
                  {analytics?.totalValue ? formatCurrency(analytics.totalValue) : formatCurrency(supplies.reduce((sum, s) => sum + (s.stock * (s.price || 0)), 0))}
                </div>
                <div className="stat-label">Inventory Value</div>
              </div>
              <FaDollarSign className="stat-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Left Column - Search, Analytics and Controls */}
        <div className="left-column">
          
          {/* Search Section */}
          <div className="search-section">
            <div className="search-row">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search supplies by name, description, or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <button 
                onClick={downloadReport}
                className="export-button"
              >
                <FaDownload /> Export Report
              </button>
            </div>

            {/* Category Filters REMOVED as requested */}
          </div>

          {/* Supply Analytics Component */}
          <div className="analytics-section">
            <SupplyAnalytics 
              supplies={supplies}
              refreshTrigger={supplies.length}
            />
          </div>
        </div>

        {/* Right Column - Inventory */}
        <div className="right-column">
          <div className="inventory-header">
            <h3 className="inventory-title">
              CAPD Medical Products Overview
            </h3>
            
            <div className="inventory-count">
              Showing {Math.min(currentItems.length, itemsPerPage)} of {filteredSupplies.length} items
              {filteredSupplies.length > itemsPerPage && ` (Page ${currentPage} of ${totalPages})`}
            </div>
          </div>

          <div className="inventory-list">
            {filteredSupplies.length === 0 ? (
              <div className="empty-state">
                <FaBox className="empty-icon" />
                <p className="empty-text">
                  {supplies.length === 0 ? 'No supplies available.' : 'No supplies found.'}
                </p>
              </div>
            ) : (
              <div className="supply-grid">
                {currentItems.map(supply => {
                  const IconComponent = getCategoryIcon(supply.category);
                  const stockStatus = getStockStatus(supply.stock, supply.minStock || 0);
                  const category = categories.find(cat => cat.id === supply.category);
                  
                  return (
                    <div 
                      key={supply.supplyID} 
                      className="supply-card"
                      onClick={() => handleOpenProductDetail(supply)}
                    >
                      <div className="supply-header">
                        <div className="supply-title">
                          <IconComponent className="category-icon" />
                          <span className="supply-name">
                            {supply.name}
                          </span>
                        </div>
                        <div 
                          className="stock-badge"
                          style={{
                            backgroundColor: `${stockStatus.color}15`,
                            color: stockStatus.color,
                            border: `1px solid ${stockStatus.color}30`
                          }}
                        >
                          {stockStatus.status}
                        </div>
                      </div>
                      
                      <div className="supply-description">
                        {supply.description || 'No description available'}
                      </div>
                      
                      <div className="supply-footer">
                        <div className="supply-details">
                          <span className="detail-item">
                            Stock: <span className="detail-value">{supply.stock}</span>
                          </span>
                          <span className="detail-item">
                            Price: <span className="price-value">
                              ₱{supply.price ? parseFloat(supply.price).toFixed(2) : '0.00'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSupplies.length)} of {filteredSupplies.length} entries
              </div>
              
              <div className="pagination-controls">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="pagination-button pagination-nav"
                >
                  <FaChevronLeft size={12} />
                  Previous
                </button>
                
                <div className="pagination-numbers">
                  {getPageNumbers().map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`pagination-button pagination-number ${
                        currentPage === number ? 'active' : ''
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="pagination-ellipsis">...</span>
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`pagination-button pagination-number ${
                          currentPage === totalPages ? 'active' : ''
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-button pagination-nav"
                >
                  Next
                  <FaChevronRight size={12} />
                </button>
              </div>

              <div className="pagination-size-selector">
                <span>Items per page:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    // Note: itemsPerPage is currently fixed, but you can make it dynamic
                    setNotification({
                      message: 'Items per page customization will be implemented in the next update',
                      type: 'info'
                    });
                  }}
                  className="page-size-select"
                >
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddSupplyModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveSupply}
      />

      <ProductReviewsManagementModal 
        isOpen={isReviewsModalOpen}
        onClose={handleCloseReviewsModal}
        userId={selectedUserId}
      />

      <ProductDetailModal
      isOpen={isProductDetailModalOpen}
      onClose={handleCloseProductDetailModal}
      supply={selectedSupply}
      onProductUpdate={handleProductUpdate}
      onProductDelete={handleProductDelete}
    />

      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleCloseNotification}
        />
      )}

      <style jsx>{`
        .manage-ecom-container {
          min-height: 100vh;
          background-color: ${colors.background};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 0;
          color: ${colors.textDark};
          width: 100%;
          overflow-x: hidden;
          margin-Top: -750px;
        }

        /* Header Styles */
        .header-container {
          background-color: ${colors.white};
          padding: 24px 32px;
          border-bottom: 1px solid ${colors.border};
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          width: 100%;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          max-width: 100%;
          width: 100%;
          gap: 24px;
        }

        .header-main {
          flex: 1;
          min-width: 0;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: transparent;
          border: none;
          color: ${colors.darkGray};
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 12px;
          padding: 8px 0;
          transition: all 0.2s ease;
          border-radius: 6px;
          font-weight: 500;
        }

        .back-button:hover {
          color: ${colors.primary};
          transform: translateX(-2px);
        }

        .header-title {
          font-size: 28px;
          font-weight: 700;
          color: ${colors.textDark};
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .header-subtitle {
          font-size: 16px;
          color: ${colors.darkGray};
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        .primary-button {
          background-color: ${colors.primary};
          color: ${colors.white};
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .primary-button:hover {
          background-color: ${colors.secondary};
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(57, 88, 134, 0.3);
        }

        .secondary-button {
          background-color: ${colors.white};
          color: ${colors.primary};
          border: 1px solid ${colors.border};
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .secondary-button:hover {
          background-color: ${colors.primary};
          color: ${colors.white};
          transform: translateY(-1px);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 8px;
        }

        .stat-card {
          background-color: ${colors.white};
          padding: 20px;
          border-radius: 12px;
          border: 1px solid ${colors.border};
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: ${colors.textDark};
        }

        .stat-label {
          font-size: 14px;
          color: ${colors.darkGray};
          margin-top: 4px;
        }

        .stat-icon {
          color: ${colors.primary};
        }

        /* Main Content */
        .main-content {
          display: flex;
          min-height: calc(100vh - 240px);
          width: 100%;
          overflow: hidden;
          gap: 0;
        }

        /* Left Column */
        .left-column {
          flex: 4;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border-right: 1px solid ${colors.border};
          overflow: hidden;
          min-width: 600px;
        }

        .search-section {
          background-color: ${colors.white};
          border-radius: 12px;
          padding: 24px;
          border: 1px solid ${colors.border};
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }

        .search-row {
          display: flex;
          gap: 16px;
          align-items: center;
          width: 100%;
        }

        .search-input-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: ${colors.darkGray};
        }

        .search-input {
          width: 100%;
          padding: 14px 14px 14px 48px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.3s ease;
          background-color: ${colors.background};
          font-family: inherit;
          color: ${colors.textDark};
        }

        .search-input:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${colors.primary}20;
        }

        .export-button {
          padding: 14px 20px;
          background-color: ${colors.white};
          color: ${colors.green};
          border: 1px solid ${colors.green};
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-size: 14px;
          white-space: nowrap;
          height: 48px;
          flex-shrink: 0;
        }

        .export-button:hover {
          background-color: ${colors.green};
          color: ${colors.white};
          transform: translateY(-1px);
        }

        /* Category Filters REMOVED as requested */

        .analytics-section {
          flex: 1;
          overflow: hidden;
        }

        /* Right Column */
        .right-column {
          flex: 3;
          display: flex;
          flex-direction: column;
          padding: 24px;
          background-color: ${colors.lightGray};
          overflow: hidden;
          min-width: 500px;
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .inventory-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: ${colors.textDark};
        }

        .inventory-count {
          font-size: 13px;
          color: ${colors.darkGray};
          text-align: right;
        }

        .inventory-list {
          overflow-y: auto;
          flex: 1;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: ${colors.darkGray};
        }

        .empty-icon {
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-text {
          font-size: 14px;
          margin: 0;
          font-weight: 500;
        }

        .supply-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          padding: 4px;
        }

        .supply-card {
          background-color: ${colors.white};
          border-radius: 8px;
          padding: 20px;
          border: 1px solid ${colors.border};
          transition: all 0.3s ease;
          cursor: pointer;
          height: fit-content;
        }

        .supply-card:hover {
          background-color: #f8fafc;
          border-color: ${colors.primary};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .supply-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .supply-title {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .category-icon {
          flex-shrink: 0;
        }

        .supply-name {
          font-weight: 600;
          color: ${colors.textDark};
          font-size: 14px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stock-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .supply-description {
          font-size: 12px;
          color: ${colors.darkGray};
          margin-bottom: 16px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .supply-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .supply-details {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .detail-item {
          color: ${colors.darkGray};
        }

        .detail-value {
          color: ${colors.textDark};
          font-weight: 600;
        }

        .price-value {
          color: ${colors.green};
          font-weight: 600;
        }

        /* Enhanced Pagination */
        .pagination-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
          background-color: ${colors.white};
          border-radius: 8px;
          border: 1px solid ${colors.border};
          margin-top: auto;
        }

        .pagination-info {
          color: ${colors.darkGray};
          font-size: 13px;
          text-align: center;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .pagination-numbers {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pagination-button {
          padding: 8px 12px;
          border: 1px solid ${colors.border};
          background-color: ${colors.white};
          color: ${colors.textDark};
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 13px;
          font-weight: 500;
        }

        .pagination-nav {
          padding: 8px 16px;
        }

        .pagination-number {
          min-width: 36px;
          justify-content: center;
        }

        .pagination-button:disabled {
          background-color: ${colors.lightGray};
          color: ${colors.darkGray};
          cursor: not-allowed;
          opacity: 0.6;
        }

        .pagination-button:not(:disabled):hover {
          background-color: ${colors.primary}15;
          border-color: ${colors.primary};
          color: ${colors.primary};
        }

        .pagination-button.active {
          background-color: ${colors.primary};
          color: ${colors.white};
          border-color: ${colors.primary};
        }

        .pagination-ellipsis {
          padding: 8px 4px;
          color: ${colors.darkGray};
          font-weight: 500;
        }

        .pagination-size-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          color: ${colors.darkGray};
        }

        .page-size-select {
          padding: 4px 8px;
          border: 1px solid ${colors.border};
          border-radius: 4px;
          background-color: ${colors.white};
          color: ${colors.textDark};
          font-size: 13px;
          cursor: pointer;
        }

        .page-size-select:focus {
          outline: none;
          border-color: ${colors.primary};
        }

        /* Loading */
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: ${colors.background};
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid ${colors.primary}20;
          border-top: 5px solid ${colors.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .main-content {
            flex-direction: column;
          }

          .left-column {
            min-width: 100%;
            border-right: none;
            border-bottom: 1px solid ${colors.border};
          }

          .right-column {
            min-width: 100%;
          }

          .supply-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .header-actions {
            justify-content: flex-start;
          }

          .search-row {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input-container {
            min-width: auto;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .supply-grid {
            grid-template-columns: 1fr;
          }

          .header-container {
            padding: 20px;
          }

          .left-column,
          .right-column {
            padding: 20px;
          }

          .pagination-controls {
            flex-direction: column;
            gap: 12px;
          }

          .pagination-numbers {
            order: -1;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .header-title {
            font-size: 24px;
          }

          .header-subtitle {
            font-size: 14px;
          }

          .primary-button,
          .secondary-button {
            padding: 10px 16px;
            font-size: 13px;
          }

          .pagination-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        /* Animations */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        * {
          animation: fadeIn 0.5s ease;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${colors.lightGray};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.darkGray};
        }
      `}</style>
    </div>
  );
};

export default ManageEcom;