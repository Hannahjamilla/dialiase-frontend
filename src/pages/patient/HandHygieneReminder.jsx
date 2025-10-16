import React from 'react';
import {
  FaHands,
  FaFaucet,
} from 'react-icons/fa';
import {
  BsDropletHalf,
  BsEmojiSmile,
} from 'react-icons/bs';
import {
  HiOutlineEmojiHappy,
} from 'react-icons/hi';
import {
  MdSoap,
  MdOutlineWavingHand,
} from 'react-icons/md';
import {
  GiSoapExperiment,
  GiHand,
  GiSparkles,
} from 'react-icons/gi';
import {
  RiHandHeartLine,
} from 'react-icons/ri';
import {
  FiAlertCircle,
} from 'react-icons/fi';
import {
  LuHandPlatter,
} from 'react-icons/lu';

const HandHygieneReminder = ({ colors }) => {
  const iconColor = colors?.primary || '#395886';

  const steps = [
    { icon: <FaFaucet style={{ color: iconColor }} />, text: 'Wet hands with clean running water' },
    { icon: <MdSoap style={{ color: iconColor }} />, text: 'Apply enough soap to cover your hands' },
    { icon: <FaHands style={{ color: iconColor }} />, text: 'Rub hands palm to palm' },
    { icon: <GiSoapExperiment style={{ color: iconColor }} />, text: 'Lather between your fingers' },
    { icon: <GiHand style={{ color: iconColor }} />, text: 'Scrub back of fingers' },
    { icon: <MdOutlineWavingHand style={{ color: iconColor }} />, text: 'Rub the backs of each hand' },
    { icon: <RiHandHeartLine style={{ color: iconColor }} />, text: 'Clean thumbs thoroughly' },
    { icon: <LuHandPlatter style={{ color: iconColor }} />, text: 'Wash fingernails and fingertips' },
    { icon: <BsDropletHalf style={{ color: iconColor }} />, text: 'Rub each wrist with opposite hand' },
    { icon: <HiOutlineEmojiHappy style={{ color: iconColor }} />, text: 'Rinse hands and wrists thoroughly' },
    { icon: <BsEmojiSmile style={{ color: iconColor }} />, text: 'Dry hands with a single-use towel' },
    { icon: <GiSparkles style={{ color: iconColor }} />, text: 'Your hands are now clean and safe' },
  ];

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '2rem 1rem',
      borderRadius: '12px',
      marginTop: '2rem',
      color: colors?.primary || '#395886',
      fontFamily: 'Arial, sans-serif',
      width: '100%'
    }}>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '12px',
        justifyContent: 'center'
      }}>
        <FiAlertCircle style={{ fontSize: '24px', color: colors?.primary }} />
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.5rem',
          color: colors?.primary,
          fontWeight: '600'
        }}>Hand Hygiene Reminder</h2>
      </div>

      <p style={{
        fontStyle: 'italic',
        margin: '0 auto 2rem',
        backgroundColor: colors?.green || '#477977',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: colors?.white || '#FFFFFF',
        maxWidth: '600px',
        textAlign: 'center',
        fontSize: '0.9rem',
        lineHeight: '1.5'
      }}>
        Proper handwashing can help prevent infections and maintain your health during treatments.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        justifyItems: 'center'
      }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: colors?.white || '#FFFFFF',
              color: '#333',
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              borderTop: `4px solid ${colors?.green || '#477977'}`,
              textAlign: 'center',
              minHeight: '140px',
              width: '100%',
              maxWidth: '280px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
            }}
          >
            <div style={{ 
              fontSize: '2rem', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px'
            }}>
              {step.icon}
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              lineHeight: '1.4',
              fontWeight: '500'
            }}>{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HandHygieneReminder;