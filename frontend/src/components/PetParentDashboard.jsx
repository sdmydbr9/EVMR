import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Pets as PetsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccessTime as AccessTimeIcon,
  ContentCut as GroomingIcon,
  SportsBaseball as PlayingIcon,
  PhotoCamera as CameraIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer 
} from 'recharts';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { format, addDays, subDays, startOfDay, parseISO } from 'date-fns';
import axios from 'axios';
import { getBackendUrl } from '../services/api';

// Sample weight data
const weightData = [
  { month: 'Nov', weight: 40 },
  { month: 'Nov', weight: 38 },
  { month: 'Dec', weight: 42 },
  { month: 'Dec', weight: 45 },
  { month: 'Dec', weight: 43 },
  { month: 'Jan', weight: 45 },
  { month: 'Jan', weight: 44 },
];

// Sample quality of life data
const qualityOfLifeData = [
  { aspect: 'Behaviour', value: 8 },
  { aspect: 'Household', value: 9 },
  { aspect: 'Discomfort', value: 7 },
  { aspect: 'Hygiene', value: 8 },
  { aspect: 'Nourishment', value: 9 },
  { aspect: 'Movement', value: 7 },
  { aspect: 'Elimination', value: 8 },
];

// Sample upcoming schedule data
const upcomingSchedule = [
  { 
    type: 'Veterinary Appointment',
    time: '10:00 AM', 
    iconColor: '#ff6b6b',
    icon: <AccessTimeIcon />
  },
  { 
    type: 'Grooming',
    time: '14:00 PM', 
    iconColor: '#4d96ff',
    icon: <GroomingIcon />
  },
  { 
    type: 'Playing & Socializing',
    time: '17:00 PM', 
    iconColor: '#6dd47e',
    icon: <PlayingIcon />
  }
];

// Days of week for calendar
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate calendar days centered around today
const generateCalendarWeek = () => {
  const today = new Date();
  const days = [];
  
  // Generate 3 days before today
  for (let i = 3; i > 0; i--) {
    const date = subDays(today, i);
    days.push({
      date,
      dayOfMonth: date.getDate(),
      dayOfWeek: date.getDay(),
      isToday: false
    });
  }
  
  // Add today
  days.push({
    date: today,
    dayOfMonth: today.getDate(),
    dayOfWeek: today.getDay(),
    isToday: true
  });
  
  // Generate 3 days after today
  for (let i = 1; i <= 3; i++) {
    const date = addDays(today, i);
    days.push({
      date,
      dayOfMonth: date.getDate(),
      dayOfWeek: date.getDay(),
      isToday: false
    });
  }
  
  return days;
};

