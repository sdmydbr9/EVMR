const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Login route
router.post('/login', login);

// Verify token route (requires authentication)
router.get('/verify', authenticate, verifyToken);

module.exports = router; 