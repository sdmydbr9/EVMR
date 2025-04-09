import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Typography,
    Chip,
    Grid,
    FormControl,
    InputLabel,
    Select,
    Tabs,
    Tab,
    IconButton,
    Tooltip,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { 
    CheckCircle as ApproveIcon, 
    Cancel as RejectIcon, 
    Event as ScheduleIcon,
    Notes as NotesIcon,
    Refresh as RefreshIcon 
} from '@mui/icons-material';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        doctorId: '',
        scheduledDate: null,
        status: 'pending',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
        fetchServiceTypes();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/services/appointments', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }
            
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setAlert({
                open: true,
                message: 'Error loading appointments: ' + error.message,
                severity: 'error'
            });
            
            // Provide mock data for development
            if (process.env.NODE_ENV === 'development') {
                setAppointments([
                    { 
                        _id: '1', 
                        patient: { _id: 'p1', firstName: 'John', lastName: 'Smith' },
                        serviceType: { _id: 's1', name: 'Check-up' },
                        requestedDate: new Date().toISOString(),
                        scheduledDate: null,
                        doctor: null,
                        status: 'pending',
                        notes: ''
                    },
                    { 
                        _id: '2', 
                        patient: { _id: 'p2', firstName: 'Jane', lastName: 'Doe' },
                        serviceType: { _id: 's2', name: 'Vaccination' },
                        requestedDate: new Date(Date.now() - 86400000).toISOString(), // yesterday
                        scheduledDate: new Date(Date.now() + 172800000).toISOString(), // in 2 days
                        doctor: { _id: 'd1', firstName: 'Robert', lastName: 'Johnson' },
                        status: 'approved',
                        notes: 'Standard vaccination appointment'
                    }
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await fetch('/api/users/doctors', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch doctors');
            }
            
            const data = await response.json();
            setDoctors(data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            setAlert({
                open: true,
                message: 'Error loading doctors: ' + error.message,
                severity: 'error'
            });
            
            // Provide mock data for development
            if (process.env.NODE_ENV === 'development') {
                setDoctors([
                    { _id: 'd1', firstName: 'Robert', lastName: 'Johnson', specialization: 'General' },
                    { _id: 'd2', firstName: 'Sarah', lastName: 'Williams', specialization: 'Surgery' },
                    { _id: 'd3', firstName: 'Michael', lastName: 'Brown', specialization: 'Dermatology' }
                ]);
            }
        }
    };

    const fetchServiceTypes = async () => {
        try {
            const response = await fetch('/api/services/types', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch service types');
            }
            
            const data = await response.json();
            setServiceTypes(data);
        } catch (error) {
            console.error('Error fetching service types:', error);
            setAlert({
                open: true,
                message: 'Error loading service types: ' + error.message,
                severity: 'error'
            });
        }
    };

    const handleOpenDialog = (appointment) => {
        setSelectedAppointment(appointment);
        setFormData({
            doctorId: appointment.doctor?._id || '',
            scheduledDate: appointment.scheduledDate ? new Date(appointment.scheduledDate) : null,
            status: appointment.status,
            notes: appointment.notes || ''
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedAppointment(null);
        setFormData({
            doctorId: '',
            scheduledDate: null,
            status: 'pending',
            notes: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const response = await fetch(`/api/services/appointments/${selectedAppointment._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update appointment');
            }
            
            setAlert({
                open: true,
                message: 'Appointment updated successfully',
                severity: 'success'
            });
            
            fetchAppointments();
            handleCloseDialog();
        } catch (error) {
            console.error('Error updating appointment:', error);
            setAlert({
                open: true,
                message: 'Error updating appointment: ' + error.message,
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = async (appointmentId, action) => {
        try {
            setIsLoading(true);
            let updateData = {};
            
            if (action === 'approve') {
                updateData = { status: 'approved' };
            } else if (action === 'reject') {
                updateData = { status: 'rejected' };
            }
            
            const response = await fetch(`/api/services/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${action} appointment`);
            }
            
            setAlert({
                open: true,
                message: `Appointment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
                severity: 'success'
            });
            
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment:', error);
            setAlert({
                open: true,
                message: `Error ${action === 'approve' ? 'approving' : 'rejecting'} appointment: ` + error.message,
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'warning',
            approved: 'success',
            rejected: 'error',
            completed: 'info',
            cancelled: 'default'
        };
        return colors[status] || 'default';
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    const handleCloseAlert = () => {
        setAlert({
            ...alert,
            open: false
        });
    };

    // Filter appointments based on tab
    const filteredAppointments = appointments.filter(appointment => {
        if (activeTab === 0) return true; // All appointments
        if (activeTab === 1) return appointment.status === 'pending'; // Pending
        if (activeTab === 2) return appointment.status === 'approved'; // Approved
        if (activeTab === 3) return appointment.status === 'completed'; // Completed
        if (activeTab === 4) return ['rejected', 'cancelled'].includes(appointment.status); // Rejected/Cancelled
        return true;
    });

    // Get service information
    const getServiceDetails = (serviceId) => {
        return serviceTypes.find(service => service._id === serviceId) || {};
    };

    return (
        <Box>
            <Snackbar 
                open={alert.open} 
                autoHideDuration={6000} 
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                    Appointment Management
                </Typography>
                <Button 
                    startIcon={<RefreshIcon />} 
                    onClick={fetchAppointments} 
                    disabled={isLoading}
                    variant="outlined"
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant="scrollable" 
                    scrollButtons="auto"
                >
                    <Tab label="All Appointments" />
                    <Tab label={`Pending (${appointments.filter(a => a.status === 'pending').length})`} />
                    <Tab label={`Approved (${appointments.filter(a => a.status === 'approved').length})`} />
                    <Tab label={`Completed (${appointments.filter(a => a.status === 'completed').length})`} />
                    <Tab label={`Rejected/Cancelled (${appointments.filter(a => ['rejected', 'cancelled'].includes(a.status)).length})`} />
                </Tabs>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Service</TableCell>
                                <TableCell>Requested Date</TableCell>
                                <TableCell>Doctor</TableCell>
                                <TableCell>Scheduled Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map((appointment) => (
                                    <TableRow key={appointment._id}>
                                        <TableCell>
                                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                                        </TableCell>
                                        <TableCell>{appointment.serviceType?.name}</TableCell>
                                        <TableCell>
                                            {new Date(appointment.requestedDate).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {appointment.doctor 
                                                ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                                                : 'Not assigned'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {appointment.scheduledDate 
                                                ? new Date(appointment.scheduledDate).toLocaleString()
                                                : 'Not scheduled'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={appointment.status}
                                                color={getStatusColor(appointment.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex' }}>
                                                {appointment.status === 'pending' && (
                                                    <>
                                                        <Tooltip title="Approve">
                                                            <IconButton 
                                                                size="small" 
                                                                color="success"
                                                                onClick={() => handleQuickAction(appointment._id, 'approve')}
                                                                disabled={isLoading}
                                                            >
                                                                <ApproveIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Reject">
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => handleQuickAction(appointment._id, 'reject')}
                                                                disabled={isLoading}
                                                            >
                                                                <RejectIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                <Tooltip title="Manage Details">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenDialog(appointment)}
                                                        disabled={isLoading}
                                                    >
                                                        <ScheduleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No appointments found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Manage Appointment</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Patient: {selectedAppointment?.patient?.firstName} {selectedAppointment?.patient?.lastName}
                                </Typography>
                                <Typography variant="subtitle2" gutterBottom>
                                    Service: {selectedAppointment?.serviceType?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Requested: {selectedAppointment ? new Date(selectedAppointment.requestedDate).toLocaleString() : ''}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="status-select-label">Status</InputLabel>
                                    <Select
                                        labelId="status-select-label"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        label="Status"
                                    >
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="doctor-select-label">Assign Doctor</InputLabel>
                                    <Select
                                        labelId="doctor-select-label"
                                        value={formData.doctorId}
                                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                        label="Assign Doctor"
                                    >
                                        <MenuItem value="">Not Assigned</MenuItem>
                                        {doctors.map((doctor) => (
                                            <MenuItem key={doctor._id} value={doctor._id}>
                                                {doctor.firstName} {doctor.lastName}
                                                {doctor.specialization && ` (${doctor.specialization})`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DateTimePicker
                                        label="Schedule Date & Time"
                                        value={formData.scheduledDate}
                                        onChange={(newValue) => setFormData({ ...formData, scheduledDate: newValue })}
                                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    margin="normal"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={isLoading}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Update Appointment'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppointmentManagement; 