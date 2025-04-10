import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Today as TodayIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  ViewModule as MonthViewIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon
} from '@mui/icons-material';

// Calendar components
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [calendarView, setCalendarView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Try to fetch from API
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.map(appt => ({
          ...appt,
          start: new Date(appt.start),
          end: new Date(appt.end)
        })));
      } else {
        // Use mock data if API fails
        const mockAppointments = generateMockAppointments();
        setAppointments(mockAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Use mock data if API fails
      const mockAppointments = generateMockAppointments();
      setAppointments(mockAppointments);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Try to fetch from API
      const response = await fetch('/api/doctors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else {
        // Use mock data if API fails
        const mockDoctors = generateMockDoctors();
        setDoctors(mockDoctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Use mock data if API fails
      const mockDoctors = generateMockDoctors();
      setDoctors(mockDoctors);
    }
  };

  const generateMockAppointments = () => {
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
    const titles = ['Check-up', 'Vaccination', 'Surgery', 'Dental Cleaning', 'Follow-up'];
    
    // Generate appointments for the next 30 days
    const mockAppointments = [];
    const startDate = new Date();
    
    for (let i = 0; i < 100; i++) {
      const appointmentDate = new Date(startDate);
      appointmentDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
      appointmentDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 4) * 15, 0);
      
      const endDate = new Date(appointmentDate);
      endDate.setMinutes(appointmentDate.getMinutes() + 30 + Math.floor(Math.random() * 4) * 15);
      
      mockAppointments.push({
        id: i + 1,
        title: titles[Math.floor(Math.random() * titles.length)],
        patientId: Math.floor(Math.random() * 20) + 1,
        patientName: `Pet ${Math.floor(Math.random() * 20) + 1}`,
        doctorId: Math.floor(Math.random() * 5) + 1,
        doctorName: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`,
        serviceId: Math.floor(Math.random() * 5) + 1,
        serviceName: titles[Math.floor(Math.random() * titles.length)],
        start: appointmentDate,
        end: endDate,
        notes: 'Regular appointment',
        status: statuses[Math.floor(Math.random() * statuses.length)]
      });
    }
    
    return mockAppointments;
  };

  const generateMockDoctors = () => {
    return [
      { id: 1, name: 'Dr. Smith', specialization: 'General Practice' },
      { id: 2, name: 'Dr. Johnson', specialization: 'Surgery' },
      { id: 3, name: 'Dr. Williams', specialization: 'Dermatology' },
      { id: 4, name: 'Dr. Brown', specialization: 'Cardiology' },
      { id: 5, name: 'Dr. Jones', specialization: 'Neurology' }
    ];
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = (id) => {
    const updatedAppointments = appointments.filter(appt => appt.id !== id);
    setAppointments(updatedAppointments);
    
    setAlert({
      open: true,
      message: 'Appointment deleted successfully',
      severity: 'success'
    });
    
    handleCloseDialog();
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  const getStatusChip = (status) => {
    let color;
    switch(status) {
      case 'scheduled':
        color = 'primary';
        break;
      case 'confirmed':
        color = 'success';
        break;
      case 'completed':
        color = 'info';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        size="small" 
        color={color}
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  const filteredAppointments = selectedDoctor === 'all'
    ? appointments
    : appointments.filter(appt => appt.doctorId.toString() === selectedDoctor);

  const eventStyleGetter = (event) => {
    let backgroundColor;
    switch(event.status) {
      case 'scheduled':
        backgroundColor = '#3788d8';
        break;
      case 'confirmed':
        backgroundColor = '#2e7d32';
        break;
      case 'completed':
        backgroundColor = '#0288d1';
        break;
      case 'cancelled':
        backgroundColor = '#d32f2f';
        break;
      default:
        backgroundColor = '#757575';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Box sx={{ p: 3 }}>
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Appointment Calendar
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => window.location.href = '/app/appointments-scheduling'}
          sx={{ borderRadius: 2 }}
        >
          Schedule Appointment
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                label="Doctor"
                onChange={handleDoctorChange}
              >
                <MenuItem value="all">All Doctors</MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={() => handleViewChange('day')} color={calendarView === 'day' ? 'primary' : 'default'}>
                <DayViewIcon />
              </IconButton>
              <IconButton onClick={() => handleViewChange('week')} color={calendarView === 'week' ? 'primary' : 'default'}>
                <WeekViewIcon />
              </IconButton>
              <IconButton onClick={() => handleViewChange('month')} color={calendarView === 'month' ? 'primary' : 'default'}>
                <MonthViewIcon />
              </IconButton>
              <IconButton onClick={() => handleDateChange(new Date())}>
                <TodayIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ height: 'calc(100vh - 250px)', p: 2, borderRadius: 2 }}>
        <Calendar
          localizer={localizer}
          events={filteredAppointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['day', 'week', 'month', 'agenda']}
          view={calendarView}
          date={selectedDate}
          onNavigate={handleDateChange}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          tooltipAccessor={(event) => `${event.patientName} - ${event.doctorName}`}
          popup
          components={{
            event: (props) => (
              <Tooltip title={`${props.event.patientName} - ${props.event.serviceName}`}>
                <div>{props.title}</div>
              </Tooltip>
            )
          }}
        />
      </Paper>
      
      {/* Appointment Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedAppointment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                Appointment Details
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedAppointment.title || selectedAppointment.serviceName}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {getStatusChip(selectedAppointment.status)}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1">
                    {moment(selectedAppointment.start).format('MMMM DD, YYYY')}
                  </Typography>
                  <Typography variant="body2">
                    {moment(selectedAppointment.start).format('h:mm A')} - {moment(selectedAppointment.end).format('h:mm A')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {moment(selectedAppointment.end).diff(moment(selectedAppointment.start), 'minutes')} minutes
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Patient
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.patientName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.doctorName}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Service
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.serviceName}
                  </Typography>
                </Grid>
                
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedAppointment.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => handleDeleteAppointment(selectedAppointment.id)} 
                color="error" 
                variant="outlined"
                sx={{ borderRadius: 2, mr: 'auto' }}
              >
                Delete
              </Button>
              <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2 }}>
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  handleCloseDialog();
                  window.location.href = '/app/appointments-scheduling';
                }}
                sx={{ borderRadius: 2 }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AppointmentCalendar;
