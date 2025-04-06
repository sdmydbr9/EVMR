const { query, getClient } = require('../config/database');
const { sendApprovalEmail, sendRejectionEmail } = require('../config/emailService');

/**
 * Get all pending registrations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPendingRegistrations = async (req, res) => {
  try {
    // First check our pending_registrations table
    const pendingRegistrations = await query(
      `SELECT pr.id, pr.user_id, pr.user_data, pr.created_at
       FROM pending_registrations pr
       WHERE pr.status = 'pending'
       ORDER BY pr.created_at DESC`
    );
    
    if (pendingRegistrations.rowCount > 0) {
      // Format the response data
      const formattedRegistrations = pendingRegistrations.rows.map(reg => {
        const userData = reg.user_data;
        return {
          id: reg.id,
          user_id: reg.user_id,
          name: userData.fullName,
          email: userData.email,
          role: userData.role,
          clinic_name: userData.clinicName || 'N/A',
          clinic_address: userData.clinicAddress || 'N/A',
          created_at: reg.created_at,
          details: userData
        };
      });
      
      return res.status(200).json({
        success: true,
        count: formattedRegistrations.length,
        pendingUsers: formattedRegistrations
      });
    }
    
    // If no registrations in our table, check users table as fallback
    const pendingUsers = await query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.details, u.created_at,
              c.id as clinic_id, c.name as clinic_name, c.address as clinic_address,
              c.phone as clinic_phone, c.email as clinic_email
       FROM users u
       LEFT JOIN clinics c ON u.clinic_id = c.id
       WHERE u.status = 'pending'
       ORDER BY u.created_at DESC`
    );
    
    return res.status(200).json({
      success: true,
      count: pendingUsers.rowCount,
      pendingUsers: pendingUsers.rows
    });
  } catch (err) {
    console.error('Error fetching pending registrations:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching pending registrations.'
    });
  }
};

/**
 * Get registration details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRegistrationById = async (req, res) => {
  const { id } = req.params;
  
  try {
    // First check our pending_registrations table
    const registrationResult = await query(
      `SELECT id, user_id, user_data, created_at
       FROM pending_registrations
       WHERE id = $1`,
      [id]
    );
    
    if (registrationResult.rowCount > 0) {
      const reg = registrationResult.rows[0];
      const userData = reg.user_data;
      
      const formattedRegistration = {
        id: reg.id,
        user_id: reg.user_id,
        name: userData.fullName,
        email: userData.email,
        role: userData.role,
        clinic_name: userData.clinicName || 'N/A',
        clinic_address: userData.clinicAddress || 'N/A',
        created_at: reg.created_at,
        details: userData
      };
      
      return res.status(200).json({
        success: true,
        registration: formattedRegistration
      });
    }
    
    // If not found in our table, check users table as fallback
    const userResult = await query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.details, u.created_at,
              c.id as clinic_id, c.name as clinic_name, c.address as clinic_address,
              c.phone as clinic_phone, c.email as clinic_email
       FROM users u
       LEFT JOIN clinics c ON u.clinic_id = c.id
       WHERE u.id = $1`,
      [id]
    );
    
    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.'
      });
    }
    
    return res.status(200).json({
      success: true,
      registration: userResult.rows[0]
    });
  } catch (err) {
    console.error('Error fetching registration details:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching registration details.'
    });
  }
};

/**
 * Approve a user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const approveRegistration = async (req, res) => {
  const { id } = req.params;
  
  try {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if this is a registration from our pending_registrations table
      const pendingResult = await client.query(
        `SELECT id, user_id, user_data
         FROM pending_registrations
         WHERE id = $1 AND status = 'pending'`,
        [id]
      );
      
      if (pendingResult.rowCount > 0) {
        const registration = pendingResult.rows[0];
        const userData = registration.user_data;
        const userId = registration.user_id;
        
        // Generate unique IDs for veterinarians and institute admins
        let uniqueId = null;
        let organisationId = null;
        
        if (userData.role === 'veterinarian') {
          // Generate a unique ID for veterinarians: 'VET-' + random alphanumeric
          uniqueId = 'VET-' + generateRandomString(8);
          
          // Store the unique ID in the user details
          await client.query(
            `UPDATE users
             SET details = jsonb_set(details, '{unique_id}', $1::jsonb),
                 status = 'active', updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [JSON.stringify(uniqueId), userId]
          );
        } else if (userData.role === 'admin') {
          // Generate an organisation ID for institute admins: 'ORG-' + random alphanumeric
          organisationId = 'ORG-' + generateRandomString(8);
          
          // Store the organisation ID in the user details
          await client.query(
            `UPDATE users
             SET details = jsonb_set(details, '{organisation_id}', $1::jsonb),
                 status = 'active', updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [JSON.stringify(organisationId), userId]
          );
        } else {
          // For other user types (like pet parents), simply activate them
          await client.query(
            `UPDATE users
             SET status = 'active', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [userId]
          );
        }
        
        // Update our registration status
        await client.query(
          `UPDATE pending_registrations
           SET status = 'approved', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [id]
        );
        
        await client.query('COMMIT');
        
        // Send approval email with appropriate ID information
        try {
          await sendApprovalEmail({
            id: userId,
            name: userData.fullName,
            email: userData.email,
            clinicName: userData.clinicName || '',
            role: userData.role,
            uniqueId: uniqueId,
            organisationId: organisationId
          });
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
        }
        
        return res.status(200).json({
          success: true,
          message: `User ${userData.fullName} has been approved and notified.`
        });
      }
      
      // Fallback to the old method if not found in our table
      const userResult = await client.query(
        `SELECT u.id, u.name, u.email, u.role, c.name as clinic_name, u.details
         FROM users u
         LEFT JOIN clinics c ON u.clinic_id = c.id
         WHERE u.id = $1 AND u.status = 'pending'`,
        [id]
      );
      
      if (userResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Pending registration not found.'
        });
      }
      
      const user = userResult.rows[0];
      
      // Generate unique IDs for veterinarians and institute admins
      let uniqueId = null;
      let organisationId = null;
      
      if (user.role === 'veterinarian') {
        // Generate a unique ID for veterinarians: 'VET-' + random alphanumeric
        uniqueId = 'VET-' + generateRandomString(8);
        
        // Store the unique ID in the user details
        await client.query(
          `UPDATE users
           SET details = jsonb_set(COALESCE(details, '{}'::jsonb), '{unique_id}', $1::jsonb),
               status = 'active', updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [JSON.stringify(uniqueId), id]
        );
      } else if (user.role === 'admin') {
        // Generate an organisation ID for institute admins: 'ORG-' + random alphanumeric
        organisationId = 'ORG-' + generateRandomString(8);
        
        // Store the organisation ID in the user details
        await client.query(
          `UPDATE users
           SET details = jsonb_set(COALESCE(details, '{}'::jsonb), '{organisation_id}', $1::jsonb),
               status = 'active', updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [JSON.stringify(organisationId), id]
        );
      } else {
        // For other user types (like pet parents), simply activate them
        await client.query(
          `UPDATE users
           SET status = 'active', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [id]
        );
      }
      
      await client.query('COMMIT');
      
      // Send approval email with appropriate ID information
      try {
        await sendApprovalEmail({
          ...user,
          uniqueId: uniqueId,
          organisationId: organisationId
        });
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
      }
      
      return res.status(200).json({
        success: true,
        message: `User ${user.name} has been approved and notified.`
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error approving registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while approving registration.'
    });
  }
};

/**
 * Generates a random alphanumeric string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} - Random alphanumeric string
 */
