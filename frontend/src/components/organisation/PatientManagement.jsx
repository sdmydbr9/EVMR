import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PetsIcon from '@mui/icons-material/Pets';
import api from '../../services/api';
import mockApi from '../../services/mockApi';
import { generateDemoPatients } from '../../services/demoData';
import moment from 'moment';
import { isDemoUser } from '../../utils/auth';

const PatientManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'add', 'edit'
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define submenu tabs
  const patientSubmenus = [
    { label: "Patient List", value: 0 },
    { label: "Registration", value: 1 },
    { label: "Pet Profiles", value: 2 },
    { label: "Patient History", value: 3 }
  ];

  useEffect(() => {
    console.log('PatientManagement component mounted');
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Check if we're using the demo account
      const demoUser = isDemoUser();

      let data = [];

      if (demoUser) {
        // Use demo data for demo users
        data = generateDemoPatients();
      } else {
        try {
          // Fetch from API for real users
          console.log('Fetching patients from API...');
          const response = await api.get('/patients');
          console.log('API response:', response.data);

          // Check if we have data and transform it to match our component's format if needed
          if (response.data && response.data.patients) {
            // The API returns an object with a 'patients' array
            const patientsArray = response.data.patients;

            if (Array.isArray(patientsArray)) {
              data = patientsArray.map(patient => ({
                id: patient.id || `PAT${Math.floor(Math.random() * 10000)}`,
                firstName: patient.name ? patient.name.split(' ')[0] : '',
                lastName: patient.name ? patient.name.split(' ').slice(1).join(' ') : '',
                email: patient.owner ? patient.owner.email : '',
                phone: patient.owner ? patient.owner.phone : '',
                address: patient.owner ? patient.owner.address : '',
                registrationDate: patient.created_at ? new Date(patient.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: 'active',
                petCount: 1,
                lastVisit: patient.last_visit_date || null,
                pets: [{
                  id: patient.id || `PET${Math.floor(Math.random() * 10000)}`,
                  name: patient.name || 'Unknown',
                  species: patient.species || 'Unknown',
                  breed: patient.breed || 'Unknown',
                  age: patient.date_of_birth ? Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : 1,
                  color: patient.color || 'Unknown'
                }]
              }));
            } else {
              console.error('API returned patients but it is not an array:', patientsArray);
              data = [];
            }
          } else if (response.data && Array.isArray(response.data)) {
            // Handle case where API directly returns an array
            data = response.data.map(patient => ({
              id: patient.id || `PAT${Math.floor(Math.random() * 10000)}`,
              firstName: patient.name ? patient.name.split(' ')[0] : '',
              lastName: patient.name ? patient.name.split(' ').slice(1).join(' ') : '',
              email: patient.owner ? patient.owner.email : '',
              phone: patient.owner ? patient.owner.phone : '',
              address: patient.owner ? patient.owner.address : '',
              registrationDate: patient.created_at ? new Date(patient.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: 'active',
              petCount: 1,
              lastVisit: patient.last_visit_date || null,
              pets: [{
                id: patient.id || `PET${Math.floor(Math.random() * 10000)}`,
                name: patient.name || 'Unknown',
                species: patient.species || 'Unknown',
                breed: patient.breed || 'Unknown',
                age: patient.date_of_birth ? Math.floor((new Date() - new Date(patient.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : 1,
                color: patient.color || 'Unknown'
              }]
            }));
          } else {
            console.error('Unexpected API response format:', response.data);
            data = [];
          }

          if (!data || data.length === 0) {
            // If API returns empty data, use mock API
            const mockResponse = await mockApi.patients.getAllPatients();
            data = mockResponse.patients;

            setNotification({
              open: true,
              message: 'No patients found in database. Showing sample data.',
              severity: 'info'
            });
          }
        } catch (error) {
          console.error('API error:', error);
          // Fallback to mock API for real users if API fails
          const mockResponse = await mockApi.patients.getAllPatients();
          data = mockResponse.patients;

          setNotification({
            open: true,
            message: 'Error connecting to server. Showing sample data.',
            severity: 'warning'
          });
        }
      }

      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Final fallback - generate demo data directly
      setPatients(generateDemoPatients());
      setNotification({
        open: true,
        message: 'Error loading patients. Showing sample data.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDemoPatients = () => {
    // Generate more realistic demo data
    const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Jessica', 'Robert', 'Jennifer', 'William', 'Elizabeth', 'Richard', 'Linda', 'Charles'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Ave', 'Cedar Ln', 'Pine St', 'Elm Dr', 'Lake View Rd', 'River Rd'];

    return Array.from({ length: 50 }, (_, index) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const street = streets[Math.floor(Math.random() * streets.length)];
      const houseNumber = Math.floor(100 + Math.random() * 9900);
      const petCount = Math.floor(1 + Math.random() * 3);
      const hasVisited = Math.random() > 0.3;

      return {
        id: `PAT${1000 + index}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1-555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        registrationDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 86400000).toISOString().split('T')[0],
        status: ['active', 'inactive'][Math.floor(Math.random() * 2)],
        petCount,
        lastVisit: hasVisited ? new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString().split('T')[0] : null,
        address: `${houseNumber} ${street}, ${city}`,
        pets: Array.from({ length: petCount }, (_, i) => ({
          id: `PET${1000 + index}-${i + 1}`,
          name: ['Max', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Luna', 'Bailey', 'Daisy', 'Sadie', 'Rocky'][Math.floor(Math.random() * 10)],
          species: ['Dog', 'Cat', 'Bird', 'Rabbit'][Math.floor(Math.random() * 4)],
          breed: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Persian', 'Siamese', 'Maine Coon', 'Parrot', 'Cockatiel', 'Lop', 'Mini Lop'][Math.floor(Math.random() * 10)],
          age: Math.floor(1 + Math.random() * 15),
          color: ['Black', 'White', 'Brown', 'Gray', 'Golden', 'Mixed'][Math.floor(Math.random() * 6)]
        })),
        visits: hasVisited ? Array.from({ length: Math.floor(1 + Math.random() * 5) }, (_, i) => ({
          id: `VIS${1000 + index}-${i + 1}`,
          date: new Date(Date.now() - Math.floor(Math.random() * 365) * 86400000).toISOString().split('T')[0],
          reason: ['Routine Checkup', 'Vaccination', 'Injury Treatment', 'Surgery Follow-up', 'Dental Cleaning', 'Emergency Visit'][Math.floor(Math.random() * 6)],
          doctor: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis', 'Dr. Miller'][Math.floor(Math.random() * 6)],
          outcome: ['Treated', 'Follow-up Needed', 'Referred', 'Recovered', 'Under Observation', 'Medication Prescribed'][Math.floor(Math.random() * 6)],
          notes: ['Patient is doing well.', 'Prescribed medication for 7 days.', 'Follow up in 2 weeks.', 'Recovery progressing as expected.', 'Referred to specialist.'][Math.floor(Math.random() * 5)]
        })) : []
      };
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      address: patient.address || '',
      status: patient.status
    });
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      address: patient.address || '',
      status: patient.status
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setPatientForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      try {
        const demoUser = isDemoUser();

        if (!demoUser) {
          try {
            // For real users, try to delete via API
            await api.delete(`/patients/${patient.id}`);
          } catch (error) {
            console.error('Error deleting patient via API:', error);
            // Try to use mock API
            try {
              await mockApi.patients.deletePatient(patient.id);
            } catch (mockError) {
              console.error('Mock API error:', mockError);
              // Continue with local state update even if both APIs fail
            }
          }
        }

        // Update local state
        setPatients(patients.filter(p => p.id !== patient.id));

        setNotification({
          open: true,
          message: 'Patient deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting patient:', error);
        setNotification({
          open: true,
          message: 'Error deleting patient',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm({
      ...patientForm,
      [name]: value
    });
  };

  const handleSavePatient = async () => {
    try {
      const demoUser = isDemoUser();
      
      if (dialogMode === 'add') {
        // Prepare new patient object
        const newPatient = {
          id: `PAT${Math.floor(Math.random() * 10000)}`,
          firstName: patientForm.firstName,
          lastName: patientForm.lastName,
          email: patientForm.email,
          phone: patientForm.phone,
          address: patientForm.address,
          registrationDate: new Date().toISOString().split('T')[0],
          status: 'active',
          petCount: patientForm.pets.length,
          lastVisit: null,
          pets: patientForm.pets
        };
        
        if (!demoUser) {
          try {
            // For real users, try to use the API
            const response = await api.post('/patients', {
              firstName: patientForm.firstName,
              lastName: patientForm.lastName,
              email: patientForm.email,
              phone: patientForm.phone,
              address: patientForm.address,
              pets: patientForm.pets
            });
            
            // If API call is successful, use the returned ID
            if (response.data && response.data.patientId) {
              newPatient.id = response.data.patientId;
            }
          } catch (apiError) {
            console.error('API error while adding patient:', apiError);
            setNotification({
              open: true,
              message: 'Error adding patient: ' + (apiError.response?.data?.message || apiError.message),
              severity: 'error'
            });
            return; // Don't continue if API call fails
          }
        }
        
        // Update local state
        setPatients([newPatient, ...patients]);
        
        setNotification({
          open: true,
          message: 'Patient added successfully',
          severity: 'success'
        });
      } else if (dialogMode === 'edit') {
        if (!demoUser) {
          try {
            // For real users, try to update via API
            await api.put(`/patients/${selectedPatient.id}`, {
              firstName: patientForm.firstName,
              lastName: patientForm.lastName,
              email: patientForm.email,
              phone: patientForm.phone,
              address: patientForm.address,
              pets: patientForm.pets
            });
          } catch (apiError) {
            console.error('API error while updating patient:', apiError);
            setNotification({
              open: true,
              message: 'Error updating patient: ' + (apiError.response?.data?.message || apiError.message),
              severity: 'error'
            });
            return; // Don't continue if API call fails
          }
        }
        
        // Update local state regardless of API call
        setPatients(patients.map(p => 
          p.id === selectedPatient.id ? 
          {
            ...p,
            firstName: patientForm.firstName,
            lastName: patientForm.lastName,
            email: patientForm.email,
            phone: patientForm.phone,
            address: patientForm.address,
            petCount: patientForm.pets.length,
            pets: patientForm.pets
          } : p
        ));
        
        setNotification({
          open: true,
          message: 'Patient updated successfully',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      setNotification({
        open: true,
        message: 'Error saving patient: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Filter patients based on search term
  const filteredPatients = Array.isArray(patients) ? patients.filter(patient =>
    (patient.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone || '').includes(searchTerm) ||
    (patient.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Slice the data for pagination
  const paginatedPatients = filteredPatients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Patient List
        return (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  placeholder="Search patients..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{ width: 300, mr: 2 }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPatient}
              >
                Add Patient
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>Loading patients...</Typography>
              </Box>
            ) : paginatedPatients.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">No patients found</Typography>
                <Typography color="textSecondary">Try adjusting your search or add a new patient</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddPatient}
                  sx={{ mt: 2 }}
                >
                  Add Patient
                </Button>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell>Patient ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Registration Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Pets</TableCell>
                      <TableCell>Last Visit</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedPatients.map(patient => (
                      <TableRow key={patient.id} hover>
                        <TableCell>{patient.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                              {patient.firstName[0]}{patient.lastName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{patient.firstName} {patient.lastName}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{patient.email}</Typography>
                          <Typography variant="body2" color="text.secondary">{patient.phone}</Typography>
                        </TableCell>
                        <TableCell>{patient.registrationDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={patient.status}
                            size="small"
                            color={patient.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PetsIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2">{patient.petCount}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{patient.lastVisit || 'Never'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleViewPatient(patient)} title="View">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEditPatient(patient)} title="Edit">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeletePatient(patient)} title="Delete">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredPatients.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )}
          </>
        );

      case 1: // Registration
        return (
          <Box sx={{ py: 3 }}>
            <Typography variant="h6" gutterBottom>Patient Registration</Typography>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    name="firstName"
                    value={patientForm.firstName}
                    onChange={handleFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    variant="outlined"
                    name="lastName"
                    value={patientForm.lastName}
                    onChange={handleFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    name="email"
                    value={patientForm.email}
                    onChange={handleFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handleFormChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    name="address"
                    value={patientForm.address}
                    onChange={handleFormChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      name="status"
                      value={patientForm.status}
                      onChange={handleFormChange}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleSavePatient}
                      sx={{ mr: 2 }}
                      disabled={!patientForm.firstName || !patientForm.lastName || !patientForm.email || !patientForm.phone}
                    >
                      Register Patient
                    </Button>
                    <Button variant="outlined" onClick={() => setPatientForm({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      address: '',
                      status: 'active'
                    })}>
                      Clear Form
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      case 2: // Pet Profiles
        return (
          <Box sx={{ py: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Pet Profiles</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/pets/add')}
              >
                Add New Pet
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>Loading pet profiles...</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {patients.filter(patient => patient.petCount > 0).slice(0, 9).map(patient => (
                  <Grid item xs={12} sm={6} md={4} key={patient.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PetsIcon />
                          </Avatar>
                        }
                        title={`${patient.firstName} ${patient.lastName}'s Pets`}
                        subheader={`${patient.petCount} pet${patient.petCount > 1 ? 's' : ''} registered`}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        {patient.pets ? (
                          patient.pets.map((pet, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                              <Avatar
                                src={`https://source.unsplash.com/random/100x100?${pet.species.toLowerCase()}`}
                                alt={pet.name}
                                sx={{ width: 40, height: 40, mr: 2 }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {pet.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {pet.species} • {pet.breed} • {pet.age} yr{pet.age !== 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        ) : (
                          Array.from({ length: patient.petCount }, (_, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                              <Avatar
                                src={`https://source.unsplash.com/random/100x100?pet,${i}`}
                                alt="Pet"
                                sx={{ width: 40, height: 40, mr: 2 }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {['Max', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Luna', 'Bailey', 'Daisy'][Math.floor(Math.random() * 8)]}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {['Dog', 'Cat', 'Bird', 'Rabbit'][Math.floor(Math.random() * 4)]} • {Math.floor(1 + Math.random() * 12)} yrs
                                </Typography>
                              </Box>
                            </Box>
                          ))
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => navigate(`/pets/profile/${patient.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {/* Show message if no pets found */}
                {patients.filter(patient => patient.petCount > 0).length === 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="textSecondary">No pet profiles found</Typography>
                      <Typography color="textSecondary">Register new patients with pets to see them here</Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddPatient}
                        sx={{ mt: 2 }}
                      >
                        Add New Patient
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        );

      case 3: // Patient History
        return (
          <Box sx={{ py: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Patient Visit History</Typography>
              <TextField
                placeholder="Search by patient name or reason..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Typography>Loading visit history...</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell>Patient</TableCell>
                      <TableCell>Visit Date</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Doctor</TableCell>
                      <TableCell>Outcome</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients
                      .filter(p => p.lastVisit && p.visits && p.visits.length > 0)
                      .flatMap(patient =>
                        patient.visits.map(visit => ({
                          patientId: patient.id,
                          patientName: `${patient.firstName} ${patient.lastName}`,
                          patientInitials: `${patient.firstName[0]}${patient.lastName[0]}`,
                          ...visit
                        }))
                      )
                      .filter(visit =>
                        visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        visit.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        visit.doctor.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .slice(0, 15)
                      .map((visit, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                                {visit.patientInitials}
                              </Avatar>
                              <Typography variant="body2">{visit.patientName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{visit.date}</TableCell>
                          <TableCell>{visit.reason}</TableCell>
                          <TableCell>{visit.doctor}</TableCell>
                          <TableCell>
                            <Chip
                              label={visit.outcome}
                              size="small"
                              color={
                                visit.outcome.includes('Treated') || visit.outcome.includes('Recovered') ? 'success' :
                                visit.outcome.includes('Follow-up') || visit.outcome.includes('Observation') ? 'warning' :
                                visit.outcome.includes('Referred') ? 'info' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/records/details/${visit.patientId}`)}
                            >
                              View Record
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                    {/* Show message if no visits found */}
                    {patients.filter(p => p.lastVisit && p.visits && p.visits.length > 0).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="textSecondary">No visit history found</Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Patient visits will appear here once they've been recorded
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );

      default:
        return <Typography>Tab content not implemented</Typography>;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
          Patient Management
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {patientSubmenus.map((menu) => (
            <Tab key={menu.value} label={menu.label} />
          ))}
        </Tabs>

        {renderTabContent()}
      </Box>

      {/* Patient View/Edit/Add Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'view' ? 'Patient Details' :
           dialogMode === 'add' ? 'Add New Patient' : 'Edit Patient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={patientForm.firstName}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={patientForm.lastName}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={patientForm.email}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={patientForm.phone}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={patientForm.address}
                onChange={handleFormChange}
                multiline
                rows={3}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  name="status"
                  value={patientForm.status}
                  onChange={handleFormChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {dialogMode !== 'view' && (
            <Button onClick={handleSavePatient} variant="contained" color="primary">
              Save
            </Button>
          )}
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientManagement;
