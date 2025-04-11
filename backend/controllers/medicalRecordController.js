const { pool } = require('../config/database');

/**
 * Get all medical records
 * Filters by user ID for non-admin users to ensure data privacy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMedicalRecords = async (req, res) => {
  try {
    const { patientId, recordType, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Define base query where clause and parameters
    let whereClause = '';
    const queryParams = [];
    let paramCount = 1;
    
    // First filter by user_id for non-admin users to enforce data privacy
    if (req.user.role !== 'admin') {
      whereClause = `WHERE mr.user_id = $${paramCount++}`;
      queryParams.push(req.user.id);
    } else {
      whereClause = 'WHERE 1=1';
    }
    
    // Add additional filters
    if (patientId) {
      whereClause += ` AND mr.patient_id = $${paramCount++}`;
      queryParams.push(patientId);
    }
    
    if (recordType) {
      whereClause += ` AND mr.record_type = $${paramCount++}`;
      queryParams.push(recordType);
    }
    
    if (startDate) {
      whereClause += ` AND mr.visit_date >= $${paramCount++}`;
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereClause += ` AND mr.visit_date <= $${paramCount++}`;
      queryParams.push(endDate);
    }
    
    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM medical_records mr
      ${whereClause}
    `;
    
    // Main query to get records with patient and doctor info
    const recordsQuery = `
      SELECT 
        mr.id,
        mr.visit_date,
        mr.record_type,
        mr.subjective,
        mr.objective,
        mr.assessment,
        mr.plan,
        mr.diagnosis,
        mr.medications,
        mr.follow_up_date,
        mr.created_by,
        mr.created_at,
        mr.updated_at,
        p.id AS patient_id,
        p.name AS patient_name,
        o.name AS owner_name,
        u.name AS doctor_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN owners o ON p.owner_id = o.id
      JOIN users u ON mr.created_by = u.id
      ${whereClause}
      ORDER BY mr.visit_date DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;
    
    // Add pagination parameters
    queryParams.push(parseInt(limit));
    queryParams.push(parseInt(offset));
    
    // Execute both queries
    const [countResult, recordsResult] = await Promise.all([
      pool.query(countQuery, queryParams.slice(0, -2)), // Remove pagination params for count
      pool.query(recordsQuery, queryParams)
    ]);
    
    // Format response
    const totalRecords = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRecords / limit);
    
    const records = recordsResult.rows.map(row => ({
      id: row.id,
      visitDate: row.visit_date,
      recordType: row.record_type,
      subjective: row.subjective,
      objective: row.objective,
      assessment: row.assessment,
      plan: row.plan,
      diagnosis: row.diagnosis,
      medications: row.medications,
      followUpDate: row.follow_up_date,
      patient: {
        id: row.patient_id,
        name: row.patient_name,
        ownerName: row.owner_name
      },
      doctor: {
        id: row.created_by,
        name: row.doctor_name
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    res.json({
      records,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching medical records',
      details: error.message
    });
  }
};

/**
 * Get a specific medical record by ID
 * Enforces data privacy by checking user ownership
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query to get record details
    const recordQuery = `
      SELECT 
        mr.*,
        p.name AS patient_name,
        o.name AS owner_name,
        u.name AS doctor_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN owners o ON p.owner_id = o.id
      JOIN users u ON mr.created_by = u.id
      WHERE mr.id = $1
    `;
    
    const recordResult = await pool.query(recordQuery, [id]);
    
    if (recordResult.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Medical record not found'
      });
    }
    
    const record = recordResult.rows[0];
    
    // Check if user has permission to view this record
    // Only the record owner or admins can view
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. You do not have permission to view this record'
      });
    }
    
    // Format and return the record
    res.json({
      id: record.id,
      visitDate: record.visit_date,
      recordType: record.record_type,
      subjective: record.subjective,
      objective: record.objective,
      assessment: record.assessment,
      plan: record.plan,
      diagnosis: record.diagnosis,
      medications: record.medications,
      followUpDate: record.follow_up_date,
      patient: {
        id: record.patient_id,
        name: record.patient_name,
        ownerName: record.owner_name
      },
      doctor: {
        id: record.created_by,
        name: record.doctor_name
      },
      createdAt: record.created_at,
      updatedAt: record.updated_at
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({
      error: true,
      message: 'Error fetching medical record',
      details: error.message
    });
  }
};

/**
 * Create a new medical record
 * Sets user_id automatically to ensure proper data privacy
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMedicalRecord = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      patientId,
      recordType,
      visitDate,
      subjective,
      objective,
      assessment,
      plan,
      diagnosis,
      medications,
      followUpDate
    } = req.body;
    
    // Set user_id from authenticated user to ensure data ownership
    const userId = req.user.id;
    
    // Check if patient exists
    const patientResult = await client.query(
      'SELECT id FROM patients WHERE id = $1',
      [patientId]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Patient not found'
      });
    }
    
    // Insert the medical record
    const recordQuery = `
      INSERT INTO medical_records (
        patient_id,
        record_type,
        visit_date,
        subjective,
        objective,
        assessment,
        plan,
        diagnosis,
        medications,
        follow_up_date,
        created_by,
        user_id,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    
    const recordValues = [
      patientId,
      recordType || 'consultation',
      visitDate || new Date(),
      subjective || '',
      objective || '',
      assessment || '',
      plan || '',
      diagnosis || '',
      medications || '',
      followUpDate,
      userId, // creator
      userId  // owner
    ];
    
    const recordResult = await client.query(recordQuery, recordValues);
    const recordId = recordResult.rows[0].id;
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      recordId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating medical record:', error);
    res.status(500).json({
      error: true,
      message: 'Error creating medical record',
      details: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Update an existing medical record
 * Enforces data privacy by checking user ownership
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMedicalRecord = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      recordType,
      visitDate,
      subjective,
      objective,
      assessment,
      plan,
      diagnosis,
      medications,
      followUpDate
    } = req.body;
    
    // Check if record exists and if user has permission to update
    const recordCheckQuery = `
      SELECT user_id
      FROM medical_records
      WHERE id = $1
    `;
    
    const recordCheck = await client.query(recordCheckQuery, [id]);
    
    if (recordCheck.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Medical record not found'
      });
    }
    
    // Check ownership - only allow update if admin or record owner
    if (req.user.role !== 'admin' && recordCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. You do not have permission to update this record'
      });
    }
    
    // Update the record
    const updateQuery = `
      UPDATE medical_records
      SET
        record_type = COALESCE($1, record_type),
        visit_date = COALESCE($2, visit_date),
        subjective = COALESCE($3, subjective),
        objective = COALESCE($4, objective),
        assessment = COALESCE($5, assessment),
        plan = COALESCE($6, plan),
        diagnosis = COALESCE($7, diagnosis),
        medications = COALESCE($8, medications),
        follow_up_date = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING id
    `;
    
    const updateValues = [
      recordType,
      visitDate,
      subjective,
      objective,
      assessment,
      plan,
      diagnosis,
      medications,
      followUpDate, // Can be null to clear the follow-up date
      id
    ];
    
    await client.query(updateQuery, updateValues);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Medical record updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating medical record:', error);
    res.status(500).json({
      error: true,
      message: 'Error updating medical record',
      details: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Delete a medical record
 * Enforces data privacy by checking user ownership
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMedicalRecord = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Check if record exists and if user has permission to delete
    const recordCheckQuery = `
      SELECT user_id
      FROM medical_records
      WHERE id = $1
    `;
    
    const recordCheck = await client.query(recordCheckQuery, [id]);
    
    if (recordCheck.rows.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Medical record not found'
      });
    }
    
    // Check ownership - only allow delete if admin or record owner
    if (req.user.role !== 'admin' && recordCheck.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'Access denied. You do not have permission to delete this record'
      });
    }
    
    // Delete the record
    const deleteQuery = 'DELETE FROM medical_records WHERE id = $1';
    await client.query(deleteQuery, [id]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting medical record:', error);
    res.status(500).json({
      error: true,
      message: 'Error deleting medical record',
      details: error.message
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
}; 