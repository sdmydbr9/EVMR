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
    quantity: 0,
    unit: '',
    price: 0,
    reorderPoint: 0,
    location: '',
    notes: ''
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

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
      quantity: 0,
      unit: '',
      price: 0,
      reorderPoint: 0,
      location: '',
      notes: ''
    });
    setOpen(true);
  };

  // Open form dialog for editing an existing item
  const handleEditItem = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      reorderPoint: item.reorderPoint,
      location: item.location,
      notes: item.notes
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

      if (formMode === 'create') {
        await inventoryService.createInventoryItem(formData);
        showNotification('Item added successfully', 'success');
      } else {
        await inventoryService.updateInventoryItem(currentItem.id, formData);
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
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.reorderPoint}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      <Alert
                        severity={getStockStatusColor(item.quantity, item.reorderPoint)}
                        sx={{ py: 0 }}
                      >
                        {item.quantity <= 0
                          ? 'Out of Stock'
                          : item.quantity <= item.reorderPoint
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
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                  labelId="category-label"
                >
                  <MenuItem value="medications">Medications</MenuItem>
                  <MenuItem value="supplies">Supplies</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="consumables">Consumables</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="unit"
                label="Unit"
                value={formData.unit}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="reorderPoint"
                label="Reorder Point"
                type="number"
                value={formData.reorderPoint}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
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