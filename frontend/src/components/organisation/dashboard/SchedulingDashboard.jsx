import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  InsertLink as LinkIcon,
  SwapHoriz as SyncIcon,
  Analytics as AnalyticsIcon,
  Code as DeveloperIcon
} from '@mui/icons-material';

// Placeholder component imports - these will be replaced with actual components
import AvailabilityManagement from '../scheduling/AvailabilityManagement';
import BookingManagement from '../scheduling/BookingManagement';
import CalendarIntegration from '../scheduling/CalendarIntegration';
import AnalyticsDashboard from '../scheduling/AnalyticsDashboard';
import NotificationSettings from '../scheduling/NotificationSettings';
import CancellationManagement from '../scheduling/CancellationManagement';
import DeveloperTools from '../scheduling/DeveloperTools';

const SchedulingDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Array of module information with names, descriptions, and icons
  const modules = [
    {
      name: "Availability Management",
      description: "Set up your organization's availability, define recurring schedules, and manage exceptions.",
      icon: <ScheduleIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      component: <AvailabilityManagement />,
      tabValue: 0
    },
    {
      name: "Booking Management",
      description: "Manage booking links, visitor booking flow, and appointment confirmation.",
      icon: <CalendarIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      component: <BookingManagement />,
      tabValue: 1
    },
    {
      name: "Calendar Integration",
      description: "Sync with external calendars like Google, Outlook, and others.",
      icon: <SyncIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      component: <CalendarIntegration />,
      tabValue: 2
    },
    {
      name: "Analytics & Reports",
      description: "View booking statistics, trends, and detailed scheduling reports.",
      icon: <AnalyticsIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      component: <AnalyticsDashboard />,
      tabValue: 3
    },
    {
      name: "Notification Settings",
      description: "Customize email and SMS templates for booking events.",
      icon: <NotificationsIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      component: <NotificationSettings />,
      tabValue: 4
    },
    {
      name: "Cancellation & Rescheduling",
      description: "Set up policies and manage cancellations and reschedules.",
      icon: <SyncIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      component: <CancellationManagement />,
      tabValue: 5
    },
    {
      name: "API & Developer Tools",
      description: "Access API keys, webhooks, and integration documentation.",
      icon: <DeveloperIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      component: <DeveloperTools />,
      tabValue: 6
    }
  ];

  // Component for dashboard overview (module cards)
  const DashboardOverview = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Appointment & Scheduling System
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Set up and manage your organization's scheduling system. Configure availability, booking flows, integrations, and more.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {modules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 8
                }
              }}
            >
              <CardActionArea
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => setActiveTab(module.tabValue + 1)}
              >
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  {module.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div" align="center">
                    {module.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {module.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Dashboard" />
          <Tab label="Availability" />
          <Tab label="Booking" />
          <Tab label="Calendar Sync" />
          <Tab label="Analytics" />
          <Tab label="Notifications" />
          <Tab label="Cancellations" />
          <Tab label="Developer" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <DashboardOverview />}
        {activeTab > 0 && modules[activeTab - 1].component}
      </Box>
    </Box>
  );
};

export default SchedulingDashboard;