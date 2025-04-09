const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Always use local development settings when running this script directly
const dbConfig = {
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
};

console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Using local database config:', { 
  user: dbConfig.user,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database
});

// Create a new pool with the config
const pool = new Pool(dbConfig);

/**
 * Adds demo users to pending_registrations table with 'approved' status
 */
const addDemoUsersToPendingRegistrations = async () => {
  console.log('Adding demo users to pending_registrations table...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if pending_registrations table exists
    const tableCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_registrations'
      );
    `);
    
    if (!tableCheckResult.rows[0].exists) {
      console.log('Creating pending_registrations table...');
      // Create the pending_registrations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS pending_registrations (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          user_data JSONB NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('pending_registrations table created successfully.');
    }
    
    // Get all demo users
    const demoUsers = await client.query(
      "SELECT id, name, email, role, details FROM users WHERE email LIKE '%_demo@evmr.com'"
    );
    
    if (demoUsers.rowCount === 0) {
      console.error('No demo users found in the database.');
      process.exit(1);
    }
    
    console.log(`Found ${demoUsers.rowCount} demo users.`);
    
    // For each demo user, add an entry to pending_registrations
    for (const user of demoUsers.rows) {
      // Check if user already exists in pending_registrations
      const existingEntry = await client.query(
        'SELECT id FROM pending_registrations WHERE user_id = $1',
        [user.id]
      );
      
      // Create userData object that matches the expected format
      const userData = {
        fullName: user.name,
        email: user.email,
        role: user.role,
        clinicName: user.details?.clinicDetails?.name || 'Demo Veterinary Clinic',
        clinicAddress: user.details?.clinicDetails?.address || '123 Demo Street, Demo City',
        phone: user.details?.phone || '555-DEMO-123',
        ...user.details
      };
      
      if (existingEntry.rowCount > 0) {
        // Update existing entry
        await client.query(
          `UPDATE pending_registrations 
           SET user_data = $1, status = 'approved', updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $2`,
          [userData, user.id]
        );
        console.log(`Updated existing entry for ${user.email} in pending_registrations.`);
      } else {
        // Add new entry
        await client.query(
          `INSERT INTO pending_registrations 
           (user_id, user_data, status, created_at, updated_at)
           VALUES ($1, $2, 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [user.id, userData]
        );
        console.log(`Added ${user.email} to pending_registrations with 'approved' status.`);
      }
    }
    
    await client.query('COMMIT');
    console.log('Successfully added all demo users to pending_registrations table!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding demo users to pending_registrations:', err);
  } finally {
    client.release();
    // Exit the process
    process.exit(0);
  }
};

// Execute the main function
addDemoUsersToPendingRegistrations(); 