
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaDownload, 
  FaCalendar,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaShoppingCart,
  FaUsers,
  FaDollarSign,
  FaBox
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsModal = ({ isOpen, onClose, colors, statistics, timeframe = 'monthly' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chartTimeframe, setChartTimeframe] = useState(timeframe);

  // Mock data for demonstration
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [12500, 19000, 15000, 22000, 18000, 25000, 30000, 28000, 32000, 35000, 40000, 45000],
        borderColor: colors.chartPrimary,
        backgroundColor: `${colors.chartPrimary}20`,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Number of Orders',
        data: [45, 65, 55, 75, 60, 85, 95, 90, 105, 115, 125, 140],
        borderColor: colors.chartSecondary,
        backgroundColor: `${colors.chartSecondary}20`,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const productData = {
    labels: ['Dialysis Solution', 'IV Catheters', 'Medical Gloves', 'Syringes', 'Bandages'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [45000, 32000, 28000, 22000, 18000],
        backgroundColor: [
          colors.chartPrimary,
          colors.chartSecondary,
          colors.chartTertiary,
          colors.chartWarning,
          '#9CA3AF'
        ],
        borderWidth: 2,
        borderColor: colors.white
      }
    ]
  };

  const statusDistribution = {
    labels: ['Completed', 'Pending', 'Ready for Pickup', 'Confirmed', 'Cancelled'],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          colors.success,
          colors.warning,
          colors.secondary,
          colors.info,
          colors.error
        ],
        borderWidth: 3,
        borderColor: colors.white
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: colors.textDark,
          usePointStyle: true,
        }
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif"
        },
        color: colors.textDark,
        padding: 20
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colors.border
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: colors.darkGray
        }
      },
      x: {
        grid: {
          color: colors.border
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: colors.darkGray
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          color: colors.textDark,
          usePointStyle: true,
          padding: 15
        }
      }
    },
    cutout: '60%'
  };

  if (!isOpen) return null;

  return (
    <div className="analytics-modal-overlay">
      <div className="analytics-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <FaChartPie className="title-icon" />
            <div>
              <h2 className="modal-title">Order Analytics Dashboard</h2>
              <p className="modal-subtitle">Comprehensive insights into patient orders and sales performance</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {['overview', 'sales', 'products', 'customers'].map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="timeframe-selector">
          <label>Timeframe:</label>
          <div className="timeframe-buttons">
            {['weekly', 'monthly', 'quarterly', 'yearly'].map(timeframe => (
              <button
                key={timeframe}
                className={`timeframe-button ${chartTimeframe === timeframe ? 'active' : ''}`}
                onClick={() => setChartTimeframe(timeframe)}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon total-revenue">
                    <FaDollarSign />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">{statistics?.monthly?.revenue ? `₱${(statistics.monthly.revenue / 1000).toFixed(0)}K` : '₱752K'}</div>
                    <div className="metric-label">Monthly Revenue</div>
                    <div className="metric-trend positive">+12.5% from last month</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon total-orders">
                    <FaShoppingCart />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">{statistics?.monthly?.orders || 325}</div>
                    <div className="metric-label">Monthly Orders</div>
                    <div className="metric-trend positive">+8.3% from last month</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon avg-order">
                    <FaChartLine />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">₱2,315</div>
                    <div className="metric-label">Average Order Value</div>
                    <div className="metric-trend positive">+4.2% from last month</div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon customers">
                    <FaUsers />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">142</div>
                    <div className="metric-label">Active Patients</div>
                    <div className="metric-trend positive">+5.2% from last month</div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                <div className="chart-container large">
                  <h3 className="chart-title">Sales Trend</h3>
                  <div className="chart-wrapper">
                    <Line data={salesData} options={chartOptions} />
                  </div>
                </div>
                
                <div className="chart-container small">
                  <h3 className="chart-title">Order Status Distribution</h3>
                  <div className="chart-wrapper">
                    <Doughnut data={statusDistribution} options={doughnutOptions} />
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="charts-row">
                <div className="chart-container">
                  <h3 className="chart-title">Top Products</h3>
                  <div className="chart-wrapper">
                    <Bar 
                      data={productData} 
                      options={{
                        ...chartOptions,
                        indexAxis: 'y',
                        plugins: {
                          ...chartOptions.plugins,
                          legend: {
                            display: false
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
                
                <div className="quick-stats-card">
                  <h3 className="chart-title">Performance Summary</h3>
                  <div className="performance-stats">
                    <div className="performance-item">
                      <span className="performance-label">Completion Rate</span>
                      <span className="performance-value">94.5%</span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Avg Processing Time</span>
                      <span className="performance-value">2.3 days</span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Customer Satisfaction</span>
                      <span className="performance-value">4.8/5.0</span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Return Rate</span>
                      <span className="performance-value">1.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="sales-tab">
              <div className="chart-container full-width">
                <h3 className="chart-title">Detailed Sales Analysis</h3>
                <div className="chart-wrapper">
                  <Line data={salesData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="download-report-btn">
            <FaDownload />
            Download Full Report
          </button>
        </div>

        <style jsx>{`
          .analytics-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
          }

          .analytics-modal {
            background: ${colors.white};
            border-radius: 20px;
            width: 95%;
            height: 90%;
            max-width: 1400px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            animation: modalSlideIn 0.3s ease;
          }

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 2rem 2rem 1rem;
            border-bottom: 1px solid ${colors.border};
          }

          .modal-title-section {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .title-icon {
            font-size: 2rem;
            color: ${colors.primary};
          }

          .modal-title {
            margin: 0 0 0.5rem 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: ${colors.textDark};
          }

          .modal-subtitle {
            margin: 0;
            color: ${colors.darkGray};
            font-size: 0.875rem;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: ${colors.darkGray};
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .close-button:hover {
            background: ${colors.lightGray};
            color: ${colors.textDark};
          }

          .modal-tabs {
            display: flex;
            padding: 0 2rem;
            border-bottom: 1px solid ${colors.border};
            gap: 0.5rem;
          }

          .tab-button {
            padding: 1rem 1.5rem;
            background: none;
            border: none;
            color: ${colors.darkGray};
            cursor: pointer;
            font-weight: 500;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
          }

          .tab-button.active {
            color: ${colors.primary};
            border-bottom-color: ${colors.primary};
          }

          .tab-button:hover:not(.active) {
            color: ${colors.textDark};
          }

          .timeframe-selector {
            padding: 1rem 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            background: ${colors.lightGray};
            border-bottom: 1px solid ${colors.border};
          }

          .timeframe-selector label {
            font-weight: 600;
            color: ${colors.textDark};
            font-size: 0.875rem;
          }

          .timeframe-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .timeframe-button {
            padding: 0.5rem 1rem;
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 6px;
            color: ${colors.textLight};
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .timeframe-button.active {
            background: ${colors.primary};
            color: ${colors.white};
            border-color: ${colors.primary};
          }

          .modal-content {
            flex: 1;
            padding: 1.5rem 2rem;
            overflow-y: auto;
          }

          .overview-grid {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            height: 100%;
          }

          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          }

          .metric-card {
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: all 0.3s ease;
          }

          .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }

          .metric-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
          }

          .metric-icon.total-revenue { background: ${colors.success}15; color: ${colors.success}; }
          .metric-icon.total-orders { background: ${colors.primary}15; color: ${colors.primary}; }
          .metric-icon.avg-order { background: ${colors.accent}15; color: ${colors.accent}; }
          .metric-icon.customers { background: ${colors.warning}15; color: ${colors.warning}; }

          .metric-info {
            flex: 1;
          }

          .metric-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: ${colors.textDark};
            margin-bottom: 0.25rem;
          }

          .metric-label {
            font-size: 0.875rem;
            color: ${colors.darkGray};
            margin-bottom: 0.5rem;
          }

          .metric-trend {
            font-size: 0.75rem;
            font-weight: 600;
          }

          .metric-trend.positive {
            color: ${colors.success};
          }

          .charts-row {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
            height: 300px;
          }

          .chart-container {
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
          }

          .chart-container.large {
            grid-column: 1;
          }

          .chart-container.small {
            grid-column: 2;
          }

          .chart-container.full-width {
            grid-column: 1 / -1;
            height: 400px;
          }

          .chart-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: ${colors.textDark};
            margin: 0 0 1rem 0;
          }

          .chart-wrapper {
            flex: 1;
            min-height: 0;
          }

          .quick-stats-card {
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
          }

          .performance-stats {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            flex: 1;
            justify-content: space-around;
          }

          .performance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid ${colors.border};
          }

          .performance-item:last-child {
            border-bottom: none;
          }

          .performance-label {
            font-size: 0.875rem;
            color: ${colors.textLight};
          }

          .performance-value {
            font-size: 1rem;
            font-weight: 600;
            color: ${colors.textDark};
          }

          .sales-tab {
            height: 100%;
          }

          .modal-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid ${colors.border};
            display: flex;
            justify-content: center;
          }

          .download-report-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 2rem;
            background: ${colors.primary};
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .download-report-btn:hover {
            background: ${colors.primaryDark};
            transform: translateY(-1px);
          }

          @media (max-width: 768px) {
            .analytics-modal-overlay {
              padding: 1rem;
            }

            .analytics-modal {
              width: 100%;
              height: 95%;
            }

            .modal-header {
              padding: 1.5rem 1rem 1rem;
            }

            .modal-title {
              font-size: 1.5rem;
            }

            .modal-tabs {
              padding: 0 1rem;
              overflow-x: auto;
            }

            .tab-button {
              padding: 1rem;
              white-space: nowrap;
            }

            .timeframe-selector {
              padding: 1rem;
              flex-direction: column;
              align-items: stretch;
            }

            .timeframe-buttons {
              justify-content: center;
            }

            .modal-content {
              padding: 1rem;
            }

            .metrics-grid {
              grid-template-columns: 1fr;
            }

            .charts-row {
              grid-template-columns: 1fr;
              height: auto;
            }

            .chart-container.large,
            .chart-container.small {
              grid-column: 1;
              height: 250px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AnalyticsModal;