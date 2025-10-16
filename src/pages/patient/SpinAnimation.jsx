import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

const SpinAnimation = ({ startPos, product, colors }) => {
  const cartButton = document.querySelector('[data-cart-button]');
  const endPos = cartButton ? cartButton.getBoundingClientRect() : { left: window.innerWidth - 100, top: 100 };

  return (
    <div style={{
      position: 'fixed',
      left: startPos.x,
      top: startPos.y,
      width: '40px',
      height: '40px',
      zIndex: 9999,
      pointerEvents: 'none',
      animation: `moveToCart 1s ease-in-out forwards`,
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: '#477876',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(71, 120, 118, 0.4)',
        border: `2px solid #FFFFFF`,
      }}>
        <FiShoppingCart />
      </div>
      
      <style>{`
        @keyframes moveToCart {
          0% {
            transform: 
              translate(0, 0) 
              scale(1) 
              rotate(0deg);
            opacity: 1;
          }
          70% {
            transform: 
              translate(${endPos.left - startPos.x}px, ${endPos.top - startPos.y}px) 
              scale(1) 
              rotate(360deg);
            opacity: 1;
          }
          100% {
            transform: 
              translate(${endPos.left - startPos.x}px, ${endPos.top - startPos.y}px) 
              scale(0) 
              rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SpinAnimation;