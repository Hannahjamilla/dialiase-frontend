// PatientTreatmentUtils.jsx
// Utility functions for Patient Treatment Modal

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return { years: 'N/A', isAdult: null };
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    years--;
  }
  
  return {
    years,
    isAdult: years >= 18,
    classification: years >= 18 ? 'Adult' : 'Pediatric'
  };
};

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format date and time to readable string
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format time only to readable string
export const formatTimeOnly = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate daily fluid balances from treatments
export const calculateDailyBalances = (treatments) => {
  if (!treatments || treatments.length === 0) {
    return { dailyData: [], totalBalance: { value: 0, formatted: '0mL', isPositive: false } };
  }
  
  const dailyData = {};
  
  treatments.forEach(treatment => {
    try {
      const date = new Date(treatment.treatmentDate).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          formattedDate: formatDate(date),
          treatments: [],
          volumeIn: 0,
          volumeOut: 0,
          netBalance: 0
        };
      }
      
      const volumeIn = treatment.VolumeIn || 0;
      const volumeOut = treatment.VolumeOut || 0;
      const balance = volumeIn - volumeOut;
      
      dailyData[date].treatments.push({
        ...treatment,
        balance: balance,
        formattedBalance: balance > 0 ? `+${balance}mL` : `${balance}mL`,
        interpretation: balance > 0 ? 'Fluid retention' : 'Good fluid removal'
      });
      
      dailyData[date].volumeIn += volumeIn;
      dailyData[date].volumeOut += volumeOut;
      dailyData[date].netBalance += balance;
    } catch (e) {
      console.error('Error processing treatment:', treatment, e);
    }
  });
  
  let totalBalance = 0;
  Object.values(dailyData).forEach(day => {
    totalBalance += day.netBalance;
  });
  
  // Add interpretation to each day
  const dailyDataWithInterpretation = Object.values(dailyData).map(day => {
    let interpretation = '';
    let status = 'neutral';
    
    if (day.netBalance > 1000) {
      interpretation = 'Significant fluid retention';
      status = 'danger';
    } else if (day.netBalance > 0) {
      interpretation = 'Mild fluid retention';
      status = 'warning';
    } else if (day.netBalance < -1000) {
      interpretation = 'Significant fluid removal';
      status = 'success';
    } else if (day.netBalance < 0) {
      interpretation = 'Adequate fluid removal';
      status = 'success';
    } else {
      interpretation = 'Neutral balance';
    }
    
    return {
      ...day,
      interpretation,
      status
    };
  });
  
  return {
    dailyData: dailyDataWithInterpretation.sort((a, b) => new Date(b.date) - new Date(a.date)),
    totalBalance: {
      value: totalBalance,
      formatted: totalBalance > 0 ? `+${totalBalance}mL` : `${totalBalance}mL`,
      isPositive: totalBalance > 0,
      interpretation: totalBalance > 0 ? 
        `Net fluid retention of ${totalBalance}mL. Consider adjusting prescription.` : 
        `Net fluid removal of ${Math.abs(totalBalance)}mL. Good fluid management.`
    }
  };
};

// Get status color based on treatment status
export const getStatusColor = (status) => {
  if (!status) return '#6c757d';
  
  switch(status.toLowerCase()) {
    case 'finished': 
    case 'completed': 
      return '#28a745';
    case 'ongoing': 
    case 'in progress': 
      return '#ffc107';
    case 'scheduled': 
      return '#395886';
    case 'cancelled': 
      return '#dc3545';
    default: 
      return '#6c757d';
  }
};

// Get color class based on effluent color
export const getColorClass = (color) => {
  if (!color) return '';
  color = color.toLowerCase();
  
  if (color === 'clear' || color === 'straw') return 'color-clear';
  if (color === 'yellow' || color === 'amber' || color === 'pale yellow') return 'color-normal';
  if (color.includes('cloudy') || color.includes('turbid') || color.includes('milky')) return 'color-infected';
  if (color.includes('pink') || color.includes('red') || color.includes('blood')) return 'color-bloody';
  return 'color-abnormal';
};

