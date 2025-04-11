import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  TextField,
  CircularProgress,
  Checkbox,
  Chip,
  Stack,
  Link
} from '@mui/material';
import {
  Google as GoogleIcon,
  Event as OutlookIcon,
  Apple as AppleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';

// Mock calendar providers
const CALENDAR_PROVIDERS = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: <GoogleIcon />,
    color: '#DB4437',
    authUrl: 'https://accounts.google.com/o/oauth2/auth'
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: <OutlookIcon />,
    color: '#0078D4',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: <AppleIcon />,
    color: '#555555',
    authUrl: 'https://appleid.apple.com/auth/authorize'
  }
];

const CalendarIntegration = () => {
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [calendarSettings, setCalendarSettings] = useState({
    isEnabled: true,
    autoSync: true,
    syncDirection: 'two-way', // 'two-way', 'push', 'pull'
    eventTypes: ['booking', 'cancellation', 'update'],
    syncInterval: 15 // minutes
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);

  // Fetch connected calendars and sync history on mount
  useEffect(() => {
    fetchConnectedCalendars();
    fetchSyncHistory();
  }, []);

  const fetchConnectedCalendars = async () => {
    try {
      // API call would go here
      // const response = await fetch('/api/scheduling/calendar-integrations');
      // const data = await response.json();

      // Using mock data for now
      const mockConnectedCalendars = [
        {
          id: 1,
          providerId: 'google',
          email: 'johndoe@gmail.com',
          name: 'John\'s Google Calendar',
          isEnabled: true,
          autoSync: true,
          syncDirection: 'two-way',
          lastSyncTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'active',
          defaultCalendar: 'Primary Calendar'
        }
      ];

      setConnectedCalendars(mockConnectedCalendars);
    } catch (error) {
      console.error('Error fetching connected calendars:', error);
      setAlert({
        open: true,
        message: 'Failed to load connected calendars',
        severity: 'error'
      });
    }
  };

  const fetchSyncHistory = async () => {
    try {
      // API call would go here
      // const response = await fetch('/api/scheduling/calendar-integrations/sync-history');
      // const data = await response.json();

      // Using mock data for now
      const mockSyncHistory = [
        {
          id: 1,
          providerId: 'google',
          email: 'johndoe@gmail.com',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'success',
          details: 'Synced 5 events'
        },
        {
          id: 2,
          providerId: 'google',
          email: 'johndoe@gmail.com',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          details: 'Synced 3 events'
        },
        {
          id: 3,
          providerId: 'google',
          email: 'johndoe@gmail.com',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'error',
          details: 'Authentication error'
        }
      ];

      setSyncHistory(mockSyncHistory);
    } catch (error) {
      console.error('Error fetching sync history:', error);
      setAlert({
        open: true,
        message: 'Failed to load sync history',
        severity: 'error'
      });
    }
  };

  const handleOpenDialog = (provider) => {
    setCurrentProvider(provider);
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentProvider(null);
    setActiveStep(0);
    setIsAuthenticating(false);
  };

  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleFinish = async () => {
    try {
      // In a real app, this would create the calendar integration in your backend
      setIsAuthenticating(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add mock connected calendar
      const newCalendar = {
        id: Date.now(),
        providerId: currentProvider.id,
        email: 'johndoe@gmail.com',
        name: `John's ${currentProvider.name}`,
        isEnabled: true,
        autoSync: true,
        syncDirection: 'two-way',
        lastSyncTime: new Date().toISOString(),
        status: 'active',
        defaultCalendar: 'Primary Calendar'
      };

      setConnectedCalendars([...connectedCalendars, newCalendar]);

      setAlert({
        open: true,
        message: `${currentProvider.name} connected successfully!`,
        severity: 'success'
      });

      handleCloseDialog();
    } catch (error) {
      console.error('Error connecting calendar:', error);
      setAlert({
        open: true,
        message: 'Failed to connect calendar',
        severity: 'error'
      });
      setIsAuthenticating(false);
    }
  };

  const handleDeleteCalendar = async (calendarId) => {
    try {
      // API call would go here
      // await fetch(`/api/scheduling/calendar-integrations/${calendarId}`, {
      //   method: 'DELETE'
      // });

      // Update local state
      setConnectedCalendars(connectedCalendars.filter(cal => cal.id !== calendarId));

      setAlert({
        open: true,
        message: 'Calendar disconnected successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      setAlert({
        open: true,
        message: 'Failed to disconnect calendar',
        severity: 'error'
      });
    }
  };

  const handleOpenSettings = (calendarId) => {
    const calendar = connectedCalendars.find(cal => cal.id === calendarId);
    setCalendarSettings({
      isEnabled: calendar.isEnabled,
      autoSync: calendar.autoSync,
      syncDirection: calendar.syncDirection || 'two-way',
      eventTypes: ['booking', 'cancellation', 'update'],
      syncInterval: 15
    });
    setSelectedCalendarId(calendarId);
    setOpenSettingsDialog(true);
  };

  const handleCloseSettings = () => {
    setOpenSettingsDialog(false);
    setSelectedCalendarId(null);
  };

  const handleSaveSettings = async () => {
    try {
      // API call would go here
      // await fetch(`/api/scheduling/calendar-integrations/${selectedCalendarId}/settings`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(calendarSettings)
      // });

      // Update local state
      setConnectedCalendars(connectedCalendars.map(cal =>
        cal.id === selectedCalendarId
          ? { ...cal, ...calendarSettings }
          : cal
      ));

      setAlert({
        open: true,
        message: 'Calendar settings updated successfully',
        severity: 'success'
      });

      handleCloseSettings();
    } catch (error) {
      console.error('Error updating calendar settings:', error);
      setAlert({
        open: true,
        message: 'Failed to update calendar settings',
        severity: 'error'
      });
    }
  };

  const handleTriggerSync = async (calendarId) => {
    try {
      // API call would go here
      // await fetch(`/api/scheduling/calendar-integrations/${calendarId}/sync`, {
      //   method: 'POST'
      // });

      // Add mock sync history entry
      const newSyncEntry = {
        id: Date.now(),
        providerId: connectedCalendars.find(cal => cal.id === calendarId).providerId,
        email: connectedCalendars.find(cal => cal.id === calendarId).email,
        timestamp: new Date().toISOString(),
        status: 'success',
        details: 'Manually synced 2 events'
      };

      setSyncHistory([newSyncEntry, ...syncHistory]);

      // Update last sync time
      setConnectedCalendars(connectedCalendars.map(cal =>
        cal.id === calendarId
          ? { ...cal, lastSyncTime: new Date().toISOString() }
          : cal
      ));

      setAlert({
        open: true,
        message: 'Calendar synchronized successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error syncing calendar:', error);
      setAlert({
        open: true,
        message: 'Failed to synchronize calendar',
        severity: 'error'
      });
    }
  };

  const handleToggleCalendar = async (calendarId, isEnabled) => {
    try {
      // API call would go here
      // await fetch(`/api/scheduling/calendar-integrations/${calendarId}/toggle`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isEnabled })
      // });

      // Update local state
      setConnectedCalendars(connectedCalendars.map(cal =>
        cal.id === calendarId ? { ...cal, isEnabled } : cal
      ));

      setAlert({
        open: true,
        message: `Calendar ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling calendar:', error);
      setAlert({
        open: true,
        message: 'Failed to update calendar status',
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const handleSettingsChange = (setting) => (event) => {
    if (setting === 'isEnabled' || setting === 'autoSync') {
      setCalendarSettings({
        ...calendarSettings,
        [setting]: event.target.checked
      });
    } else {
      setCalendarSettings({
        ...calendarSettings,
        [setting]: event.target.value
      });
    }
  };

  const handleEventTypeToggle = (type) => {
    const currentEventTypes = [...calendarSettings.eventTypes];
    const index = currentEventTypes.indexOf(type);

    if (index > -1) {
      currentEventTypes.splice(index, 1);
    } else {
      currentEventTypes.push(type);
    }

    setCalendarSettings({
      ...calendarSettings,
      eventTypes: currentEventTypes
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Step content for calendar connection wizard
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Connect {currentProvider?.name}
            </Typography>
            <Typography paragraph>
              We'll connect to your {currentProvider?.name} to automatically:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Sync appointments to your calendar" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Block times when you're busy" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Keep availability up-to-date" />
              </ListItem>
            </List>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Authorize Access
            </Typography>
            <Typography paragraph>
              Click the button below to authorize access to your {currentProvider?.name}. You'll be redirected to {currentProvider?.name} to sign in.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Button
                variant="contained"
                startIcon={currentProvider?.icon}
                sx={{ bgcolor: currentProvider?.color, '&:hover': { bgcolor: currentProvider?.color } }}
                onClick={handleNext}
              >
                Connect {currentProvider?.name}
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Note: We only request access to read and modify calendar events. We cannot access any other data from your account.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Syncing Settings
            </Typography>
            <Typography paragraph>
              Configure how your calendar should sync with the scheduling system.
            </Typography>

            <FormControlLabel
              control={<Switch checked={true} />}
              label="Automatically sync calendar events"
              sx={{ mb: 2, display: 'block' }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Sync Direction
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ height: '100%', bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Typography variant="subtitle1">Two-way Sync</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Changes made in either calendar will be synchronized
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1">Push Only</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only push our events to your calendar
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1">Pull Only</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only get availability from your calendar
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" gutterBottom>
              Event Types to Sync
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Chip label="Bookings" color="primary" />
              <Chip label="Cancellations" color="primary" />
              <Chip label="Updates" color="primary" />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              You can customize these settings more after connecting your calendar.
            </Typography>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {isAuthenticating ? (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography>
                  Connecting to {currentProvider?.name}...
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" color="primary" gutterBottom>
                  Authentication Successful!
                </Typography>
                <Typography paragraph>
                  Your {currentProvider?.name} has been successfully connected.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click Finish to complete the setup and start syncing your events.
                </Typography>
              </>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Calendar Integration</Typography>
        <Typography variant="body1" paragraph>
          Connect your external calendars for automatic two-way sync of appointments and availability.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Connected Calendars</Typography>

            {connectedCalendars.length === 0 ? (
              <Alert severity="info" sx={{ my: 2 }}>
                No calendars connected. Connect a calendar to start syncing events.
              </Alert>
            ) : (
              <List>
                {connectedCalendars.map(calendar => {
                  const provider = CALENDAR_PROVIDERS.find(p => p.id === calendar.providerId);

                  return (
                    <React.Fragment key={calendar.id}>
                      <ListItem
                        secondaryAction={
                          <FormControlLabel
                            control={
                              <Switch
                                checked={calendar.isEnabled}
                                onChange={(e) => handleToggleCalendar(calendar.id, e.target.checked)}
                                size="small"
                              />
                            }
                            label=""
                          />
                        }
                      >
                        <ListItemIcon sx={{ color: provider?.color }}>
                          {provider?.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{calendar.name}</Typography>
                              {!calendar.isEnabled && (
                                <Chip
                                  label="Disabled"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">{calendar.email}</Typography>
                              <Typography variant="body2" component="div" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                Last synced: {formatTime(calendar.lastSyncTime)}
                              </Typography>
                            </>
                          }
                        />
                        <Box sx={{ display: 'flex', mr: 2 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleTriggerSync(calendar.id)}
                            disabled={!calendar.isEnabled}
                          >
                            <SyncIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenSettings(calendar.id)}
                          >
                            <SettingsIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCalendar(calendar.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Connect a New Calendar</Typography>
              <Grid container spacing={2}>
                {CALENDAR_PROVIDERS.map(provider => (
                  <Grid item key={provider.id} xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={provider.icon}
                      onClick={() => handleOpenDialog(provider)}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {provider.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Sync Activity</Typography>

            {syncHistory.length === 0 ? (
              <Alert severity="info">No sync history available.</Alert>
            ) : (
              <List dense>
                {syncHistory.slice(0, 5).map(sync => {
                  const provider = CALENDAR_PROVIDERS.find(p => p.id === sync.providerId);

                  return (
                    <ListItem key={sync.id}>
                      <ListItemIcon>
                        {sync.status === 'success' ? (
                          <CheckIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={sync.details}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Box
                              component="span"
                              sx={{
                                color: provider?.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                mr: 1,
                                fontSize: '0.875rem'
                              }}
                            >
                              {provider?.icon && React.cloneElement(provider.icon, { fontSize: 'small' })}
                              <span style={{ marginLeft: 4 }}>{sync.email}</span>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(sync.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            {syncHistory.length > 5 && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Button size="small">View All Activity</Button>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Help & Documentation</Typography>
            <List dense>
              <ListItem component={Link} href="#" underline="none">
                <ListItemText primary="Calendar Integration Guide" />
              </ListItem>
              <ListItem component={Link} href="#" underline="none">
                <ListItemText primary="Troubleshooting Sync Issues" />
              </ListItem>
              <ListItem component={Link} href="#" underline="none">
                <ListItemText primary="Privacy & Security" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Calendar Connection Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Connect External Calendar
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ py: 3 }}>
            <Step>
              <StepLabel>Introduction</StepLabel>
            </Step>
            <Step>
              <StepLabel>Authorization</StepLabel>
            </Step>
            <Step>
              <StepLabel>Settings</StepLabel>
            </Step>
            <Step>
              <StepLabel>Finish</StepLabel>
            </Step>
          </Stepper>

          <Box sx={{ mt: 2 }}>
            {getStepContent(activeStep)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>

          {activeStep > 0 && activeStep < 3 && (
            <Button onClick={handleBack}>
              Back
            </Button>
          )}

          {activeStep === 0 && (
            <Button onClick={handleNext} variant="contained">
              Next
            </Button>
          )}

          {activeStep === 2 && (
            <Button onClick={handleNext} variant="contained">
              Authorize
            </Button>
          )}

          {activeStep === 3 && (
            <Button
              onClick={handleFinish}
              variant="contained"
              disabled={isAuthenticating}
            >
              Finish
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Calendar Settings Dialog */}
      <Dialog
        open={openSettingsDialog}
        onClose={handleCloseSettings}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Calendar Settings</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            Sync Settings
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={calendarSettings.isEnabled}
                onChange={handleSettingsChange('isEnabled')}
              />
            }
            label="Calendar is enabled"
            sx={{ display: 'block', mb: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={calendarSettings.autoSync}
                onChange={handleSettingsChange('autoSync')}
              />
            }
            label="Automatically sync events"
            sx={{ display: 'block', mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Sync Direction
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card
                variant={calendarSettings.syncDirection === 'two-way' ? 'elevation' : 'outlined'}
                elevation={calendarSettings.syncDirection === 'two-way' ? 3 : 0}
                sx={{
                  cursor: 'pointer',
                  bgcolor: calendarSettings.syncDirection === 'two-way' ? 'primary.50' : 'inherit',
                  borderColor: calendarSettings.syncDirection === 'two-way' ? 'primary.main' : 'inherit'
                }}
                onClick={() => setCalendarSettings({ ...calendarSettings, syncDirection: 'two-way' })}
              >
                <CardContent>
                  <Typography variant="subtitle1">Two-way Sync</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Changes made in either calendar will be synchronized
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                variant={calendarSettings.syncDirection === 'push' ? 'elevation' : 'outlined'}
                elevation={calendarSettings.syncDirection === 'push' ? 3 : 0}
                sx={{
                  cursor: 'pointer',
                  bgcolor: calendarSettings.syncDirection === 'push' ? 'primary.50' : 'inherit',
                  borderColor: calendarSettings.syncDirection === 'push' ? 'primary.main' : 'inherit'
                }}
                onClick={() => setCalendarSettings({ ...calendarSettings, syncDirection: 'push' })}
              >
                <CardContent>
                  <Typography variant="subtitle1">Push Only</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Only push our events to your calendar
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card
                variant={calendarSettings.syncDirection === 'pull' ? 'elevation' : 'outlined'}
                elevation={calendarSettings.syncDirection === 'pull' ? 3 : 0}
                sx={{
                  cursor: 'pointer',
                  bgcolor: calendarSettings.syncDirection === 'pull' ? 'primary.50' : 'inherit',
                  borderColor: calendarSettings.syncDirection === 'pull' ? 'primary.main' : 'inherit'
                }}
                onClick={() => setCalendarSettings({ ...calendarSettings, syncDirection: 'pull' })}
              >
                <CardContent>
                  <Typography variant="subtitle1">Pull Only</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Only get availability from your calendar
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Event Types to Sync
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={calendarSettings.eventTypes.includes('booking')}
                  onChange={() => handleEventTypeToggle('booking')}
                />
              }
              label="Bookings"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={calendarSettings.eventTypes.includes('cancellation')}
                  onChange={() => handleEventTypeToggle('cancellation')}
                />
              }
              label="Cancellations"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={calendarSettings.eventTypes.includes('update')}
                  onChange={() => handleEventTypeToggle('update')}
                />
              }
              label="Updates"
            />
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Sync Interval (minutes)
          </Typography>
          <TextField
            type="number"
            fullWidth
            value={calendarSettings.syncInterval}
            onChange={handleSettingsChange('syncInterval')}
            inputProps={{ min: 5, max: 60, step: 5 }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
          >
            Save Settings
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

export default CalendarIntegration;