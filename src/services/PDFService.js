// src/services/PDFService.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Professional Color Scheme
const COLORS = {
  primary: '#2c3e50',
  secondary: '#3498db',
  accent: '#2980b9',
  lightGray: '#f8f9fa',
  tableHeader: '#e9ecef',
  tableRow: '#ffffff',
  darkGray: '#495057',
  alert: '#e74c3c',
  success: '#27ae60',
  warning: '#f39c12',
  highlight: '#f8f9fa',
  border: '#dee2e6',
  headerBg: '#2c3e50',
  headerText: '#ffffff'
};

// Medical Term Definitions
const MEDICAL_TERMS = {
  UF: "Ultrafiltration - The process of fluid removal during dialysis",
  PD: "Peritoneal Dialysis - A type of dialysis that uses the lining of the abdomen to filter blood",
  CAPD: "Continuous Ambulatory Peritoneal Dialysis - A form of PD done manually throughout the day",
  VolumeIn: "The amount of dialysis fluid introduced into the body",
  VolumeOut: "The amount of fluid drained from the body after dialysis",
  NetBalance: "The difference between Volume In and Volume Out (positive means fluid retention)"
};

// CAPD Information
const CAPD_INFO = {
  reminders: [
    'CAPD is typically performed 4-5 times daily (every 4-6 hours)',
    'Always perform hand hygiene before any exchange procedure',
    'Check dialysis solution for clarity before use (should be clear)',
    'Warm the solution to body temperature before infusion',
    'Monitor for signs of peritonitis: cloudy effluent, abdominal pain, fever',
    'Maintain sterile technique during connection procedures',
    'Record all exchanges including volume in/out and any problems',
    'Monitor blood pressure and weight daily',
    'Report any significant changes in ultrafiltration volume'
  ],
  tips: [
    'Store dialysis solutions at room temperature in a clean, dry place',
    'Rotate infusion sites to prevent scarring of the peritoneal membrane',
    'Use a mask during exchanges to minimize infection risk',
    'Keep emergency contact numbers readily available',
    'Maintain a consistent schedule for exchanges',
    'Monitor glucose levels as dialysis solution contains dextrose',
    'Increase protein intake as PD can remove proteins from the body',
    'Perform exit site care daily with antibacterial soap',
    'Avoid constipation as it can affect dialysis effectiveness',
    'Carry a PD identification card when traveling'
  ],
  warnings: [
    'Cloudy dialysis fluid may indicate infection',
    'Severe abdominal pain requires immediate attention',
    'Blood in dialysis fluid is a medical emergency',
    'Sudden decrease in ultrafiltration volume needs evaluation'
  ]
};

