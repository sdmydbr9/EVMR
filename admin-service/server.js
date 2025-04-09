const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const jwt = require('jsonwebtoken');
const compression = require('compression');

// Import routes
const approvalRoutes = require('./routes/approval');
const { query, initAdminDatabase } = require('./config/database');

// Initialize Express app
const app = express();

// Load environment variables
const PORT = process.env.ADMIN_PORT || 3789;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false
}));
app.use(morgan(process.env.LOG_FORMAT || 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    service: 'EVMR Admin Service',
    timestamp: new Date().toISOString() 
  });
});

// Login API endpoint for admins
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if user exists and is an admin
    const result = await query(
      `SELECT id, name, email, password, role 
       FROM users 
       WHERE email = $1 AND role = 'admin'`,
      [email]
    );
    
    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or insufficient permissions'
      });
    }
    
    const user = result.rows[0];
    
    // In a real app, you would verify the hashed password here
    // For simplicity in this demo, we're just checking if it matches the admin password
    // This should be replaced with proper password verification in production
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );
    
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// API routes
app.use('/api/admin/approvals', approvalRoutes);

// Welcome message (API)
app.get('/api', (req, res) => {
  res.status(200).json({
    service: 'EVMR Admin Service',
    message: 'Admin service for managing user registrations',
    status: 'Running',
    version: '1.0.0'
  });
});

// Serve the admin UI for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// Initialize the database before starting the server
(async () => {
  try {
    await initAdminDatabase();
    console.log('Database initialized successfully');
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`EVMR Admin Service running on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})(); 