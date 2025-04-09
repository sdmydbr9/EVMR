import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, 
  TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Snackbar, Alert, CircularProgress, Divider, ListItemIcon,
  Card, CardContent, Chip, Stack, IconButton, Tooltip,
  Zoom, Fade, FormHelperText
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

// Updated styled components with iOS styling
const StyledCard = styled(Card)(({ theme, type }) => ({
  height: '300px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
  },
}));

const TimeSlot = styled(Box)(({ theme, status }) => ({
  padding: theme.spacing(2.5),
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  backgroundColor: 
    status === 'completed' ? '#34C759' : // iOS green
    status === 'cancelled' ? '#FF3B30' : // iOS red
    status === 'confirmed' ? '#5AC8FA' : // iOS blue
    status === 'no-show' ? '#FF9500' : // iOS orange
    '#007AFF', // iOS primary blue
  color: '#fff',
  marginBottom: 0,
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  backdropFilter: 'blur(5px)',
}));

// Updated styled components for list view
const AppointmentTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

// Updated styled components for the table cell alignment
const StyledTableHeadCell = styled(TableCell)(({ theme, align = 'left', width }) => ({
  padding: '12px 16px',
  borderBottom: '1px solid rgba(224, 224, 224, 0.8)',
  backgroundColor: 'rgba(248, 248, 250, 0.9)',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#1D1D1F',
  textAlign: align,
  whiteSpace: 'nowrap',
  width: width,
  boxSizing: 'border-box',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}));

const StyledTableCell = styled(TableCell)(({ theme, align = 'left', width }) => ({
  padding: '12px 16px',
  borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
  whiteSpace: 'nowrap',
  fontSize: '0.875rem',
  textAlign: align,
  width: width,
  boxSizing: 'border-box',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}));

