import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserCircle, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';
import StaffSidebar from './StaffSidebar';

const colors = {
  primary: '#395886',
  white: '#FFFFFF',
  green: '#477977',
  lightGray: '#f5f5f5',
  darkGray: '#363949',
  mediumGray: '#7d8da1',
  danger: '#e74c3c'
};

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #f6f6f9;
`;

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: ${colors.primary};
  font-size: 1.8rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: ${colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: ${colors.lightGray};
  margin-bottom: 1rem;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.primary};
  color: ${colors.white};
  font-size: 3.5rem;
`;

const AvatarUpload = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.primary};
  color: ${colors.white};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: ${colors.green};
  }

  input {
    display: none;
  }
`;

const UserName = styled.h2`
  font-size: 1.4rem;
  color: ${colors.darkGray};
  margin: 0.5rem 0 0.2rem;
  text-align: center;
`;

const UserRole = styled.p`
  color: ${colors.mediumGray};
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
`;

const InfoSection = styled.div`
  margin-top: 1.5rem;
`;

const InfoItem = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const InfoLabel = styled.p`
  color: ${colors.mediumGray};
  margin: 0 0 0.3rem;
  font-size: 0.85rem;
`;

const InfoValue = styled.p`
  color: ${colors.darkGray};
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
`;

const FormSection = styled.div`
  background: ${colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${colors.mediumGray};
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 88, 134, 0.1);
  }

  &:disabled {
    background: ${colors.lightGray};
    color: ${colors.darkGray};
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: ${colors.white};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 88, 134, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  transition: all 0.2s ease;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(57, 88, 134, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SaveButton = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.green};
  }
`;

const CancelButton = styled.button`
  background: ${colors.lightGray};
  color: ${colors.darkGray};
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const EditButton = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.green};
  }
`;

const StaffProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    specialization: '',
    EmpAddress: '',
    EmpStatus: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/staff/profile');
        setUser(response.data);
        setFormData({
          first_name: response.data.first_name,
          middle_name: response.data.middle_name || '',
          last_name: response.data.last_name,
          suffix: response.data.suffix || '',
          email: response.data.email,
          date_of_birth: response.data.date_of_birth || '',
          gender: response.data.gender || '',
          phone_number: response.data.phone_number || '',
          specialization: response.data.specialization || '',
          EmpAddress: response.data.EmpAddress || '',
          EmpStatus: response.data.EmpStatus || '',
        });
        if (response.data.profile_image) {
          setPreviewImage(`/storage/${response.data.profile_image}`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }

      const response = await axios.post('/staff/profile/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(response.data.user);
      if (response.data.profile_image) {
        setPreviewImage(`/storage/${response.data.profile_image}?${Date.now()}`);
      }
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        first_name: user.first_name,
        middle_name: user.middle_name || '',
        last_name: user.last_name,
        suffix: user.suffix || '',
        email: user.email,
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        phone_number: user.phone_number || '',
        specialization: user.specialization || '',
        EmpAddress: user.EmpAddress || '',
        EmpStatus: user.EmpStatus || '',
      });
      setProfileImage(null);
      if (user.profile_image) {
        setPreviewImage(`/storage/${user.profile_image}`);
      } else {
        setPreviewImage('');
      }
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const getInitials = () => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  return (
    <PageContainer>
      <StaffSidebar />
      <MainContent>
        <ProfileContainer>
          <ProfileHeader>
            <Title>
              <FaUserCircle /> My Profile
            </Title>
            {!isEditing && (
              <EditButton onClick={() => setIsEditing(true)}>
                <FaEdit /> Edit Profile
              </EditButton>
            )}
          </ProfileHeader>

          <ProfileContent>
            <ProfileCard>
              <AvatarSection>
                <AvatarWrapper>
                  {previewImage ? (
                    <AvatarImage src={previewImage} alt="Profile" />
                  ) : (
                    <AvatarPlaceholder>{getInitials()}</AvatarPlaceholder>
                  )}
                </AvatarWrapper>
                {isEditing && (
                  <AvatarUpload>
                    <FaCamera />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </AvatarUpload>
                )}
                <UserName>{user.first_name} {user.last_name}</UserName>
                <UserRole>Medical Staff</UserRole>
              </AvatarSection>

              <InfoSection>
                <InfoItem>
                  <InfoLabel>Employee Number</InfoLabel>
                  <InfoValue>{user.employeeNumber}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Registration Number</InfoLabel>
                  <InfoValue>{user.reg_number || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Employment Status</InfoLabel>
                  <InfoValue>{user.EmpStatus || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{user.email}</InfoValue>
                </InfoItem>
              </InfoSection>
            </ProfileCard>

            {isEditing ? (
              <FormSection>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <FormGroup>
                      <FormLabel>First Name</FormLabel>
                      <FormInput
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>Middle Name</FormLabel>
                      <FormInput
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <FormGroup>
                      <FormLabel>Last Name</FormLabel>
                      <FormInput
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>Suffix</FormLabel>
                      <FormInput
                        type="text"
                        name="suffix"
                        value={formData.suffix}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                  </div>

                  <FormGroup>
                    <FormLabel>Email</FormLabel>
                    <FormInput
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <FormGroup>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormInput
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>Gender</FormLabel>
                      <FormSelect
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </FormSelect>
                    </FormGroup>
                  </div>

                  <FormGroup>
                    <FormLabel>Phone Number</FormLabel>
                    <FormInput
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Specialization</FormLabel>
                    <FormInput
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Address</FormLabel>
                    <FormTextarea
                      name="EmpAddress"
                      value={formData.EmpAddress}
                      onChange={handleInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Employment Status</FormLabel>
                    <FormSelect
                      name="EmpStatus"
                      value={formData.EmpStatus}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Status</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </FormSelect>
                  </FormGroup>

                  <ButtonGroup>
                    <SaveButton type="submit">
                      <FaSave /> Save Changes
                    </SaveButton>
                    <CancelButton type="button" onClick={handleCancel}>
                      <FaTimes /> Cancel
                    </CancelButton>
                  </ButtonGroup>
                </form>
              </FormSection>
            ) : (
              <ProfileCard>
                <InfoSection>
                  <InfoItem>
                    <InfoLabel>Full Name</InfoLabel>
                    <InfoValue>
                      {user.first_name} {user.middle_name ? `${user.middle_name} ` : ''}
                      {user.last_name} {user.suffix ? user.suffix : ''}
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Date of Birth</InfoLabel>
                    <InfoValue>{user.date_of_birth || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Gender</InfoLabel>
                    <InfoValue>{user.gender || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Phone Number</InfoLabel>
                    <InfoValue>{user.phone_number || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Specialization</InfoLabel>
                    <InfoValue>{user.specialization || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Address</InfoLabel>
                    <InfoValue>{user.EmpAddress || 'N/A'}</InfoValue>
                  </InfoItem>
                </InfoSection>
              </ProfileCard>
            )}
          </ProfileContent>
        </ProfileContainer>
      </MainContent>
    </PageContainer>
  );
};

export default StaffProfile;