export const generatePatientPDF = async (patientData) => {
  // Legal size paper (8.5 x 13 inches or 216 x 330 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [216, 330]
  });

  // Document Constants
  const MARGIN = 15;
  const PAGE_WIDTH = 216;
  const PAGE_HEIGHT = 330;
  const LINE_HEIGHT = 6;
  const TABLE_WIDTH = PAGE_WIDTH - (MARGIN * 2);
  let yPos = 25;

  // Generation date for footer
  const generationDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 1. Report Header
  doc.setFillColor(COLORS.headerBg)
     .rect(0, 0, PAGE_WIDTH, 40, 'F');
  
  doc.setFontSize(16)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.headerText)
    .text('PATIENT DIALYSIS', PAGE_WIDTH/2, 15, { align: 'center' })
    .text('TREATMENT REPORT', PAGE_WIDTH/2, 25, { align: 'center' });

  doc.setFontSize(10)
    .setTextColor(COLORS.lightGray)
    .text('COMPREHENSIVE CLINICAL ANALYSIS', PAGE_WIDTH/2, 32, { align: 'center' });

  // Header separator
  yPos = 45;
  doc.setDrawColor(COLORS.secondary)
    .setLineWidth(0.8)
    .line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
  yPos += 15;

  // 2. Patient Information Section
  doc.setFillColor(COLORS.lightGray)
     .rect(MARGIN, yPos - 5, TABLE_WIDTH, 30, 'F');
  
  doc.setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.primary)
    .text('PATIENT INFORMATION', MARGIN + 10, yPos);
  
  // Patient Info
  yPos += 8;
  doc.setFontSize(10)
    .setTextColor(COLORS.darkGray)
    .setFont('helvetica', 'bold')
    .text('Name:', MARGIN + 10, yPos)
    .setFont('helvetica', 'normal')
    .text(patientData.name || 'N/A', MARGIN + 25, yPos)
    .setFont('helvetica', 'bold')
    .text('Hospital ID:', MARGIN + 100, yPos)
    .setFont('helvetica', 'normal')
    .text(patientData.hospitalNumber || 'N/A', MARGIN + 135, yPos);

  yPos += LINE_HEIGHT;
  doc.setFont('helvetica', 'bold')
    .text('Age:', MARGIN + 10, yPos)
    .setFont('helvetica', 'normal')
    .text(calculateAge(patientData.date_of_birth), MARGIN + 25, yPos)
    .setFont('helvetica', 'bold')
    .text('Gender:', MARGIN + 100, yPos)
    .setFont('helvetica', 'normal')
    .text(patientData.gender || 'N/A', MARGIN + 135, yPos);

  yPos += LINE_HEIGHT;
  doc.setFont('helvetica', 'bold')
    .text('Dialysis Type:', MARGIN + 10, yPos)
    .setFont('helvetica', 'normal')
    .text(patientData.dialysisType || 'Peritoneal Dialysis (PD)', MARGIN + 35, yPos);

  yPos += 25;

  // 3. CAPD Reminders Section
  doc.setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.primary)
    .text('CAPD ESSENTIAL REMINDERS', MARGIN, yPos);
  
  doc.setDrawColor(COLORS.secondary)
    .setLineWidth(0.3)
    .line(MARGIN, yPos + 2, MARGIN + 80, yPos + 2);
  
  yPos += 10;

  doc.setFontSize(9)
    .setTextColor(COLORS.darkGray)
    .setFont('helvetica', 'normal');

  CAPD_INFO.reminders.forEach((reminder, index) => {
    const lines = doc.splitTextToSize(`• ${reminder}`, TABLE_WIDTH - 10);
    doc.text(lines, MARGIN + 5, yPos);
    yPos += (lines.length * LINE_HEIGHT);
    
    if (index < CAPD_INFO.reminders.length - 1) {
      yPos += 3;
    }
  });

  yPos += 15;

  // 4. Clinical Summary Section
  doc.setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.primary)
    .text('CLINICAL SUMMARY', MARGIN, yPos);
  
  doc.setDrawColor(COLORS.secondary)
    .setLineWidth(0.3)
    .line(MARGIN, yPos + 2, MARGIN + 60, yPos + 2);
  
  yPos += 10;

  const { dailyData, totalBalance } = calculateDailyBalances(patientData.treatments);
  const retentionDays = dailyData.filter(d => d.netBalance > 0).length;
  const retentionPercentage = Math.round(retentionDays/dailyData.length*100);
  const avgDailyUF = Math.round(totalBalance.value / dailyData.length);

  autoTable(doc, {
    startY: yPos,
    head: [[
      { content: 'Parameter', styles: { halign: 'left' }},
      { content: 'Value', styles: { halign: 'center' }},
      { content: 'Clinical Interpretation', styles: { halign: 'left' }}
    ]],
    body: [
      [
        { content: 'Treatment Days', styles: { fontStyle: 'bold' }},
        { content: dailyData.length.toString(), styles: { halign: 'center' }},
        getClinicalInterpretation('frequency', dailyData.length)
      ],
      [
        { content: 'Fluid Retention Days', styles: { fontStyle: 'bold' }},
        { content: `${retentionDays} (${retentionPercentage}%)`, styles: { halign: 'center' }},
        getClinicalInterpretation('retention', retentionDays/dailyData.length)
      ],
      [
        { content: 'Net Fluid Balance', styles: { fontStyle: 'bold' }},
        { content: totalBalance.formatted, styles: { 
          halign: 'center',
          textColor: totalBalance.value > 0 ? COLORS.alert : COLORS.success,
          fontStyle: 'bold'
        }},
        getClinicalInterpretation('balance', totalBalance.value)
      ],
      [
        { content: 'Avg Daily UF', styles: { fontStyle: 'bold' }},
        { content: `${avgDailyUF} mL`, styles: { halign: 'center' }},
        getClinicalInterpretation('avgUF', avgDailyUF)
      ]
    ],
    tableWidth: TABLE_WIDTH,
    margin: { left: MARGIN, right: MARGIN },
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.primary,
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: { top: 5, right: 2, bottom: 5, left: 5 }
    },
    bodyStyles: {
      textColor: COLORS.darkGray,
      fontSize: 9,
      cellPadding: { top: 4, right: 2, bottom: 4, left: 5 },
      lineWidth: 0.1,
      lineColor: COLORS.border
    },
    columnStyles: {
      0: { cellWidth: 45, halign: 'left' },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: TABLE_WIDTH - 85, halign: 'left' }
    },
    styles: {
      overflow: 'linebreak',
      minCellHeight: 8
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.row.index % 2 === 0) {
        doc.setFillColor(COLORS.highlight)
           .rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // 5. Treatment Details Section
  if (yPos > PAGE_HEIGHT - 150) {
    doc.addPage([216, 330]);
    yPos = 25;
  }

  doc.setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.primary)
    .text('TREATMENT DETAILS', MARGIN, yPos);
  
  doc.setDrawColor(COLORS.secondary)
    .setLineWidth(0.3)
    .line(MARGIN, yPos + 2, MARGIN + 70, yPos + 2);
  
  yPos += 10;

  const treatmentData = [];
  dailyData.forEach((day) => {
    // Date header row
    treatmentData.push([
      { 
        content: day.formattedDate, 
        colSpan: 4,
        styles: { 
          fillColor: COLORS.primary,
          textColor: COLORS.headerText,
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: { top: 3, right: 0, bottom: 3, left: 5 }
        }
      }
    ]);

    // Treatment rows
    day.treatments.forEach(t => {
      treatmentData.push([
        { content: `${t.VolumeIn || 0} mL`, styles: { halign: 'center' }},
        { content: `${t.VolumeOut || 0} mL`, styles: { halign: 'center' }},
        { 
          content: t.formattedBalance, 
          styles: { 
            textColor: t.balance > 0 ? COLORS.alert : COLORS.success,
            fontStyle: 'bold',
            halign: 'center'
          }
        },
        { content: t.TreatmentStatus || 'Recorded', styles: { halign: 'center' }}
      ]);
    });

    // Day summary row
    treatmentData.push([
      { 
        content: 'Daily Total:', 
        styles: { 
          fontStyle: 'bold',
          fillColor: COLORS.lightGray,
          cellPadding: { left: 5 }
        }
      },
      { 
        content: `${day.volumeIn} mL in`, 
        styles: { 
          halign: 'center',
          fillColor: COLORS.lightGray
        }
      },
      { 
        content: `${day.volumeOut} mL out`, 
        styles: { 
          halign: 'center',
          fillColor: COLORS.lightGray
        }
      },
      { 
        content: day.netBalance > 0 ? `+${day.netBalance} mL` : `${day.netBalance} mL`,
        styles: { 
          textColor: day.netBalance > 0 ? COLORS.alert : COLORS.success,
          fontStyle: 'bold',
          halign: 'center',
          fillColor: COLORS.lightGray
        }
      }
    ]);

    // Separator row
    treatmentData.push([
      { 
        content: '', 
        colSpan: 4,
        styles: { 
          cellHeight: 2,
          lineWidth: 0
        }
      }
    ]);
  });

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        { content: 'Volume In', styles: { halign: 'center' }}, 
        { content: 'Volume Out', styles: { halign: 'center' }}, 
        { content: 'Net UF', styles: { halign: 'center' }}, 
        { content: 'Status', styles: { halign: 'center' }}
      ]
    ],
    body: treatmentData,
    tableWidth: TABLE_WIDTH,
    margin: { left: MARGIN, right: MARGIN },
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.primary,
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: { top: 5, right: 0, bottom: 5, left: 0 }
    },
    bodyStyles: {
      textColor: COLORS.darkGray,
      fontSize: 8,
      cellPadding: { top: 3, right: 0, bottom: 3, left: 0 },
      lineWidth: 0.1,
      lineColor: COLORS.border
    },
    columnStyles: {
      0: { cellWidth: 50, halign: 'center' },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 50, halign: 'center' }
    },
    styles: {
      overflow: 'linebreak',
      minCellHeight: 6
    },
    pageBreak: 'avoid',
    didDrawCell: (data) => {
      if (data.section === 'body' && data.row.index % 2 === 0) {
        doc.setFillColor(COLORS.highlight)
           .rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // 6. Clinical Notes & CAPD Tips Section
  if (yPos > PAGE_HEIGHT - 100) {
    doc.addPage([216, 330]);
    yPos = 25;
  }

  // Clinical Notes Section
  doc.setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.primary)
    .text('CLINICAL INTERPRETATION', MARGIN, yPos);
  
  doc.setDrawColor(COLORS.secondary)
    .setLineWidth(0.3)
    .line(MARGIN, yPos + 2, MARGIN + 90, yPos + 2);
  
  yPos += 10;

  const notes = [
    `Fluid balance is calculated as: Volume In - Volume Out`,
    `UF (Ultrafiltration): ${MEDICAL_TERMS.UF}`,
    'Positive values (+) indicate fluid retention (requires clinical attention)',
    'Negative values (-) indicate proper fluid removal',
    `Current treatment frequency: ${treatmentFrequency(dailyData.length)}`,
    `Patient shows ${retentionDays} days (${retentionPercentage}%) of fluid retention in last ${dailyData.length} treatments`,
    'Expected effluent color: Clear to pale yellow (amber)',
    'Cloudy effluent may indicate infection (requires culture)',
    'Bloody effluent requires immediate medical evaluation'
  ];

  doc.setFontSize(9)
    .setTextColor(COLORS.darkGray);

  notes.forEach(note => {
    const lines = doc.splitTextToSize(`• ${note}`, TABLE_WIDTH - 10);
    doc.text(lines, MARGIN + 5, yPos);
    yPos += (lines.length * LINE_HEIGHT) + 2;
  });

  yPos += 10;

  // CAPD Warnings Section
  doc.setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.alert)
    .text('CRITICAL WARNINGS', MARGIN, yPos);
  
  doc.setDrawColor(COLORS.alert)
    .setLineWidth(0.3)
    .line(MARGIN, yPos + 2, MARGIN + 70, yPos + 2);
  
  yPos += 10;

  doc.setFontSize(9)
    .setTextColor(COLORS.darkGray);

  CAPD_INFO.warnings.forEach(warning => {
    const lines = doc.splitTextToSize(`• ${warning}`, TABLE_WIDTH - 10);
    doc.setFont('helvetica', 'bold')
       .text(lines, MARGIN + 5, yPos);
    yPos += (lines.length * LINE_HEIGHT) + 3;
  });

  yPos += 10;

  // CAPD Tips Section
  doc.setFontSize(12)
    .setFont('helvetica', 'bold')
    .setTextColor(COLORS.primary)
    .text('PATIENT SELF-CARE TIPS', MARGIN, yPos);
  
  doc.setDrawColor(COLORS.secondary)
    .setLineWidth(0.3)
    .line(MARGIN, yPos + 2, MARGIN + 85, yPos + 2);
  
  yPos += 10;

  doc.setFontSize(9)
    .setTextColor(COLORS.darkGray)
    .setFont('helvetica', 'normal');

  CAPD_INFO.tips.forEach((tip, index) => {
    const lines = doc.splitTextToSize(`• ${tip}`, TABLE_WIDTH - 10);
    doc.text(lines, MARGIN + 5, yPos);
    yPos += (lines.length * LINE_HEIGHT);
    
    if (index < CAPD_INFO.tips.length - 1) {
      yPos += 3;
    }
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(COLORS.border)
       .setLineWidth(0.5)
       .line(MARGIN, PAGE_HEIGHT - 20, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 20);
    
    // Footer text
    doc.setFontSize(8)
      .setTextColor(COLORS.darkGray)
      .text(`Generated: ${generationDate}`, MARGIN, PAGE_HEIGHT - 15)
      .text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15, { align: 'right' })
      .setFont('helvetica', 'bold')
      .setTextColor(COLORS.primary)
      .text('CONFIDENTIAL MEDICAL DOCUMENT', PAGE_WIDTH/2, PAGE_HEIGHT - 15, { align: 'center' });
  }

  return doc.output('blob');
};

