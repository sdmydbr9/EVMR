import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
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
    LinearProgress
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const InventoryUsage = () => {
    const [inventoryData, setInventoryData] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        fetchInventoryData();
    }, [timeRange, category]);

    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            // Fetch inventory usage analytics
            const response = await fetch(`/api/services/analytics/inventory-usage?period=${timeRange}&category=${category}`);
            const data = await response.json();
            setInventoryData(data);

            // Fetch inventory items
            const itemsResponse = await fetch('/api/inventory/items');
            if (itemsResponse.ok) {
                const itemsData = await itemsResponse.json();
                setInventoryItems(itemsData);
            } else {
                // Mock data if endpoint is not available
                setInventoryItems([
                    { id: 1, name: 'Vaccines', category: 'Vaccines', currentStock: 120, minStock: 50, isLow: false },
                    { id: 2, name: 'Antibiotics', category: 'Medications', currentStock: 85, minStock: 100, isLow: true },
                    { id: 3, name: 'Syringes', category: 'Supplies', currentStock: 200, minStock: 100, isLow: false },
                    { id: 4, name: 'Bandages', category: 'Supplies', currentStock: 150, minStock: 75, isLow: false },
                    { id: 5, name: 'X-ray Film', category: 'Imaging', currentStock: 30, minStock: 40, isLow: true }
                ]);
            }
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            // Provide mock data for demonstration
            setInventoryData([
                { name: 'Vaccines', value: 35 },
                { name: 'Medications', value: 25 },
                { name: 'Supplies', value: 20 },
                { name: 'Equipment', value: 15 },
                { name: 'Food', value: 5 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getLowStockItems = () => {
        return inventoryItems.filter(item => item.isLow || item.currentStock < item.minStock);
    };

    const getStockLevel = (current, min) => {
        const percentage = (current / min) * 100;
        if (percentage <= 75) return 'error';
        if (percentage <= 100) return 'warning';
        return 'success';
    };

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Inventory Usage Analysis
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <FormControl sx={{ minWidth: 150, mr: 2 }}>
                    <InputLabel id="time-range-label">Time Range</InputLabel>
                    <Select
                        labelId="time-range-label"
                        value={timeRange}
                        label="Time Range"
                        onChange={handleTimeRangeChange}
                    >
                        <MenuItem value="week">Last Week</MenuItem>
                        <MenuItem value="month">Last Month</MenuItem>
                        <MenuItem value="quarter">Last Quarter</MenuItem>
                        <MenuItem value="year">Last Year</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        value={category}
                        label="Category"
                        onChange={handleCategoryChange}
                    >
                        <MenuItem value="all">All Categories</MenuItem>
                        <MenuItem value="Vaccines">Vaccines</MenuItem>
                        <MenuItem value="Medications">Medications</MenuItem>
                        <MenuItem value="Supplies">Supplies</MenuItem>
                        <MenuItem value="Equipment">Equipment</MenuItem>
                        <MenuItem value="Food">Food</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {/* Usage by Category Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Usage by Category
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={inventoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {inventoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Usage Trend Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Usage Trend
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={inventoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" name="Usage Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Low Stock Alert */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Low Stock Alerts
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Item Name</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Current Stock</TableCell>
                                        <TableCell>Minimum Stock</TableCell>
                                        <TableCell>Stock Level</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getLowStockItems().map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.currentStock}</TableCell>
                                            <TableCell>{item.minStock}</TableCell>
                                            <TableCell sx={{ width: '30%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Box sx={{ width: '100%', mr: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={(item.currentStock / item.minStock) * 100}
                                                            color={getStockLevel(item.currentStock, item.minStock)}
                                                        />
                                                    </Box>
                                                    <Box sx={{ minWidth: 35 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {`${Math.round((item.currentStock / item.minStock) * 100)}%`}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default InventoryUsage; 