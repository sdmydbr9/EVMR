import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,

  Avatar,
  CardContent,
  CardMedia,
  IconButton,


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

  Pets as PetsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,

  PhotoCamera as CameraIcon,
  Close as CloseIcon,

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
import { format, addDays, subDays } from 'date-fns';
import axios from 'axios';
import { getBackendUrl } from '../services/api';
import HealthRecords from './HealthRecords';
// import { useNavigate } from 'react-router-dom'; // Not needed anymore

// Weight and quality of life data will be managed as state

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
  // const navigate = useNavigate(); // Not needed anymore
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today's date
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
  const [weightData, setWeightData] = useState([]);
  const [qualityOfLifeData, setQualityOfLifeData] = useState([]);

  // Fetch pets on component mount
  useEffect(() => {
    fetchPets();
  }, []);

  // Fetch appointments, weight data, and quality of life data when selected pet changes
  useEffect(() => {
    if (myPets.length > 0 && selectedPetIndex >= 0) {
      fetchAppointments();
      fetchWeightData();
      fetchQualityOfLifeData();
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
      // Don't show error notification to the user
      // Just set empty appointments array
      setAppointments([]);
    }
  };

  const fetchWeightData = async () => {
    if (!myPets[selectedPetIndex]) return;

    try {
      const selectedPet = myPets[selectedPetIndex];

      // Fetch weight records for the selected pet
      const response = await axios.get(`/api/pets/${selectedPet.id}/weight`);
      const weightRecords = response.data.weight || [];

      // Format data for the chart
      if (weightRecords.length > 0) {
        const formattedData = weightRecords.map(record => ({
          date: format(new Date(record.date), 'MMM dd'),
          weight: parseFloat(record.weight)
        }));
        // Sort by date (oldest first)
        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeightData(formattedData);
      } else {
        setWeightData([]);
      }
    } catch (error) {
      console.error('Error fetching weight data:', error);
      setWeightData([]);
    }
  };

  const fetchQualityOfLifeData = async () => {
    if (!myPets[selectedPetIndex]) return;

    try {
      const selectedPet = myPets[selectedPetIndex];

      // Fetch quality of life assessments for the selected pet
      const response = await axios.get(`/api/pets/${selectedPet.id}/quality-of-life`);
      const assessments = response.data.qualityOfLife || [];

      // Format data for the radar chart
      if (assessments.length > 0) {
        // Use the most recent assessment
        const latestAssessment = assessments.sort((a, b) =>
          new Date(b.date) - new Date(a.date))[0];

        const formattedData = [
          { aspect: 'Mobility', value: latestAssessment.mobility },
          { aspect: 'Comfort', value: latestAssessment.comfort },
          { aspect: 'Happiness', value: latestAssessment.happiness },
          { aspect: 'Appetite', value: latestAssessment.appetite },
          { aspect: 'Hygiene', value: latestAssessment.hygiene }
        ];

        setQualityOfLifeData(formattedData);
      } else {
        setQualityOfLifeData([]);
      }
    } catch (error) {
      console.error('Error fetching quality of life data:', error);
      setQualityOfLifeData([]);
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
          {/* Left Column - Analytics & Info */}
          <Grid item xs={12} md={8}>
            {/* Highlight Cards */}
            <Box sx={{ mb: 4 }}>
              {/* Your Pets section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="medium">
                  Your Pets
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 4, overflowX: 'auto', pb: 1 }}>
                {myPets.map((pet, index) => (
                  <Box
                    key={pet.id}
                    sx={{
                      mr: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      opacity: selectedPetIndex === index ? 1 : 0.6,
                      transition: 'all 0.2s',
                      '&:hover': { opacity: 1 }
                    }}
                    onClick={() => handlePetSelect(index)}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        selectedPetIndex === index ? (
                          <Avatar
                            sx={{
                              width: 15,
                              height: 15,
                              bgcolor: 'primary.main',
                              border: `2px solid ${theme.palette.background.paper}`
                            }}
                          />
                        ) : null
                      }
                    >
                      <Avatar
                        alt={pet.name}
                        src={getPetImageUrl(pet.imageUrl)}
                        sx={{
                          width: 56,
                          height: 56,
                          mb: 1,
                          border: selectedPetIndex === index ? `2px solid ${theme.palette.primary.main}` : 'none'
                        }}
                      >
                        {pet.name ? pet.name.charAt(0) : <PetsIcon />}
                      </Avatar>
                    </Badge>
                    <Typography variant="body2" fontWeight={selectedPetIndex === index ? 'medium' : 'normal'}>
                      {pet.name}
                    </Typography>
                  </Box>
                ))}

                {/* Add New Pet Button */}
                <Box
                  sx={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={handleAddPetClick}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mb: 1,
                      bgcolor: 'success.main'
                    }}
                  >
                    <AddIcon />
                  </Avatar>
                  <Typography variant="body2">
                    Add New
                  </Typography>
                </Box>
              </Box>


            </Box>

            {/* Health Records Section */}
            {selectedPet && (
              <Box sx={{ mb: 4 }}>
                <HealthRecords id="health-records-component" petId={selectedPet.id} allowEdit={true} />
              </Box>
            )}

            {/* Weight Tracker */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Weight Tracker
                </Typography>

              </Box>
              <Paper sx={{ p: 3 }}>
                {weightData.length > 0 ? (
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
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
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No weight data available
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        // Find the weight section in the HealthRecords component and click its add button
                        const weightSection = document.querySelector('[data-section-id="weight"]');
                        if (weightSection) {
                          const addButton = weightSection.querySelector('button');
                          if (addButton) {
                            addButton.click();
                          }
                        }
                      }}
                      sx={{ mt: 1 }}
                    >
                      Add weight record
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Quality of Life Assessment */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Quality of Life Assessment
                </Typography>

              </Box>
              <Paper sx={{ p: 3 }}>
                {qualityOfLifeData.length > 0 ? (
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
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No quality of life data available
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        // Find the quality-of-life section in the HealthRecords component and click its add button
                        const qolSection = document.querySelector('[data-section-id="quality-of-life"]');
                        if (qolSection) {
                          const addButton = qolSection.querySelector('button');
                          if (addButton) {
                            addButton.click();
                          }
                        }
                      }}
                      sx={{ mt: 1 }}
                    >
                      Add assessment
                    </Button>
                  </Box>
                )}
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
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.200'
                        }}
                      >
                        <PetsIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                      </Box>
                    )}

                  </Box>
                  <CardContent sx={{ mt: 1, pt: 2 }}>
                    <Typography variant="h5" fontWeight="medium" gutterBottom>
                      {selectedPet.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPet.breed}
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
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.200'
                      }}
                    >
                      <PetsIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                    </Box>

                  </Box>
                  <CardContent sx={{ mt: 1, pt: 2 }}>
                    <Typography variant="h5" fontWeight="medium" gutterBottom>
No Pet Selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
Please select a pet
                    </Typography>
                  </CardContent>
                </>
              )}
            </Paper>

            {/* Calendar */}
            <Paper sx={{ mb: 4, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="medium">
                  {format(selectedDate, 'MMMM yyyy')}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => setSelectedDate(prevDate => subDays(prevDate, 7))}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedDate(prevDate => addDays(prevDate, 7))}
                  >
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
                  {format(selectedDate, 'EEEE, dd MMMM yyyy')}
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

                {/* Book an Appointment Button */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{ py: 1.5 }}
                    onClick={() => {
                      // Navigate to appointments page or open appointment dialog
                      console.log('Book appointment clicked');
                      // You can add navigation or dialog opening logic here
                    }}
                  >
                    Book an Appointment
                  </Button>
                </Box>
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