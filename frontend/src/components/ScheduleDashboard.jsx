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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import axios from 'axios';

const scheduleService = {
  getSchedules: async () => {
    try {
      const response = await axios.get('/api/schedules');
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  getSchedule: async (id) => {
    try {
      const response = await axios.get(`/api/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule ${id}:`, error);
      throw error;
    }
  },

  createSchedule: async (scheduleData) => {
    try {
      const response = await axios.post('/api/schedules', scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await axios.put(`/api/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  },

  deleteSchedule: async (id) => {
    try {
      const response = await axios.delete(`/api/schedules/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  }
};

const ScheduleDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    type: 'one-time',
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      endDate: null
    },
    status: 'available'
  });

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    fetchSchedules();
    fetchDoctors();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getSchedules();
      // Transform the data to match frontend field names
      const transformedData = data.map(schedule => ({
        id: schedule.id,
        doctorId: schedule.doctor_id,
        date: new Date(schedule.start_time),
        startTime: new Date(schedule.start_time),
        endTime: new Date(schedule.end_time),
        type: schedule.recurrence_type || 'one-time',
        recurrence: {
          frequency: schedule.recurrence_type,
          interval: schedule.recurrence_interval,
          endDate: schedule.recurrence_end_date ? new Date(schedule.recurrence_end_date) : null
        },
        notes: schedule.notes,
        status: 'available' // You might want to add a status field in your backend
      }));
      setSchedules(transformedData);
    } catch (error) {
      setError('Failed to fetch schedules');
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/doctors');
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const handleAddSchedule = () => {
    setFormMode('create');
    setFormData({
      doctorId: '',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      type: 'one-time',
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        endDate: null
      },
      status: 'available'
    });
    setOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId,
      date: new Date(schedule.date),
      startTime: new Date(schedule.startTime),
      endTime: new Date(schedule.endTime),
      type: schedule.type,
      recurrence: schedule.recurrence,
      status: schedule.status
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

  const handleRecurrenceChange = (field, value) => {
    setFormData({
      ...formData,
      recurrence: {
        ...formData.recurrence,
        [field]: value
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Format the data according to the backend's expected structure
      const scheduleData = {
        doctor_id: formData.doctorId,
        start_time: new Date(
          formData.date.getFullYear(),
          formData.date.getMonth(),
          formData.date.getDate(),
          formData.startTime.getHours(),
          formData.startTime.getMinutes()
        ).toISOString(),
        end_time: new Date(
          formData.date.getFullYear(),
          formData.date.getMonth(),
          formData.date.getDate(),
          formData.endTime.getHours(),
          formData.endTime.getMinutes()
        ).toISOString(),
        recurrence_type: formData.type === 'one-time' ? null : formData.recurrence.frequency,
        recurrence_interval: formData.type === 'one-time' ? null : formData.recurrence.interval,
        recurrence_end_date: formData.type === 'one-time' ? null : formData.recurrence.endDate?.toISOString(),
        notes: formData.notes || ''
      };

      if (formMode === 'create') {
        await scheduleService.createSchedule(scheduleData);
        showNotification('Schedule added successfully', 'success');
      } else {
        await scheduleService.updateSchedule(currentSchedule.id, scheduleData);
        showNotification('Schedule updated successfully', 'success');
      }
      setOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error('Schedule submission error:', error);
      showNotification(
        formMode === 'create' ? 'Error adding schedule' : 'Error updating schedule',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      setLoading(true);
      await scheduleService.deleteSchedule(id);
      showNotification('Schedule deleted successfully', 'success');
      fetchSchedules();
    } catch (error) {
      showNotification('Error deleting schedule', 'error');
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Schedule Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddSchedule}
        >
          Add Schedule
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
      ) : schedules.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No schedules found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSchedule}
            sx={{ mt: 2 }}
          >
            Add Your First Schedule
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {schedules.map((schedule) => (
            <Grid item xs={12} sm={6} md={4} key={schedule.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    {doctors.find(d => d.id === schedule.doctorId)?.name || 'Unknown Doctor'}
                  </Typography>
                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDateTime(schedule.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time: {formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={schedule.type}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={schedule.status}
                    color={
                      schedule.status === 'available' ? 'success' :
                      schedule.status === 'booked' ? 'primary' : 'error'
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
          {formMode === 'create' ? 'Add New Schedule' : 'Edit Schedule'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Doctor</InputLabel>
                <Select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  label="Doctor"
                >
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="one-time">One Time</MenuItem>
                  <MenuItem value="recurring">Recurring</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => {
                    setFormData({ ...formData, date: newValue });
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(newValue) => {
                    setFormData({ ...formData, startTime: newValue });
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(newValue) => {
                    setFormData({ ...formData, endTime: newValue });
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            {formData.type === 'recurring' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={formData.recurrence.frequency}
                      onChange={(e) => handleRecurrenceChange('frequency', e.target.value)}
                      label="Frequency"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Interval"
                    type="number"
                    value={formData.recurrence.interval}
                    onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={formData.recurrence.endDate}
                      onChange={(newValue) => {
                        handleRecurrenceChange('endDate', newValue);
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="booked">Booked</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
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

export default ScheduleDashboard; 