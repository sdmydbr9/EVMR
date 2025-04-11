import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as LineChartIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Sector
} from 'recharts';

// Mock data for charts
const BOOKING_TRENDS_DATA = [
  { name: 'Jan', bookings: 65, cancellations: 12 },
  { name: 'Feb', bookings: 59, cancellations: 10 },
  { name: 'Mar', bookings: 80, cancellations: 15 },
  { name: 'Apr', bookings: 81, cancellations: 11 },
  { name: 'May', bookings: 56, cancellations: 9 },
  { name: 'Jun', bookings: 55, cancellations: 7 },
  { name: 'Jul', bookings: 40, cancellations: 5 }
];

const WEEKLY_BOOKING_DATA = [
  { name: 'Mon', bookings: 24 },
  { name: 'Tue', bookings: 32 },
  { name: 'Wed', bookings: 45 },
  { name: 'Thu', bookings: 38 },
  { name: 'Fri', bookings: 30 },
  { name: 'Sat', bookings: 17 },
  { name: 'Sun', bookings: 10 }
];

const HOURLY_BOOKING_DATA = [
  { name: '9AM', bookings: 12 },
  { name: '10AM', bookings: 25 },
  { name: '11AM', bookings: 30 },
  { name: '12PM', bookings: 18 },
  { name: '1PM', bookings: 14 },
  { name: '2PM', bookings: 22 },
  { name: '3PM', bookings: 28 },
  { name: '4PM', bookings: 20 }
];

