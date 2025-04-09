import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid,
    Divider,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const SERVICE_CATEGORIES = [
    'Check-ups',
    'Consultations',
    'Surgeries',
    'Vaccinations',
    'Treatments',
    'Laboratory Tests',
    'Imaging',
    'Preventive Care',
    'Emergency Care',
    'Other'
];

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '',
        price: '',
        category: 'Check-ups',
        requiresDoctor: true,
        isActive: true
    });
    const [filterCategory, setFilterCategory] = useState('All');
    const [alert, setAlert] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services/types', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }
            
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setAlert({
                open: true,
                message: 'Error loading services: ' + error.message,
                severity: 'error'
            });
            
            // Provide mock data for development
            if (process.env.NODE_ENV === 'development') {
                setServices([
                    { _id: '1', name: 'Routine Check-up', description: 'Regular health examination', duration: 30, price: 75, category: 'Check-ups', requiresDoctor: true, isActive: true },
                    { _id: '2', name: 'Vaccination', description: 'Standard vaccination service', duration: 15, price: 50, category: 'Vaccinations', requiresDoctor: true, isActive: true },
                    { _id: '3', name: 'Surgery - Minor', description: 'Minor surgical procedure', duration: 60, price: 250, category: 'Surgeries', requiresDoctor: true, isActive: true },
                    { _id: '4', name: 'X-Ray', description: 'Diagnostic imaging', duration: 20, price: 120, category: 'Imaging', requiresDoctor: false, isActive: true },
                    { _id: '5', name: 'Blood Test', description: 'Comprehensive blood panel', duration: 10, price: 95, category: 'Laboratory Tests', requiresDoctor: false, isActive: true }
                ]);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;
        
        if (name === 'requiresDoctor' || name === 'isActive') {
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleOpenDialog = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description,
                duration: service.duration,
                price: service.price,
                category: service.category || 'Check-ups',
                requiresDoctor: service.requiresDoctor !== false,
                isActive: service.isActive !== false
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                duration: '',
                price: '',
                category: 'Check-ups',
                requiresDoctor: true,
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            duration: '',
            price: '',
            category: 'Check-ups',
            requiresDoctor: true,
            isActive: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingService 
                ? `/api/services/types/${editingService._id}`
                : '/api/services/types';
            
            const method = editingService ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${editingService ? 'update' : 'create'} service`);
            }

            setAlert({
                open: true,
                message: `Service ${editingService ? 'updated' : 'created'} successfully!`,
                severity: 'success'
            });
            
            fetchServices();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving service:', error);
            setAlert({
                open: true,
                message: 'Error saving service: ' + error.message,
                severity: 'error'
            });
        }
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                const response = await fetch(`/api/services/types/${serviceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete service');
                }

                setAlert({
                    open: true,
                    message: 'Service deleted successfully',
                    severity: 'success'
                });
                
                fetchServices();
            } catch (error) {
                console.error('Error deleting service:', error);
                setAlert({
                    open: true,
                    message: 'Error deleting service: ' + error.message,
                    severity: 'error'
                });
            }
        }
    };

    const handleFilterChange = (event) => {
        setFilterCategory(event.target.value);
    };

    const handleCloseAlert = () => {
        setAlert({
            ...alert,
            open: false
        });
    };

    // Filter services based on selected category
    const filteredServices = filterCategory === 'All' 
        ? services 
        : services.filter(service => service.category === filterCategory);

    // Group services by category for the dashboard view
    const servicesByCategory = SERVICE_CATEGORIES.reduce((acc, category) => {
        acc[category] = services.filter(service => service.category === category);
        return acc;
    }, {});

    return (
        <Box>
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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Service Management</Typography>
                <Box>
                    <FormControl sx={{ minWidth: 200, mr: 2 }}>
                        <InputLabel id="filter-category-label">Filter by Category</InputLabel>
                        <Select
                            labelId="filter-category-label"
                            value={filterCategory}
                            label="Filter by Category"
                            onChange={handleFilterChange}
                        >
                            <MenuItem value="All">All Categories</MenuItem>
                            {SERVICE_CATEGORIES.map(category => (
                                <MenuItem key={category} value={category}>{category}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleOpenDialog()}
                        startIcon={<AddIcon />}
                    >
                        Add New Service
                    </Button>
                </Box>
            </Box>

            {/* Services Overview */}
            {filterCategory === 'All' && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Services Overview
                    </Typography>
                    <Grid container spacing={2}>
                        {SERVICE_CATEGORIES.map(category => (
                            <Grid item xs={12} md={6} lg={4} key={category}>
                                <Paper sx={{ p: 2, height: '100%' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {category}
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    {servicesByCategory[category]?.length > 0 ? (
                                        servicesByCategory[category].map(service => (
                                            <Box key={service._id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">
                                                    {service.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ${service.price}
                                                </Typography>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No services in this category
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Duration (minutes)</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => (
                                <TableRow key={service._id}>
                                    <TableCell>{service.name}</TableCell>
                                    <TableCell>
                                        {service.category || 'Uncategorized'}
                                    </TableCell>
                                    <TableCell>{service.description}</TableCell>
                                    <TableCell>{service.duration}</TableCell>
                                    <TableCell>${service.price}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={service.isActive !== false ? 'Active' : 'Inactive'} 
                                            color={service.isActive !== false ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            onClick={() => handleOpenDialog(service)}
                                            color="primary"
                                            size="small"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleDelete(service._id)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No services found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Service Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="category-label">Category</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        label="Category"
                                    >
                                        {SERVICE_CATEGORIES.map(category => (
                                            <MenuItem key={category} value={category}>{category}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Duration (minutes)"
                                    name="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Price ($)"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    inputProps={{ min: 0, step: '0.01' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.requiresDoctor}
                                            onChange={handleInputChange}
                                            name="requiresDoctor"
                                        />
                                    }
                                    label="Requires Doctor Assignment"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            name="isActive"
                                        />
                                    }
                                    label="Active Service"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingService ? 'Save Changes' : 'Add Service'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ServiceManagement; 