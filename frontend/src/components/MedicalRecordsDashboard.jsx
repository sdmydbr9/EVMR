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
  Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

  // State for patient options
  const [patientOptions, setPatientOptions] = useState([]);

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

  return (
    <Box sx={{ 
      p: 3,
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Medical Records</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddRecord}
          disabled={!selectedPatient}
        >
          New Record
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel id="patient-label">Select Patient</InputLabel>
              <Select
                value={selectedPatient}
                onChange={handlePatientChange}
                label="Select Patient"
                labelId="patient-label"
              >
                {patientOptions.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {selectedPatient ? (
        <>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="SOAP Notes" />
            <Tab label="Medications" />
            <Tab label="Vaccinations" />
            <Tab label="Lab Results" />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
    </Box>
  );
};

export default MedicalRecordsDashboard; 