const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Creates sample appointments for demo users
 * @param {number} userId - Demo user ID
 */
async function createSampleAppointmentsForDemo(userId) {
  try {
    // Get existing patients for sample data
    const patientsResult = await pool.query(`
      SELECT id FROM patients LIMIT 3
    `);
    
    if (patientsResult.rows.length === 0) {
      console.log('No patients found for sample appointments');
      return;
    }
    
    const patientIds = patientsResult.rows.map(p => p.id);
    const now = new Date();
    
    // Sample appointment data
    const sampleAppointments = [
      {
        patientId: patientIds[0] || 'DEMO001',
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0), // Tomorrow 10:00 AM
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),  // Tomorrow 10:30 AM
        type: 'check-up',
        notes: 'Annual check-up appointment',
        status: 'scheduled'
      },
      {
        patientId: patientIds[1] || 'DEMO002',
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 30), // Day after tomorrow 2:30 PM
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0),    // Day after tomorrow 3:00 PM
        type: 'vaccination',
        notes: 'Rabies vaccination due',
        status: 'confirmed'
      },
      {
        patientId: patientIds[0] || 'DEMO001',
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 9, 0),  // Last week 9:00 AM
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 9, 45),   // Last week 9:45 AM
        type: 'follow-up',
        notes: 'Post-surgery check-up',
        status: 'completed'
      }
    ];

    for (const appt of sampleAppointments) {
      await pool.query(`
        INSERT INTO appointments (
          patient_id,
          start_time,
          end_time,
          vet_id,
          appointment_type,
          notes,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          appt.patientId,
          appt.startTime,
          appt.endTime,
          userId, // Use the demo user as the vet
          appt.type,
          appt.notes,
          appt.status
        ]
      );
    }
    
    console.log(`Created ${sampleAppointments.length} sample appointments for demo user ${userId}`);
  } catch (error) {
    console.error('Error creating sample appointments for demo user:', error);
  }
}

const appointmentController = {
  // Get all appointments with optional filters
  getAllAppointments: async (req, res) => {
    try {
      const { date, vetId, patientId, status } = req.query;
      const isDemo = req.user.isDemo || false;
      const userId = req.user.id;
      
      // Different handling for demo users vs real users
      let appointments = [];
      
      if (isDemo) {
        // For demo users - check if there are already appointments
        const checkQuery = `SELECT COUNT(*) FROM appointments WHERE vet_id = $1`;
        const checkResult = await pool.query(checkQuery, [userId]);
        
        if (parseInt(checkResult.rows[0].count) === 0) {
          // Create sample appointments for demo user
          await createSampleAppointmentsForDemo(userId);
        }
      }
      
      // Construct query with proper filters
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
      
      // For real users, always filter to only show their data (data isolation)
      if (!isDemo && req.user.role === 'veterinarian') {
        query += ` AND a.vet_id = $${paramCount}`;
        params.push(userId);
        paramCount++;
      }

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