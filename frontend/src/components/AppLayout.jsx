import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
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
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useMediaQuery,
  Badge,
  ListSubheader
} from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  Healing as HealingIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  Dashboard as DashboardIcon,
  Vaccines as VaccinesIcon,
  Medication as MedicationIcon,
  HealthAndSafety as HealthIcon,
  Flight as TravelIcon,
  InsertDriveFile as DocumentsIcon,
  LocalHospital as DoctorIcon,
  Schedule as ScheduleIcon,
  MenuOpen as MenuIcon,
  Settings as SettingsIcon,
  BarChart as AnalyticsIcon,
  MedicalServices as ServicesIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Accessibility as PatientRecordsIcon,
  MonitorHeart as MedicalReportsIcon,
  CalendarToday as AppointmentRequestsIcon,
  FileCopy as PatientRecordIcon
} from '@mui/icons-material';

// Menu categories for organization
const menuCategories = {
  DASHBOARD: 'Dashboard',
  PATIENTS: 'Patients & Records',
  APPOINTMENTS: 'Appointments & Scheduling',
  SERVICES: 'Services & Inventory',
  STAFF: 'Staff & Doctors',
  ANALYTICS: 'Analytics & Reports'
};

// iCloud-inspired app menu items for staff
const staffAppItems = [
  // Dashboard category
  { 
    name: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/',
    description: 'Main dashboard',
    category: menuCategories.DASHBOARD
  },
  {
    name: 'Organisation Dashboard',
    icon: <AnalyticsIcon />,
    path: '/admin/dashboard',
    description: 'Organisation administration dashboard',
    roles: ['organisation'],
    category: menuCategories.DASHBOARD
  },
  
  // Patients & Records category
  { 
    name: 'Patients', 
    icon: <PetsIcon />, 
    path: '/patients',
    description: 'Manage patient records',
    category: menuCategories.PATIENTS
  },
  {
    name: 'Patient Records',
    icon: <PatientRecordIcon />,
    path: '/patient-records',
    description: 'View detailed patient records',
    category: menuCategories.PATIENTS
  },
  { 
    name: 'Medical Records', 
    icon: <HealingIcon />, 
    path: '/emr',
    description: 'View and update medical records',
    category: menuCategories.PATIENTS
  },
  
  // Appointments & Scheduling category
  { 
    name: 'Appointments', 
    icon: <EventIcon />, 
    path: '/appointments',
    description: 'Schedule and track appointments',
    category: menuCategories.APPOINTMENTS
  },
  { 
    name: 'Appointment Requests', 
    icon: <AppointmentRequestsIcon />, 
    path: '/appointment-requests',
    description: 'Manage appointment requests',
    category: menuCategories.APPOINTMENTS
  },
  { 
    name: 'Schedules', 
    icon: <ScheduleIcon />, 
    path: '/schedules',
    description: 'Manage doctor schedules',
    category: menuCategories.APPOINTMENTS
  },
  
  // Services & Inventory category
  { 
    name: 'Services', 
    icon: <ServicesIcon />, 
    path: '/services',
    description: 'Manage service offerings',
    category: menuCategories.SERVICES
  },
  { 
    name: 'Inventory', 
    icon: <InventoryIcon />, 
    path: '/inventory',
    description: 'Manage clinic inventory',
    category: menuCategories.SERVICES
  },
  { 
    name: 'Inventory Usage', 
    icon: <InventoryIcon />, 
    path: '/inventory-usage',
    description: 'Track inventory usage',
    category: menuCategories.SERVICES
  },
  
  // Staff & Doctors category
  { 
    name: 'Doctors', 
    icon: <DoctorIcon />, 
    path: '/doctors',
    description: 'Manage doctor profiles',
    category: menuCategories.STAFF
  },
  { 
    name: 'Doctor Workload', 
    icon: <DoctorIcon />, 
    path: '/doctor-workload',
    description: 'View doctor workload',
    category: menuCategories.STAFF
  },
  { 
    name: 'Staff Management', 
    icon: <PeopleIcon />, 
    path: '/users',
    description: 'Manage staff accounts',
    category: menuCategories.STAFF
  },
  
  // Analytics & Reports category
  { 
    name: 'Reports', 
    icon: <AssessmentIcon />, 
    path: '/reports',
    description: 'Generate analytical reports',
    category: menuCategories.ANALYTICS
  },
  { 
    name: 'Medical Reports', 
    icon: <MedicalReportsIcon />, 
    path: '/medical-reports',
    description: 'View medical reports and analytics',
    category: menuCategories.ANALYTICS
  },
  { 
    name: 'Patient Visits', 
    icon: <PetsIcon />, 
    path: '/patient-visits',
    description: 'Track patient visits',
    category: menuCategories.ANALYTICS
  },
  { 
    name: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/settings',
    description: 'System settings',
    category: menuCategories.DASHBOARD
  }
];

// Pet parent app menu items
const petParentAppItems = [
  { 
    name: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/',
    description: 'View your pet dashboard'
  },
  { 
    name: 'My Pets', 
    icon: <PetsIcon />, 
    path: '/pets',
    description: 'Manage your pets'
  },
  { 
    name: 'Vaccinations', 
    icon: <VaccinesIcon />, 
    path: '/vaccinations',
    description: 'View vaccination records'
  },
  { 
    name: 'Medications', 
    icon: <MedicationIcon />, 
    path: '/medications',
    description: 'Track medications'
  },
  { 
    name: 'Health Records', 
    icon: <HealthIcon />, 
    path: '/health',
    description: 'View health history'
  },
  { 
    name: 'Documents', 
    icon: <DocumentsIcon />, 
    path: '/documents',
    description: 'Access pet documents'
  }
];