// Analyze treatments for clinical insights
export const analyzeTreatments = (data) => {
  if (!data || !data.treatments || data.treatments.length === 0) return [];
  
  const newInsights = [];
  const { dailyData, totalBalance } = calculateDailyBalances(data.treatments);
  
  // Check for consistent fluid retention
  const retentionDays = dailyData.filter(day => day.netBalance > 0).length;
  const retentionPercentage = (retentionDays / dailyData.length) * 100;
  
  if (retentionPercentage > 50) {
    newInsights.push({
      type: 'warning',
      title: 'Fluid Retention Pattern',
      message: `Positive fluid balance on ${Math.round(retentionPercentage)}% of days.`,
      suggestion: 'Evaluate need for icodextrin or stronger glucose solutions.'
    });
  }
  
  // Check for significant fluid overload
  if (totalBalance.value > 2000) {
    newInsights.push({
      type: 'danger',
      title: 'Fluid Overload',
      message: `Accumulated ${totalBalance.value}mL excess fluid.`,
      suggestion: 'Consider fluid restriction and review medications.'
    });
  }
  
  // Check for consistent negative balance (dehydration risk)
  const negativeBalanceDays = dailyData.filter(day => day.netBalance < -1000).length;
  if (negativeBalanceDays > 2) {
    newInsights.push({
      type: 'warning',
      title: 'Dehydration Risk',
      message: `Significant negative balance on ${negativeBalanceDays} days.`,
      suggestion: 'Assess for hypotension, cramps, or fatigue.'
    });
  }
  
  // Check treatment adherence
  const completedTreatments = data.treatments.filter(t => 
    t.TreatmentStatus && t.TreatmentStatus.toLowerCase() === 'completed'
  ).length;
  
  const adherenceRate = (completedTreatments / data.treatments.length) * 100;
  
  if (adherenceRate < 85) {
    newInsights.push({
      type: 'danger',
      title: 'Adherence Concern',
      message: `Only ${Math.round(adherenceRate)}% of treatments completed.`,
      suggestion: 'Discuss barriers to adherence.'
    });
  }
  
  // Check for peritonitis risk factors
  const cloudyEffluentDays = data.treatments.filter(t => 
    t.Color && (t.Color.toLowerCase().includes('cloudy') || t.Color.toLowerCase().includes('turbid'))
  ).length;
  
  if (cloudyEffluentDays > 0) {
    newInsights.push({
      type: 'danger',
      title: 'Possible Infection',
      message: `Cloudy effluent reported on ${cloudyEffluentDays} occasions.`,
      suggestion: 'Review for other peritonitis symptoms.'
    });
  }
  
  // Check glucose exposure patterns for metabolic concerns
  const highGlucoseExchanges = data.treatments.filter(t => 
    t.Dialysate && typeof t.Dialysate === 'string' && (t.Dialysate.includes('2.5%') || t.Dialysate.includes('3.86%') || t.Dialysate.includes('4.25%'))
  ).length;
  
  const glucoseExposurePercentage = (highGlucoseExchanges / data.treatments.length) * 100;
  
  if (glucoseExposurePercentage > 60) {
    newInsights.push({
      type: 'warning',
      title: 'High Glucose Exposure',
      message: `High glucose solutions in ${Math.round(glucoseExposurePercentage)}% of exchanges.`,
      suggestion: 'Monitor HbA1c and lipids.'
    });
  }
  
  // Check for adequacy concerns if treatment data includes KT/V or creatinine clearance
  if (data.labResults) {
    const lastKtV = data.labResults.ktv && data.labResults.ktv[data.labResults.ktv.length - 1];
    if (lastKtV && lastKtV.value < 1.7) {
      newInsights.push({
        type: 'warning',
        title: 'Adequacy Below Target',
        message: `Most recent Kt/V is ${lastKtV.value} (target ≥1.7).`,
        suggestion: 'Consider increasing exchange frequency or volume.'
      });
    }
  }
  
  return newInsights;
};

// Check today's treatments count
export const checkTodayTreatments = (treatments) => {
  if (!treatments) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTreatmentsCount = treatments.filter(t => {
    const treatmentDate = new Date(t.treatmentDate).toISOString().split('T')[0];
    return treatmentDate === today;
  }).length;
  
  return todayTreatmentsCount;
};

// Identify missed treatments
export const identifyMissedTreatments = (treatments) => {
  if (!treatments) return [];
  
  // Group treatments by date
  const treatmentsByDate = {};
  treatments.forEach(treatment => {
    const date = new Date(treatment.treatmentDate).toISOString().split('T')[0];
    if (!treatmentsByDate[date]) {
      treatmentsByDate[date] = [];
    }
    treatmentsByDate[date].push(treatment);
  });
  
  // Find dates with less than 3 treatments
  const missedDates = [];
  Object.keys(treatmentsByDate).forEach(date => {
    if (treatmentsByDate[date].length < 3) {
      missedDates.push({
        date,
        treatmentsCount: treatmentsByDate[date].length,
        missingCount: 3 - treatmentsByDate[date].length
      });
    }
  });
  
  return missedDates;
};

// Prepare chart data for visualization
export const prepareChartData = (dailyData, dateRange) => {
  return dailyData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-dateRange)
    .map(day => ({
      date: day.formattedDate,
      volumeIn: day.volumeIn,
      volumeOut: day.volumeOut,
      netUF: day.netBalance,
      interpretation: day.interpretation,
      status: day.status
    }));
};

// Prepare adherence data for visualization
export const prepareAdherenceData = (treatments) => {
  if (!treatments || treatments.length === 0) return [];
  
  const statusCounts = treatments.reduce((acc, treatment) => {
    const status = treatment.TreatmentStatus?.toLowerCase() || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: Math.round((count / treatments.length) * 100)
  }));
};

