import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Paper,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Zoom,
  IconButton,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Pets as PetsIcon,
  Event as EventIcon,
  Healing as HealingIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ArrowForward as ArrowForwardIcon,
  Menu as MenuIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const pricingRef = useRef(null);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const handleSignup = () => {
    navigate('/login', { state: { showSignup: true } });
  };
  
  // Features content
  const features = [
    {
      title: "Patient Management",
      description: "Create comprehensive pet profiles with medical history, allergies, vaccinations, and more. Set reminders for follow-up care and track patient progress over time.",
      icon: <PetsIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      image: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Smart Scheduling",
      description: "Our intuitive calendar system makes appointment management effortless. Reduce no-shows with automated reminders and optimize doctor schedules.",
      icon: <EventIcon sx={{ fontSize: 60, color: "#FF9500" }} />,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Medical Records",
      description: "Maintain detailed digital records of treatments, medications, lab results, and diagnoses. Access patient data instantly from anywhere.",
      icon: <HealingIcon sx={{ fontSize: 60, color: "#FF2D55" }} />,
      image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Inventory Control",
      description: "Track medications, supplies, and equipment with smart inventory management. Get alerts for low stock and optimize reordering.",
      icon: <InventoryIcon sx={{ fontSize: 60, color: "#34C759" }} />,
      image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Analytics & Reports",
      description: "Gain valuable insights with comprehensive reporting tools. Monitor business performance, track revenue trends, and identify growth opportunities.",
      icon: <AssessmentIcon sx={{ fontSize: 60, color: "#5856D6" }} />,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Secure & Compliant",
      description: "Rest easy knowing your data is protected with industry-standard encryption and role-based access control. Fully compliant with veterinary regulations.",
      icon: <SecurityIcon sx={{ fontSize: 60, color: "#007AFF" }} />,
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];
  
  // Testimonials
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Veterinarian, Happy Paws Clinic",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "VetSphere has transformed how we manage our practice. The time we save on paperwork means more time with our animal patients."
    },
    {
      name: "Mark Peterson",
      role: "Pet Parent",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "I love having all my pets' records in one place. Scheduling appointments and getting reminders makes pet care so much easier."
    },
    {
      name: "Olivia Chen",
      role: "Clinic Manager, Metro Vet Hospital",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      quote: "The analytics tools have helped us optimize our operations and grow our practice by 30% in just one year."
    }
  ];
  
  // Pricing plans
  const plans = [
    {
      title: "Basic",
      price: "$49",
      period: "per month",
      features: [
        "Up to 3 veterinarians",
        "Basic appointment scheduling",
        "Digital medical records",
        "Patient management",
        "Email support"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      title: "Professional",
      price: "$99",
      period: "per month",
      features: [
        "Up to 10 veterinarians",
        "Advanced scheduling system",
        "Complete medical records",
        "Inventory management",
        "Basic reports & analytics",
        "Priority support"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      title: "Enterprise",
      price: "Custom",
      period: "pricing",
      features: [
        "Unlimited veterinarians",
        "Multi-location support",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 phone & email support"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];
  
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Navigation */}
      <AppBar 
        position="fixed" 
        color="transparent" 
        elevation={0}
        sx={{ 
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography
              variant="h5"
              component="a"
              href="/"
              sx={{
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: theme.palette.primary.main,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box 
                component="img" 
                src="/assets/images/logos/black_transparent.png" 
                alt="VetSphere logo" 
                sx={{ 
                  height: 40, 
                  width: 'auto', 
                  mr: 1 
                }} 
              />
              VetSphere
            </Typography>
            
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open menu"
                edge="start"
                onClick={() => setNavOpen(!navOpen)}
                sx={{ color: theme.palette.text.primary }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Button color="inherit" onClick={() => scrollTo(featuresRef)}>
                  Features
                </Button>
                <Button color="inherit" onClick={() => scrollTo(testimonialsRef)}>
                  Testimonials
                </Button>
                <Button color="inherit" onClick={() => scrollTo(pricingRef)}>
                  Pricing
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<LoginIcon />}
                  onClick={handleLogin}
                  sx={{ ml: 2 }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleSignup}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile menu */}
      {isMobile && navOpen && (
        <Box sx={{
          position: 'fixed',
          top: 64,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          zIndex: 1100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Button fullWidth color="inherit" onClick={() => {
            scrollTo(featuresRef);
            setNavOpen(false);
          }}>
            Features
          </Button>
          <Button fullWidth color="inherit" onClick={() => {
            scrollTo(testimonialsRef);
            setNavOpen(false);
          }}>
            Testimonials
          </Button>
          <Button fullWidth color="inherit" onClick={() => {
            scrollTo(pricingRef);
            setNavOpen(false);
          }}>
            Pricing
          </Button>
          <Divider sx={{ my: 1 }} />
          <Button 
            fullWidth
            variant="outlined" 
            color="primary" 
            startIcon={<LoginIcon />}
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button 
            fullWidth
            variant="contained" 
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </Box>
      )}
      
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.light}22, ${theme.palette.primary.main}33)`,
          pt: { xs: 12, md: 20 },
          pb: { xs: 10, md: 15 },
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Modern Veterinary Management Solution
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="textSecondary" 
                    paragraph
                    sx={{ mb: 4, maxWidth: 500 }}
                  >
                    Beyond Records, Beyond Care. Streamline your veterinary practice with our comprehensive management system designed for vets, by vets.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleSignup}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 20px ${theme.palette.primary.main}33`
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="large"
                      onClick={() => scrollTo(featuresRef)}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 600
                      }}
                    >
                      Explore Features
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in={true} timeout={1500} style={{ transitionDelay: '500ms' }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                  alt="Veterinarian with dog"
                  sx={{
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg) scale(1.02)'
                    }
                  }}
                />
              </Zoom>
            </Grid>
          </Grid>
          
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: { xs: 8, md: 15 },
              opacity: 0.7
            }}
          >
            <IconButton 
              onClick={() => scrollTo(featuresRef)}
              sx={{ 
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0)'
                  },
                  '40%': {
                    transform: 'translateY(-20px)'
                  },
                  '60%': {
                    transform: 'translateY(-10px)'
                  }
                }
              }}
            >
              <KeyboardArrowDownIcon fontSize="large" />
            </IconButton>
          </Box>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box 
        ref={featuresRef}
        sx={{ py: { xs: 8, md: 15 } }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h6"
              component="p"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Features
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Everything You Need to Run Your Practice
            </Typography>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Our comprehensive platform offers tools designed specifically for veterinary practices.
            </Typography>
          </Box>
          
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height={300}
                  image={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  sx={{ borderRadius: 2, mb: 2 }}
                />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {features[activeFeature].icon}
                  </Box>
                  <Typography variant="h4" component="h3" gutterBottom>
                    {features[activeFeature].title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {features[activeFeature].description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      onClick={() => setActiveFeature(index)}
                      sx={{ 
                        cursor: 'pointer',
                        height: '100%',
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: activeFeature === index ? `${theme.palette.primary.main}11` : 'transparent',
                        border: activeFeature === index 
                          ? `2px solid ${theme.palette.primary.main}` 
                          : `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s ease',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: activeFeature === index 
                            ? `${theme.palette.primary.main}11` 
                            : `${theme.palette.background.default}`,
                          borderColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ 
                          mr: 1.5, 
                          color: activeFeature === index ? theme.palette.primary.main : 'inherit',
                          transition: 'transform 0.2s ease',
                          transform: activeFeature === index ? 'scale(1.2)' : 'scale(1)'
                        }}>
                          {React.cloneElement(feature.icon, { sx: { fontSize: 36 } })}
                        </Box>
                        <Typography 
                          variant="h6" 
                          component="h3"
                          sx={{ 
                            fontWeight: activeFeature === index ? 700 : 600,
                            color: activeFeature === index ? theme.palette.primary.main : 'inherit'
                          }}
                        >
                          {feature.title}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box
        ref={testimonialsRef}
        sx={{
          py: { xs: 8, md: 15 },
          backgroundColor: theme.palette.background.default
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h6"
              component="p"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Testimonials
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Trusted by Veterinarians & Pet Parents
            </Typography>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Hear from the professionals and pet parents who use our platform every day.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={true} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      paragraph
                      sx={{ 
                        mb: 3, 
                        fontStyle: 'italic',
                        fontSize: '1.1rem',
                        flex: 1
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6" component="h3">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Pricing Section */}
      <Box
        ref={pricingRef}
        sx={{ py: { xs: 8, md: 15 } }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h6"
              component="p"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Pricing
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Choose the Perfect Plan for Your Practice
            </Typography>
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ maxWidth: 700, mx: 'auto' }}
            >
              Flexible pricing options designed to scale with your practice. All plans include a 14-day free trial.
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Grow in={true} timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Paper
                    elevation={plan.highlighted ? 8 : 0}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      border: plan.highlighted 
                        ? 'none' 
                        : `1px solid ${theme.palette.divider}`,
                      transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                      zIndex: plan.highlighted ? 2 : 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: plan.highlighted ? 'scale(1.08)' : 'scale(1.03)',
                        boxShadow: plan.highlighted 
                          ? '0 15px 35px rgba(0,0,0,0.1)' 
                          : '0 10px 25px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    {plan.highlighted && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: -30,
                          transform: 'rotate(45deg)',
                          backgroundColor: theme.palette.secondary.main,
                          color: 'white',
                          py: 0.5,
                          px: 4,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        POPULAR
                      </Box>
                    )}
                    
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {plan.title}
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="h3" 
                        component="p" 
                        sx={{ 
                          fontWeight: 800,
                          display: 'inline-block'
                        }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography 
                        variant="subtitle1" 
                        component="span" 
                        color="textSecondary"
                      >
                        /{plan.period}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ mb: 4, flex: 1 }}>
                      {plan.features.map((feature, i) => (
                        <Box 
                          key={i} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            mb: 1.5 
                          }}
                        >
                          <Box 
                            sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%', 
                              backgroundColor: plan.highlighted 
                                ? theme.palette.primary.main 
                                : theme.palette.success.main,
                              mr: 2 
                            }}
                          />
                          <Typography variant="body1">
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    
                    <Button
                      variant={plan.highlighted ? "contained" : "outlined"}
                      color={plan.highlighted ? "primary" : "primary"}
                      size="large"
                      fullWidth
                      onClick={handleSignup}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </Paper>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            top: -100,
            left: -100
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            bottom: -50,
            right: '10%'
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Ready to Transform Your Veterinary Practice?
            </Typography>
            <Typography
              variant="h6"
              paragraph
              sx={{ mb: 5, opacity: 0.9, maxWidth: 700, mx: 'auto' }}
            >
              Join thousands of veterinary professionals who have streamlined their practice with our comprehensive management platform.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleSignup}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backgroundColor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleLogin}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Schedule Demo
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box
        sx={{
          py: 6,
          backgroundColor: theme.palette.background.default,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <PetsIcon sx={{ mr: 1, fontSize: 30, color: theme.palette.primary.main }} />
                <Typography
                  variant="h5"
                  component="a"
                  href="/"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    textDecoration: 'none'
                  }}
                >
                  EVMR
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mb: 2 }}
              >
                Modern Veterinary Management Solution designed to streamline your practice operations.
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
              >
                © {new Date().getFullYear()} EVMR. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Platform
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Features
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Pricing
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Security
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Integrations
                </Button>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Documentation
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Knowledge Base
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Blog
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  FAQs
                </Button>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Company
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  About Us
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Careers
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Contact
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Partners
                </Button>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Privacy Policy
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Terms of Service
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Compliance
                </Button>
                <Button color="inherit" sx={{ justifyContent: 'flex-start', p: 0 }}>
                  Cookie Policy
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 