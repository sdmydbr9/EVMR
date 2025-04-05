const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Get all patients with pagination and filtering
 */
const getAllPatients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      species, 
      sort = 'name',
      order = 'ASC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build WHERE clause based on filters
    let whereClause = '';
    const params = [];
    
    if (search) {
      params.push(`%${search}%`);
      whereClause += ` WHERE (p.name ILIKE $${params.length} OR o.name ILIKE $${params.length})`;
    }
    
    if (species) {
      if (whereClause === '') {
        whereClause = ' WHERE';
      } else {
        whereClause += ' AND';
      }
      params.push(species);
      whereClause += ` p.species = $${params.length}`;
    }
    
    // Query to get paginated patients
    const patientsQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.species, 
        p.breed, 
        p.date_of_birth, 
        p.gender,
        p.color,
        p.weight,
        p.microchip_id,
        o.id as owner_id,
        o.name as owner_name,
        o.phone as owner_phone,
        o.email as owner_email
      FROM patients p
      LEFT JOIN owners o ON p.owner_id = o.id
      ${whereClause}
      ORDER BY p.${sort} ${order}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    // Add pagination params
    params.push(parseInt(limit));
    params.push(parseInt(offset));
    
    // Count query for total records
    const countQuery = `
      SELECT COUNT(*) 
      FROM patients p
      LEFT JOIN owners o ON p.owner_id = o.id
      ${whereClause}
    `;
    
    // Execute queries
    const [patientsResult, countResult] = await Promise.all([
      pool.query(patientsQuery, params),
      pool.query(countQuery, params.slice(0, params.length - 2)) // Remove pagination params
    ]);
    
    // Format patient records
    const patients = patientsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      species: row.species,
      breed: row.breed,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      color: row.color,
      weight: row.weight,
      microchipId: row.microchip_id,
      owner: {
        id: row.owner_id,
        name: row.owner_name,
        phone: row.owner_phone,
        email: row.owner_email
      }
    }));
    
    // Calculate pagination info
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);
    
    // Send response
    res.json({
      patients,
      pagination: {
        total,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error getting patients:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving patients' 
    });
  }
};

/**
 * Get a single patient by ID
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Query to get patient and owner details
    const patientQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.species, 
        p.breed, 
        p.date_of_birth, 
        p.gender,
        p.color,
        p.weight,
        p.microchip_id,
        o.id as owner_id,
        o.name as owner_name,
        o.phone as owner_phone,
        o.email as owner_email,
        o.address as owner_address
      FROM patients p
      LEFT JOIN owners o ON p.owner_id = o.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(patientQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Patient not found' 
      });
    }
    
    const row = result.rows[0];
    
    // Format patient record
    const patient = {
      id: row.id,
      name: row.name,
      species: row.species,
      breed: row.breed,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      color: row.color,
      weight: row.weight,
      microchipId: row.microchip_id,
      owner: {
        id: row.owner_id,
        name: row.owner_name,
        phone: row.owner_phone,
        email: row.owner_email,
        address: row.owner_address
      }
    };
    
    res.json(patient);
  } catch (err) {
    console.error('Error getting patient:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving the patient' 
    });
  }
};

/**
 * Create a new patient
 */
