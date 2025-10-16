import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Avatar, 
  Grid, 
  Paper, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Validation schema
const profileSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  middle_name: yup.string().nullable(),
  last_name: yup.string().required('Last name is required'),
  suffix: yup.string().nullable(),
  email: yup.string().email('Invalid email').required('Email is required'),
  employeeNumber: yup.string().required('Employee number is required'),
  date_of_birth: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Gender is required'),
  phone_number: yup.string().required('Phone number is required'),
  specialization: yup.string().nullable(),
  EmpAddress: yup.string().required('Address is required'),
});

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUser(response.data.user);
        reset(response.data.user);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [reset]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    reset(user);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      if (selectedFile) {
        formData.append('profile_image', selectedFile);
      }

      const response = await axios.put('/profile', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.user);
      setEditMode(false);
      setImagePreview(null);
      setSelectedFile(null);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box 
      component={Paper} 
      elevation={3}
      sx={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#FFFF',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #eee',
        }}>
          <Box sx={{ position: 'relative', marginRight: '2rem' }}>
            <Avatar
              sx={{
                width: '120px',
                height: '120px',
                border: '3px solid #638ECB',
              }}
              src={
                imagePreview || 
                (user.profile_image ? `/storage/profile_images/${user.profile_image}` : '/default-avatar.png')
              }
              alt={`${user.first_name} ${user.last_name}`}
            />
            {editMode && (
              <>
                <input
                  accept="image/*"
                  id="profile-image-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <Button 
                    component="span" 
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: '-10px',
                      right: '-10px',
                      backgroundColor: '#638ECB',
                      color: '#FFFF',
                      '&:hover': {
                        backgroundColor: '#395886',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </Button>
                </label>
              </>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {user.first_name} {user.middle_name ? `${user.middle_name} ` : ''}{user.last_name} {user.suffix || ''}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {user.specialization || 'No specialization provided'}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {user.userLevel} | Employee #: {user.employeeNumber}
            </Typography>
          </Box>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        <Typography variant="h5" sx={{ 
          color: '#395886',
          marginBottom: '1rem',
          fontWeight: '600',
        }}>
          Personal Information
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} sx={{ marginTop: '1rem' }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="First Name"
              variant="outlined"
              {...register('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Middle Name"
              variant="outlined"
              {...register('middle_name')}
              error={!!errors.middle_name}
              helperText={errors.middle_name?.message}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Last Name"
              variant="outlined"
              {...register('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Suffix"
              variant="outlined"
              {...register('suffix')}
              error={!!errors.suffix}
              helperText={errors.suffix?.message}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Employee Number"
              variant="outlined"
              {...register('employeeNumber')}
              error={!!errors.employeeNumber}
              helperText={errors.employeeNumber?.message}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                label="Gender"
                {...register('gender')}
                error={!!errors.gender}
                disabled={!editMode}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              {...register('date_of_birth')}
              error={!!errors.date_of_birth}
              helperText={errors.date_of_birth?.message}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              {...register('phone_number')}
              error={!!errors.phone_number}
              helperText={errors.phone_number?.message}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Specialization"
              variant="outlined"
              {...register('specialization')}
              error={!!errors.specialization}
              helperText={errors.specialization?.message}
              disabled={!editMode}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              variant="outlined"
              multiline
              rows={3}
              {...register('EmpAddress')}
              error={!!errors.EmpAddress}
              helperText={errors.EmpAddress?.message}
              disabled={!editMode}
            />
          </Grid>
        </Grid>

        <Box sx={{ 
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '2rem',
        }}>
          {editMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                sx={{
                  backgroundColor: '#f44336',
                  color: '#FFFF',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                startIcon={<SaveIcon />}
                disabled={!isDirty && !selectedFile}
                sx={{
                  backgroundColor: '#477977',
                  color: '#FFFF',
                  '&:hover': {
                    backgroundColor: '#3a6a68',
                  },
                }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
              sx={{
                backgroundColor: '#638ECB',
                color: '#FFFF',
                '&:hover': {
                  backgroundColor: '#395886',
                },
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </form>
    </Box>
  );
};

export default ProfilePage;