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
  PetParentDashboard
} from './components';

// Import pet parent forms directly
import VaccinationForm from './components/petParent/VaccinationForm';
import DewormingForm from './components/petParent/DewormingForm';
import GroomingForm from './components/petParent/GroomingForm';

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
    try {
      // Check if there's a token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with the backend
      const response = await authService.verifyToken();
      
      if (response && response.user) {
        // Set user data and role
        setUserInfo(response.user);
        setAuthenticated(true);
        setUserType(response.user.role);

        // Store user role in localStorage for protected routes
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userType', response.user.type || '');
      } else {
        // Invalid token, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userType');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userType');
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setAuthenticated(true);
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
    const userType = localStorage.getItem('userType');
    return userType === 'pet_parent';
  };

  // Check if user is an organisation
  const isOrganisation = () => {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'organisation';
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected routes within AppLayout */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute authenticated={authenticated} loading={loading}>
                <AppLayout userType={userType} userInfo={userInfo} onLogout={handleLogout}>
                  <Routes>
                    {/* Pet Parent Routes */}
                    {isPetParent() && (
                      <>
                        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="/dashboard" element={<PetParentDashboard />} />
                        <Route path="/vaccinations" element={<VaccinationForm />} />
                        <Route path="/deworming" element={<DewormingForm />} />
                        <Route path="/grooming" element={<GroomingForm />} />
                      </>
                    )}

                    {/* Veterinarian Routes */}
                    {userType === 'veterinarian' && (
                      <>
                        <Route path="/" element={<Navigate to="/app/patients" replace />} />
                        <Route path="/patients" element={<PatientDashboard />} />
                        <Route path="/appointments" element={<AppointmentDashboard />} />
                        <Route path="/medical-records" element={<MedicalRecordsDashboard />} />
                      </>
                    )}

                    {/* Organisation Routes */}
                    {isOrganisation() && (
                      <>
                        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="/dashboard" element={<OrganisationDashboard />} />
                        <Route path="/doctors" element={<DoctorsDashboard />} />
                        <Route path="/schedule" element={<ScheduleDashboard />} />
                        <Route path="/inventory" element={<InventoryDashboard />} />
                        <Route path="/reports" element={<ReportDashboard />} />
                        <Route path="/services" element={<ServiceManagement />} />
                        <Route path="/appointments-management" element={<AppointmentManagement />} />
                        <Route path="/workload" element={<DoctorWorkload />} />
                        <Route path="/inventory-usage" element={<InventoryUsage />} />
                        <Route path="/visits" element={<PatientVisits />} />
                      </>
                    )}

                    {/* Admin Routes */}
                    {userType === 'admin' && (
                      <>
                        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                        {/* Add admin specific routes here */}
                      </>
                    )}

                    {/* Fallback route */}
                    <Route path="*" element={<PlaceholderComponent title="Page Not Found" />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;