const createPatient = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    const { 
      name, 
      species, 
      breed, 
      dateOfBirth, 
      gender, 
      color, 
      weight, 
      microchipId,
      owner 
    } = req.body;
    
    // First, check if owner exists by phone number
    const ownerQuery = 'SELECT id, name FROM owners WHERE phone = $1';
    const ownerResult = await client.query(ownerQuery, [owner.phone]);
    
    let ownerId;
    let ownerName;
    
    if (ownerResult.rows.length === 0) {
      // Create new owner
      const createOwnerQuery = `
        INSERT INTO owners (name, phone, email, address)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name
      `;
      
      const ownerValues = [
        owner.name,
        owner.phone,
        owner.email || null,
        owner.address || null
      ];
      
      const newOwnerResult = await client.query(createOwnerQuery, ownerValues);
      ownerId = newOwnerResult.rows[0].id;
      ownerName = newOwnerResult.rows[0].name;
    } else {
      // Use existing owner
      ownerId = ownerResult.rows[0].id;
      ownerName = ownerResult.rows[0].name;
    }
    
    // Generate custom patient ID
    const timestamp = Date.now();
    const ownerPrefix = ownerName.substring(0, 3).toUpperCase();
    const patientPrefix = name.substring(0, 3).toUpperCase();
    const patientId = `${ownerPrefix}${patientPrefix}-${timestamp}`;
    
    // Create new patient
    const createPatientQuery = `
      INSERT INTO patients (
        id, 
        name, 
        species, 
        breed, 
        date_of_birth, 
        gender, 
        color, 
        weight, 
        microchip_id, 
        owner_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    
    const patientValues = [
      patientId,
      name,
      species,
      breed || null,
      dateOfBirth || null,
      gender,
      color || null,
      weight || null,
      microchipId || null,
      ownerId
    ];
    
    await client.query(createPatientQuery, patientValues);
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Patient created successfully',
      patientId,
      ownerId
    });
  } catch (err) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    
    console.error('Error creating patient:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while creating the patient' 
    });
  } finally {
    client.release();
  }
};

/**
 * Update a patient
 */
const updatePatient = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { 
      name, 
      species, 
      breed, 
      dateOfBirth, 
      gender, 
      color, 
      weight, 
      microchipId,
      owner 
    } = req.body;
    
    // Check if patient exists
    const checkPatientQuery = 'SELECT owner_id FROM patients WHERE id = $1';
    const patientResult = await client.query(checkPatientQuery, [id]);
    
    if (patientResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: true, 
        message: 'Patient not found' 
      });
    }
    
    const currentOwnerId = patientResult.rows[0].owner_id;
    
    // Update owner if provided
    if (owner) {
      const updateOwnerQuery = `
        UPDATE owners
        SET 
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          address = COALESCE($4, address)
        WHERE id = $5
      `;
      
      const ownerValues = [
        owner.name,
        owner.phone,
        owner.email,
        owner.address,
        currentOwnerId
      ];
      
      await client.query(updateOwnerQuery, ownerValues);
    }
    
    // Update patient
    const updatePatientQuery = `
      UPDATE patients
      SET 
        name = COALESCE($1, name),
        species = COALESCE($2, species),
        breed = COALESCE($3, breed),
        date_of_birth = COALESCE($4, date_of_birth),
        gender = COALESCE($5, gender),
        color = COALESCE($6, color),
        weight = COALESCE($7, weight),
        microchip_id = COALESCE($8, microchip_id)
      WHERE id = $9
    `;
    
    const patientValues = [
      name,
      species,
      breed,
      dateOfBirth,
      gender,
      color,
      weight,
      microchipId,
      id
    ];
    
    await client.query(updatePatientQuery, patientValues);
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.json({
      message: 'Patient updated successfully',
      patientId: id,
      ownerId: currentOwnerId
    });
  } catch (err) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    
    console.error('Error updating patient:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while updating the patient' 
    });
  } finally {
    client.release();
  }
};

/**
 * Delete a patient
 */
const deletePatient = async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Check if patient exists and get owner ID
    const checkPatientQuery = 'SELECT owner_id FROM patients WHERE id = $1';
    const patientResult = await client.query(checkPatientQuery, [id]);
    
    if (patientResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: true, 
        message: 'Patient not found' 
      });
    }
    
    // Delete patient
    const deletePatientQuery = 'DELETE FROM patients WHERE id = $1';
    await client.query(deletePatientQuery, [id]);
    
    // Check if owner has other patients
    const ownerId = patientResult.rows[0].owner_id;
    const checkOwnerPatientsQuery = 'SELECT COUNT(*) FROM patients WHERE owner_id = $1';
    const ownerPatientsResult = await client.query(checkOwnerPatientsQuery, [ownerId]);
    
    // If owner has no other patients, delete owner record too
    if (parseInt(ownerPatientsResult.rows[0].count) === 0) {
      const deleteOwnerQuery = 'DELETE FROM owners WHERE id = $1';
      await client.query(deleteOwnerQuery, [ownerId]);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.json({
      message: 'Patient deleted successfully'
    });
  } catch (err) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    
    console.error('Error deleting patient:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while deleting the patient' 
    });
  } finally {
    client.release();
  }
};

/**
 * Get a patient's medical history
 */
const getPatientHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if patient exists
    const checkPatientQuery = 'SELECT id FROM patients WHERE id = $1';
    const patientResult = await pool.query(checkPatientQuery, [id]);
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ 
        error: true, 
        message: 'Patient not found' 
      });
    }
    
    // Query to get medical records, sorted by date
    const historyQuery = `
      SELECT 
        mr.id,
        mr.visit_date,
        mr.subjective,
        mr.objective,
        mr.assessment,
        mr.plan,
        mr.created_by,
        u.name as created_by_name
      FROM medical_records mr
      JOIN users u ON mr.created_by = u.id
      WHERE mr.patient_id = $1
      ORDER BY mr.visit_date DESC
    `;
    
    const historyResult = await pool.query(historyQuery, [id]);
    
    // Format medical records
    const history = historyResult.rows.map(row => ({
      id: row.id,
      visitDate: row.visit_date,
      subjective: row.subjective,
      objective: row.objective,
      assessment: row.assessment,
      plan: row.plan,
      createdBy: {
        id: row.created_by,
        name: row.created_by_name
      }
    }));
    
    res.json(history);
  } catch (err) {
    console.error('Error getting patient history:', err);
    res.status(500).json({ 
      error: true, 
      message: 'An error occurred while retrieving the patient history' 
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientHistory
}; 