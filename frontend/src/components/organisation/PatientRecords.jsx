import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Pets as PetsIcon,
  Medication as MedicationIcon,
  Vaccines as VaccinesIcon,
  MonitorWeight as WeightIcon,
  Healing as HealingIcon,
  Event as EventIcon,
  Notes as NotesIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const response = await fetch('/api/patients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
        setFilteredPatients(data);
      } else {
        // Use mock data if API fails
        const mockPatients = generateMockPatients();
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Use mock data if API fails
      const mockPatients = generateMockPatients();
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPatients = () => {
    const species = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster'];
    const dogBreeds = ['Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle'];
    const catBreeds = ['Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Ragdoll'];
    const statuses = ['active', 'inactive', 'deceased'];
    const genders = ['Male', 'Female'];
    
    return Array.from({ length: 50 }, (_, i) => {
      const speciesIndex = Math.floor(Math.random() * species.length);
      const selectedSpecies = species[speciesIndex];
      const breeds = selectedSpecies === 'Dog' ? dogBreeds : selectedSpecies === 'Cat' ? catBreeds : ['Mixed'];
      
      return {
        id: i + 1,
        name: `Pet ${i + 1}`,
        species: selectedSpecies,
        breed: breeds[Math.floor(Math.random() * breeds.length)],
        age: Math.floor(Math.random() * 15) + 1,
        gender: genders[Math.floor(Math.random() * genders.length)],
        ownerName: `Owner ${i + 1}`,
        ownerContact: `555-${Math.floor(1000 + Math.random() * 9000)}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastVisit: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
        // Additional data for detailed view
        microchipId: `MC${Math.floor(10000000 + Math.random() * 90000000)}`,
        dateOfBirth: new Date(Date.now() - Math.floor(Math.random() * 473040000000)).toISOString().split('T')[0], // Random date within 15 years
        weight: (Math.random() * 50 + 1).toFixed(1),
        color: ['Black', 'White', 'Brown', 'Gray', 'Golden'][Math.floor(Math.random() * 5)],
        allergies: Math.random() > 0.7 ? ['Chicken', 'Beef', 'Dairy'][Math.floor(Math.random() * 3)] : 'None',
        medicalHistory: generateMockMedicalHistory(),
        vaccinations: generateMockVaccinations(),
        medications: generateMockMedications(),
        visits: generateMockVisits()
      };
    });
  };

  const generateMockMedicalHistory = () => {
    const conditions = [
      'Arthritis',
      'Diabetes',
      'Heart Disease',
      'Kidney Disease',
      'Allergies',
      'Dental Disease',
      'Obesity',
      'Ear Infection',
      'Skin Infection',
      'None'
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 3) }, () => 
      conditions[Math.floor(Math.random() * conditions.length)]
    ).filter(condition => condition !== 'None');
  };

  const generateMockVaccinations = () => {
    const vaccineTypes = [
      'Rabies',
      'Distemper',
      'Parvovirus',
      'Bordetella',
      'Leptospirosis',
      'Feline Leukemia',
      'Feline Immunodeficiency Virus'
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 4 + 1) }, (_, i) => ({
      id: i + 1,
      type: vaccineTypes[Math.floor(Math.random() * vaccineTypes.length)],
      date: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString().split('T')[0], // Within last year
      nextDue: new Date(Date.now() + Math.floor(Math.random() * 31536000000)).toISOString().split('T')[0], // Within next year
      administeredBy: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`
    }));
  };

  const generateMockMedications = () => {
    const medicationNames = [
      'Amoxicillin',
      'Prednisone',
      'Metronidazole',
      'Apoquel',
      'Rimadyl',
      'Cerenia',
      'Heartgard',
      'Nexgard'
    ];
    
    const frequencies = [
      'Once daily',
      'Twice daily',
      'Three times daily',
      'Every other day',
      'Weekly',
      'Monthly'
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
      id: i + 1,
      name: medicationNames[Math.floor(Math.random() * medicationNames.length)],
      dosage: `${Math.floor(Math.random() * 10) + 1} mg`,
      frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
      startDate: new Date(Date.now() - Math.floor(Math.random() * 7776000000)).toISOString().split('T')[0], // Within last 90 days
      endDate: new Date(Date.now() + Math.floor(Math.random() * 7776000000)).toISOString().split('T')[0], // Within next 90 days
      prescribedBy: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`
    }));
  };

  const generateMockVisits = () => {
    const visitTypes = [
      'Check-up',
      'Vaccination',
      'Surgery',
      'Emergency',
      'Dental Cleaning',
      'Follow-up'
    ];
    
    const diagnoses = [
      'Healthy',
      'Ear Infection',
      'Skin Allergy',
      'Dental Disease',
      'Gastrointestinal Issue',
      'Urinary Tract Infection',
      'Arthritis',
      'Obesity'
    ];
    
    return Array.from({ length: Math.floor(Math.random() * 5 + 1) }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString().split('T')[0], // Within last year
      type: visitTypes[Math.floor(Math.random() * visitTypes.length)],
      veterinarian: `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}`,
      diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
      treatment: 'Prescribed medication and recommended rest',
      notes: 'Patient responded well to treatment'
    }));
  };

  const applyFilters = () => {
    let result = [...patients];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(patient => 
        patient.name.toLowerCase().includes(term) ||
        patient.ownerName.toLowerCase().includes(term) ||
        patient.breed.toLowerCase().includes(term)
      );
    }
    
    setFilteredPatients(result);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  const getStatusChip = (status) => {
    let color;
    switch(status) {
      case 'active':
        color = 'success';
        break;
      case 'inactive':
        color = 'warning';
        break;
      case 'deceased':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        size="small" 
        color={color}
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  // Patient Detail View
  if (selectedPatient) {
    return (
      <Box sx={{ p: 3 }}>
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<BackIcon />}
              onClick={handleBackToList}
              sx={{ mr: 2 }}
            >
              Back to List
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Patient Record: {selectedPatient.name}
            </Typography>
          </Box>
          
          <Box>
            <Tooltip title="Print Record">
              <IconButton color="primary" sx={{ mr: 1 }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Record">
              <IconButton color="primary" sx={{ mr: 1 }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Record">
              <IconButton color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main',
                      mr: 2
                    }}
                  >
                    <PetsIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {selectedPatient.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedPatient.species} • {selectedPatient.breed}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {getStatusChip(selectedPatient.status)}
                    </Box>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Basic Information
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Age:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.age} years
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Gender:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.gender}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date of Birth:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.dateOfBirth}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Weight:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.weight} kg
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Color:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.color}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Microchip ID:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.microchipId}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Owner Information
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.ownerName}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Contact:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.ownerContact}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Medical Alerts
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Allergies:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.allergies}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Conditions:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {selectedPatient.medicalHistory.length > 0 
                        ? selectedPatient.medicalHistory.join(', ') 
                        : 'None'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ borderRadius: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                  }
                }}
              >
                <Tab label="Visit History" icon={<EventIcon />} iconPosition="start" />
                <Tab label="Vaccinations" icon={<VaccinesIcon />} iconPosition="start" />
                <Tab label="Medications" icon={<MedicationIcon />} iconPosition="start" />
                <Tab label="Medical Notes" icon={<NotesIcon />} iconPosition="start" />
              </Tabs>
              
              <Box sx={{ p: 3 }}>
                {/* Visit History Tab */}
                {activeTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Visit History
                    </Typography>
                    
                    {selectedPatient.visits.length === 0 ? (
                      <Typography variant="body1">No visit records found.</Typography>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Veterinarian</TableCell>
                              <TableCell>Diagnosis</TableCell>
                              <TableCell>Treatment</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedPatient.visits.map((visit) => (
                              <TableRow key={visit.id} hover>
                                <TableCell>{visit.date}</TableCell>
                                <TableCell>{visit.type}</TableCell>
                                <TableCell>{visit.veterinarian}</TableCell>
                                <TableCell>{visit.diagnosis}</TableCell>
                                <TableCell>{visit.treatment}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}
                
                {/* Vaccinations Tab */}
                {activeTab === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Vaccination Records
                    </Typography>
                    
                    {selectedPatient.vaccinations.length === 0 ? (
                      <Typography variant="body1">No vaccination records found.</Typography>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Vaccine</TableCell>
                              <TableCell>Date Administered</TableCell>
                              <TableCell>Next Due</TableCell>
                              <TableCell>Administered By</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedPatient.vaccinations.map((vaccination) => (
                              <TableRow key={vaccination.id} hover>
                                <TableCell>{vaccination.type}</TableCell>
                                <TableCell>{vaccination.date}</TableCell>
                                <TableCell>{vaccination.nextDue}</TableCell>
                                <TableCell>{vaccination.administeredBy}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}
                
                {/* Medications Tab */}
                {activeTab === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Medication History
                    </Typography>
                    
                    {selectedPatient.medications.length === 0 ? (
                      <Typography variant="body1">No medication records found.</Typography>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Medication</TableCell>
                              <TableCell>Dosage</TableCell>
                              <TableCell>Frequency</TableCell>
                              <TableCell>Start Date</TableCell>
                              <TableCell>End Date</TableCell>
                              <TableCell>Prescribed By</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedPatient.medications.map((medication) => (
                              <TableRow key={medication.id} hover>
                                <TableCell>{medication.name}</TableCell>
                                <TableCell>{medication.dosage}</TableCell>
                                <TableCell>{medication.frequency}</TableCell>
                                <TableCell>{medication.startDate}</TableCell>
                                <TableCell>{medication.endDate}</TableCell>
                                <TableCell>{medication.prescribedBy}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                )}
                
                {/* Medical Notes Tab */}
                {activeTab === 3 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Medical Notes
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Latest Visit: {selectedPatient.visits[0]?.date || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedPatient.visits[0]?.notes || 'No notes available.'}
                      </Typography>
                    </Paper>
                    
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
                      Medical History
                    </Typography>
                    
                    {selectedPatient.medicalHistory.length === 0 ? (
                      <Typography variant="body1">No medical history recorded.</Typography>
                    ) : (
                      <List>
                        {selectedPatient.medicalHistory.map((condition, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <HealingIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={condition} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Patient List View
  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Patient Records
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search patients by name, owner, or breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Species</TableCell>
                <TableCell>Breed</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Loading...</TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No patients found</TableCell>
                </TableRow>
              ) : (
                filteredPatients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>{patient.id}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.species}</TableCell>
                      <TableCell>{patient.breed}</TableCell>
                      <TableCell>{patient.age} years</TableCell>
                      <TableCell>{patient.ownerName}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>{getStatusChip(patient.status)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Record">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default PatientRecords;