const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Reject a user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rejectRegistration = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required.'
    });
  }
  
  try {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if this is a registration from our pending_registrations table
      const pendingResult = await client.query(
        `SELECT id, user_id, user_data
         FROM pending_registrations
         WHERE id = $1 AND status = 'pending'`,
        [id]
      );
      
      if (pendingResult.rowCount > 0) {
        const registration = pendingResult.rows[0];
        const userData = registration.user_data;
        const userId = registration.user_id;
        
        // Update user status to rejected
        await client.query(
          `UPDATE users
           SET status = 'rejected', details = jsonb_set(details, '{rejection_reason}', $1::jsonb),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [JSON.stringify(reason), userId]
        );
        
        // Update our registration status
        await client.query(
          `UPDATE pending_registrations
           SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [id]
        );
        
        await client.query('COMMIT');
        
        // Send rejection email
        try {
          await sendRejectionEmail({
            id: userId,
            name: userData.fullName,
            email: userData.email,
            clinicName: userData.clinicName || ''
          }, reason);
        } catch (emailError) {
          console.error('Error sending rejection email:', emailError);
        }
        
        return res.status(200).json({
          success: true,
          message: `User ${userData.fullName} has been rejected and notified.`
        });
      }
      
      // Fallback to the old method if not found in our table
      const userResult = await client.query(
        `SELECT u.id, u.name, u.email, u.role, c.name as clinic_name
         FROM users u
         LEFT JOIN clinics c ON u.clinic_id = c.id
         WHERE u.id = $1 AND u.status = 'pending'`,
        [id]
      );
      
      if (userResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Pending registration not found.'
        });
      }
      
      const user = userResult.rows[0];
      
      // Update user status to rejected
      await client.query(
        `UPDATE users
         SET status = 'rejected', details = jsonb_set(details, '{rejection_reason}', $1::jsonb),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [JSON.stringify(reason), id]
      );
      
      await client.query('COMMIT');
      
      // Send rejection email
      try {
        await sendRejectionEmail(user, reason);
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
      }
      
      return res.status(200).json({
        success: true,
        message: `User ${user.name} has been rejected and notified.`
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error rejecting registration:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while rejecting registration.'
    });
  }
};

/**
 * Store pending registration data from backend service
 * @param {Object} userData - User data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Promise that resolves with the stored data
 */
const storePendingRegistration = async (userData, userId) => {
  try {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if the registration already exists
      const existingReg = await client.query(
        'SELECT id FROM pending_registrations WHERE user_id = $1',
        [userId]
      );
      
      if (existingReg.rowCount > 0) {
        // Update existing registration
        await client.query(
          `UPDATE pending_registrations
           SET user_data = $1, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $2`,
          [JSON.stringify(userData), userId]
        );
      } else {
        // Create new registration record
        await client.query(
          `INSERT INTO pending_registrations (user_id, user_data, created_at, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [userId, JSON.stringify(userData)]
        );
      }
      
      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error storing pending registration:', err);
    throw err;
  }
};

