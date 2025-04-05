const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { Pool } = require('pg');
const { initDatabase } = require('./config/database');

// Import routes
const patientRoutes = require('./routes/patients');
const emrRoutes = require('./routes/emr');
const appointmentRoutes = require('./routes/appointments');
const inventoryRoutes = require('./routes/inventory');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

// Import middleware
const { authenticate } = require('./middleware/auth');

// Load environment variables
const PORT = process.env.PORT || 3786;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express app
const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database tables
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API endpoints
app.use('/api/patients', authenticate, patientRoutes);
app.use('/api/emr', authenticate, emrRoutes);
app.use('/api/appointments', authenticate, appointmentRoutes);
app.use('/api/inventory', authenticate, inventoryRoutes);
app.use('/api/reports', authenticate, reportRoutes);
app.use('/api/users', userRoutes); // Authentication handled within user routes

// Serve React app for any other route
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

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`EVMR Server running on port ${PORT} in ${NODE_ENV} mode`);
});

module.exports = app; 