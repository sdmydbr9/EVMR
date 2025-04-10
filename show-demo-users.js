#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Determine if we're in Docker environment
const isDocker = process.env.POSTGRES_HOST === 'evmr-db' || process.env.NODE_ENV === 'production';

// Database connection configuration
const dbConfig = isDocker ? 
  {
    user: process.env.POSTGRES_USER || 'evmr_user',
    password: process.env.DB_PASSWORD || 'postgres',
    host: 'evmr-db',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'evmr_database'
  } : 
  {
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'postgres'
  };

console.log('Using database configuration:');
console.log(`Host: ${dbConfig.host}, Database: ${dbConfig.database}`);
console.log(`User: ${dbConfig.user}, Port: ${dbConfig.port}`);

// Create a pool
const pool = new Pool(dbConfig);

async function getDemoUsers() {
  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Find all users with "demo" in their email
      const result = await client.query(`
        SELECT id, name, email, role, details 
        FROM users 
        WHERE email LIKE '%demo@petsphere.com'
        ORDER BY role, email
      `);
      
      if (result.rowCount === 0) {
        console.log('No demo users found in the database.');
        console.log('To create demo users, restart the application containers.');
        return;
      }
      
      console.log('\n=== PetSphere Demo User Credentials ===\n');
      
      for (const user of result.rows) {
        console.log(`${user.name} (${user.role})`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: demodemo`);
        
        try {
          if (user.role === 'veterinarian') {
            console.log(`VET ID: ${user.details.unique_id}`);
          } else if (user.role === 'admin') {
            console.log(`ORG ID: ${user.details.organisation_id}`);
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
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
getDemoUsers(); 