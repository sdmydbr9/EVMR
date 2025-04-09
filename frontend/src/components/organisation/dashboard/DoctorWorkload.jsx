import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    LinearProgress
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const DoctorWorkload = () => {
    const [doctorWorkload, setDoctorWorkload] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctorWorkload();
    }, []);

    const fetchDoctorWorkload = async () => {
        try {
            const response = await fetch('/api/services/analytics/doctor-workload');
            const data = await response.json();
            setDoctorWorkload(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching doctor workload:', error);
            setLoading(false);
        }
    };

    const calculateWorkloadPercentage = (appointments, maxAppointments = 20) => {
        return (appointments / maxAppointments) * 100;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Doctor Workload Analysis
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Weekly Appointment Distribution
                </Typography>
                <Paper sx={{ p: 2, height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={doctorWorkload}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="doctorName" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="appointments" fill="#8884d8" name="Appointments" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Doctor</TableCell>
                            <TableCell>Total Appointments</TableCell>
                            <TableCell>Completed</TableCell>
                            <TableCell>Pending</TableCell>
                            <TableCell>Workload</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {doctorWorkload.map((doctor) => (
                            <TableRow key={doctor._id}>
                                <TableCell>
                                    {doctor.firstName} {doctor.lastName}
                                </TableCell>
                                <TableCell>{doctor.totalAppointments}</TableCell>
                                <TableCell>{doctor.completedAppointments}</TableCell>
                                <TableCell>{doctor.pendingAppointments}</TableCell>
                                <TableCell sx={{ width: '30%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={calculateWorkloadPercentage(doctor.totalAppointments)}
                                                color={
                                                    calculateWorkloadPercentage(doctor.totalAppointments) > 80
                                                        ? 'error'
                                                        : calculateWorkloadPercentage(doctor.totalAppointments) > 60
                                                        ? 'warning'
                                                        : 'success'
                                                }
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 35 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {`${Math.round(calculateWorkloadPercentage(doctor.totalAppointments))}%`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DoctorWorkload; 