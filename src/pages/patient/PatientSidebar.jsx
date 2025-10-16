import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import logo from "../../assets/images/logo.png";
import {
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaTimes,
  FaBars,
  FaHistory,
  FaCalendarAlt,
  FaFileMedical,
  FaNotesMedical
} from 'react-icons/fa';

// Animations
const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Main container styles
const Aside = styled.aside`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  z-index: 100;
  padding: 1rem;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  @media screen and (max-width: 768px) {
    transform: translateX(-100%);
    ${({ $mobileMenuOpen }) => $mobileMenuOpen && css`
      animation: ${slideIn} 0.3s ease-out forwards;
      box-shadow: 5px 0 25px rgba(0, 0, 0, 0.2);
    `}
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const LogoContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
`;

const LogoText = styled.h2`
  color: #395886;
  font-weight: 800;
  font-size: 1.2rem;
  margin: 0;
  letter-spacing: -0.5px;
  
  @media screen and (max-width: 1200px) {
    display: none;
  }
`;

const CloseButton = styled.button`
  display: none;
  cursor: pointer;
  color: #7d8da1;
  background: none;
  border: none;
  font-size: 1.5rem;
  
  @media screen and (max-width: 768px) {
    display: block;
  }
`;

const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 0;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  color: #363949;
  padding: 0.8rem 1rem;
  margin: 0.25rem 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(74, 108, 247, 0.1);
    color: #4a6cf7;
  }
  
  &.active {
    background-color: rgba(74, 108, 247, 0.1);
    color: #4a6cf7;
    font-weight: 600;
  }
`;

const MenuIcon = styled.span`
  margin-right: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
`;

const MenuText = styled.span`
  font-size: 0.95rem;
  
  @media screen and (max-width: 1200px) {
    display: none;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const UserAvatar = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a6cf7, #6a11cb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: #363949;
  font-size: 0.95rem;
`;

const UserRole = styled.span`
  font-size: 0.8rem;
  color: #7d8da1;
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 90;
  background: #4a6cf7;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  
  @media screen and (max-width: 768px) {
    display: flex;
  }
`;

const Backdrop = styled.div`
  display: ${({ $mobileMenuOpen }) => $mobileMenuOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  animation: ${fadeIn} 0.3s ease-out;
`;

const LogoutButton = styled(MenuItem)`
  margin-top: auto;
  color: #e74c3c;
  
  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
  }
`;

const PatientSidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname.includes(path) ? "active" : "";
  };

  const menuItems = [
    { 
      name: "Home Page", 
      icon: <FaHome />, 
      path: "/patient/PatientDashboard",
      match: "dashboard"
    },
    // { 
    //   name: "Treatment History", 
    //   icon: <FaHistory />, 
    //   path: "/patient/PatientTreatmentHistory",
    //   match: "treatment-history"
    // },
    // { 
    //   name: "Appointments", 
    //   icon: <FaCalendarAlt />, 
    //   path: "/patient/appointments",
    //   match: "appointments"
    // },
    // { 
    //   name: "Medical Records", 
    //   icon: <FaFileMedical />, 
    //   path: "/patient/medical-records",
    //   match: "medical-records"
    // },
    // { 
    //   name: "Prescriptions", 
    //   icon: <FaNotesMedical />, 
    //   path: "/patient/prescriptions",
    //   match: "prescriptions"
    // },
    // { 
    //   name: "My Profile", 
    //   icon: <FaUserCircle />, 
    //   path: "/patient/profile",
    //   match: "profile"
    // }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getUserInitials = () => {
    if (!user?.first_name) return "P";
    return `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <>
      <MobileMenuButton onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </MobileMenuButton>
      
      <Backdrop $mobileMenuOpen={mobileMenuOpen} onClick={toggleMobileMenu} />
      
      <Aside $mobileMenuOpen={mobileMenuOpen}>
        <TopSection>
          <LogoContainer>
            <LogoImage src={logo} alt="Dialiease Logo" />
            <LogoText>DIALIEASE</LogoText>
          </LogoContainer>
          <CloseButton onClick={toggleMobileMenu}>
            <FaTimes />
          </CloseButton>
        </TopSection>

        {user && (
          <UserProfile>
            <UserAvatar>{getUserInitials()}</UserAvatar>
            <UserInfo>
              <UserName>{user.first_name} {user.last_name}</UserName>
              <UserRole>Patient</UserRole>
            </UserInfo>
          </UserProfile>
        )}

        <SidebarMenu>
          {menuItems.map((item) => (
            <MenuItem
              key={item.name}
              className={isActive(item.match)}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              <MenuText>{item.name}</MenuText>
            </MenuItem>
          ))}

          <LogoutButton onClick={handleLogout}>
            <MenuIcon><FaSignOutAlt /></MenuIcon>
            <MenuText>Logout</MenuText>
          </LogoutButton>
        </SidebarMenu>
      </Aside>
    </>
  );
};

PatientSidebar.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }),
};

export default PatientSidebar;