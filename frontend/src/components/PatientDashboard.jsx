import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Zoom,
  Fade,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Pets as PetsIcon,
  CalendarMonth as CalendarIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  QuestionMark as UnknownIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import axios from 'axios';

// API service for patients
const patientService = {
  getPatients: async (params) => {
    try {
      const response = await axios.get('/api/patients', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },
  
  getPatientById: async (id) => {
    try {
      const response = await axios.get(`/api/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },
  
  createPatient: async (patientData) => {
    try {
      const response = await axios.post('/api/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },
  
  updatePatient: async (id, patientData) => {
    try {
      const response = await axios.put(`/api/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  },
  
  deletePatient: async (id) => {
    try {
      const response = await axios.delete(`/api/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }
};

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(2),
}));

// Patient Dashboard Component
const PatientDashboard = () => {
  // State for patient list and filtering
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  
  // State for patient form
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    gender: '',
    color: '',
    weight: '',
    microchipId: '',
    owner: {
      name: '',
      phone: '',
      email: '',
      address: ''
    }
  });
  
  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);
  
  // Fetch patients with optional filters
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedSpecies) params.species = selectedSpecies;
      
      const response = await patientService.getPatients(params);
      console.log('Fetched patients:', response.patients); // Debug log
      setPatients(response.patients || []);
    } catch (error) {
      showNotification('Error loading patients', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle species filter change
  const handleSpeciesChange = (event) => {
    setSelectedSpecies(event.target.value);
  };
  
  // Apply filters
  const handleSearch = () => {
    fetchPatients();
  };
  
  // Reset filters
  const handleReset = () => {
    setSearchTerm('');
    setSelectedSpecies('');
    fetchPatients();
  };
  
  // Open form dialog for creating a new patient
  const handleAddPatient = () => {
    setFormMode('create');
    setFormData({
      name: '',
      species: '',
      breed: '',
      dateOfBirth: '',
      gender: '',
      color: '',
      weight: '',
      microchipId: '',
      owner: {
        name: '',
        phone: '',
        email: '',
        address: ''
      }
    });
    setOpen(true);
  };
  
  // Open form dialog for editing a patient
  const handleEditPatient = async (patient) => {
    console.log('Edit patient data:', patient); // Debug log
    try {
      setLoading(true);
      // Fetch fresh patient data to ensure we have all fields
      const freshData = await patientService.getPatientById(patient.id);
      console.log('Fresh patient data:', freshData); // Debug log
      
      setFormMode('edit');
      setFormData({
        name: freshData.name || '',
        species: freshData.species || '',
        breed: freshData.breed || '',
        dateOfBirth: freshData.dateOfBirth || freshData.date_of_birth || '',
        gender: freshData.gender || '',
        color: freshData.color || '',
        weight: freshData.weight || '',
        microchipId: freshData.microchipId || freshData.microchip_id || '',
        owner: {
          name: freshData.owner?.name || freshData.ownerName || freshData.owner_name || '',
          phone: freshData.owner?.phone || freshData.ownerPhone || freshData.owner_phone || '',
          email: freshData.owner?.email || freshData.ownerEmail || freshData.owner_email || '',
          address: freshData.owner?.address || freshData.ownerAddress || freshData.owner_address || ''
        }
      });
      setSelectedPatient(freshData);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      showNotification('Error loading patient details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open view dialog for patient details
  const handleViewPatient = async (patient) => {
    try {
      setLoading(true);
      // Fetch fresh patient data to ensure we have all fields
      const freshData = await patientService.getPatientById(patient.id);
      console.log('View patient data:', freshData); // Debug log
      
      // Map the data to ensure all fields are properly formatted
      const mappedData = {
        ...freshData,
        date_of_birth: freshData.dateOfBirth || freshData.date_of_birth || '',
        microchip_id: freshData.microchipId || freshData.microchip_id || '',
        owner_name: freshData.owner?.name || freshData.ownerName || freshData.owner_name || '',
        owner_phone: freshData.owner?.phone || freshData.ownerPhone || freshData.owner_phone || '',
        owner_email: freshData.owner?.email || freshData.ownerEmail || freshData.owner_email || '',
        owner_address: freshData.owner?.address || freshData.ownerAddress || freshData.owner_address || ''
      };
      
      setSelectedPatient(mappedData);
      setViewOpen(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      showNotification('Error loading patient details', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('owner.')) {
      const ownerField = name.split('.')[1];
      setFormData({
        ...formData,
        owner: {
          ...formData.owner,
          [ownerField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare the data for submission
      const submitData = {
        ...formData,
        date_of_birth: formData.dateOfBirth,
        microchip_id: formData.microchipId,
        owner_name: formData.owner.name,
        owner_phone: formData.owner.phone,
        owner_email: formData.owner.email,
        owner_address: formData.owner.address
      };
      
      if (formMode === 'create') {
        await patientService.createPatient(submitData);
        showNotification('Patient created successfully', 'success');
      } else {
        await patientService.updatePatient(selectedPatient.id, submitData);
        showNotification('Patient updated successfully', 'success');
      }
      
      setOpen(false);
      fetchPatients();
    } catch (error) {
      console.error('Form submission error:', error);
      showNotification(
        formMode === 'create'
          ? 'Error creating patient'
          : 'Error updating patient',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Handle patient deletion
  const handleDeletePatient = async (id) => {
    try {
      setLoading(true);
      await patientService.deletePatient(id);
      showNotification('Patient deleted successfully', 'success');
      fetchPatients();
    } catch (error) {
      showNotification('Error deleting patient', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };
  
  // Get gender icon
  const getGenderIcon = (gender) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return <MaleIcon color="primary" />;
      case 'female':
        return <FemaleIcon color="secondary" />;
      default:
        return <UnknownIcon color="action" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PetsIcon sx={{ fontSize: 35 }} />
          Patient Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddPatient}
        >
          New Patient
        </Button>
      </Box>
      
      <SearchBar elevation={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search patients or owners..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={selectedSpecies}
            onChange={handleSpeciesChange}
            label="Species"
          >
            <MenuItem value="">All Species</MenuItem>
            <MenuItem value="dog">Dog</MenuItem>
            <MenuItem value="cat">Cat</MenuItem>
            <MenuItem value="bird">Bird</MenuItem>
            <MenuItem value="rabbit">Rabbit</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
      </SearchBar>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {patients.map((patient) => (
            <Zoom in={true} key={patient.id} style={{ transitionDelay: '100ms' }}>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {patient.name}
                      </Typography>
                      {getGenderIcon(patient.gender)}
                    </Box>
                    <Stack spacing={1}>
                      <Chip 
                        icon={<PetsIcon />} 
                        label={`${patient.species}${patient.breed ? ` - ${patient.breed}` : ''}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        Owner: {patient.owner_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {patient.owner_phone}
                      </Typography>
                      {patient.date_of_birth && (
                        <Typography variant="body2" color="text.secondary">
                          DOB: {format(new Date(patient.date_of_birth), 'MMM dd, yyyy')}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewPatient(patient)}
                        color="info"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Patient">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditPatient(patient)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Patient">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeletePatient(patient.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </StyledCard>
              </Grid>
            </Zoom>
          ))}
        </Grid>
      )}
      
      {/* View Patient Dialog */}
      <Dialog 
        open={viewOpen} 
        onClose={() => setViewOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          Patient Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedPatient && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Species
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.species}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Breed
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.breed || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.gender}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.date_of_birth 
                    ? format(new Date(selectedPatient.date_of_birth), 'MMM dd, yyyy')
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Weight
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.weight ? `${selectedPatient.weight} kg` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Microchip ID
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.microchip_id || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Owner Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.owner_name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.owner_phone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.owner_email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedPatient.owner_address || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Patient Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          {formMode === 'create' ? 'Add New Patient' : 'Edit Patient'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Pet Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Species</InputLabel>
                <Select
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  label="Species"
                >
                  <MenuItem value="dog">Dog</MenuItem>
                  <MenuItem value="cat">Cat</MenuItem>
                  <MenuItem value="bird">Bird</MenuItem>
                  <MenuItem value="rabbit">Rabbit</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="breed"
                label="Breed"
                value={formData.breed}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="unknown">Unknown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="weight"
                label="Weight (kg)"
                type="number"
                value={formData.weight}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="microchipId"
                label="Microchip ID"
                value={formData.microchipId}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Owner Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="owner.name"
                label="Owner Name"
                value={formData.owner.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="owner.phone"
                label="Phone Number"
                value={formData.owner.phone}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="owner.email"
                label="Email"
                type="email"
                value={formData.owner.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="owner.address"
                label="Address"
                value={formData.owner.address}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientDashboard; 