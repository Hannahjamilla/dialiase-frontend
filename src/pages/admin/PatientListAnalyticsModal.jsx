import React, { useRef } from 'react';
import { FaTimes, FaInfoCircle, FaUserFriends, FaChild, FaUser, FaUserTie, FaDownload } from 'react-icons/fa';
import { Pie, Line } from 'react-chartjs-2';
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

const PatientListAnalyticsModal = ({ patients, onClose }) => {
  const modalRef = useRef();
  
  /** -------------------
   * Helper Functions
   * ------------------- */
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getAgeGroup = (patient) => {
    const age = calculateAge(patient.date_of_birth);
    if (age === null) return 'Unknown';
    if (age < 18) return 'Minor (<18)';
    if (age >= 18 && age < 65) return 'Adult (18-64)';
    return 'Senior (65+)';
  };

  const createGradient = (colors) => {
    const ctx = document.createElement('canvas').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
  };

  /** -------------------
   * PDF Generation
   * ------------------- */
const generatePDF = () => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // Set font styles
  doc.setFont("helvetica");
  
  // Header with organization name
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("HEALTHCARE ANALYTICS DIVISION", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Patient Demographic Analysis Report", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 6;
  doc.setFontSize(10);
  doc.text(`Generated on: ${date}`, pageWidth / 2, yPos, { align: "center" });
  
  // Add horizontal line
  yPos += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 15;
  
  // Report Overview
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(40, 40, 40);
  doc.text("REPORT OVERVIEW", margin, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  const overviewText = `This report provides a comprehensive analysis of patient demographic data for the healthcare system. 
It includes detailed breakdowns of age distribution and registration trends over the past 12 months. 
The analysis covers ${total} patients and is designed to support strategic planning and resource allocation decisions.`;
  
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
    { label: "Total Patients", value: total },
    { label: "Minors (<18 years)", value: minors, percentage: Math.round((minors/total)*100) },
    { label: "Adults (18-64 years)", value: adults, percentage: Math.round((adults/total)*100) },
    { label: "Seniors (65+ years)", value: seniors, percentage: Math.round((seniors/total)*100) },
    { label: "Unknown Age", value: unknown, percentage: Math.round((unknown/total)*100) }
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
  
  // Age Distribution Analysis
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("AGE DISTRIBUTION ANALYSIS", margin, yPos);
  yPos += 8;
  
  const ageData = getAgeDistributionData();
  
  // Detailed age distribution table
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, contentWidth, 10, "F");
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text("Age Group", margin + 5, yPos + 6.5);
  doc.text("Percentage", margin + contentWidth - 40, yPos + 6.5);
  // doc.text("Percentage", margin + contentWidth - 10, yPos + 6.5, { align: "right" });
  
  yPos += 10;
  
  ageData.labels.forEach((label, index) => {
    const count = ageData.datasets[0].data[index];
    const percentage = Math.round((count / total) * 100);
    
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
  if (yPos > 210) {
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
    `The patient population consists of ${total} individuals, with adults (18-64 years) representing the largest demographic group at ${Math.round((adults/total)*100)}%.`,
    `Minors account for ${Math.round((minors/total)*100)}% of patients, while seniors comprise ${Math.round((seniors/total)*100)}% of the total.`,
    `Registration trends show a peak of ${maxRegistrations} new patients in ${peakMonth}, compared to a low of ${minRegistrations} registrations in ${lowMonth}.`,
    `The average monthly registration rate is ${Math.round(registrations.reduce((a, b) => a + b, 0) / 12)} patients per month.`,
    `This demographic analysis can inform strategic planning, resource allocation, and targeted healthcare initiatives for different patient groups.`
  ];
  
  analysisText.forEach(text => {
    const splitText = doc.splitTextToSize(text, contentWidth);
    doc.text(splitText, margin, yPos);
    yPos += (splitText.length * 5) + 4;
  });
  
  yPos += 10;
  
  // Data Quality Note
  if (unknown > 0) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont(undefined, "italic");
    doc.text(`* Note: ${unknown} patient records (${Math.round((unknown/total)*100)}%) are missing date of birth information, which may affect age distribution accuracy.`, margin, yPos);
    yPos += 8;
  }
  
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
  doc.save(`patient-demographics-report-${date.replace(/\//g, '-')}.pdf`);
};

  /** -------------------
   * Chart Data - Age Distribution (Pie)
   * ------------------- */
  const getAgeDistributionData = () => {
    if (!patients || patients.length === 0) {
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

    const counts = patients.reduce((acc, patient) => {
      const group = getAgeGroup(patient);
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});

    const colors = {
      'Minor (<18)': createGradient(['#6EE7B7', '#3B82F6']),
      'Adult (18-64)': createGradient(['#FCD34D', '#F59E0B']),
      'Senior (65+)': createGradient(['#F9A8D4', '#EC4899']),
      'Unknown': createGradient(['#D1D5DB', '#9CA3AF'])
    };

    return {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: Object.keys(counts).map(group => colors[group]),
        borderColor: '#fff',
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
    if (!patients || patients.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Patient Registrations',
          data: [0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          tension: 0.4
        }]
      };
    }

    const now = new Date();
    const monthNames = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return date.toLocaleString('default', { month: 'short' });
    });

    const monthlyCounts = patients.reduce((acc, patient) => {
      if (!patient.created_at) return acc;
      const month = new Date(patient.created_at).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const counts = monthNames.map(month => monthlyCounts[month] || 0);

    return {
      labels: monthNames,
      datasets: [{
        label: 'Patient Registrations',
        data: counts,
        fill: { target: 'origin', above: 'rgba(99, 102, 241, 0.15)' },
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: '#6366F1',
        borderWidth: 3,
        tension: 0.2,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderWidth: 2
      }]
    };
  };

  /** -------------------
   * Quick Stats
   * ------------------- */
  const total = patients?.length || 0;
  const minors = patients?.filter(p => calculateAge(p.date_of_birth) < 18).length || 0;
  const adults = patients?.filter(p => {
    const age = calculateAge(p.date_of_birth);
    return age >= 18 && age < 65;
  }).length || 0;
  const seniors = patients?.filter(p => calculateAge(p.date_of_birth) >= 65).length || 0;
  const unknown = patients?.filter(p => !p.date_of_birth || calculateAge(p.date_of_birth) === null).length || 0;

  /** -------------------
   * JSX Output
   * ------------------- */
  return (
    <div style={overlayStyle}>
      <div style={modalStyle} ref={modalRef}>
        
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{ margin: 0, color: '#1E293B' }}>Patient Demographic Overview</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Age distribution & registration trends</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={generatePDF} style={downloadBtnStyle}>
              <FaDownload style={{ marginRight: '8px' }} />
              Download PDF
            </button>
            <button onClick={onClose} style={closeBtnStyle}><FaTimes /></button>
          </div>
        </div>

        {/* Key Insights */}
        <div style={infoSectionStyle}>
          <FaInfoCircle style={{ color: '#6366F1', fontSize: '20px', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 5px', color: '#1E293B' }}>Key Insights</h4>
            <ul style={infoListStyle}>
              <li>Interactive charts</li>
              <li>Color-coded age groups</li>
              <li>12-month registration trend</li>
              <li>Missing data highlighted</li>
              <li>Download PDF report</li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div style={metricsGridStyle}>
          <MetricCard icon={<FaUserFriends />} title="Total Patients" value={total} color="#6366F1" />
          <MetricCard icon={<FaChild />} title="Minors (<18)" value={minors} color="#3B82F6" />
          <MetricCard icon={<FaUser />} title="Adults (18-64)" value={adults} color="#F59E0B" />
          <MetricCard icon={<FaUserTie />} title="Seniors (65+)" value={seniors} color="#EC4899" />
        </div>

        {/* Charts */}
        <div style={chartsGridStyle}>
          <ChartCard title="Age Distribution" subtitle="Patients grouped by age" badge="AGE DATA">
            <Pie data={getAgeDistributionData()} options={pieOptions} />
            {unknown > 0 && <div style={dataGapStyle}><strong>Note:</strong> {unknown} patient(s) missing DOB info.</div>}
          </ChartCard>
          <ChartCard title="Registration Trend" subtitle="Monthly new patients" badge="TRENDS">
            <Line data={getRegistrationTrendData()} options={lineOptions} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

/* ---- Styles ---- */
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' };
const modalStyle = { backgroundColor: '#fff', borderRadius: '14px', width: '95%', maxWidth: '1400px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 12px 35px rgba(0,0,0,0.15)' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 5 };
const closeBtnStyle = { background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#374151' };
const downloadBtnStyle = { background: '#6366F1', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const infoSectionStyle = { backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: '15px 20px', margin: '20px', borderRadius: '8px', display: 'flex', gap: '12px', borderLeft: '4px solid #6366F1' };
const infoListStyle = { margin: 0, paddingLeft: '18px', fontSize: '14px', color: '#475569', lineHeight: '1.5' };
const metricsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', padding: '0 20px 20px' };
const chartsGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '0 20px 20px' };
const dataGapStyle = { marginTop: '15px', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', borderLeft: '3px solid #EF4444', color: '#B91C1C', fontSize: '13px' };

/* ---- Chart Options ---- */
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, color: '#1E293B' } },
    tooltip: {
      backgroundColor: '#1E293B',
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} patients (${percentage}%)`;
        }
      }
    }
  }
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0, color: '#475569' } },
    x: { ticks: { color: '#475569' } }
  }
};

/* ---- Reusable Components ---- */
const MetricCard = ({ icon, title, value, color }) => (
  <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ backgroundColor: color, color: '#fff', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{icon}</div>
    <div>
      <h3 style={{ margin: 0, fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1E293B' }}>{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, badge, children }) => (
  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ margin: 0, color: '#1E293B' }}>{title}</h3>
      <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#4F46E5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>{badge}</div>
    </div>
    <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{subtitle}</p>
    <div style={{ height: '300px', marginTop: '15px' }}>{children}</div>
  </div>
);

export default PatientListAnalyticsModal;