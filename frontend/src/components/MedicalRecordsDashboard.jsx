import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Avatar,
  useTheme,
  Container
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Pets as PetsIcon, ContentCut as GroomingIcon, MedicalServices as VaccinationIcon, BugReport as DewormingIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

// Medical Records service for API calls
const medicalRecordsService = {
  getMedicalRecords: async (patientId) => {
    try {
      const response = await axios.get(`/api/medical-records/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },

  getMedicalRecord: async (id) => {
    try {
      const response = await axios.get(`/api/medical-records/record/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical record ${id}:`, error);
      throw error;
    }
  },

  createMedicalRecord: async (recordData) => {
    try {
      const response = await axios.post('/api/medical-records', recordData);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  updateMedicalRecord: async (id, recordData) => {
    try {
      const response = await axios.put(`/api/medical-records/${id}`, recordData);
      return response.data;
    } catch (error) {
      console.error(`Error updating medical record ${id}:`, error);
      throw error;
    }
  },

  deleteMedicalRecord: async (id) => {
    try {
      const response = await axios.delete(`/api/medical-records/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting medical record ${id}:`, error);
      throw error;
    }
  }
};

// Patient service for API calls
const patientService = {
  getPatients: async () => {
    try {
      const response = await axios.get('/api/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }
};

const MedicalRecordsDashboard = () => {
  // State for medical records
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  // State for patient options
  const [patientOptions, setPatientOptions] = useState([]);

  // States for medical care categories
  const [selectedVaccinationIndex, setSelectedVaccinationIndex] = useState(0);
  const [selectedDewormingIndex, setSelectedDewormingIndex] = useState(0);
  const [selectedGroomingIndex, setSelectedGroomingIndex] = useState(0);

  // Sample data for medical care categories
  const vaccinations = [
    { id: 1, name: "Rabies", date: "2023-12-15" },
    { id: 2, name: "DHPP", date: "2023-11-20" },
    { id: 3, name: "Bordetella", date: "2024-01-10" }
  ];
  
  const deworming = [
    { id: 1, name: "Pyrantel", date: "2024-01-05" },
    { id: 2, name: "Fenbendazole", date: "2023-10-25" }
  ];
  
  const grooming = [
    { id: 1, name: "Full Groom", date: "2024-02-10" },
    { id: 2, name: "Nail Trimming", date: "2024-03-05" },
    { id: 3, name: "Ear Cleaning", date: "2024-02-25" }
  ];

  // State for medical record form
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date(),
    type: 'soap',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    medications: [],
    vaccinations: [],
    labResults: [],
    notes: ''
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

  // Load medical records when patient changes
  useEffect(() => {
    if (selectedPatient) {
      fetchMedicalRecords();
    }
  }, [selectedPatient]);

  // Fetch patients for the dropdown
  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatientOptions(data.patients.map(patient => ({
        id: patient.id,
        name: `${patient.name} (${patient.species})`
      })));
    } catch (error) {
      showNotification('Error loading patients', 'error');
    }
  };

  // Fetch medical records for the selected patient
  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const data = await medicalRecordsService.getMedicalRecords(selectedPatient);
      setMedicalRecords(data.records);
    } catch (error) {
      showNotification('Error loading medical records', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientChange = (e) => {
    setSelectedPatient(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Open form dialog for creating a new record
  const handleAddRecord = () => {
    setFormMode('create');
    setFormData({
      patientId: selectedPatient,
      date: new Date(),
      type: 'soap',
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      medications: [],
      vaccinations: [],
      labResults: [],
      notes: ''
    });
    setOpen(true);
  };

  // Open form dialog for editing an existing record
  const handleEditRecord = (record) => {
    setCurrentRecord(record);
    setFormData({
      patientId: record.patientId,
      date: parseISO(record.date),
      type: record.type,
      subjective: record.subjective || '',
      objective: record.objective || '',
      assessment: record.assessment || '',
      plan: record.plan || '',
      medications: record.medications || [],
      vaccinations: record.vaccinations || [],
      labResults: record.labResults || [],
      notes: record.notes || ''
    });
    setFormMode('edit');
    setOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle date field change in form
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Format date for API
      const formattedData = {
        ...formData,
        date: format(formData.date, 'yyyy-MM-dd')
      };

      if (formMode === 'create') {
        await medicalRecordsService.createMedicalRecord(formattedData);
        showNotification('Medical record created successfully', 'success');
      } else {
        await medicalRecordsService.updateMedicalRecord(currentRecord.id, formattedData);
        showNotification('Medical record updated successfully', 'success');
      }

      setOpen(false);
      fetchMedicalRecords(); // Refresh the records list
    } catch (error) {
      showNotification(
        formMode === 'create'
          ? 'Error creating medical record'
          : 'Error updating medical record',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle record deletion
  const handleDeleteRecord = async (id) => {
    try {
      setLoading(true);
      await medicalRecordsService.deleteMedicalRecord(id);
      showNotification('Medical record deleted successfully', 'success');
      fetchMedicalRecords(); // Refresh the records list
    } catch (error) {
      showNotification('Error deleting medical record', 'error');
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

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Handle item selection for each category
  const handleVaccinationSelect = (index) => {
    setSelectedVaccinationIndex(index);
  };
  
  const handleDewormingSelect = (index) => {
    setSelectedDewormingIndex(index);
  };
  
  const handleGroomingSelect = (index) => {
    setSelectedGroomingIndex(index);
  };
  
  // Handle adding new item for each category
  const handleAddVaccination = () => {
    // Implementation for adding new vaccination
    console.log("Add new vaccination");
  };
  
  const handleAddDeworming = () => {
    // Implementation for adding new deworming
    console.log("Add new deworming");
  };
  
  const handleAddGrooming = () => {
    // Implementation for adding new grooming
    console.log("Add new grooming");
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Medical Records Dashboard
          </Typography>
        </Box>
      
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="patient-select-label">Select Patient</InputLabel>
              <Select
                labelId="patient-select-label"
                id="patient-select"
                value={selectedPatient}
                label="Select Patient"
                onChange={handlePatientChange}
              >
                {patientOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Medical Care Categories Section */}
        <Grid container spacing={3}>
          {/* Vaccination Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Vaccinations
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {vaccinations.map((vax, index) => (
                  <Box key={vax.id} sx={{ textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mb: 1, 
                        border: index === selectedVaccinationIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid #fff',
                        cursor: 'pointer',
                        bgcolor: 'primary.light'
                      }} 
                      onClick={() => handleVaccinationSelect(index)}
                    >
                      <VaccinationIcon />
                    </Avatar>
                    <Typography variant="subtitle2">
                      {vax.name}
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
                      cursor: 'pointer',
                    }}
                    onClick={handleAddVaccination}
                  >
                    <AddIcon />
                  </Avatar>
                  <Typography variant="subtitle2">Add New</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Deworming Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Deworming
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {deworming.map((deworm, index) => (
                  <Box key={deworm.id} sx={{ textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mb: 1, 
                        border: index === selectedDewormingIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid #fff',
                        cursor: 'pointer',
                        bgcolor: '#ffa726'
                      }} 
                      onClick={() => handleDewormingSelect(index)}
                    >
                      <DewormingIcon />
                    </Avatar>
                    <Typography variant="subtitle2">
                      {deworm.name}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      mb: 1, 
                      bgcolor: '#ffa726',
                      cursor: 'pointer',
                    }}
                    onClick={handleAddDeworming}
                  >
                    <AddIcon />
                  </Avatar>
                  <Typography variant="subtitle2">Add New</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Grooming Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Grooming
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {grooming.map((groom, index) => (
                  <Box key={groom.id} sx={{ textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        mb: 1, 
                        border: index === selectedGroomingIndex ? `2px solid ${theme.palette.primary.main}` : '2px solid #fff',
                        cursor: 'pointer',
                        bgcolor: '#66bb6a'
                      }} 
                      onClick={() => handleGroomingSelect(index)}
                    >
                      <GroomingIcon />
                    </Avatar>
                    <Typography variant="subtitle2">
                      {groom.name}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      mb: 1, 
                      bgcolor: '#66bb6a',
                      cursor: 'pointer',
                    }}
                    onClick={handleAddGrooming}
                  >
                    <AddIcon />
                  </Avatar>
                  <Typography variant="subtitle2">Add New</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Original Medical Records Section */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {selectedPatient ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" component="h2">
                    Medical Records
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleAddRecord}
                  >
                    Add New Record
                  </Button>
                </Box>
                <Paper sx={{ mb: 3 }}>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                  >
                    <Tab label="SOAP Notes" />
                    <Tab label="Medications" />
                    <Tab label="Vaccinations" />
                    <Tab label="Lab Results" />
                  </Tabs>
                </Paper>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords && medicalRecords.length > 0 ? (
                          medicalRecords
                            .filter(record => {
                              switch (tabValue) {
                                case 0: return record.type === 'soap';
                                case 1: return record.type === 'medication';
                                case 2: return record.type === 'vaccination';
                                case 3: return record.type === 'lab';
                                default: return true;
                              }
                            })
                            .map((record) => (
                              <TableRow key={record.id}>
                                <TableCell>{format(parseISO(record.date), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{record.type}</TableCell>
                                <TableCell>
                                  {record.type === 'soap' && (
                                    <>
                                      <Typography variant="subtitle2">Subjective:</Typography>
                                      <Typography variant="body2">{record.subjective}</Typography>
                                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Objective:</Typography>
                                      <Typography variant="body2">{record.objective}</Typography>
                                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Assessment:</Typography>
                                      <Typography variant="body2">{record.assessment}</Typography>
                                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Plan:</Typography>
                                      <Typography variant="body2">{record.plan}</Typography>
                                    </>
                                  )}
                                  {record.type === 'medication' && (
                                    <>
                                      {record.medications.map((med, index) => (
                                        <Typography key={index} variant="body2">
                                          {med.name} - {med.dosage} {med.frequency}
                                        </Typography>
                                      ))}
                                    </>
                                  )}
                                  {record.type === 'vaccination' && (
                                    <>
                                      {record.vaccinations.map((vac, index) => (
                                        <Typography key={index} variant="body2">
                                          {vac.name} - {vac.date}
                                        </Typography>
                                      ))}
                                    </>
                                  )}
                                  {record.type === 'lab' && (
                                    <>
                                      {record.labResults.map((lab, index) => (
                                        <Typography key={index} variant="body2">
                                          {lab.test} - {lab.result}
                                        </Typography>
                                      ))}
                                    </>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditRecord(record)}
                                      aria-label="Edit record"
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteRecord(record.id)}
                                      aria-label="Delete record"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No medical records found for this patient
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Please select a patient to view their medical records</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      
        {/* Medical Record Form Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="md"
          fullWidth
          aria-labelledby="medical-record-dialog-title"
          aria-describedby="medical-record-dialog-description"
        >
          <DialogTitle id="medical-record-dialog-title">
            {formMode === 'create' ? 'Add New Medical Record' : 'Edit Medical Record'}
          </DialogTitle>
          <DialogContent id="medical-record-dialog-description">
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={handleDateChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Type"
                    labelId="type-label"
                  >
                    <MenuItem value="soap">SOAP Note</MenuItem>
                    <MenuItem value="medication">Medication</MenuItem>
                    <MenuItem value="vaccination">Vaccination</MenuItem>
                    <MenuItem value="lab">Lab Result</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.type === 'soap' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      name="subjective"
                      label="Subjective"
                      multiline
                      rows={3}
                      value={formData.subjective}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="objective"
                      label="Objective"
                      multiline
                      rows={3}
                      value={formData.objective}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="assessment"
                      label="Assessment"
                      multiline
                      rows={3}
                      value={formData.assessment}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="plan"
                      label="Plan"
                      multiline
                      rows={3}
                      value={formData.plan}
                      onChange={handleInputChange}
                      fullWidth
                      required
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Additional Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpen(false)}
              aria-label="Cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={loading}
              aria-label={formMode === 'create' ? 'Create record' : 'Save changes'}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MedicalRecordsDashboard; 