// Generate personalized treatment suggestions based on patient data
export const generateTreatmentSuggestions = async (patientData) => {
  if (!patientData || !patientData.treatments || patientData.treatments.length === 0) {
    return {
      prescription: ["Insufficient data to generate personalized suggestions"],
      monitoring: ["Please ensure treatment data is being recorded regularly"],
      tests: ["Basic metabolic panel to establish baseline"],
      education: ["Review PD procedure and importance of adherence"],
      risks: ["Unable to assess risks without sufficient treatment history"]
    };
  }

  const { dailyData, totalBalance } = calculateDailyBalances(patientData.treatments);
  const insights = analyzeTreatments(patientData);
  const adherenceRate = Math.round((patientData.treatments.filter(t => 
    t.TreatmentStatus && t.TreatmentStatus.toLowerCase() === 'completed'
  ).length / patientData.treatments.length) * 100);
  
  const retentionDays = dailyData.filter(day => day.netBalance > 0).length;
  const retentionPercentage = (retentionDays / dailyData.length) * 100;
  
  const suggestions = {
    prescription: [],
    monitoring: [],
    tests: [],
    education: [],
    risks: []
  };

  // Fluid management suggestions
  if (totalBalance.isPositive) {
    if (totalBalance.value > 2000) {
      suggestions.prescription.push("Consider adding icodextrin for long dwell to improve fluid removal");
      suggestions.prescription.push("Review antihypertensive medications - may need reduction if hypotensive");
    } else if (totalBalance.value > 0) {
      suggestions.prescription.push("Consider increasing glucose concentration in 1-2 exchanges for better ultrafiltration");
    }
  } else if (totalBalance.value < -1500) {
    suggestions.prescription.push("Monitor for signs of dehydration - may need to reduce glucose concentration in some exchanges");
  }

  // Adequacy suggestions
  if (patientData.labResults && patientData.labResults.ktv) {
    const lastKtV = patientData.labResults.ktv[patientData.labResults.ktv.length - 1];
    if (lastKtV && lastKtV.value < 1.7) {
      suggestions.prescription.push("Consider increasing number of exchanges or volume to improve clearance");
    }
  }

  // Adherence suggestions
  if (adherenceRate < 85) {
    suggestions.education.push("Discuss barriers to completing all exchanges - simplify regimen if possible");
    suggestions.monitoring.push("Consider more frequent follow-up to address adherence challenges");
  }

  // Infection prevention
  const cloudyEffluent = patientData.treatments.filter(t => 
    t.Color && (t.Color.toLowerCase().includes('cloudy') || t.Color.toLowerCase().includes('turbid'))
  ).length;
  
  if (cloudyEffluent > 0) {
    suggestions.risks.push("History of cloudy effluent - reinforce sterile technique and exit site care");
    suggestions.tests.push("Consider peritoneal fluid cell count and culture if recent cloudy effluent");
  }

  // Standard monitoring
  suggestions.monitoring.push("Continue daily weight and blood pressure monitoring");
  suggestions.monitoring.push("Assess for edema, shortness of breath, or other fluid overload symptoms");
  
  // Standard tests
  suggestions.tests.push("Monthly basic metabolic panel to monitor electrolytes and kidney function");
  suggestions.tests.push("Quarterly complete blood count to monitor for anemia");
  suggestions.tests.push("Annual parathyroid hormone and bone mineral density testing");
  
  // Standard education
  suggestions.education.push("Reinforce importance of exit site care and recognizing signs of infection");
  suggestions.education.push("Review dietary sodium and fluid intake recommendations");
  
  // Risk factors
  if (retentionPercentage > 50) {
    suggestions.risks.push("Persistent fluid retention may increase cardiovascular risk");
  }
  
  if (patientData.treatments.filter(t => 
    t.Dialysate && typeof t.Dialysate === 'string' && (t.Dialysate.includes('2.5%') || t.Dialysate.includes('3.86%') || t.Dialysate.includes('4.25%'))
  ).length > patientData.treatments.length * 0.6) {
    suggestions.risks.push("High glucose exposure may increase metabolic risk - monitor blood sugar and lipids");
  }

  return suggestions;
};

// PD Knowledge Section - Educational content about Peritoneal Dialysis
export const pdKnowledge = [
  {
    title: "Fluid Balance",
    content: "A negative fluid balance (more out than in) is generally good in PD patients. Consistently positive balances may need prescription adjustments."
  },
  {
    title: "Treatment Frequency",
    content: "Most PD patients need 3-5 exchanges daily. Missing treatments can lead to inadequate clearance and fluid overload."
  },
  {
    title: "Solution Strength",
    content: "Higher glucose concentrations provide better fluid removal but increase glucose absorption and metabolic issues."
  },
  {
    title: "Effluent Monitoring",
    content: "Cloudy effluent may indicate infection. Blood-tinged fluid can occur but should be monitored. Always document characteristics."
  },
  {
    title: "Dwell Times",
    content: "Longer dwell times increase toxin removal but may decrease fluid removal. Shorter dwells remove more fluid but less toxins."
  },
  {
    title: "Exit Site Care",
    content: "Proper exit site care prevents infections. Clean daily with antiseptic and keep dry and covered with sterile dressing."
  }
];