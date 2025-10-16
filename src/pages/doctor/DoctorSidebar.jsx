import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import logo from "../../assets/images/logo.png";
import {
  FaHome,
  FaStethoscope,
  FaNotesMedical,
  FaSyringe,
  FaPowerOff,
  FaTimes,
  FaBars,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import axios from 'axios';
import OffDutyModal from './OffDutyModal';

const colors = {
  primary: '#395886',
  white: '#FFFFFF',
  green: '#477977',
  lightGray: '#f5f5f5',
  darkGray: '#363949',
  mediumGray: '#7d8da1',
  danger: '#e74c3c'
};

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Aside = styled.aside`
  height: 100vh;
  width: 280px;
  position: fixed;
  top: 0;
  left: 0;
  background: ${colors.white};
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  transition: all 0.3s ease;
  z-index: 100;

  @media screen and (max-width: 768px) {
    transform: translateX(-100%);
    width: 300px;
    ${({ $mobileMenuOpen }) =>
      $mobileMenuOpen &&
      css`
        animation: ${slideIn} 0.3s ease-out forwards;
        box-shadow: 8px 0 30px rgba(0, 0, 0, 0.15);
      `}
  }
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 1rem;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LogoImage = styled.img`
  width: 2.8rem;
  height: 2.8rem;
  object-fit: contain;
`;

const LogoText = styled.h2`
  color: ${colors.primary};
  font-weight: 800;
  font-size: 1.4rem;
  margin: 0;
`;

const UserInfoTop = styled.div`
  margin: 1rem 0;
  padding: 0.7rem 1rem;
  background: rgba(57, 88, 134, 0.06);
  border-radius: 10px;
  font-size: 0.95rem;
  color: ${colors.darkGray};
  font-weight: 600;
`;

const UserRole = styled.div`
  margin-top: 0.2rem;
  background: ${colors.lightGray};
  color: ${colors.mediumGray};
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  display: none;
  color: ${colors.mediumGray};
  cursor: pointer;

  &:hover {
    color: ${colors.primary};
    transform: scale(1.1);
  }

  @media screen and (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: 1.2rem;
  left: 1.2rem;
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: 10px;
  padding: 0.85rem;
  z-index: 90;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(57, 88, 134, 0.2);

  &:hover {
    background: ${colors.green};
    transform: scale(1.05);
  }

  @media screen and (max-width: 768px) {
    display: flex;
  }
`;

const Backdrop = styled.div`
  display: ${({ $mobileMenuOpen }) => ($mobileMenuOpen ? 'block' : 'none')};
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SidebarMenu = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.85rem 1.2rem;
  margin: 0.3rem 0;
  border-radius: 10px;
  color: ${colors.darkGray};
  font-size: 1rem;
  cursor: pointer;
  position: relative;

  &:hover {
    background: rgba(57, 88, 134, 0.08);
    color: ${colors.primary};
  }

  &.active {
    background: rgba(57, 88, 134, 0.1);
    color: ${colors.primary};
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 3px;
      background: ${colors.primary};
      border-radius: 0 10px 10px 0;
    }
  }
`;

const MenuIcon = styled.span`
  margin-right: 1.2rem;
  font-size: 1.2rem;
`;

const MenuText = styled.span`
  font-weight: 500;
`;

const SubMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px dashed rgba(57, 88, 134, 0.2);
  overflow: hidden;
  max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
  transition: max-height 0.3s ease;
`;

const SubMenuItem = styled(MenuItem)`
  padding: 0.6rem 1rem;
  margin: 0.2rem 0;
  font-size: 0.95rem;
`;

const ExpandIcon = styled.span`
  margin-left: auto;
  transition: transform 0.3s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(0deg)' : 'rotate(-90deg)')};
  font-size: 0.9rem;
  color: ${colors.mediumGray};
`;

const OffDutyButton = styled(MenuItem)`
  margin-top: auto;
  color: ${colors.danger};

  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
    color: ${colors.danger};
  }

  svg {
    color: ${colors.danger};
  }
`;

const DoctorSidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [openSubMenu, setOpenSubMenu] = React.useState(null);
  const [showOffDutyModal, setShowOffDutyModal] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleOffDutyClick = () => {
    setShowOffDutyModal(true);
    setError(null);
  };

  const handleConfirmOffDuty = async () => {
    try {
      setIsUpdatingStatus(true);
      setError(null);
      
      const response = await axios.post('/api/doctor/update-status', {
        status: 'off duty'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        window.location.reload();
      } else {
        setError(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating status');
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <FaHome />, 
      path: "/doctor/DoctorDashboard",
      match: "DoctorDashboard"
    },
    { 
      name: "PD Treatments", 
      icon: <FaNotesMedical />, 
      path: "/doctor/TrackPatientRecords",
      match: "TrackPatientRecords",
      subItems: [
        { name: "Patients care", path: "/doctor/TrackPatientRecords", match: "TrackPatientRecords" },
      ]
    },
    // { 
    //   name: "Patient Checkup", 
    //   icon: <FaStethoscope />, 
    //   path: "/doctor/DoctorCheckup",
    //   match: "DoctorCheckup"
    // },
    // { 
    //   name: "Prescriptions", 
    //   icon: <FaSyringe />, 
    //   path: "/doctor/ListPrescriptions",
    //   match: "Prescriptions"
    // }
  ];

  return (
    <>
      <MobileMenuButton onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </MobileMenuButton>

      <Backdrop $mobileMenuOpen={mobileMenuOpen} onClick={toggleMobileMenu} />

      <Aside $mobileMenuOpen={mobileMenuOpen}>
        <TopSection>
          <LogoContainer>
            <LogoImage src={logo} alt="Logo" />
            <LogoText>DIALIEASE</LogoText>
          </LogoContainer>
          <CloseButton onClick={toggleMobileMenu}><FaTimes /></CloseButton>
        </TopSection>

        {user && (
          <UserInfoTop>
            {user.first_name} {user.last_name}
            <UserRole>Doctor</UserRole>
          </UserInfoTop>
        )}

        <SidebarMenu>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.name}>
              <MenuItem
                className={isActive(item.path)}
                onClick={() => {
                  if (item.subItems) {
                    toggleSubMenu(index);
                  } else {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }
                }}
              >
                <MenuIcon>{item.icon}</MenuIcon>
                <MenuText>{item.name}</MenuText>
                {item.subItems && (
                  <ExpandIcon $isOpen={openSubMenu === index}>
                    <FaChevronDown />
                  </ExpandIcon>
                )}
              </MenuItem>

              {item.subItems && (
                <SubMenuContainer $isOpen={openSubMenu === index}>
                  {item.subItems.map((subItem) => (
                    <SubMenuItem
                      key={subItem.name}
                      className={isActive(subItem.path)}
                      onClick={() => {
                        navigate(subItem.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <MenuIcon><FaChevronRight size={12} /></MenuIcon>
                      <MenuText>{subItem.name}</MenuText>
                    </SubMenuItem>
                  ))}
                </SubMenuContainer>
              )}
            </React.Fragment>
          ))}

          <OffDutyButton onClick={handleOffDutyClick}>
            <MenuIcon><FaPowerOff /></MenuIcon>
            <MenuText>Off Duty</MenuText>
          </OffDutyButton>
        </SidebarMenu>
      </Aside>

      {showOffDutyModal && (
        <OffDutyModal
          onClose={() => setShowOffDutyModal(false)}
          onConfirm={handleConfirmOffDuty}
          isUpdating={isUpdatingStatus}
          error={error}
        />
      )}
    </>
  );
};

DoctorSidebar.propTypes = {
  user: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    userLevel: PropTypes.string,
  }),
};

export default DoctorSidebar;