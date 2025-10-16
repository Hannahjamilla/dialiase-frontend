import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: inline-block;
  width: ${({ size }) => size === 'sm' ? '16px' : '24px'};
  height: ${({ size }) => size === 'sm' ? '16px' : '24px'};
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Spinner = ({ size = 'md' }) => {
  return <SpinnerContainer size={size} />;
};

export default Spinner;