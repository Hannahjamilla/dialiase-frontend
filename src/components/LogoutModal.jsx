// LogoutModal.jsx
import React from 'react';
import styled from 'styled-components';
import { FaSignOutAlt } from 'react-icons/fa';

// Backdrop behind the modal with blur effect
const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

// Main modal container (wider and slightly bigger)
const ModalBox = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Modal title (color changed to black)
const Title = styled.h3`
  margin: 1rem 0;
  color: #000000;
  font-size: 1.2rem;
`;

// Container for buttons
const ButtonGroup = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`;

// Button styling
const Button = styled.button`
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant }) =>
    variant === 'cancel'
      ? `
    background: #ecf0f1;
    color: #2d3436;

    &:hover {
      background: #bdc3c7;
    }
  `
      : `
    background: #e74c3c;
    color: white;

    &:hover {
      background: #c0392b;
    }
  `}
`;

const LogoutModal = ({ onConfirm, onCancel }) => {
  return (
    <Backdrop onClick={onCancel}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <FaSignOutAlt size={32} color="#e74c3c" />
        <Title>Are you sure you want to logout?</Title>
        <ButtonGroup>
          <Button variant="cancel" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Logout</Button>
        </ButtonGroup>
      </ModalBox>
    </Backdrop>
  );
};

export default LogoutModal;
