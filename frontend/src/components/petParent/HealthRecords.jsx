import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
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
  Alert,
  Menu
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Vaccines as VaccinesIcon,
  BugReport as DewormingIcon,
  ContentCut as GroomingIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  MonitorWeight as WeightIcon,
  Psychology as QualityOfLifeIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

const HealthRecords = ({ petId, allowEdit = false }) => {
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
  // State for the Add Record dropdown menu
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState(null);
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
    },
    {
      id: 'weight',
      title: 'Weight Tracker',
      icon: <WeightIcon />,
      color: '#5856d6',
      addButtonText: 'Add weight record',
      records: [] // This will be populated from API
    },
    {
      id: 'quality-of-life',
      title: 'Quality of Life Assessment',
      icon: <QualityOfLifeIcon />,
      color: '#ff2d55',
      addButtonText: 'Add assessment',
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

      // Fetch weight records
      const weightResponse = await axios.get(`/api/pets/${petId}/weight`);
      const weight = weightResponse.data.weight || [];

      // Fetch quality of life assessments
      const qualityOfLifeResponse = await axios.get(`/api/pets/${petId}/quality-of-life`);
      const qualityOfLife = qualityOfLifeResponse.data.qualityOfLife || [];

      // Update sections with fetched data
      setSections(prevSections => prevSections.map(section => {
        if (section.id === 'vaccination') {
          return { ...section, records: vaccinations };
        } else if (section.id === 'deworming') {
          return { ...section, records: deworming };
        } else if (section.id === 'grooming') {
          return { ...section, records: grooming };
        } else if (section.id === 'weight') {
          return { ...section, records: weight };
        } else if (section.id === 'quality-of-life') {
          return { ...section, records: qualityOfLife };
        }
        return section;
      }));
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleAddDetails = (type) => {
    setCurrentSection(type);

    let initialFormData = {
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    };

    if (type === 'vaccination') {
      initialFormData = { ...initialFormData, vaccine_name: '', next_due_date: '' };
    } else if (type === 'deworming') {
      initialFormData = { ...initialFormData, medicine_name: '' };
    } else if (type === 'grooming') {
      initialFormData = { ...initialFormData, service_type: '' };
    } else if (type === 'weight') {
      initialFormData = { ...initialFormData, weight: '' };
    } else if (type === 'quality-of-life') {
      initialFormData = {
        ...initialFormData,
        mobility: 3,
        comfort: 3,
        happiness: 3,
        appetite: 3,
        hygiene: 3
      };
    }

    setFormData(initialFormData);
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
    } else if (sectionId === 'weight') {
      baseFormData.date = format(new Date(record.date), 'yyyy-MM-dd');
      baseFormData.weight = record.weight;
    } else if (sectionId === 'quality-of-life') {
      baseFormData.date = format(new Date(record.date), 'yyyy-MM-dd');
      baseFormData.mobility = record.mobility;
      baseFormData.comfort = record.comfort;
      baseFormData.happiness = record.happiness;
      baseFormData.appetite = record.appetite;
      baseFormData.hygiene = record.hygiene;
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
      let endpoint = '';
      let payload = {};
      let method = 'post';

      if (currentSection === 'vaccination') {
        endpoint = `/api/pets/${petId}/vaccinations`;
        payload = {
          date_administered: formData.date,
          vaccine_name: formData.vaccine_name,
          next_due_date: formData.next_due_date,
          notes: formData.notes
        };
      } else if (currentSection === 'deworming') {
        endpoint = `/api/pets/${petId}/deworming`;
        payload = {
          date_given: formData.date,
          medicine_name: formData.medicine_name,
          notes: formData.notes
        };
      } else if (currentSection === 'grooming') {
        endpoint = `/api/pets/${petId}/grooming`;
        payload = {
          date: formData.date,
          service_type: formData.service_type,
          notes: formData.notes
        };
      } else if (currentSection === 'weight') {
        endpoint = `/api/pets/${petId}/weight`;
        payload = {
          date: formData.date,
          weight: formData.weight,
          notes: formData.notes
        };
      } else if (currentSection === 'quality-of-life') {
        endpoint = `/api/pets/${petId}/quality-of-life`;
        payload = {
          date: formData.date,
          mobility: formData.mobility,
          comfort: formData.comfort,
          happiness: formData.happiness,
          appetite: formData.appetite,
          hygiene: formData.hygiene,
          notes: formData.notes
        };
      }

      // If we're editing an existing record, add the ID and change method to PUT
      if (currentRecord) {
        endpoint = `${endpoint}/${currentRecord.id}`;
        method = 'put';
      }

      // Make API call
      const response = method === 'post'
        ? await axios.post(endpoint, payload)
        : await axios.put(endpoint, payload);

      // Close dialog and show success message
      handleCloseEditDialog();
      showNotification(`Record successfully ${currentRecord ? 'updated' : 'added'}`, 'success');

      // Refresh the data
      fetchHealthRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      showNotification('Failed to save record: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentRecord || !currentSection) {
      return;
    }

    try {
      let endpoint = '';

      if (currentSection === 'vaccination') {
        endpoint = `/api/pets/${petId}/vaccinations/${currentRecord.id}`;
      } else if (currentSection === 'deworming') {
        endpoint = `/api/pets/${petId}/deworming/${currentRecord.id}`;
      } else if (currentSection === 'grooming') {
        endpoint = `/api/pets/${petId}/grooming/${currentRecord.id}`;
      } else if (currentSection === 'weight') {
        endpoint = `/api/pets/${petId}/weight/${currentRecord.id}`;
      } else if (currentSection === 'quality-of-life') {
        endpoint = `/api/pets/${petId}/quality-of-life/${currentRecord.id}`;
      }

      // Delete the record
      await axios.delete(endpoint);

      // Close dialog and show success message
      handleCloseDeleteDialog();
      showNotification('Record successfully deleted', 'success');

      // Refresh the data
      fetchHealthRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      showNotification('Failed to delete record: ' + (error.response?.data?.message || error.message), 'error');
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

  // Handle opening the Add Record menu
  const handleAddRecordClick = (event) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  // Handle closing the Add Record menu
  const handleAddMenuClose = () => {
    setAddMenuAnchorEl(null);
  };

  // Handle clicking on a menu item
  const handleAddMenuItemClick = (type) => {
    handleAddMenuClose();
    handleAddDetails(type);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Add Record button and dropdown menu */}
          {allowEdit && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRecordClick}
                sx={{
                  borderRadius: 8,
                  px: 3,
                  py: 1,
                  boxShadow: 2,
                  backgroundColor: theme => theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme => theme.palette.primary.dark,
                    boxShadow: 4
                  }
                }}
              >
                Add Health Record
              </Button>
              <Menu
                anchorEl={addMenuAnchorEl}
                open={Boolean(addMenuAnchorEl)}
                onClose={handleAddMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: 3,
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      py: 1.5
                    }
                  }
                }}
              >
                {sections.map((section) => (
                  <MenuItem
                    key={section.id}
                    onClick={() => handleAddMenuItemClick(section.id)}
                    sx={{
                      borderLeft: 3,
                      borderColor: section.color,
                    }}
                  >
                    <ListItemIcon sx={{ color: section.color }}>
                      {section.icon}
                    </ListItemIcon>
                    <ListItemText primary={section.addButtonText} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {sections.map((section) => (
            <Accordion
              key={section.id}
              expanded={expanded === section.id}
              onChange={handleChange(section.id)}
              sx={{
                mb: 2,
                borderRadius: '10px',
                boxShadow: expanded === section.id ? 3 : 1,
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  margin: '0 0 16px 0',
                  boxShadow: 3
                },
                overflow: 'hidden'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${section.id}-content`}
                id={`${section.id}-header`}
                sx={{
                  borderLeft: 5,
                  borderColor: section.color,
                  '&.Mui-expanded': {
                    minHeight: 56
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: `${section.color}15`, color: section.color, mr: 2 }}>
                    {section.icon}
                  </Avatar>
                  <Typography variant="h6">{section.title}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {section.records.length > 0 ? (
                  <List sx={{ width: '100%', p: 0 }}>
                    {section.records.map((record, index) => {
                      // Determine the date to display based on record type
                      const date = record.date_administered || record.date_given || record.date;
                      const formattedDate = date ? format(new Date(date), 'MMM d, yyyy') : 'Unknown date';

                      // Determine the primary text content based on record type
                      let primaryText = '';
                      if (section.id === 'vaccination') {
                        primaryText = record.vaccine_name || 'Unnamed vaccine';
                      } else if (section.id === 'deworming') {
                        primaryText = record.medicine_name || 'Unnamed medicine';
                      } else if (section.id === 'grooming') {
                        primaryText = record.service_type || 'Unnamed service';
                      } else if (section.id === 'weight') {
                        primaryText = `${record.weight} kg`;
                      } else if (section.id === 'quality-of-life') {
                        const total = (record.mobility + record.comfort + record.happiness + record.appetite + record.hygiene) / 5;
                        primaryText = `Overall Score: ${total.toFixed(1)}/5`;
                      }

                      // Determine the secondary text content based on record type
                      let secondaryText = record.notes || '';
                      if (section.id === 'vaccination' && record.next_due_date) {
                        const nextDueDate = format(new Date(record.next_due_date), 'MMM d, yyyy');
                        secondaryText = `Next due: ${nextDueDate}${secondaryText ? ` • ${secondaryText}` : ''}`;
                      }

                      return (
                        <React.Fragment key={record.id || index}>
                          <ListItem
                            sx={{
                              '&:hover': {
                                bgcolor: 'action.hover'
                              },
                              px: 3,
                              py: 1.5
                            }}
                          >
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: `${section.color}15`, color: section.color }}>
                                {section.icon}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" component="div">
                                  {primaryText}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary" component="div">
                                  {formattedDate}{secondaryText ? ` • ${secondaryText}` : ''}
                                </Typography>
                              }
                            />
                            {allowEdit && (
                              <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEditRecord(record, section.id)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRecord(record, section.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            )}
                          </ListItem>
                          {index < section.records.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No records found</Typography>
                    {allowEdit && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => handleAddDetails(section.id)}
                        sx={{ mt: 1 }}
                      >
                        {section.addButtonText}
                      </Button>
                    )}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentRecord ? 'Edit' : 'Add'} {currentSection === 'vaccination' ? 'Vaccination' :
            currentSection === 'deworming' ? 'Deworming' :
              currentSection === 'grooming' ? 'Grooming' :
                currentSection === 'weight' ? 'Weight Record' :
                  currentSection === 'quality-of-life' ? 'Quality of Life Assessment' : ''} Record
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={formData.date || ''}
              onChange={handleFormChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {currentSection === 'vaccination' && (
              <>
                <TextField
                  label="Vaccine Name"
                  name="vaccine_name"
                  value={formData.vaccine_name || ''}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Next Due Date"
                  type="date"
                  name="next_due_date"
                  value={formData.next_due_date || ''}
                  onChange={handleFormChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {currentSection === 'deworming' && (
              <TextField
                label="Medicine Name"
                name="medicine_name"
                value={formData.medicine_name || ''}
                onChange={handleFormChange}
                fullWidth
                required
              />
            )}

            {currentSection === 'grooming' && (
              <FormControl fullWidth>
                <InputLabel id="service-type-label">Service Type</InputLabel>
                <Select
                  labelId="service-type-label"
                  name="service_type"
                  value={formData.service_type || ''}
                  onChange={handleFormChange}
                  label="Service Type"
                >
                  <MenuItem value="Haircut">Haircut</MenuItem>
                  <MenuItem value="Nail Trim">Nail Trim</MenuItem>
                  <MenuItem value="Bath">Bath</MenuItem>
                  <MenuItem value="Full Grooming">Full Grooming</MenuItem>
                  <MenuItem value="Dental Cleaning">Dental Cleaning</MenuItem>
                  <MenuItem value="Ear Cleaning">Ear Cleaning</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            )}

            {currentSection === 'weight' && (
              <TextField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight || ''}
                onChange={handleFormChange}
                fullWidth
                required
                InputProps={{
                  inputProps: { min: 0, step: 0.1 }
                }}
              />
            )}

            {currentSection === 'quality-of-life' && (
              <>
                <Typography variant="subtitle1">Rate on a scale of 1-5:</Typography>
                <FormControl fullWidth>
                  <InputLabel id="mobility-label">Mobility</InputLabel>
                  <Select
                    labelId="mobility-label"
                    name="mobility"
                    value={formData.mobility || 3}
                    onChange={handleFormChange}
                    label="Mobility"
                  >
                    <MenuItem value={1}>1 - Very Poor</MenuItem>
                    <MenuItem value={2}>2 - Poor</MenuItem>
                    <MenuItem value={3}>3 - Average</MenuItem>
                    <MenuItem value={4}>4 - Good</MenuItem>
                    <MenuItem value={5}>5 - Excellent</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="comfort-label">Comfort</InputLabel>
                  <Select
                    labelId="comfort-label"
                    name="comfort"
                    value={formData.comfort || 3}
                    onChange={handleFormChange}
                    label="Comfort"
                  >
                    <MenuItem value={1}>1 - Very Uncomfortable</MenuItem>
                    <MenuItem value={2}>2 - Uncomfortable</MenuItem>
                    <MenuItem value={3}>3 - Neutral</MenuItem>
                    <MenuItem value={4}>4 - Comfortable</MenuItem>
                    <MenuItem value={5}>5 - Very Comfortable</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="happiness-label">Happiness</InputLabel>
                  <Select
                    labelId="happiness-label"
                    name="happiness"
                    value={formData.happiness || 3}
                    onChange={handleFormChange}
                    label="Happiness"
                  >
                    <MenuItem value={1}>1 - Very Unhappy</MenuItem>
                    <MenuItem value={2}>2 - Unhappy</MenuItem>
                    <MenuItem value={3}>3 - Neutral</MenuItem>
                    <MenuItem value={4}>4 - Happy</MenuItem>
                    <MenuItem value={5}>5 - Very Happy</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="appetite-label">Appetite</InputLabel>
                  <Select
                    labelId="appetite-label"
                    name="appetite"
                    value={formData.appetite || 3}
                    onChange={handleFormChange}
                    label="Appetite"
                  >
                    <MenuItem value={1}>1 - No Appetite</MenuItem>
                    <MenuItem value={2}>2 - Poor Appetite</MenuItem>
                    <MenuItem value={3}>3 - Normal Appetite</MenuItem>
                    <MenuItem value={4}>4 - Good Appetite</MenuItem>
                    <MenuItem value={5}>5 - Excellent Appetite</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="hygiene-label">Hygiene</InputLabel>
                  <Select
                    labelId="hygiene-label"
                    name="hygiene"
                    value={formData.hygiene || 3}
                    onChange={handleFormChange}
                    label="Hygiene"
                  >
                    <MenuItem value={1}>1 - Very Poor</MenuItem>
                    <MenuItem value={2}>2 - Poor</MenuItem>
                    <MenuItem value={3}>3 - Average</MenuItem>
                    <MenuItem value={4}>4 - Good</MenuItem>
                    <MenuItem value={5}>5 - Excellent</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            <TextField
              label="Notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveRecord} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HealthRecords; 