// Drawer width
const drawerWidth = 260;

const AppLayout = ({ onLogout, user }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Check if user is a pet parent
  const isPetParent = () => {
    const userType = localStorage.getItem('userType');
    return userType === 'pet_parent';
  };

  // Get user role from localStorage
  const getUserRole = () => {
    return localStorage.getItem('userRole');
  };

  // Check if user is an organisation
  const isOrganisation = () => {
    const userRole = getUserRole();
    return userRole === 'organisation';
  };

  // Filter app items based on user role
  const getFilteredAppItems = () => {
    const userRole = getUserRole();
    
    if (isPetParent()) {
      return petParentAppItems;
    }
    
    return staffAppItems.filter(item => {
      // Include the item if it has no roles requirement or if the user's role is in the allowed roles
      return !item.roles || item.roles.includes(userRole);
    });
  };

  // Get the appropriate app items based on user type and role
  const appItems = getFilteredAppItems();
  
  // Organize items by category
  const getItemsByCategory = () => {
    if (isPetParent()) {
      return { '': petParentAppItems }; // No categories for pet parents
    }
    
    const categories = {};
    appItems.forEach(item => {
      const category = item.category || '';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });
    
    return categories;
  };
  
  const itemsByCategory = getItemsByCategory();
  
  // Get the current app name for the app bar title
  const currentApp = appItems.find(item => {
    if (item.pathParams && item.pathParams.tab) {
      const urlSearchParams = new URLSearchParams(location.search);
      const tabParam = urlSearchParams.get('tab');
      return location.pathname.startsWith(item.path) && tabParam === item.pathParams.tab.toString();
    }
    return location.pathname.startsWith(item.path);
  })?.name || 'EVMR';

  // Handle navigation with optional tab parameter
  const handleNavigation = (item) => {
    if (isMobile) {
      setMobileOpen(false);
    }
    
    if (item.pathParams && item.pathParams.tab !== undefined) {
      navigate(`${item.path}?tab=${item.pathParams.tab}`);
    } else {
      navigate(item.path);
    }
  };

  // Update routing for organization-specific views
  const getAdaptedPath = (item) => {
    // For organization users, map certain paths to admin dashboard tabs
    if (isOrganisation() && item.name === 'Services') {
      return '/admin/dashboard?tab=1';
    } else if (isOrganisation() && item.name === 'Appointment Requests') {
      return '/admin/dashboard?tab=2';
    } else if (isOrganisation() && item.name === 'Doctor Workload') {
      return '/admin/dashboard?tab=3'; 
    } else if (isOrganisation() && item.name === 'Inventory Usage') {
      return '/admin/dashboard?tab=4';
    } else if (isOrganisation() && item.name === 'Patient Visits') {
      return '/admin/dashboard?tab=5';
    }
    
    return item.path;
  };

  // Create the drawer content
  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
          backgroundColor: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Avatar 
          sx={{ 
            width: 60, 
            height: 60, 
            mb: 1,
            bgcolor: 'white',
            color: theme.palette.primary.main
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
        </Avatar>
        <Typography variant="h6">
          {user?.name || 'User'}
        </Typography>
        <Typography variant="body2">
          {isOrganisation() ? 'Organisation Admin' : isPetParent() ? 'Pet Parent' : 'Staff'}
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav" aria-label="main menu" sx={{ 
        pb: 0,
        '& .MuiListSubheader-root': {
          bgcolor: theme.palette.background.paper,
          fontWeight: 600,
          lineHeight: '32px'
        }
      }}>
        {Object.keys(itemsByCategory).map((category) => (
          <React.Fragment key={category || 'uncategorized'}>
            {category && (
              <ListSubheader disableSticky>
                {category}
              </ListSubheader>
            )}
            
            {itemsByCategory[category].map((item) => {
              const adaptedPath = getAdaptedPath(item);
              const isActive = location.pathname === item.path || 
                location.pathname + location.search === adaptedPath ||
                (adaptedPath.includes('?tab=') && 
                  location.pathname === adaptedPath.split('?')[0] && 
                  location.search.includes(adaptedPath.split('?')[1]));
                
              return (
                <ListItem disablePadding key={item.name}>
                  <ListItemButton 
                    selected={isActive}
                    onClick={() => navigate(adaptedPath)}
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: theme.palette.primary.light + '20',
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        paddingLeft: '12px'
                      },
                      '&:hover': {
                        bgcolor: theme.palette.primary.light + '10'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: isActive ? theme.palette.primary.main : 'inherit',
                      minWidth: 40
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.name} 
                      sx={{ 
                        '& .MuiTypography-root': { 
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? theme.palette.primary.main : 'inherit'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
            
            {category && <Divider sx={{ mt: 1, mb: 1 }} />}
          </React.Fragment>
        ))}
      </List>
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {currentApp}
          </Typography>
          
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account">
            <IconButton
              onClick={handleMenu}
              color="inherit"
              size="small"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
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
      
      {/* The drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer - always visible */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
              boxShadow: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout; 