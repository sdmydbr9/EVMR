const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/signupController');

// Register new user
router.post('/register', registerUser);

module.exports = router; 