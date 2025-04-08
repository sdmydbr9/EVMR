import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { authService } from './services/api';

// Import components
import PatientDashboard from './components/PatientDashboard';
import PetParentDashboard from './components/PetParentDashboard';
import AppointmentDashboard from './components/AppointmentDashboard';
import MedicalRecordsDashboard from './components/MedicalRecordsDashboard';
import InventoryDashboard from './components/InventoryDashboard';
import ReportDashboard from './components/ReportDashboard';
import Login from './components/Login';
import AppLayout from './components/AppLayout';

// Create iCloud-inspired theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // iCloud blue
      light: '#42a5f5',
      dark: '#0055b3',
    },
    secondary: {
      main: '#34C759', // Apple green
      light: '#69f0ae',
      dark: '#00a83b',
    },
    background: {
      default: '#F2F2F7', // Light gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
    },
    divider: '#D1D1D6',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Text',
      'SF Pro Display',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
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
  },
  shape: {
    borderRadius: 10, // Rounded corners like iCloud UI
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // No uppercase text in buttons
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: 'none', // Flat buttons like iCloud
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #D1D1D6',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          color: '#000000',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid #D1D1D6',
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
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          // If token is invalid, clear it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Authentication check failed', error);
        localStorage.removeItem('token');
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
    setIsAuthenticated(false);
    setUser(null);
  };

  // Check if user is a pet parent
  const isPetParent = () => {
    const userType = localStorage.getItem('userType');
    return userType === 'pet_parent';
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
              {/* Conditionally render dashboard based on user type */}
              <Route index element={
                isPetParent() ? 
                <PetParentDashboard /> : 
                <Navigate to="/patients" replace />
              } />
              
              {/* Staff Routes */}
              <Route path="patients" element={<PatientDashboard />} />
              <Route path="appointments" element={<AppointmentDashboard />} />
              <Route path="emr" element={<MedicalRecordsDashboard />} />
              <Route path="inventory" element={<InventoryDashboard />} />
              <Route path="reports" element={<ReportDashboard />} />
              
              {/* Pet Parent Routes */}
              <Route path="pets" element={<PetParentDashboard />} />
              <Route path="vaccinations" element={<PetParentDashboard />} />
              <Route path="medications" element={<PetParentDashboard />} />
              <Route path="health" element={<PetParentDashboard />} />
              <Route path="documents" element={<PetParentDashboard />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App; 