import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme, Typography, Container, Paper } from '@mui/material';
import { authService } from './services/api';

// Import LandingPage directly
import LandingPage from './components/LandingPage';
// Import components from new structure using index files
import { ProtectedRoute, Login } from './components/common';
import { AppLayout } from './components/layout';

// Pet Parent components
import {
  PetParentDashboard,
  VaccinationForm,
  DewormingForm,
  GroomingForm,
  HealthRecords
} from './components/petParent';

// Veterinarian components
import {
  PatientDashboard,
  AppointmentDashboard,
  MedicalRecordsDashboard
} from './components/veterinarian';

// Organisation components
import {
  InventoryDashboard,
  DoctorsDashboard,
  ScheduleDashboard,
  ReportDashboard,
  // Organisation Dashboard components
  OrganisationDashboard,
  ServiceManagement,
  AppointmentManagement,
  DoctorWorkload,
  InventoryUsage,
  PatientVisits,
  // New components for Organisation
  PatientManagement,
  MedicalRecords,
  AppointmentScheduling,
  Settings,
  StaffManagement,
  MedicalReports,
  SchedulingDashboard
} from './components/organisation';

// Create a placeholder component for routes that don't have dedicated components yet
const PlaceholderComponent = ({ title }) => (
  <Container maxWidth="lg" sx={{ mt: 4 }}>
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1">
        This feature is coming soon. The development team is working on implementing this functionality.
      </Typography>
    </Paper>
  </Container>
);

