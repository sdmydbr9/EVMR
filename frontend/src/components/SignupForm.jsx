import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  LinearProgress,
  FormHelperText,
  Avatar,
  Fade,
  Slide,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  MobileStepper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
  CloudDone as CloudDoneIcon,
  MedicalServices as MedicalServicesIcon,
  PetsRounded as PetsRoundedIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import axios from 'axios';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Define step labels
const steps = [
  'User Type',
  'Basic Information',
  'Account Setup',
  'Additional Details',
  'Review & Submit'
];

// --- Step Components (Wrapped in React.memo) ---

// User Type Selection Step
const UserTypeStep = React.memo(({ formData, handleChange, errors }) => {
  const theme = useTheme(); // Moved useTheme here as it's needed
  const userTypes = [
    {
      value: 'pet_parent',
      title: 'Pet Parent',
      icon: <PetsRoundedIcon sx={{ fontSize: 40 }} />,
      description: 'Register as a pet owner to manage your pets\' health records and appointments'
    },
    {
      value: 'veterinarian',
      title: 'Veterinarian',
      icon: <MedicalServicesIcon sx={{ fontSize: 40 }} />,
      description: 'Register as a veterinarian to provide care and access patient records'
    },
    {
      value: 'organisation',
      title: 'Organisation',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      description: 'Register as an administrator for a veterinary practice or hospital'
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select your user type
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Choose the option that best describes your role
      </Typography>

      <Grid container spacing={3}>
        {userTypes.map((type) => (
          <Grid item xs={12} md={4} key={type.value}>
            <Paper
              elevation={formData.userType === type.value ? 6 : 1}
              sx={{
                p: 3,
                borderRadius: 2,
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: theme => formData.userType === type.value
                  ? `2px solid ${theme.palette.primary.main}`
                  : '1px solid rgba(0, 0, 0, 0.12)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleChange({ target: { name: 'userType', value: type.value } })}
            >
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  mb: 2,
                  bgcolor: formData.userType === type.value
                    ? 'primary.main'
                    : 'rgba(0, 0, 0, 0.08)'
                }}
              >
                {type.icon}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {type.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {type.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {errors.userType && (
        <FormHelperText error sx={{ mt: 2, textAlign: 'center' }}>
          {errors.userType}
        </FormHelperText>
      )}
    </Box>
  );
});

// Basic Information Step
const BasicInfoStep = React.memo(({ formData, handleChange, errors, handleBlur }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Please provide your personal information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            name="fullName"
            id="fullName"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            fullWidth
            required
            autoComplete="name"
            error={!!errors.fullName}
            helperText={errors.fullName}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            autoFocus
            key="fullName-field"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="email"
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            key="email-field"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="phone"
            id="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            fullWidth
            required
            autoComplete="tel"
            error={!!errors.phone}
            helperText={errors.phone}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            key="phone-field"
          />
        </Grid>
      </Grid>
    </Box>
  );
});

// Account Setup Step
const AccountSetupStep = React.memo(({
  formData,
  handleChange,
  errors,
  showPassword,
  showConfirmPassword,
  handleTogglePassword,
  handleToggleConfirmPassword,
  strengthInfo,
  passwordStrength
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Account Setup
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Create a secure password for your account
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            name="password"
            id="password"
            label="Create Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            key="password-field"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {formData.password && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color={strengthInfo.color}>
                  {strengthInfo.text}
                </Typography>
                <Typography variant="body2">
                  {passwordStrength}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength}
                sx={{
                  mt: 0.5,
                  borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.08)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: strengthInfo.color
                  }
                }}
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="confirmPassword"
            id="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            required
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            key="confirm-password-field"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={handleToggleConfirmPassword}
                    edge="end"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

// Additional Details Step (changes based on user type)
const AdditionalDetailsStep = React.memo(({ formData, handleChange, handleMultiSelectChange, errors }) => {
  // Render different content based on user type, but keep component structure consistent
  let content = null;

  if (formData.userType === 'pet_parent') {
    content = (
      <>
        <Typography variant="h6" gutterBottom>
          Pet Information
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Tell us about your pets so we can provide better service
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl
              fullWidth
              required
              error={!!errors.petTypes}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <InputLabel>Types of Pets You Have</InputLabel>
              <Select
                multiple
                name="petTypes"
                id="petTypes"
                value={formData.petTypes}
                onChange={handleMultiSelectChange}
                label="Types of Pets You Have"
                MenuProps={{ // Helps with dropdown positioning consistency
                  PaperProps: {
                    style: {
                      maxHeight: 224, // Example max height
                    },
                  },
                }}
              >
                <MenuItem value="dog">Dog</MenuItem>
                <MenuItem value="cat">Cat</MenuItem>
                <MenuItem value="bird">Bird</MenuItem>
                <MenuItem value="small_mammal">Small Mammal (Guinea Pig, Hamster, etc.)</MenuItem>
                <MenuItem value="reptile">Reptile</MenuItem>
                <MenuItem value="fish">Fish</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {errors.petTypes && <FormHelperText>{errors.petTypes}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="preferredClinic"
              id="preferredClinic"
              label="Preferred Veterinary Clinic (Optional)"
              value={formData.preferredClinic}
              onChange={handleChange}
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </>
    );
  } else if (formData.userType === 'veterinarian') {
    content = (
      <>
        <Typography variant="h6" gutterBottom>
          Professional Information
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Please provide your professional credentials
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="licenseNumber"
              id="licenseNumber"
              label="License Number"
              value={formData.licenseNumber}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.licenseNumber}
              helperText={errors.licenseNumber}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              required
              error={!!errors.specialties}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <InputLabel>Specialties</InputLabel>
              <Select
                multiple
                name="specialties"
                id="specialties"
                value={formData.specialties}
                onChange={handleMultiSelectChange}
                label="Specialties"
                MenuProps={{ // Helps with dropdown positioning consistency
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                    },
                  },
                }}
              >
                <MenuItem value="general_practice">General Practice</MenuItem>
                <MenuItem value="surgery">Surgery</MenuItem>
                <MenuItem value="internal_medicine">Internal Medicine</MenuItem>
                <MenuItem value="dermatology">Dermatology</MenuItem>
                <MenuItem value="cardiology">Cardiology</MenuItem>
                <MenuItem value="neurology">Neurology</MenuItem>
                <MenuItem value="oncology">Oncology</MenuItem>
                <MenuItem value="emergency">Emergency & Critical Care</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {errors.specialties && <FormHelperText>{errors.specialties}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              required
              error={!!errors.yearsOfExperience}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <InputLabel>Years of Experience</InputLabel>
              <Select
                name="yearsOfExperience"
                id="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                label="Years of Experience"
                 MenuProps={{ // Helps with dropdown positioning consistency
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                    },
                  },
                }}
              >
                <MenuItem value="0-2">0-2 years</MenuItem>
                <MenuItem value="3-5">3-5 years</MenuItem>
                <MenuItem value="6-10">6-10 years</MenuItem>
                <MenuItem value="11-20">11-20 years</MenuItem>
                <MenuItem value="21-30">21-30 years</MenuItem>
                <MenuItem value="31-40">31-40 years</MenuItem>
                <MenuItem value="41-50">41-50 years</MenuItem>
                <MenuItem value="51-60">51-60 years</MenuItem>
                <MenuItem value="61-70">61-70 years</MenuItem>
                <MenuItem value="71-80">71-80 years</MenuItem>
                <MenuItem value="81-90">81-90 years</MenuItem>
                <MenuItem value="91-100">91-100 years</MenuItem>
              </Select>
              {errors.yearsOfExperience && <FormHelperText>{errors.yearsOfExperience}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>
      </>
    );
  } else if (formData.userType === 'organisation') {
    content = (
      <>
        <Typography variant="h6" gutterBottom>
          Clinic Information
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Please provide your clinic's information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="clinicName"
              id="clinicName"
              label="Clinic/Hospital Name"
              value={formData.clinicName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.clinicName}
              helperText={errors.clinicName}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="clinicAddress"
              id="clinicAddress"
              label="Clinic Address"
              value={formData.clinicAddress}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.clinicAddress}
              helperText={errors.clinicAddress}
              multiline
              rows={3}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              required
              error={!!errors.country}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <InputLabel>Country/Region</InputLabel>
              <Select
                name="country"
                id="country"
                value={formData.country}
                onChange={handleChange}
                label="Country/Region"
                 MenuProps={{ // Helps with dropdown positioning consistency
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                    },
                  },
                }}
              >
                <MenuItem value="us">United States</MenuItem>
                <MenuItem value="ca">Canada</MenuItem>
                <MenuItem value="uk">United Kingdom</MenuItem>
                <MenuItem value="au">Australia</MenuItem>
                <MenuItem value="in">India</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="clinicPhone"
              id="clinicPhone"
              label="Clinic Phone Number"
              value={formData.clinicPhone}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.clinicPhone}
              helperText={errors.clinicPhone}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              name="clinicEmail"
              id="clinicEmail"
              label="Clinic Email"
              type="email"
              value={formData.clinicEmail}
              onChange={handleChange}
              fullWidth
              error={!!errors.clinicEmail}
              helperText={errors.clinicEmail}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              required
              error={!!errors.teamSize}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <InputLabel>Number of Team Members</InputLabel>
              <Select
                name="teamSize"
                id="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                label="Number of Team Members"
                 MenuProps={{ // Helps with dropdown positioning consistency
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                    },
                  },
                }}
              >
                <MenuItem value="1-5">1-5</MenuItem>
                <MenuItem value="6-10">6-10</MenuItem>
                <MenuItem value="11-20">11-20</MenuItem>
                <MenuItem value="21-50">21-50</MenuItem>
                <MenuItem value="50+">50+</MenuItem>
              </Select>
              {errors.teamSize && <FormHelperText>{errors.teamSize}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>
      </>
    );
  } else {
    // Default content if no user type is selected (shouldn't normally happen if step 0 is enforced)
    content = (
      <Typography variant="body1" color="text.secondary">
        Please go back and select a user type to continue.
      </Typography>
    );
  }

  // Return the wrapped content in a consistent Box component
  return (
    <Box>
      {content}
    </Box>
  );
});

