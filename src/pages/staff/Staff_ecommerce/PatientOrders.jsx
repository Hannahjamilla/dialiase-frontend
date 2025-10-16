import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaEdit,
  FaCalendar,
  FaDollarSign,
  FaShoppingCart,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaBox,
  FaReceipt,
  FaTimes,
  FaChartBar,
  FaChartPie,
  FaShoppingBag,
  FaStar,
  FaStarHalfAlt,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import Notification from '../../../components/Notification';
import OrderDetailModal from "./OrderDetailModal";
import api from '../../../api/axios';

const PatientOrders = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  
  // Analytics filters
  const [analyticsPeriod, setAnalyticsPeriod] = useState('monthly');
  const [analyticsView, setAnalyticsView] = useState('sales');
  
  // Pagination - 5 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalOrders, setTotalOrders] = useState(0);
  
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
    info: '#395886',
    background: '#ffffff'
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders', color: colors.darkGray, icon: FaBox },
    { value: 'pending', label: 'Pending', color: colors.warning, icon: FaClock },
    { value: 'confirmed', label: 'Confirmed', color: colors.info, icon: FaCheckCircle },
    { value: 'ready_for_pickup', label: 'Ready for Pickup', color: colors.success, icon: FaShoppingCart },
    { value: 'completed', label: 'Completed', color: colors.green, icon: FaCheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: colors.error, icon: FaTimesCircle }
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
        await Promise.all([fetchOrders(), fetchStatistics(), fetchAnalytics()]);
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

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page,
        per_page: itemsPerPage,
        status: statusFilter,
        date: dateFilter,
        search: searchTerm
      });

      const response = await api.get(`/patient-orders?${params}`);
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
        setTotalOrders(response.data.pagination.total);
        setCurrentPage(response.data.pagination.current_page);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setNotification({
        message: error.response?.data?.message || "Failed to fetch orders. Please try again.",
        type: 'error'
      });
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/patient-orders/statistics');
      
      if (response.data.success) {
        setStatistics(response.data.statistics);
      } else {
        throw new Error('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/patient-orders/analytics?period=${analyticsPeriod}`);
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchOrders(1);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  useEffect(() => {
    fetchAnalytics();
  }, [analyticsPeriod]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDateFilter = (date) => {
    setDateFilter(date);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleOpenOrderDetail = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleCloseOrderDetailModal = () => {
    setIsOrderDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/patient-orders/${orderId}/status`, {
        status: newStatus
      });

      if (response.data.success) {
        setNotification({
          message: 'Order status updated successfully!',
          type: 'success'
        });
        await fetchOrders(currentPage);
        await fetchStatistics();
        await fetchAnalytics();
        setIsOrderDetailModalOpen(false);
      }
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || 'Failed to update order status',
        type: 'error'
      });
    }
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : FaBox;
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : colors.darkGray;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paginate = (pageNumber) => {
    fetchOrders(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < Math.ceil(totalOrders / itemsPerPage)) {
      fetchOrders(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      fetchOrders(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    const maxVisiblePages = 5;
    const pageNumbers = [];
    
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

  const downloadReport = () => {
    try {
      const headers = ['Order ID', 'Patient Name', 'Hospital Number', 'Total Amount', 'Status', 'Payment Method', 'Order Date', 'Pickup Date', 'Items Count'];
      
      const csvContent = [
        headers.join(','),
        ...orders.map(order => [
          `"${order.order_reference}"`,
          `"${order.patient.name.replace(/"/g, '""')}"`,
          `"${order.patient.hospital_number}"`,
          order.total_amount,
          `"${order.order_status}"`,
          `"${order.payment_method}"`,
          `"${formatDate(order.order_date)}"`,
          `"${order.scheduled_pickup_date ? formatDate(order.scheduled_pickup_date) : 'Not set'}"`,
          order.items_count
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `patient_orders_report_${new Date().toISOString().split('T')[0]}.csv`);
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

  const downloadSalesReport = () => {
    try {
      if (!analytics) return;

      const headers = ['Period', 'Total Sales', 'Total Orders', 'Average Order Value', 'Top Product', 'Least Product'];
      
      const csvContent = [
        headers.join(','),
        [
          `"${analyticsPeriod.charAt(0).toUpperCase() + analyticsPeriod.slice(1)}"`,
          analytics.sales.total_sales,
          analytics.sales.total_orders,
          analytics.sales.average_order_value,
          `"${analytics.products.top_product.name}"`,
          `"${analytics.products.least_product.name}"`
        ].join(',')
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_report_${analyticsPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        message: 'Sales report downloaded successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error downloading sales report:', error);
      setNotification({
        message: 'Failed to download sales report. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  const getPeriodLabel = (period) => {
    const labels = {
      daily: 'Today',
      weekly: 'This Week',
      monthly: 'This Month',
      yearly: 'This Year'
    };
    return labels[period] || period;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="patient-orders-container">
      {/* Fixed Header */}
      <div className="header-container">
        <div className="header-content">
          <div className="header-main">
            <button 
              onClick={() => navigate(-1)}
              className="back-button"
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
            <h1 className="header-title">
              Orders for CAPD Patients
            </h1>
            <p className="header-subtitle">
              Comprehensive overview of all patient orders and analytics
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="mobile-filter-button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <FaFilter />
            </button>
            <button 
              onClick={downloadReport}
              className="secondary-button"
            >
              <FaDownload /> Export Orders
            </button>
            <button 
              onClick={downloadSalesReport}
              className="secondary-button"
            >
              <FaChartLine /> Export Sales
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {statistics && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-value">
                    {statistics.today.orders}
                  </div>
                  <div className="stat-label">Today's Orders</div>
                </div>
                <FaCalendar className="stat-icon" />
              </div>
              <div className="stat-subtext">
                {formatCurrency(statistics.today.revenue)} revenue
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-value">
                    {statistics.weekly.orders}
                  </div>
                  <div className="stat-label">This Week</div>
                </div>
                <FaChartLine className="stat-icon" />
              </div>
              <div className="stat-subtext">
                {formatCurrency(statistics.weekly.revenue)} revenue
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-value">
                    {statistics.monthly.orders}
                  </div>
                  <div className="stat-label">This Month</div>
                </div>
                <FaReceipt className="stat-icon" />
              </div>
              <div className="stat-subtext">
                {formatCurrency(statistics.monthly.revenue)} revenue
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div>
                  <div className="stat-value">
                    {totalOrders}
                  </div>
                  <div className="stat-label">Total Orders</div>
                </div>
                <FaShoppingCart className="stat-icon" />
              </div>
              <div className="stat-subtext">
                All time orders
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - FULL SCREEN LAYOUT */}
      <div className="main-content">
        
        {/* Left Column - Filters and Analytics - FULL HEIGHT */}
        <div className={`left-column ${isFiltersOpen ? 'mobile-open' : ''}`}>
          <div className="filters-header">
            <h3 className="filters-title">Filters & Search</h3>
            <button 
              className="close-filters-button"
              onClick={() => setIsFiltersOpen(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          {/* Search and Filters Section */}
          <div className="filters-section">
            {/* Search Input */}
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search orders by patient name, hospital number, or order ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>

            {/* Status Filters */}
            <div className="filter-group">
              <label className="filter-label">Order Status</label>
              <div className="status-filters">
                {statusOptions.map(option => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleStatusFilter(option.value)}
                      className={`status-button ${statusFilter === option.value ? 'active' : ''}`}
                      style={{
                        '--status-color': option.color
                      }}
                    >
                      <IconComponent size={12} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Filter */}
            <div className="filter-group">
              <label className="filter-label">Order Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="date-input"
              />
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || dateFilter) && (
              <button onClick={clearFilters} className="clear-filters-button">
                Clear All Filters
              </button>
            )}
          </div>

          {/* Analytics Section */}
          {analytics && (
            <div className="analytics-section">
              <div className="analytics-header">
                <h3 className="section-title">Sales Analytics</h3>
                <div className="analytics-controls">
                  <select 
                    value={analyticsPeriod}
                    onChange={(e) => setAnalyticsPeriod(e.target.value)}
                    className="analytics-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Sales Metrics */}
              <div className="analytics-metrics">
                <div className="metric-card">
                  <div className="metric-value">{formatCurrency(analytics.sales.total_sales)}</div>
                  <div className="metric-label">Total Sales</div>
                  <div className="metric-change positive">
                    <FaArrowUp size={10} />
                    {analytics.sales.growth_rate}%
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-value">{analytics.sales.total_orders}</div>
                  <div className="metric-label">Total Orders</div>
                  <div className="metric-change positive">
                    <FaArrowUp size={10} />
                    {analytics.sales.order_growth}%
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-value">{formatCurrency(analytics.sales.average_order_value)}</div>
                  <div className="metric-label">Avg. Order Value</div>
                </div>
              </div>

              {/* Product Performance */}
              <div className="product-performance">
                <h4 className="performance-title">Product Performance</h4>
                
                <div className="performance-item top-product">
                  <div className="product-info">
                    <FaStar className="product-icon" />
                    <div>
                      <div className="product-name">{analytics.products.top_product.name}</div>
                      <div className="product-stats">
                        {analytics.products.top_product.quantity_sold} sold • {formatCurrency(analytics.products.top_product.revenue)}
                      </div>
                    </div>
                  </div>
                  <div className="product-badge best">Best</div>
                </div>

                <div className="performance-item least-product">
                  <div className="product-info">
                    <FaChartBar className="product-icon" />
                    <div>
                      <div className="product-name">{analytics.products.least_product.name}</div>
                      <div className="product-stats">
                        {analytics.products.least_product.quantity_sold} sold • {formatCurrency(analytics.products.least_product.revenue)}
                      </div>
                    </div>
                  </div>
                  <div className="product-badge least">Least</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Orders List - FULL SCREEN */}
        <div className="right-column">
          <div className="orders-header">
            <div className="orders-header-left">
              <button 
                className="mobile-filter-toggle"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <FaFilter />
                Filters
              </button>
              <h3 className="orders-title">
                Patient Orders
              </h3>
            </div>
            
            <div className="orders-count">
              Showing {orders.length} of {totalOrders} orders
              {totalOrders > itemsPerPage && ` (Page ${currentPage} of ${Math.ceil(totalOrders / itemsPerPage)})`}
            </div>
          </div>

          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="empty-state">
                <FaShoppingCart className="empty-icon" />
                <p className="empty-text">
                  {loading ? 'Loading orders...' : 'No orders found matching your criteria.'}
                </p>
                {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                  <button onClick={clearFilters} className="clear-filters-button">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map(order => {
                  const StatusIcon = getStatusIcon(order.order_status);
                  const statusColor = getStatusColor(order.order_status);
                  
                  return (
                    <div 
                      key={order.id} 
                      className="order-card"
                      onClick={() => handleOpenOrderDetail(order)}
                    >
                      <div className="order-header">
                        <div className="order-title">
                          <FaUser className="patient-icon" />
                          <div className="order-patient-info">
                            <span className="patient-name">{order.patient.name}</span>
                            <span className="hospital-number">{order.patient.hospital_number}</span>
                          </div>
                        </div>
                        <div 
                          className="order-status-badge"
                          style={{
                            backgroundColor: `${statusColor}15`,
                            color: statusColor,
                            border: `1px solid ${statusColor}30`
                          }}
                        >
                          <StatusIcon size={12} />
                          {order.order_status.replace('_', ' ')}
                        </div>
                      </div>
                      
                      <div className="order-details">
                        <div className="order-reference">
                          {order.order_reference}
                        </div>
                        <div className="order-meta">
                          <span className="order-date">
                            <FaCalendar size={12} />
                            {formatDate(order.order_date)}
                          </span>
                          {order.scheduled_pickup_date && (
                            <span className="pickup-date">
                              <FaShoppingCart size={12} />
                              Pickup: {formatDate(order.scheduled_pickup_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="order-footer">
                        <div className="order-amount">
                          {formatCurrency(order.total_amount)}
                        </div>
                        <div className="order-items">
                          {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {Math.ceil(totalOrders / itemsPerPage) > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} entries
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
                </div>
                
                <button 
                  onClick={nextPage}
                  disabled={currentPage === Math.ceil(totalOrders / itemsPerPage)}
                  className="pagination-button pagination-nav"
                >
                  Next
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <OrderDetailModal 
        isOpen={isOrderDetailModalOpen}
        onClose={handleCloseOrderDetailModal}
        order={selectedOrder}
        onStatusUpdate={handleUpdateOrderStatus}
        colors={colors}
      />

      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleCloseNotification}
        />
      )}

      <style jsx>{`
        .patient-orders-container {
          min-height: 100vh;
          background-color: ${colors.background};
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          margin: 0;
          padding: 0;
          color: ${colors.textDark};
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          margin-top: -950px;
        }

        /* Header Styles - FULL WIDTH */
        .header-container {
          background-color: ${colors.white};
          padding: 15px 30px;
          border-bottom: 1px solid ${colors.border};
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          width: 100vw;
          height: auto;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          width: 100%;
          gap: 20px;
        }

        .header-main {
          flex: 1;
          min-width: 0;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: transparent;
          border: none;
          color: ${colors.darkGray};
          cursor: pointer;
          font-size: 13px;
          margin-bottom: 8px;
          padding: 6px 0;
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
          margin: 0 0 6px 0;
          line-height: 1.2;
        }

        .header-subtitle {
          font-size: 14px;
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

        .mobile-filter-button {
          display: none;
          background: none;
          border: none;
          font-size: 16px;
          color: ${colors.primary};
          cursor: pointer;
          padding: 8px;
        }

        .secondary-button {
          background-color: ${colors.white};
          color: ${colors.primary};
          border: 1px solid ${colors.border};
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .secondary-button:hover {
          background-color: ${colors.primary};
          color: ${colors.white};
          transform: translateY(-1px);
        }

        /* Stats Grid - FULL WIDTH */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 8px;
        }

        .stat-card {
          background-color: ${colors.white};
          padding: 20px;
          border-radius: 10px;
          border: 1px solid ${colors.border};
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: ${colors.textDark};
        }

        .stat-label {
          font-size: 13px;
          color: ${colors.darkGray};
          margin-top: 2px;
        }

        .stat-icon {
          color: ${colors.primary};
          font-size: 22px;
        }

        .stat-subtext {
          font-size: 12px;
          color: ${colors.darkGray};
          font-weight: 500;
        }

        /* Main Content - FULL SCREEN */
        .main-content {
          display: flex;
          height: calc(100vh - 150px);
          width: 100vw;
          overflow: hidden;
          gap: 0;
        }

        /* Left Column - FULL HEIGHT */
        .left-column {
          flex: 0 0 380px;
          display: flex;
          flex-direction: column;
          padding: 0;
          border-right: 1px solid ${colors.border};
          overflow-y: auto;
          background-color: ${colors.lightGray};
          height: 100%;
        }

        .filters-header {
          display: none;
          padding: 16px;
          border-bottom: 1px solid ${colors.border};
          background: ${colors.white};
        }

        .close-filters-button {
          display: none;
          background: none;
          border: none;
          font-size: 16px;
          color: ${colors.darkGray};
          cursor: pointer;
        }

        .filters-section {
          background-color: ${colors.white};
          border-radius: 0;
          padding: 24px;
          border: none;
          box-shadow: none;
          margin-bottom: 0;
        }

        .filters-title {
          font-size: 16px;
          font-weight: 600;
          color: ${colors.textDark};
          margin: 0 0 18px 0;
        }

        .search-input-container {
          position: relative;
          margin-bottom: 20px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: ${colors.darkGray};
          font-size: 14px;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          font-size: 13px;
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

        .filter-group {
          margin-bottom: 20px;
        }

        .filter-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: ${colors.textDark};
          margin-bottom: 10px;
        }

        .status-filters {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-button {
          padding: 10px 14px;
          background-color: ${colors.white};
          color: var(--status-color);
          border: 1px solid var(--status-color);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          text-align: left;
        }

        .status-button.active {
          background-color: var(--status-color);
          color: ${colors.white};
        }

        .status-button:not(.active):hover {
          background-color: var(--status-color)15;
        }

        .date-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          transition: all 0.3s ease;
          background-color: ${colors.background};
          font-family: inherit;
          color: ${colors.textDark};
        }

        .date-input:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${colors.primary}20;
        }

        .clear-filters-button {
          width: 100%;
          padding: 10px 12px;
          background-color: ${colors.white};
          color: ${colors.error};
          border: 1px solid ${colors.error};
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .clear-filters-button:hover {
          background-color: ${colors.error};
          color: ${colors.white};
        }

        /* Analytics Section */
        .analytics-section {
          background-color: ${colors.white};
          border-radius: 0;
          padding: 24px;
          border: none;
          border-top: 1px solid ${colors.border};
          box-shadow: none;
          flex: 1;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: ${colors.textDark};
          margin: 0;
        }

        .analytics-controls {
          display: flex;
          gap: 8px;
        }

        .analytics-select {
          padding: 6px 10px;
          border: 1px solid ${colors.border};
          border-radius: 6px;
          font-size: 12px;
          background-color: ${colors.white};
          color: ${colors.textDark};
          outline: none;
          cursor: pointer;
        }

        .analytics-metrics {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .metric-card {
          background-color: ${colors.lightGray};
          padding: 16px;
          border-radius: 8px;
          border: 1px solid ${colors.border};
          position: relative;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 700;
          color: ${colors.textDark};
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 11px;
          color: ${colors.darkGray};
          font-weight: 500;
        }

        .metric-change {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .metric-change.positive {
          color: ${colors.success};
          background-color: ${colors.success}15;
        }

        .metric-change.negative {
          color: ${colors.error};
          background-color: ${colors.error}15;
        }

        .product-performance {
          border-top: 1px solid ${colors.border};
          padding-top: 16px;
        }

        .performance-title {
          font-size: 14px;
          font-weight: 600;
          color: ${colors.textDark};
          margin: 0 0 12px 0;
        }

        .performance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .performance-item:hover {
          border-color: ${colors.primary};
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .product-icon {
          color: ${colors.primary};
          font-size: 14px;
        }

        .product-name {
          font-size: 12px;
          font-weight: 600;
          color: ${colors.textDark};
          margin-bottom: 2px;
        }

        .product-stats {
          font-size: 10px;
          color: ${colors.darkGray};
        }

        .product-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .product-badge.best {
          background-color: ${colors.success}15;
          color: ${colors.success};
        }

        .product-badge.least {
          background-color: ${colors.warning}15;
          color: ${colors.warning};
        }

        /* Right Column - FULL SCREEN */
        .right-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0;
          background-color: ${colors.white};
          overflow: hidden;
          height: 100%;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px 0;
          margin-bottom: 0;
        }

        .orders-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mobile-filter-toggle {
          display: none;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid ${colors.border};
          color: ${colors.primary};
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
        }

        .orders-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: ${colors.textDark};
        }

        .orders-count {
          font-size: 13px;
          color: ${colors.darkGray};
          text-align: right;
        }

        .orders-list {
          overflow-y: auto;
          flex: 1;
          padding: 16px 30px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: ${colors.darkGray};
        }

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.5;
          font-size: 48px;
        }

        .empty-text {
          font-size: 14px;
          margin: 0 0 18px 0;
          font-weight: 500;
        }

        /* Orders Grid - FULL WIDTH CARDS */
        .orders-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card {
          background-color: ${colors.white};
          border-radius: 10px;
          padding: 20px;
          border: 1px solid ${colors.border};
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .order-card:hover {
          background-color: #f8fafc;
          border-color: ${colors.primary};
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .order-title {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .patient-icon {
          color: ${colors.primary};
          flex-shrink: 0;
          font-size: 16px;
        }

        .order-patient-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .patient-name {
          font-weight: 600;
          color: ${colors.textDark};
          font-size: 16px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .hospital-number {
          font-size: 13px;
          color: ${colors.darkGray};
        }

        .order-status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
          margin-left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: capitalize;
        }

        .order-details {
          margin-bottom: 16px;
        }

        .order-reference {
          font-size: 13px;
          color: ${colors.darkGray};
          margin-bottom: 10px;
          font-family: 'Courier New', monospace;
        }

        .order-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 12px;
          color: ${colors.darkGray};
        }

        .order-date,
        .pickup-date {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .order-amount {
          color: ${colors.green};
          font-weight: 700;
          font-size: 16px;
        }

        .order-items {
          color: ${colors.darkGray};
          font-size: 13px;
        }

        /* Pagination */
        .pagination-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px 30px;
          background-color: ${colors.white};
          border-top: 1px solid ${colors.border};
          margin-top: 0;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
        }

        .pagination-info {
          color: ${colors.darkGray};
          font-size: 12px;
          text-align: center;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .pagination-numbers {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pagination-button {
          padding: 8px 14px;
          border: 1px solid ${colors.border};
          background-color: ${colors.white};
          color: ${colors.textDark};
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-size: 12px;
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
          border: 6px solid ${colors.primary}20;
          border-top: 6px solid ${colors.primary};
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .left-column {
            flex: 0 0 340px;
          }
        }

        @media (max-width: 768px) {
          .patient-orders-container {
            height: 100vh;
            overflow: auto;
          }

          .header-container {
            padding: 12px 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .header-title {
            font-size: 22px;
          }

          .header-subtitle {
            font-size: 12px;
          }

          .mobile-filter-button {
            display: block;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
          }

          .stat-value {
            font-size: 22px;
          }

          .main-content {
            height: auto;
            min-height: calc(100vh - 150px);
            flex-direction: column;
          }

          .left-column {
            position: fixed;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100vh;
            z-index: 1000;
            background: ${colors.white};
            transition: left 0.3s ease;
            flex: none;
          }

          .left-column.mobile-open {
            left: 0;
          }

          .filters-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .close-filters-button {
            display: block;
          }

          .right-column {
            flex: none;
            min-height: calc(100vh - 150px);
          }

          .orders-header {
            padding: 16px;
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .orders-header-left {
            justify-content: space-between;
          }

          .mobile-filter-toggle {
            display: flex;
          }

          .orders-title {
            font-size: 18px;
          }

          .orders-list {
            padding: 16px;
          }

          .pagination-container {
            padding: 16px;
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
            font-size: 20px;
          }

          .orders-title {
            font-size: 16px;
          }

          .order-card {
            padding: 16px;
          }

          .patient-name {
            font-size: 14px;
          }

          .order-amount {
            font-size: 14px;
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
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${colors.lightGray};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.darkGray};
        }
      `}</style>
    </div>
  );
};

export default PatientOrders;