const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const patientController = require('../controllers/patientController');
const { authorize } = require('../middleware/auth');

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
  authorize(ALL_STAFF),
  patientController.getAllPatients
);

/**
 * @route   GET /api/patients/:id
 * @desc    Get a specific patient
 * @access  All staff
 */
router.get('/:id',
  authorize(ALL_STAFF),
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
 * @access  Medical staff and receptionists
 */
router.post('/',
  authorize(ALL_STAFF),
  [
    body('name').notEmpty().withMessage('Pet name is required'),
    body('species').notEmpty().withMessage('Species is required'),
    body('breed').optional(),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').isIn(['male', 'female', 'unknown']).withMessage('Gender must be male, female, or unknown'),
    body('color').optional(),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('microchipId').optional(),
    body('owner').notEmpty().withMessage('Owner information is required'),
    body('owner.name').notEmpty().withMessage('Owner name is required'),
    body('owner.phone').notEmpty().withMessage('Owner phone is required'),
    body('owner.email').optional().isEmail().withMessage('Invalid email format'),
    body('owner.address').optional()
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
 * @access  Medical staff and receptionists
 */
router.put('/:id',
  authorize(ALL_STAFF),
  param('id').isString().withMessage('Patient ID must be a string'),
  [
    body('name').optional().notEmpty().withMessage('Pet name cannot be empty'),
    body('species').optional().notEmpty().withMessage('Species cannot be empty'),
    body('breed').optional(),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('gender').optional().isIn(['male', 'female', 'unknown']).withMessage('Gender must be male, female, or unknown'),
    body('color').optional(),
    body('weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('microchipId').optional(),
    body('owner').optional(),
    body('owner.name').optional().notEmpty().withMessage('Owner name cannot be empty'),
    body('owner.phone').optional().notEmpty().withMessage('Owner phone cannot be empty'),
    body('owner.email').optional().isEmail().withMessage('Invalid email format'),
    body('owner.address').optional()
  ],
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
 * @access  Admins only
 */
router.delete('/:id',
  authorize(['admin']),
  param('id').isString().withMessage('Patient ID must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
  authorize(MEDICAL_STAFF),
  param('id').isString().withMessage('Patient ID must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  patientController.getPatientHistory
);

module.exports = router;