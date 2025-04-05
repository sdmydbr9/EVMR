import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, 
  TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Snackbar, Alert, CircularProgress, Divider, ListItemIcon,
  Card, CardContent, Chip, Stack, IconButton, Tooltip,
  Zoom, Fade
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Pets as PetsIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Timer as DurationIcon,
  Notes as NotesIcon,
  CheckCircle as StatusIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { alpha } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme, type }) => ({
  height: '300px', // Fixed height for square appearance
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  backgroundColor: 
    type === 'check-up' ? alpha(theme.palette.primary.light, 0.1) :
    type === 'vaccination' ? alpha(theme.palette.success.light, 0.1) :
    type === 'surgery' ? alpha(theme.palette.error.light, 0.1) :
    type === 'emergency' ? alpha(theme.palette.warning.light, 0.1) :
    type === 'follow-up' ? alpha(theme.palette.info.light, 0.1) :
    'inherit',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const TimeSlot = styled(Box)(({ theme, status }) => ({
  padding: theme.spacing(3),
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  backgroundColor: 
    status === 'completed' ? theme.palette.success.main :
    status === 'cancelled' ? theme.palette.error.main :
    status === 'confirmed' ? theme.palette.info.main :
    status === 'no-show' ? theme.palette.warning.main :
    theme.palette.primary.main,
  color: '#fff',
  marginBottom: 0,
  transition: 'all 0.3s ease',
}));

// Appointment service for API calls
const appointmentService = {
  getAppointments: async (params) => {
    try {
      const response = await axios.get('/api/appointments', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
  
  getAppointmentById: async (id) => {
    try {
      const response = await axios.get(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },
  
  createAppointment: async (appointmentData) => {
    try {
      const response = await axios.post('/api/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },
  
  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await axios.put(`/api/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },
  
  deleteAppointment: async (id) => {
    try {
      const response = await axios.delete(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  }
};

// Patient service for API calls
const patientService = {
  getPatients: async () => {
    try {
      const response = await axios.get('/api/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },
  
  createPatient: async (patientData) => {
    try {
      const response = await axios.post('/api/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
};

// Add these constants at the top after imports
const WORKING_HOURS = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};

const TIME_SLOT_DURATION = 15; // 15 minutes per slot

// Add these utility functions before the AppointmentDashboard component
const generateTimeSlots = (date) => {
  const slots = [];
  const startTime = new Date(date);
  startTime.setHours(WORKING_HOURS.start, 0, 0, 0);
  const endTime = new Date(date);
  endTime.setHours(WORKING_HOURS.end, 0, 0, 0);

  while (startTime < endTime) {
    slots.push(format(startTime, 'HH:mm'));
    startTime.setMinutes(startTime.getMinutes() + TIME_SLOT_DURATION);
  }
  return slots;
};

const isSlotAvailable = (slot, date, appointments, duration) => {
  const [hours, minutes] = slot.split(':').map(Number);
  const startTime = new Date(date);
  startTime.setHours(hours, minutes, 0, 0);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + duration);

  return !appointments.some(appointment => {
    const appointmentStart = new Date(appointment.start_time);
    const appointmentEnd = new Date(appointment.end_time);
    return (
      (startTime >= appointmentStart && startTime < appointmentEnd) ||
      (endTime > appointmentStart && endTime <= appointmentEnd) ||
      (startTime <= appointmentStart && endTime >= appointmentEnd)
    );
  });
};

const getAvailableSlots = (date, appointments, duration) => {
  const allSlots = generateTimeSlots(date);
  return allSlots.filter(slot => isSlotAvailable(slot, date, appointments, duration));
};

const AppointmentDashboard = () => {
  // State for appointment list and filtering
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State for patient options
  const [patientOptions, setPatientOptions] = useState([]);
  
  // State for appointment form
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: new Date(),
    time: '09:00',
    duration: 30,
    type: 'check-up',
    notes: '',
    status: 'scheduled'
  });
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Add new state for patient creation
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    color: '',
    weight: '',
    microchipId: '',
    owner: {
      name: '',
      phone: '',
      email: '',
      address: ''
    }
  });
  
  // Add this state to update available slots
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);
  
  // Load appointments on component mount and when date changes
  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);
  
  // Add this effect to update available slots when appointments or form data changes
  useEffect(() => {
    if (formData.date && formData.duration) {
      const slots = getAvailableSlots(formData.date, appointments, formData.duration);
      setAvailableSlots(slots);
    }
  }, [formData.date, formData.duration, appointments]);
  
  // Fetch patients for the dropdown
  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatientOptions(data.patients.map(patient => ({
        id: patient.id,
        name: `${patient.name} (${patient.species})`
      })));
    } catch (error) {
      showNotification('Error loading patients', 'error');
    }
  };
  
  // Fetch appointments for the selected date
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      const data = await appointmentService.getAppointments(params);
      setAppointments(data.appointments);
    } catch (error) {
      showNotification('Error loading appointments', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };
  
  // Open form dialog for creating a new appointment
  const handleAddAppointment = () => {
    setFormMode('create');
    setFormData({
      patientId: '',
      patientName: '',
      date: selectedDate,
      time: '09:00',
      duration: 30,
      type: 'check-up',
      notes: '',
      status: 'scheduled'
    });
    setOpen(true);
  };
  
  // Open form dialog for editing an existing appointment
  const handleEditAppointment = (appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      patientId: appointment.patient_id,
      patientName: appointment.patient_name,
      date: new Date(appointment.start_time),
      time: format(new Date(appointment.start_time), 'HH:mm'),
      duration: Math.round((new Date(appointment.end_time) - new Date(appointment.start_time)) / 60000),
      type: appointment.appointment_type,
      notes: appointment.notes || '',
      status: appointment.status
    });
    setFormMode('edit');
    setOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Recalculate available slots when duration changes
    if (name === 'duration') {
      const slots = getAvailableSlots(formData.date, appointments, parseInt(value));
      setAvailableSlots(slots);
    }
  };
  
  // Handle date field change in form
  const handleFormDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate,
      time: '09:00' // Reset time when date changes
    });
  };
  
  // Handle patient selection
  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    const selectedPatient = patientOptions.find(p => p.id === patientId);
    
    setFormData({
      ...formData,
      patientId,
      patientName: selectedPatient ? selectedPatient.name : ''
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Ensure we have valid date and time
      if (!formData.date || !formData.time) {
        showNotification('Please select both date and time', 'error');
        return;
      }

      // Create a new Date object from the selected date
      const startTime = new Date(formData.date);
      
      // Parse the time string and set hours and minutes
      const [hours, minutes] = formData.time.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
      
      // Create end time by adding duration
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(formData.duration));
      
      // Format data for API
      const formattedData = {
        patient_id: formData.patientId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: parseInt(formData.duration),
        appointment_type: formData.type,
        notes: formData.notes,
        status: formData.status,
        vet_id: 1 // Assuming vet_id is 1 for now
      };
      
      if (formMode === 'create') {
        await appointmentService.createAppointment(formattedData);
        showNotification('Appointment created successfully', 'success');
      } else {
        await appointmentService.updateAppointment(currentAppointment.id, formattedData);
        showNotification('Appointment updated successfully', 'success');
      }
      
      setOpen(false);
      fetchAppointments(); // Refresh the appointments list
    } catch (error) {
      console.error('Error submitting appointment:', error);
      showNotification(
        formMode === 'create'
          ? 'Error creating appointment'
          : 'Error updating appointment',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Handle appointment deletion
  const handleDeleteAppointment = async (id) => {
    try {
      setLoading(true);
      await appointmentService.deleteAppointment(id);
      showNotification('Appointment deleted successfully', 'success');
      fetchAppointments(); // Refresh the appointments list
    } catch (error) {
      showNotification('Error deleting appointment', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Handle opening patient creation dialog
  const handleAddNewPatient = () => {
    setPatientDialogOpen(true);
  };

  // Handle patient form input changes
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('owner.')) {
      const ownerField = name.split('.')[1];
      setPatientFormData({
        ...patientFormData,
        owner: {
          ...patientFormData.owner,
          [ownerField]: value
        }
      });
    } else {
      setPatientFormData({
        ...patientFormData,
        [name]: value
      });
    }
  };

  // Handle patient form submission
  const handlePatientSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare the data for submission
      const submitData = {
        ...patientFormData,
        date_of_birth: patientFormData.dateOfBirth,
        microchip_id: patientFormData.microchipId,
        owner_name: patientFormData.owner.name,
        owner_phone: patientFormData.owner.phone,
        owner_email: patientFormData.owner.email,
        owner_address: patientFormData.owner.address
      };
      
      const response = await patientService.createPatient(submitData);
      showNotification('Patient created successfully', 'success');
      
      // Update patient options and select the new patient
      await fetchPatients();
      
      // Get the newly created patient from the response
      const newPatient = response; // The response is the patient object directly
      setFormData({
        ...formData,
        patientId: newPatient.id,
        patientName: `${newPatient.name} (${newPatient.species})`
      });
      
      setPatientDialogOpen(false);
      
      // Reset patient form data
      setPatientFormData({
        name: '',
        species: '',
        breed: '',
        dateOfBirth: '',
        gender: '',
        color: '',
        weight: '',
        microchipId: '',
        owner: {
          name: '',
          phone: '',
          email: '',
          address: ''
        }
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      showNotification('Error creating patient', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Get appointment type icon and color
  const getAppointmentTypeInfo = (type) => {
    switch (type) {
      case 'check-up':
        return { color: 'primary', icon: <ScheduleIcon /> };
      case 'vaccination':
        return { color: 'success', icon: <ScheduleIcon /> };
      case 'surgery':
        return { color: 'error', icon: <ScheduleIcon /> };
      case 'emergency':
        return { color: 'warning', icon: <ScheduleIcon /> };
      case 'follow-up':
        return { color: 'info', icon: <ScheduleIcon /> };
      default:
        return { color: 'default', icon: <ScheduleIcon /> };
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'confirmed': return 'info';
      case 'no-show': return 'warning';
      default: return 'primary';
    }
  };

  // Navigate to previous/next day
  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Box sx={{ 
        p: 3, 
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarIcon sx={{ fontSize: 40 }} />
            Appointments
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddAppointment}
            startIcon={<AddIcon />}
            size="large"
          >
            New Appointment
          </Button>
        </Box>
        
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <IconButton onClick={handlePrevDay} size="large">
                <PrevIcon />
              </IconButton>
            </Grid>
            <Grid item xs>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true, size: 'large' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item>
              <IconButton onClick={handleNextDay} size="large">
                <NextIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        p: 3,
        backgroundColor: (theme) => theme.palette.grey[100]
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Zoom in key={appointment.id} style={{ transitionDelay: '100ms' }}>
                  <Grid item xs={12} md={6} lg={4}>
                    <StyledCard type={appointment.appointment_type}>
                      <TimeSlot status={appointment.status}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <TimeIcon sx={{ fontSize: 30 }} />
                          <Typography variant="h4">
                            {format(new Date(appointment.start_time), 'HH:mm')}
                          </Typography>
                        </Stack>
                      </TimeSlot>
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={3} sx={{ height: '100%' }}>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                              <PetsIcon sx={{ fontSize: 28 }} />
                              <Typography variant="h5" noWrap>
                                {appointment.patient_name}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                              <Chip 
                                icon={getAppointmentTypeInfo(appointment.appointment_type).icon}
                                label={appointment.appointment_type}
                                color={getAppointmentTypeInfo(appointment.appointment_type).color}
                                size="medium"
                              />
                              <Chip 
                                icon={<DurationIcon />}
                                label={`${Math.round((new Date(appointment.end_time) - new Date(appointment.start_time)) / 60000)} min`}
                                variant="outlined"
                                size="medium"
                              />
                              <Chip 
                                icon={<StatusIcon />}
                                label={appointment.status}
                                color={getStatusColor(appointment.status)}
                                size="medium"
                              />
                            </Stack>
                          </Box>
                          {appointment.notes && (
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography 
                                variant="body1" 
                                color="text.secondary" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  gap: 1,
                                  mt: 2
                                }}
                              >
                                <NotesIcon fontSize="small" sx={{ mt: 0.5 }} />
                                {appointment.notes}
                              </Typography>
                            </Box>
                          )}
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Edit Appointment">
                              <IconButton 
                                onClick={() => handleEditAppointment(appointment)}
                                color="primary"
                                size="large"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Appointment">
                              <IconButton 
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                color="error"
                                size="large"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                </Zoom>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No appointments scheduled for this date
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
      
      {/* Appointment Form Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="appointment-dialog-title"
        aria-describedby="appointment-dialog-description"
        disablePortal
        keepMounted
      >
        <DialogTitle id="appointment-dialog-title">
          {formMode === 'create' ? 'Schedule New Appointment' : 'Edit Appointment'}
        </DialogTitle>
        <DialogContent id="appointment-dialog-description">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="patient-label">Patient</InputLabel>
                <Select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handlePatientChange}
                  label="Patient"
                  labelId="patient-label"
                >
                  <MenuItem value="" sx={{ color: 'text.secondary' }}>
                    Select a patient
                  </MenuItem>
                  <MenuItem 
                    value="new"
                    onClick={handleAddNewPatient}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'medium'
                    }}
                  >
                    <ListItemIcon>
                      <AddIcon color="primary" />
                    </ListItemIcon>
                    Add New Patient
                  </MenuItem>
                  <Divider />
                  {patientOptions.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleFormDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="time-label">Time</InputLabel>
                <Select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  label="Time"
                  labelId="time-label"
                >
                  {availableSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="duration-label">Duration</InputLabel>
                <Select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  label="Duration"
                  labelId="duration-label"
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                  labelId="type-label"
                >
                  <MenuItem value="check-up">Check-up</MenuItem>
                  <MenuItem value="vaccination">Vaccination</MenuItem>
                  <MenuItem value="surgery">Surgery</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="follow-up">Follow-up</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                  labelId="status-label"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)}
            aria-label="Cancel appointment"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
            aria-label={formMode === 'create' ? 'Create appointment' : 'Save appointment changes'}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Patient Creation Dialog */}
      <Dialog 
        open={patientDialogOpen} 
        onClose={() => setPatientDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Patient</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Pet Name"
                value={patientFormData.name}
                onChange={handlePatientInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Species</InputLabel>
                <Select
                  name="species"
                  value={patientFormData.species}
                  onChange={handlePatientInputChange}
                  label="Species"
                >
                  <MenuItem value="dog">Dog</MenuItem>
                  <MenuItem value="cat">Cat</MenuItem>
                  <MenuItem value="bird">Bird</MenuItem>
                  <MenuItem value="rabbit">Rabbit</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="breed"
                label="Breed"
                value={patientFormData.breed}
                onChange={handlePatientInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={patientFormData.gender}
                  onChange={handlePatientInputChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="unknown">Unknown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={patientFormData.dateOfBirth}
                onChange={handlePatientInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="weight"
                label="Weight (kg)"
                type="number"
                value={patientFormData.weight}
                onChange={handlePatientInputChange}
                fullWidth
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="microchipId"
                label="Microchip ID"
                value={patientFormData.microchipId}
                onChange={handlePatientInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Owner Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="owner.name"
                label="Owner Name"
                value={patientFormData.owner.name}
                onChange={handlePatientInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="owner.phone"
                label="Phone Number"
                value={patientFormData.owner.phone}
                onChange={handlePatientInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="owner.email"
                label="Email"
                type="email"
                value={patientFormData.owner.email}
                onChange={handlePatientInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="owner.address"
                label="Address"
                value={patientFormData.owner.address}
                onChange={handlePatientInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPatientDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePatientSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentDashboard; 