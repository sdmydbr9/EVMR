import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Divider,
  Fade,
  Slide,
  Grow,
  useTheme,
  Link,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  Lock as LockIcon,
  Pets as PetsIcon,
  Event as EventIcon,
  Healing as HealingIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Circle as CircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { authService } from '../services/api';
import SignupForm from './SignupForm';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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

const Login = ({ onLogin }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  
  // New states for user type selection
  const [userType, setUserType] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [id, setId] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  
  // Features carousel
  const features = [
    {
      title: "Patient Management",
      description: "Easily manage pet records with detailed profiles and medical histories",
      icon: <PetsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
    },
    {
      title: "Smart Scheduling",
      description: "Efficiently organize appointments with our intuitive calendar system",
      icon: <EventIcon sx={{ fontSize: 40, color: "#FF9500" }} />
    },
    {
      title: "Medical Records",
      description: "Document treatments, medications, and health status in one secure place",
      icon: <HealingIcon sx={{ fontSize: 40, color: "#FF2D55" }} />
    },
    {
      title: "Inventory Control",
      description: "Track medications and supplies with automatic reorder notifications",
      icon: <InventoryIcon sx={{ fontSize: 40, color: "#34C759" }} />
    },
    {
      title: "Analytics & Reports",
      description: "Generate detailed reports to optimize your veterinary practice",
      icon: <AssessmentIcon sx={{ fontSize: 40, color: "#5856D6" }} />
    },
    {
      title: "Secure & Compliant",
      description: "Industry-standard encryption and role-based access control",
      icon: <SecurityIcon sx={{ fontSize: 40, color: "#007AFF" }} />
    }
  ];

  // Cycle through features automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    let formValid = true;
    
    // Email/ID validation based on user type
    if (userType === 'pet_parent') {
      if (!email) {
        setError('Email address is required');
        formValid = false;
      }
    } else if (userType === 'veterinarian') {
      if (!id) {
        setError('ID is required');
        formValid = false;
      }
      if (!email) {
        setError('Email address is required');
        formValid = false;
      }
    } else if (userType === 'institute_admin') {
      if (!organisationId) {
        setError('Organisation ID is required');
        formValid = false;
      }
      if (!email) {
        setError('Email address is required');
        formValid = false;
      }
    }
    
    // Password validation
    if (!password) {
      setError('Password is required');
      formValid = false;
    }

    if (!formValid) {
      setLoading(false);
      return;
    }

    try {
      // Send authentication request to API with user type
      const loginData = {
        email,
        password,
        rememberMe,
        userType
      };
      
      // Add conditional fields based on user type
      if (userType === 'veterinarian') {
        loginData.id = id;
      } else if (userType === 'institute_admin') {
        loginData.organisationId = organisationId;
      }
      
      const response = await authService.login(loginData);
      
      if (response && response.token) {
        // Store user info securely
        if (rememberMe) {
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userType', userType);
        } else {
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userType');
        }
        
        // Inform parent component about successful login
        onLogin(response.token);
      } else {
        setError('Invalid login response from server');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please try again.');
      } else if (err.response?.status === 404) {
        setError('Authentication service not available. Please try again later.');
      } else {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Move to the next step
  const handleNext = () => {
    if (currentStep === 0 && !userType) {
      setError('Please select a user type');
      return;
    }
    setError('');
    setCurrentStep(currentStep + 1);
  };

  // Move to the previous step
  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  // Check for saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    const savedUserType = localStorage.getItem('userType');
    
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    if (savedUserType) {
      setUserType(savedUserType);
    }
  }, []);

  // Show signup form
  const handleShowSignup = (e) => {
    e.preventDefault();
    setShowSignup(true);
  };

  // Hide signup form
  const handleHideSignup = () => {
    setShowSignup(false);
  };

  if (showSignup) {
    return <SignupForm onBack={handleHideSignup} />;
  }

  // User Type Selection Step
  const renderUserTypeStep = () => (
    <Box sx={{ animation: `${slideUp} 1s ease-out` }}>
      <Typography component="h1" variant="h3" sx={{ mb: 1, fontWeight: 300 }}>
        Welcome to EVMR
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, color: 'text.secondary' }}>
        Please select your user type to continue
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1, mb: 2, width: '100%', borderRadius: 2, animation: `${slideUp} 0.3s ease-out` }}>
          {error}
        </Alert>
      )}
      
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="user-type-label">User Type</InputLabel>
        <Select
          labelId="user-type-label"
          id="user-type"
          value={userType}
          label="User Type"
          onChange={(e) => setUserType(e.target.value)}
          sx={{ 
            borderRadius: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2 }
          }}
        >
          <MenuItem value="pet_parent">Pet Parent</MenuItem>
          <MenuItem value="veterinarian">Veterinarian</MenuItem>
          <MenuItem value="institute_admin">Institute Admin</MenuItem>
        </Select>
      </FormControl>
      
      <Button
        fullWidth
        variant="contained"
        onClick={handleNext}
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 10px ${theme.palette.primary.main}40`,
          },
        }}
      >
        Continue
      </Button>
      
      <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          Need an account? <Link href="#" underline="hover" onClick={handleShowSignup} sx={{ fontWeight: 500, color: theme.palette.primary.main }}>Contact administrator</Link>
        </Typography>
      </Box>
    </Box>
  );

  // Login Fields Step - changes based on user type
  const renderLoginFieldsStep = () => (
    <Box sx={{ animation: `${slideUp} 1s ease-out` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={handleBack}
          sx={{ mr: 1 }}
          aria-label="back to user type selection"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 300 }}>
          Sign In
        </Typography>
      </Box>
      
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, color: 'text.secondary' }}>
        {userType === 'pet_parent' 
          ? 'Welcome, Pet Parent!' 
          : userType === 'veterinarian'
            ? 'Welcome, Veterinarian!'
            : 'Welcome, Institute Admin!'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1, mb: 2, width: '100%', borderRadius: 2, animation: `${slideUp} 0.3s ease-out` }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        {/* Conditional fields based on user type */}
        {userType === 'veterinarian' && (
          <TextField
            margin="normal"
            required
            fullWidth
            id="id"
            label="ID"
            name="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            variant="outlined"
            autoFocus
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        )}
        
        {userType === 'institute_admin' && (
          <TextField
            margin="normal"
            required
            fullWidth
            id="organisationId"
            label="Organisation ID"
            name="organisationId"
            value={organisationId}
            onChange={(e) => setOrganisationId(e.target.value)}
            variant="outlined"
            autoFocus
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        )}
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus={userType === 'pet_parent'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControlLabel 
            control={
              <Checkbox 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                color="primary"
              />
            } 
            label="Remember me" 
          />
          <Link href="#" underline="hover" sx={{ color: theme.palette.primary.main }}>
            Forgot password?
          </Link>
        </Box>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 10px ${theme.palette.primary.main}40`,
            },
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Need an account? <Link href="#" underline="hover" onClick={handleShowSignup} sx={{ fontWeight: 500, color: theme.palette.primary.main }}>Contact administrator</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        width: '100vw',
        maxWidth: '100%',
        overflow: 'hidden',
        backgroundColor: theme.palette.grey[50]
      }}
    >
      {/* Left Side - Login Form */}
      <Grid container sx={{ minHeight: '100vh', width: '100%' }}>
        <Grid 
          item 
          xs={12} 
          md={5} 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: { xs: 2, md: 6 },
            backgroundColor: 'white',
            position: 'relative',
            zIndex: 1,
            boxShadow: { xs: 'none', md: '0 0 40px rgba(0, 0, 0, 0.1)' }
          }}
        >
          <Slide direction="down" in={true} timeout={800}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mb: 6,
                animation: `${fadeIn} 1s ease-out`
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                  animation: `${pulse} 2s infinite ease-in-out`
                }}
              >
                <LockIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 500 }}>
                EVMR System
              </Typography>
            </Box>
          </Slide>
          
          <Fade in={true} timeout={1000}>
            {currentStep === 0 ? renderUserTypeStep() : renderLoginFieldsStep()}
          </Fade>
        </Grid>
        
        {/* Right Side - Information and Features */}
        <Grid 
          item 
          xs={12} 
          md={7} 
          sx={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            display: { xs: 'none', md: 'flex' }, 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decorative circles */}
          <Box sx={{ 
            position: 'absolute', 
            width: '300px', 
            height: '300px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            top: '-100px',
            right: '-100px',
            zIndex: 0
          }} />
          <Box sx={{ 
            position: 'absolute', 
            width: '200px', 
            height: '200px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            bottom: '50px',
            left: '-50px',
            zIndex: 0
          }} />
          
          <Box sx={{ 
            maxWidth: '600px', 
            width: '100%', 
            zIndex: 1, 
            textAlign: 'center',
            p: 4,
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Grow in={true} timeout={1000}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 300, mb: 3 }}>
                Electronic Veterinary Medical Records
              </Typography>
            </Grow>
            
            <Grow in={true} timeout={1500}>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 5, fontWeight: 400 }}>
                A complete solution for modern veterinary practices
              </Typography>
            </Grow>
            
            {/* Features carousel */}
            <Box sx={{ height: '220px', position: 'relative', mb: 4 }}>
              {features.map((feature, index) => (
                <Fade 
                  key={index} 
                  in={activeFeature === index} 
                  timeout={{ enter: 800, exit: 400 }}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: activeFeature === index ? 'block' : 'none'
                  }}
                >
                  <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    textAlign: 'center'
                  }}>
                    <Box sx={{ 
                      mb: 2,
                      animation: activeFeature === index ? `${pulse} 2s infinite ease-in-out` : 'none',
                      transform: 'scale(1)',
                      transformOrigin: 'center'
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Fade>
              ))}
            </Box>
            
            {/* Indicator dots */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
              {features.map((_, index) => (
                <Box 
                  key={index} 
                  component="button" 
                  onClick={() => setActiveFeature(index)}
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    backgroundColor: activeFeature === index ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: activeFeature === index ? 'scale(1.2)' : 'scale(1)',
                    '&:hover': {
                      backgroundColor: activeFeature === index ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.3)',
                    }
                  }} 
                />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login; 