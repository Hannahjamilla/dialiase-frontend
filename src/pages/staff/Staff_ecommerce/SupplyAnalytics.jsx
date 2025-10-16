import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FaBox, FaExclamationTriangle, FaWarehouse, FaShoppingCart } from 'react-icons/fa';
import api from '../../../api/axios';

const SupplyAnalytics = ({ supplies, refreshTrigger }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Professional color scheme matching ManageEcom
  const colors = {
    primary: '#395886',
    green: '#477977',
    white: '#FFFFFF',
    warning: '#f59e0b',
    error: '#ef4444',
    lightGray: '#f8fafc',
    border: '#e2e8f0',
    darkGray: '#64748b',
    textDark: '#1e293b'
  };

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger, supplies]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supplies/analytics/dashboard');
      
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use actual supplies data for calculations
      calculateAnalyticsFromSupplies();
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalyticsFromSupplies = () => {
    if (!supplies.length) {
      setAnalytics({
        totalSupplies: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        inStockCount: 0
      });
      return;
    }

    // Calculate stock status from actual supplies
    const inStockCount = supplies.filter(s => s.stock > (s.minStock || 5)).length;
    const lowStockCount = supplies.filter(s => s.stock > 0 && s.stock <= (s.minStock || 5)).length;
    const outOfStockCount = supplies.filter(s => s.stock === 0).length;

    setAnalytics({
      totalSupplies: supplies.length,
      lowStockCount,
      outOfStockCount,
      inStockCount
    });
  };

  // Get stock level data for individual products
  const getProductStockData = () => {
    if (!supplies.length) return [];

    // Sort supplies by stock level (lowest first to highlight critical items)
    const sortedSupplies = [...supplies].sort((a, b) => (a.stock || 0) - (b.stock || 0));
    
    // Take top 15 products for better visualization
    const topProducts = sortedSupplies.slice(0, 15);
    
    return topProducts.map(supply => ({
      product: supply.name.length > 20 ? supply.name.substring(0, 20) + '...' : supply.name,
      stock: supply.stock || 0,
      minStock: supply.minStock || 5,
      status: supply.stock === 0 ? 'Out of Stock' : 
              supply.stock <= (supply.minStock || 5) ? 'Low Stock' : 'In Stock',
      category: supply.category || 'Uncategorized',
      stockPercentage: Math.min(100, ((supply.stock || 0) / ((supply.minStock || 5) * 3)) * 100) // Percentage relative to 3x min stock
    }));
  };

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: colors.white,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: colors.textDark }}>
            {data.product}
          </p>
          <p style={{ margin: '4px 0', color: colors.darkGray }}>
            Stock: <span style={{ color: colors.textDark, fontWeight: '600' }}>{data.stock} units</span>
          </p>
          <p style={{ margin: '4px 0', color: colors.darkGray }}>
            Min Stock: <span style={{ color: colors.textDark, fontWeight: '600' }}>{data.minStock} units</span>
          </p>
          <p style={{ margin: '4px 0', color: colors.darkGray }}>
            Status: <span style={{ 
              color: data.status === 'Out of Stock' ? colors.error : 
                     data.status === 'Low Stock' ? colors.warning : colors.green,
              fontWeight: '600'
            }}>
              {data.status}
            </span>
          </p>
          <p style={{ margin: '4px 0', color: colors.darkGray }}>
            Category: <span style={{ color: colors.textDark, fontWeight: '600' }}>{data.category}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '12px',
        padding: '40px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${colors.primary}20`,
          borderTop: `4px solid ${colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: colors.darkGray, margin: 0, fontSize: '14px' }}>Loading stock analytics...</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: colors.white,
      borderRadius: '12px',
      padding: '24px',
      border: `1px solid ${colors.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      flex: '1',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: colors.textDark,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaBox color={colors.primary} />
          Product Stock Analytics
        </h3>
        
        <div style={{ 
          color: colors.darkGray,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaWarehouse />
          Real-time Product Monitoring
        </div>
      </div>

      {/* Product Stock Levels Chart */}
      <div style={{ 
        backgroundColor: colors.lightGray, 
        padding: '20px', 
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        flex: '1',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '16px', 
            fontWeight: '600', 
            color: colors.textDark
          }}>
            Individual Product Stock Levels
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            fontSize: '12px',
            color: colors.darkGray
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.green
              }}></div>
              In Stock
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.warning
              }}></div>
              Low Stock
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.error
              }}></div>
              Out of Stock
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={getProductStockData()}
            margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.border} 
              vertical={false}
            />
            <XAxis 
              dataKey="product" 
              stroke={colors.darkGray} 
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: colors.darkGray }}
              interval={0}
            />
            <YAxis 
              stroke={colors.darkGray} 
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: colors.darkGray }}
              label={{ 
                value: 'Stock Units', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: colors.darkGray, fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="stock" 
              stroke={colors.primary} 
              strokeWidth={3}
              name="stock"
              dot={(props) => {
                const { cx, cy, payload } = props;
                let fillColor = colors.green;
                if (payload.status === 'Low Stock') fillColor = colors.warning;
                if (payload.status === 'Out of Stock') fillColor = colors.error;
                
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={5} 
                    fill={fillColor}
                    stroke={colors.white}
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ 
                r: 7, 
                fill: colors.primary,
                stroke: colors.white,
                strokeWidth: 2
              }}
            />
            
            {/* Reference line for minimum stock level */}
            {getProductStockData().length > 0 && (
              <Line 
                type="monotone" 
                dataKey="minStock" 
                stroke={colors.warning}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="minStock"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: colors.white,
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          fontSize: '12px'
        }}>
          <div style={{ color: colors.darkGray }}>
            Showing {Math.min(getProductStockData().length, 15)} of {supplies.length} products
            {getProductStockData().length < supplies.length && ' (lowest stock items shown first)'}
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            color: colors.darkGray
          }}>
            <span>
              <strong style={{ color: colors.green }}>{analytics?.inStockCount || 0}</strong> In Stock
            </span>
            <span>
              <strong style={{ color: colors.warning }}>{analytics?.lowStockCount || 0}</strong> Low Stock
            </span>
            <span>
              <strong style={{ color: colors.error }}>{analytics?.outOfStockCount || 0}</strong> Out of Stock
            </span>
          </div>
        </div>
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

export default SupplyAnalytics;