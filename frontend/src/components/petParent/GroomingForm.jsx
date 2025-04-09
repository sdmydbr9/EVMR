import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const GroomingForm = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pet Grooming Form
        </Typography>
        <Box>
          <Typography variant="body1">
            Grooming form content will be implemented here.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default GroomingForm; 