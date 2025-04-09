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
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

// Inventory service for API calls
const inventoryService = {
  getInventory: async () => {
    try {
      const response = await axios.get('/api/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  getInventoryItem: async (id) => {
    try {
      const response = await axios.get(`/api/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory item ${id}:`, error);
      throw error;
    }
  },

  createInventoryItem: async (itemData) => {
    try {
      const response = await axios.post('/api/inventory', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  updateInventoryItem: async (id, itemData) => {
    try {
      const response = await axios.put(`/api/inventory/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error(`Error updating inventory item ${id}:`, error);
      throw error;
    }
  },

  deleteInventoryItem: async (id) => {
    try {
      const response = await axios.delete(`/api/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting inventory item ${id}:`, error);
      throw error;
    }
  }
};

const InventoryDashboard = () => {
  // State for inventory list
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for inventory form
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    current_quantity: 0,
    reorder_level: 0,
    cost_price: 0,
    selling_price: 0,
    description: ''
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const medicineCategories = [
    'Antibiotics',
    'Vaccines',
    'Painkillers',
    'Antiparasitics',
    'Vitamins',
    'First Aid',
    'Surgical Supplies',
    'Other'
  ];

  // Load inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch inventory items
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setInventory(data.items);
    } catch (error) {
      showNotification('Error loading inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open form dialog for creating a new item
  const handleAddItem = () => {
    setFormMode('create');
    setFormData({
      name: '',
      category: '',
      unit: '',
      current_quantity: 0,
      reorder_level: 0,
      cost_price: 0,
      selling_price: 0,
      description: ''
    });
    setOpen(true);
  };

  // Open form dialog for editing an existing item
  const handleEditItem = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      current_quantity: item.quantity,
      reorder_level: item.reorderPoint,
      cost_price: item.price,
      selling_price: item.price,
      description: item.notes
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

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Prepare the data in the format expected by the backend
      const submitData = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        current_quantity: parseInt(formData.current_quantity),
        reorder_level: parseInt(formData.reorder_level),
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        description: formData.description
      };

      if (formMode === 'create') {
        await inventoryService.createInventoryItem(submitData);
        showNotification('Item added successfully', 'success');
      } else {
        await inventoryService.updateInventoryItem(currentItem.id, submitData);
        showNotification('Item updated successfully', 'success');
      }

      setOpen(false);
      fetchInventory(); // Refresh the inventory list
    } catch (error) {
      showNotification(
        formMode === 'create'
          ? 'Error adding item'
          : 'Error updating item',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (id) => {
    try {
      setLoading(true);
      await inventoryService.deleteInventoryItem(id);
      showNotification('Item deleted successfully', 'success');
      fetchInventory(); // Refresh the inventory list
    } catch (error) {
      showNotification('Error deleting item', 'error');
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

  // Get stock status color
  const getStockStatusColor = (quantity, reorderPoint) => {
    if (quantity <= 0) return 'error';
    if (quantity <= reorderPoint) return 'warning';
    return 'success';
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
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
        >
          Add Item
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Reorder Point</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory && inventory.length > 0 ? (
                inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.current_quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>${typeof item.selling_price === 'number' ? item.selling_price.toFixed(2) : '0.00'}</TableCell>
                    <TableCell>{item.reorder_level}</TableCell>
                    <TableCell>{item.location || '-'}</TableCell>
                    <TableCell>
                      <Alert
                        severity={getStockStatusColor(item.current_quantity, item.reorder_level)}
                        sx={{ py: 0 }}
                      >
                        {item.current_quantity <= 0
                          ? 'Out of Stock'
                          : item.current_quantity <= item.reorder_level
                          ? 'Low Stock'
                          : 'In Stock'}
                      </Alert>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEditItem(item)}
                          aria-label="Edit item"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                          aria-label="Delete item"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No items in inventory
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Inventory Form Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="inventory-dialog-title"
        aria-describedby="inventory-dialog-description"
      >
        <DialogTitle id="inventory-dialog-title">
          {formMode === 'create' ? 'Add New Item' : 'Edit Item'}
        </DialogTitle>
        <DialogContent id="inventory-dialog-description">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {medicineCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Quantity"
                name="current_quantity"
                type="number"
                value={formData.current_quantity}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reorder Level"
                name="reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Price"
                name="cost_price"
                type="number"
                value={formData.cost_price}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Selling Price"
                name="selling_price"
                type="number"
                value={formData.selling_price}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
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
            aria-label={formMode === 'create' ? 'Add item' : 'Save changes'}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDashboard; 