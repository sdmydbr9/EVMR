const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Appointment = require('../models/appointment.model');

// Basic validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    next();
  };
};

// Validation schemas
const createAppointmentSchema = Joi.object({
  patientId: Joi.string().required(),
  veterinarianId: Joi.string().required(),
  dateTime: Joi.date().required(),
  duration: Joi.number().integer().min(15).max(240).required(),
  type: Joi.string().valid('check-up', 'vaccination', 'surgery', 'follow-up', 'emergency', 'consultation').required(),
  reason: Joi.string().required(),
  notes: Joi.string().allow('', null)
});

const updateAppointmentSchema = Joi.object({
  patientId: Joi.string(),
  veterinarianId: Joi.string(),
  dateTime: Joi.date(),
  duration: Joi.number().integer().min(15).max(240),
  status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'),
  type: Joi.string().valid('check-up', 'vaccination', 'surgery', 'follow-up', 'emergency', 'consultation'),
  reason: Joi.string(),
  notes: Joi.string().allow('', null)
});

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({ isActive: true });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new appointment
router.post('/', validateRequest(createAppointmentSchema), async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update appointment
router.put('/:id', validateRequest(updateAppointmentSchema), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel appointment
router.patch('/:id/cancel', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete appointment (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 