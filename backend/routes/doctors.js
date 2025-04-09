const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const doctorController = require('../controllers/doctorController');
const { authorize } = require('../middleware/auth');

// Define roles that can access different endpoints
const ALL_STAFF = ['admin', 'vet', 'technician', 'receptionist'];
const MEDICAL_STAFF = ['admin', 'vet', 'technician'];
const ADMIN_VET = ['admin', 'vet'];

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 * @access  All staff
 */
router.get('/', 
  authorize(ALL_STAFF),
  doctorController.getAllDoctors
);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get a specific doctor
 * @access  All staff
 */
router.get('/:id',
  authorize(ALL_STAFF),
  param('id').isInt().withMessage('Doctor ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  doctorController.getDoctorById
);

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor
 * @access  Admin and vets only
 */
router.post('/',
  authorize(ADMIN_VET),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('status').isIn(['active', 'inactive', 'on-leave']).withMessage('Invalid status')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  doctorController.createDoctor
);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update a doctor
 * @access  Admin and vets only
 */
router.put('/:id',
  authorize(ADMIN_VET),
  param('id').isInt().withMessage('Doctor ID must be an integer'),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
    body('status').optional().isIn(['active', 'inactive', 'on-leave']).withMessage('Invalid status')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  doctorController.updateDoctor
);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete a doctor
 * @access  Admin only
 */
router.delete('/:id',
  authorize(['admin']),
  param('id').isInt().withMessage('Doctor ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  doctorController.deleteDoctor
);

module.exports = router; 