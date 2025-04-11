import React from 'react';
import { Box, Typography, Paper, Grid, Divider, TextField, Button, Card, CardContent, Switch, FormControlLabel, Chip } from '@mui/material';

const DeveloperTools = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        API & Developer Tools
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Access API keys, webhooks, and integration documentation for your scheduling system.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Keys
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Production API Key"
                  value="sk_prod_*****************************"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Button variant="outlined" size="small">
                        Show
                      </Button>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Test API Key"
                  value="sk_test_*****************************"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Button variant="outlined" size="small">
                        Show
                      </Button>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary">
                  Regenerate Keys
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Webhooks
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Webhook URL"
                  placeholder="https://your-server.com/webhook"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Events to Trigger
                </Typography>
                <Grid container spacing={1}>
                  <Grid item>
                    <Chip label="appointment.created" variant="outlined" color="primary" />
                  </Grid>
                  <Grid item>
                    <Chip label="appointment.updated" variant="outlined" color="primary" />
                  </Grid>
                  <Grid item>
                    <Chip label="appointment.cancelled" variant="outlined" color="primary" />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary">
                  Save Webhook
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Documentation
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1" paragraph>
              Our API documentation provides detailed information about endpoints, request formats, and response structures.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      REST API
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Standard RESTful API for integrating with your applications.
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      GraphQL API
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Query exactly the data you need with our GraphQL API.
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Webhooks
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Event-driven integration with webhook notifications.
                    </Typography>
                    <Button variant="outlined" fullWidth>
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Settings
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable API Access"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Allow Third-Party Integrations"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Require API Key for Public Endpoints"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Log API Requests"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeveloperTools; 