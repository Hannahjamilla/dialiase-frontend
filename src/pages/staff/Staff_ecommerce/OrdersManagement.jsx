import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import api from '../../../api/axios';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    green: '#477977',
    orange: '#f59e0b',
    purple: '#8b5cf6',
    red: '#dc2626',
    white: '#FFFFFF',
    lightGray: '#f8fafc',
    darkGray: '#64748b',
    textDark: '#1e293b'
  };

  const orderStatuses = [
    { value: 'all', label: 'All Orders', color: colors.darkGray },
    { value: 'pending', label: 'Pending', color: colors.orange },
    { value: 'confirmed', label: 'Confirmed', color: colors.primary },
    { value: 'shipped', label: 'Shipped', color: colors.purple },
    { value: 'delivered', label: 'Delivered', color: colors.green },
    { value: 'cancelled', label: 'Cancelled', color: colors.red }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockOrders = [
        {
          id: 'ORD-001',
          customer: 'John Smith',
          email: 'john.smith@email.com',
          items: 3,
          total: 2450.75,
          status: 'pending',
          orderDate: '2024-01-15',
          deliveryDate: '2024-01-18'
        },
        {
          id: 'ORD-002',
          customer: 'Maria Garcia',
          email: 'maria.g@email.com',
          items: 5,
          total: 3420.50,
          status: 'confirmed',
          orderDate: '2024-01-14',
          deliveryDate: '2024-01-17'
        },
        {
          id: 'ORD-003',
          customer: 'Robert Johnson',
          email: 'r.johnson@email.com',
          items: 2,
          total: 1280.25,
          status: 'shipped',
          orderDate: '2024-01-13',
          deliveryDate: '2024-01-16'
        },
        {
          id: 'ORD-004',
          customer: 'Sarah Wilson',
          email: 'sarah.w@email.com',
          items: 4,
          total: 2890.00,
          status: 'delivered',
          orderDate: '2024-01-12',
          deliveryDate: '2024-01-15'
        },
        {
          id: 'ORD-005',
          customer: 'Mike Brown',
          email: 'mike.b@email.com',
          items: 1,
          total: 850.00,
          status: 'cancelled',
          orderDate: '2024-01-11',
          deliveryDate: '2024-01-14'
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock color={colors.orange} />;
      case 'confirmed': return <FaCheckCircle color={colors.primary} />;
      case 'shipped': return <FaTruck color={colors.purple} />;
      case 'delivered': return <FaCheckCircle color={colors.green} />;
      case 'cancelled': return <FaTimesCircle color={colors.red} />;
      default: return <FaClock color={colors.darkGray} />;
    }
  };

  const getStatusColor = (status) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : colors.darkGray;
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Update order status API call would go here
      console.log(`Updating order ${orderId} to ${newStatus}`);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '24px', 
          fontWeight: '700',
          color: colors.textDark
        }}>
          Orders Management
        </h2>
        <p style={{ 
          margin: 0, 
          color: colors.darkGray,
          fontSize: '14px'
        }}>
          Manage and track customer orders
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: colors.white,
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '250px' }}>
            <FaSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.darkGray
            }} />
            <input
              type="text"
              placeholder="Search orders by ID, customer, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: `1px solid #d1d5db`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: colors.lightGray
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {orderStatuses.map(status => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: statusFilter === status.value ? status.color : colors.lightGray,
                  color: statusFilter === status.value ? colors.white : colors.darkGray,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {getStatusIcon(status.value)}
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.secondary}20`,
              borderTop: `4px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1000px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: colors.lightGray }}>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: colors.textDark }}>Order ID</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: colors.textDark }}>Customer</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: colors.textDark }}>Items</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: colors.textDark }}>Total</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: colors.textDark }}>Status</th>
                    <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: '600', color: colors.textDark }}>Order Date</th>
                    <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: '600', color: colors.textDark }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map(order => (
                    <tr key={order.id} style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${colors.primary}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    >
                      <td style={{ padding: '16px 12px', fontWeight: '600', color: colors.primary }}>
                        {order.id}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: colors.textDark }}>
                            {order.customer}
                          </div>
                          <div style={{ fontSize: '12px', color: colors.darkGray }}>
                            {order.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', color: colors.darkGray }}>
                        {order.items} items
                      </td>
                      <td style={{ padding: '16px 12px', fontWeight: '600', color: colors.green }}>
                        ₱{order.total.toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          backgroundColor: `${getStatusColor(order.status)}15`,
                          color: getStatusColor(order.status),
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', color: colors.darkGray }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => console.log('View order:', order.id)}
                            style={{
                              padding: '8px',
                              border: 'none',
                              backgroundColor: `${colors.primary}15`,
                              color: colors.primary,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = colors.primary;
                              e.target.style.color = colors.white;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = `${colors.primary}15`;
                              e.target.style.color = colors.primary;
                            }}
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => console.log('Edit order:', order.id)}
                            style={{
                              padding: '8px',
                              border: 'none',
                              backgroundColor: `${colors.green}15`,
                              color: colors.green,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = colors.green;
                              e.target.style.color = colors.white;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = `${colors.green}15`;
                              e.target.style.color = colors.green;
                            }}
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div style={{ color: colors.darkGray, fontSize: '14px' }}>
                  Showing {Math.min(currentOrders.length, itemsPerPage)} of {filteredOrders.length} orders
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: currentPage === 1 ? colors.lightGray : colors.primary,
                      color: currentPage === 1 ? colors.darkGray : colors.white,
                      borderRadius: '6px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaChevronLeft size={12} /> Previous
                  </button>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '8px 12px',
                          border: 'none',
                          backgroundColor: currentPage === page ? colors.primary : colors.lightGray,
                          color: currentPage === page ? colors.white : colors.darkGray,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          minWidth: '40px'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: currentPage === totalPages ? colors.lightGray : colors.primary,
                      color: currentPage === totalPages ? colors.darkGray : colors.white,
                      borderRadius: '6px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Next <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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

export default OrdersManagement;