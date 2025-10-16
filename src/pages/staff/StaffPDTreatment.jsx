import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, Button, Select, MenuItem, FormControl, 
    InputLabel, Collapse, IconButton
} from '@mui/material';
import { format } from 'date-fns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const StaffPDTreatment = () => {
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedRows, setExpandedRows] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllTreatments();
    }, []);

    const fetchAllTreatments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/staff/treatments', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            setTreatments(response.data.treatments);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch treatments');
            setLoading(false);
        }
    };

    const formatPatientName = (treatment) => {
        if (!treatment.patient_name) return 'N/A';
        
        // If name comes as an object (from backend)
        if (typeof treatment.patient_name === 'object') {
            const { first_name, middle_name, last_name, suffix } = treatment.patient_name;
            const nameParts = [];
            if (first_name) nameParts.push(first_name);
            if (middle_name) nameParts.push(middle_name);
            if (last_name) nameParts.push(last_name);
            if (suffix) nameParts.push(suffix);
            return nameParts.join(' ') || 'N/A';
        }
        
        // If name comes as a string
        return treatment.patient_name || 'N/A';
    };

    const toggleRowExpansion = (treatmentId) => {
        setExpandedRows(prev => ({
            ...prev,
            [treatmentId]: !prev[treatmentId]
        }));
    };

    const filteredTreatments = filterStatus === 'all'
        ? treatments
        : treatments.filter(treatment => treatment.treatment_status === filterStatus);

    // Inline styles (same as before)
    const styles = {
        // ... your existing styles ...
    };

    if (loading) {
        return <Typography>Loading treatments...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box sx={styles.container}>
            <Typography variant="h4" sx={styles.header} gutterBottom>
                Peritoneal Dialysis Treatments
            </Typography>

            <Box sx={styles.filterContainer}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Filter by Status"
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={styles.tableHeader} />
                            <TableCell sx={styles.tableHeader}>Patient Name</TableCell>
                            <TableCell sx={styles.tableHeader}>Hospital Number</TableCell>
                            <TableCell sx={styles.tableHeader}>Treatment Date</TableCell>
                            <TableCell sx={styles.tableHeader}>Status</TableCell>
                            <TableCell sx={styles.tableHeader}>In Solution</TableCell>
                            <TableCell sx={styles.tableHeader}>Out Solution</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTreatments.length > 0 ? (
                            filteredTreatments.map((treatment) => (
                                <React.Fragment key={treatment.treatment_id}>
                                    <TableRow>
                                        <TableCell>
                                            <IconButton
                                                aria-label="expand row"
                                                size="small"
                                                sx={styles.expandIcon}
                                                onClick={() => toggleRowExpansion(treatment.treatment_id)}
                                            >
                                                {expandedRows[treatment.treatment_id] ? (
                                                    <KeyboardArrowUpIcon />
                                                ) : (
                                                    <KeyboardArrowDownIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{formatPatientName(treatment)}</TableCell>
                                        <TableCell>{treatment.hospital_number || 'N/A'}</TableCell>
                                        <TableCell>
                                            {treatment.treatment_date ? 
                                                format(new Date(treatment.treatment_date), 'MMM dd, yyyy') : 
                                                'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    ...styles.statusBadge,
                                                    backgroundColor:
                                                        treatment.treatment_status === 'completed' ? '#4caf50' :
                                                        treatment.treatment_status === 'in-progress' ? '#2196f3' :
                                                        treatment.treatment_status === 'scheduled' ? '#ff9800' :
                                                        '#f44336'
                                                }}
                                            >
                                                {treatment.treatment_status || 'N/A'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {treatment.in_solution ? `${treatment.in_solution.volume_in} mL` : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {treatment.out_solution ? `${treatment.out_solution.volume_out} mL` : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow sx={styles.expandedRow}>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                            <Collapse in={expandedRows[treatment.treatment_id]} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 1 }}>
                                                    <Typography variant="h6" gutterBottom component="div">
                                                        Treatment Details
                                                    </Typography>
                                                    <Table size="small" sx={styles.detailTable}>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell sx={styles.detailLabel}>Patient Name</TableCell>
                                                                <TableCell>{formatPatientName(treatment)}</TableCell>
                                                            </TableRow>
                                                            {/* Rest of your table rows remain the same */}
                                                            {/* ... */}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} sx={styles.noDataCell}>
                                    No treatments found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StaffPDTreatment;