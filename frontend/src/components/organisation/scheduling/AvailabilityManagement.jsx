import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Days of the week for recurring schedules
const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const AvailabilityManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [availabilityEvents, setAvailabilityEvents] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');

  // Form data for schedule creation/editing
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    type: 'weekly', // weekly, custom, one-time
    days: [],
    startTime: new Date().setHours(9, 0, 0, 0),
    endTime: new Date().setHours(17, 0, 0, 0),
    startDate: new Date(),
    endDate: null,
    bufferBefore: 0,
    bufferAfter: 0,
    breakTimes: [],
    exceptions: []
  });

  // Fetch schedules from API on mount
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Convert schedules to calendar events when schedules change
  useEffect(() => {
    generateAvailabilityEvents();
  }, [schedules]);

  const fetchSchedules = async () => {
    try {
      // API call would go here
      // const response = await fetch('/api/scheduling/availability');
      // const data = await response.json();
      
      // Using mock data for now
      const mockSchedules = [
        {
          id: 1,
          name: 'Regular Hours',
          type: 'weekly',
          days: [1, 2, 3, 4, 5], // Mon-Fri
          startTime: new Date().setHours(9, 0, 0, 0),
          endTime: new Date().setHours(17, 0, 0, 0),
          bufferBefore: 15,
          bufferAfter: 15,
          breakTimes: [
            {
              id: 1,
              startTime: new Date().setHours(12, 0, 0, 0),
              endTime: new Date().setHours(13, 0, 0, 0),
              days: [1, 2, 3, 4, 5]
            }
          ],
          exceptions: []
        },
        {
          id: 2,
          name: 'Weekend Hours',
          type: 'weekly',
          days: [6, 0], // Sat, Sun
          startTime: new Date().setHours(10, 0, 0, 0),
          endTime: new Date().setHours(14, 0, 0, 0),
          bufferBefore: 0,
          bufferAfter: 0,
          breakTimes: [],
          exceptions: []
        }
      ];
      
      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setAlert({
        open: true,
        message: 'Failed to load availability schedules',
        severity: 'error'
      });
    }
  };

  const generateAvailabilityEvents = () => {
    if (!schedules.length) return;
    
    const events = [];
    const startDate = moment().startOf('week').toDate();
    const endDate = moment().add(4, 'weeks').endOf('week').toDate();
    
    schedules.forEach(schedule => {
      // Generate events based on schedule type
      if (schedule.type === 'weekly') {
        const currentDate = moment(startDate);
        
        while (currentDate.toDate() <= endDate) {
          if (schedule.days.includes(currentDate.day())) {
            // Create availability block
            const start = new Date(currentDate.toDate());
            start.setHours(
              new Date(schedule.startTime).getHours(),
              new Date(schedule.startTime).getMinutes()
            );
            
            const end = new Date(currentDate.toDate());
            end.setHours(
              new Date(schedule.endTime).getHours(),
              new Date(schedule.endTime).getMinutes()
            );
            
            events.push({
              id: `avail-${schedule.id}-${currentDate.format('YYYY-MM-DD')}`,
              title: schedule.name,
              start,
              end,
              scheduleId: schedule.id
            });
            
            // Add break times if any
            schedule.breakTimes.forEach(breakTime => {
              if (breakTime.days.includes(currentDate.day())) {
                const breakStart = new Date(currentDate.toDate());
                breakStart.setHours(
                  new Date(breakTime.startTime).getHours(),
                  new Date(breakTime.startTime).getMinutes()
                );
                
                const breakEnd = new Date(currentDate.toDate());
                breakEnd.setHours(
                  new Date(breakTime.endTime).getHours(),
                  new Date(breakTime.endTime).getMinutes()
                );
                
                events.push({
                  id: `break-${schedule.id}-${breakTime.id}-${currentDate.format('YYYY-MM-DD')}`,
                  title: 'Break',
                  start: breakStart,
                  end: breakEnd,
                  scheduleId: schedule.id,
                  isBreak: true
                });
              }
            });
          }
          
          currentDate.add(1, 'day');
        }
      }
    });
    
    setAvailabilityEvents(events);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setCurrentSchedule(schedule);
      setFormData({
        id: schedule.id,
        name: schedule.name,
        type: schedule.type,
        days: [...schedule.days],
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        startDate: schedule.startDate || new Date(),
        endDate: schedule.endDate || null,
        bufferBefore: schedule.bufferBefore,
        bufferAfter: schedule.bufferAfter,
        breakTimes: [...schedule.breakTimes],
        exceptions: [...(schedule.exceptions || [])]
      });
    } else {
      setCurrentSchedule(null);
      setFormData({
        id: null,
        name: '',
        type: 'weekly',
        days: [],
        startTime: new Date().setHours(9, 0, 0, 0),
        endTime: new Date().setHours(17, 0, 0, 0),
        startDate: new Date(),
        endDate: null,
        bufferBefore: 0,
        bufferAfter: 0,
        breakTimes: [],
        exceptions: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSchedule(null);
  };

  const handleFormChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleTimeChange = (field, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue ? newValue.getTime() : null
    });
  };

  const handleDateChange = (field, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue
    });
  };

  const handleDayToggle = (day) => {
    const dayIndex = formData.days.indexOf(day);
    if (dayIndex > -1) {
      setFormData({
        ...formData,
        days: formData.days.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        days: [...formData.days, day].sort()
      });
    }
  };

  const addBreakTime = () => {
    const newBreak = {
      id: Date.now(),
      startTime: new Date().setHours(12, 0, 0, 0),
      endTime: new Date().setHours(13, 0, 0, 0),
      days: [...formData.days]
    };
    
    setFormData({
      ...formData,
      breakTimes: [...formData.breakTimes, newBreak]
    });
  };

  const handleBreakTimeChange = (breakId, field, value) => {
    setFormData({
      ...formData,
      breakTimes: formData.breakTimes.map(breakTime => 
        breakTime.id === breakId
          ? { ...breakTime, [field]: value }
          : breakTime
      )
    });
  };

  const removeBreakTime = (breakId) => {
    setFormData({
      ...formData,
      breakTimes: formData.breakTimes.filter(breakTime => breakTime.id !== breakId)
    });
  };

  const handleSaveSchedule = async () => {
    try {
      const newSchedule = {
        ...formData,
        id: formData.id || Date.now() // Use existing ID or generate new one
      };
      
      // API call would go here
      // const response = await fetch('/api/scheduling/availability', {
      //   method: formData.id ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSchedule)
      // });
      
      // Update local state
      if (formData.id) {
        setSchedules(schedules.map(s => s.id === formData.id ? newSchedule : s));
      } else {
        setSchedules([...schedules, newSchedule]);
      }
      
      setAlert({
        open: true,
        message: `Schedule ${formData.id ? 'updated' : 'created'} successfully`,
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving schedule:', error);
      setAlert({
        open: true,
        message: 'Failed to save availability schedule',
        severity: 'error'
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      // API call would go here
      // await fetch(`/api/scheduling/availability/${scheduleId}`, {
      //   method: 'DELETE'
      // });
      
      // Update local state
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      setAlert({
        open: true,
        message: 'Schedule deleted successfully',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setAlert({
        open: true,
        message: 'Failed to delete availability schedule',
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleCalendarView = (view) => {
    setCalendarView(view);
  };

  const handleSelectSlot = ({ start, end }) => {
    // For creating availability directly on calendar
    console.log('Selected slot:', start, end);
  };

  const handleSelectEvent = (event) => {
    // For editing existing availability on calendar
    console.log('Selected event:', event);
  };

  // Style events based on whether they're availability or breaks
  const eventStyleGetter = (event) => {
    if (event.isBreak) {
      return {
        style: {
          backgroundColor: '#f44336',
          borderRadius: '4px',
          color: 'white'
        }
      };
    }
    
    return {
      style: {
        backgroundColor: '#4caf50',
        borderRadius: '4px',
        color: 'white'
      }
    };
  };

  // Component for the Form-based Setup Tab
  const SetupTab = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Manage Availability Schedules</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Schedule
        </Button>
      </Box>
      
      {schedules.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No availability schedules defined. Create your first schedule to get started.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {schedules.map(schedule => (
            <Grid item xs={12} sm={6} md={4} key={schedule.id}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">{schedule.name}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleOpenDialog(schedule)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteSchedule(schedule.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Type: {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)}
                </Typography>
                
                <Box sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">Days:</Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {schedule.days.map(day => (
                      <Chip 
                        key={day}
                        label={DAYS_OF_WEEK.find(d => d.value === day)?.label} 
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
                
                <Box sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">Hours:</Typography>
                  <Typography variant="body1">
                    {moment(schedule.startTime).format('h:mm A')} - {moment(schedule.endTime).format('h:mm A')}
                  </Typography>
                </Box>
                
                {schedule.breakTimes.length > 0 && (
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body2" color="text.secondary">Breaks:</Typography>
                    {schedule.breakTimes.map(breakTime => (
                      <Typography key={breakTime.id} variant="body2">
                        {moment(breakTime.startTime).format('h:mm A')} - {moment(breakTime.endTime).format('h:mm A')}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Component for the Calendar View Tab
  const CalendarTab = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Availability Calendar</Typography>
        <Box>
          <Button 
            variant={calendarView === 'day' ? 'contained' : 'outlined'} 
            onClick={() => handleCalendarView('day')}
            sx={{ mr: 1 }}
          >
            Day
          </Button>
          <Button 
            variant={calendarView === 'week' ? 'contained' : 'outlined'} 
            onClick={() => handleCalendarView('week')}
            sx={{ mr: 1 }}
          >
            Week
          </Button>
          <Button 
            variant={calendarView === 'month' ? 'contained' : 'outlined'} 
            onClick={() => handleCalendarView('month')}
          >
            Month
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ height: 600, p: 2 }}>
        <Calendar
          localizer={localizer}
          events={availabilityEvents}
          startAccessor="start"
          endAccessor="end"
          view={calendarView}
          onView={handleCalendarView}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          date={selectedDate}
          onNavigate={date => setSelectedDate(date)}
          step={15}
          timeslots={4}
        />
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Schedule Setup" />
          <Tab label="Calendar View" />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && <SetupTab />}
      {activeTab === 1 && <CalendarTab />}
      
      {/* Schedule Form Dialog */}
      <Dialog 
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentSchedule ? 'Edit Schedule' : 'Create New Schedule'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                label="Schedule Name"
                fullWidth
                value={formData.name}
                onChange={handleFormChange('name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Schedule Type"
                  onChange={handleFormChange('type')}
                >
                  <MenuItem value="weekly">Weekly Schedule</MenuItem>
                  <MenuItem value="custom">Custom Pattern</MenuItem>
                  <MenuItem value="one-time">One-time Schedule</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.type === 'weekly' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Available Days</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {DAYS_OF_WEEK.map(day => (
                    <Chip
                      key={day.value}
                      label={day.label}
                      color={formData.days.includes(day.value) ? 'primary' : 'default'}
                      onClick={() => handleDayToggle(day.value)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={new Date(formData.startTime)}
                  onChange={(newValue) => handleTimeChange('startTime', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="End Time"
                  value={new Date(formData.endTime)}
                  onChange={(newValue) => handleTimeChange('endTime', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Buffer Before (minutes)"
                type="number"
                fullWidth
                value={formData.bufferBefore}
                onChange={handleFormChange('bufferBefore')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Buffer After (minutes)"
                type="number"
                fullWidth
                value={formData.bufferAfter}
                onChange={handleFormChange('bufferAfter')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Break Times</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addBreakTime}
                  disabled={formData.days.length === 0}
                >
                  Add Break
                </Button>
              </Box>
              
              {formData.breakTimes.map((breakTime, index) => (
                <Box key={breakTime.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Break #{index + 1}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="Start Time"
                          value={new Date(breakTime.startTime)}
                          onChange={(newValue) => handleBreakTimeChange(
                            breakTime.id, 
                            'startTime', 
                            newValue ? newValue.getTime() : null
                          )}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          label="End Time"
                          value={new Date(breakTime.endTime)}
                          onChange={(newValue) => handleBreakTimeChange(
                            breakTime.id, 
                            'endTime', 
                            newValue ? newValue.getTime() : null
                          )}
                          renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton 
                        color="error" 
                        onClick={() => removeBreakTime(breakTime.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              {formData.breakTimes.length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No break times defined. Add breaks if needed.
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {currentSchedule && (
            <Button 
              color="error" 
              onClick={() => handleDeleteSchedule(currentSchedule.id)}
            >
              Delete
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={handleSaveSchedule}
            disabled={!formData.name || formData.days.length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AvailabilityManagement; 