// Review Step
const ReviewStep = React.memo(({ formData, handleChange, errors }) => {
  // Helper function to get user type label
  const getUserTypeLabel = (type) => {
    switch(type) {
      case 'pet_parent': return 'Pet Parent';
      case 'veterinarian': return 'Veterinarian';
      case 'organisation': return 'Organisation';
      default: return 'User';
    }
  };

  const formatMultiSelect = (items) => {
    if (!items || items.length === 0) return 'N/A';
    return items.map(item => item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())).join(', ');
  };

  const formatCountry = (code) => {
    switch(code) {
      case 'us': return 'United States';
      case 'ca': return 'Canada';
      case 'uk': return 'United Kingdom';
      case 'au': return 'Australia';
      case 'in': return 'India';
      case 'other': return 'Other';
      default: return code || 'N/A';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Your Information
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Please review your information before submitting your application
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Account Type
        </Typography>
        <Typography variant="body1" gutterBottom>
          {getUserTypeLabel(formData.userType)}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Personal Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Full Name</Typography>
            <Typography variant="body1">{formData.fullName || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Email Address</Typography>
            <Typography variant="body1">{formData.email || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">Phone Number</Typography>
            <Typography variant="body1">{formData.phone || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {formData.userType === 'pet_parent' && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Pet Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Pet Types</Typography>
              <Typography variant="body1">
                {formatMultiSelect(formData.petTypes)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Preferred Clinic</Typography>
              <Typography variant="body1">{formData.preferredClinic || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {formData.userType === 'veterinarian' && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Professional Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">License Number</Typography>
              <Typography variant="body1">{formData.licenseNumber || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Years of Experience</Typography>
              <Typography variant="body1">{formData.yearsOfExperience || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Specialties</Typography>
              <Typography variant="body1">
                {formatMultiSelect(formData.specialties)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {formData.userType === 'organisation' && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Clinic Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Clinic Name</Typography>
              <Typography variant="body1">{formData.clinicName || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Country/Region</Typography>
              <Typography variant="body1">
                {formatCountry(formData.country)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Clinic Address</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{formData.clinicAddress || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Clinic Phone</Typography>
              <Typography variant="body1">{formData.clinicPhone || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Clinic Email</Typography>
              <Typography variant="body1">{formData.clinicEmail || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Team Size</Typography>
              <Typography variant="body1">{formData.teamSize || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Box sx={{ mt: 3 }}>
          <FormControl error={!!errors.agreeTerms} required>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    name="agreeTerms"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the <Link href="#" onClick={(e) => e.preventDefault()} underline="hover">Terms of Service</Link> and <Link href="#" onClick={(e) => e.preventDefault()} underline="hover">Privacy Policy</Link>
                  </Typography>
                }
              />
              {errors.agreeTerms && (
                  <FormHelperText>{errors.agreeTerms}</FormHelperText>
              )}
          </FormControl>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.subscribe}
            onChange={handleChange}
            name="subscribe"
            color="primary"
          />
        }
        label="Subscribe to our newsletter for updates and tips"
        sx={{ mt: 1 }}
      />
    </Box>
  );
});


// --- Main SignupForm Component ---

const SignupForm = ({ onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Step management
  const [activeStep, setActiveStep] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    // User type
    userType: '',

    // Basic information
    fullName: '',
    email: '',
    phone: '',

    // Account setup
    password: '',
    confirmPassword: '',

    // Pet parent specific
    petTypes: [],
    preferredClinic: '',

    // Veterinarian specific
    specialties: [],
    yearsOfExperience: '',
    licenseNumber: '',

    // Organisation specific
    clinicName: '',
    clinicAddress: '',
    country: '',
    clinicPhone: '',
    clinicEmail: '',
    teamSize: '',

    // Agreement fields
    agreeTerms: false,
    subscribe: false
  });

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Handle form input changes with improved focus handling
  const handleChange = useCallback((e) => {
    const { name, value, checked, type } = e.target;

    // Use functional update to avoid stale state issues
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors for the specific field being changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name]; // Remove the error for this field
        return newErrors;
      });
    }
  }, [errors]); // Include errors in dependency array to ensure correct clearing

  // Handle multiple select changes with functional updates
  const handleMultiSelectChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value // Handles Select component's value format
    }));

    // Clear errors for the specific field being changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Validation logic (kept separate for clarity, called within handleNext/handleSubmit)
  const validateStep = useCallback((step) => {
      const newErrors = {};
      const currentData = formData; // Use current formData directly

      // Step 0: User Type
      if (step === 0) {
          if (!currentData.userType) {
              newErrors.userType = 'Please select a user type';
          }
      }
      // Step 1: Basic Information
      else if (step === 1) {
          if (!currentData.fullName.trim()) newErrors.fullName = 'Full name is required';

          if (!currentData.email.trim()) {
              newErrors.email = 'Email is required';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentData.email)) {
              newErrors.email = 'Please enter a valid email address';
          }

          if (!currentData.phone.trim()) newErrors.phone = 'Phone number is required';
          // Add more specific phone validation if needed
      }
      // Step 2: Account Setup
      else if (step === 2) {
          if (!currentData.password) {
              newErrors.password = 'Password is required';
          } else if (currentData.password.length < 8) {
              newErrors.password = 'Password must be at least 8 characters';
          } else if (!/[A-Z]/.test(currentData.password)) {
              newErrors.password = 'Password must contain at least one uppercase letter';
          } else if (!/[a-z]/.test(currentData.password)) {
              newErrors.password = 'Password must contain at least one lowercase letter';
          } else if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(currentData.password)) {
              newErrors.password = 'Password must contain at least one number or special character';
          }

          if (!currentData.confirmPassword) {
              newErrors.confirmPassword = 'Please confirm your password';
          } else if (currentData.password !== currentData.confirmPassword) {
              newErrors.confirmPassword = 'Passwords do not match';
          }
      }
      // Step 3: Additional Details
      else if (step === 3) {
          if (currentData.userType === 'pet_parent') {
              if (!currentData.petTypes || currentData.petTypes.length === 0) {
                  newErrors.petTypes = 'Please select at least one pet type';
              }
          }
          else if (currentData.userType === 'veterinarian') {
              if (!currentData.licenseNumber.trim()) {
                  newErrors.licenseNumber = 'License number is required';
              }
              if (!currentData.specialties || currentData.specialties.length === 0) {
                  newErrors.specialties = 'Please select at least one specialty';
              }
              if (!currentData.yearsOfExperience) {
                  newErrors.yearsOfExperience = 'Please select years of experience';
              }
          }
          else if (currentData.userType === 'organisation') {
              if (!currentData.clinicName.trim()) newErrors.clinicName = 'Clinic name is required';
              if (!currentData.clinicAddress.trim()) newErrors.clinicAddress = 'Clinic address is required';
              if (!currentData.country) newErrors.country = 'Country is required';
              if (!currentData.clinicPhone.trim()) newErrors.clinicPhone = 'Clinic phone is required';
              if (!currentData.teamSize) newErrors.teamSize = 'Team size is required';

              if (currentData.clinicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentData.clinicEmail)) {
                  newErrors.clinicEmail = 'Please enter a valid clinic email address';
              }
          }
      }
      // Step 4: Review & Submit (Validation primarily for terms agreement)
      else if (step === 4) {
          if (!currentData.agreeTerms) {
              newErrors.agreeTerms = 'You must agree to the Terms of Service';
          }
      }
      return newErrors;
  }, [formData]); // Depend on formData

  // Handle step navigation with useCallback
  const handleNext = useCallback(() => {
    const newErrors = validateStep(activeStep);
    setErrors(newErrors);

    // Proceed to next step if no errors for the current step
    if (Object.keys(newErrors).length === 0) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [activeStep, validateStep]); // Depend on activeStep and the validation function

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setErrors({}); // Clear errors when going back
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setFormData({
      userType: '', fullName: '', email: '', phone: '', password: '',
      confirmPassword: '', petTypes: [], preferredClinic: '', specialties: [],
      yearsOfExperience: '', licenseNumber: '', clinicName: '', clinicAddress: '',
      country: '', clinicPhone: '', clinicEmail: '', teamSize: '',
      agreeTerms: false, subscribe: false
    });
    setErrors({});
    setSuccess(false);
    setLoading(false);
  }, []);

  // Toggle password visibility with useCallback
  const handleTogglePassword = useCallback(() => {
    setShowPassword(prevShow => !prevShow);
  }, []);

  // Toggle confirm password visibility with useCallback
  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prevShow => !prevShow);
  }, []);

  // Calculate password strength using useMemo to avoid recalculating on every render unless password changes
  const passwordStrength = useMemo(() => {
      const password = formData.password;
      if (!password) return 0;
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password)) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 25;
      return Math.min(strength, 100); // Cap at 100
  }, [formData.password]);

  // Get password strength text and color using useMemo
  const strengthInfo = useMemo(() => {
      if (passwordStrength === 0 && !formData.password) return { text: '', color: 'grey.500' }; // No color if empty
      if (passwordStrength <= 25) return { text: 'Weak', color: 'error.main' };
      if (passwordStrength <= 50) return { text: 'Fair', color: 'warning.main' };
      if (passwordStrength <= 75) return { text: 'Good', color: 'info.main' };
      return { text: 'Strong', color: 'success.main' };
  }, [passwordStrength, formData.password]);

  // Check if email or phone already exists
  const checkExistingCredentials = useCallback(async (field, value) => {
    if (!value.trim()) return; // Don't check empty values
    
    // Basic validation before making API call
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
    if (field === 'phone' && value.length < 5) return; // Simple minimum length check
    
    try {
      const response = await axios.post('/api/signup/check-existing', { field, value });
      // If we get here, the field is available (not registered)
      // Clear any existing error for this field
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      // If we get an error, the field is already registered
      if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
        // 409 Conflict status indicates the value exists
        setErrors(prev => ({
          ...prev,
          [field]: field === 'email' 
            ? 'This email is already registered' 
            : 'This phone number is already registered'
        }));
      }
    }
  }, [errors]);

  // Handle blur event for email and phone fields
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    // Only check email and phone fields
    if (name === 'email' || name === 'phone') {
      checkExistingCredentials(name, value);
    }
  }, [checkExistingCredentials]);

  // Handle form submission with useCallback
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    // Final validation check, especially for the last step requirements
    const finalErrors = validateStep(activeStep);
    setErrors(finalErrors);

    if (Object.keys(finalErrors).length > 0) {
      console.log("Submission prevented due to validation errors:", finalErrors);
      return; // Stop submission if there are errors
    }

    setLoading(true);
    setErrors({}); // Clear previous errors before attempting submission

    try {
      // Determine role based on user type
      let role;
      switch (formData.userType) {
        case 'pet_parent': role = 'client'; break;
        case 'veterinarian': role = 'veterinarian'; break;
        case 'organisation': role = 'admin'; break;
        default: role = 'user'; // Fallback role
      }

      // Prepare data object for API - include only relevant fields
      const apiData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: role,
        password: formData.password, // Send password for backend hashing
        agreeTerms: formData.agreeTerms,
        subscribe: formData.subscribe,
        userType: formData.userType, // Send userType for backend logic

        // Conditionally add details based on user type
        ...(formData.userType === 'pet_parent' && {
          details: {
            petTypes: formData.petTypes,
            preferredClinic: formData.preferredClinic,
          },
        }),
        ...(formData.userType === 'veterinarian' && {
          specialties: formData.specialties,
          yearsOfExperience: formData.yearsOfExperience,
          licenseNumber: formData.licenseNumber,
        }),
        ...(formData.userType === 'organisation' && {
          clinicName: formData.clinicName,
          clinicAddress: formData.clinicAddress,
          country: formData.country,
          clinicPhone: formData.clinicPhone,
          clinicEmail: formData.clinicEmail,
          teamSize: formData.teamSize,
        }),
      };

      console.log("Submitting data:", apiData); // Log data being sent

      // Make the actual API call to the backend
      const response = await axios.post('/api/signup/register', apiData);
      console.log("API Response:", response.data);

      // If API call is successful:
      setSuccess(true);

    } catch (error) {
        console.error('Registration error:', error);
        let generalError = 'Registration failed. Please try again later.';
        let fieldErrors = {};

        if (axios.isAxiosError(error) && error.response) {
            // Handle specific backend error messages if available
            const responseData = error.response.data;
            if (error.response.status === 409) { // Example: Conflict (email exists)
                fieldErrors.email = responseData.message || 'Email already registered.';
            } else if (error.response.status === 400) { // Example: Bad Request (validation)
                // If backend sends field-specific errors
                if (responseData.errors && typeof responseData.errors === 'object') {
                    fieldErrors = { ...responseData.errors };
                }
                generalError = responseData.message || 'Please check your input and try again.';
            } else {
                generalError = responseData.message || generalError;
            }
        } else if (error instanceof Error) {
             generalError = error.message || generalError;
        }

        setErrors(prev => ({
            ...prev,
            ...fieldErrors,
            general: Object.keys(fieldErrors).length === 0 ? generalError : undefined, // Show general only if no field errors
        }));

    } finally {
      setLoading(false);
    }
  }, [formData, activeStep, validateStep]); // Depend on formData, activeStep, and validateStep


  // Success screen component
  const SuccessScreen = () => (
    <Fade in={true} timeout={800}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Use minHeight to fill screen
        width: '100%',
        p: 4,
        textAlign: 'center',
        backgroundColor: 'background.default'
      }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'success.main',
            mb: 4,
            animation: `${pulse} 1.5s ease-in-out infinite` // Keep pulsing gently
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
        </Avatar>

        <Typography variant="h3" gutterBottom sx={{ fontWeight: 300, mb: 2 }}>
          Application Submitted
        </Typography>

        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2, maxWidth: '600px' }}>
          Thank you for your interest in the EVMR System!
        </Typography>

        <Box sx={{
          maxWidth: 600,
          mb: 6,
          p: 3,
          borderRadius: 2,
          bgcolor: 'rgba(0, 122, 255, 0.05)',
          border: '1px solid rgba(0, 122, 255, 0.1)'
        }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Our team will review and verify your information. This process typically takes <strong>24-48 hours</strong>.
          </Typography>
          <Typography variant="body1">
            You will receive an email notification once your account has been approved. If you don't receive an email within 48 hours, please check your spam folder or contact support.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack} // Use the passed onBack prop
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 4,
            py: 1.5
          }}
        >
          Back to Login
        </Button>
      </Box>
    </Fade>
  );

  // Render success screen if form was submitted successfully
  if (success) {
    return <SuccessScreen />;
  }

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'background.default' // Use theme background
      }}>
        <Grid container sx={{ height: '100vh' }}> {/* Ensure grid takes full height */}

          {/* Form Section */}
          <Grid
            item
            xs={12}
            md={8}
            sx={{
              p: { xs: 2, sm: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto', // Allow scrolling if content overflows
              height: '100%', // Take full height of its container
            }}
          >
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={onBack}
                  sx={{ mr: 1 }}
                  aria-label="Back to login"
                  disabled={loading}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 500 }}>
                  Create Account
                </Typography>
              </Box>

              {activeStep > 0 && (
                <Button
                  variant="text"
                  onClick={handleReset}
                  sx={{ textTransform: 'none' }}
                  disabled={loading}
                >
                  Start over
                </Button>
              )}
            </Box>

            {/* Display general error message if any */}
            {errors.general && (
              <Box sx={{
                mb: 3, p: 2, borderRadius: 1,
                bgcolor: 'error.light', color: 'error.dark',
                border: '1px solid', borderColor: 'error.main',
                flexShrink: 0
              }}>
                <Typography variant="body2">{errors.general}</Typography>
              </Box>
            )}

            {/* Steps display */}
            {!isMobile && (
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, flexShrink: 0 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}
            {isMobile && (
                <Box sx={{ width: '100%', mb: 2, flexShrink: 0 }}>
                    <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                        Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
                    </Typography>
                    <LinearProgress variant="determinate" value={(activeStep / (steps.length -1)) * 100} />
                </Box>
            )}


            {/* Main Form Content Area - Takes remaining space */}
            <Box component="div" sx={{ flexGrow: 1, overflowY: 'auto', pr: isMobile ? 0 : 1, pl: isMobile ? 0 : 1  }}> {/* Allow inner scrolling */}
              {/* *** THE FIX: Use conditional rendering instead of getStepContent *** */}
              {activeStep === 0 && (
                <UserTypeStep
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
              )}
              {activeStep === 1 && (
                <BasicInfoStep
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  handleBlur={handleBlur}
                />
              )}
              {activeStep === 2 && (
                <AccountSetupStep
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                  showPassword={showPassword}
                  showConfirmPassword={showConfirmPassword}
                  handleTogglePassword={handleTogglePassword}
                  handleToggleConfirmPassword={handleToggleConfirmPassword}
                  strengthInfo={strengthInfo}
                  passwordStrength={passwordStrength}
                />
              )}
              {activeStep === 3 && (
                <AdditionalDetailsStep
                  formData={formData}
                  handleChange={handleChange}
                  handleMultiSelectChange={handleMultiSelectChange}
                  errors={errors}
                />
              )}
              {activeStep === 4 && (
                <ReviewStep
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
              )}
            </Box>

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                startIcon={<KeyboardArrowLeftIcon />}
                sx={{
                  borderRadius: 2, textTransform: 'none', px: 3, py: 1.5,
                  visibility: activeStep === 0 ? 'hidden' : 'visible' // Keep hidden on first step
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading || !formData.agreeTerms} // Also disable if terms not agreed
                  sx={{
                    py: 1.5, px: 4, borderRadius: 2, textTransform: 'none',
                    fontSize: '1rem', fontWeight: 500, minWidth: '150px',
                    transition: 'background-color 0.3s, box-shadow 0.3s',
                    '&:hover': { boxShadow: theme.shadows[4] }
                  }}
                >
                  {loading ? <LinearProgress color="inherit" sx={{ width: '80px', borderRadius: 1 }} /> : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading}
                  endIcon={<KeyboardArrowRightIcon />}
                  sx={{
                    py: 1.5, px: 3, borderRadius: 2, textTransform: 'none',
                    fontSize: '1rem', fontWeight: 500
                  }}
                >
                  Next
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center', flexShrink: 0 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account? <Link href="#" onClick={(e) => { e.preventDefault(); if (!loading) onBack(); }} underline="hover" sx={{ fontWeight: 500 }}>Log in</Link>
              </Typography>
            </Box>
          </Grid>

          {/* Side Panel (Decorative) */}
          <Grid
            item
            md={4}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 6,
              bgcolor: 'primary.main',
              color: 'primary.contrastText', // Use contrast text color
              position: 'relative',
              overflow: 'hidden',
              height: '100vh', // Take full height
            }}
          >
            {/* Background elements */}
             <Box sx={{ position: 'absolute', width: 300, height: 300, bgcolor: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%', top: -80, right: -120, zIndex: 0 }} />
             <Box sx={{ position: 'absolute', width: 200, height: 200, bgcolor: 'rgba(255, 255, 255, 0.06)', borderRadius: '50%', bottom: 40, left: -70, zIndex: 0 }} />

            <Box sx={{ position: 'relative', zIndex: 1, animation: `${fadeIn} 1s ease-out`, width: '100%', textAlign: 'center' }}>
              <Box sx={{ mb: 6 }}>
                <Avatar
                  sx={{ width: 80, height: 80, bgcolor: 'rgba(255, 255, 255, 0.2)', m: '0 auto 16px auto' }}
                >
                  <PetsRoundedIcon sx={{ fontSize: 40, color: 'white' }} />
                </Avatar>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 300 }}>
                  EVMR System
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Smart veterinary management for modern practices.
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                   <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 2, width: 40, height: 40 }}>
                     <SecurityIcon fontSize="small" />
                   </Avatar>
                   <Box>
                     <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>Secure & Reliable</Typography>
                     <Typography variant="body2" sx={{ opacity: 0.9 }}>Data encrypted and backed up.</Typography>
                   </Box>
                 </Box>
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                   <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 2, width: 40, height: 40 }}>
                     <CloudDoneIcon fontSize="small" />
                   </Avatar>
                   <Box>
                     <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>Cloud-Based Access</Typography>
                     <Typography variant="body2" sx={{ opacity: 0.9 }}>Manage your practice anywhere.</Typography>
                   </Box>
                 </Box>
                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                   <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 2, width: 40, height: 40 }}>
                     <MedicalServicesIcon fontSize="small" />
                   </Avatar>
                   <Box>
                     <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>Designed for Vets</Typography>
                     <Typography variant="body2" sx={{ opacity: 0.9 }}>Intuitive veterinary workflows.</Typography>
                   </Box>
                 </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default SignupForm;