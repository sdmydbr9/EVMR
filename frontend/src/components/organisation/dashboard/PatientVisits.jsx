import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
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
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PatientVisits = () => {
    const [visitData, setVisitData] = useState([]);
    const [visitsByReason, setVisitsByReason] = useState([]);
    const [visitsByPatientType, setVisitsByPatientType] = useState([]);
    const [topPatients, setTopPatients] = useState([]);
    const [period, setPeriod] = useState('weekly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisitData();
    }, [period]);

    const fetchVisitData = async () => {
        try {
            setLoading(true);
            // Fetch patient visit trends
            const response = await fetch(`/api/services/analytics/patient-visits?period=${period}`);
            const data = await response.json();
            setVisitData(data);

            // Fetch visits by reason
            const reasonResponse = await fetch('/api/services/analytics/visits-by-reason');
            if (reasonResponse.ok) {
                const reasonData = await reasonResponse.json();
                setVisitsByReason(reasonData);
            } else {
                // Mock data if endpoint not available
                setVisitsByReason([
                    { name: 'Check-ups', value: 35 },
                    { name: 'Vaccinations', value: 25 },
                    { name: 'Illness', value: 20 },
                    { name: 'Injury', value: 10 },
                    { name: 'Follow-up', value: 10 }
                ]);
            }

            // Fetch visits by patient type
            const typeResponse = await fetch('/api/services/analytics/visits-by-patient-type');
            if (typeResponse.ok) {
                const typeData = await typeResponse.json();
                setVisitsByPatientType(typeData);
            } else {
                // Mock data if endpoint not available
                setVisitsByPatientType([
                    { name: 'New', value: 30 },
                    { name: 'Returning', value: 70 }
                ]);
            }

            // Fetch top patients
            const patientsResponse = await fetch('/api/services/analytics/top-patients');
            if (patientsResponse.ok) {
                const patientsData = await patientsResponse.json();
                setTopPatients(patientsData);
            } else {
                // Mock data if endpoint not available
                setTopPatients([
                    { id: 1, firstName: 'John', lastName: 'Doe', visitCount: 8, lastVisit: '2023-03-15' },
                    { id: 2, firstName: 'Jane', lastName: 'Smith', visitCount: 6, lastVisit: '2023-03-20' },
                    { id: 3, firstName: 'Robert', lastName: 'Johnson', visitCount: 5, lastVisit: '2023-03-18' },
                    { id: 4, firstName: 'Emily', lastName: 'Williams', visitCount: 4, lastVisit: '2023-03-10' },
                    { id: 5, firstName: 'Michael', lastName: 'Brown', visitCount: 3, lastVisit: '2023-03-22' }
                ]);
            }
        } catch (error) {
            console.error('Error fetching visit data:', error);
            // Provide mock data for demonstration
            setVisitData([
                { date: '2023-03-01', visits: 10 },
                { date: '2023-03-02', visits: 15 },
                { date: '2023-03-03', visits: 8 },
                { date: '2023-03-04', visits: 12 },
                { date: '2023-03-05', visits: 20 },
                { date: '2023-03-06', visits: 18 },
                { date: '2023-03-07', visits: 5 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };

    // Calculate total visits and average visits per day
    const calculateStats = () => {
        const totalVisits = visitData.reduce((sum, item) => sum + item.visits, 0);
        const avgVisits = totalVisits / (visitData.length || 1);
        return {
            totalVisits,
            avgVisits: avgVisits.toFixed(2)
        };
    };

    const stats = calculateStats();

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Patient Visits Analysis
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="period-select-label">Time Period</InputLabel>
                    <Select
                        labelId="period-select-label"
                        value={period}
                        label="Time Period"
                        onChange={handlePeriodChange}
                    >
                        <MenuItem value="daily">Daily (Last Week)</MenuItem>
                        <MenuItem value="weekly">Weekly (Last Month)</MenuItem>
                        <MenuItem value="monthly">Monthly (Last 6 Months)</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Stats Summary */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Visits
                            </Typography>
                            <Typography variant="h4">
                                {stats.totalVisits}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Average Visits
                            </Typography>
                            <Typography variant="h4">
                                {stats.avgVisits} / day
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                New vs. Returning
                            </Typography>
                            <Typography variant="h4">
                                {visitsByPatientType.length > 0 ? 
                                    `${visitsByPatientType.find(item => item.name === 'New')?.value || 0}% New` : 
                                    'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Visit Trend Chart */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Patient Visit Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={visitData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="visits" stroke="#8884d8" name="Visits" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Visit Reasons Chart */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Visit Reasons
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={visitsByReason}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {visitsByReason.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Top Patients */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Most Frequent Patients
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Patient Name</TableCell>
                                        <TableCell align="right">Visit Count</TableCell>
                                        <TableCell align="right">Last Visit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topPatients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell>{patient.firstName} {patient.lastName}</TableCell>
                                            <TableCell align="right">{patient.visitCount}</TableCell>
                                            <TableCell align="right">
                                                {new Date(patient.lastVisit).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PatientVisits; 