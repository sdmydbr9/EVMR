const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { sendSignupVerificationEmail, sendAdminNotificationEmail } = require('../config/emailService');
const axios = require('axios');

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
        userDetails = {
          ...userDetails,
          specialties: specialties || [],
          yearsOfExperience: yearsOfExperience || '',
          licenseNumber: licenseNumber || ''
        };
      } else if (role === 'admin') {
        userDetails = {
          ...userDetails,
          country,
          teamSize,
          clinicDetails: {
            name: clinicName,
            address: clinicAddress,
            phone: clinicPhone,
            email: clinicEmail
          }
        };
      } else if (role === 'client') { // Pet parent role
        userDetails = {
          ...userDetails,
          petTypes: petTypes || [],
          preferredClinic: preferredClinic || ''
        };
      }

      // Create user with pending status
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
          'pending', // Set initial status as pending
          JSON.stringify(userDetails)
        ]
      );
      const userId = userResult.rows[0].id;

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

      try {
        // Send email to user
        await sendSignupVerificationEmail(userData);
        
        // Send notification to admin
        await sendAdminNotificationEmail(userData);
        
        // Send the data to the admin dashboard service
        try {
          const adminServiceUrl = `http://admin-service:${process.env.ADMIN_PORT || 3789}/api/admin/registrations`;
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

module.exports = {
  registerUser
}; 