import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  ViewModule as MonthViewIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Pets as PetsIcon
} from '@mui/icons-material';

// Calendar components
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AppointmentScheduling = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [viewMode, setViewMode] = useState(0); // 0: Calendar, 1: List
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    patientId: '',
    doctorId: '',
    serviceId: '',
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1)),
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
    fetchServices();
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

  const fetchPatients = async () => {
    try {
      // Try to fetch from API
      const response = await fetch('/api/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        // Use mock data if API fails
        const mockPatients = generateMockPatients();
        setPatients(mockPatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Use mock data if API fails
      const mockPatients = generateMockPatients();
      setPatients(mockPatients);
    }
  };

  const fetchServices = async () => {
    try {
      // Try to fetch from API
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        // Use mock data if API fails
        const mockServices = generateMockServices();
        setServices(mockServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Use mock data if API fails
      const mockServices = generateMockServices();
      setServices(mockServices);
    }
  };

  const generateMockAppointments = () => {
    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
    const titles = ['Check-up', 'Vaccination', 'Surgery', 'Dental Cleaning', 'Follow-up'];
    
    // Generate appointments for the next 14 days
    const mockAppointments = [];
    const startDate = new Date();
    
    for (let i = 0; i < 50; i++) {
      const appointmentDate = new Date(startDate);
      appointmentDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14));
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

  const generateMockPatients = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Pet ${i + 1}`,
      species: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster'][Math.floor(Math.random() * 5)],
      ownerName: `Owner ${i + 1}`
    }));
  };

  const generateMockServices = () => {
    return [
      { id: 1, name: 'Check-up', duration: 30, price: 50 },
      { id: 2, name: 'Vaccination', duration: 15, price: 30 },
      { id: 3, name: 'Surgery', duration: 120, price: 300 },
      { id: 4, name: 'Dental Cleaning', duration: 60, price: 100 },
      { id: 5, name: 'Follow-up', duration: 20, price: 40 }
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

  const handleOpenDialog = (appointment = null, start = null, end = null) => {
    if (appointment) {
      // Edit existing appointment
      setSelectedAppointment(appointment);
      setFormData({
        title: appointment.title,
        patientId: appointment.patientId.toString(),
        doctorId: appointment.doctorId.toString(),
        serviceId: appointment.serviceId.toString(),
        start: new Date(appointment.start),
        end: new Date(appointment.end),
        notes: appointment.notes || '',
        status: appointment.status
      });
    } else {
      // Create new appointment
      setSelectedAppointment(null);
      setFormData({
        title: '',
        patientId: '',
        doctorId: '',
        serviceId: '',
        start: start || new Date(),
        end: end || new Date(new Date().setHours(new Date().getHours() + 1)),
        notes: '',
        status: 'scheduled'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If service is selected, update the end time based on service duration
    if (name === 'serviceId' && value) {
      const selectedService = services.find(service => service.id.toString() === value);
      if (selectedService) {
        const newEnd = new Date(formData.start);
        newEnd.setMinutes(newEnd.getMinutes() + selectedService.duration);
        setFormData(prev => ({
          ...prev,
          end: newEnd
        }));
      }
    }
  };

  const handleDateTimeChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // If start time changes and a service is selected, update end time
    if (name === 'start' && formData.serviceId) {
      const selectedService = services.find(service => service.id.toString() === formData.serviceId);
      if (selectedService) {
        const newEnd = new Date(value);
        newEnd.setMinutes(newEnd.getMinutes() + selectedService.duration);
        setFormData(prev => ({
          ...prev,
          end: newEnd
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const patient = patients.find(p => p.id.toString() === formData.patientId);
      const doctor = doctors.find(d => d.id.toString() === formData.doctorId);
      const service = services.find(s => s.id.toString() === formData.serviceId);
      
      if (!patient || !doctor || !service) {
        setAlert({
          open: true,
          message: 'Please select patient, doctor, and service',
          severity: 'error'
        });
        return;
      }
      
      if (selectedAppointment) {
        // Update existing appointment
        const updatedAppointment = {
          ...selectedAppointment,
          title: formData.title || service.name,
          patientId: parseInt(formData.patientId),
          patientName: patient.name,
          doctorId: parseInt(formData.doctorId),
          doctorName: doctor.name,
          serviceId: parseInt(formData.serviceId),
          serviceName: service.name,
          start: new Date(formData.start),
          end: new Date(formData.end),
          notes: formData.notes,
          status: formData.status
        };
        
        const updatedAppointments = appointments.map(appt => 
          appt.id === selectedAppointment.id ? updatedAppointment : appt
        );
        
        setAppointments(updatedAppointments);
        setAlert({
          open: true,
          message: 'Appointment updated successfully',
          severity: 'success'
        });
      } else {
        // Create new appointment
        const newAppointment = {
          id: appointments.length + 1,
          title: formData.title || service.name,
          patientId: parseInt(formData.patientId),
          patientName: patient.name,
          doctorId: parseInt(formData.doctorId),
          doctorName: doctor.name,
          serviceId: parseInt(formData.serviceId),
          serviceName: service.name,
          start: new Date(formData.start),
          end: new Date(formData.end),
          notes: formData.notes,
          status: formData.status
        };
        
        setAppointments([...appointments, newAppointment]);
        setAlert({
          open: true,
          message: 'Appointment created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving appointment:', error);
      setAlert({
        open: true,
        message: 'Error saving appointment',
        severity: 'error'
      });
    }
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

  const handleSelectSlot = ({ start, end }) => {
    handleOpenDialog(null, start, end);
  };

  const handleSelectEvent = (event) => {
    handleOpenDialog(event);
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
          Appointment Scheduling
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          New Appointment
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
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
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tabs
                value={viewMode}
                onChange={(e, newValue) => setViewMode(newValue)}
                aria-label="view mode tabs"
              >
                <Tab icon={<EventIcon />} label="Calendar" />
                <Tab icon={<DayViewIcon />} label="List" />
              </Tabs>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
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
      
      {viewMode === 0 ? (
        // Calendar View
        <Paper sx={{ height: 'calc(100vh - 250px)', p: 2, borderRadius: 2 }}>
          <Calendar
            localizer={localizer}
            events={filteredAppointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['day', 'week', 'month']}
            view={calendarView}
            date={selectedDate}
            onNavigate={handleDateChange}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
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
      ) : (
        // List View
        <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No appointments found</TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments
                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                    .map((appointment) => (
                      <TableRow key={appointment.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {moment(appointment.start).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {moment(appointment.start).format('h:mm A')} - {moment(appointment.end).format('h:mm A')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PetsIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {appointment.patientName}
                          </Box>
                        </TableCell>
                        <TableCell>{appointment.serviceName}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {appointment.doctorName}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                            {moment(appointment.end).diff(moment(appointment.start), 'minutes')} min
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusChip(appointment.status)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenDialog(appointment)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Add/Edit Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patientId"
                  value={formData.patientId}
                  label="Patient"
                  onChange={handleInputChange}
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} ({patient.species})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Doctor</InputLabel>
                <Select
                  name="doctorId"
                  value={formData.doctorId}
                  label="Doctor"
                  onChange={handleInputChange}
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.name} ({doctor.specialization})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Service</InputLabel>
                <Select
                  name="serviceId"
                  value={formData.serviceId}
                  label="Service"
                  onChange={handleInputChange}
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id.toString()}>
                      {service.name} ({service.duration} min - ${service.price})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={moment(formData.start).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => handleDateTimeChange('start', new Date(e.target.value))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date & Time"
                type="datetime-local"
                value={moment(formData.end).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => handleDateTimeChange('end', new Date(e.target.value))}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title (Optional)"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Leave blank to use service name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          {selectedAppointment && (
            <Button 
              onClick={() => handleDeleteAppointment(selectedAppointment.id)} 
              color="error" 
              variant="outlined"
              sx={{ borderRadius: 2, mr: 'auto' }}
            >
              Delete
            </Button>
          )}
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2 }}>
            {selectedAppointment ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentScheduling;
