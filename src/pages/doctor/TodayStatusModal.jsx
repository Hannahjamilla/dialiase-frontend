import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const colors = {
  primary: '#477977',
  danger: '#e74c3c',
  white: '#FFFFFF'
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  color: ${colors.primary};
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ConfirmButton = styled(Button)`
  background-color: ${colors.primary};
  color: white;

  &:hover {
    background-color: #3a6563;
    box-shadow: 0 4px 12px rgba(71, 121, 119, 0.3);
  }
`;

const CancelButton = styled(Button)`
  background-color: ${colors.white};
  border: 1px solid ${colors.danger};
  color: ${colors.danger};

  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ErrorText = styled.p`
  color: ${colors.danger};
  text-align: center;
  margin: 1rem 0;
`;

const TodayStatusModal = ({ onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/status/update', {
        status: 'in Duty'
      });

      // Update local storage
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = {
        ...user,
        TodaysStatus: 'in Duty'
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('lastStatusUpdate', new Date().toLocaleDateString());
      
      // Call onConfirm with the updated user
      onConfirm(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.post('/status/update', {
        status: 'off duty'
      });

      // Clear user data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      console.error('Status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Daily Status Check</ModalTitle>
        <p>
          Are you available for duty today?  
          If you choose **Yes**, your status will be set to *On Duty*.  
          If you choose **No**, you will be logged out and your status will be updated to *Off Duty*.
        </p>
        {error && <ErrorText>{error}</ErrorText>}
        
        <ButtonGroup>
          <ConfirmButton onClick={handleConfirm} disabled={loading}>
            {loading ? 'Updating...' : 'Yes, I’m Available'}
          </ConfirmButton>
          <CancelButton onClick={handleCancel} disabled={loading}>
            No, I’m Not Available
          </CancelButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default TodayStatusModal;