/**
 * Receives and processes registration data from backend service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const receiveRegistrationData = async (req, res) => {
  const { userData, user_id } = req.body;
  
  try {
    // Validate API key
    const apiKey = req.headers.authorization?.split(' ')[1];
    if (apiKey !== process.env.ADMIN_SERVICE_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Store the registration data
    await storePendingRegistration(userData, user_id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Registration data received and stored successfully'
    });
  } catch (err) {
    console.error('Error processing registration data:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing registration data'
    });
  }
};

/**
 * Get all approved registrations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getApprovedRegistrations = async (req, res) => {
  try {
    // First check our pending_registrations table for approved registrations
    const approvedRegistrations = await query(
      `SELECT pr.id, pr.user_id, pr.user_data, pr.updated_at as approved_at
       FROM pending_registrations pr
       WHERE pr.status = 'approved'
       ORDER BY pr.updated_at DESC`
    );
    
    if (approvedRegistrations.rowCount > 0) {
      // Format the response data
      const formattedRegistrations = approvedRegistrations.rows.map(reg => {
        const userData = reg.user_data;
        return {
          id: reg.id,
          user_id: reg.user_id,
          name: userData.fullName,
          email: userData.email,
          role: userData.role,
          clinic_name: userData.clinicName || 'N/A',
          clinic_address: userData.clinicAddress || 'N/A',
          approved_at: reg.approved_at,
          details: userData
        };
      });
      
      return res.status(200).json({
        success: true,
        count: formattedRegistrations.length,
        approvedUsers: formattedRegistrations
      });
    }
    
    // If no registrations in our table, check users table as fallback
    const approvedUsers = await query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.details, u.updated_at as approved_at,
              c.id as clinic_id, c.name as clinic_name, c.address as clinic_address,
              c.phone as clinic_phone, c.email as clinic_email
       FROM users u
       LEFT JOIN clinics c ON u.clinic_id = c.id
       WHERE u.status = 'active'
       ORDER BY u.updated_at DESC`
    );
    
    return res.status(200).json({
      success: true,
      count: approvedUsers.rowCount,
      approvedUsers: approvedUsers.rows
    });
  } catch (err) {
    console.error('Error fetching approved registrations:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching approved registrations.'
    });
  }
};

/**
 * Get all rejected registrations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRejectedRegistrations = async (req, res) => {
  try {
    // First check our pending_registrations table for rejected registrations
    const rejectedRegistrations = await query(
      `SELECT pr.id, pr.user_id, pr.user_data, pr.updated_at as rejected_at
       FROM pending_registrations pr
       WHERE pr.status = 'rejected'
       ORDER BY pr.updated_at DESC`
    );
    
    if (rejectedRegistrations.rowCount > 0) {
      // Format the response data
      const formattedRegistrations = rejectedRegistrations.rows.map(reg => {
        const userData = reg.user_data;
        return {
          id: reg.id,
          user_id: reg.user_id,
          name: userData.fullName,
          email: userData.email,
          role: userData.role,
          clinic_name: userData.clinicName || 'N/A',
          clinic_address: userData.clinicAddress || 'N/A',
          rejected_at: reg.rejected_at,
          details: userData
        };
      });
      
      return res.status(200).json({
        success: true,
        count: formattedRegistrations.length,
        rejectedUsers: formattedRegistrations
      });
    }
    
    // If no registrations in our table, check users table as fallback
    const rejectedUsers = await query(
      `SELECT u.id, u.name, u.email, u.role, u.status, u.details, u.updated_at as rejected_at,
              c.id as clinic_id, c.name as clinic_name, c.address as clinic_address,
              c.phone as clinic_phone, c.email as clinic_email
       FROM users u
       LEFT JOIN clinics c ON u.clinic_id = c.id
       WHERE u.status = 'rejected'
       ORDER BY u.updated_at DESC`
    );
    
    return res.status(200).json({
      success: true,
      count: rejectedUsers.rowCount,
      rejectedUsers: rejectedUsers.rows
    });
  } catch (err) {
    console.error('Error fetching rejected registrations:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching rejected registrations.'
    });
  }
};

module.exports = {
  getPendingRegistrations,
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
  receiveRegistrationData,
  getApprovedRegistrations,
  getRejectedRegistrations,
  generateRandomString
};