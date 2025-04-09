import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const doctorsService = {
  getDoctors: async () => {
    try {
      const response = await axios.get('/api/doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  getDoctor: async (id) => {
    try {
      const response = await axios.get(`/api/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching doctor ${id}:`, error);
      throw error;
    }
  },

  createDoctor: async (doctorData) => {
    try {
      const response = await axios.post('/api/doctors', doctorData);
      return response.data;
    } catch (error) {
      console.error('Error creating doctor:', error);
      throw error;
    }
  },

  updateDoctor: async (id, doctorData) => {
    try {
      const response = await axios.put(`/api/doctors/${id}`, doctorData);
      return response.data;
    } catch (error) {
      console.error(`Error updating doctor ${id}:`, error);
      throw error;
    }
  },

  deleteDoctor: async (id) => {
    try {
      const response = await axios.delete(`/api/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting doctor ${id}:`, error);
      throw error;
    }
  }
};

const specializations = [
  'General Practice',
  'Surgery',
  'Internal Medicine',
  'Emergency Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Other'
];

const DoctorsDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    email: '',
    phone: '',
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '09:00', end: '13:00' },
      sunday: { start: '', end: '' }
    },
    status: 'active'
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setError('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = () => {
    setFormMode('create');
    setFormData({
      name: '',
      specialization: '',
      email: '',
      phone: '',
      availability: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '13:00' },
        sunday: { start: '', end: '' }
      },
      status: 'active'
    });
    setOpen(true);
  };

  const handleEditDoctor = (doctor) => {
    setCurrentDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      availability: doctor.availability,
      status: doctor.status
    });
    setFormMode('edit');
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [field]: value
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (formMode === 'create') {
        await doctorsService.createDoctor(formData);
        showNotification('Doctor added successfully', 'success');
      } else {
        await doctorsService.updateDoctor(currentDoctor.id, formData);
        showNotification('Doctor updated successfully', 'success');
      }
      setOpen(false);
      fetchDoctors();
    } catch (error) {
      showNotification(
        formMode === 'create' ? 'Error adding doctor' : 'Error updating doctor',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    try {
      setLoading(true);
      await doctorsService.deleteDoctor(id);
      showNotification('Doctor deleted successfully', 'success');
      fetchDoctors();
    } catch (error) {
      showNotification('Error deleting doctor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Doctors Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDoctor}
        >
          Add Doctor
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : doctors.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No doctors found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddDoctor}
            sx={{ mt: 2 }}
          >
            Add Your First Doctor
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {doctors.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{doctor.name}</Typography>
                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditDoctor(doctor)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteDoctor(doctor.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Specialization: {doctor.specialization}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {doctor.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {doctor.phone}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={doctor.status}
                    color={
                      doctor.status === 'active' ? 'success' :
                      doctor.status === 'on-leave' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {formMode === 'create' ? 'Add New Doctor' : 'Edit Doctor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Specialization</InputLabel>
                <Select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  label="Specialization"
                >
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Availability
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(formData.availability).map(([day, times]) => (
                  <Grid item xs={12} sm={6} key={day}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {day}
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Start"
                          type="time"
                          value={times.start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="End"
                          type="time"
                          value={times.end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorsDashboard; 