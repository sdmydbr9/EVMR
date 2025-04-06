import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Container,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  Divider
} from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  Healing as HealingIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';

// iCloud-inspired app menu items
const appItems = [
  { 
    name: 'Patients', 
    icon: <PetsIcon sx={{ fontSize: 40, color: '#007AFF' }} />, 
    path: '/patients',
    description: 'Manage patient records'
  },
  { 
    name: 'Appointments', 
    icon: <EventIcon sx={{ fontSize: 40, color: '#FF9500' }} />, 
    path: '/appointments',
    description: 'Schedule and track appointments'
  },
  { 
    name: 'Medical Records', 
    icon: <HealingIcon sx={{ fontSize: 40, color: '#FF2D55' }} />, 
    path: '/emr',
    description: 'View and update medical records'
  },
  { 
    name: 'Inventory', 
    icon: <InventoryIcon sx={{ fontSize: 40, color: '#34C759' }} />, 
    path: '/inventory',
    description: 'Manage clinic inventory'
  },
  { 
    name: 'Reports', 
    icon: <AssessmentIcon sx={{ fontSize: 40, color: '#5856D6' }} />, 
    path: '/reports',
    description: 'Generate analytical reports'
  },
  { 
    name: 'Users', 
    icon: <PeopleIcon sx={{ fontSize: 40, color: '#007AFF' }} />, 
    path: '/users',
    description: 'Manage staff accounts'
  }
];

const AppLayout = ({ onLogout, user }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  // Check if we're on the app selection screen or inside an app
  const isAppSelectionScreen = location.pathname === '/' || location.pathname === '';
  
  // Get the current app name for the app bar title
  const currentApp = appItems.find(item => location.pathname.startsWith(item.path))?.name || 'EVMR';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <AppBar position="fixed" sx={{ width: '100%' }}>
        <Toolbar sx={{ minHeight: 56 }}>
          {!isAppSelectionScreen && (
          <IconButton
            color="inherit"
            edge="start"
              onClick={() => navigate('/')}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <Typography variant="body1" sx={{ color: theme.palette.primary.main }}>
                Back
              </Typography>
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              textAlign: isAppSelectionScreen ? 'center' : 'left',
              fontWeight: 500,
              color: 'text.primary'
            }}
          >
            {isAppSelectionScreen ? 'EVMR System' : currentApp}
          </Typography>
          
          <Tooltip title="Account">
            <IconButton
              onClick={handleMenu}
              color="inherit"
              size="small"
              sx={{ color: 'text.primary' }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: theme.palette.primary.main 
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <AccountIcon />}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                mt: 1,
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                Signed in as <strong>{user?.email || 'User'}</strong>
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>My Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          pt: 8, // Add padding for the app bar
          px: 0,
          pb: 0,
          backgroundColor: 'background.default',
          overflow: 'auto',
          width: '100%',
          maxWidth: '100%'
        }}
      >
        {isAppSelectionScreen ? (
          // iCloud-inspired app grid
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Chip
              label={user?.name || "User"}
              avatar={<Avatar>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</Avatar>}
              sx={{ 
                mb: 4, 
                display: 'flex', 
                mx: 'auto',
                py: 2,
                px: 1,
                height: 'auto',
                '& .MuiChip-avatar': {
                  width: 32,
                  height: 32,
                  fontSize: 16
                },
                '& .MuiChip-label': {
                  fontSize: '1rem',
                  px: 1
                }
              }}
            />
            
            <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6, fontWeight: 300 }}>
              Electronic Veterinary Medical Records
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              {appItems.map((item) => (
                <Grid item xs={6} sm={4} md={4} key={item.name}>
                  <Paper
                    elevation={0}
                    onClick={() => navigate(item.path)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 3,
                      px: 2,
                      height: '100%',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)',
                      },
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mb: 2,
                      width: 70,
                      height: 70,
                      borderRadius: '15px',
                      background: 'rgba(0,0,0,0.03)',
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" component="h2" align="center" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {item.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        ) : (
          // Content of the selected app - ensure it takes full width
          <Box sx={{ width: '100%', maxWidth: '100%', height: 'calc(100vh - 64px)' }}>
            <Outlet />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AppLayout; 