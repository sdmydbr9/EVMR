const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

/**
 * Login user and generate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  const { email, password, userType, id, organisationId } = req.body;

  try {
    console.log(`Login attempt - Type: ${userType}, Email: ${email}`);
    let user;

    // Handle different login methods based on user type
    if (userType === 'veterinarian' && id) {
      // For veterinarians, find by email and check ID in details
      const userResult = await pool.query(
        `SELECT id, name, email, password, role, details, status
         FROM users
         WHERE email = $1 AND role = 'veterinarian'`,
        [email]
      );

      if (userResult.rows.length > 0) {
        const userData = userResult.rows[0];
        console.log('Veterinarian login - details structure:', JSON.stringify(userData.details));

        // Check status first - if pending, return a specific message
        if (userData.status === 'pending') {
          return res.status(401).json({
            success: false,
            message: 'Your account is pending approval. You will receive your Vet ID via email when approved.'
          });
        }

        // Check if the provided ID matches the vet_id/unique_id stored in details
        const storedId = userData.details?.unique_id || userData.details?.vet_id;

        if (storedId && storedId === id) {
          user = userData;
        } else {
          console.log(`Veterinarian ID mismatch - Provided: ${id}, Stored: ${storedId}`);
        }
      }
    }
    else if (userType === 'institute_admin' && organisationId) {
      // For institute admins, find by email and check organisation ID in details
      const userResult = await pool.query(
        `SELECT id, name, email, password, role, details
         FROM users
         WHERE email = $1 AND role = 'admin'`,
        [email]
      );

      if (userResult.rows.length > 0) {
        const userData = userResult.rows[0];
        console.log('Institute admin login - details structure:', JSON.stringify(userData.details));

        // Only check against organisation_id field
        const storedOrgId = userData.details?.organisation_id;

        console.log(`Institute admin org ID comparison - Provided: ${organisationId}, Found org ID: ${storedOrgId}`);

        if (storedOrgId && storedOrgId === organisationId) {
          user = userData;
        } else {
          console.log(`Institute admin org ID mismatch - Provided: ${organisationId}, Stored: ${storedOrgId}`);
        }
      } else {
        console.log(`No institute admin found with email: ${email}`);
      }
    }
    else {
      // For pet parents or if no user type specified, use traditional email-based login
      const userResult = await pool.query(
        'SELECT id, name, email, password, role, details FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
      } else {
        console.log(`No user found with email: ${email}`);
      }
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if this is a demo user
    const isDemo = email.includes('demo') && email.includes('@petsphere.com');

    // Create JWT payload without sensitive info
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isDemo: isDemo
    };

    // Generate JWT token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );

    console.log(`Successful login for: ${email}, role: ${user.role}, demo: ${isDemo}`);

    // Return success with token and user info
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isDemo: isDemo
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Verify token validity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyToken = (req, res) => {
  // The token has already been verified by the authenticate middleware
  // If we reach this point, the token is valid
  res.json({
    success: true,
    user: req.user
  });
};

/**
 * Get demo user credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDemoCredentials = async (req, res) => {
  try {
    // Environment variables or defaults for demo user IDs
    const VET_DEMO_ID = process.env.VET_DEMO_ID || 'VET12345';
    const ORG_DEMO_ID = process.env.ORG_DEMO_ID || 'ORG12345';

    // Query for demo users (uses wildcard to catch any demo email pattern)
    const result = await pool.query(`
      SELECT id, name, email, role, details 
      FROM users 
      WHERE email LIKE '%demo%'
      ORDER BY role, email
    `);
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No demo users found in the database'
      });
    }
    
    // Format the demo credentials for frontend use
    const demoCredentials = {};
    
    for (const user of result.rows) {
      let userType = '';
      let additionalInfo = {};
      
      // Map backend roles to frontend user types
      if (user.role === 'client') {
        userType = 'pet_parent';
      } else if (user.role === 'veterinarian') {
        userType = 'veterinarian';
        additionalInfo.id = user.details?.unique_id || VET_DEMO_ID;
      } else if (user.role === 'admin') {
        userType = 'organisation';
        additionalInfo.organisationId = user.details?.organisation_id || ORG_DEMO_ID;
      }
      
      if (userType) {
        demoCredentials[userType] = {
          email: user.email,
          password: 'demodemo', // Fixed demo password
          ...additionalInfo
        };
      }
    }
    
    return res.json({
      success: true,
      demoCredentials
    });
  } catch (err) {
    console.error('Error retrieving demo credentials:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving demo credentials'
    });
  }
};

module.exports = {
  login,
  verifyToken,
  getDemoCredentials
};