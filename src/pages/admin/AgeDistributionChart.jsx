import React, { useMemo, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { FaChartLine, FaInfoCircle, FaUsers, FaUserMd, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import api from '../../api/axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AgeDistributionChart = ({ windowWidth = 1024 }) => {
  const [dataType, setDataType] = useState('patients');
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch age distribution data
  const fetchAgeDistribution = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/age-distribution?type=${dataType}`);
      
      if (response.data.success) {
        setApiData(response.data);
      } else {
        setError(response.data.message || 'Failed to load distribution data');
        setApiData(null);
      }
    } catch (err) {
      console.error('Error fetching age distribution:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load data. Please try again.');
      }
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or dataType changes
  useEffect(() => {
    fetchAgeDistribution();
  }, [dataType]);

  // Group ages into meaningful ranges for better visualization
  const groupAgesIntoRanges = (ages, counts) => {
    const ranges = [
      { label: '0-17', min: 0, max: 17, color: '#3498db' },
      { label: '18-25', min: 18, max: 25, color: '#2980b9' },
      { label: '26-35', min: 26, max: 35, color: '#27ae60' },
      { label: '36-45', min: 36, max: 45, color: '#f39c12' },
      { label: '46-55', min: 46, max: 55, color: '#e67e22' },
      { label: '56-65', min: 56, max: 65, color: '#e74c3c' },
      { label: '66+', min: 66, max: 120, color: '#c0392b' }
    ];

    const rangeCounts = ranges.map(range => {
      const total = ages.reduce((sum, age, index) => {
        if (age >= range.min && age <= range.max) {
          return sum + counts[index];
        }
        return sum;
      }, 0);
      return total;
    });

    return { ranges, rangeCounts };
  };

  // Process chart data for line chart
  const { chartData: processedData, summaryStats, ageRanges } = useMemo(() => {
    if (!apiData || !apiData.data) {
      return { chartData: null, summaryStats: null, ageRanges: null };
    }

    const { ages = [], counts = [] } = apiData.data;

    // Remove decimals from min and max age
    const processedSummary = apiData.summary ? {
      ...apiData.summary,
      min_age: Math.round(apiData.summary.min_age),
      max_age: Math.round(apiData.summary.max_age)
    } : null;

    // Group ages into ranges
    const { ranges, rangeCounts } = groupAgesIntoRanges(ages, counts);

    const chartData = {
      labels: ranges.map(range => range.label),
      datasets: [
        {
          label: `Number of ${dataType === 'patients' ? 'Patients' : 'Medical Staff'}`,
          data: rangeCounts,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          pointBackgroundColor: ranges.map(range => range.color),
          pointBorderColor: ranges.map(range => range.color),
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: ranges.map(range => range.color),
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Smooth curve
          spanGaps: false,
        }
      ]
    };

    return { 
      chartData: chartData, 
      summaryStats: processedSummary,
      ageRanges: ranges.map((range, index) => ({
        ...range,
        count: rangeCounts[index],
        percentage: processedSummary ? ((rangeCounts[index] / processedSummary.total) * 100).toFixed(1) : 0
      }))
    };
  }, [apiData, dataType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(44, 62, 80, 0.95)',
        titleFont: { 
          size: 13, 
          weight: '600',
          family: "'Inter', sans-serif"
        },
        bodyFont: { 
          size: 12,
          family: "'Inter', sans-serif"
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const count = context.parsed.y;
            const total = summaryStats?.total || 1;
            const percentage = ((count / total) * 100).toFixed(1);
            return `${count} ${dataType} (${percentage}%)`;
          },
          title: (context) => {
            return `Age Range: ${context[0].label}`;
          }
        }
      }
    },
    interaction: { 
      mode: 'nearest', 
      axis: 'x', 
      intersect: false 
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Age Groups',
          font: { 
            size: 12, 
            weight: '600',
            family: "'Inter', sans-serif"
          },
          color: '#7f8c8d'
        },
        grid: { 
          display: false,
          drawBorder: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: { 
          color: '#95a5a6', 
          font: { 
            size: windowWidth <= 768 ? 10 : 11,
            family: "'Inter', sans-serif"
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of People',
          font: { 
            size: 12, 
            weight: '600',
            family: "'Inter', sans-serif"
          },
          color: '#7f8c8d'
        },
        beginAtZero: true,
        grid: { 
          color: 'rgba(0, 0, 0, 0.03)',
          drawBorder: false
        },
        ticks: {
          color: '#95a5a6',
          font: { 
            size: windowWidth <= 768 ? 10 : 11,
            family: "'Inter', sans-serif"
          },
          stepSize: 1
        }
      }
    },
    elements: {
      line: {
        tension: 0.4 // Smooth curves
      }
    }
  };

  const retryLoad = () => {
    setError(null);
    fetchAgeDistribution();
  };

  // Find the dominant age group
  const dominantAgeGroup = ageRanges ? ageRanges.reduce((prev, current) => 
    (prev.count > current.count) ? prev : current
  ) : null;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      marginBottom: '1.5rem',
      border: '1px solid #f1f2f6',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{
            color: '#2c3e50',
            fontSize: '1.25rem',
            margin: '0 0 0.5rem 0',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FaChartLine style={{ 
              color: dataType === 'patients' ? '#3498db' : '#2c3e50'
            }} />
            Age Distribution Pattern
          </h3>
          <p style={{
            color: '#7f8c8d',
            fontSize: '0.875rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            Currently viewing: {dataType === 'patients' ? 'Patients' : 'Medical Staff'}
            <FaInfoCircle size={12} />
          </p>
        </div>
        
        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          {/* Data Type Selector */}
          <div style={{
            display: 'flex',
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '0.25rem',
            border: '1px solid #e9ecef'
          }}>
            <button
              onClick={() => setDataType('patients')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: dataType === 'patients' ? '#3498db' : 'transparent',
                color: dataType === 'patients' ? 'white' : '#7f8c8d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
            >
              <FaUsers size={12} />
              CAPD Patients
            </button>
            
            <button
              onClick={() => setDataType('employees')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: dataType === 'employees' ? '#2c3e50' : 'transparent',
                color: dataType === 'employees' ? 'white' : '#7f8c8d',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
            >
              <FaUserMd size={12} />
              Medical Staff
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={retryLoad}
            style={{
              padding: '0.5rem',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              background: 'white',
              color: '#7f8c8d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            disabled={loading}
            title="Refresh data"
          >
            <FaSync size={12} />
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1.25rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#2c3e50',
              fontFeatureSettings: '"tnum"'
            }}>
              {summaryStats.total.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#7f8c8d',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#3498db',
              fontFeatureSettings: '"tnum"'
            }}>
              {Math.round(summaryStats.average_age)}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#7f8c8d',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Avg Age
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#27ae60',
              fontFeatureSettings: '"tnum"'
            }}>
              {summaryStats.min_age}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#7f8c8d',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Youngest
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#e74c3c',
              fontFeatureSettings: '"tnum"'
            }}>
              {summaryStats.max_age}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#7f8c8d',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Oldest
            </div>
          </div>
        </div>
      )}

      {/* Chart Area */}
      <div style={{ 
        height: '320px', 
        position: 'relative',
        marginBottom: '1rem'
      }}>
        {error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#e74c3c',
            textAlign: 'center',
            gap: '0.75rem',
            padding: '2rem'
          }}>
            <FaExclamationTriangle size={28} />
            <div style={{ 
              fontWeight: '600',
              fontSize: '1.1rem'
            }}>Data Unavailable</div>
            <div style={{ 
              fontSize: '0.9rem',
              color: '#7f8c8d',
              lineHeight: '1.4'
            }}>{error}</div>
            <button
              onClick={retryLoad}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1.5rem',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background 0.2s ease'
              }}
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#7f8c8d',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Loading {dataType} data...
          </div>
        ) : processedData && summaryStats && summaryStats.total > 0 ? (
          <Line data={processedData} options={options} />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#7f8c8d',
            fontSize: '1rem',
            textAlign: 'center',
            gap: '0.5rem',
            padding: '2rem'
          }}>
            <div style={{ fontWeight: '500' }}>No Data Available</div>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>
              No {dataType} have birth dates recorded in the system.
            </div>
          </div>
        )}
      </div>

      {/* Dominant Age Group Insight - Kept this as it provides valuable insight */}
      {dominantAgeGroup && summaryStats && summaryStats.total > 0 && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(52, 152, 219, 0.1)',
          borderRadius: '6px',
          border: '1px solid rgba(52, 152, 219, 0.2)'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#2c3e50',
            fontWeight: '500'
          }}>
            Top Point: The {dominantAgeGroup.label} age group has the highest concentration ({dominantAgeGroup.percentage}% of total)
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid #f1f2f6',
        fontSize: '0.75rem',
        color: '#95a5a6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <span>
          {dataType === 'patients' ? 'Patient' : 'Medical Staff'} age distribution Pattern
        </span>
      </div>
    </div>
  );
};

export default AgeDistributionChart;