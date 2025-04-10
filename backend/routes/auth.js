const express = require('express');
const router = express.Router();
const { login, verifyToken, getDemoCredentials } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// Login route
router.post('/login', login);

// Verify token route (authenticated)
router.get('/verify', authenticate, verifyToken);

// Get demo credentials route (public)
router.get('/demo-credentials', getDemoCredentials);

// DEBUG ONLY - Remove in production
// Helper route to check user structure for debugging
router.get('/debug-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    // Only allow this in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ message: 'Not found' });
    }
    
    const result = await pool.query(
      'SELECT id, name, email, role, details, status FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Add helpful info for debugging login issues
    let loginInfo = {};
    if (user.role === 'veterinarian') {
      const hasVetId = user.details?.unique_id || user.details?.vet_id;
      
      if (user.status === 'pending' || !hasVetId) {
        loginInfo = {
          loginRequirements: {
            userType: 'veterinarian',
            status: 'Account pending approval',
            message: 'Your account must be approved before you can login. You will receive your Vet ID via email when approved.'
          }
        };
      } else {
        loginInfo = {
          loginRequirements: {
            userType: 'veterinarian',
            email: user.email,
            id: hasVetId,
            password: '(Password required)'
          }
        };
      }
    } else if (user.role === 'admin') {
      loginInfo = {
        loginRequirements: {
          userType: 'institute_admin',
          email: user.email,
          organisationId: user.details?.organisation_id || '(Not set)',
          password: '(Password required)'
        }
      };
    } else {
      loginInfo = {
        loginRequirements: {
          userType: 'pet_parent',
          email: user.email,
          password: '(Password required)'
        }
      };
    }
    
    return res.json({ 
      user: {
        ...user,
        // Remove any sensitive information
        password: undefined
      },
      ...loginInfo
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 