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
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    IconButton,
    TablePagination
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import PetsIcon from '@mui/icons-material/Pets';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ServiceManagement from './ServiceManagement';
import AppointmentManagement from './AppointmentManagement';
import DoctorWorkload from './DoctorWorkload';
import InventoryUsage from './InventoryUsage';
import PatientVisits from './PatientVisits';
import PatientManagement from '../PatientManagement';
import { isDemoUser } from '../../../utils/auth';

const COLORS = ['#00C49F', '#FF8042', '#8884d8', '#72FF7D', '#FF6B6B', '#FFBB28'];

const OrganisationDashboard = () => {
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
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [appointmentRequests, setAppointmentRequests] = useState([]);
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
            if (!isNaN(tabValue) && tabValue >= 0 && tabValue <= 6) {
                setActiveTab(tabValue);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        fetchAnalyticsData();
        fetchUpcomingAppointments();
        fetchAvailableDoctors();
        fetchAppointmentRequests();
    }, [period]);

    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            // Try to fetch data from API, but use mock data for demo user
            const demoUser = isDemoUser();

            console.log('Fetching analytics data, isDemoUser:', demoUser);

            // Use mock data for demo user or if API calls fail
            let appointmentDataResult = [];
            let serviceDataResult = [];
            let inventoryDataResult = [];
            let doctorWorkloadDataResult = [];
            let patientVisitDataResult = [];
            let statsDataResult = {};

            if (!demoUser) {
                try {
                    // Fetch appointment trends
                    const appointmentResponse = await fetch(`/api/services/analytics/appointments?period=${period}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (appointmentResponse.ok) {
                        appointmentDataResult = await appointmentResponse.json();
                    }
                } catch (error) {
                    console.error('Error fetching appointment data:', error);
                }

                try {
                    // Fetch service popularity
                    const serviceResponse = await fetch('/api/services/analytics/services', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (serviceResponse.ok) {
                        serviceDataResult = await serviceResponse.json();
                    }
                } catch (error) {
                    console.error('Error fetching service data:', error);
                }

                try {
                    // Fetch inventory usage
                    const inventoryResponse = await fetch('/api/services/analytics/inventory-usage', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (inventoryResponse.ok) {
                        inventoryDataResult = await inventoryResponse.json();
                    }
                } catch (error) {
                    console.error('Error fetching inventory data:', error);
                }

                try {
                    // Fetch doctor workload
                    const doctorResponse = await fetch('/api/services/analytics/doctor-workload', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (doctorResponse.ok) {
                        doctorWorkloadDataResult = await doctorResponse.json();
                    }
                } catch (error) {
                    console.error('Error fetching doctor workload data:', error);
                }

                try {
                    // Fetch patient visits
                    const patientResponse = await fetch(`/api/services/analytics/patient-visits?period=${period}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (patientResponse.ok) {
                        patientVisitDataResult = await patientResponse.json();
                    }
                } catch (error) {
                    console.error('Error fetching patient visits data:', error);
                }

                try {
                    // Fetch overall stats
                    const statsResponse = await fetch('/api/services/analytics/overview', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (statsResponse.ok) {
                        statsDataResult = await statsResponse.json();
                    }
                } catch (error) {
                    console.error('Error fetching stats data:', error);
                }
            }

            // If we didn't get data from the API or it's a demo user, use mock data
            if (demoUser || appointmentDataResult.length === 0) {
                appointmentDataResult = [
                    { _id: 'Mon', count: 10 },
                    { _id: 'Tue', count: 15 },
                    { _id: 'Wed', count: 8 },
                    { _id: 'Thu', count: 12 },
                    { _id: 'Fri', count: 20 },
                    { _id: 'Sat', count: 18 },
                    { _id: 'Sun', count: 5 }
                ];
            }

            if (demoUser || serviceDataResult.length === 0) {
                serviceDataResult = [
                    { _id: '1', count: 25, serviceDetails: [{ name: 'Check-ups' }] },
                    { _id: '2', count: 18, serviceDetails: [{ name: 'Vaccinations' }] },
                    { _id: '3', count: 15, serviceDetails: [{ name: 'Surgeries' }] },
                    { _id: '4', count: 12, serviceDetails: [{ name: 'Consultations' }] },
                    { _id: '5', count: 8, serviceDetails: [{ name: 'Laboratory Tests' }] }
                ];
            }

            if (demoUser || inventoryDataResult.length === 0) {
                inventoryDataResult = [
                    { name: 'Vaccines', value: 35 },
                    { name: 'Medications', value: 25 },
                    { name: 'Supplies', value: 20 },
                    { name: 'Equipment', value: 15 },
                    { name: 'Food', value: 5 }
                ];
            }

            if (demoUser || doctorWorkloadDataResult.length === 0) {
                doctorWorkloadDataResult = [
                    { name: 'Dr. Johnson', appointments: 28 },
                    { name: 'Dr. Smith', appointments: 22 },
                    { name: 'Dr. Williams', appointments: 19 },
                    { name: 'Dr. Brown', appointments: 15 },
                    { name: 'Dr. Davis', appointments: 12 }
                ];
            }

            if (demoUser || patientVisitDataResult.length === 0) {
                patientVisitDataResult = [
                    { date: 'Mon', visits: 12 },
                    { date: 'Tue', visits: 19 },
                    { date: 'Wed', visits: 10 },
                    { date: 'Thu', visits: 15 },
                    { date: 'Fri', visits: 22 },
                    { date: 'Sat', visits: 18 },
                    { date: 'Sun', visits: 8 }
                ];
            }

            if (demoUser || Object.keys(statsDataResult).length === 0) {
                statsDataResult = {
                    totalAppointments: appointmentDataResult.reduce((sum, item) => sum + item.count, 0),
                    pendingAppointments: Math.floor(Math.random() * 20),
                    totalServices: serviceDataResult.length,
                    activePatients: Math.floor(Math.random() * 100) + 50
                };
            }

            // Set the state with our data (either from API or mock)
            setAppointmentData(appointmentDataResult);
            setServiceData(serviceDataResult);
            setInventoryData(inventoryDataResult);
            setDoctorWorkloadData(doctorWorkloadDataResult);
            setPatientVisitData(patientVisitDataResult);
            setStats(statsDataResult);
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

    const fetchUpcomingAppointments = async () => {
        try {
            // Check if demo user
            const demoUser = isDemoUser();

            let appointmentsData = [];

            if (!demoUser) {
                try {
                    const response = await fetch('/api/services/appointments/upcoming', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        appointmentsData = await response.json();
                    }
                } catch (error) {
                    console.error('Error fetching upcoming appointments from API:', error);
                }
            }

            // If no data from API or demo user, use mock data
            if (demoUser || appointmentsData.length === 0) {
                appointmentsData = [
                    {
                        _id: '1',
                        patient: { firstName: 'Kristen', lastName: 'Watson' },
                        doctor: { firstName: 'Devon', lastName: 'Lane' },
                        serviceType: { name: 'Checkup' },
                        scheduledDate: new Date().toISOString(),
                        status: 'confirmed'
                    },
                    {
                        _id: '2',
                        patient: { firstName: 'Jerome', lastName: 'Bell' },
                        doctor: { firstName: 'Jenny', lastName: 'Wilson' },
                        serviceType: { name: 'Vaccination' },
                        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
                        status: 'pending'
                    },
                    {
                        _id: '3',
                        patient: { firstName: 'Cody', lastName: 'Fisher' },
                        doctor: { firstName: 'Robert', lastName: 'Fox' },
                        serviceType: { name: 'Migraine' },
                        scheduledDate: new Date(Date.now() + 172800000).toISOString(),
                        status: 'pending'
                    }
                ];
            }

            setUpcomingAppointments(appointmentsData);
        } catch (error) {
            console.error('Error in fetchUpcomingAppointments:', error);
            // Ensure we always have data even if the function fails
            setUpcomingAppointments([
                {
                    _id: '1',
                    patient: { firstName: 'Kristen', lastName: 'Watson' },
                    doctor: { firstName: 'Devon', lastName: 'Lane' },
                    serviceType: { name: 'Checkup' },
                    scheduledDate: new Date().toISOString(),
                    status: 'confirmed'
                },
                {
                    _id: '2',
                    patient: { firstName: 'Jerome', lastName: 'Bell' },
                    doctor: { firstName: 'Jenny', lastName: 'Wilson' },
                    serviceType: { name: 'Vaccination' },
                    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
                    status: 'pending'
                }
            ]);
        }
    };

    const fetchAvailableDoctors = async () => {
        try {
            // Check if demo user
            const demoUser = isDemoUser();

            let doctorsData = [];

            if (!demoUser) {
                try {
                    const response = await fetch('/api/users/doctors/available', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        doctorsData = await response.json();
                    }
                } catch (error) {
                    console.error('Error fetching available doctors from API:', error);
                }
            }

            // If no data from API or demo user, use mock data
            if (demoUser || doctorsData.length === 0) {
                doctorsData = [
                    {
                        _id: '1',
                        firstName: 'Jane',
                        lastName: 'Cooper',
                        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                        patientCount: 120
                    },
                    {
                        _id: '2',
                        firstName: 'Savannah',
                        lastName: 'Nguyen',
                        avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
                        patientCount: 120,
                        status: 'paid'
                    },
                    {
                        _id: '3',
                        firstName: 'Albert',
                        lastName: 'Flores',
                        avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
                        patientCount: 120,
                        status: 'accept'
                    }
                ];
            }

            setAvailableDoctors(doctorsData);
        } catch (error) {
            console.error('Error in fetchAvailableDoctors:', error);
            // Ensure we always have data even if the function fails
            setAvailableDoctors([
                {
                    _id: '1',
                    firstName: 'Jane',
                    lastName: 'Cooper',
                    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                    patientCount: 120
                },
                {
                    _id: '2',
                    firstName: 'Savannah',
                    lastName: 'Nguyen',
                    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
                    patientCount: 120,
                    status: 'paid'
                }
            ]);
        }
    };

    const fetchAppointmentRequests = async () => {
        try {
            // Check if demo user
            const demoUser = isDemoUser();

            let requestsData = [];

            if (!demoUser) {
                try {
                    const response = await fetch('/api/services/appointments/requests', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        requestsData = await response.json();
                    }
                } catch (error) {
                    console.error('Error fetching appointment requests from API:', error);
                }
            }

            // If no data from API or demo user, use mock data
            if (demoUser || requestsData.length === 0) {
                requestsData = [
                    {
                        _id: '1',
                        patient: { firstName: 'Kristen', lastName: 'Watson', avatar: 'https://randomuser.me/api/portraits/women/45.jpg' },
                        scheduledDate: new Date().toISOString(),
                        type: 'Old Patient'
                    },
                    {
                        _id: '2',
                        patient: { firstName: 'Jerome', lastName: 'Bell', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
                        scheduledDate: new Date().toISOString(),
                        type: 'New Patient'
                    }
                ];
            }

            setAppointmentRequests(requestsData);
        } catch (error) {
            console.error('Error in fetchAppointmentRequests:', error);
            // Ensure we always have data even if the function fails
            setAppointmentRequests([
                {
                    _id: '1',
                    patient: { firstName: 'Kristen', lastName: 'Watson', avatar: 'https://randomuser.me/api/portraits/women/45.jpg' },
                    scheduledDate: new Date().toISOString(),
                    type: 'Old Patient'
                },
                {
                    _id: '2',
                    patient: { firstName: 'Jerome', lastName: 'Bell', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
                    scheduledDate: new Date().toISOString(),
                    type: 'New Patient'
                }
            ]);
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

    const getStatusChip = (status) => {
        switch(status) {
            case 'confirmed':
            case 'completed':
                return <Chip
                    size="small"
                    icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
                    label={status.charAt(0).toUpperCase() + status.slice(1)}
                    sx={{
                        bgcolor: 'rgba(0, 196, 159, 0.1)',
                        color: '#00C49F',
                        borderRadius: '4px',
                        '& .MuiChip-icon': { color: '#00C49F' }
                    }}
                />;
            case 'pending':
                return <Chip
                    size="small"
                    icon={<ScheduleIcon style={{ fontSize: 16 }} />}
                    label="Pending"
                    sx={{
                        bgcolor: 'rgba(255, 187, 40, 0.1)',
                        color: '#FFBB28',
                        borderRadius: '4px',
                        '& .MuiChip-icon': { color: '#FFBB28' }
                    }}
                />;
            case 'cancelled':
            case 'rejected':
                return <Chip
                    size="small"
                    icon={<CancelIcon style={{ fontSize: 16 }} />}
                    label={status.charAt(0).toUpperCase() + status.slice(1)}
                    sx={{
                        bgcolor: 'rgba(255, 107, 107, 0.1)',
                        color: '#FF6B6B',
                        borderRadius: '4px',
                        '& .MuiChip-icon': { color: '#FF6B6B' }
                    }}
                />;
            default:
                return <Chip size="small" label={status} />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
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
                        Good morning, Dr. Christopher
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                        Have a nice day at work. Progress is excellent!
                    </Typography>
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
                    <Tab label="Patient Management" sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        color: activeTab === 6 ? 'primary.main' : 'text.secondary',
                        '&.Mui-selected': { color: 'primary.main' },
                    }} />
                </Tabs>

                {activeTab === 0 && (
                    <>
                        {/* Top Summary Cards */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                    height: '100%'
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Monthly Progress
                                        </Typography>
                                        <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                                56%
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'success.main' }}>
                                                100% Goal
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mt: 2, width: '100%', height: 20, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                                            <Box sx={{ width: '56%', height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
                                        </Box>
                                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                January
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Month
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Card sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                    height: '100%'
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Today's Appointments
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, position: 'relative' }}>
                                            <Box sx={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: '50%',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '10px solid rgba(0, 0, 0, 0.05)'
                                            }}>
                                                <Box sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    borderTop: '10px solid #00C49F',
                                                    borderRight: '10px solid #FFBB28',
                                                    borderBottom: '10px solid #FF6B6B',
                                                    borderLeft: '10px solid #00C49F',
                                                }} />
                                                <Typography variant="h4" sx={{ fontWeight: 600, zIndex: 1 }}>
                                                    8
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 3 }}>
                                            <Grid container spacing={1}>
                                                <Grid item xs={4}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Typography variant="h6" sx={{ color: '#00C49F', fontWeight: 600 }}>5</Typography>
                                                        <Typography variant="caption" color="text.secondary">Completed</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Typography variant="h6" sx={{ color: '#FFBB28', fontWeight: 600 }}>3</Typography>
                                                        <Typography variant="caption" color="text.secondary">Pending</Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 600 }}>0</Typography>
                                                        <Typography variant="caption" color="text.secondary">Missed</Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card sx={{
                                    bgcolor: 'background.paper',
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                    height: '100%'
                                }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Total Patients
                                        </Typography>
                                        <Typography variant="h4" sx={{ mt: 2, mb: 3, fontWeight: 600 }}>
                                            1,250
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={100}>
                                            <AreaChart data={patientVisitData}>
                                                <defs>
                                                    <linearGradient id="patientColor" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                                    </linearGradient>
                                                </defs>
                                                <Area type="monotone" dataKey="visits" stroke="#8884d8" fillOpacity={1} fill="url(#patientColor)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#8884d8', mr: 1 }} />
                                                <Typography variant="caption">Active (950)</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#82ca9d', mr: 1 }} />
                                                <Typography variant="caption">Inactive (300)</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Bottom Sections */}
                        <Grid container spacing={3}>
                            {/* Upcoming Appointments */}
                            <Grid item xs={12} md={5} lg={4}>
                                <Paper sx={{
                                    p: 3,
                                    bgcolor: 'background.paper',
                                    borderRadius: 4,
                                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                    height: '100%'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Upcoming Appointments
                                        </Typography>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <Select
                                                value="today"
                                                displayEmpty
                                                sx={{ borderRadius: 2 }}
                                            >
                                                <MenuItem value="today">Today</MenuItem>
                                                <MenuItem value="week">This Week</MenuItem>
                                                <MenuItem value="month">This Month</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                        8 Appointments Today
                                    </Typography>

                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Name</TableCell>
                                                    <TableCell>Referred by</TableCell>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Reason</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {upcomingAppointments.map((appointment) => (
                                                    <TableRow key={appointment._id} hover>
                                                        <TableCell>
                                                            {appointment.patient.firstName} {appointment.patient.lastName}
                                                        </TableCell>
                                                        <TableCell>
                                                            Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDate(appointment.scheduledDate)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {appointment.serviceType?.name}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>

                            {/* Available Doctors and Appointment Requests */}
                            <Grid item xs={12} md={7} lg={8}>
                                <Grid container spacing={3} sx={{ height: '100%' }}>
                                    {/* Available Doctors */}
                                    <Grid item xs={12}>
                                        <Paper sx={{
                                            p: 3,
                                            bgcolor: 'background.paper',
                                            borderRadius: 4,
                                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    Available Doctors
                                                </Typography>
                                                <Button size="small" sx={{ color: 'primary.main' }}>
                                                    View All
                                                </Button>
                                            </Box>

                                            <List>
                                                {availableDoctors.map((doctor) => (
                                                    <ListItem
                                                        key={doctor._id}
                                                        secondaryAction={
                                                            doctor.status === 'paid' ? (
                                                                <Chip
                                                                    size="small"
                                                                    label="Paid"
                                                                    sx={{ bgcolor: '#e7f9ed', color: '#4caf50', borderRadius: 1 }}
                                                                />
                                                            ) : doctor.status === 'accept' ? (
                                                                <Chip
                                                                    size="small"
                                                                    label="Accept"
                                                                    sx={{ bgcolor: '#fee7e7', color: '#f44336', borderRadius: 1 }}
                                                                />
                                                            ) : null
                                                        }
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar src={doctor.avatar} />
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                                            secondary={`${doctor.patientCount} Patient`}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Paper>
                                    </Grid>

                                    {/* Appointment Requests */}
                                    <Grid item xs={12}>
                                        <Paper sx={{
                                            p: 3,
                                            bgcolor: 'background.paper',
                                            borderRadius: 4,
                                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    Appointment Requests
                                                </Typography>
                                                <Button size="small" sx={{ color: 'primary.main' }}>
                                                    View All
                                                </Button>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                                Total 173 appointment requested
                                            </Typography>

                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>No.</TableCell>
                                                            <TableCell>Name</TableCell>
                                                            <TableCell>Date</TableCell>
                                                            <TableCell>Type</TableCell>
                                                            <TableCell align="right">Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {appointmentRequests.map((request, index) => (
                                                            <TableRow key={request._id} hover>
                                                                <TableCell>{index + 1}</TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                        <Avatar src={request.patient.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                                                                        {request.patient.firstName} {request.patient.lastName}
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatDate(request.scheduledDate)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {request.type}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <IconButton size="small" sx={{ color: 'success.main' }}>
                                                                        <DoneIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton size="small" sx={{ color: 'error.main' }}>
                                                                        <CloseIcon fontSize="small" />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}

                {activeTab === 1 && <ServiceManagement />}
                {activeTab === 2 && <AppointmentManagement />}
                {activeTab === 3 && <DoctorWorkload />}
                {activeTab === 4 && <InventoryUsage />}
                {activeTab === 5 && <PatientVisits />}
                {activeTab === 6 && <PatientManagement />}
            </Box>
        </Container>
    );
};

export default OrganisationDashboard;