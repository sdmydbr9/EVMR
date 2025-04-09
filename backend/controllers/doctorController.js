const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Get all doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctors ORDER BY name');
    res.json({ doctors: result.rows });
  } catch (err) {
    console.error('Error getting doctors:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving doctors' 
    });
  }
};

/**
 * Get a single doctor by ID
 */
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Doctor not found' 
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting doctor:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving the doctor' 
    });
  }
};

/**
 * Create a new doctor
 */
const createDoctor = async (req, res) => {
  try {
    const { name, specialization, email, phone, status } = req.body;
    
    const result = await pool.query(
      `INSERT INTO doctors (name, specialization, email, phone, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, specialization, email, phone, status]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating doctor:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while creating the doctor' 
    });
  }
};

/**
 * Update a doctor
 */
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, email, phone, status } = req.body;
    
    const result = await pool.query(
      `UPDATE doctors 
       SET name = $1, specialization = $2, email = $3, phone = $4, status = $5
       WHERE id = $6
       RETURNING *`,
      [name, specialization, email, phone, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Doctor not found' 
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while updating the doctor' 
    });
  }
};

/**
 * Delete a doctor
 */
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM doctors WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Doctor not found' 
      });
    }
    
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while deleting the doctor' 
    });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
}; 