// Create theme inspired by the health dashboard screenshot
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // iOS blue
      light: '#5AC8FA',
      dark: '#0062CC',
    },
    secondary: {
      main: '#FF9500', // iOS orange
      light: '#FFCC00',
      dark: '#FF3B30',
    },
    background: {
      default: '#F2F2F7', // iOS light background
      paper: '#FFFFFF',   // White for cards
    },
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
    },
    info: {
      main: '#5856D6', // iOS purple
    },
    success: {
      main: '#34C759', // iOS green
    },
    error: {
      main: '#FF3B30', // iOS red
    },
    warning: {
      main: '#FF9500', // iOS orange
    },
    divider: '#C6C6C8',
  },
  typography: {
    fontFamily: [
      'SF Pro Text',
      'SF Pro Display',
      '-apple-system',
      'BlinkMacSystemFont',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '-0.005em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '-0.005em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10, // iOS rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // No uppercase text in buttons
          borderRadius: 10,
          padding: '8px 16px',
          fontWeight: 600,
        },
        containedPrimary: {
          boxShadow: 'none', // Flat buttons
          '&:hover': {
            boxShadow: '0px 2px 5px rgba(0, 122, 255, 0.25)', // Blue glow on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          borderRadius: 10,
          backgroundImage: 'none', // Remove default gradient
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          color: '#000000',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        },
        indicator: {
          backgroundColor: '#007AFF', // iOS blue indicator
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          '&.Mui-selected': {
            color: '#007AFF', // iOS blue text when selected
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.15)',
            }
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
        },
        track: {
          borderRadius: 22 / 2,
          backgroundColor: '#E9E9EA',
        },
        thumb: {
          boxShadow: 'none',
        },
        switchBase: {
          '&.Mui-checked': {
            '& + .MuiSwitch-track': {
              backgroundColor: '#34C759',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007AFF',
            },
          },
        },
      },
    },
  },
});

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('');
  // Store user info for display in the layout
  const [userInfo, setUserInfo] = useState(null);

  // Check if the user is authenticated on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('Running checkAuth...');
    try {
      // Check if there's a token in localStorage
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      if (!token) {
        setLoading(false);
        setAuthenticated(false);
        return;
      }

      // Verify token with the backend
      console.log('Verifying token with backend...');
      const response = await authService.verifyToken();
      console.log('Token verification response:', response);

      if (response && response.user) {
        // Set user data and role
        console.log('User authenticated:', response.user);
        setUserInfo(response.user);
        setAuthenticated(true);
        setUserType(response.user.role);

        // Store user role in localStorage for protected routes
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userType', response.user.type || localStorage.getItem('userType') || '');
        console.log('Updated localStorage - userRole:', response.user.role, 'userType:', localStorage.getItem('userType'));
      } else {
        // Invalid token, clear it
        console.log('Invalid token response, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userType');
        setAuthenticated(false);
        setUserType('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userType');
      setAuthenticated(false);
      setUserType('');
    } finally {
      setLoading(false);
      console.log('checkAuth completed, loading set to false');
    }
  };

  // Handle login
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setAuthenticated(true);

    // After storing the token, trigger a checkAuth
    // to get user info and facilitate proper routing
    checkAuth();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    setAuthenticated(false);
    setUserInfo(null);
  };

  // Check if user is a pet parent
  const isPetParent = () => {
    const isPP = userType === 'pet_parent' || localStorage.getItem('userType') === 'pet_parent' || localStorage.getItem('userRole') === 'client';
    console.log('isPetParent check:', isPP, 'userType:', userType, 'localStorage userType:', localStorage.getItem('userType'), 'localStorage userRole:', localStorage.getItem('userRole'));
    return isPP;
  };

  // Check if user is a veterinarian
  const isVeterinarian = () => {
    const isVet = userType === 'veterinarian' || localStorage.getItem('userType') === 'veterinarian' || localStorage.getItem('userRole') === 'veterinarian' || localStorage.getItem('userRole') === 'vet';
    console.log('isVeterinarian check:', isVet, 'userType:', userType, 'localStorage userType:', localStorage.getItem('userType'), 'localStorage userRole:', localStorage.getItem('userRole'));
    return isVet;
  };

  // Check if user is an organisation
  const isOrganisation = () => {
    const isOrg = userType === 'organisation' || localStorage.getItem('userType') === 'organisation' || localStorage.getItem('userRole') === 'organisation' || localStorage.getItem('userRole') === 'admin';
    console.log('isOrganisation check:', isOrg, 'userType:', userType, 'localStorage userType:', localStorage.getItem('userType'), 'localStorage userRole:', localStorage.getItem('userRole'));
    return isOrg;
  };

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Add Landing Page as the root route */}
          <Route path="/" element={
            authenticated ? (
              <Navigate to={isPetParent() ? "/app/dashboard" : isVeterinarian() ? "/app/patients" : "/app/dashboard"} replace />
            ) : (
              <LandingPage />
            )
          } />
          <Route path="/login" element={
            authenticated ? (
              <Navigate to={isPetParent() ? "/app/dashboard" : isVeterinarian() ? "/app/patients" : "/app/dashboard"} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } />

          {/* Protected routes within AppLayout */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute authenticated={authenticated} loading={loading}>
                <AppLayout userType={userType} userInfo={userInfo} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            {/* Default index route */}
            <Route index element={<Navigate to={isPetParent() ? "/app/dashboard" : isVeterinarian() ? "/app/patients" : "/app/dashboard"} replace />} />

            {/* Dashboard Routes - Different for each user type */}
            <Route path="dashboard" element={
              isPetParent() ? <PetParentDashboard /> :
              isOrganisation() ? <OrganisationDashboard /> :
              isVeterinarian() ? <PatientDashboard /> :
              <PlaceholderComponent title="Dashboard" />
            } />
            <Route path="vaccinations" element={isPetParent() ? <VaccinationForm /> : <PlaceholderComponent title="Vaccination Records" />} />
            <Route path="deworming" element={isPetParent() ? <DewormingForm /> : <PlaceholderComponent title="Deworming Records" />} />
            <Route path="grooming" element={isPetParent() ? <GroomingForm /> : <PlaceholderComponent title="Grooming Records" />} />
            <Route path="health" element={isPetParent() ? <HealthRecords /> : <PlaceholderComponent title="Health Records" />} />
            <Route path="pets" element={isPetParent() ? <PetParentDashboard /> : <PlaceholderComponent title="My Pets" />} />

            {/* Veterinarian Routes */}
            <Route path="patients" element={isVeterinarian() ? <PatientDashboard /> : <PlaceholderComponent title="Patient Dashboard" />} />
            <Route path="appointments" element={isVeterinarian() ? <AppointmentDashboard /> : <PlaceholderComponent title="Appointment Dashboard" />} />
            <Route path="medical-records" element={isVeterinarian() ? <MedicalRecordsDashboard /> : <PlaceholderComponent title="Medical Records Dashboard" />} />

            {/* Organisation Routes */}
            
            {/* Patient Routes */}
            <Route path="patients/management" element={isOrganisation() ? <PatientManagement /> : <PlaceholderComponent title="Patient Management" />} />
            <Route path="patients/records" element={isOrganisation() ? <MedicalRecords /> : <PlaceholderComponent title="Medical Records" />} />
            <Route path="patients/visits" element={isOrganisation() ? <PatientVisits /> : <PlaceholderComponent title="Patient Visits" />} />

            {/* Appointment Routes */}
            <Route path="appointments/scheduling" element={isOrganisation() ? <AppointmentScheduling /> : <PlaceholderComponent title="Appointment Scheduling" />} />
            <Route path="appointments/management" element={isOrganisation() ? <AppointmentManagement /> : <PlaceholderComponent title="Appointment Management" />} />
            <Route path="appointments/dashboard" element={isOrganisation() ? <SchedulingDashboard /> : <PlaceholderComponent title="Scheduling Dashboard" />} />
            
            {/* Service Routes */}
            <Route path="services/management" element={isOrganisation() ? <ServiceManagement /> : <PlaceholderComponent title="Service Management" />} />
            
            {/* Staff Routes */}
            <Route path="staff/management" element={isOrganisation() ? <StaffManagement /> : <PlaceholderComponent title="Staff Management" />} />
            <Route path="staff/doctors" element={isOrganisation() ? <DoctorsDashboard /> : <PlaceholderComponent title="Doctor Management" />} />
            <Route path="staff/schedule" element={isOrganisation() ? <ScheduleDashboard /> : <PlaceholderComponent title="Staff Schedule" />} />

            {/* Analytics Routes */}
            <Route path="analytics/doctor-workload" element={isOrganisation() ? <DoctorWorkload /> : <PlaceholderComponent title="Doctor Workload" />} />
            <Route path="analytics/inventory-usage" element={isOrganisation() ? <InventoryUsage /> : <PlaceholderComponent title="Inventory Usage" />} />
            <Route path="analytics/patient-visits" element={isOrganisation() ? <PatientVisits /> : <PlaceholderComponent title="Patient Visits" />} />
            <Route path="analytics/reports" element={isOrganisation() ? <ReportDashboard /> : <PlaceholderComponent title="Reports" />} />
            <Route path="analytics/medical-reports" element={isOrganisation() ? <MedicalReports /> : <PlaceholderComponent title="Medical Reports" />} />

            {/* Settings Routes */}
            <Route path="settings" element={isOrganisation() ? <Settings /> : <PlaceholderComponent title="Settings" />} />
            <Route path="settings/general" element={isOrganisation() ? <Settings /> : <PlaceholderComponent title="General Settings" />} />
            <Route path="settings/billing" element={isOrganisation() ? <PlaceholderComponent title="Billing Settings" /> : <PlaceholderComponent title="Billing Settings" />} />

            {/* Additional Organisation Routes (backward compatibility) */}
            <Route path="doctors" element={<Navigate to="/app/staff/doctors" replace />} />
            <Route path="schedule" element={<Navigate to="/app/appointments/dashboard" replace />} />
            <Route path="inventory" element={isOrganisation() ? <InventoryDashboard /> : <PlaceholderComponent title="Inventory Dashboard" />} />
            <Route path="reports" element={<Navigate to="/app/analytics/reports" replace />} />
            <Route path="services" element={<Navigate to="/app/services/management" replace />} />
            <Route path="workload" element={<Navigate to="/app/analytics/doctor-workload" replace />} />
            <Route path="visits" element={<Navigate to="/app/patients/visits" replace />} />
            <Route path="records" element={<Navigate to="/app/patients/records" replace />} />
            <Route path="staff" element={<Navigate to="/app/staff/management" replace />} />
            <Route path="medical-reports" element={<Navigate to="/app/analytics/medical-reports" replace />} />

            {/* Fallback route for any unmatched paths */}
            <Route path="*" element={<PlaceholderComponent title="Page Not Found" />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;