// Pet API service
const petService = {
  fetchPets: async () => {
    try {
      const response = await axios.get('/api/pets');
      return response.data.pets;
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  },
  
  addPet: async (petData) => {
    try {
      const response = await axios.post('/api/pets', petData);
      return response.data;
    } catch (error) {
      console.error('Error adding pet:', error);
      throw error;
    }
  },
  
  uploadPetImage: async (petId, formData) => {
    try {
      const response = await axios.post(`/api/pets/${petId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading pet image:', error);
      throw error;
    }
  }
};

// Map camelCase properties to snake_case database fields for pets
const mapPetData = (pet) => {
  // Handle both snake_case and camelCase field names
  return {
    ...pet,
    imageUrl: pet.image_url || pet.imageUrl, // Handle both formats
    dateOfBirth: pet.date_of_birth || pet.dateOfBirth,
    isNeutered: pet.is_neutered || pet.isNeutered,
    microchipId: pet.microchip_id || pet.microchipId,
    ownerId: pet.owner_id || pet.ownerId
  };
};

// Helper function to get the complete image URL
const getPetImageUrl = (imageUrl) => {
  console.log('Processing image URL:', imageUrl);
  
  if (!imageUrl) {
    console.log('No image URL provided, returning null');
    return null;
  }
  
  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http')) {
    console.log('Using absolute URL:', imageUrl);
    return imageUrl;
  }
  
  // If it's a relative URL from uploads, prepend the backend URL
  if (imageUrl.startsWith('/uploads')) {
    const backendUrl = getBackendUrl();
    const fullUrl = `${backendUrl}${imageUrl}`;
    console.log('Using uploaded image URL:', fullUrl);
    // Test if the image is accessible
    fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          console.error('Image not accessible:', fullUrl, response.status);
        } else {
          console.log('Image accessible:', fullUrl);
        }
      })
      .catch(error => console.error('Error checking image:', error));
    return fullUrl;
  }
  
  console.log('Other image URL type, returning as is:', imageUrl);
  return imageUrl;
};

const PetParentDashboard = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const calendarDays = generateCalendarWeek();
  const [myPets, setMyPets] = useState([]);
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addPetDialogOpen, setAddPetDialogOpen] = useState(false);
  const [petFormData, setPetFormData] = useState({
    name: '',
    species: '',
    breed: '',
    color: '',
    dateOfBirth: '',
    gender: 'male',
    isNeutered: false,
    microchipId: ''
  });
  const [petImage, setPetImage] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Sample activities
  const activities = [
    { id: 1, name: 'Walking', time: '3:00 PM', image: '/images/activities/walking.jpg' },
    { id: 2, name: 'Training', time: '4:00 PM', image: '/images/activities/training.jpg' },
    { id: 3, name: 'Playdate', time: '5:00 PM', image: '/images/activities/playdate.jpg' }
  ];

  // Fetch pets on component mount
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const pets = await petService.fetchPets();
      console.log('Fetched pets (raw):', pets);
      
      // Convert snake_case fields to camelCase
      const mappedPets = pets ? pets.map(mapPetData) : [];
      console.log('Mapped pets:', mappedPets);
      
      setMyPets(mappedPets || []);
      // Reset selected pet index if it's out of bounds
      if (mappedPets && mappedPets.length > 0 && selectedPetIndex >= mappedPets.length) {
        setSelectedPetIndex(0);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      showNotification('Failed to load pets', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get the currently selected pet
  const selectedPet = myPets.length > 0 ? myPets[selectedPetIndex] : null;

  const handlePetSelect = (index) => {
    setSelectedPetIndex(index);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddPetClick = () => {
    setAddPetDialogOpen(true);
  };

  const handleCloseAddPetDialog = () => {
    setAddPetDialogOpen(false);
    resetPetForm();
  };

  const resetPetForm = () => {
    setPetFormData({
      name: '',
      species: '',
      breed: '',
      color: '',
      dateOfBirth: '',
      gender: 'male',
      isNeutered: false,
      microchipId: ''
    });
    setPetImage(null);
    setPetImagePreview('');
  };

  const handlePetFormChange = (e) => {
    const { name, value } = e.target;
    setPetFormData({
      ...petFormData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPetImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPetImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPet = async () => {
    // Basic validation
    if (!petFormData.name || !petFormData.species || !petFormData.breed || !petFormData.dateOfBirth) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      // First create the pet in the database
      console.log('Adding pet:', petFormData);
      const response = await petService.addPet(petFormData);
      console.log('Pet added response:', response);
      
      // If we have an image, upload it
      if (petImage && response.pet && response.pet.id) {
        console.log('Uploading image for pet ID:', response.pet.id);
        console.log('Image file:', petImage);
        const formData = new FormData();
        formData.append('image', petImage);
        console.log('FormData created:', formData);
        const uploadResponse = await petService.uploadPetImage(response.pet.id, formData);
        console.log('Image upload response:', uploadResponse);
      }
      
      // Refresh the pet list
      await fetchPets();
      
      // Close dialog and show success message
      handleCloseAddPetDialog();
      showNotification('Pet added successfully!', 'success');
    } catch (error) {
      console.error('Error adding pet:', error);
      showNotification('Failed to add pet. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Happy Pets, Happier You
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Let's Get Started!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main Content - Left Column */}
          <Grid item xs={12} md={8}>
            {/* Your Pets Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Pets
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {myPets.map((pet, index) => (
                  <Box key={pet.id} sx={{ textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mb: 1, 
                        border: index === selectedPetIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid #fff',
                        boxShadow: index === selectedPetIndex ? `0 2px 8px ${theme.palette.primary.main}` : '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        bgcolor: 'primary.light'
                      }} 
                      alt={pet.name}
                      src={pet.imageUrl ? getPetImageUrl(pet.imageUrl) : undefined}
                      onClick={() => handlePetSelect(index)}
                    >
                      {pet.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography 
                      variant="subtitle2" 
                      color={index === selectedPetIndex ? 'primary' : 'text.primary'}
                      sx={{ fontWeight: index === selectedPetIndex ? 'bold' : 'normal' }}
                    >
                      {pet.name}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      mb: 1, 
                      bgcolor: 'primary.main',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    onClick={handleAddPetClick}
                  >
                    <AddIcon />
                  </Avatar>
                  <Typography variant="subtitle2">Add New</Typography>
                </Box>
              </Box>
            </Box>

            {/* Activities Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Activities
              </Typography>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{ mb: 2 }}
              >
                <Tab value="all" label="All" sx={{ textTransform: 'none' }} />
                <Tab value="alone" label="Alone" sx={{ textTransform: 'none' }} />
                <Tab value="with-other-pets" label="With Other Pets" sx={{ textTransform: 'none' }} />
              </Tabs>
              
              <Grid container spacing={2}>
                {activities.map(activity => (
                  <Grid item xs={12} sm={4} key={activity.id}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 3
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={activity.image} 
                            sx={{ width: 32, height: 32, mr: 1 }}
                            variant="rounded"
                          />
                        </Box>
                        <IconButton size="small">
                          <ChevronRightIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                <Grid item xs={12} sm={4}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      border: '1px dashed #ccc',
                      cursor: 'pointer'
                    }}
                  >
                    <IconButton color="primary" sx={{ mb: 1 }}>
                      <AddIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      Add Activity
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Weight Tracker */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Weight Tracker
                </Typography>
                <Button variant="text" size="small">
                  View all
                </Button>
              </Box>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Weight
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4" fontWeight="bold">
                      44 lbs
                    </Typography>
                    <Chip 
                      label="-2%" 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        bgcolor: 'error.light',
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                </Box>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis 
                        domain={['dataMin - 5', 'dataMax + 5']} 
                        ticks={[20, 40, 60]} 
                        label={{ value: 'lbs', position: 'insideLeft', angle: -90 }} 
                      />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#34C759" 
                        activeDot={{ r: 8 }} 
                        dot={{ r: 4 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Pet Profile & Calendar */}
          <Grid item xs={12} md={4}>
            {/* Pet Profile Card */}
            <Paper sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
              {selectedPet ? (
                <>
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      fontSize: '3rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {selectedPet.imageUrl ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={getPetImageUrl(selectedPet.imageUrl)}
                        alt={selectedPet.name}
                        sx={{ width: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
                      />
                    ) : (
                      selectedPet.name.charAt(0).toUpperCase()
                    )}
                  </Box>
                  <CardContent sx={{ pt: 2, pb: 2 }}>
                    <Box sx={{ textAlign: 'center', mt: -1 }}>
                      <IconButton 
                        sx={{ 
                          position: 'absolute', 
                          right: 8, 
                          top: 8, 
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.95)'
                          }
                        }}
                        onClick={handleAddPetClick}
                      >
                        <AddIcon />
                      </IconButton>
                      <Typography variant="h5" fontWeight="medium">
                        {selectedPet.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {selectedPet.breed}
                      </Typography>
                    </Box>
                  </CardContent>
                </>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: 270,
                    p: 3
                  }}
                >
                  <PetsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    No pets selected
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleAddPetClick}
                  >
                    Add Pet
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Calendar */}
            <Paper sx={{ mb: 4, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {format(new Date(), 'MMMM yyyy')}
                </Typography>
                <Box>
                  <IconButton size="small">
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {/* Calendar Week View */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {calendarDays.map((day, index) => (
                  <Grid item key={index} xs>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {daysOfWeek[day.dayOfWeek]}
                      </Typography>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.75rem',
                          bgcolor: day.isToday ? 'primary.main' : 'transparent',
                          color: day.isToday ? 'white' : 'text.primary',
                          border: day.isToday ? 'none' : '1px solid #eee'
                        }}
                      >
                        {day.dayOfMonth}
                      </Avatar>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Upcoming Schedule */}
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                  Upcoming Schedule
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {format(new Date(), 'EEEE, d MMMM yyyy')}
                </Typography>
                
                <Stack spacing={2}>
                  {upcomingSchedule.map((item, index) => (
                    <Paper 
                      key={index}
                      variant="outlined"
                      sx={{ 
                        p: 1.5,
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1.5, 
                            bgcolor: 'background.paper',
                            border: `1px solid ${item.iconColor}`,
                            color: item.iconColor
                          }}
                        >
                          {item.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Paper>

            {/* Quality of Life Assessment */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Quality of Life Assessment
                </Typography>
                <Button variant="text" size="small">
                  View all
                </Button>
              </Box>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityOfLifeData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="aspect" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar 
                        name="Pet" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.5} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Add Pet Dialog */}
      <Dialog 
        open={addPetDialogOpen} 
        onClose={handleCloseAddPetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Add New Pet</Typography>
            <IconButton onClick={handleCloseAddPetDialog} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Pet Image Upload */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  border: '3px dashed #ccc',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f5'
                }}
              >
                {petImagePreview ? (
                  <img
                    src={petImagePreview}
                    alt="Pet Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <PetsIcon sx={{ fontSize: 60, color: '#aaa' }} />
                )}
                <input
                  accept="image/*"
                  type="file"
                  hidden
                  id="pet-image-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="pet-image-upload">
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark
                      }
                    }}
                    component="span"
                  >
                    <CameraIcon fontSize="small" />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            {/* Basic Info */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={petFormData.name}
                onChange={handlePetFormChange}
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="species-label">Species</InputLabel>
                <Select
                  labelId="species-label"
                  name="species"
                  value={petFormData.species}
                  onChange={handlePetFormChange}
                  label="Species"
                  required
                >
                  <MenuItem value="Dog">Dog</MenuItem>
                  <MenuItem value="Cat">Cat</MenuItem>
                  <MenuItem value="Bird">Bird</MenuItem>
                  <MenuItem value="Rabbit">Rabbit</MenuItem>
                  <MenuItem value="Hamster">Hamster</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Breed"
                name="breed"
                value={petFormData.breed}
                onChange={handlePetFormChange}
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={petFormData.color}
                onChange={handlePetFormChange}
                required
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={petFormData.dateOfBirth}
                onChange={handlePetFormChange}
                required
                margin="dense"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 1 }}>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={petFormData.gender}
                  onChange={handlePetFormChange}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={petFormData.isNeutered}
                    onChange={(e) => 
                      setPetFormData({
                        ...petFormData,
                        isNeutered: e.target.checked
                      })
                    }
                    name="isNeutered"
                  />
                }
                label={petFormData.gender === 'male' ? 'Neutered' : 'Spayed'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Microchip ID (Optional)"
                name="microchipId"
                value={petFormData.microchipId}
                onChange={handlePetFormChange}
                margin="dense"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAddPetDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitPet}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Add Pet'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PetParentDashboard; 