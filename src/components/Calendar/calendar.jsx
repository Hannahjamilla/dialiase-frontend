import React, { useState } from "react";
import { FaCalendarAlt, FaUserInjured } from "react-icons/fa";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import '../../css/calendar.css';

export default function Calendar({ 
  patientAppointments = [],
  onDateClick 
}) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Enhanced patient count function with appointment details
  const getAppointmentsForDate = (day) => {
    if (!day) return { count: 0, appointments: [] };
    
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toDateString();
    
    const appointments = patientAppointments.filter(appointment => 
      new Date(appointment.appointment_date).toDateString() === dateStr
    );
    
    return {
      count: appointments.length,
      appointments
    };
  };

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const weeks = [];
  let week = Array(firstDayOfMonth).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const handleDateClick = (day, hasAppointments) => {
    if (day && onDateClick) {
      const date = new Date(currentYear, currentMonth, day);
      const { appointments } = getAppointmentsForDate(day);
      onDateClick(date, appointments);
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="arrow" onClick={handlePrevMonth}>
          <MdArrowBackIos />
        </button>
        <h2 className="calendar-title">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <button className="arrow" onClick={handleNextMonth}>
          <MdArrowForwardIos />
        </button>
      </div>
      <table className="calendar-grid">
        <thead>
          <tr>
            {daysOfWeek.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) => {
                const { count } = getAppointmentsForDate(day);
                const hasAppointments = count > 0;
                
                return (
                  <td
                    key={j}
                    className={`
                      ${day === null ? 'empty' : ''}
                      ${isToday(day) ? 'today' : ''}
                      ${hasAppointments ? 'has-appointments' : ''}
                    `}
                    onClick={() => handleDateClick(day, hasAppointments)}
                  >
                    <div className="date-cell-content">
                      <div className="date-number">{day || ''}</div>
                      {hasAppointments && (
                        <div className="appointment-indicator">
                          <FaUserInjured className="patient-icon" />
                          <span className="patient-count">{count}</span>
                        </div>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}