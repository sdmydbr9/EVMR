import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Switch,
  FormControlLabel,
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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  AlertTitle,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { mockCancellationPolicies, mockCancellationRequests } from '../../../mockData';
import { mockServiceTypes } from '../../../mockData';

const CancellationManagement = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Policies state
  const [policies, setPolicies] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [currentPolicy, setCurrentPolicy] = useState({
    name: '',
    description: '',
    timeFrame: {
      value: 24,
      unit: 'hours'
    },
    refundPercentage: 100,
    autoApprove: true,
    serviceTypeIds: [],
    allowRescheduling: true,
    reschedulingTimeFrame: {
      value: 48,
      unit: 'hours'
    },
    reschedulingFee: 0
  });

  // Requests state
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState('all');

  // Analytics state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('month');
  const [topCancellationReasons, setTopCancellationReasons] = useState([
    { reason: 'Schedule Conflict', count: 24, percentage: 40 },
    { reason: 'Illness', count: 18, percentage: 30 },
    { reason: 'Transportation Issues', count: 10, percentage: 16.7 },
    { reason: 'Family Emergency', count: 8, percentage: 13.3 }
  ]);

  // Alerts state
  const [alert, setAlert] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    defaultCancellationWindow: 24,
    defaultRefundPercentage: 100,
    enableAutoApproval: true,
    defaultReschedulingWindow: 48,
    defaultReschedulingFee: 0,
    notifyAdminsOnNewRequests: true
  });

  // Load mock data on component mount
  useEffect(() => {
    setPolicies(mockCancellationPolicies);
    setRequests(mockCancellationRequests);
    setFilteredRequests(mockCancellationRequests);
  }, []);

  // Filter requests when filter changes
  useEffect(() => {
    if (requestFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(req => req.status === requestFilter));
    }
  }, [requestFilter, requests]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Policy dialog functions
  const openCreateDialog = () => {
    setEditingPolicy(null);
    setCurrentPolicy({
      name: '',
      description: '',
      timeFrame: {
        value: 24,
        unit: 'hours'
      },
      refundPercentage: 100,
      autoApprove: true,
      serviceTypeIds: [],
      allowRescheduling: true,
      reschedulingTimeFrame: {
        value: 48,
        unit: 'hours'
      },
      reschedulingFee: 0
    });
    setDialogOpen(true);
  };

  const openEditDialog = (policy) => {
    setEditingPolicy(policy);
    setCurrentPolicy({...policy});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    setCurrentPolicy(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeFrameChange = (e) => {
    const { name, value } = e.target;
    setCurrentPolicy(prev => ({
      ...prev,
      timeFrame: {
        ...prev.timeFrame,
        [name]: value
      }
    }));
  };

  const handleReschedulingTimeFrameChange = (e) => {
    const { name, value } = e.target;
    setCurrentPolicy(prev => ({
      ...prev,
      reschedulingTimeFrame: {
        ...prev.reschedulingTimeFrame,
        [name]: value
      }
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setCurrentPolicy(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleServiceTypesChange = (e) => {
    setCurrentPolicy(prev => ({
      ...prev,
      serviceTypeIds: e.target.value
    }));
  };

  const handleSavePolicy = () => {
    // Simulate API call to save policy
    setTimeout(() => {
      if (editingPolicy) {
        // Update existing policy
        setPolicies(prev => 
          prev.map(p => p._id === editingPolicy._id ? {...currentPolicy, _id: editingPolicy._id} : p)
        );
        setAlert({
          type: 'success',
          message: 'Policy updated successfully'
        });
      } else {
        // Create new policy
        const newPolicy = {
          ...currentPolicy,
          _id: `policy_${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        setPolicies(prev => [...prev, newPolicy]);
        setAlert({
          type: 'success',
          message: 'New policy created successfully'
        });
      }
      closeDialog();
    }, 500);
  };

  const handleDeletePolicy = (policyId) => {
    // Simulate API call to delete policy
    setTimeout(() => {
      setPolicies(prev => prev.filter(p => p._id !== policyId));
      setAlert({
        type: 'success',
        message: 'Policy deleted successfully'
      });
    }, 500);
  };

  // Request handling functions
  const handleRequestAction = (requestId, action) => {
    // Simulate API call to approve or reject request
    setTimeout(() => {
      setRequests(prev => 
        prev.map(req => {
          if (req._id === requestId) {
            return {
              ...req,
              status: action === 'approve' ? 'approved' : 'rejected',
              processedBy: 'Current User'
            };
          }
          return req;
        })
      );
      setAlert({
        type: 'success',
        message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });
    }, 500);
  };

  // Settings functions
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsSwitchChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const saveSettings = () => {
    // Simulate API call to save settings
    setTimeout(() => {
      setAlert({
        type: 'success',
        message: 'Settings saved successfully'
      });
    }, 500);
  };

  // Helper functions for rendering
  const getStatusChip = (status) => {
    let color;
    switch(status) {
      case 'pending':
        color = 'warning';
        break;
      case 'approved':
        color = 'success';
        break;
      case 'rejected':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return <Chip size="small" label={status} color={color} />;
  };

  const getServiceTypeNames = (serviceTypeIds) => {
    return serviceTypeIds.map(id => {
      const serviceType = mockServiceTypes.find(st => st._id === id);
      return serviceType ? serviceType.name : id;
    }).join(', ');
  };

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Cancellation Management</Typography>
      </Box>

      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlert(null)}
        >
          <AlertTitle>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</AlertTitle>
          {alert.message}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Policies" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Requests" icon={<RefreshIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Policies Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Create Policy
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Cancellation Window</TableCell>
                  <TableCell>Refund %</TableCell>
                  <TableCell>Auto Approve</TableCell>
                  <TableCell>Services</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {policies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">No policies found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  policies.map((policy) => (
                    <TableRow key={policy._id}>
                      <TableCell>{policy.name}</TableCell>
                      <TableCell>{policy.description}</TableCell>
                      <TableCell>{`${policy.timeFrame.value} ${policy.timeFrame.unit}`}</TableCell>
                      <TableCell>{policy.refundPercentage}%</TableCell>
                      <TableCell>{policy.autoApprove ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{getServiceTypeNames(policy.serviceTypeIds)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openEditDialog(policy)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeletePolicy(policy._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Requests Tab */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                label="Filter"
              >
                <MenuItem value="all">All Requests</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Policy</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Refund Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="textSecondary">No requests found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.userName}</TableCell>
                      <TableCell>
                        {new Date(request.appointmentDate).toLocaleDateString()} at {request.appointmentTime}
                      </TableCell>
                      <TableCell>{request.serviceName}</TableCell>
                      <TableCell>{request.policyName}</TableCell>
                      <TableCell>
                        <Tooltip title={request.reason}>
                          <Typography noWrap sx={{ maxWidth: 150 }}>
                            {request.reason}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>${request.refundAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusChip(request.status)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleRequestAction(request._id, 'approve')}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRequestAction(request._id, 'reject')}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Analytics Tab */}
      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={analyticsTimeframe}
                onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                label="Timeframe"
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Cancellation Rate
                  </Typography>
                  <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
                    8.2%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    60 cancellations out of 732 total appointments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Revenue Impact
                  </Typography>
                  <Typography variant="h3" color="error" sx={{ mb: 2 }}>
                    $1,450
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total refunds issued due to cancellations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Cancellation Reasons
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Reason</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topCancellationReasons.map((reason) => (
                          <TableRow key={reason.reason}>
                            <TableCell>{reason.reason}</TableCell>
                            <TableCell align="right">{reason.count}</TableCell>
                            <TableCell align="right">{reason.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Settings Tab */}
      {tabValue === 3 && (
        <Box>
          <Paper sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Default Cancellation Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Cancellation Window (hours)"
                  name="defaultCancellationWindow"
                  value={settings.defaultCancellationWindow}
                  onChange={handleSettingsChange}
                  type="number"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Refund Percentage"
                  name="defaultRefundPercentage"
                  value={settings.defaultRefundPercentage}
                  onChange={handleSettingsChange}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: '%'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableAutoApproval}
                      onChange={handleSettingsSwitchChange}
                      name="enableAutoApproval"
                      color="primary"
                    />
                  }
                  label="Enable automatic approval for valid cancellation requests"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Rescheduling Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Rescheduling Window (hours)"
                  name="defaultReschedulingWindow"
                  value={settings.defaultReschedulingWindow}
                  onChange={handleSettingsChange}
                  type="number"
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Rescheduling Fee"
                  name="defaultReschedulingFee"
                  value={settings.defaultReschedulingFee}
                  onChange={handleSettingsChange}
                  type="number"
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifyAdminsOnNewRequests}
                    onChange={handleSettingsSwitchChange}
                    name="notifyAdminsOnNewRequests"
                    color="primary"
                  />
                }
                label="Notify administrators when new cancellation requests are received"
              />
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveSettings}
              >
                Save Settings
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Policy Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPolicy ? 'Edit Cancellation Policy' : 'Create Cancellation Policy'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Policy Name"
                name="name"
                value={currentPolicy.name}
                onChange={handlePolicyChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Service Types</InputLabel>
                <Select
                  multiple
                  name="serviceTypeIds"
                  value={currentPolicy.serviceTypeIds}
                  onChange={handleServiceTypesChange}
                  renderValue={(selected) => getServiceTypeNames(selected)}
                  label="Service Types"
                >
                  {mockServiceTypes.map((type) => (
                    <MenuItem key={type._id} value={type._id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentPolicy.description}
                onChange={handlePolicyChange}
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Cancellation Rules
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Time Frame Value"
                name="value"
                value={currentPolicy.timeFrame.value}
                onChange={handleTimeFrameChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Time Unit</InputLabel>
                <Select
                  name="unit"
                  value={currentPolicy.timeFrame.unit}
                  onChange={handleTimeFrameChange}
                  label="Time Unit"
                >
                  <MenuItem value="hours">Hours</MenuItem>
                  <MenuItem value="days">Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Refund Percentage"
                name="refundPercentage"
                value={currentPolicy.refundPercentage}
                onChange={handlePolicyChange}
                type="number"
                InputProps={{
                  endAdornment: '%'
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentPolicy.autoApprove}
                    onChange={handleSwitchChange}
                    name="autoApprove"
                    color="primary"
                  />
                }
                label="Auto approve cancellations meeting this policy"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Rescheduling Rules
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentPolicy.allowRescheduling}
                    onChange={handleSwitchChange}
                    name="allowRescheduling"
                    color="primary"
                  />
                }
                label="Allow rescheduling instead of cancellation"
              />
            </Grid>
            
            {currentPolicy.allowRescheduling && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Rescheduling Time Frame"
                    name="value"
                    value={currentPolicy.reschedulingTimeFrame.value}
                    onChange={handleReschedulingTimeFrameChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Time Unit</InputLabel>
                    <Select
                      name="unit"
                      value={currentPolicy.reschedulingTimeFrame.unit}
                      onChange={handleReschedulingTimeFrameChange}
                      label="Time Unit"
                    >
                      <MenuItem value="hours">Hours</MenuItem>
                      <MenuItem value="days">Days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Rescheduling Fee"
                    name="reschedulingFee"
                    value={currentPolicy.reschedulingFee}
                    onChange={handlePolicyChange}
                    type="number"
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            onClick={handleSavePolicy} 
            variant="contained" 
            color="primary"
            disabled={!currentPolicy.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CancellationManagement; 