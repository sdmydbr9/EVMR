import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Snackbar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import BuildIcon from '@mui/icons-material/Build';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Organization Settings
  const [organizationSettings, setOrganizationSettings] = useState({
    name: 'PetSphere Veterinary Clinic',
    email: 'info@petsphere.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Anytown, CA 12345',
    website: 'www.petsphere.com',
    logo: '/assets/images/logos/black_transparent.png',
    businessHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: false }
    }
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    marketingEmails: false,
    reminderLeadTime: 24
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 30,
    ipRestriction: false
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptCreditCards: true,
    acceptOnlinePayments: true,
    defaultPaymentMethod: 'credit_card',
    currency: 'USD',
    taxRate: 8.5
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const settingsTabs = [
    { label: 'Organization', icon: <BusinessIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
    { label: 'Security', icon: <SecurityIcon /> },
    { label: 'Payment', icon: <PaymentIcon /> },
    { label: 'System', icon: <BuildIcon /> }
  ];

  useEffect(() => {
    // In a real app, we would fetch settings from the API
    // fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In a real app, we would fetch from the API
      // const response = await api.get('/settings');
      // setOrganizationSettings(response.data.organization);
      // setNotificationSettings(response.data.notifications);
      // setSecuritySettings(response.data.security);
      // setPaymentSettings(response.data.payment);
      // setSystemSettings(response.data.system);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setNotification({
        open: true,
        message: 'Error fetching settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;
    setOrganizationSettings({
      ...organizationSettings,
      [name]: value
    });
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setOrganizationSettings({
      ...organizationSettings,
      businessHours: {
        ...organizationSettings.businessHours,
        [day]: {
          ...organizationSettings.businessHours[day],
          [field]: field === 'isOpen' ? value : value
        }
      }
    });
  };

  const handleNotificationChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setNotificationSettings({
      ...notificationSettings,
      [name]: newValue
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setSecuritySettings({
      ...securitySettings,
      [name]: newValue
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setPaymentSettings({
      ...paymentSettings,
      [name]: newValue
    });
  };

  const handleSystemChange = (e) => {
    const { name, value } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: value
    });
  };

  const saveSettings = async (settingType) => {
    setLoading(true);
    try {
      // In a real app, we would send to the API
      // let response;
      // switch (settingType) {
      //   case 'organization':
      //     response = await api.put('/settings/organization', organizationSettings);
      //     break;
      //   case 'notifications':
      //     response = await api.put('/settings/notifications', notificationSettings);
      //     break;
      //   case 'security':
      //     response = await api.put('/settings/security', securitySettings);
      //     break;
      //   case 'payment':
      //     response = await api.put('/settings/payment', paymentSettings);
      //     break;
      //   case 'system':
      //     response = await api.put('/settings/system', systemSettings);
      //     break;
      //   default:
      //     break;
      // }
      
      // For demo purposes, just show a success message
      setNotification({
        open: true,
        message: `${settingType.charAt(0).toUpperCase() + settingType.slice(1)} settings saved successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error saving ${settingType} settings:`, error);
      setNotification({
        open: true,
        message: `Error saving ${settingType} settings`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const renderBusinessHours = () => {
    const days = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
      { key: 'saturday', label: 'Saturday' },
      { key: 'sunday', label: 'Sunday' }
    ];

    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Business Hours" />
        <CardContent>
          <Grid container spacing={2}>
            {days.map((day) => (
              <Grid item xs={12} key={day.key}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={organizationSettings.businessHours[day.key].isOpen}
                          onChange={(e) => handleBusinessHoursChange(day.key, 'isOpen', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={day.label}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Open"
                      type="time"
                      value={organizationSettings.businessHours[day.key].open}
                      onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                      disabled={!organizationSettings.businessHours[day.key].isOpen}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Close"
                      type="time"
                      value={organizationSettings.businessHours[day.key].close}
                      onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                      disabled={!organizationSettings.businessHours[day.key].isOpen}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderOrganizationSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Organization Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Organization Name"
              name="name"
              value={organizationSettings.name}
              onChange={handleOrganizationChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={organizationSettings.email}
              onChange={handleOrganizationChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={organizationSettings.phone}
              onChange={handleOrganizationChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={organizationSettings.website}
              onChange={handleOrganizationChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              multiline
              rows={2}
              value={organizationSettings.address}
              onChange={handleOrganizationChange}
            />
          </Grid>

          <Grid item xs={12}>
            {renderBusinessHours()}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => saveSettings('organization')}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderNotificationSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          name="emailNotifications"
                          color="primary"
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onChange={handleNotificationChange}
                          name="smsNotifications"
                          color="primary"
                        />
                      }
                      label="SMS Notifications"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.appointmentReminders}
                          onChange={handleNotificationChange}
                          name="appointmentReminders"
                          color="primary"
                        />
                      }
                      label="Appointment Reminders"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onChange={handleNotificationChange}
                          name="marketingEmails"
                          color="primary"
                        />
                      }
                      label="Marketing Emails"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Reminder Lead Time (hours)"
                      name="reminderLeadTime"
                      type="number"
                      value={notificationSettings.reminderLeadTime}
                      onChange={handleNotificationChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScheduleIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => saveSettings('notifications')}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderSecuritySettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Security Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onChange={handleSecurityChange}
                          name="twoFactorAuth"
                          color="primary"
                        />
                      }
                      label="Two-Factor Authentication"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password Expiry (days)"
                      name="passwordExpiryDays"
                      type="number"
                      value={securitySettings.passwordExpiryDays}
                      onChange={handleSecurityChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      name="sessionTimeoutMinutes"
                      type="number"
                      value={securitySettings.sessionTimeoutMinutes}
                      onChange={handleSecurityChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.ipRestriction}
                          onChange={handleSecurityChange}
                          name="ipRestriction"
                          color="primary"
                        />
                      }
                      label="IP Restriction"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => saveSettings('security')}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderPaymentSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Payment Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentSettings.acceptCreditCards}
                          onChange={handlePaymentChange}
                          name="acceptCreditCards"
                          color="primary"
                        />
                      }
                      label="Accept Credit Cards"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={paymentSettings.acceptOnlinePayments}
                          onChange={handlePaymentChange}
                          name="acceptOnlinePayments"
                          color="primary"
                        />
                      }
                      label="Accept Online Payments"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Default Payment Method</InputLabel>
                      <Select
                        name="defaultPaymentMethod"
                        value={paymentSettings.defaultPaymentMethod}
                        label="Default Payment Method"
                        onChange={handlePaymentChange}
                      >
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="credit_card">Credit Card</MenuItem>
                        <MenuItem value="debit_card">Debit Card</MenuItem>
                        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        name="currency"
                        value={paymentSettings.currency}
                        label="Currency"
                        onChange={handlePaymentChange}
                      >
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                        <MenuItem value="CAD">CAD (C$)</MenuItem>
                        <MenuItem value="AUD">AUD (A$)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tax Rate (%)"
                      name="taxRate"
                      type="number"
                      value={paymentSettings.taxRate}
                      onChange={handlePaymentChange}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => saveSettings('payment')}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderSystemSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          System Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Theme</InputLabel>
                      <Select
                        name="theme"
                        value={systemSettings.theme}
                        label="Theme"
                        onChange={handleSystemChange}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        name="language"
                        value={systemSettings.language}
                        label="Language"
                        onChange={handleSystemChange}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Time Zone</InputLabel>
                      <Select
                        name="timezone"
                        value={systemSettings.timezone}
                        label="Time Zone"
                        onChange={handleSystemChange}
                      >
                        <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                        <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                        <MenuItem value="Europe/London">London (GMT)</MenuItem>
                        <MenuItem value="Europe/Paris">Paris (CET)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Date Format</InputLabel>
                      <Select
                        name="dateFormat"
                        value={systemSettings.dateFormat}
                        label="Date Format"
                        onChange={handleSystemChange}
                      >
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Time Format</InputLabel>
                      <Select
                        name="timeFormat"
                        value={systemSettings.timeFormat}
                        label="Time Format"
                        onChange={handleSystemChange}
                      >
                        <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                        <MenuItem value="24h">24-hour</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={() => saveSettings('system')}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderOrganizationSettings();
      case 1:
        return renderNotificationSettings();
      case 2:
        return renderSecuritySettings();
      case 3:
        return renderPaymentSettings();
      case 4:
        return renderSystemSettings();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
          Settings
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          orientation="horizontal"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          {settingsTabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                color: activeTab === index ? 'primary.main' : 'text.secondary',
                '&.Mui-selected': { color: 'primary.main' },
              }}
            />
          ))}
        </Tabs>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          {renderTabContent()}
        </Paper>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 