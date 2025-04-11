import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Email as EmailIcon,
  Sms as SmsIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  Code as CodeIcon,
  Help as HelpIcon
} from '@mui/icons-material';

// Template placeholders reference
const PLACEHOLDERS = [
  { key: '{{patientName}}', description: 'Patient\'s full name' },
  { key: '{{petName}}', description: 'Pet\'s name' },
  { key: '{{serviceName}}', description: 'Service or appointment type' },
  { key: '{{appointmentDate}}', description: 'Appointment date' },
  { key: '{{appointmentTime}}', description: 'Appointment time' },
  { key: '{{doctorName}}', description: 'Doctor\'s name' },
  { key: '{{organizationName}}', description: 'Your organization name' },
  { key: '{{cancellationLink}}', description: 'Link to cancel appointment' },
  { key: '{{rescheduleLink}}', description: 'Link to reschedule appointment' },
  { key: '{{calendarLink}}', description: 'Link to add to calendar' }
];

const NotificationSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    emailFrom: 'appointments@yourvetclinic.com',
    emailReplyTo: 'contact@yourvetclinic.com',
    smsFrom: '+15551234567',
    customSenderName: 'Your Vet Clinic'
  });
  
  const [templates, setTemplates] = useState({
    emailBookingConfirmation: {
      subject: 'Your appointment with {{organizationName}} has been confirmed',
      body: `
Dear {{patientName}},

Thank you for booking an appointment with {{organizationName}}. Your appointment has been confirmed:

Service: {{serviceName}}
Date: {{appointmentDate}}
Time: {{appointmentTime}}
Doctor: {{doctorName}}

If you need to reschedule or cancel, please use these links:
Reschedule: {{rescheduleLink}}
Cancel: {{cancellationLink}}

You can add this appointment to your calendar: {{calendarLink}}

Looking forward to seeing you and {{petName}}!

Best regards,
{{organizationName}} Team`,
      enabled: true
    },
    emailReminder: {
      subject: 'Reminder: Your appointment with {{organizationName}} tomorrow',
      body: `
Dear {{patientName}},

This is a friendly reminder about your upcoming appointment:

Service: {{serviceName}}
Date: {{appointmentDate}}
Time: {{appointmentTime}}
Doctor: {{doctorName}}

If you need to reschedule or cancel, please use these links:
Reschedule: {{rescheduleLink}}
Cancel: {{cancellationLink}}

Looking forward to seeing you and {{petName}}!

Best regards,
{{organizationName}} Team`,
      enabled: true
    },
    emailCancellation: {
      subject: 'Your appointment with {{organizationName}} has been cancelled',
      body: `
Dear {{patientName}},

Your appointment has been cancelled:

Service: {{serviceName}}
Date: {{appointmentDate}}
Time: {{appointmentTime}}

If you would like to reschedule, please use this link: {{rescheduleLink}}

Best regards,
{{organizationName}} Team`,
      enabled: true
    },
    smsBookingConfirmation: {
      body: `{{organizationName}}: Your {{serviceName}} appointment is confirmed for {{appointmentDate}} at {{appointmentTime}} with {{doctorName}}. Click here to manage: {{rescheduleLink}}`,
      enabled: false
    },
    smsReminder: {
      body: `Reminder: Your {{serviceName}} appointment with {{organizationName}} is tomorrow at {{appointmentTime}}. Reply HELP for assistance or CANCEL to cancel.`,
      enabled: false
    },
    smsCancellation: {
      body: `{{organizationName}}: Your {{serviceName}} appointment for {{appointmentDate}} at {{appointmentTime}} has been cancelled. Click here to rebook: {{rescheduleLink}}`,
      enabled: false
    }
  });
  
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  const [openHelpDialog, setOpenHelpDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch notification settings on mount
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      // API call would go here
      // const response = await fetch('/api/scheduling/notification-settings');
      // const data = await response.json();
      
      // Using mock data for now
      // In a real app, you would set the state with data from the API
      // setNotificationSettings(data.settings);
      // setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setAlert({
        open: true,
        message: 'Failed to load notification settings',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (setting) => (event) => {
    if (setting === 'emailEnabled' || setting === 'smsEnabled') {
      setNotificationSettings({
        ...notificationSettings,
        [setting]: event.target.checked
      });
    } else {
      setNotificationSettings({
        ...notificationSettings,
        [setting]: event.target.value
      });
    }
  };

  const handleOpenTemplateDialog = (templateKey) => {
    setCurrentTemplate(templateKey);
    setEditingTemplate({
      ...templates[templateKey]
    });
    setOpenTemplateDialog(true);
  };

  const handleCloseTemplateDialog = () => {
    setOpenTemplateDialog(false);
    setCurrentTemplate(null);
    setEditingTemplate(null);
  };

  const handleOpenHelpDialog = () => {
    setOpenHelpDialog(true);
  };

  const handleCloseHelpDialog = () => {
    setOpenHelpDialog(false);
  };

  const handleTemplateChange = (field) => (event) => {
    setEditingTemplate({
      ...editingTemplate,
      [field]: event.target.value
    });
  };

  const handleTemplateEnabledToggle = (event) => {
    setEditingTemplate({
      ...editingTemplate,
      enabled: event.target.checked
    });
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate) return;
    
    setTemplates({
      ...templates,
      [currentTemplate]: {
        ...editingTemplate
      }
    });
    
    setAlert({
      open: true,
      message: 'Template saved successfully',
      severity: 'success'
    });
    
    handleCloseTemplateDialog();
  };

  const handleResetTemplate = () => {
    if (!currentTemplate) return;
    
    // In a real app, you would fetch the default template from the API
    // For now, we'll just show an alert
    setAlert({
      open: true,
      message: 'Template reset to default',
      severity: 'success'
    });
  };

  const handleSaveAllSettings = async () => {
    try {
      // API call would go here
      // await fetch('/api/scheduling/notification-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     settings: notificationSettings,
      //     templates: templates
      //   })
      // });
      
      setAlert({
        open: true,
        message: 'Notification settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setAlert({
        open: true,
        message: 'Failed to save notification settings',
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const insertPlaceholder = (placeholder) => {
    if (!editingTemplate || !currentTemplate) return;
    
    const field = currentTemplate.startsWith('email') && currentTemplate !== 'emailReminder' && currentTemplate !== 'emailCancellation' 
      ? 'body' 
      : 'body';
    
    const textarea = document.getElementById('template-editor');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editingTemplate[field];
      const newText = text.substring(0, start) + placeholder + text.substring(end);
      
      setEditingTemplate({
        ...editingTemplate,
        [field]: newText
      });
      
      // Focus back on textarea and set cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 100);
    }
  };

  const getTemplateIcon = (templateKey) => {
    if (templateKey.startsWith('email')) {
      return <EmailIcon />;
    } else if (templateKey.startsWith('sms')) {
      return <SmsIcon />;
    }
    return null;
  };

  const getTemplateType = (templateKey) => {
    if (templateKey.includes('BookingConfirmation')) {
      return 'Booking Confirmation';
    } else if (templateKey.includes('Reminder')) {
      return 'Appointment Reminder';
    } else if (templateKey.includes('Cancellation')) {
      return 'Cancellation Notification';
    }
    return 'Unknown';
  };

  const getTemplateName = (templateKey) => {
    if (templateKey.startsWith('email')) {
      return `Email: ${getTemplateType(templateKey)}`;
    } else if (templateKey.startsWith('sms')) {
      return `SMS: ${getTemplateType(templateKey)}`;
    }
    return templateKey;
  };

  // Component for Email Settings Tab
  const EmailSettingsTab = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Email Notification Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch 
                checked={notificationSettings.emailEnabled}
                onChange={handleSettingChange('emailEnabled')}
              />
            }
            label="Enable Email Notifications"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="From Email Address"
            value={notificationSettings.emailFrom}
            onChange={handleSettingChange('emailFrom')}
            disabled={!notificationSettings.emailEnabled}
            helperText="The email address that will appear in the 'From' field"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Reply-To Email Address"
            value={notificationSettings.emailReplyTo}
            onChange={handleSettingChange('emailReplyTo')}
            disabled={!notificationSettings.emailEnabled}
            helperText="The email address where replies will be sent"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Sender Name"
            value={notificationSettings.customSenderName}
            onChange={handleSettingChange('customSenderName')}
            disabled={!notificationSettings.emailEnabled}
            helperText="This name will appear as the sender"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>Email Templates</Typography>
        
        <Grid container spacing={2}>
          {Object.keys(templates)
            .filter(key => key.startsWith('email'))
            .map(templateKey => (
              <Grid item xs={12} sm={6} md={4} key={templateKey}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1">
                        {getTemplateType(templateKey)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" noWrap>
                      Subject: {templates[templateKey].subject}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small"
                            checked={templates[templateKey].enabled}
                            onChange={(event) => {
                              setTemplates({
                                ...templates,
                                [templateKey]: {
                                  ...templates[templateKey],
                                  enabled: event.target.checked
                                }
                              });
                            }}
                            disabled={!notificationSettings.emailEnabled}
                          />
                        }
                        label="Enabled"
                      />
                      
                      <Chip 
                        label={templates[templateKey].enabled ? 'Active' : 'Inactive'}
                        size="small"
                        color={templates[templateKey].enabled ? 'success' : 'default'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenTemplateDialog(templateKey)}
                      disabled={!notificationSettings.emailEnabled}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<PreviewIcon />}
                      disabled={!notificationSettings.emailEnabled}
                    >
                      Preview
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );

  // Component for SMS Settings Tab
  const SmsSettingsTab = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>SMS Notification Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch 
                checked={notificationSettings.smsEnabled}
                onChange={handleSettingChange('smsEnabled')}
              />
            }
            label="Enable SMS Notifications"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="SMS From Number"
            value={notificationSettings.smsFrom}
            onChange={handleSettingChange('smsFrom')}
            disabled={!notificationSettings.smsEnabled}
            helperText="The phone number that will appear as the sender"
            InputProps={{
              startAdornment: <InputAdornment position="start">+</InputAdornment>,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: 2 }}>
            SMS notifications require additional setup and may incur charges based on volume. Contact support for more information.
          </Alert>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>SMS Templates</Typography>
        
        <Grid container spacing={2}>
          {Object.keys(templates)
            .filter(key => key.startsWith('sms'))
            .map(templateKey => (
              <Grid item xs={12} sm={6} md={4} key={templateKey}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SmsIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1">
                        {getTemplateType(templateKey)}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      height: '3em', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {templates[templateKey].body}
                    </Typography>
                    
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            size="small"
                            checked={templates[templateKey].enabled}
                            onChange={(event) => {
                              setTemplates({
                                ...templates,
                                [templateKey]: {
                                  ...templates[templateKey],
                                  enabled: event.target.checked
                                }
                              });
                            }}
                            disabled={!notificationSettings.smsEnabled}
                          />
                        }
                        label="Enabled"
                      />
                      
                      <Chip 
                        label={templates[templateKey].enabled ? 'Active' : 'Inactive'}
                        size="small"
                        color={templates[templateKey].enabled ? 'success' : 'default'}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenTemplateDialog(templateKey)}
                      disabled={!notificationSettings.smsEnabled}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<PreviewIcon />}
                      disabled={!notificationSettings.smsEnabled}
                    >
                      Preview
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Notification Settings</Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveAllSettings}
            >
              Save Settings
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" paragraph>
          Configure email and SMS notifications for bookings, reminders, and cancellations.
        </Typography>
      </Paper>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<EmailIcon />} label="Email Notifications" />
          <Tab icon={<SmsIcon />} label="SMS Notifications" />
        </Tabs>
        
        {activeTab === 0 && <EmailSettingsTab />}
        {activeTab === 1 && <SmsSettingsTab />}
      </Paper>
      
      {/* Template Edit Dialog */}
      <Dialog
        open={openTemplateDialog}
        onClose={handleCloseTemplateDialog}
        maxWidth="md"
        fullWidth
      >
        {currentTemplate && (
          <>
            <DialogTitle>
              Edit {getTemplateName(currentTemplate)}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ my: 2 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={editingTemplate?.enabled || false}
                      onChange={handleTemplateEnabledToggle}
                    />
                  }
                  label="Enable this notification"
                />
              </Box>
              
              {currentTemplate.startsWith('email') && (
                <TextField
                  fullWidth
                  label="Subject"
                  value={editingTemplate?.subject || ''}
                  onChange={handleTemplateChange('subject')}
                  margin="normal"
                />
              )}
              
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={10}
                value={editingTemplate?.body || ''}
                onChange={handleTemplateChange('body')}
                margin="normal"
                id="template-editor"
              />
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Available Placeholders</Typography>
                  <Button
                    size="small"
                    startIcon={<HelpIcon />}
                    onClick={handleOpenHelpDialog}
                  >
                    Help
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {PLACEHOLDERS.map(placeholder => (
                    <Chip
                      key={placeholder.key}
                      label={placeholder.key}
                      onClick={() => insertPlaceholder(placeholder.key)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<RestoreIcon />}
                onClick={handleResetTemplate}
                color="secondary"
              >
                Reset to Default
              </Button>
              <Button onClick={handleCloseTemplateDialog}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSaveTemplate}
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Placeholders Help Dialog */}
      <Dialog
        open={openHelpDialog}
        onClose={handleCloseHelpDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Template Placeholders</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Placeholders are special tags that will be replaced with actual data when the notification is sent. 
            Click on a placeholder to insert it at the cursor position in your template.
          </Typography>
          
          <List dense>
            {PLACEHOLDERS.map(placeholder => (
              <ListItem key={placeholder.key}>
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={placeholder.key}
                  secondary={placeholder.description}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelpDialog}>Close</Button>
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

export default NotificationSettings; 