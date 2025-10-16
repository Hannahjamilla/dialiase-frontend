import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Snackbar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Medication as MedicineIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const DoctorPrescriptionsView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Enhanced API call with better error handling
  const apiCall = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        ...options
      });

      // Check if response is HTML instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (text.startsWith('<!DOCTYPE html>') || text.startsWith('<!doctype html>') || text.startsWith('<html')) {
          throw new Error('Server returned HTML instead of JSON. Possible authentication issue or wrong endpoint.');
        }
        throw new Error(`Unexpected response format: ${contentType}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('API call failed:', err);
      throw err;
    }
  };

  // Fetch prescriptions data
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (systemFilter !== 'all') params.append('system', systemFilter);

      // Use absolute URL to avoid routing issues
      const baseUrl = window.location.origin;
      const result = await apiCall(`${baseUrl}/api/prescriptions/doctor/prescriptions?${params}`);
      
      if (result.success) {
        setPrescriptions(result.prescriptions || []);
      } else {
        throw new Error(result.message || 'Failed to load prescriptions');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch prescriptions. Please check your connection and try again.';
      setError(errorMessage);
      setSnackbarOpen(true);
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Download prescription PDF
  const downloadPrescriptionPDF = async (prescriptionId) => {
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/prescriptions/${prescriptionId}/download-pdf`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      
      // Check if blob is actually a PDF
      if (blob.type !== 'application/pdf') {
        const text = await blob.text();
        if (text.includes('<!DOCTYPE html>')) {
          throw new Error('Server returned HTML instead of PDF. Check authentication.');
        }
        throw new Error('Server returned unexpected file type');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${prescriptionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = `Failed to download PDF: ${err.message}`;
      setError(errorMessage);
      setSnackbarOpen(true);
      console.error('Error downloading PDF:', err);
    }
  };

  // View prescription details
  const viewPrescriptionDetails = async (prescriptionId) => {
    try {
      const baseUrl = window.location.origin;
      const result = await apiCall(`${baseUrl}/api/prescriptions/${prescriptionId}`);
      
      if (result.success) {
        setSelectedPrescription(result.data);
        setDetailDialogOpen(true);
      } else {
        throw new Error(result.message || 'Failed to load prescription details');
      }
    } catch (err) {
      const errorMessage = `Failed to load prescription details: ${err.message}`;
      setError(errorMessage);
      setSnackbarOpen(true);
      console.error('Error fetching prescription details:', err);
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchPrescriptions();
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSystemFilter('all');
    setDateFrom('');
    setDateTo('');
    // Don't fetch immediately, let user click apply
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString || 'N/A';
    }
  };

  // Get system color
  const getSystemColor = (system) => {
    const colors = {
      'APD': 'primary',
      'CAPD': 'secondary',
      'IPD': 'warning',
      'TPD': 'info'
    };
    return colors[system] || 'default';
  };

  // Debug function to check API response
  const debugApiResponse = async () => {
    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/prescriptions/doctor/prescriptions`);
      const text = await response.text();
      console.log('Raw API response:', text.substring(0, 500));
      
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e) {
        console.log('Response is not JSON');
      }
    } catch (err) {
      console.error('Debug failed:', err);
    }
  };

  // Call debug on component mount
  useEffect(() => {
    debugApiResponse();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading prescriptions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <MedicineIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Patient Prescriptions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  View and manage all patient prescriptions and medications
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={`${prescriptions.length} Patients`} 
                color="primary" 
                variant="outlined" 
              />
              <Button 
                variant="outlined" 
                size="small"
                onClick={debugApiResponse}
                title="Debug API"
              >
                Debug
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Patients"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Name, Hospital #, Legal Rep..."
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>PD System</InputLabel>
                <Select
                  value={systemFilter}
                  label="PD System"
                  onChange={(e) => setSystemFilter(e.target.value)}
                >
                  <MenuItem value="all">All Systems</MenuItem>
                  <MenuItem value="APD">APD</MenuItem>
                  <MenuItem value="CAPD">CAPD</MenuItem>
                  <MenuItem value="IPD">IPD</MenuItem>
                  <MenuItem value="TPD">TPD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Date From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Date To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  startIcon={<FilterIcon />}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setSnackbarOpen(false)}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => setSnackbarOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MedicineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No prescriptions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || dateFrom || dateTo || systemFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No patient prescriptions available'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        prescriptions.map((patient) => (
          <Card key={patient.patientID} sx={{ mb: 3 }}>
            <CardContent>
              {/* Patient Header */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" component="h2">
                      {patient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hospital #: {patient.hospitalNumber} | 
                      DOB: {formatDate(patient.date_of_birth)} | 
                      Gender: {patient.gender || 'N/A'}
                    </Typography>
                    {patient.legalRepresentative && (
                      <Typography variant="body2" color="text.secondary">
                        Legal Representative: {patient.legalRepresentative}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Chip 
                  label={patient.situationStatus || 'Active'} 
                  color={patient.situationStatus === 'Active' ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Prescriptions */}
              {patient.prescriptions && patient.prescriptions.length > 0 ? (
                patient.prescriptions.map((prescription, index) => (
                  <Accordion key={prescription.id || index} defaultExpanded={index === 0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center">
                          <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="subtitle1">
                            Prescription from {formatDate(prescription.created_at)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          {prescription.pd_system && (
                            <Chip 
                              label={prescription.pd_system} 
                              color={getSystemColor(prescription.pd_system)}
                              size="small"
                            />
                          )}
                          <Chip 
                            label={`${prescription.medicines?.length || 0} Medicines`} 
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {/* PD Data */}
                      {(prescription.pd_system || prescription.pd_modality) && (
                        <Box mb={3}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Peritoneal Dialysis Prescription
                          </Typography>
                          <Grid container spacing={2}>
                            {prescription.pd_system && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2"><strong>System:</strong></Typography>
                                <Typography variant="body2">{prescription.pd_system}</Typography>
                              </Grid>
                            )}
                            {prescription.pd_modality && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2"><strong>Modality:</strong></Typography>
                                <Typography variant="body2">{prescription.pd_modality}</Typography>
                              </Grid>
                            )}
                            {prescription.pd_total_exchanges && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2"><strong>Total Exchanges:</strong></Typography>
                                <Typography variant="body2">{prescription.pd_total_exchanges}</Typography>
                              </Grid>
                            )}
                            {prescription.pd_fill_volume && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2"><strong>Fill Volume:</strong></Typography>
                                <Typography variant="body2">{prescription.pd_fill_volume} L</Typography>
                              </Grid>
                            )}
                            {prescription.pd_dwell_time && (
                              <Grid item xs={6} sm={3}>
                                <Typography variant="body2"><strong>Dwell Time:</strong></Typography>
                                <Typography variant="body2">{prescription.pd_dwell_time} hrs</Typography>
                              </Grid>
                            )}
                            {prescription.pd_exchanges && (
                              <Grid item xs={6} sm={9}>
                                <Typography variant="body2"><strong>Exchanges:</strong></Typography>
                                <Typography variant="body2">{prescription.pd_exchanges}</Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      )}

                      {/* Medicines */}
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        Medications
                      </Typography>
                      {prescription.medicines && prescription.medicines.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Medicine</strong></TableCell>
                                <TableCell><strong>Dosage</strong></TableCell>
                                <TableCell><strong>Frequency</strong></TableCell>
                                <TableCell><strong>Duration</strong></TableCell>
                                <TableCell><strong>Instructions</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {prescription.medicines.map((medicine, medIndex) => (
                                <TableRow key={medIndex}>
                                  <TableCell>{medicine.medicine_name || 'Unknown Medicine'}</TableCell>
                                  <TableCell>{medicine.dosage}</TableCell>
                                  <TableCell>{medicine.frequency}</TableCell>
                                  <TableCell>{medicine.duration}</TableCell>
                                  <TableCell>{medicine.instructions || 'None'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No medicines prescribed
                        </Typography>
                      )}

                      {/* Additional Instructions */}
                      {prescription.additional_instructions && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Additional Instructions
                          </Typography>
                          <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                            {prescription.additional_instructions}
                          </Typography>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => viewPrescriptionDetails(prescription.id)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={() => downloadPrescriptionPDF(prescription.id)}
                            color="secondary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Box textAlign="center" py={3}>
                  <Typography variant="body2" color="text.secondary">
                    No prescriptions found for this patient
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Prescription Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Prescription Details
          {selectedPrescription && (
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(selectedPrescription.created_at)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <Box>
              {/* Patient Info */}
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Name:</strong></Typography>
                  <Typography variant="body2">
                    {selectedPrescription.patient?.user?.first_name} {selectedPrescription.patient?.user?.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2"><strong>Hospital Number:</strong></Typography>
                  <Typography variant="body2">
                    {selectedPrescription.patient?.hospitalNumber || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              {/* PD Data */}
              {(selectedPrescription.pd_system || selectedPrescription.pd_modality) && (
                <>
                  <Typography variant="h6" gutterBottom>
                    PD Prescription
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {selectedPrescription.pd_system && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><strong>System:</strong></Typography>
                        <Typography variant="body2">{selectedPrescription.pd_system}</Typography>
                      </Grid>
                    )}
                    {selectedPrescription.pd_modality && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><strong>Modality:</strong></Typography>
                        <Typography variant="body2">{selectedPrescription.pd_modality}</Typography>
                      </Grid>
                    )}
                    {selectedPrescription.pd_total_exchanges && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><strong>Total Exchanges:</strong></Typography>
                        <Typography variant="body2">{selectedPrescription.pd_total_exchanges}</Typography>
                      </Grid>
                    )}
                    {selectedPrescription.pd_fill_volume && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><strong>Fill Volume:</strong></Typography>
                        <Typography variant="body2">{selectedPrescription.pd_fill_volume} L</Typography>
                      </Grid>
                    )}
                    {selectedPrescription.pd_dwell_time && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="body2"><strong>Dwell Time:</strong></Typography>
                        <Typography variant="body2">{selectedPrescription.pd_dwell_time} hrs</Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}

              {/* Medicines */}
              <Typography variant="h6" gutterBottom>
                Medications ({selectedPrescription.medicines?.length || 0})
              </Typography>
              {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Medicine</strong></TableCell>
                        <TableCell><strong>Dosage</strong></TableCell>
                        <TableCell><strong>Frequency</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Instructions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPrescription.medicines.map((medicine, index) => (
                        <TableRow key={index}>
                          <TableCell>{medicine.medicine?.name || 'Unknown Medicine'}</TableCell>
                          <TableCell>{medicine.dosage}</TableCell>
                          <TableCell>{medicine.frequency}</TableCell>
                          <TableCell>{medicine.duration}</TableCell>
                          <TableCell>{medicine.instructions || 'None'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No medicines prescribed
                </Typography>
              )}

              {/* Additional Instructions */}
              {selectedPrescription.additional_instructions && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Additional Instructions
                  </Typography>
                  <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedPrescription.additional_instructions}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          {selectedPrescription && (
            <Button 
              onClick={() => downloadPrescriptionPDF(selectedPrescription.id)}
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorPrescriptionsView;