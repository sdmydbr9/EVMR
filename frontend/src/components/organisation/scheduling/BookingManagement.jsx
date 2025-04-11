import React from 'react';
import { Box, Typography, Paper, Grid, Divider, Button, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Card, CardContent } from '@mui/material';

const BookingManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Booking Management
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure how patients book appointments and manage your booking flow.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Links
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <TextField
              fullWidth
              label="Direct Booking Link"
              value="https://yourdomain.com/book"
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined">
                Copy Link
              </Button>
              <Button variant="outlined">
                QR Code
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Availability
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Allow online booking"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Booking window start</InputLabel>
                  <Select
                    label="Booking window start"
                    defaultValue={0}
                  >
                    <MenuItem value={0}>Immediately</MenuItem>
                    <MenuItem value={1}>1 day in advance</MenuItem>
                    <MenuItem value={2}>2 days in advance</MenuItem>
                    <MenuItem value={7}>1 week in advance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Booking window end</InputLabel>
                  <Select
                    label="Booking window end"
                    defaultValue={30}
                  >
                    <MenuItem value={7}>1 week</MenuItem>
                    <MenuItem value={14}>2 weeks</MenuItem>
                    <MenuItem value={30}>1 month</MenuItem>
                    <MenuItem value={60}>2 months</MenuItem>
                    <MenuItem value={90}>3 months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Form Configuration
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Required Fields
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Patient Name"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Phone Number"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Address"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch />}
                  label="Additional Notes"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Service Selection"
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Custom Fields
            </Typography>
            
            <Button variant="outlined" sx={{ mb: 2 }}>
              Add Custom Field
            </Button>
            
            <Typography color="text.secondary">
              No custom fields added yet
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Confirmation
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Send email confirmation"
                  sx={{ mb: 2, display: 'block' }}
                />
                
                <TextField
                  fullWidth
                  label="Email Subject"
                  defaultValue="Appointment Confirmation"
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Email Message"
                  defaultValue="Thank you for booking an appointment with us. Here are your appointment details:"
                  multiline
                  rows={4}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Send SMS confirmation"
                  sx={{ mb: 2, display: 'block' }}
                />
                
                <TextField
                  fullWidth
                  label="SMS Message"
                  defaultValue="Your appointment is confirmed. {{date}} at {{time}} with {{doctor}}. Reply Y to confirm or call us to reschedule."
                  multiline
                  rows={4}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary">
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default BookingManagement; 