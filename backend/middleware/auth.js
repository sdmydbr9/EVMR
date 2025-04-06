const jwt = require('jsonwebtoken');

/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request object
 */
const authenticate = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: true, 
      message: 'Access denied. No token provided or invalid format.' 
    });
  }

  // Extract token without "Bearer " prefix
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    // Add user data to request
    req.user = decoded;
    
    // Proceed to next middleware or route handler
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ 
      error: true, 
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 * @param {Array} allowedRoles - Array of roles that can access the route
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user object exists (set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ 
        error: true, 
        message: 'Authentication required' 
      });
    }

    // Check if user role is in allowed roles
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ 
        error: true, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
  };
};

module.exports = { authenticate, authorize }; 