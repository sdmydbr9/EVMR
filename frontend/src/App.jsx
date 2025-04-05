import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { indigo, teal } from '@mui/material/colors';

// Import components
import PatientDashboard from './components/PatientDashboard';
import AppointmentDashboard from './components/AppointmentDashboard';
import MedicalRecordsDashboard from './components/MedicalRecordsDashboard';
import InventoryDashboard from './components/InventoryDashboard';
import ReportDashboard from './components/ReportDashboard';
import Login from './components/Login';
import AppLayout from './components/AppLayout';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: indigo[700],
    },
    secondary: {
      main: teal[500],
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') ? true : false
  );

  // Handle login
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/patients" replace /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <AppLayout onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
              }
            >
              <Route index element={<Navigate to="/patients" replace />} />
              <Route path="patients" element={<PatientDashboard />} />
              <Route path="appointments" element={<AppointmentDashboard />} />
              <Route path="emr" element={<MedicalRecordsDashboard />} />
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="reports" element={<ReportDashboard />} />
              <Route path="*" element={<Navigate to="/patients" replace />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App; 