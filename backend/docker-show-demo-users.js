#!/usr/bin/env node

/**
 * Script to show demo user credentials for Docker environment
 * This version is specifically for use within the Docker container
 */

const { Pool } = require('pg');

// Database connection configuration for Docker environment
const dbConfig = {
  user: process.env.POSTGRES_USER || 'vetsphere_user',
  password: process.env.DB_PASSWORD || 'postgres',
  host: 'vetsphere-db',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'vetsphere_database'
};

console.log('Using database configuration:');
console.log(`Host: ${dbConfig.host}, Database: ${dbConfig.database}`);
console.log(`User: ${dbConfig.user}, Port: ${dbConfig.port}`);

// Create a pool
const pool = new Pool(dbConfig);

// Fixed IDs for demo users
const VET_DEMO_ID = process.env.VET_DEMO_ID || 'VET12345';
const ORG_DEMO_ID = process.env.ORG_DEMO_ID || 'ORG12345';

async function getDemoUsers() {
  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Find all users with "demo" in their email
      const result = await client.query(`
        SELECT id, name, email, role, details 
        FROM users 
        WHERE email LIKE '%demo@vetsphere.com'
        ORDER BY role, email
      `);
      
      if (result.rowCount === 0) {
        console.log('No demo users found in the database.');
        console.log('Please restart the containers to initialize the demo data.');
        return;
      }
      
      console.log('\n=== VetSphere Demo User Credentials ===\n');
      
      for (const user of result.rows) {
        console.log(`${user.name} (${user.role})`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: demodemo`);
        
        try {
          if (user.role === 'veterinarian') {
            console.log(`VET ID: ${VET_DEMO_ID}`);
          } else if (user.role === 'admin') {
            console.log(`ORG ID: ${ORG_DEMO_ID}`);
          }
        } catch (err) {
          console.log('ID information not available - user may be malformed');
        }
        
        console.log('-----------------------------');
      }
      
      console.log('\nLogin Instructions:');
      console.log('1. Go to the login page');
      console.log('2. Select the appropriate user type');
      console.log('3. Enter the email and password above');
      console.log('4. For Veterinarian and Organization Admin, also enter the ID shown above');
      
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (err) {
    console.error('Error retrieving demo users:', err);
    console.log('Make sure the database is properly set up and the demo data has been loaded.');
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
getDemoUsers(); 