const express = require('express');
const router = express.Router();
const { registerUser, checkExistingCredential } = require('../controllers/signupController');

// Register new user
router.post('/register', registerUser);

// Check if email or phone number already exists
router.post('/check-existing', checkExistingCredential);

module.exports = router; 