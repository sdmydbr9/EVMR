import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, 
  TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, CardHeader,
  Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths } from 'date-fns';
import axios from 'axios';

// Report service for API calls
const reportService = {
  getReports: async (params) => {
    try {
      const response = await axios.get('/api/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }
};

const ReportDashboard = () => {
  // State for date range
  const [startDate, setStartDate] = useState(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [reportType, setReportType] = useState('appointments');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({});
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Load reports on component mount and when filters change
  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, reportType]);
  
  // Fetch reports based on selected parameters
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        type: reportType
      };
      
      // In development, use placeholder data
      if (process.env.NODE_ENV === 'development') {
        setReportData(getMockReportData(reportType));
        setLoading(false);
        return;
      }
      
      const data = await reportService.getReports(params);
      setReportData(data);
    } catch (error) {
      showNotification('Error loading reports', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Mock data for development
  const getMockReportData = (type) => {
    switch (type) {
      case 'appointments':
        return {
          title: 'Appointment Analytics',
          summary: {
            total: 187,
            completed: 152,
            cancelled: 23,
            noShow: 12
          },
          byType: [
            { name: 'Check-up', value: 82 },
            { name: 'Vaccination', value: 45 },
            { name: 'Surgery', value: 15 },
            { name: 'Emergency', value: 28 },
            { name: 'Follow-up', value: 17 }
          ],
          byDay: [
            { name: 'Monday', value: 32 },
            { name: 'Tuesday', value: 37 },
            { name: 'Wednesday', value: 41 },
            { name: 'Thursday', value: 34 },
            { name: 'Friday', value: 28 },
            { name: 'Saturday', value: 15 },
            { name: 'Sunday', value: 0 }
          ],
          trend: [
            { name: 'Week 1', value: 45 },
            { name: 'Week 2', value: 52 },
            { name: 'Week 3', value: 48 },
            { name: 'Week 4', value: 42 }
          ]
        };
      case 'revenue':
        return {
          title: 'Revenue Analysis',
          summary: {
            total: 15842.50,
            avgPerDay: 528.08,
            highest: 2154.75,
            highestDate: '2025-03-15'
          },
          byService: [
            { name: 'Exams', value: 5240.50 },
            { name: 'Surgeries', value: 4875.00 },
            { name: 'Vaccinations', value: 2350.75 },
            { name: 'Pharmacy', value: 1985.25 },
            { name: 'Imaging', value: 1391.00 }
          ],
          trend: [
            { name: 'Week 1', value: 3850.50 },
            { name: 'Week 2', value: 4250.25 },
            { name: 'Week 3', value: 3975.75 },
            { name: 'Week 4', value: 3766.00 }
          ]
        };
      case 'inventory':
        return {
          title: 'Inventory Usage Analysis',
          summary: {
            totalItems: 285,
            lowStock: 14,
            outOfStock: 3,
            expiringItems: 8
          },
          byCategory: [
            { name: 'Medication', value: 98 },
            { name: 'Vaccines', value: 32 },
            { name: 'Supplies', value: 105 },
            { name: 'Food', value: 25 },
            { name: 'Equipment', value: 25 }
          ],
          mostUsed: [
            { name: 'Gauze Pads', value: 145 },
            { name: 'Surgical Gloves', value: 132 },
            { name: 'Amoxicillin', value: 87 },
            { name: 'Rabies Vaccine', value: 42 },
            { name: 'Syringes', value: 39 }
          ]
        };
      case 'patients':
        return {
          title: 'Patient Demographics',
          summary: {
            totalPatients: 425,
            newThisMonth: 28,
            activePatients: 312,
            inactivePatients: 113
          },
          bySpecies: [
            { name: 'Dogs', value: 215 },
            { name: 'Cats', value: 172 },
            { name: 'Birds', value: 18 },
            { name: 'Rabbits', value: 12 },
            { name: 'Other', value: 8 }
          ],
          byAge: [
            { name: '<1 year', value: 48 },
            { name: '1-3 years', value: 135 },
            { name: '4-7 years', value: 142 },
            { name: '8-12 years', value: 78 },
            { name: '13+ years', value: 22 }
          ],
          visitFrequency: [
            { name: '0 visits', value: 113 },
            { name: '1 visit', value: 97 },
            { name: '2 visits', value: 124 },
            { name: '3+ visits', value: 91 }
          ]
        };
      default:
        return { title: 'No data available' };
    }
  };
  
  // Handle report type change
  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };
  
  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <Box sx={{ 
      p: 3,
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchReports}
        >
          Refresh Data
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={handleReportTypeChange}
                label="Report Type"
              >
                <MenuItem value="appointments">Appointment Analytics</MenuItem>
                <MenuItem value="revenue">Revenue Analysis</MenuItem>
                <MenuItem value="inventory">Inventory Usage</MenuItem>
                <MenuItem value="patients">Patient Demographics</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newDate) => setEndDate(newDate)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => {
                // In a real app, this would generate a PDF or CSV
                showNotification('Report download started');
              }}
              sx={{ height: '100%' }}
            >
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : reportData.title ? (
        <Box>
          {/* Report Title */}
          <Typography variant="h5" sx={{ mb: 3 }}>
            {reportData.title} ({format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')})
          </Typography>
          
          {/* Summary Cards */}
          {reportData.summary && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.entries(reportData.summary).map(([key, value]) => (
                <Grid item xs={6} md={3} key={key}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <Typography variant="h5" component="div">
                        {typeof value === 'number' && key.toLowerCase().includes('total') && reportType === 'revenue' 
                          ? `$${value.toFixed(2)}` 
                          : value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Charts */}
          <Grid container spacing={3}>
            {/* Chart 1 */}
            {reportData.byType && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Distribution by Type
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.byType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => reportType === 'revenue' ? `$${value}` : value} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 2 */}
            {reportData.byDay && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Distribution by Day
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.byDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => reportType === 'revenue' ? `$${value}` : value} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 3 */}
            {reportData.byService && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Revenue by Service
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.byService}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 4 */}
            {reportData.byCategory && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Items by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.byCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 5 */}
            {reportData.bySpecies && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Patients by Species
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.bySpecies}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.bySpecies.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 6 */}
            {reportData.byAge && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Patients by Age
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.byAge}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 7 */}
            {reportData.trend && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Trend Analysis
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => reportType === 'revenue' ? `$${value}` : value} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        name={reportType === 'revenue' ? 'Revenue' : 'Count'} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 8 */}
            {reportData.mostUsed && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Most Used Items
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={reportData.mostUsed}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name="Usage Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Chart 9 */}
            {reportData.visitFrequency && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Visit Frequency
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.visitFrequency}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.visitFrequency.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No report data available for the selected parameters
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportDashboard; 