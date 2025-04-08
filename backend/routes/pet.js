const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../db');

// Get pet's vaccinations
router.get('/:petId/vaccinations', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const result = await db.query(
      'SELECT * FROM vaccinations WHERE pet_id = $1 ORDER BY date_administered DESC',
      [petId]
    );
    res.json({ vaccinations: result.rows });
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add vaccination record
router.post('/:petId/vaccinations', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const { vaccineName, dateAdministered, nextDueDate, notes } = req.body;
    
    const result = await db.query(
      `INSERT INTO vaccinations (pet_id, vaccine_name, date_administered, next_due_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [petId, vaccineName, dateAdministered, nextDueDate, notes]
    );
    
    res.json({ vaccination: result.rows[0] });
  } catch (error) {
    console.error('Error adding vaccination:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pet's deworming records
router.get('/:petId/deworming', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const result = await db.query(
      'SELECT * FROM deworming WHERE pet_id = $1 ORDER BY date_given DESC',
      [petId]
    );
    res.json({ deworming: result.rows });
  } catch (error) {
    console.error('Error fetching deworming records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add deworming record
router.post('/:petId/deworming', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const { medicineName, dateGiven, notes } = req.body;
    
    const result = await db.query(
      `INSERT INTO deworming (pet_id, medicine_name, date_given, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [petId, medicineName, dateGiven, notes]
    );
    
    res.json({ deworming: result.rows[0] });
  } catch (error) {
    console.error('Error adding deworming record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pet's grooming records
router.get('/:petId/grooming', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const result = await db.query(
      'SELECT * FROM grooming WHERE pet_id = $1 ORDER BY date DESC',
      [petId]
    );
    res.json({ grooming: result.rows });
  } catch (error) {
    console.error('Error fetching grooming records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add grooming record
router.post('/:petId/grooming', authenticateToken, async (req, res) => {
  try {
    const { petId } = req.params;
    const { serviceType, date, notes } = req.body;
    
    const result = await db.query(
      `INSERT INTO grooming (pet_id, service_type, date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [petId, serviceType, date, notes]
    );
    
    res.json({ grooming: result.rows[0] });
  } catch (error) {
    console.error('Error adding grooming record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 