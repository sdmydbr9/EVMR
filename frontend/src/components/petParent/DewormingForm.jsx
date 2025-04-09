import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const DewormingForm = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pet Deworming Form
        </Typography>
        <Box>
          <Typography variant="body1">
            Deworming form content will be implemented here.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DewormingForm; 