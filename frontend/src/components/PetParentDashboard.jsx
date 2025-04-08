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
import PetInformation from './PetInformation';

// Sample weight data
const weightData = [
  { month: 'November', weight: 20 },
  { month: 'November', weight: 30 },
  { month: 'December', weight: 40 },
  { month: 'December', weight: 35 },
  { month: 'January', weight: 44 },
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

// Days of week for calendar
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate calendar days centered around selected date
const generateCalendarWeek = (date) => {
  const days = [];
  
  // Generate 3 days before selected date
  for (let i = 3; i > 0; i--) {
    const prevDate = subDays(date, i);
    days.push({
      date: prevDate,
      dayOfMonth: prevDate.getDate(),
      dayOfWeek: prevDate.getDay(),
      isToday: format(prevDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    });
  }
  
  // Add selected date
  days.push({
    date: date,
    dayOfMonth: date.getDate(),
    dayOfWeek: date.getDay(),
    isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  });
  
  // Generate 3 days after selected date
  for (let i = 1; i <= 3; i++) {
    const nextDate = addDays(date, i);
    days.push({
      date: nextDate,
      dayOfMonth: nextDate.getDate(),
      dayOfWeek: nextDate.getDay(),
      isToday: format(nextDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
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

  // Fetch pets on component mount
  useEffect(() => {
    fetchPets();
  }, []);

  // Fetch appointments when selected pet changes
  useEffect(() => {
    if (myPets.length > 0 && selectedPetIndex >= 0) {
      fetchAppointments();
    }
  }, [selectedPetIndex, myPets]);

  // Update calendar when selected date changes
  useEffect(() => {
    setCalendarDays(generateCalendarWeek(selectedDate));
  }, [selectedDate]);

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

  const fetchAppointments = async () => {
    if (!myPets[selectedPetIndex]) return;
    
    try {
      const response = await axios.get('/api/appointments', {
        params: {
          patientId: myPets[selectedPetIndex].id,
          status: 'scheduled,confirmed'
        }
      });
      
      // Sort appointments by start time
      const sortedAppointments = response.data.appointments.sort((a, b) => 
        new Date(a.start_time) - new Date(b.start_time)
      );
      
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showNotification('Failed to fetch appointments', 'error');
    }
  };

  // Get the currently selected pet
  const selectedPet = myPets.length > 0 ? myPets[selectedPetIndex] : null;

  const handlePetSelect = (index) => {
    setSelectedPetIndex(index);
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

  // Add a handler for date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
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
                {myPets.length > 0 ? (
                  myPets.map((pet, index) => (
                    <Box key={pet.id} sx={{ textAlign: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          mb: 1, 
                          border: index === selectedPetIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid #fff',
                          cursor: 'pointer',
                          bgcolor: 'primary.light'
                        }} 
                        alt={pet.name}
                        src={pet.imageUrl ? getPetImageUrl(pet.imageUrl) : undefined}
                        onClick={() => handlePetSelect(index)}
                      >
                        {pet.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {pet.name}
                      </Typography>
                    </Box>
                  ))
                ) : null}
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      mb: 1, 
                      bgcolor: 'primary.main',
                      cursor: 'pointer',
                    }}
                    onClick={handleAddPetClick}
                  >
                    <AddIcon />
                  </Avatar>
                  <Typography variant="subtitle2">Add New</Typography>
                </Box>
              </Box>
            </Box>

            {/* Information Section */}
            {selectedPet && (
              <PetInformation petId={selectedPet.id} />
            )}

            {/* Weight Tracker */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Weight Tracker
                </Typography>
                <Button variant="text" size="small" color="primary">
                  View all
                </Button>
              </Box>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis 
                        domain={[0, 70]} 
                        ticks={[0, 20, 40, 60]} 
                      />
                      <RechartsTooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#099268" 
                        activeDot={{ r: 8 }} 
                        dot={{ r: 4 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>

            {/* Quality of Life Assessment */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Quality of Life Assessment
                </Typography>
                <Button variant="text" size="small" color="primary">
                  View all
                </Button>
              </Box>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityOfLifeData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="aspect" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar 
                        name="Pet" 
                        dataKey="value" 
                        stroke="#099268" 
                        fill="#099268" 
                        fillOpacity={0.3} 
                      />
                    </RadarChart>
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
                      height: 250,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      color: 'primary.contrastText',
                      position: 'relative'
                    }}
                  >
                    {selectedPet.imageUrl ? (
                      <CardMedia
                        component="img"
                        height="250"
                        image={getPetImageUrl(selectedPet.imageUrl)}
                        alt={selectedPet.name}
                        sx={{ width: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img 
                        src="/images/black-pug.jpg" 
                        alt="Pet"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <Avatar
                      sx={{
                        position: 'absolute',
                        bottom: -20,
                        right: 20,
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        color: 'white',
                        border: '2px solid white',
                        zIndex: 1
                      }}
                    >
                      4
                    </Avatar>
                  </Box>
                  <CardContent sx={{ mt: 1, pt: 2 }}>
                    <Typography variant="h5" fontWeight="medium" gutterBottom>
                      {selectedPet.name || "Maxi"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPet.breed || "Bulldog"}
                    </Typography>
                  </CardContent>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      height: 250,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      color: 'primary.contrastText',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src="/images/black-pug.jpg" 
                      alt="Pet"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Avatar
                      sx={{
                        position: 'absolute',
                        bottom: -20,
                        right: 20,
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        color: 'white',
                        border: '2px solid white',
                        zIndex: 1
                      }}
                    >
                      4
                    </Avatar>
                  </Box>
                  <CardContent sx={{ mt: 1, pt: 2 }}>
                    <Typography variant="h5" fontWeight="medium" gutterBottom>
                      Maxi
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bulldog
                    </Typography>
                  </CardContent>
                </>
              )}
            </Paper>

            {/* Calendar */}
            <Paper sx={{ mb: 4, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="medium">
                  January 2025
                </Typography>
                <Box>
                  <IconButton size="small" sx={{ mr: 1 }}>
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              {/* Calendar Week View */}
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {calendarDays.map((day, index) => (
                  <Grid item xs key={index}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          '& .MuiAvatar-root': {
                            bgcolor: 'primary.light',
                            color: 'white'
                          }
                        }
                      }}
                      onClick={() => handleDateSelect(day.date)}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                        {daysOfWeek[day.dayOfWeek]}
                      </Typography>
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          fontSize: '0.875rem',
                          bgcolor: format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') 
                            ? 'primary.main' 
                            : day.isToday 
                              ? 'primary.light' 
                              : 'transparent',
                          color: format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') || day.isToday
                            ? 'white' 
                            : 'text.primary',
                          border: format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') || day.isToday
                            ? 'none' 
                            : '1px solid #eee',
                          transition: 'all 0.2s ease-in-out'
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
                <Typography variant="h6" fontWeight="medium" sx={{ mb: 1 }}>
                  Upcoming Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Thursday, 23 January 2025
                </Typography>
                
                <Stack spacing={2}>
                  {appointments.map((item) => (
                    <Paper 
                      key={item.id}
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        borderColor: '#eee'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1.5, 
                            bgcolor: 'background.paper',
                            border: `1px solid ${item.type === 'Veterinary Appointment' ? '#f03e3e' : item.type === 'Grooming' ? '#7048e8' : '#099268'}`,
                            color: item.type === 'Veterinary Appointment' ? '#f03e3e' : item.type === 'Grooming' ? '#7048e8' : '#099268'
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