// Helper Functions
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age + ' years';
}

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function calculateDailyBalances(treatments) {
  const dailyData = {};
  
  treatments.forEach(t => {
    const date = new Date(t.treatmentDate).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        formattedDate: formatDate(date),
        treatments: [],
        volumeIn: 0,
        volumeOut: 0,
        netBalance: 0
      };
    }
    
    const balance = (t.VolumeIn || 0) - (t.VolumeOut || 0);
    dailyData[date].treatments.push({
      ...t,
      balance,
      formattedBalance: balance > 0 ? `+${balance} mL` : `${balance} mL`
    });
    
    dailyData[date].volumeIn += t.VolumeIn || 0;
    dailyData[date].volumeOut += t.VolumeOut || 0;
    dailyData[date].netBalance += balance;
  });

  const totalBalance = Object.values(dailyData).reduce((sum, day) => sum + day.netBalance, 0);

  return {
    dailyData: Object.values(dailyData).sort((a, b) => new Date(b.date) - new Date(a.date)),
    totalBalance: {
      value: totalBalance,
      formatted: totalBalance > 0 ? `+${totalBalance} mL` : `${totalBalance} mL`
    }
  };
}

function getClinicalInterpretation(type, value) {
  switch(type) {
    case 'frequency':
      if (value >= 6) return 'Ideal treatment frequency (6-7 times/week)';
      if (value >= 4) return 'Standard treatment frequency (4-5 times/week)';
      return 'Below recommended frequency (1-3 times/week)';
    
    case 'retention':
      if (value > 0.5) return 'Poor control - frequent fluid retention\nConsider adjusting prescription or diet';
      if (value > 0.2) return 'Moderate control - some retention\nMonitor closely';
      return 'Good control - adequate fluid removal';
    
    case 'balance':
      if (value > 500) return 'Critical - significant fluid retention\nImmediate review required';
      if (value > 0) return 'Warning - fluid retention present\nEvaluate prescription';
      return 'Normal - proper fluid removal';
    
    case 'avgUF':
      if (value < -2000) return 'Caution - excessive fluid removal\nRisk of hypotension';
      if (value < -1000) return 'Adequate fluid removal\nWithin expected range';
      if (value > 0) return 'Warning - average fluid retention\nReview treatment parameters';
      return 'Normal fluid removal range';
    
    default:
      return 'No interpretation available';
  }
}

function treatmentFrequency(days) {
  const weeks = days / 7;
  if (weeks > 5) return 'Intensive (6-7 treatments/week) - Good frequency';
  if (weeks > 3) return 'Standard (4-5 treatments/week) - Adequate';
  return 'Minimal (1-3 treatments/week) - Consider increasing frequency';
}