const SERVICE_DISTRIBUTION_DATA = [
  { name: 'Check-up', value: 45 },
  { name: 'Vaccination', value: 25 },
  { name: 'Dental', value: 15 },
  { name: 'Surgery', value: 10 },
  { name: 'Other', value: 5 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF'];

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('last30days');
  const [activeTab, setActiveTab] = useState(0);
  const [bookingSummary, setBookingSummary] = useState({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    noShowBookings: 0,
    averageDuration: 0,
    conversionRate: 0
  });
  const [topServices, setTopServices] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [bookingTrendsData, setBookingTrendsData] = useState(BOOKING_TRENDS_DATA);
  const [weeklyBookingData, setWeeklyBookingData] = useState(WEEKLY_BOOKING_DATA);
  const [hourlyBookingData, setHourlyBookingData] = useState(HOURLY_BOOKING_DATA);
  const [serviceDistributionData, setServiceDistributionData] = useState(SERVICE_DISTRIBUTION_DATA);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch analytics data on mount and when timeRange changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      // API call would go here
      // const response = await fetch(`/api/scheduling/analytics?timeRange=${timeRange}`);
      // const data = await response.json();
      
      // Using mock data for now
      // In a real app, you would set all the state variables with data from the API
      
      // Generate some mock data based on the selected time range
      const mockBookingSummary = {
        totalBookings: 196,
        completedBookings: 147,
        cancelledBookings: 28,
        noShowBookings: 21,
        averageDuration: 35,
        conversionRate: 68.5
      };
      
      const mockTopServices = [
        { name: 'General Check-up', count: 57, percentage: 29.1 },
        { name: 'Vaccination', count: 38, percentage: 19.4 },
        { name: 'Dental Cleaning', count: 25, percentage: 12.8 },
        { name: 'Dermatology', count: 22, percentage: 11.2 },
        { name: 'Surgery', count: 18, percentage: 9.2 }
      ];
      
      const mockTopDoctors = [
        { name: 'Dr. Sarah Johnson', count: 42, conversionRate: 82.4 },
        { name: 'Dr. Robert Smith', count: 38, conversionRate: 76.9 },
        { name: 'Dr. Emily Brown', count: 35, conversionRate: 74.2 },
        { name: 'Dr. Michael Lee', count: 31, conversionRate: 70.5 },
        { name: 'Dr. Jessica Taylor', count: 28, conversionRate: 68.3 }
      ];
      
      setBookingSummary(mockBookingSummary);
      setTopServices(mockTopServices);
      setTopDoctors(mockTopDoctors);
      
      // In a real app, these would also come from the API
      // setBookingTrendsData(data.bookingTrends);
      // setWeeklyBookingData(data.weeklyBookings);
      // setHourlyBookingData(data.hourlyBookings);
      // setServiceDistributionData(data.serviceDistribution);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateRangeChange = () => {
    // In a real app, you would fetch data for the custom date range
    console.log('Custom date range selected:', startDate, endDate);
    setTimeRange('custom');
  };

  const handleExportData = (format) => {
    // In a real app, this would trigger an API call to generate a report
    console.log(`Exporting data in ${format} format`);
  };

  // Handle mouseover for pie chart segments
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Custom active shape for pie chart
  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name}: ${value}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Booking Analytics</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                >
                  <MenuItem value="last7days">Last 7 Days</MenuItem>
                  <MenuItem value="last30days">Last 30 Days</MenuItem>
                  <MenuItem value="last90days">Last 90 Days</MenuItem>
                  <MenuItem value="thisMonth">This Month</MenuItem>
                  <MenuItem value="lastMonth">Last Month</MenuItem>
                  <MenuItem value="thisYear">This Year</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {timeRange === 'custom' && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150, mr: 1 }} />}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150, mr: 1 }} />}
                  />
                </LocalizationProvider>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleDateRangeChange}
                >
                  Apply
                </Button>
              </Box>
            )}
            
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchAnalyticsData}
              size="small"
            >
              Refresh
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Bookings
                </Typography>
                <Typography variant="h4">{bookingSummary.totalBookings}</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4">{bookingSummary.completedBookings}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(bookingSummary.completedBookings / bookingSummary.totalBookings * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Cancelled
                </Typography>
                <Typography variant="h4">{bookingSummary.cancelledBookings}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(bookingSummary.cancelledBookings / bookingSummary.totalBookings * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  No-shows
                </Typography>
                <Typography variant="h4">{bookingSummary.noShowBookings}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {(bookingSummary.noShowBookings / bookingSummary.totalBookings * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Avg. Duration
                </Typography>
                <Typography variant="h4">{bookingSummary.averageDuration}</Typography>
                <Typography variant="body2" color="text.secondary">
                  minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Conversion Rate
                </Typography>
                <Typography variant="h4">{bookingSummary.conversionRate}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  of visitors book
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Booking Trends" icon={<LineChartIcon />} iconPosition="start" />
          <Tab label="Service Distribution" icon={<PieChartIcon />} iconPosition="start" />
          <Tab label="Time Analysis" icon={<BarChartIcon />} iconPosition="start" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Booking Trends Tab */}
          {activeTab === 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Booking Trends Over Time</Typography>
                <Box>
                  <Tooltip title="Export as CSV">
                    <IconButton size="small" onClick={() => handleExportData('csv')}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print Report">
                    <IconButton size="small" onClick={() => handleExportData('print')}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer>
                  <LineChart
                    data={bookingTrendsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="cancellations" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Typography variant="h6" gutterBottom>Top Booked Services</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Service Name</TableCell>
                          <TableCell align="right">Bookings</TableCell>
                          <TableCell align="right">% of Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topServices.map((service) => (
                          <TableRow key={service.name}>
                            <TableCell component="th" scope="row">
                              {service.name}
                            </TableCell>
                            <TableCell align="right">{service.count}</TableCell>
                            <TableCell align="right">{service.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                <Grid item xs={12} md={5}>
                  <Typography variant="h6" gutterBottom>Top Booked Doctors</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Doctor Name</TableCell>
                          <TableCell align="right">Bookings</TableCell>
                          <TableCell align="right">Conv. Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topDoctors.map((doctor) => (
                          <TableRow key={doctor.name}>
                            <TableCell component="th" scope="row">
                              {doctor.name}
                            </TableCell>
                            <TableCell align="right">{doctor.count}</TableCell>
                            <TableCell align="right">{doctor.conversionRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </>
          )}
          
          {/* Service Distribution Tab */}
          {activeTab === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Service Booking Distribution</Typography>
                <Box>
                  <Tooltip title="Export as CSV">
                    <IconButton size="small" onClick={() => handleExportData('csv')}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={serviceDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={120}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {serviceDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Alert severity="info" icon={<InfoIcon />}>
                    <Typography variant="subtitle2">Booking Distribution Insights</Typography>
                    <Typography variant="body2">
                      General Check-ups account for almost one-third of all bookings, indicating strong demand for routine care. Consider increasing availability for this service.
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Alert severity="success" icon={<InfoIcon />}>
                    <Typography variant="subtitle2">Growth Opportunities</Typography>
                    <Typography variant="body2">
                      Dental services have the highest conversion rate at 78%. Consider expanding these services or promoting them more prominently.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </>
          )}
          
          {/* Time Analysis Tab */}
          {activeTab === 2 && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Bookings by Day of Week</Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={weeklyBookingData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="bookings" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Bookings by Time of Day</Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={hourlyBookingData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="bookings" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Peak Hour Analysis</Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      Wednesday and Thursday are your busiest days, with 11AM being the most popular time slot. Consider ensuring you're fully staffed during these peak times.
                    </Typography>
                  </Alert>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label="Most Popular: 11AM"
                      color="primary"
                      icon={<InfoIcon />}
                    />
                    <Chip
                      label="Busiest Day: Wednesday"
                      color="secondary"
                      icon={<InfoIcon />}
                    />
                    <Chip
                      label="Least Utilized: 9AM"
                      color="default"
                      icon={<InfoIcon />}
                    />
                    <Chip
                      label="Quietest Day: Sunday"
                      color="default"
                      icon={<InfoIcon />}
                    />
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard; 