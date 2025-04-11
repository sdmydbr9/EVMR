const jwt = require('jsonwebtoken');

/**
 * Check if a user is a demo user based on email
 * @param {string} email - User email to check
 * @returns {boolean} - True if demo user, false otherwise
 */
const isDemoUser = (email) => {
  return email && email.includes('demo') && email.includes('@petsphere.com');
};

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
    
    // Add demo flag for demo users
    req.user.isDemo = isDemoUser(req.user.email);

    // Ensure user ID is available in a consistent format
    if (!req.user.id && req.user.userId) {
      req.user.id = req.user.userId;
    } else if (!req.user.id && req.user._id) {
      req.user.id = req.user._id;
    }

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
 * Middleware to ensure data privacy
 * Checks if requesting user is authorized for the requested resource
 */
const authorizeResourceAccess = (req, res, next) => {
  const { user } = req;
  const requestedUserId = req.params.userId || req.query.userId;

  // If no specific user ID is requested, just proceed (will filter in route handler)
  if (!requestedUserId) {
    return next();
  }

  // Always allow admin access
  if (user.role === 'admin') {
    return next();
  }

  // Ensure users can only access their own data
  if (user.id.toString() !== requestedUserId.toString()) {
    return res.status(403).json({
      error: true,
      message: 'Access denied. You can only access your own resources.'
    });
  }

  next();
};

/**
 * Role-based authorization middleware
 * Checks if the user has one of the required roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required'
      });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        error: true,
        message: 'Access denied. Insufficient permissions'
      });
    }
  };
};

module.exports = {
  authenticate,
  authorizeResourceAccess,
  authorize,
  isDemoUser
};