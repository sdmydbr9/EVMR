const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all schedules
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT s.*, d.name as doctor_name FROM schedules s LEFT JOIN doctors d ON s.doctor_id = d.id ORDER BY s.start_time'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get a single schedule
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT s.*, d.name as doctor_name FROM schedules s LEFT JOIN doctors d ON s.doctor_id = d.id WHERE s.id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Create a new schedule
router.post('/', async (req, res) => {
  try {
    const {
      doctor_id,
      start_time,
      end_time,
      recurrence_type,
      recurrence_interval,
      recurrence_end_date,
      notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO schedules (
        doctor_id,
        start_time,
        end_time,
        recurrence_type,
        recurrence_interval,
        recurrence_end_date,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        doctor_id,
        start_time,
        end_time,
        recurrence_type,
        recurrence_interval,
        recurrence_end_date,
        notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update a schedule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doctor_id,
      start_time,
      end_time,
      recurrence_type,
      recurrence_interval,
      recurrence_end_date,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE schedules 
       SET doctor_id = $1,
           start_time = $2,
           end_time = $3,
           recurrence_type = $4,
           recurrence_interval = $5,
           recurrence_end_date = $6,
           notes = $7
       WHERE id = $8
       RETURNING *`,
      [
        doctor_id,
        start_time,
        end_time,
        recurrence_type,
        recurrence_interval,
        recurrence_end_date,
        notes,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

module.exports = router; 