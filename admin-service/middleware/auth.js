const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No authentication token provided.' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if the user exists and is an admin
    const userResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rowCount === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Only allow admins to access this service
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token. Please log in again.' 
      });
    }
    
    console.error('Auth middleware error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during authentication.' 
    });
  }
};

module.exports = {
  authenticate
}; 