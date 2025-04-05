const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const { authorize } = require('../middleware/auth');

// Define roles that can access different endpoints
const ALL_STAFF = ['admin', 'vet', 'technician', 'receptionist'];
const MEDICAL_STAFF = ['admin', 'vet', 'technician'];
const ADMIN_VET = ['admin', 'vet'];

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments with optional filters
 * @access  All staff
 */
router.get('/', 
  authorize(ALL_STAFF),
  appointmentController.getAllAppointments
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a specific appointment
 * @access  All staff
 */
router.get('/:id',
  authorize(ALL_STAFF),
  param('id').isInt().withMessage('Appointment ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  appointmentController.getAppointmentById
);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  All staff
 */
router.post('/',
  authorize(ALL_STAFF),
  [
    body('patientId').isString().withMessage('Patient ID must be a string'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    body('type').isIn(['check-up', 'vaccination', 'surgery', 'emergency', 'follow-up']).withMessage('Invalid appointment type'),
    body('notes').optional(),
    body('status').optional().isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show']).withMessage('Invalid status'),
    body('vetId').optional().isInt().withMessage('Vet ID must be an integer')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  appointmentController.createAppointment
);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment
 * @access  All staff
 */
router.put('/:id',
  authorize(ALL_STAFF),
  param('id').isInt().withMessage('Appointment ID must be an integer'),
  [
    body('patientId').optional().isString().withMessage('Patient ID must be a string'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    body('type').optional().isIn(['check-up', 'vaccination', 'surgery', 'emergency', 'follow-up']).withMessage('Invalid appointment type'),
    body('notes').optional(),
    body('status').optional().isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show']).withMessage('Invalid status'),
    body('vetId').optional().isInt().withMessage('Vet ID must be an integer')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  appointmentController.updateAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete/cancel an appointment
 * @access  All staff
 */
router.delete('/:id',
  authorize(ALL_STAFF),
  param('id').isInt().withMessage('Appointment ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  appointmentController.deleteAppointment
);

/**
 * @route   GET /api/appointments/availability/:date
 * @desc    Get available time slots for scheduling
 * @access  All staff
 */
router.get('/availability/:date',
  authorize(ALL_STAFF),
  param('date').isISO8601().withMessage('Invalid date format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  appointmentController.getAvailableTimeSlots
);

module.exports = router; 