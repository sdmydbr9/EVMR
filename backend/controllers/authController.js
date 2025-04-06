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
    let user;
    
    // Handle different login methods based on user type
    if (userType === 'veterinarian' && id) {
      // For veterinarians, find by email and check ID in details
      const userResult = await pool.query(
        `SELECT id, name, email, password, role, details 
         FROM users 
         WHERE email = $1 AND role = 'veterinarian'`,
        [email]
      );
      
      if (userResult.rows.length > 0) {
        const userData = userResult.rows[0];
        // Check if the provided ID matches the unique_id stored in details
        const storedId = userData.details?.unique_id;
        
        if (storedId && storedId === id) {
          user = userData;
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
        // Check if the provided organisation ID matches the one stored in details
        const storedOrgId = userData.details?.organisation_id;
        
        if (storedOrgId && storedOrgId === organisationId) {
          user = userData;
        }
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
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create JWT payload without sensitive info
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // Generate JWT token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: process.env.JWT_EXPIRATION || '1d' }
    );
    
    // Return success with token and user info
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
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

module.exports = {
  login,
  verifyToken
}; 