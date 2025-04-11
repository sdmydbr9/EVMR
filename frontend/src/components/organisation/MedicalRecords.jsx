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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PetsIcon from '@mui/icons-material/Pets';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import api from '../../services/api';
import { isDemoUser } from '../../utils/auth';

const MedicalRecords = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'add', 'edit'
  const [recordForm, setRecordForm] = useState({
    patientName: '',
    patientId: '',
    recordType: 'consultation',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    diagnosis: '',
    notes: '',
    medications: '',
    followUp: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define submenu tabs
  const recordSubmenus = [
    { label: "All Records", value: 0 },
    { label: "Consultations", value: 1 },
    { label: "Lab Results", value: 2 },
    { label: "Prescriptions", value: 3 },
    { label: "Imaging", value: 4 }
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Check if we're using the demo account
      const demoUser = isDemoUser();

      let data = [];

      if (demoUser) {
        // Use demo data
        data = generateDemoRecords();
      } else {
        // Fetch from API
        try {
          const response = await api.get('/emr/records');
          if (response.data && response.data.records) {
            data = response.data.records;
          } else {
            console.error('Unexpected API response format:', response.data);
            data = [];
          }
        } catch (apiError) {
          console.error('API error fetching records:', apiError);
          data = [];
        }
      }

      // Ensure we always set an array to the records state
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoRecords = () => {
    const recordTypes = ['consultation', 'lab', 'prescription', 'imaging'];
    const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis', 'Dr. Miller'];
    const patientFirstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Jessica'];
    const patientLastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
    const diagnoses = [
      'Allergic Reaction',
      'Arthritis',
      'Canine Parvovirus',
      'Feline Leukemia',
      'Hip Dysplasia',
      'Upper Respiratory Infection',
      'Skin Infection',
      'Ear Infection',
      'Dental Disease'
    ];
    const medications = [
      'Amoxicillin 250mg - 1 tab BID for 10 days',
      'Prednisone 5mg - 1 tab SID for 5 days, then 0.5 tab SID for 5 days',
      'Metronidazole 500mg - 0.5 tab BID for 7 days',
      'Carprofen 75mg - 1 tab SID for 14 days',
      'Apoquel 16mg - 1 tab SID',
      'Clavamox 62.5mg - 1 tab BID for 14 days'
    ];

    return Array.from({ length: 50 }, (_, index) => {
      const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)];
      const patientFirstName = patientFirstNames[Math.floor(Math.random() * patientFirstNames.length)];
      const patientLastName = patientLastNames[Math.floor(Math.random() * patientLastNames.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const diagnosis = recordType === 'consultation' ? diagnoses[Math.floor(Math.random() * diagnoses.length)] : '';
      const medication = recordType === 'prescription' ? medications[Math.floor(Math.random() * medications.length)] : '';

      return {
        id: `REC${10000 + index}`,
        patientId: `PAT${1000 + Math.floor(Math.random() * 100)}`,
        patientName: `${patientFirstName} ${patientLastName}`,
        petName: ['Max', 'Bella', 'Charlie', 'Lucy', 'Cooper', 'Luna'][Math.floor(Math.random() * 6)],
        recordType,
        date: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000).toISOString().split('T')[0],
        doctor,
        diagnosis,
        notes: recordType === 'consultation' ? 'Patient presented with symptoms of...' :
               recordType === 'lab' ? 'Blood work shows normal levels of...' :
               recordType === 'prescription' ? 'Prescription for treatment of...' :
               'Imaging shows no abnormalities in...',
        medications: medication,
        followUp: Math.random() > 0.7 ? new Date(Date.now() + Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0] : '',
        status: ['completed', 'pending', 'reviewing'][Math.floor(Math.random() * 3)],
        labResults: recordType === 'lab' ? {
          bloodCount: {
            wbc: (Math.random() * 10 + 5).toFixed(1),
            rbc: (Math.random() * 2 + 4).toFixed(1),
            platelets: Math.floor(Math.random() * 150000 + 150000)
          },
          chemistry: {
            glucose: Math.floor(Math.random() * 50 + 70),
            creatinine: (Math.random() * 1 + 0.5).toFixed(1),
            alt: Math.floor(Math.random() * 50 + 10)
          }
        } : null,
        imagingType: recordType === 'imaging' ? ['X-Ray', 'Ultrasound', 'MRI', 'CT Scan'][Math.floor(Math.random() * 4)] : null,
        imagingResults: recordType === 'imaging' ? 'No abnormalities detected in the...' : null
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
    setPage(0);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setRecordForm({
      patientName: record.patientName,
      patientId: record.patientId,
      petName: record.petName,
      recordType: record.recordType,
      date: record.date,
      doctor: record.doctor,
      diagnosis: record.diagnosis || '',
      notes: record.notes || '',
      medications: record.medications || '',
      followUp: record.followUp || '',
      labResults: record.labResults || null,
      imagingType: record.imagingType || '',
      imagingResults: record.imagingResults || ''
    });
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setRecordForm({
      patientName: record.patientName,
      patientId: record.patientId,
      petName: record.petName,
      recordType: record.recordType,
      date: record.date,
      doctor: record.doctor,
      diagnosis: record.diagnosis || '',
      notes: record.notes || '',
      medications: record.medications || '',
      followUp: record.followUp || '',
      labResults: record.labResults || null,
      imagingType: record.imagingType || '',
      imagingResults: record.imagingResults || ''
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setRecordForm({
      patientName: '',
      patientId: '',
      petName: '',
      recordType: 'consultation',
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      diagnosis: '',
      notes: '',
      medications: '',
      followUp: '',
      labResults: null,
      imagingType: '',
      imagingResults: ''
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleDeleteRecord = async (record) => {
    if (window.confirm(`Are you sure you want to delete record ${record.id}?`)) {
      try {
        const demoUser = isDemoUser();
        
        if (!demoUser) {
          // For real users, call the API
          await api.delete(`/emr/records/${record.id}`);
        }

        // Remove from local state
        setRecords(records.filter(r => r.id !== record.id));

        setNotification({
          open: true,
          message: 'Record deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting record:', error);
        setNotification({
          open: true,
          message: 'Error deleting record',
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
    setRecordForm({
      ...recordForm,
      [name]: value
    });
  };

  const handleSaveRecord = async () => {
    try {
      const demoUser = isDemoUser();
      
      if (dialogMode === 'add') {
        if (!demoUser) {
          // For real users, call the API
          const response = await api.post('/emr/records', recordForm);
          if (response.data && response.data.recordId) {
            // Add the new record with the returned ID
            const newRecord = {
              id: response.data.recordId,
              ...recordForm,
              status: 'completed'
            };
            setRecords([newRecord, ...records]);
          }
        } else {
          // For demo, just add to the local state
          const newRecord = {
            id: `REC${10000 + records.length}`,
            ...recordForm,
            status: 'completed'
          };
          setRecords([newRecord, ...records]);
        }

        setNotification({
          open: true,
          message: 'Record added successfully',
          severity: 'success'
        });
      } else if (dialogMode === 'edit') {
        if (!demoUser) {
          // For real users, call the API
          await api.put(`/emr/records/${selectedRecord.id}`, recordForm);
        }

        // Update the local state
        setRecords(records.map(r =>
          r.id === selectedRecord.id ? { ...r, ...recordForm } : r
        ));

        setNotification({
          open: true,
          message: 'Record updated successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving record:', error);
      setNotification({
        open: true,
        message: 'Error saving record: ' + (error.response?.data?.message || error.message),
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

  // Filter and sort records
  const filteredRecords = Array.isArray(records) ? records.filter(record => {
    // Filter by tab
    if (activeTab !== 0) {
      const recordTypeMap = {
        1: 'consultation',
        2: 'lab',
        3: 'prescription',
        4: 'imaging'
      };
      if (record.recordType !== recordTypeMap[activeTab]) {
        return false;
      }
    }

    // Filter by search term
    if (searchTerm) {
      return (
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return true;
  }) : [];

  // Slice the data for pagination
  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getRecordIcon = (recordType) => {
    switch (recordType) {
      case 'consultation':
        return <MedicalServicesIcon />;
      case 'lab':
        return <VaccinesIcon />;
      case 'prescription':
        return <MedicationIcon />;
      case 'imaging':
        return <MonitorHeartIcon />;
      default:
        return <NoteAltIcon />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            size="small"
            label="Completed"
            color="success"
            sx={{ borderRadius: '4px' }}
          />
        );
      case 'pending':
        return (
          <Chip
            size="small"
            label="Pending"
            color="warning"
            sx={{ borderRadius: '4px' }}
          />
        );
      case 'reviewing':
        return (
          <Chip
            size="small"
            label="Reviewing"
            color="info"
            sx={{ borderRadius: '4px' }}
          />
        );
      default:
        return <Chip size="small" label={status} />;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
          Medical Records
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {recordSubmenus.map((menu) => (
            <Tab key={menu.value} label={menu.label} />
          ))}
        </Tabs>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Search records..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: 300, mr: 2 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ mr: 2 }}
            >
              Filter
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRecord}
          >
            Add Record
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Record ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell>{record.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                        {record.patientName.split(' ')[0][0]}{record.patientName.split(' ')[1][0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{record.patientName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pet: {record.petName} | ID: {record.patientId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'transparent' }}>
                        {getRecordIcon(record.recordType)}
                      </Avatar>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {record.recordType}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.doctor}</TableCell>
                  <TableCell>{getStatusChip(record.status)}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewRecord(record)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditRecord(record)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteRecord(record)}>
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
            count={filteredRecords.length}
            rowsPerPage={rowsPerPage}
            page={filteredRecords.length > 0 ? Math.min(page, Math.ceil(filteredRecords.length / rowsPerPage) - 1) : 0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Record View/Edit/Add Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'view' ? 'Medical Record Details' :
           dialogMode === 'add' ? 'Add New Record' : 'Edit Record'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patientName"
                value={recordForm.patientName}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient ID"
                name="patientId"
                value={recordForm.patientId}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pet Name"
                name="petName"
                value={recordForm.petName}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Record Type</InputLabel>
                <Select
                  label="Record Type"
                  name="recordType"
                  value={recordForm.recordType}
                  onChange={handleFormChange}
                >
                  <MenuItem value="consultation">Consultation</MenuItem>
                  <MenuItem value="lab">Lab Results</MenuItem>
                  <MenuItem value="prescription">Prescription</MenuItem>
                  <MenuItem value="imaging">Imaging</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={recordForm.date}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Doctor"
                name="doctor"
                value={recordForm.doctor}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>

            {/* Conditional fields based on record type */}
            {recordForm.recordType === 'consultation' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Diagnosis"
                    name="diagnosis"
                    value={recordForm.diagnosis}
                    onChange={handleFormChange}
                    disabled={dialogMode === 'view'}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={recordForm.notes}
                    onChange={handleFormChange}
                    disabled={dialogMode === 'view'}
                    multiline
                    rows={3}
                  />
                </Grid>
              </>
            )}

            {recordForm.recordType === 'prescription' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medications"
                  name="medications"
                  value={recordForm.medications}
                  onChange={handleFormChange}
                  disabled={dialogMode === 'view'}
                  multiline
                  rows={3}
                />
              </Grid>
            )}

            {recordForm.recordType === 'lab' && (
              <Grid item xs={12}>
                {dialogMode === 'view' && recordForm.labResults ? (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Lab Results</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Blood Count</Typography>
                        <Typography variant="body2">WBC: {recordForm.labResults.bloodCount.wbc} K/µL</Typography>
                        <Typography variant="body2">RBC: {recordForm.labResults.bloodCount.rbc} M/µL</Typography>
                        <Typography variant="body2">Platelets: {recordForm.labResults.bloodCount.platelets} /µL</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Chemistry</Typography>
                        <Typography variant="body2">Glucose: {recordForm.labResults.chemistry.glucose} mg/dL</Typography>
                        <Typography variant="body2">Creatinine: {recordForm.labResults.chemistry.creatinine} mg/dL</Typography>
                        <Typography variant="body2">ALT: {recordForm.labResults.chemistry.alt} U/L</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ) : (
                  <TextField
                    fullWidth
                    label="Lab Notes"
                    name="notes"
                    value={recordForm.notes}
                    onChange={handleFormChange}
                    disabled={dialogMode === 'view'}
                    multiline
                    rows={3}
                  />
                )}
              </Grid>
            )}

            {recordForm.recordType === 'imaging' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={dialogMode === 'view'}>
                    <InputLabel>Imaging Type</InputLabel>
                    <Select
                      label="Imaging Type"
                      name="imagingType"
                      value={recordForm.imagingType}
                      onChange={handleFormChange}
                    >
                      <MenuItem value="X-Ray">X-Ray</MenuItem>
                      <MenuItem value="Ultrasound">Ultrasound</MenuItem>
                      <MenuItem value="MRI">MRI</MenuItem>
                      <MenuItem value="CT Scan">CT Scan</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Imaging Results"
                    name="imagingResults"
                    value={recordForm.imagingResults}
                    onChange={handleFormChange}
                    disabled={dialogMode === 'view'}
                    multiline
                    rows={3}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Follow-up Date"
                type="date"
                name="followUp"
                value={recordForm.followUp}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {dialogMode === 'view' && (
            <Button
              startIcon={<FileDownloadIcon />}
              variant="outlined"
              color="primary"
              onClick={() => alert('Download functionality would be implemented here')}
            >
              Download
            </Button>
          )}
          {dialogMode !== 'view' && (
            <Button onClick={handleSaveRecord} variant="contained" color="primary">
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

export default MedicalRecords;
