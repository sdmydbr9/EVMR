import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    Tabs, 
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    PieChart,
    Pie,
    Cell,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import ServiceManagement from './ServiceManagement';
import AppointmentManagement from './AppointmentManagement';
import DoctorWorkload from './DoctorWorkload';
import InventoryUsage from './InventoryUsage';
import PatientVisits from './PatientVisits';

const COLORS = ['#00C49F', '#FF8042', '#8884d8', '#72FF7D', '#FF6B6B', '#FFBB28'];

const AdminDashboard = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(0);
    const [appointmentData, setAppointmentData] = useState([]);
    const [serviceData, setServiceData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [doctorWorkloadData, setDoctorWorkloadData] = useState([]);
    const [patientVisitData, setPatientVisitData] = useState([]);
    const [period, setPeriod] = useState('daily');
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        totalServices: 0,
        activePatients: 0
    });
    const [alert, setAlert] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Initialize activeTab based on URL parameter
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            const tabValue = parseInt(tabParam, 10);
            if (!isNaN(tabValue) && tabValue >= 0 && tabValue <= 5) {
                setActiveTab(tabValue);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [period]);

    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // Fetch appointment trends
            const appointmentResponse = await fetch(`/api/services/analytics/appointments?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (appointmentResponse.ok) {
                const appointmentData = await appointmentResponse.json();
                setAppointmentData(appointmentData);
            } else {
                throw new Error('Failed to fetch appointment data');
            }

            // Fetch service popularity
            const serviceResponse = await fetch('/api/services/analytics/services', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (serviceResponse.ok) {
                const serviceData = await serviceResponse.json();
                setServiceData(serviceData);
            } else {
                throw new Error('Failed to fetch service data');
            }

            // Fetch inventory usage
            const inventoryResponse = await fetch('/api/services/analytics/inventory-usage', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (inventoryResponse.ok) {
                const inventoryData = await inventoryResponse.json();
                setInventoryData(inventoryData);
            } else {
                throw new Error('Failed to fetch inventory data');
            }

            // Fetch doctor workload
            const doctorResponse = await fetch('/api/services/analytics/doctor-workload', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (doctorResponse.ok) {
                const doctorData = await doctorResponse.json();
                setDoctorWorkloadData(doctorData);
            } else {
                throw new Error('Failed to fetch doctor workload data');
            }

            // Fetch patient visits
            const patientResponse = await fetch(`/api/services/analytics/patient-visits?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (patientResponse.ok) {
                const patientData = await patientResponse.json();
                setPatientVisitData(patientData);
            } else {
                throw new Error('Failed to fetch patient visits data');
            }

            // Fetch overall stats
            const statsResponse = await fetch('/api/services/analytics/overview', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            } else {
                // Mock data if endpoint not available
                setStats({
                    totalAppointments: appointmentData.reduce((sum, item) => sum + item.count, 0),
                    pendingAppointments: Math.floor(Math.random() * 20),
                    totalServices: serviceData.length,
                    activePatients: Math.floor(Math.random() * 100) + 50
                });
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            setAlert({
                open: true,
                message: 'Error loading analytics: ' + error.message,
                severity: 'error'
            });
            
            // Mock data for demo purposes
            setAppointmentData([
                { _id: 'Mon', count: 10 },
                { _id: 'Tue', count: 15 },
                { _id: 'Wed', count: 8 },
                { _id: 'Thu', count: 12 },
                { _id: 'Fri', count: 20 },
                { _id: 'Sat', count: 18 },
                { _id: 'Sun', count: 5 }
            ]);
            
            setServiceData([
                { _id: '1', count: 25, serviceDetails: [{ name: 'Check-ups' }] },
                { _id: '2', count: 18, serviceDetails: [{ name: 'Vaccinations' }] },
                { _id: '3', count: 15, serviceDetails: [{ name: 'Surgeries' }] },
                { _id: '4', count: 12, serviceDetails: [{ name: 'Consultations' }] },
                { _id: '5', count: 8, serviceDetails: [{ name: 'Laboratory Tests' }] }
            ]);
            
            setInventoryData([
                { name: 'Vaccines', value: 35 },
                { name: 'Medications', value: 25 },
                { name: 'Supplies', value: 20 },
                { name: 'Equipment', value: 15 },
                { name: 'Food', value: 5 }
            ]);
            
            setDoctorWorkloadData([
                { name: 'Dr. Johnson', appointments: 28 },
                { name: 'Dr. Smith', appointments: 22 },
                { name: 'Dr. Williams', appointments: 19 },
                { name: 'Dr. Brown', appointments: 15 },
                { name: 'Dr. Davis', appointments: 12 }
            ]);
            
            setPatientVisitData([
                { date: 'Mon', visits: 12 },
                { date: 'Tue', visits: 19 },
                { date: 'Wed', visits: 10 },
                { date: 'Thu', visits: 15 },
                { date: 'Fri', visits: 22 },
                { date: 'Sat', visits: 18 },
                { date: 'Sun', visits: 8 }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        // Update URL with the new tab
        searchParams.set('tab', newValue.toString());
        setSearchParams(searchParams);
    };

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };
    
    const handleCloseAlert = () => {
        setAlert({
            ...alert,
            open: false
        });
    };

    return (
        <Container maxWidth="xl">
            <Snackbar 
                open={alert.open} 
                autoHideDuration={6000} 
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
            
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Your Daily Health Snapshot
                    </Typography>
                    
                    {activeTab === 0 && (
                        <Button 
                            startIcon={<RefreshIcon />} 
                            onClick={fetchAnalyticsData} 
                            variant="contained"
                            disabled={isLoading}
                            sx={{ 
                                bgcolor: 'primary.main', 
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                    boxShadow: '0px 4px 10px rgba(0, 196, 159, 0.25)'
                                }
                            }}
                        >
                            Refresh Analytics
                        </Button>
                    )}
                </Box>
                
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    sx={{ 
                        mb: 3,
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'primary.main',
                            height: 3,
                        }
                    }} 
                    variant="scrollable" 
                    scrollButtons="auto"
                >
                    <Tab label="Overview" sx={{ 
                        textTransform: 'none', 
                        fontWeight: 500,
                        color: activeTab === 0 ? 'primary.main' : 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' },
                    }} />
                    <Tab label="Services" sx={{ 
                        textTransform: 'none', 
                        fontWeight: 500,
                        color: activeTab === 1 ? 'primary.main' : 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' },
                    }} />
                    <Tab label="Appointments" sx={{ 
                        textTransform: 'none', 
                        fontWeight: 500,
                        color: activeTab === 2 ? 'primary.main' : 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' },
                    }} />
                    <Tab label="Doctor Workload" sx={{ 
                        textTransform: 'none', 
                        fontWeight: 500,
                        color: activeTab === 3 ? 'primary.main' : 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' },
                    }} />
                    <Tab label="Inventory Usage" sx={{ 
                        textTransform: 'none', 
                        fontWeight: 500,
                        color: activeTab === 4 ? 'primary.main' : 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' },
                    }} />
                    <Tab label="Patient Visits" sx={{ 
                        textTransform: 'none', 
                        fontWeight: 500,
                        color: activeTab === 5 ? 'primary.main' : 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' },
                    }} />
                </Tabs>

                {activeTab === 0 && (
                    <>
                        {/* Stats Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ 
                                    bgcolor: 'background.paper', 
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                }}>
                                    <CardContent>
                                        <Typography color="text.secondary" gutterBottom>
                                            Total Appointments
                                        </Typography>
                                        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                            {isLoading ? <CircularProgress size={24} /> : stats.totalAppointments}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ 
                                    bgcolor: 'background.paper', 
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                }}>
                                    <CardContent>
                                        <Typography color="text.secondary" gutterBottom>
                                            Pending Appointments
                                        </Typography>
                                        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                            {isLoading ? <CircularProgress size={24} /> : stats.pendingAppointments}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ 
                                    bgcolor: 'background.paper', 
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                }}>
                                    <CardContent>
                                        <Typography color="text.secondary" gutterBottom>
                                            Total Services
                                        </Typography>
                                        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                            {isLoading ? <CircularProgress size={24} /> : stats.totalServices}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ 
                                    bgcolor: 'background.paper', 
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                }}>
                                    <CardContent>
                                        <Typography color="text.secondary" gutterBottom>
                                            Active Patients
                                        </Typography>
                                        <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                            {isLoading ? <CircularProgress size={24} /> : stats.activePatients}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Period Selector */}
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <FormControl sx={{ minWidth: 150 }} size="small">
                                <InputLabel id="period-select-label">Period</InputLabel>
                                <Select
                                    labelId="period-select-label"
                                    value={period}
                                    label="Period"
                                    onChange={handlePeriodChange}
                                    disabled={isLoading}
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'divider',
                                        },
                                    }}
                                >
                                    <MenuItem value="daily">Daily</MenuItem>
                                    <MenuItem value="weekly">Weekly</MenuItem>
                                    <MenuItem value="monthly">Monthly</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {/* Appointment Trends Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ 
                                        p: 3, 
                                        bgcolor: 'background.paper',
                                        borderRadius: 4,
                                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                    }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            Appointment Trends
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={appointmentData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="_id" stroke="#AAAAAA" />
                                                <YAxis stroke="#AAAAAA" />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#3A3A3A', 
                                                        borderColor: '#4A4A4A',
                                                        color: '#FFFFFF'
                                                    }} 
                                                />
                                                <Legend />
                                                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d830" name="Appointments" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>

                                {/* Service Popularity Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ 
                                        p: 3, 
                                        bgcolor: 'background.paper',
                                        borderRadius: 4,
                                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                    }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            Service Popularity
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={serviceData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="serviceDetails[0].name" stroke="#AAAAAA" />
                                                <YAxis stroke="#AAAAAA" />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#3A3A3A', 
                                                        borderColor: '#4A4A4A',
                                                        color: '#FFFFFF'
                                                    }} 
                                                />
                                                <Legend />
                                                <Bar dataKey="count" fill="#00C49F" name="Appointments" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>

                                {/* Doctor Workload Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ 
                                        p: 3, 
                                        bgcolor: 'background.paper',
                                        borderRadius: 4,
                                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                    }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            Doctor Workload
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={doctorWorkloadData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis type="number" stroke="#AAAAAA" />
                                                <YAxis dataKey="name" type="category" width={100} stroke="#AAAAAA" />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#3A3A3A', 
                                                        borderColor: '#4A4A4A',
                                                        color: '#FFFFFF'
                                                    }} 
                                                />
                                                <Legend />
                                                <Bar dataKey="appointments" fill="#FF8042" name="Appointments" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>

                                {/* Inventory Usage Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ 
                                        p: 3, 
                                        bgcolor: 'background.paper',
                                        borderRadius: 4,
                                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                    }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            Inventory Usage
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={inventoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    nameKey="name"
                                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {inventoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#3A3A3A', 
                                                        borderColor: '#4A4A4A',
                                                        color: '#FFFFFF'
                                                    }} 
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>

                                {/* Patient Visits Chart */}
                                <Grid item xs={12}>
                                    <Paper sx={{ 
                                        p: 3, 
                                        bgcolor: 'background.paper',
                                        borderRadius: 4,
                                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                                    }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            Patient Visits
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={patientVisitData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="date" stroke="#AAAAAA" />
                                                <YAxis stroke="#AAAAAA" />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: '#3A3A3A', 
                                                        borderColor: '#4A4A4A',
                                                        color: '#FFFFFF'
                                                    }} 
                                                />
                                                <Legend />
                                                <Line type="monotone" dataKey="visits" stroke="#FF8042" name="Visits" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, strokeWidth: 2 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </>
                )}

                {activeTab === 1 && <ServiceManagement />}
                {activeTab === 2 && <AppointmentManagement />}
                {activeTab === 3 && <DoctorWorkload />}
                {activeTab === 4 && <InventoryUsage />}
                {activeTab === 5 && <PatientVisits />}
            </Box>
        </Container>
    );
};

export default AdminDashboard; 