const AppointmentRow = styled(TableRow)(({ theme, status }) => ({
  transition: 'background-color 0.2s ease',
  position: 'relative',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    backgroundColor: 
      status === 'completed' ? '#34C759' : // iOS green
      status === 'cancelled' ? '#FF3B30' : // iOS red
      status === 'confirmed' ? '#5AC8FA' : // iOS blue
      status === 'no-show' ? '#FF9500' : // iOS orange
      '#007AFF', // iOS primary blue
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 500,
  borderRadius: '8px',
  height: 24,
  backgroundColor: 
    status === 'completed' ? 'rgba(52, 199, 89, 0.15)' : 
    status === 'cancelled' ? 'rgba(255, 59, 48, 0.15)' : 
    status === 'confirmed' ? 'rgba(90, 200, 250, 0.15)' : 
    status === 'no-show' ? 'rgba(255, 149, 0, 0.15)' : 
    'rgba(0, 122, 255, 0.15)',
  color: 
    status === 'completed' ? '#34C759' : 
    status === 'cancelled' ? '#FF3B30' : 
    status === 'confirmed' ? '#5AC8FA' : 
    status === 'no-show' ? '#FF9500' : 
    '#007AFF',
  '& .MuiChip-label': {
    px: 1,
  }
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
  
  // Add formErrors state for validation
  const [formErrors, setFormErrors] = useState({});

  // Add patient form errors state
  const [patientFormErrors, setPatientFormErrors] = useState({});
  
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
    setFormErrors({});
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
    setFormErrors({});
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
  
  // Handle form date change in form - fixed to preserve time when date changes
  const handleFormDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate,
      // Don't reset the time when date changes
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
  
  // Validate appointment form
  const validateAppointmentForm = () => {
    const errors = {};
    
    if (!formData.patientId) {
      errors.patientId = 'Please select a patient';
    }
    
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    
    if (!formData.time) {
      errors.time = 'Please select a time';
    }
    
    if (!formData.type) {
      errors.type = 'Please select an appointment type';
    }
    
    if (!formData.status) {
      errors.status = 'Please select a status';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      errors.duration = 'Please select a valid duration';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission - updated with validation and timezone handling
  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateAppointmentForm()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Ensure we have valid date and time
      if (!formData.date || !formData.time) {
        showNotification('Please select both date and time', 'error');
        return;
      }

      // Create a date string from the selected date
      const dateStr = format(formData.date, 'yyyy-MM-dd');
      
      // Extract hours and minutes from the time string
      const [hours, minutes] = formData.time.split(':').map(Number);
      
      // Create a date object with the selected date and time
      const appointmentDate = new Date(formData.date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Format the time in ISO format to preserve the timezone information
      const isoTimeString = appointmentDate.toISOString();
      
      // Format data for API in the correct format expected by the backend
      const formattedData = {
        patientId: formData.patientId,
        date: dateStr,
        time: formData.time,
        duration: parseInt(formData.duration),
        type: formData.type,
        notes: formData.notes,
        status: formData.status,
        // Add timezone offset in minutes to help the backend adjust properly
        timezoneOffset: appointmentDate.getTimezoneOffset()
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
      let errorMessage = 'An unknown error occurred';
      
      if (error.response && error.response.data) {
        // Handle different error formats
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          errorMessage = error.response.data.errors[0].msg;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(
        formMode === 'create'
          ? `Error creating appointment: ${errorMessage}`
          : `Error updating appointment: ${errorMessage}`,
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
    setPatientFormErrors({});
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

  // Validate patient form
  const validatePatientForm = () => {
    const errors = {};
    
    if (!patientFormData.name || patientFormData.name.trim() === '') {
      errors.name = 'Pet name is required';
    }
    
    if (!patientFormData.species) {
      errors.species = 'Species is required';
    }
    
    if (!patientFormData.gender) {
      errors.gender = 'Gender is required';
    }
    
    if (!patientFormData.owner.name || patientFormData.owner.name.trim() === '') {
      errors['owner.name'] = 'Owner name is required';
    }
    
    if (!patientFormData.owner.phone || patientFormData.owner.phone.trim() === '') {
      errors['owner.phone'] = 'Owner phone is required';
    }
    
    setPatientFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle patient form submission - updated with validation
  const handlePatientSubmit = async () => {
    // Validate form before submission
    if (!validatePatientForm()) {
      showNotification('Please fill in all required fields for the patient', 'error');
      return;
    }
    
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
      
      // Reset patient form data and errors
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
      setPatientFormErrors({});
    } catch (error) {
      console.error('Error creating patient:', error);
      let errorMessage = 'An unknown error occurred';
      
      if (error.response && error.response.data) {
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          errorMessage = error.response.data.errors[0].msg;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(`Error creating patient: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Get appointment type icon and color - updated with iOS colors
  const getAppointmentTypeInfo = (type) => {
    switch (type) {
      case 'check-up':
        return { color: 'primary', icon: <ScheduleIcon />, bgColor: '#007AFF' };
      case 'vaccination':
        return { color: 'success', icon: <ScheduleIcon />, bgColor: '#34C759' };
      case 'surgery':
        return { color: 'error', icon: <ScheduleIcon />, bgColor: '#FF3B30' };
      case 'emergency':
        return { color: 'warning', icon: <ScheduleIcon />, bgColor: '#FF9500' };
      case 'follow-up':
        return { color: 'info', icon: <ScheduleIcon />, bgColor: '#5AC8FA' };
      default:
        return { color: 'default', icon: <ScheduleIcon />, bgColor: '#8E8E93' };
    }
  };

  // Get status color - updated with iOS colors
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

  // Updated function to adjust for timezone differences when displaying times
  const formatLocalTime = (dateTimeString) => {
    // Parse the ISO date string
    const dateObj = new Date(dateTimeString);
    
    try {
      // Format with explicit IST option if available in the browser
      return new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      }).format(dateObj);
    } catch (e) {
      // Fallback to normal format if Intl API fails
      return format(dateObj, 'HH:mm');
    }
  };

  // New grid-based table layout
  const GridTable = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }));

  const GridTableHeader = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '15% 25% 15% 15% 15% 15%',
    backgroundColor: 'rgba(248, 248, 250, 0.9)',
    borderBottom: '1px solid rgba(224, 224, 224, 0.8)',
    fontWeight: 600,
    padding: '12px 0',
  }));

  const GridTableRow = styled(Box)(({ theme, status }) => ({
    display: 'grid',
    gridTemplateColumns: '15% 25% 15% 15% 15% 15%',
    borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
    transition: 'background-color 0.2s ease',
    position: 'relative',
    padding: '12px 0',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      backgroundColor: 
        status === 'completed' ? '#34C759' : // iOS green
        status === 'cancelled' ? '#FF3B30' : // iOS red
        status === 'confirmed' ? '#5AC8FA' : // iOS blue
        status === 'no-show' ? '#FF9500' : // iOS orange
        '#007AFF', // iOS primary blue
    },
    backgroundColor: ({ index }) => 
      index % 2 === 0 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(248, 248, 248, 0.7)',
  }));

  const GridTableCell = styled(Box)(({ theme, align = 'left' }) => ({
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    textAlign: align,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    justifyContent: align === 'center' ? 'center' : 'flex-start',
  }));

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100%'
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
        p: { xs: 1, sm: 2, md: 3 }, 
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        width: '100%'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, width: '100%' }}>
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
        
        <Paper sx={{ p: 2, width: '100%' }}>
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
        p: { xs: 0, sm: 0, md: 0 },
        backgroundColor: (theme) => theme.palette.grey[100],
        width: '100%',
        maxWidth: '100%'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Fade in timeout={500}>
            <AppointmentTableContainer sx={{ width: '100%', borderRadius: 0, height: '100%' }}>
              {appointments && appointments.length > 0 ? (
                <Box sx={{ maxHeight: 'calc(100vh - 240px)', overflow: 'auto', width: '100%' }}>
                  <GridTable>
                    <GridTableHeader>
                      <GridTableCell>
                        <Typography variant="subtitle2">Time</Typography>
                      </GridTableCell>
                      <GridTableCell>
                        <Typography variant="subtitle2">Patient</Typography>
                      </GridTableCell>
                      <GridTableCell>
                        <Typography variant="subtitle2">Type</Typography>
                      </GridTableCell>
                      <GridTableCell>
                        <Typography variant="subtitle2">Duration</Typography>
                      </GridTableCell>
                      <GridTableCell>
                        <Typography variant="subtitle2">Status</Typography>
                      </GridTableCell>
                      <GridTableCell align="center">
                        <Typography variant="subtitle2">Actions</Typography>
                      </GridTableCell>
                    </GridTableHeader>
                    
                    {appointments.map((appointment, index) => (
                      <GridTableRow key={appointment.id} status={appointment.status} index={index}>
                        <GridTableCell>
                          <TimeIcon sx={{ 
                            fontSize: 18, 
                            color: getAppointmentTypeInfo(appointment.appointment_type).bgColor,
                            mr: 1
                          }} />
                          <Typography variant="body2">
                            {formatLocalTime(appointment.start_time)}
                          </Typography>
                        </GridTableCell>
                        
                        <GridTableCell>
                          <PetsIcon sx={{ 
                            fontSize: 18, 
                            color: getAppointmentTypeInfo(appointment.appointment_type).bgColor,
                            mr: 1
                          }} />
                          <Typography variant="body2" noWrap>
                            {appointment.patient_name}
                          </Typography>
                        </GridTableCell>
                        
                        <GridTableCell>
                          <Typography variant="body2">
                            {appointment.appointment_type}
                          </Typography>
                        </GridTableCell>
                        
                        <GridTableCell>
                          <Typography variant="body2">
                            {Math.round((new Date(appointment.end_time) - new Date(appointment.start_time)) / 60000)} min
                          </Typography>
                        </GridTableCell>
                        
                        <GridTableCell>
                          <StatusChip 
                            label={appointment.status}
                            status={appointment.status}
                            size="small"
                          />
                        </GridTableCell>
                        
                        <GridTableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Edit Appointment">
                              <IconButton 
                                onClick={() => handleEditAppointment(appointment)}
                                size="small"
                                sx={{ 
                                  color: '#007AFF',
                                  backgroundColor: 'rgba(0, 122, 255, 0.1)',
                                  width: 30,
                                  height: 30,
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 122, 255, 0.2)',
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Appointment">
                              <IconButton 
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                size="small"
                                sx={{ 
                                  color: '#FF3B30',
                                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                                  width: 30,
                                  height: 30,
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 59, 48, 0.2)',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </GridTableCell>
                      </GridTableRow>
                    ))}
                  </GridTable>
                </Box>
              ) : (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No appointments scheduled for this date
                  </Typography>
                </Box>
              )}
            </AppointmentTableContainer>
          </Fade>
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
              <FormControl fullWidth error={!!formErrors.patientId}>
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
                {formErrors.patientId && <FormHelperText>{formErrors.patientId}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleFormDateChange}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      error: !!formErrors.date,
                      helperText: formErrors.date
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.time}>
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
                {formErrors.time && <FormHelperText>{formErrors.time}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.duration}>
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
                {formErrors.duration && <FormHelperText>{formErrors.duration}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.type}>
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
                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.status}>
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
                {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
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

      {/* Patient Creation Dialog - updated with form validation */}
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
                error={!!patientFormErrors.name}
                helperText={patientFormErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!patientFormErrors.species}>
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
                {patientFormErrors.species && <FormHelperText>{patientFormErrors.species}</FormHelperText>}
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
              <FormControl fullWidth required error={!!patientFormErrors.gender}>
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
                {patientFormErrors.gender && <FormHelperText>{patientFormErrors.gender}</FormHelperText>}
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
                error={!!patientFormErrors['owner.name']}
                helperText={patientFormErrors['owner.name']}
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
                error={!!patientFormErrors['owner.phone']}
                helperText={patientFormErrors['owner.phone']}
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