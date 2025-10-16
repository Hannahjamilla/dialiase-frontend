import React from 'react';
import { FaBirthdayCake, FaIdCard, FaUserInjured, FaCalendarCheck } from 'react-icons/fa';

const GotoEcommerce = ({ dashboardData }) => {
  // Calculate age distribution from real patient data
  const calculateAgeDistribution = () => {
    if (!dashboardData.allSchedules || dashboardData.allSchedules.length === 0) {
      return { minors: 0, adults: 0, seniors: 0, totalWithAge: 0 };
    }

    const today = new Date();
    let minors = 0, adults = 0, seniors = 0, totalWithAge = 0;

    // Use a Set to count unique patients by patient_id
    const uniquePatients = new Set();
    
    dashboardData.allSchedules.forEach(schedule => {
      if (!schedule.date_of_birth || uniquePatients.has(schedule.patientID)) return;
      
      uniquePatients.add(schedule.patientID);
      
      try {
        const birthDate = new Date(schedule.date_of_birth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
          ? age - 1 
          : age;

        if (adjustedAge < 18) minors++;
        else if (adjustedAge >= 18 && adjustedAge <= 64) adults++;
        else seniors++;
        
        totalWithAge++;
      } catch (error) {
        console.error('Error calculating age for patient:', schedule.patientID, error);
      }
    });

    return { minors, adults, seniors, totalWithAge };
  };

  // Calculate patient patterns from real schedule data
  const calculatePatientPatterns = () => {
    if (!dashboardData.allSchedules || dashboardData.allSchedules.length === 0) {
      return { 
        totalUniquePatients: 0, 
        frequentPatients: 0, 
        newThisMonth: 0,
        completedThisMonth: 0
      };
    }

    const patientAppointmentCount = {};
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Count appointments per patient and track dates
    dashboardData.allSchedules.forEach(schedule => {
      if (schedule.patientID) {
        patientAppointmentCount[schedule.patientID] = (patientAppointmentCount[schedule.patientID] || 0) + 1;
      }
    });

    const totalUniquePatients = Object.keys(patientAppointmentCount).length;
    const frequentPatients = Object.values(patientAppointmentCount).filter(count => count >= 3).length;

    // Calculate new patients this month (first appointment this month)
    let newThisMonth = 0;
    const patientFirstAppointment = {};
    
    dashboardData.allSchedules.forEach(schedule => {
      if (schedule.patientID && schedule.appointment_date) {
        if (!patientFirstAppointment[schedule.patientID]) {
          patientFirstAppointment[schedule.patientID] = schedule.appointment_date;
        } else {
          // Keep the earliest appointment date
          const currentFirst = new Date(patientFirstAppointment[schedule.patientID]);
          const newDate = new Date(schedule.appointment_date);
          if (newDate < currentFirst) {
            patientFirstAppointment[schedule.patientID] = schedule.appointment_date;
          }
        }
      }
    });

    Object.values(patientFirstAppointment).forEach(date => {
      if (date) {
        try {
          const appointmentDate = new Date(date);
          if (appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear) {
            newThisMonth++;
          }
        } catch (error) {
          console.error('Error parsing appointment date:', error);
        }
      }
    });

    // Calculate completed appointments this month
    const completedThisMonth = dashboardData.allSchedules.filter(schedule => {
      if (!schedule.appointment_date || schedule.checkup_status !== 'Completed') return false;
      
      try {
        const appointmentDate = new Date(schedule.appointment_date);
        return appointmentDate.getMonth() === currentMonth && 
               appointmentDate.getFullYear() === currentYear;
      } catch (error) {
        return false;
      }
    }).length;

    return { 
      totalUniquePatients, 
      frequentPatients, 
      newThisMonth,
      completedThisMonth
    };
  };

  // Calculate appointment trends
  const calculateAppointmentTrends = () => {
    if (!dashboardData.allSchedules || dashboardData.allSchedules.length === 0) {
      return { 
        todayCount: 0, 
        tomorrowCount: 0, 
        thisWeekCount: 0,
        completionRate: 0 
      };
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const todayCount = dashboardData.patientsToday?.length || 0;
    const tomorrowCount = dashboardData.patientsTomorrow?.length || 0;
    const thisWeekCount = dashboardData.nextWeekPatients?.length || 0;

    const totalAppointments = dashboardData.allSchedules.length;
    const completedAppointments = dashboardData.allSchedules.filter(s => 
      s.checkup_status === 'Completed'
    ).length;

    const completionRate = totalAppointments > 0 ? 
      Math.round((completedAppointments / totalAppointments) * 100) : 0;

    return { 
      todayCount, 
      tomorrowCount, 
      thisWeekCount,
      completionRate 
    };
  };

  const ageDistribution = calculateAgeDistribution();
  const patientPatterns = calculatePatientPatterns();
  const appointmentTrends = calculateAppointmentTrends();

  return (
    <div style={{
      marginBottom: '28px',
      marginTop: '20px',
      width: '125%'
    }}>

      {/* Age Distribution */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <FaBirthdayCake size={16} color="#477977" />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#477977' }}>
            CAPD Patient Age Distribution
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Minors (0-17)', count: ageDistribution.minors, color: '#395886' },
            { label: 'Adults (18-64)', count: ageDistribution.adults, color: '#477977' },
            { label: 'Seniors (65+)', count: ageDistribution.seniors, color: '#FF8F00' }
          ].map((ageGroup, index) => {
            const percentage = ageDistribution.totalWithAge > 0 ? 
              Math.round((ageGroup.count / ageDistribution.totalWithAge) * 100) : 0;
            
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: ageGroup.color,
                  minWidth: '100px'
                }}>
                  {ageGroup.label}
                </div>
                <div style={{ 
                  flex: 1, 
                  height: '20px', 
                  backgroundColor: '#f0f0f0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      height: '100%',
                      backgroundColor: ageGroup.color,
                      width: `${percentage}%`,
                      borderRadius: '10px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: 600, 
                  color: ageGroup.color,
                  minWidth: '50px',
                  textAlign: 'right'
                }}>
                  {ageGroup.count}
                </div>
              </div>
            );
          })}
        </div>

        {ageDistribution.totalWithAge === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#999', 
            fontSize: '14px',
            padding: '20px'
          }}>
            No age data available
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '11px',
            marginTop: '12px'
          }}>
            Based on {ageDistribution.totalWithAge} patients with age data
          </div>
        )}
      </div>

      {/* Patient Engagement */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px'
        }}>
          <FaIdCard size={16} color="#395886" />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#395886' }}>
            CAPD Patient Engagement
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'rgba(71, 121, 119, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(71, 121, 119, 0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#477977' }}>
              {patientPatterns.frequentPatients}
            </div>
            <div style={{ fontSize: '11px', color: '#477977', fontWeight: 600 }}>
              Frequent Visitors
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              3+ appointments
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(57, 88, 134, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(57, 88, 134, 0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#395886' }}>
              {patientPatterns.newThisMonth}
            </div>
            <div style={{ fontSize: '11px', color: '#395886', fontWeight: 600 }}>
              New This Month
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              First-time patients
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 167, 38, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 167, 38, 0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FF8F00' }}>
              {patientPatterns.completedThisMonth}
            </div>
            <div style={{ fontSize: '11px', color: '#FF8F00', fontWeight: 600 }}>
              Completed This Month
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              Monthly checkups
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(76, 175, 80, 0.2)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#4CAF50' }}>
              {appointmentTrends.completionRate}%
            </div>
            <div style={{ fontSize: '11px', color: '#4CAF50', fontWeight: 600 }}>
              Completion Rate
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              Overall success
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GotoEcommerce;