const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const patientController = require('../controllers/patientController');
const { authenticate, authorizeResourceAccess } = require('../middleware/auth');

// Define roles that can access different endpoints
const ALL_STAFF = ['admin', 'vet', 'technician', 'receptionist'];
const MEDICAL_STAFF = ['admin', 'vet', 'technician'];
const ADMIN_VET = ['admin', 'vet'];

/**
 * @route   GET /api/patients
 * @desc    Get all patients with pagination and filtering
 * @access  All staff
 */
router.get('/',
  authenticate,
  patientController.getAllPatients
);

/**
 * @route   GET /api/patients/:id
 * @desc    Get a specific patient
 * @access  All staff
 */
router.get('/:id',
  authenticate,
  param('id').isString().withMessage('Patient ID must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  patientController.getPatientById
);

/**
 * @route   POST /api/patients
 * @desc    Create a new patient
 * @access  All staff
 */
router.post('/',
  authenticate,
  [
    body('name').isString().withMessage('Name must be a string'),
    body('species').isString().withMessage('Species must be a string'),
    body('owner').isObject().withMessage('Owner must be an object')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  patientController.createPatient
);

/**
 * @route   PUT /api/patients/:id
 * @desc    Update a patient
 * @access  All staff
 */
router.put('/:id',
  authenticate,
  param('id').isString().withMessage('Patient ID must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  patientController.updatePatient
);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Delete a patient
 * @access  Admin and Vet only
 */
router.delete('/:id',
  authenticate,
  param('id').isString().withMessage('Patient ID must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Only allow admins and vets to delete
    if (!['admin', 'vet'].includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  },
  patientController.deletePatient
);

/**
 * @route   GET /api/patients/:id/history
 * @desc    Get patient medical history
 * @access  Medical staff
 */
router.get('/:id/history',
  authenticate,
  param('id').isString().withMessage('Patient ID must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Only allow medical staff to view history
    if (!['admin', 'vet', 'technician'].includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  },
  patientController.getPatientHistory
);

module.exports = router;