import React from 'react';
import PropTypes from 'prop-types';
import { FaUser } from 'react-icons/fa';

const PatientAvatar = ({
  firstName,
  lastName,
  size = '40px',
  backgroundColor = '#477977',
  color = 'white',
  hoverEffect = true,
  border = 'none',
  shadow = '0 2px 4px rgba(0,0,0,0.1)',
  className = ''
}) => {
  // Get initials from first and last name
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();

  // Generate gradient from background color
  const gradientColor = `${backgroundColor}, ${darkenColor(backgroundColor, 20)}`;

  return (
    <div
      className={`patient-avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${gradientColor})`,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: `calc(${size} * 0.4)`,
        boxShadow: shadow,
        position: 'relative',
        overflow: 'hidden',
        border: border,
        transition: hoverEffect ? 'all 0.3s ease' : 'none',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      {initials ? (
        initials
      ) : (
        <FaUser style={{ 
          fontSize: `calc(${size} * 0.5)`,
          opacity: 0.8
        }} />
      )}
      
      {/* Optional hover overlay */}
      {hoverEffect && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.1)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} className="avatar-hover-overlay" />
      )}
    </div>
  );
};

// Helper function to darken a color
function darkenColor(col, amt) {
  col = col.replace(/^#/, '');
  if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];
  
  let [r, g, b] = col.match(/.{2}/g);
  [r, g, b] = [parseInt(r, 16) - amt, parseInt(g, 16) - amt, parseInt(b, 16) - amt];

  r = Math.max(0, r).toString(16).padStart(2, '0');
  g = Math.max(0, g).toString(16).padStart(2, '0');
  b = Math.max(0, b).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

PatientAvatar.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  size: PropTypes.string,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  hoverEffect: PropTypes.bool,
  border: PropTypes.string,
  shadow: PropTypes.string,
  className: PropTypes.string
};


export default PatientAvatar;