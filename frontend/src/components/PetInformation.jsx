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
  Divider,
  IconButton,
  Stack,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Vaccines as VaccinesIcon,
  BugReport as DewormingIcon,
  ContentCut as GroomingIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PetInformation = ({ petId }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
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
      fetchPetInformation();
    }
  }, [petId]);

  const fetchPetInformation = async () => {
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
      console.error('Error fetching pet information:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleAddDetails = (type) => {
    navigate(`/pets/${petId}/${type}/add`);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Information
      </Typography>
      
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
    </Box>
  );
};

export default PetInformation; 