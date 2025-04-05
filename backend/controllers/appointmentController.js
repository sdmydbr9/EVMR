const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const appointmentController = {
  // Get all appointments with optional filters
  getAllAppointments: async (req, res) => {
    try {
      const { date, vetId, patientId, status } = req.query;
      let query = `
        SELECT 
          a.*,
          p.name as patient_name,
          p.species,
          u.name as vet_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.vet_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (date) {
        query += ` AND DATE(a.start_time) = $${paramCount}`;
        params.push(date);
        paramCount++;
      }

      if (vetId) {
        query += ` AND a.vet_id = $${paramCount}`;
        params.push(vetId);
        paramCount++;
      }

      if (patientId) {
        query += ` AND a.patient_id = $${paramCount}`;
        params.push(patientId);
        paramCount++;
      }

      if (status) {
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      query += ` ORDER BY a.start_time ASC`;

      const result = await pool.query(query, params);
      res.json({ appointments: result.rows });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a specific appointment
  getAppointmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const query = `
        SELECT 
          a.*,
          p.name as patient_name,
          p.species,
          u.name as vet_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        LEFT JOIN users u ON a.vet_id = u.id
        WHERE a.id = $1
      `;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new appointment
  createAppointment: async (req, res) => {
    try {
      const {
        patientId,
        date,
        time,
        duration,
        type,
        notes,
        status,
        vetId
      } = req.body;

      // Convert date and time to timestamp
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + duration * 60000); // Add duration in milliseconds

      const query = `
        INSERT INTO appointments (
          patient_id,
          start_time,
          end_time,
          vet_id,
          appointment_type,
          notes,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [
        patientId,
        startTime,
        endTime,
        vetId || null,
        type,
        notes,
        status || 'scheduled'
      ];

      const result = await pool.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update appointment details
  updateAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        patientId,
        date,
        time,
        duration,
        type,
        notes,
        status,
        vetId
      } = req.body;

      // Convert date and time to timestamp
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const query = `
        UPDATE appointments
        SET 
          patient_id = $1,
          start_time = $2,
          end_time = $3,
          vet_id = $4,
          appointment_type = $5,
          notes = $6,
          status = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const values = [
        patientId,
        startTime,
        endTime,
        vetId || null,
        type,
        notes,
        status,
        id
      ];

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete/cancel appointment
  deleteAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'DELETE FROM appointments WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get available time slots for scheduling
  getAvailableTimeSlots: async (req, res) => {
    try {
      const { date, vetId } = req.params;
      const query = `
        SELECT 
          generate_series(
            $1::timestamp,
            $1::timestamp + interval '1 day' - interval '1 hour',
            interval '30 minutes'
          ) as time_slot
        WHERE NOT EXISTS (
          SELECT 1 FROM appointments
          WHERE DATE(start_time) = $1::date
          AND start_time = time_slot
          AND vet_id = $2
        )
      `;
      
      const result = await pool.query(query, [date, vetId]);
      res.json({ timeSlots: result.rows.map(row => row.time_slot) });
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = appointmentController; 