import React, { useRef } from 'react';
import { 
  FaTimes, 
  FaInfoCircle, 
  FaUserMd, 
  FaUserNurse, 
  FaUserShield, 
  FaTruck,
  FaCalendarAlt,
  FaUserPlus,
  FaChartPie,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaDownload
} from 'react-icons/fa';
import { Pie, Line, Bar } from 'react-chartjs-2';
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
  LineElement
} from 'chart.js';
import jsPDF from 'jspdf';

// Register needed Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const EmployeeListAnalyticsModal = ({ providers = [], onClose }) => {
  const modalRef = useRef();
  
  // Color variables
  const colors = {
    primary: '#395886',
    secondary: '#638ECB',
    white: '#FFFFFF',
    green: '#477977',
    lightBg: '#F8FAFC',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    border: 'rgba(0,0,0,0.1)'
  };

  /** -------------------
   * Helper Functions
   * ------------------- */

  // 1. Get time since registration
  const getTimeSinceRegistration = (created_at) => {
    if (!created_at) return 'Other';
    const regDate = new Date(created_at);
    const diff = Date.now() - regDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 30) return 'New (<30 days)';
    if (days < 180) return 'Recent (1-6 months)';
    if (days < 365) return 'Established (6-12 months)';
    return 'Long-term (1+ years)';
  };

  // 2. Make a color gradient for charts
  const createGradient = (ctx, area, colorStops) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });
    return gradient;
  };

  /** -------------------
   * PDF Generation Function
   * ------------------- */
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
    doc.text("EMPLOYEE WORKFORCE ANALYTICS REPORT", pageWidth / 2, yPos, { align: "center" });
    
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
    const overviewText = `This report provides a comprehensive analysis of the organization's workforce demographics, including role distribution, employment status, hiring trends, and employee tenure. The analysis covers ${totalEmployees} employees and is designed to support HR planning and resource allocation decisions.`;
    
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
      { label: "Total Employees", value: totalEmployees },
      { label: "Clinical Staff", value: totalClinicalStaff, percentage: Math.round((totalClinicalStaff/totalEmployees)*100) },
      { label: "Doctors", value: totalDoctors, percentage: Math.round((totalDoctors/totalEmployees)*100) },
      { label: "Nurses", value: totalNurses, percentage: Math.round((totalNurses/totalEmployees)*100) },
      { label: "Admin Staff", value: totalAdmins, percentage: Math.round((totalAdmins/totalEmployees)*100) },
      { label: "Distributors", value: totalDistributors, percentage: Math.round((totalDistributors/totalEmployees)*100) },
      { label: "New Hires (30 days)", value: newHires, percentage: Math.round((newHires/totalEmployees)*100) }
    ];
    
    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Metric", margin + 5, yPos + 6.5);
    doc.text("Count", margin + contentWidth - 55, yPos + 6.5);
    doc.text("Percentage", margin + contentWidth - 15, yPos + 6.5, { align: "right" });
    
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
      doc.text(metric.value.toString(), margin + contentWidth - 55, yPos + 6.5);
      
      if (metric.percentage) {
        doc.text(`${metric.percentage}%`, margin + contentWidth - 15, yPos + 6.5, { align: "right" });
      } else {
        doc.text("-", margin + contentWidth - 15, yPos + 6.5, { align: "right" });
      }
      
      yPos += 10;
    });
    
    yPos += 15;
    
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = margin;
    }
    
    // Role Distribution Analysis
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("ROLE DISTRIBUTION", margin, yPos);
    yPos += 8;
    
    const roleData = getRoleDistributionData();
    
    // Role distribution table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Role", margin + 5, yPos + 6.5);
    doc.text("Percentage", margin + contentWidth - 40, yPos + 6.5);

    
    yPos += 10;
    
    roleData.labels.forEach((label, index) => {
      const count = roleData.datasets[0].data[index];
      const percentage = Math.round((count / totalEmployees) * 100);
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(label, margin + 5, yPos + 6.5);
      doc.text(count.toString(), margin + contentWidth - 40, yPos + 6.5);
      doc.text(`${percentage}%`, margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
    });
    
    yPos += 15;
    
    // Status Distribution
    if (yPos > 210) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("EMPLOYMENT STATUS DISTRIBUTION", margin, yPos);
    yPos += 8;
    
    const statusData = getStatusDistributionData();
    
    // Status distribution table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Status", margin + 5, yPos + 6.5);
    doc.text("Percentage", margin + contentWidth - 40, yPos + 6.5);

    
    yPos += 10;
    
    statusData.labels.forEach((label, index) => {
      const count = statusData.datasets[0].data[index];
      const percentage = Math.round((count / totalEmployees) * 100);
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(label, margin + 5, yPos + 6.5);
      doc.text(count.toString(), margin + contentWidth - 40, yPos + 6.5);
      doc.text(`${percentage}%`, margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
    });
    
    yPos += 15;
    
    // Registration Trends Section
    if (yPos > 200) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("REGISTRATION TRENDS (12-MONTH PERIOD)", margin, yPos);
    yPos += 8;
    
    const trendData = getRegistrationTrendData();
    
    // Registration trends table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Month", margin + 5, yPos + 6.5);
    doc.text("Registrations", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
    
    yPos += 10;
    
    trendData.labels.forEach((month, index) => {
      const count = trendData.datasets[0].data[index];
      
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(month, margin + 5, yPos + 6.5);
      doc.text(count.toString(), margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
      
      // Add new page if needed
      if (yPos > 270 && index < trendData.labels.length - 1) {
        doc.addPage();
        yPos = margin;
        
        // Add table header to new page
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, contentWidth, 10, "F");
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("Month", margin + 5, yPos + 6.5);
        doc.text("Registrations", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
        
        yPos += 10;
      }
    });
    
    yPos += 15;
    
    // Tenure Analysis Section
    if (yPos > 200) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("EMPLOYEE TENURE ANALYSIS", margin, yPos);
    yPos += 8;
    
    const tenureData = getTenureData();
    
    // Tenure table
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 10, "F");
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Tenure Group", margin + 5, yPos + 6.5);
    doc.text("Percentage", margin + contentWidth - 40, yPos + 6.5);

    
    yPos += 10;
    
    tenureData.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos, contentWidth, 10, "F");
      }
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont(undefined, "normal");
      doc.text(item.group, margin + 5, yPos + 6.5);
      doc.text(item.count.toString(), margin + contentWidth - 40, yPos + 6.5);
      doc.text(`${item.percentage}%`, margin + contentWidth - 10, yPos + 6.5, { align: "right" });
      
      yPos += 10;
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
    
    // Find peak and lowest registration months
    const registrations = trendData.datasets[0].data;
    const maxRegistrations = Math.max(...registrations);
    const minRegistrations = Math.min(...registrations.filter(val => val > 0));
    const peakMonthIndex = registrations.indexOf(maxRegistrations);
    const lowMonthIndex = registrations.indexOf(minRegistrations);
    const peakMonth = trendData.labels[peakMonthIndex];
    const lowMonth = trendData.labels[lowMonthIndex];
    
    const analysisText = [
      `The organization employs ${totalEmployees} individuals, with clinical staff representing ${Math.round((totalClinicalStaff/totalEmployees)*100)}% of the workforce.`,
      `Doctors account for ${Math.round((totalDoctors/totalEmployees)*100)}% of employees, while nurses comprise ${Math.round((totalNurses/totalEmployees)*100)}%.`,
      `Administrative staff make up ${Math.round((totalAdmins/totalEmployees)*100)}% of the workforce, with distributors accounting for ${Math.round((totalDistributors/totalEmployees)*100)}%.`,
      `Hiring trends show a peak of ${maxRegistrations} new employees in ${peakMonth}, compared to a low of ${minRegistrations} registrations in ${lowMonth}.`,
      `The average monthly hiring rate is ${Math.round(registrations.reduce((a, b) => a + b, 0) / 12)} employees per month.`,
      `Tenure analysis reveals ${tenureData[3].percentage}% of employees have been with the organization for over one year, indicating strong retention.`,
      `This workforce analysis can inform HR strategy, talent development initiatives, and organizational planning.`
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
      doc.text("Confidential - For Internal HR Use Only", pageWidth / 2, footerY + 10, { align: "center" });
    }
    
    // Save the PDF
    doc.save(`employee-workforce-report-${date.replace(/\//g, '-')}.pdf`);
  };

  /** -------------------
   * Chart Data - Role Distribution (Pie)
   * ------------------- */
  const getRoleDistributionData = () => {
    if (!providers || providers.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(200, 200, 200, 0.7)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 1
        }]
      };
    }

    // Count providers per role
    const counts = providers.reduce((acc, provider) => {
      const role = provider.userLevel || 'other';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(counts).map(role => {
        switch(role) {
          case 'doctor': return 'Doctors';
          case 'nurse': return 'Nurses';
          case 'admin': return 'Admins';
          case 'distributor': return 'Distributors';
          default: return 'Other Roles';
        }
      }),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: [
          colors.primary,
          colors.green,
          colors.secondary,
          '#F59E0B',
          '#8B5CF6'
        ],
        borderColor: colors.white,
        borderWidth: 2,
        cutout: '65%',
        borderRadius: 10,
        spacing: 5
      }]
    };
  };

  /** -------------------
   * Chart Data - Registration Trend (Line)
   * ------------------- */
  const getRegistrationTrendData = () => {
    if (!providers || providers.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Employee Registrations',
          data: [0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          tension: 0.4
        }]
      };
    }

    // Group registrations by month
    const monthlyCounts = {};
    const now = new Date();
    const monthNames = [];
    
    // Create labels for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthNames.push(monthName);
      monthlyCounts[monthKey] = 0;
    }

    // Count registrations per month
    providers.forEach(provider => {
      if (!provider.created_at) return;
      const regDate = new Date(provider.created_at);
      const monthKey = `${regDate.getFullYear()}-${regDate.getMonth()}`;
      
      if (monthlyCounts.hasOwnProperty(monthKey)) {
        monthlyCounts[monthKey]++;
      }
    });

    // Map counts to the correct order
    const counts = Object.values(monthlyCounts);

    return {
      labels: monthNames,
      datasets: [{
        label: 'Employee Registrations',
        data: counts,
        fill: {
          target: 'origin',
          above: 'rgba(57, 88, 134, 0.1)'
        },
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          return createGradient(ctx, chartArea, [
            { offset: 0, color: 'rgba(57, 88, 134, 0.5)' },
            { offset: 1, color: 'rgba(57, 88, 134, 0)' }
          ]);
        },
        borderColor: colors.primary,
        borderWidth: 3,
        tension: 0.2,
        pointBackgroundColor: colors.primary,
        pointBorderColor: colors.white,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderWidth: 2
      }]
    };
  };

  /** -------------------
   * Chart Data - Status Distribution (Bar)
   * ------------------- */
  const getStatusDistributionData = () => {
    if (!providers || providers.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [0],
          backgroundColor: ['rgba(200, 200, 200, 0.7)'],
          borderColor: ['rgba(200, 200, 200, 1)'],
          borderWidth: 1
        }]
      };
    }

    // Count providers per status
    const statusCounts = providers.reduce((acc, provider) => {
      const status = provider.EmpStatus || 'other';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Format status labels
    const formatStatus = (status) => {
      return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    return {
      labels: Object.keys(statusCounts).map(formatStatus),
      datasets: [{
        label: 'Employees',
        data: Object.values(statusCounts),
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          return createGradient(ctx, chartArea, [
            { offset: 0, color: '#8B5CF6' },
            { offset: 1, color: '#7C3AED' }
          ]);
        },
        borderColor: '#7C3AED',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  /** -------------------
   * Quick Stats (Top Cards)
   * ------------------- */
  const totalEmployees = providers.length || 0;
  const totalDoctors = providers.filter(p => p.userLevel === 'doctor').length || 0;
  const totalNurses = providers.filter(p => p.userLevel === 'nurse').length || 0;
  const totalAdmins = providers.filter(p => p.userLevel === 'admin').length || 0;
  const totalDistributors = providers.filter(p => p.userLevel === 'distributor').length || 0;
  const totalClinicalStaff = totalDoctors + totalNurses;
  
  // Calculate new hires (last 30 days)
  const newHires = providers.filter(p => {
    if (!p.created_at) return false;
    const regDate = new Date(p.created_at);
    return (Date.now() - regDate.getTime()) < (30 * 24 * 60 * 60 * 1000);
  }).length || 0;

  // Calculate month-over-month change for metrics
  const getMonthlyChange = () => {
    if (providers.length === 0) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Count registrations in current month
    const currentMonthCount = providers.filter(p => {
      if (!p.created_at) return false;
      const regDate = new Date(p.created_at);
      return regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear;
    }).length;
    
    // Count registrations in previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthCount = providers.filter(p => {
      if (!p.created_at) return false;
      const regDate = new Date(p.created_at);
      return regDate.getMonth() === prevMonth && regDate.getFullYear() === prevYear;
    }).length;
    
    if (prevMonthCount === 0) return 0;
    return Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100);
  };

  const monthlyChange = getMonthlyChange();

  /** -------------------
   * Tenure Data
   * ------------------- */
  const getTenureData = () => {
    if (!providers || providers.length === 0) {
      return [
        { group: 'New (<30 days)', count: 0, color: '#3B82F6', percentage: 0 },
        { group: 'Recent (1-6 months)', count: 0, color: '#10B981', percentage: 0 },
        { group: 'Established (6-12 months)', count: 0, color: '#F59E0B', percentage: 0 },
        { group: 'Long-term (1+ years)', count: 0, color: '#8B5CF6', percentage: 0 }
      ];
    }

    const tenureGroups = {
      'New (<30 days)': 0,
      'Recent (1-6 months)': 0,
      'Established (6-12 months)': 0,
      'Long-term (1+ years)': 0
    };

    providers.forEach(provider => {
      const group = getTimeSinceRegistration(provider.created_at);
      if (tenureGroups.hasOwnProperty(group)) {
        tenureGroups[group]++;
      }
    });

    return [
      { 
        group: 'New (<30 days)', 
        count: tenureGroups['New (<30 days)'], 
        color: '#3B82F6',
        percentage: Math.round((tenureGroups['New (<30 days)'] / totalEmployees) * 100)
      },
      { 
        group: 'Recent (1-6 months)', 
        count: tenureGroups['Recent (1-6 months)'], 
        color: '#10B981',
        percentage: Math.round((tenureGroups['Recent (1-6 months)'] / totalEmployees) * 100)
      },
      { 
        group: 'Established (6-12 months)', 
        count: tenureGroups['Established (6-12 months)'], 
        color: '#F59E0B',
        percentage: Math.round((tenureGroups['Established (6-12 months)'] / totalEmployees) * 100)
      },
      { 
        group: 'Long-term (1+ years)', 
        count: tenureGroups['Long-term (1+ years)'], 
        color: '#8B5CF6',
        percentage: Math.round((tenureGroups['Long-term (1+ years)'] / totalEmployees) * 100)
      }
    ];
  };

  const tenureData = getTenureData();

  /** -------------------
   * Chart Options
   * ------------------- */
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          usePointStyle: true, 
          color: colors.textPrimary,
          padding: 20,
          font: {
            family: 'inherit',
            size: 12
          }
        } 
      },
      tooltip: {
        backgroundColor: colors.textPrimary,
        titleColor: colors.white,
        bodyColor: colors.white,
        titleFont: {
          family: 'inherit',
          size: 14
        },
        bodyFont: {
          family: 'inherit',
          size: 12
        },
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.textPrimary,
        titleColor: colors.white,
        bodyColor: colors.white,
        titleFont: {
          family: 'inherit'
        },
        bodyFont: {
          family: 'inherit'
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { 
          precision: 0, 
          color: colors.textSecondary,
          font: {
            family: 'inherit'
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: { 
        ticks: { 
          color: colors.textSecondary,
          font: {
            family: 'inherit'
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.textPrimary,
        titleColor: colors.white,
        bodyColor: colors.white,
        titleFont: {
          family: 'inherit'
        },
        bodyFont: {
          family: 'inherit'
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { 
          precision: 0, 
          color: colors.textSecondary,
          font: {
            family: 'inherit'
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: { 
        ticks: { 
          color: colors.textSecondary,
          font: {
            family: 'inherit'
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div style={overlayStyle(colors)}>
      <div style={modalStyle(colors)} ref={modalRef}>
        
        {/* Header */}
        <div style={headerStyle(colors)}>
          <div>
            <h2 style={{ color: colors.textPrimary, margin: 0 }}>Employee Workforce Analytics</h2>
            <p style={{ color: colors.textSecondary, margin: '4px 0 0', fontSize: '14px' }}>
              <FaCalendarAlt style={{ marginRight: '8px' }} />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={generatePDF} style={downloadBtnStyle(colors)}>
              <FaDownload style={{ marginRight: '8px' }} />
              Download PDF
            </button>
            <button onClick={onClose} style={closeBtnStyle(colors)}>
              <FaTimes style={{ fontSize: '18px' }} />
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div style={infoSectionStyle(colors)}>
          <FaInfoCircle style={{ color: colors.primary, fontSize: '20px', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: '600', color: colors.textPrimary, margin: '0 0 8px' }}>
              How to use this dashboard
            </p>
            <ul style={infoListStyle(colors)}>
              <li>Hover over charts to see detailed numbers</li>
              <li>Click legend items to toggle visibility</li>
              <li>Export any chart by right-clicking</li>
              <li>Data updates in real-time</li>
              <li>Download PDF report for sharing</li>
            </ul>
          </div>
        </div>

        {/* Top Metrics */}
        <div style={metricsGridStyle}>
          <MetricCard 
            icon={<FaUserMd style={{ fontSize: '18px' }} />} 
            title="Total Employees" 
            value={totalEmployees} 
            color={colors.primary} 
            trend={monthlyChange > 0 ? "up" : monthlyChange < 0 ? "down" : "neutral"} 
            change={monthlyChange !== 0 ? `${Math.abs(monthlyChange)}% from last month` : "No change"} 
            colors={colors}
          />
          <MetricCard 
            icon={<FaUserNurse style={{ fontSize: '18px' }} />} 
            title="Clinical Staff" 
            value={totalClinicalStaff} 
            color={colors.green} 
            trend={totalClinicalStaff > 0 ? "up" : "neutral"} 
            change={`${totalClinicalStaff} (${Math.round((totalClinicalStaff / totalEmployees) * 100)}% of total)`} 
            colors={colors}
          />
          <MetricCard 
            icon={<FaUserPlus style={{ fontSize: '18px' }} />} 
            title="New Hires" 
            value={newHires} 
            color="#8B5CF6" 
            trend={newHires > 0 ? "up" : "neutral"} 
            change={newHires > 0 ? `${newHires} this month` : "No new hires"} 
            colors={colors}
          />
          <MetricCard 
            icon={<FaUserShield style={{ fontSize: '18px' }} />} 
            title="Admin Staff" 
            value={totalAdmins} 
            color="#a55858" 
            trend="neutral" 
            change={`${totalAdmins} (${Math.round((totalAdmins / totalEmployees) * 100)}% of total)`} 
            colors={colors}
          />
        </div>

        {/* First Row - Two Equal Charts */}
        <div style={firstRowStyle}>
          <ChartCard 
            icon={<FaChartPie />}
            title="Team Composition" 
            subtitle="Breakdown of employees by their roles" 
            badge="ROLES"
            colors={colors}
          >
            <Pie data={getRoleDistributionData()} options={pieOptions} />
          </ChartCard>
          
          <ChartCard 
            icon={<FaChartPie />}
            title="Employment Status" 
            subtitle="Current work status of employees" 
            badge="STATUS"
            colors={colors}
          >
            <Bar data={getStatusDistributionData()} options={barOptions} />
          </ChartCard>
        </div>

        {/* Second Row - Single Wide Chart */}
        <div style={secondRowStyle}>
          <ChartCard 
            icon={<FaChartLine />}
            title="Hiring Over Time" 
            subtitle="Monthly employee onboarding trends" 
            badge="TRENDS"
            colors={colors}
          >
            <Line data={getRegistrationTrendData()} options={lineOptions} />
          </ChartCard>
        </div>

        {/* Third Row - Tenure Overview */}
        <div style={thirdRowStyle}>
          <ChartCard 
            icon={<FaCalendarAlt />}
            title="Employee Tenure" 
            subtitle="How long employees have been with the organization" 
            badge="TENURE"
            colors={colors}
          >
            <div style={tenureContainer}>
              {tenureData.map((item) => (
                <div key={item.group} style={tenureItem}>
                  <div style={tenureLabel(colors)}>{item.group}</div>
                  <div style={tenureBarContainer(colors)}>
                    <div 
                      style={{ 
                        ...tenureBar, 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }} 
                    />
                  </div>
                  <div style={tenureCount(colors)}>
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

/* ---- Styling Functions ---- */
const overlayStyle = (colors) => ({ 
  position: 'fixed', 
  inset: 0, 
  backgroundColor: 'rgba(0,0,0,0.3)', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  zIndex: 1000, 
  backdropFilter: 'blur(4px)',
  padding: '20px'
});

const modalStyle = (colors) => ({ 
  backgroundColor: colors.white, 
  borderRadius: '14px', 
  width: '100%', 
  maxWidth: '1400px', 
  maxHeight: '90vh', 
  overflow: 'auto', 
  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  border: `1px solid ${colors.border}`
});

const headerStyle = (colors) => ({ 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '20px', 
  borderBottom: `1px solid ${colors.border}`, 
  position: 'sticky', 
  top: 0, 
  backgroundColor: colors.white,
  zIndex: 10
});

const closeBtnStyle = (colors) => ({ 
  background: 'rgba(0,0,0,0.05)', 
  border: 'none', 
  borderRadius: '50%', 
  width: '40px', 
  height: '40px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    background: 'rgba(0,0,0,0.1)'
  }
});

const downloadBtnStyle = (colors) => ({
  background: colors.primary,
  color: colors.white,
  border: 'none',
  borderRadius: '6px',
  padding: '10px 15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s',
  ':hover': {
    background: '#2a4269'
  }
});

const infoSectionStyle = (colors) => ({ 
  backgroundColor: 'rgba(57, 88, 134, 0.05)', 
  padding: '16px 20px', 
  margin: '20px', 
  borderRadius: '8px', 
  display: 'flex', 
  gap: '16px', 
  borderLeft: `4px solid ${colors.primary}`,
  alignItems: 'flex-start'
});

const infoListStyle = (colors) => ({ 
  margin: 0, 
  paddingLeft: '20px', 
  fontSize: '14px', 
  color: colors.textSecondary,
  lineHeight: '1.6'
});

const metricsGridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
  gap: '16px', 
  padding: '0 20px 20px'
};

const firstRowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  padding: '0 20px 20px'
};

const secondRowStyle = {
  padding: '0 20px 20px'
};

const thirdRowStyle = {
  padding: '0 20px 20px'
};

/* ---- Tenure Chart Styles ---- */
const tenureContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '10px 0'
};

const tenureItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const tenureLabel = (colors) => ({
  width: '150px',
  fontSize: '12px',
  color: colors.textSecondary
});

const tenureBarContainer = (colors) => ({
  flex: 1,
  height: '8px',
  backgroundColor: colors.lightBg,
  borderRadius: '4px',
  overflow: 'hidden'
});

const tenureBar = {
  height: '100%',
  borderRadius: '4px'
};

const tenureCount = (colors) => ({
  width: '40px',
  textAlign: 'right',
  fontSize: '12px',
  fontWeight: '600',
  color: colors.textPrimary
});

/* ---- Reusable Components ---- */
const MetricCard = ({ icon, title, value, color, trend, change, colors }) => {
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : colors.textSecondary;
  const TrendIcon = trend === 'up' ? FaArrowUp : trend === 'down' ? FaArrowDown : FaMinus;
  
  return (
    <div style={{ 
      backgroundColor: colors.lightBg, 
      padding: '16px', 
      borderRadius: '10px', 
      display: 'flex', 
      flexDirection: 'column',
      gap: '8px',
      borderLeft: `4px solid ${color}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s',
      ':hover': {
        transform: 'translateY(-2px)'
      }
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          backgroundColor: color, 
          color: colors.white, 
          padding: '10px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: colors.textSecondary,
            fontWeight: '500'
          }}>
            {title}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '700', 
            color: colors.textPrimary
          }}>
            {value}
          </p>
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        fontSize: '12px',
        color: trendColor
      }}>
        <TrendIcon size={10} />
        <span style={{ fontWeight: '600' }}>{change}</span>
      </div>
    </div>
  );
};

const ChartCard = ({ icon, title, subtitle, badge, children, colors }) => (
  <div style={{ 
    backgroundColor: colors.white, 
    padding: '20px', 
    borderRadius: '12px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`,
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }
  }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <div style={{ color: colors.primary }}>{icon}</div>}
          <h3 style={{ 
            margin: 0, 
            color: colors.textPrimary,
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {title}
          </h3>
        </div>
        <p style={{ 
          margin: '4px 0 0', 
          fontSize: '13px', 
          color: colors.textSecondary 
        }}>
          {subtitle}
        </p>
      </div>
      <div style={{ 
        backgroundColor: 'rgba(57, 88, 134, 0.1)', 
        color: colors.primary, 
        padding: '4px 10px', 
        borderRadius: '20px', 
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {badge}
      </div>
    </div>
    <div style={{ height: '280px' }}>{children}</div>
  </div>
);

export default EmployeeListAnalyticsModal;