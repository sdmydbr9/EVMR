import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme, Typography, Container, Paper } from '@mui/material';
import { authService } from './services/api';

// Import components from new structure using index files
import { ProtectedRoute, Login } from './components/common';
import { AppLayout } from './components/layout';

// Pet Parent components
import { 
  PetParentDashboard,
  VaccinationForm, 
  DewormingForm, 
  GroomingForm 
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
  PatientVisits
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
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check token validity on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await authService.verifyToken();

        if (response.success) {
          // Check if user is system admin - they should use the admin portal
          const userType = localStorage.getItem('userType');
          if (response.user && response.user.role === 'admin' && userType !== 'organisation') {
            // Redirect to system admin portal
            window.location.href = `${process.env.REACT_APP_ADMIN_URL || 'http://localhost:3789'}/admin`;
            return;
          }

          setUser(response.user);
          setIsAuthenticated(true);

          // Store user role in localStorage for protected routes
          if (response.user && response.user.role) {
            localStorage.setItem('userRole', response.user.role);
          }
        } else {
          // If token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      } catch (error) {
        console.error('Authentication check failed', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if user is a pet parent
  const isPetParent = () => {
    const userType = localStorage.getItem('userType');
    return userType === 'pet_parent';
  };

  // Check if user is an organisation
  const isOrganisation = () => {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'organisation';
  };

  // Show loading indicator while checking authentication
  if (isLoading) {
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
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', width: '100%', maxWidth: '100%' }}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ?
                <Navigate to="/" replace /> :
                <Login onLogin={handleLogin} />
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                isAuthenticated ?
                <AppLayout onLogout={handleLogout} user={user} /> :
                <Navigate to="/login" replace />
              }
            >
              {/* Root route - redirects based on user type */}
              <Route index element={
                isPetParent() ?
                <PetParentDashboard /> :
                isOrganisation() ?
                <Navigate to="/organisation/dashboard" replace /> :
                <Navigate to="/patients" replace />
              } />

              {/* Veterinarian Routes */}
              <Route path="patients" element={<PatientDashboard />} />
              <Route path="appointments" element={<AppointmentDashboard />} />
              <Route path="emr" element={<MedicalRecordsDashboard />} />
              
              {/* Organisation Routes */}
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="doctors" element={<DoctorsDashboard />} />
              <Route path="schedules" element={<ScheduleDashboard />} />
              <Route path="reports" element={<ReportDashboard />} />

              {/* Organisation Dashboard Routes */}
              <Route
                path="organisation/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['organisation']}>
                    <OrganisationDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="services" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <ServiceManagement />
                </ProtectedRoute>
              } />
              <Route path="appointment-requests" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <AppointmentManagement />
                </ProtectedRoute>
              } />
              <Route path="doctor-workload" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <DoctorWorkload />
                </ProtectedRoute>
              } />
              <Route path="inventory-usage" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <InventoryUsage />
                </ProtectedRoute>
              } />
              <Route path="patient-visits" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <PatientVisits />
                </ProtectedRoute>
              } />
              <Route path="patient-records" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <PlaceholderComponent title="Patient Records" />
                </ProtectedRoute>
              } />
              <Route path="medical-reports" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <PlaceholderComponent title="Medical Reports" />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <PlaceholderComponent title="Staff Management" />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['organisation']}>
                  <PlaceholderComponent title="System Settings" />
                </ProtectedRoute>
              } />

              {/* Pet Parent Routes */}
              <Route path="pets" element={<PetParentDashboard />} />
              <Route path="vaccinations" element={<PetParentDashboard />} />
              <Route path="medications" element={<PetParentDashboard />} />
              <Route path="health" element={<PetParentDashboard />} />
              <Route path="documents" element={<PetParentDashboard />} />
              <Route path="pets/:petId/vaccination/add" element={<VaccinationForm />} />
              <Route path="pets/:petId/deworming/add" element={<DewormingForm />} />
              <Route path="pets/:petId/grooming/add" element={<GroomingForm />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;