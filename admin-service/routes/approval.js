const express = require('express');
const router = express.Router();
const { 
  getPendingRegistrations,
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
  receiveRegistrationData,
  getApprovedRegistrations,
  getRejectedRegistrations
} = require('../controllers/approvalController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes except the registrations endpoint
router.use(function(req, res, next) {
  if (req.path === '/registrations' && req.method === 'POST') {
    return next();
  }
  authenticate(req, res, next);
});

// Get all pending registrations
router.get('/pending', getPendingRegistrations);

// Get all approved registrations
router.get('/approved', getApprovedRegistrations);

// Get all rejected registrations
router.get('/rejected', getRejectedRegistrations);

// Get single registration by ID
router.get('/:id', getRegistrationById);

// Approve registration
router.post('/:id/approve', approveRegistration);

// Reject registration
router.post('/:id/reject', rejectRegistration);

// Receive registration data from backend service
router.post('/registrations', receiveRegistrationData);

module.exports = router; 