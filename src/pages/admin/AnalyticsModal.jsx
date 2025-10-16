import React, { useState } from 'react';
import { FaTimes, FaInfoCircle, FaChartBar, FaChartPie, FaChartLine, FaChartArea, FaDownload } from 'react-icons/fa';
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement,
  RadialLinearScale
} from 'chart.js';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

const AnalyticsModal = ({ isOpen, onClose, logs }) => {
  const [actionChartType, setActionChartType] = useState('bar');

  if (!isOpen) return null;

  // Helper functions
  const getActivityCountByType = () => {
    const types = {};
    logs.forEach(log => {
      const action = log.action || 'Other';
      types[action] = (types[action] || 0) + 1;
    });
    return types;
  };

  const getActivityCountByUser = () => {
    const users = {};
    logs.forEach(log => {
      const user = log.user_name || 'System';
      users[user] = (users[user] || 0) + 1;
    });
    return users;
  };

  const getActivityCountByDate = () => {
    const dates = {};
    logs.forEach(log => {
      if (log.timestamp) {
        const date = new Date(log.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        dates[date] = (dates[date] || 0) + 1;
      }
    });
    return dates;
  };

  // Stats
  const totalActivities = logs?.length || 0;
  const mostActiveUser = Object.entries(getActivityCountByUser()).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  const mostCommonAction = Object.entries(getActivityCountByType()).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  const activityByType = getActivityCountByType();
  const activityByUser = getActivityCountByUser();
  const activityByDate = getActivityCountByDate();

  const actionTypeData = {
    labels: Object.keys(activityByType),
    datasets: [{
      label: 'Actions',
      data: Object.values(activityByType),
      backgroundColor: ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'].map(c => `${c}CC`),
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  // Generate PDF Report
  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    // Set font
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("SYSTEM ACTIVITY ANALYSIS REPORT", pageWidth / 2, yPos, { align: "center" });
    
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${date}`, pageWidth / 2, yPos, { align: "center" });
    
    yPos += 15;
    
    // Report Overview
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("REPORT OVERVIEW", margin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const overviewText = `This report provides a comprehensive analysis of system activity, including user actions, activity trends, and performance metrics. The analysis covers ${totalActivities} activities recorded in the system.`;
    
    const splitOverview = doc.splitTextToSize(overviewText, contentWidth);
    doc.text(splitOverview, margin, yPos);
    yPos += (splitOverview.length * 5.5) + 15;
    
    // Key Metrics Section
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("KEY METRICS", margin, yPos);
    yPos += 8;
    
    // Create a metrics table
    const metrics = [
      { label: "Total Activities", value: totalActivities },
      { label: "Most Active User", value: `${mostActiveUser[0]} (${mostActiveUser[1]} actions)` },
      { label: "Common", value: `${mostCommonAction[0]} (${mostCommonAction[1]} occurrences)` },
      { label: "Unique Users", value: Object.keys(activityByUser).length },
      { label: "Unique Action Types", value: Object.keys(activityByType).length },
      { label: "Time Period Covered", value: `${Object.keys(activityByDate)[0]} to ${Object.keys(activityByDate)[Object.keys(activityByDate).length - 1]}` }
    ];
    
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Metric", margin + 5, yPos + 6.5);
    doc.text("Value", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
    
    yPos += 10;
    
    // Table rows
    metrics.forEach((metric, index) => {
      // Alternate row background for readability
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(metric.label, margin + 5, yPos + 6.5);
      doc.text(metric.value.toString(), margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
    });
    
    yPos += 15;
    
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = margin;
    }
    
    // Activity by Type Section
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("ACTIVITY BY TYPE", margin, yPos);
    yPos += 8;
    
    // Activity by type table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Action Type", margin + 5, yPos + 6.5);
    doc.text("Count", margin + contentWidth - 40, yPos + 6.5);
    doc.text("Percentage", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
    
    yPos += 10;
    
    Object.entries(activityByType).forEach(([action, count], index) => {
      const percentage = Math.round((count / totalActivities) * 100);
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(action, margin + 5, yPos + 6.5);
      doc.text(count.toString(), margin + contentWidth - 40, yPos + 6.5);
      doc.text(`${percentage}%`, margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
      
      // Add new page if needed
      if (yPos > 270 && index < Object.entries(activityByType).length - 1) {
        doc.addPage();
        yPos = margin;
        
        // Add table header to new page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 10, "F");
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("Action Type", margin + 5, yPos + 6.5);
        doc.text("Count", margin + contentWidth - 40, yPos + 6.5);
        doc.text("Percentage", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
        
        yPos += 10;
      }
    });
    
    yPos += 15;
    
    // Activity by User Section
    if (yPos > 230) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("ACTIVITY BY USER", margin, yPos);
    yPos += 8;
    
    // Sort users by activity count (descending)
    const sortedUsers = Object.entries(activityByUser).sort((a, b) => b[1] - a[1]);
    
    // Activity by user table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("User", margin + 5, yPos + 6.5);
    doc.text("Activities", margin + contentWidth - 40, yPos + 6.5);
    doc.text("%", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
    
    yPos += 10;
    
    sortedUsers.forEach(([user, count], index) => {
      const percentage = Math.round((count / totalActivities) * 100);
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(user, margin + 5, yPos + 6.5);
      doc.text(count.toString(), margin + contentWidth - 40, yPos + 6.5);
      doc.text(`${percentage}%`, margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
      
      // Add new page if needed
      if (yPos > 270 && index < sortedUsers.length - 1) {
        doc.addPage();
        yPos = margin;
        
        // Add table header to new page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 10, "F");
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("User", margin + 5, yPos + 6.5);
        doc.text("Activities", margin + contentWidth - 40, yPos + 6.5);
        doc.text("Percentage", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
        
        yPos += 10;
      }
    });
    
    yPos += 15;
    
    // Activity Timeline Section
    if (yPos > 230) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("ACTIVITY TIMELINE", margin, yPos);
    yPos += 8;
    
    // Sort dates chronologically
    const sortedDates = Object.entries(activityByDate).sort((a, b) => {
      return new Date(a[0]) - new Date(b[0]);
    });
    
    // Activity timeline table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Date", margin + 5, yPos + 6.5);
    doc.text("Activities", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
    
    yPos += 10;
    
    sortedDates.forEach(([date, count], index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(date, margin + 5, yPos + 6.5);
      doc.text(count.toString(), margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
      
      // Add new page if needed
      if (yPos > 270 && index < sortedDates.length - 1) {
        doc.addPage();
        yPos = margin;
        
        // Add table header to new page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 10, "F");
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("Date", margin + 5, yPos + 6.5);
        doc.text("Activities", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
        
        yPos += 10;
      }
    });
    
    yPos += 15;
    
    // Analysis and Insights Section
    if (yPos > 200) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("ANALYSIS AND INSIGHTS", margin, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(60, 60, 60);
    
    // Find peak and lowest activity days
    const activities = sortedDates.map(date => date[1]);
    const maxActivities = Math.max(...activities);
    const minActivities = Math.min(...activities.filter(val => val > 0));
    const peakDateIndex = activities.indexOf(maxActivities);
    const lowDateIndex = activities.indexOf(minActivities);
    const peakDate = sortedDates[peakDateIndex][0];
    const lowDate = sortedDates[lowDateIndex][0];
    
    const analysisText = [
      `System activity analysis reveals ${totalActivities} recorded actions performed by ${Object.keys(activityByUser).length} unique users.`,
      `The most active user was ${mostActiveUser[0]} with ${mostActiveUser[1]} actions, accounting for ${Math.round((mostActiveUser[1] / totalActivities) * 100)}% of total activity.`,
      `most common action type was ${mostCommonAction[0]} with ${mostCommonAction[1]} occurrences, representing ${Math.round((mostCommonAction[1] / totalActivities) * 100)}% of all actions.`,
      `Activity peaked on ${peakDate} with ${maxActivities} actions, compared to a low of ${minActivities} actions on ${lowDate}.`,
      `The average daily activity rate is ${Math.round(activities.reduce((a, b) => a + b, 0) / activities.length)} actions per day.`,
      `This analysis can inform system optimization, user training needs, and resource allocation decisions.`
    ];
    
    analysisText.forEach(text => {
      const splitText = doc.splitTextToSize(text, contentWidth);
      doc.text(splitText, margin, yPos);
      yPos += (splitText.length * 5) + 4;
    });
    
    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    const footerY = 285;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, footerY, pageWidth - margin, footerY);
      
      // Page number
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, footerY + 5, { align: "center" });
      
      // Confidential notice
      doc.text("Confidential - For Internal Use Only", pageWidth / 2, footerY + 10, { align: "center" });
    }
    
    // Save the PDF
    doc.save(`system-activity-report-${date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div style={modalBackdrop}>
      <div style={modalContainer}>
        
        {/* Header */}
        <div style={header}>
          <div>
            <h2 style={headerTitle}>📊 Activity Overview</h2>
            <p style={headerSubtitle}>See highlights of recent activity in the system</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={generatePDF} style={downloadButton}>
              <FaDownload style={{ marginRight: '8px' }} />
              Download PDF
            </button>
            <button onClick={onClose} style={closeButton}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Info Message */}
        <div style={infoBox}>
          <FaInfoCircle style={infoIcon} />
          <div>
            <p style={infoTitle}>What you'll see here</p>
            <ul style={infoList}>
              <li>Breakdown of actions done in the system</li>
              <li>Which people were most active</li>
              <li>When activity peaked</li>
              <li>Hover over any chart for details</li>
            </ul>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={statsGrid}>
          <MetricCard title="Total Actions" value={totalActivities} color="#4F46E5" />
          <MetricCard title="Most Active Person" value={mostActiveUser[1]} subtitle={mostActiveUser[0]} color="#10B981" />
          <MetricCard title="Common" value={mostCommonAction[1]} subtitle={mostCommonAction[0]} color="#F59E0B" />
        </div>

        {/* Charts */}
        <div style={chartsGrid}>
          {/* Activity by Type */}
          <ChartCard 
            title="Actions by Type" 
            label="ACTION TYPES" 
            icon={<FaChartBar />} 
            description="Distribution of actions across types."
          >
            {/* Chart type switch buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button style={chartSwitchBtn} onClick={() => setActionChartType('bar')}><FaChartBar /> Bar</button>
              <button style={chartSwitchBtn} onClick={() => setActionChartType('pie')}><FaChartPie /> Pie</button>
              <button style={chartSwitchBtn} onClick={() => setActionChartType('line')}><FaChartLine /> Line</button>
              <button style={chartSwitchBtn} onClick={() => setActionChartType('doughnut')}><FaChartArea /> Doughnut</button>
            </div>

            {actionChartType === 'bar' && (
              <Bar 
                data={actionTypeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { ticks: { color: '#334155', font: { size: 12 } }, grid: { display: false } },
                    x: { display: false }
                  }
                }}
              />
            )}
            {actionChartType === 'pie' && (
              <Pie data={actionTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
            {actionChartType === 'line' && (
              <Line data={actionTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
            {actionChartType === 'doughnut' && (
              <Doughnut data={actionTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
            )}
          </ChartCard>

          {/* Activity by User */}
          <ChartCard title="Actions by Person" label="USER BREAKDOWN" icon={<FaChartPie />} description="People who are most active.">
            <Pie 
              data={{
                labels: Object.keys(activityByUser),
                datasets: [{
                  data: Object.values(activityByUser),
                  backgroundColor: ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'].map(c => `${c}B3`),
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: { legend: { position: 'right', labels: { color: '#334155', font: { size: 12 } } } }
              }}
            />
          </ChartCard>

          {/* Timeline */}
          <ChartCard title="Activity Over Time" label="TIMELINE" icon={<FaChartLine />} description="Activity trends across days." fullWidth>
            <Line 
              data={{
                labels: Object.keys(activityByDate),
                datasets: [{
                  label: 'Activity',
                  data: Object.values(activityByDate),
                  fill: { target: 'origin', above: 'rgba(99, 102, 241, 0.1)' },
                  borderColor: '#6366F1',
                  borderWidth: 3,
                  tension: 0.2,
                  pointBackgroundColor: '#6366F1',
                  pointRadius: 5
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { color: '#334155', font: { size: 12 } }, grid: { color: '#E2E8F0' } },
                  x: { ticks: { color: '#334155', font: { size: 12 } }, grid: { display: false } }
                }
              }}
            />
          </ChartCard>
        </div>

        {/* Footer */}
        <div style={footer}>
          <button onClick={onClose} style={primaryButton}>Close</button>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---
const MetricCard = ({ title, value, subtitle, color }) => (
  <div style={{ ...metricCard, borderLeft: `5px solid ${color}`, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
    <h3 style={metricTitle}>{title}</h3>
    <p style={metricValue}>{value}</p>
    {subtitle && <p style={metricSubtitle}>{subtitle}</p>}
  </div>
);

const ChartCard = ({ title, label, icon, description, children, fullWidth }) => (
  <div style={{ ...chartCard, gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
    <div style={chartHeader}>
      <h3 style={chartTitle}>{icon} {title}</h3>
      <span style={chartLabel}>{label}</span>
    </div>
    <p style={chartDescription}>{description}</p>
    <div style={{ height: '320px' }}>{children}</div>
  </div>
);

// --- Styles ---
const modalBackdrop = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' };
const modalContainer = { background: '#fff', borderRadius: 14, boxShadow: '0 12px 28px rgba(0,0,0,0.15)', width: '95%', maxWidth: 1400, maxHeight: '95vh', overflow: 'auto' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, background: '#fff', zIndex: 10 };
const headerTitle = { margin: 0, fontWeight: 700, color: '#1E293B', fontSize: 22 };
const headerSubtitle = { margin: '6px 0 0', color: '#64748B', fontSize: 14 };
const closeButton = { background: '#F1F5F9', border: 'none', color: '#475569', fontSize: 20, cursor: 'pointer', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const downloadButton = { background: '#4F46E5', color: 'white', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const infoBox = { background: '#F8FAFC', padding: '18px 22px', margin: '24px', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 14, borderLeft: '5px solid #6366F1' };
const infoIcon = { color: '#6366F1', fontSize: 20, marginTop: 2 };
const infoTitle = { margin: '0 0 6px', fontWeight: 600, color: '#1E293B' };
const infoList = { margin: 0, paddingLeft: 20, fontSize: 14, color: '#475569', lineHeight: 1.6 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, padding: '0 24px 24px' };
const metricCard = { background: '#F8FAFC', padding: 18, borderRadius: 12, transition: 'transform 0.2s ease', cursor: 'default' };
const metricTitle = { margin: '0 0 10px', color: '#64748B', fontSize: 14, fontWeight: 600 };
const metricValue = { margin: 0, fontSize: 26, fontWeight: 700, color: '#1E293B' };
const metricSubtitle = { margin: '6px 0 0', color: '#64748B', fontSize: 13 };
const chartsGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '0 24px 24px' };
const chartCard = { background: '#F8FAFC', padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.06)' };
const chartHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const chartTitle = { margin: 0, color: '#1E293B', fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 };
const chartLabel = { background: '#E0E7FF', color: '#4338CA', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 };
const chartDescription = { margin: '0 0 16px', color: '#475569', fontSize: 14 };
const footer = { padding: 20, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E2E8F0', background: '#fff', position: 'sticky', bottom: 0 };
const primaryButton = { padding: '10px 24px', background: '#6366F1', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const chartSwitchBtn = { background: '#E5E7EB', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' };

export default AnalyticsModal;