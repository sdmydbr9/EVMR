import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  Stack,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Vaccines as VaccinesIcon,
  BugReport as DewormingIcon,
  ContentCut as GroomingIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HealthRecords = ({ petId, allowEdit = false }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false); // No section expanded by default
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [sections, setSections] = useState([
    {
      id: 'vaccination',
      title: 'Vaccination',
      icon: <VaccinesIcon />,
      color: '#4d96ff',
      addButtonText: 'Add vaccination details',
      records: [] // This will be populated from API
    },
    {
      id: 'deworming',
      title: 'Deworming',
      icon: <DewormingIcon />,
      color: '#ff9500',
      addButtonText: 'Add deworming details',
      records: [] // This will be populated from API
    },
    {
      id: 'grooming',
      title: 'Grooming',
      icon: <GroomingIcon />,
      color: '#34c759',
      addButtonText: 'Add grooming details',
      records: [] // This will be populated from API
    }
  ]);

  // Fetch pet information data when component mounts or petId changes
  useEffect(() => {
    if (petId) {
      fetchHealthRecords();
    }
  }, [petId]);

  const fetchHealthRecords = async () => {
    setLoading(true);
    try {
      // Fetch vaccinations
      const vaccinationsResponse = await axios.get(`/api/pets/${petId}/vaccinations`);
      const vaccinations = vaccinationsResponse.data.vaccinations || [];

      // Fetch deworming records
      const dewormingResponse = await axios.get(`/api/pets/${petId}/deworming`);
      const deworming = dewormingResponse.data.deworming || [];

      // Fetch grooming records
      const groomingResponse = await axios.get(`/api/pets/${petId}/grooming`);
      const grooming = groomingResponse.data.grooming || [];

      // Update sections with fetched data
      setSections(prevSections => prevSections.map(section => {
        if (section.id === 'vaccination') {
          return { ...section, records: vaccinations };
        } else if (section.id === 'deworming') {
          return { ...section, records: deworming };
        } else if (section.id === 'grooming') {
          return { ...section, records: grooming };
        }
        return section;
      }));
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleAddDetails = (type) => {
    setCurrentSection(type);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      ...(type === 'vaccination' ? { vaccine_name: '', next_due_date: '' } :
         type === 'deworming' ? { medicine_name: '' } :
         { service_type: '' })
    });
    setEditDialogOpen(true);
  };

  const handleEditRecord = (record, sectionId) => {
    setCurrentRecord(record);
    setCurrentSection(sectionId);

    // Create a base form data object
    const baseFormData = {
      notes: record.notes || ''
    };

    // Add section-specific fields
    if (sectionId === 'vaccination') {
      baseFormData.date = format(new Date(record.date_administered), 'yyyy-MM-dd');
      baseFormData.vaccine_name = record.vaccine_name;
      if (record.next_due_date) {
        baseFormData.next_due_date = format(new Date(record.next_due_date), 'yyyy-MM-dd');
      }
    } else if (sectionId === 'deworming') {
      baseFormData.date = format(new Date(record.date_given), 'yyyy-MM-dd');
      baseFormData.medicine_name = record.medicine_name;
    } else if (sectionId === 'grooming') {
      baseFormData.date = format(new Date(record.date), 'yyyy-MM-dd');
      baseFormData.service_type = record.service_type;
    }

    setFormData(baseFormData);
    setEditDialogOpen(true);
  };

  const handleDeleteRecord = (record, sectionId) => {
    setCurrentRecord(record);
    setCurrentSection(sectionId);
    setDeleteDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentRecord(null);
    setFormData({});
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentRecord(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveRecord = async () => {
    try {
      setLoading(true);
      // Use the correct plural endpoint names
      let endpoint;
      if (currentSection === 'vaccination') {
        endpoint = `/api/pets/${petId}/vaccinations`;
      } else if (currentSection === 'deworming') {
        endpoint = `/api/pets/${petId}/deworming`;
      } else if (currentSection === 'grooming') {
        endpoint = `/api/pets/${petId}/grooming`;
      }

      let method = 'post';

      // Map form fields to the expected backend field names
      let data = {};
      if (currentSection === 'vaccination') {
        data = {
          vaccineName: formData.vaccine_name,
          dateAdministered: formData.date,
          nextDueDate: formData.next_due_date,
          notes: formData.notes || ''
        };
      } else if (currentSection === 'deworming') {
        data = {
          medicineName: formData.medicine_name,
          dateGiven: formData.date,
          notes: formData.notes || ''
        };
      } else if (currentSection === 'grooming') {
        data = {
          serviceType: formData.service_type,
          date: formData.date,
          notes: formData.notes || ''
        };
      }

      // If editing an existing record
      if (currentRecord) {
        endpoint = `${endpoint}/${currentRecord.id}`;
        method = 'put';
      }

      await axios[method](endpoint, data);

      // Close dialog and refresh data
      handleCloseEditDialog();
      fetchHealthRecords();
      showNotification(`Record ${currentRecord ? 'updated' : 'added'} successfully!`, 'success');
    } catch (error) {
      console.error(`Error ${currentRecord ? 'updating' : 'adding'} record:`, error);
      showNotification(`Failed to ${currentRecord ? 'update' : 'add'} record. Please try again.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);

      // Use the correct plural endpoint names
      let endpoint;
      if (currentSection === 'vaccination') {
        endpoint = `/api/pets/${petId}/vaccinations/${currentRecord.id}`;
      } else if (currentSection === 'deworming') {
        endpoint = `/api/pets/${petId}/deworming/${currentRecord.id}`;
      } else if (currentSection === 'grooming') {
        endpoint = `/api/pets/${petId}/grooming/${currentRecord.id}`;
      }

      await axios.delete(endpoint);

      // Close dialog and refresh data
      handleCloseDeleteDialog();
      fetchHealthRecords();
      showNotification('Record deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Failed to delete record. Please try again.', 'error');
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
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        sections.map((section) => (
          <Accordion
            key={section.id}
            expanded={expanded === section.id}
            onChange={handleChange(section.id)}
            sx={{
              mb: 1,
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: section.color }}>
                  {section.icon}
                </Avatar>
                <Typography variant="subtitle1">{section.title}</Typography>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              {section.records && section.records.length > 0 ? (
                <List>
                  {section.records.map((record, index) => (
                    <React.Fragment key={record.id}>
                      <ListItem>
                        <ListItemText
                          primary={record.vaccine_name || record.medicine_name || record.service_type}
                          secondary={
                            <Stack direction="row" spacing={2}>
                              <Typography variant="body2" color="text.secondary">
                                {format(new Date(record.date_administered || record.date_given || record.date), 'MMM dd, yyyy')}
                              </Typography>
                              {record.next_due_date && (
                                <Typography variant="body2" color="text.secondary">
                                  Next due: {format(new Date(record.next_due_date), 'MMM dd, yyyy')}
                                </Typography>
                              )}
                            </Stack>
                          }
                        />
                        {allowEdit && (
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleEditRecord(record, section.id)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDeleteRecord(record, section.id)} size="small" sx={{ ml: 1 }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                      {index < section.records.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddDetails(section.id)}
                    sx={{ mt: 1 }}
                  >
                    {section.addButtonText}
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Edit Record Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{currentRecord ? 'Edit' : 'Add'} {currentSection && currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Record</Typography>
            <IconButton onClick={handleCloseEditDialog} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date || ''}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />

            {currentSection === 'vaccination' && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Vaccine Name"
                name="vaccine_name"
                value={formData.vaccine_name || ''}
                onChange={handleFormChange}
              />
            )}

            {currentSection === 'deworming' && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Medicine Name"
                name="medicine_name"
                value={formData.medicine_name || ''}
                onChange={handleFormChange}
              />
            )}

            {currentSection === 'grooming' && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="service-type-label">Service Type</InputLabel>
                <Select
                  labelId="service-type-label"
                  name="service_type"
                  value={formData.service_type || ''}
                  onChange={handleFormChange}
                  label="Service Type"
                >
                  <MenuItem value="Full Service">Full Service</MenuItem>
                  <MenuItem value="Bath & Brush">Bath & Brush</MenuItem>
                  <MenuItem value="Nail Trim">Nail Trim</MenuItem>
                  <MenuItem value="Haircut">Haircut</MenuItem>
                  <MenuItem value="Teeth Cleaning">Teeth Cleaning</MenuItem>
                </Select>
              </FormControl>
            )}

            {currentSection === 'vaccination' && (
              <TextField
                margin="normal"
                fullWidth
                label="Next Due Date"
                name="next_due_date"
                type="date"
                value={formData.next_due_date || ''}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            )}

            <TextField
              margin="normal"
              fullWidth
              label="Notes"
              name="notes"
              multiline
              rows={3}
              value={formData.notes || ''}
              onChange={handleFormChange}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRecord}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Deleting...' : 'Delete'}
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

export default HealthRecords;
