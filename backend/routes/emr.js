const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticate, authorizeResourceAccess } = require('../middleware/auth');
const medicalRecordController = require('../controllers/medicalRecordController');

/**
 * @route   GET /api/emr/records
 * @desc    Get all medical records with filtering
 * @access  Authenticated users (data filtered by user ID for privacy)
 */
router.get('/records',
  authenticate,
  medicalRecordController.getAllMedicalRecords
);

/**
 * @route   GET /api/emr/records/:id
 * @desc    Get a specific medical record
 * @access  Authenticated users (with ownership check)
 */
router.get('/records/:id',
  authenticate,
  param('id').isInt().withMessage('Record ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  medicalRecordController.getMedicalRecordById
);

/**
 * @route   POST /api/emr/records
 * @desc    Create a new medical record
 * @access  Authenticated users
 */
router.post('/records',
  authenticate,
  [
    body('patientId').isInt().withMessage('Patient ID must be an integer'),
    body('recordType').isString().withMessage('Record type must be a string'),
    body('visitDate').optional().isISO8601().withMessage('Visit date must be a valid date')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  medicalRecordController.createMedicalRecord
);

/**
 * @route   PUT /api/emr/records/:id
 * @desc    Update a medical record
 * @access  Authenticated users (with ownership check)
 */
router.put('/records/:id',
  authenticate,
  param('id').isInt().withMessage('Record ID must be an integer'),
  [
    body('recordType').optional().isString().withMessage('Record type must be a string'),
    body('visitDate').optional().isISO8601().withMessage('Visit date must be a valid date')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  medicalRecordController.updateMedicalRecord
);

/**
 * @route   DELETE /api/emr/records/:id
 * @desc    Delete a medical record
 * @access  Authenticated users (with ownership check)
 */
router.delete('/records/:id',
  authenticate,
  param('id').isInt().withMessage('Record ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  medicalRecordController.deleteMedicalRecord
);

// Get all medical records for a patient
router.get('/patient/:patientId',
  authenticate,
  authorizeResourceAccess,
  param('patientId').isInt().withMessage('Patient ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  (req, res) => {
    // Include the patient ID in the query params and call getAllMedicalRecords
    req.query.patientId = req.params.patientId;
    medicalRecordController.getAllMedicalRecords(req, res);
  }
);

module.exports = router; 