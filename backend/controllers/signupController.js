const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { sendSignupVerificationEmail, sendAdminNotificationEmail } = require('../config/emailService');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Generate a random alphanumeric string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} - Random alphanumeric string
 */
const generateRandomString = (length = 8) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
};

/**
 * Handle user registration request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerUser = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    role,
    password,
    specialties,
    yearsOfExperience,
    licenseNumber,
    clinicName,
    clinicAddress,
    country,
    clinicPhone,
    clinicEmail,
    teamSize,
    subscribe,
    details,
    petTypes,
    preferredClinic
  } = req.body;

  try {
    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please use a different email address.'
      });
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Handle clinic creation or lookup based on user type
      let clinicId = null;

      // Only create or lookup clinic for institute_admin or veterinarian roles
      if (role === 'admin' && clinicName) {
        // Check if clinic exists for admin roles
        const clinicResult = await client.query(
          'SELECT id FROM clinics WHERE name = $1 AND phone = $2',
          [clinicName, clinicPhone]
        );

        if (clinicResult.rowCount > 0) {
          clinicId = clinicResult.rows[0].id;
        } else {
          // Create new clinic
          const newClinicResult = await client.query(
            `INSERT INTO clinics (name, address, phone, email, created_at, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id`,
            [clinicName, clinicAddress, clinicPhone, clinicEmail]
          );
          clinicId = newClinicResult.rows[0].id;
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Prepare user details JSON object based on role
      let userDetails = {
        phone,
        subscribe: !!subscribe,
        registrationDate: new Date().toISOString()
      };

      // Add role-specific details
      if (role === 'veterinarian') {
        // For veterinarians, generate a unique ID
        const uniqueVetId = 'VET-' + generateRandomString(8);
        
        userDetails = {
          ...userDetails,
          specialties: specialties || [],
          yearsOfExperience: yearsOfExperience || '',
          licenseNumber: licenseNumber || '',
          unique_id: uniqueVetId // Add unique ID for veterinarian
        };
        
        console.log(`Created unique veterinarian ID for ${email}: ${uniqueVetId}`);
      } else if (role === 'admin') {
        // Generate organisation ID for institute admins
        const organisationId = 'ORG-' + generateRandomString(8);

        userDetails = {
          ...userDetails,
          country,
          teamSize,
          organisation_id: organisationId,
          clinicDetails: {
            name: clinicName,
            address: clinicAddress,
            phone: clinicPhone,
            email: clinicEmail
          }
        };

        console.log(`Created organisation ID for ${email}: ${organisationId}`);
      } else if (role === 'client') { // Pet parent role
        userDetails = {
          ...userDetails,
          petTypes: petTypes || [],
          preferredClinic: preferredClinic || ''
        };
      }

      // Check if the email contains 'demo' - if so, mark this as a demo account (for testing only)
      const status = email.includes('demo') ? 'active' : 'pending';

      // Create user with pending status (or active for demo)
      const userResult = await client.query(
        `INSERT INTO users
         (name, email, password, role, clinic_id, status, details, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          fullName,
          email,
          hashedPassword,
          role,
          clinicId, // This might be null for client/pet parent
          status, // 'pending' for real users, 'active' for demo
          JSON.stringify(userDetails)
        ]
      );
      const userId = userResult.rows[0].id;
      
      // For real users (non-demo), initialize empty data structures if needed
      // Note: Demo users will get sample data on first access
      if (!email.includes('demo')) {
        // For pet parents, initialize empty pets table
        if (role === 'client') {
          console.log(`New user signup: Initializing empty data for pet parent ${userId}`);
          // No need to create anything - they'll start with an empty state
        }
        
        // For veterinarians, initialize empty patient data
        if (role === 'veterinarian') {
          console.log(`New user signup: Initializing empty data for veterinarian ${userId}`);
          // No sample patients or appointments - they'll start with an empty state
        }
      }

      await client.query('COMMIT');

      // Send verification email to user
      const userData = {
        fullName,
        email,
        phone,
        role,
        clinicName: clinicName || '',
        clinicAddress: clinicAddress || '',
        userType: role === 'client' ? 'Pet Parent' :
                 role === 'veterinarian' ? 'Veterinarian' :
                 role === 'admin' ? 'Institute Administrator' : 'User'
      };

      // Add organisation ID to userData if it's an institute admin
      if (role === 'admin') {
        userData.organisationId = userDetails.organisation_id;
      }

      try {
        // Send email to user
        await sendSignupVerificationEmail(userData);

        // Send notification to admin
        await sendAdminNotificationEmail(userData);

        // Send the data to the admin dashboard service
        try {
          const adminServiceUrl = `${process.env.ADMIN_SERVICE_URL || 'http://admin-service:' + (process.env.ADMIN_PORT || 3789)}/api/admin/registrations`;
          const adminServiceResponse = await axios.post(adminServiceUrl, {
            userData,
            user_id: userId // Include the user ID for reference
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ADMIN_SERVICE_API_KEY}`
            }
          });
          console.log('Data sent to admin service:', adminServiceResponse.data);
        } catch (adminServiceError) {
          console.error('Error sending data to admin service:', adminServiceError);
          // We don't want to fail the registration if admin service communication fails
        }
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // We don't want to fail the registration if email sending fails
      }

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Your application is being processed.'
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again later.'
    });
  }
};

/**
 * Check if email or phone number already exists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkExistingCredential = async (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters'
    });
  }

  try {
    let query;
    let params;

    // Check based on field type
    if (field === 'email') {
      query = 'SELECT id FROM users WHERE email = $1';
      params = [value];
    } else if (field === 'phone') {
      // Phone numbers are stored in the details JSON field
      query = "SELECT id FROM users WHERE details->>'phone' = $1";
      params = [value];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid field parameter'
      });
    }

    const result = await pool.query(query, params);

    if (result.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This ${field} is already registered`
      });
    }

    // If we get here, the credential is available
    return res.status(200).json({
      success: true,
      message: `${field} is available`
    });
  } catch (err) {
    console.error(`Error checking existing ${field}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  registerUser,
  checkExistingCredential
};