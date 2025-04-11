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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  FormControlLabel,
  Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BadgeIcon from '@mui/icons-material/Badge';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { isDemoUser } from '../../utils/auth';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

const StaffManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('view'); // 'view', 'add', 'edit'
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'receptionist',
    department: 'admin',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active',
    specialization: '',
    license: '',
    workHours: {
      monday: { start: '09:00', end: '17:00', isWorking: true },
      tuesday: { start: '09:00', end: '17:00', isWorking: true },
      wednesday: { start: '09:00', end: '17:00', isWorking: true },
      thursday: { start: '09:00', end: '17:00', isWorking: true },
      friday: { start: '09:00', end: '17:00', isWorking: true },
      saturday: { start: '10:00', end: '14:00', isWorking: false },
      sunday: { start: '10:00', end: '14:00', isWorking: false }
    }
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define submenu tabs
  const staffSubmenus = [
    { label: "All Staff", value: 0 },
    { label: "Doctors", value: 1 },
    { label: "Technicians", value: 2 },
    { label: "Receptionists", value: 3 },
    { label: "Schedules", value: 4 }
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      // Check if we're using the demo account
      const demoUser = isDemoUser();
      
      let data = [];
      
      if (demoUser) {
        // Use demo data
        data = generateDemoStaff();
      } else {
        // Fetch from API
        const response = await api.get('/staff');
        data = response.data;
      }
      
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff(generateDemoStaff());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoStaff = () => {
    const roles = ['doctor', 'technician', 'receptionist', 'admin', 'manager'];
    const departments = ['medical', 'surgery', 'admin', 'lab', 'pharmacy'];
    const specializations = [
      'General Practice', 'Surgery', 'Dermatology', 'Cardiology', 
      'Orthopedics', 'Neurology', 'Ophthalmology', 'Dentistry'
    ];
    const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Emily', 'James', 'Jessica'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
    
    return Array.from({ length: 50 }, (_, index) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const specialization = role === 'doctor' ? specializations[Math.floor(Math.random() * specializations.length)] : '';
      
      return {
        id: `STF${1000 + index}`,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@petsphere.com`,
        phone: `+1-555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        role,
        department,
        hireDate: new Date(Date.now() - Math.floor(Math.random() * 1000) * 86400000).toISOString().split('T')[0],
        status: ['active', 'inactive', 'on_leave'][Math.floor(Math.random() * 3)],
        specialization,
        license: role === 'doctor' ? `LIC-${Math.floor(10000 + Math.random() * 90000)}` : '',
        workHours: {
          monday: { start: '09:00', end: '17:00', isWorking: Math.random() > 0.1 },
          tuesday: { start: '09:00', end: '17:00', isWorking: Math.random() > 0.1 },
          wednesday: { start: '09:00', end: '17:00', isWorking: Math.random() > 0.1 },
          thursday: { start: '09:00', end: '17:00', isWorking: Math.random() > 0.1 },
          friday: { start: '09:00', end: '17:00', isWorking: Math.random() > 0.1 },
          saturday: { start: '10:00', end: '14:00', isWorking: Math.random() > 0.7 },
          sunday: { start: '10:00', end: '14:00', isWorking: Math.random() > 0.9 }
        }
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

  const handleViewStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setStaffForm({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      department: staffMember.department,
      hireDate: staffMember.hireDate,
      status: staffMember.status,
      specialization: staffMember.specialization || '',
      license: staffMember.license || '',
      workHours: staffMember.workHours || {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '10:00', end: '14:00', isWorking: false },
        sunday: { start: '10:00', end: '14:00', isWorking: false }
      }
    });
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleEditStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setStaffForm({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      department: staffMember.department,
      hireDate: staffMember.hireDate,
      status: staffMember.status,
      specialization: staffMember.specialization || '',
      license: staffMember.license || '',
      workHours: staffMember.workHours || {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '10:00', end: '14:00', isWorking: false },
        sunday: { start: '10:00', end: '14:00', isWorking: false }
      }
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setStaffForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'receptionist',
      department: 'admin',
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      specialization: '',
      license: '',
      workHours: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '17:00', isWorking: true },
        saturday: { start: '10:00', end: '14:00', isWorking: false },
        sunday: { start: '10:00', end: '14:00', isWorking: false }
      }
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleDeleteStaff = async (staffMember) => {
    if (window.confirm(`Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`)) {
      try {
        // In a real app, you would call the API
        // await api.delete(`/staff/${staffMember.id}`);
        
        // For demo, just remove from the local state
        setStaff(staff.filter(s => s.id !== staffMember.id));
        
        setNotification({
          open: true,
          message: 'Staff member deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting staff member:', error);
        setNotification({
          open: true,
          message: 'Error deleting staff member',
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
    setStaffForm({
      ...staffForm,
      [name]: value
    });
  };

  const handleWorkHoursChange = (day, field, value) => {
    setStaffForm({
      ...staffForm,
      workHours: {
        ...staffForm.workHours,
        [day]: {
          ...staffForm.workHours[day],
          [field]: value
        }
      }
    });
  };

  const handleSaveStaff = async () => {
    try {
      if (dialogMode === 'add') {
        // In a real app, you would call the API
        // const response = await api.post('/staff', staffForm);
        
        // For demo, just add to the local state
        const newStaff = {
          id: `STF${1000 + staff.length}`,
          ...staffForm
        };
        
        setStaff([newStaff, ...staff]);
        
        setNotification({
          open: true,
          message: 'Staff member added successfully',
          severity: 'success'
        });
      } else if (dialogMode === 'edit') {
        // In a real app, you would call the API
        // await api.put(`/staff/${selectedStaff.id}`, staffForm);
        
        // For demo, just update the local state
        setStaff(staff.map(s => 
          s.id === selectedStaff.id ? { ...s, ...staffForm } : s
        ));
        
        setNotification({
          open: true,
          message: 'Staff member updated successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving staff member:', error);
      setNotification({
        open: true,
        message: 'Error saving staff member',
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

  // Filter staff based on tab and search term
  const filteredStaff = staff.filter(staffMember => {
    // Filter by tab
    if (activeTab !== 0) {
      const roleMap = {
        1: 'doctor',
        2: 'technician',
        3: 'receptionist'
      };
      
      if (activeTab !== 4 && staffMember.role !== roleMap[activeTab]) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      return (
        staffMember.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staffMember.specialization && staffMember.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return true;
  });

  // Slice the data for pagination
  const paginatedStaff = filteredStaff.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return (
          <Chip
            size="small"
            label="Active"
            color="success"
            sx={{ borderRadius: '4px' }}
          />
        );
      case 'inactive':
        return (
          <Chip
            size="small"
            label="Inactive"
            color="default"
            sx={{ borderRadius: '4px' }}
          />
        );
      case 'on_leave':
        return (
          <Chip
            size="small"
            label="On Leave"
            color="warning"
            sx={{ borderRadius: '4px' }}
          />
        );
      default:
        return <Chip size="small" label={status} />;
    }
  };

  const getRoleChip = (role) => {
    let color;
    let label = role.charAt(0).toUpperCase() + role.slice(1);
    
    switch (role) {
      case 'doctor':
        color = 'primary';
        break;
      case 'technician':
        color = 'info';
        break;
      case 'receptionist':
        color = 'success';
        break;
      case 'admin':
        color = 'warning';
        break;
      case 'manager':
        color = 'secondary';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip
        size="small"
        label={label}
        color={color}
        sx={{ borderRadius: '4px' }}
      />
    );
  };

  const getDaysWorking = (workHours) => {
    if (!workHours) return 'N/A';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workingDays = days.filter(day => workHours[day] && workHours[day].isWorking);
    
    return `${workingDays.length} days`;
  };

  const renderWorkSchedule = () => {
    const days = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
      { key: 'saturday', label: 'Saturday' },
      { key: 'sunday', label: 'Sunday' }
    ];

    return (
      <Grid container spacing={2}>
        {days.map((day) => (
          <Grid item xs={12} key={day.key}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={staffForm.workHours[day.key].isWorking}
                    onChange={(e) => handleWorkHoursChange(day.key, 'isWorking', e.target.checked)}
                    disabled={dialogMode === 'view'}
                  />
                }
                label={day.label}
                sx={{ width: 120 }}
              />
              <TextField
                label="Start"
                type="time"
                value={staffForm.workHours[day.key].start}
                onChange={(e) => handleWorkHoursChange(day.key, 'start', e.target.value)}
                disabled={!staffForm.workHours[day.key].isWorking || dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
                sx={{ mx: 1, width: 120 }}
              />
              <Typography variant="body2" sx={{ mx: 1 }}>to</Typography>
              <TextField
                label="End"
                type="time"
                value={staffForm.workHours[day.key].end}
                onChange={(e) => handleWorkHoursChange(day.key, 'end', e.target.value)}
                disabled={!staffForm.workHours[day.key].isWorking || dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 120 }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderStaffList = () => {
    return (
      <>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="Search staff..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: 300, mr: 2 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddStaff}
          >
            Add Staff
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Hire Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStaff.map(staffMember => (
                <TableRow key={staffMember.id}>
                  <TableCell>{staffMember.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                        {staffMember.firstName[0]}{staffMember.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{staffMember.firstName} {staffMember.lastName}</Typography>
                        {staffMember.role === 'doctor' && staffMember.specialization && (
                          <Typography variant="caption" color="text.secondary">
                            {staffMember.specialization}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{staffMember.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{staffMember.phone}</Typography>
                  </TableCell>
                  <TableCell>{getRoleChip(staffMember.role)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {staffMember.department}
                    </Typography>
                  </TableCell>
                  <TableCell>{staffMember.hireDate}</TableCell>
                  <TableCell>{getStatusChip(staffMember.status)}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewStaff(staffMember)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditStaff(staffMember)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteStaff(staffMember)}>
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
            count={filteredStaff.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </>
    );
  };

  const renderSchedules = () => {
    // Get all doctors and staff
    const doctors = staff.filter(s => s.role === 'doctor' && s.status === 'active');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="h6" gutterBottom>Staff Work Schedules</Typography>
        
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="200">Staff Member</TableCell>
                <TableCell>Monday</TableCell>
                <TableCell>Tuesday</TableCell>
                <TableCell>Wednesday</TableCell>
                <TableCell>Thursday</TableCell>
                <TableCell>Friday</TableCell>
                <TableCell>Saturday</TableCell>
                <TableCell>Sunday</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.slice(0, 10).map(staffMember => (
                <TableRow key={staffMember.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                        {staffMember.firstName[0]}{staffMember.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{staffMember.firstName} {staffMember.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getRoleChip(staffMember.role)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  {days.map(day => (
                    <TableCell key={day}>
                      {staffMember.workHours && staffMember.workHours[day].isWorking ? (
                        <Typography variant="body2">
                          {staffMember.workHours[day].start} - {staffMember.workHours[day].end}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Off
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 4) {
      return renderSchedules();
    } else {
      return renderStaffList();
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
          Staff Management
        </Typography>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {staffSubmenus.map((menu) => (
            <Tab 
              key={menu.value} 
              label={menu.label} 
              icon={
                menu.value === 0 ? <PersonIcon fontSize="small" /> :
                menu.value === 1 ? <LocalHospitalIcon fontSize="small" /> :
                menu.value === 2 ? <BadgeIcon fontSize="small" /> :
                menu.value === 3 ? <PersonIcon fontSize="small" /> :
                <ScheduleIcon fontSize="small" />
              }
              iconPosition="start"
            />
          ))}
        </Tabs>
        
        {renderTabContent()}
      </Box>

      {/* Staff View/Edit/Add Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'view' ? 'Staff Details' : 
           dialogMode === 'add' ? 'Add New Staff' : 'Edit Staff'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={staffForm.firstName}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={staffForm.lastName}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={staffForm.email}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={staffForm.phone}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  name="role"
                  value={staffForm.role}
                  onChange={handleFormChange}
                >
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="technician">Technician</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  name="department"
                  value={staffForm.department}
                  onChange={handleFormChange}
                >
                  <MenuItem value="medical">Medical</MenuItem>
                  <MenuItem value="surgery">Surgery</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="lab">Lab</MenuItem>
                  <MenuItem value="pharmacy">Pharmacy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                name="hireDate"
                value={staffForm.hireDate}
                onChange={handleFormChange}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={dialogMode === 'view'}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  name="status"
                  value={staffForm.status}
                  onChange={handleFormChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {staffForm.role === 'doctor' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    name="specialization"
                    value={staffForm.specialization}
                    onChange={handleFormChange}
                    disabled={dialogMode === 'view'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="license"
                    value={staffForm.license}
                    onChange={handleFormChange}
                    disabled={dialogMode === 'view'}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Work Schedule
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {renderWorkSchedule()}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {dialogMode !== 'view' && (
            <Button onClick={handleSaveStaff} variant="contained" color="primary">
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

export default StaffManagement; 