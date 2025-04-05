const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authorize } = require('../middleware/auth');

// Define roles
const MEDICAL_STAFF = ['admin', 'vet', 'technician'];

// Get a specific medical record
router.get('/:id', (req, res) => {
  res.json({ 
    message: 'EMR record endpoint placeholder',
    recordId: req.params.id
  });
});

// Get all medical records for a patient
router.get('/patient/:patientId',
  authorize(MEDICAL_STAFF),
  param('patientId').isString().withMessage('Patient ID must be a string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.json({ 
      message: 'Get all EMR records for patient placeholder',
      patientId: req.params.patientId
    });
  }
);

// Create new medical record
router.post('/',
  authorize(MEDICAL_STAFF),
  [
    body('patientId').isString().withMessage('Patient ID must be a string'),
    body('visitDate').isISO8601().withMessage('Invalid visit date format'),
    body('subjective').optional().isString(),
  ],
  (req, res) => {
    res.json({ 
      message: 'Create EMR record endpoint placeholder',
      data: req.body
    });
  }
);

// Update existing medical record
router.put('/:id',
  authorize(MEDICAL_STAFF),
  param('id').isInt().withMessage('Record ID must be an integer'),
  [
    body('patientId').optional().isString().withMessage('Patient ID must be a string'),
    body('visitDate').optional().isISO8601().withMessage('Invalid visit date format'),
    body('subjective').optional().isString(),
  ],
  (req, res) => {
    res.json({ 
      message: 'Update EMR record endpoint placeholder',
      recordId: req.params.id,
      data: req.body
    });
  }
);

// Delete medical record
router.delete('/:id', (req, res) => {
  res.json({ 
    message: 'Delete EMR record endpoint placeholder',
    recordId: req.params.id
  });
});

module.exports = router; 