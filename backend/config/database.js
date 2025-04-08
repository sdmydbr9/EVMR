const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create a new PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Additional connection options
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// The pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Simple query method
const query = (text, params) => pool.query(text, params);

// Get a client from the pool to run multiple queries in a transaction
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Initialize database tables if they don't exist
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop tables in reverse order of dependencies
    await client.query(`
      DROP TABLE IF EXISTS vaccinations CASCADE;
      DROP TABLE IF EXISTS deworming CASCADE;
      DROP TABLE IF EXISTS grooming CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS medical_records CASCADE;
      DROP TABLE IF EXISTS inventory_items CASCADE;
      DROP TABLE IF EXISTS patients CASCADE;
      DROP TABLE IF EXISTS pets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS owners CASCADE;
      DROP TABLE IF EXISTS clinics CASCADE;
    `);
    
    // Create clinics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clinics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create owners table
    await client.query(`
      CREATE TABLE IF NOT EXISTS owners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        clinic_id INTEGER REFERENCES clinics(id),
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create patients table with VARCHAR id
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        species VARCHAR(50) NOT NULL,
        breed VARCHAR(100),
        date_of_birth DATE,
        gender VARCHAR(10) NOT NULL,
        color VARCHAR(50),
        weight NUMERIC(5,2),
        microchip_id VARCHAR(50),
        owner_id INTEGER NOT NULL REFERENCES owners(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create pets table for pet parents
    await client.query(`
      CREATE TABLE IF NOT EXISTS pets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        species VARCHAR(50) NOT NULL,
        breed VARCHAR(100) NOT NULL,
        color VARCHAR(50),
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10) NOT NULL,
        is_neutered BOOLEAN DEFAULT FALSE,
        microchip_id VARCHAR(50),
        image_url VARCHAR(255) DEFAULT NULL,
        owner_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create vaccinations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vaccinations (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        vaccine_name VARCHAR(255) NOT NULL,
        date_administered DATE NOT NULL,
        next_due_date DATE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create deworming table
    await client.query(`
      CREATE TABLE IF NOT EXISTS deworming (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        medicine_name VARCHAR(255) NOT NULL,
        date_given DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create grooming table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grooming (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        service_type VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create medical records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL REFERENCES patients(id),
        visit_date TIMESTAMP NOT NULL,
        subjective TEXT,
        objective TEXT,
        assessment TEXT,
        plan TEXT,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id VARCHAR(50) NOT NULL REFERENCES patients(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        vet_id INTEGER REFERENCES users(id),
        appointment_type VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create inventory items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        unit VARCHAR(20) NOT NULL,
        current_quantity INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 10,
        cost_price NUMERIC(10,2),
        selling_price NUMERIC(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default clinic if it doesn't exist
    const clinicResult = await client.query(`
      INSERT INTO clinics (name, address, phone, email)
      VALUES ('Main Clinic', '123 Pet Street', '555-1234', 'clinic@example.com')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    
    const clinicId = clinicResult.rows[0]?.id || 1;
    
    // Check if admin user from env exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@evmr.com';
    
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );
    
    // If admin user doesn't exist, create it
    if (userResult.rowCount === 0) {
      // Get admin credentials from environment variables or use defaults
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminName = process.env.ADMIN_NAME || 'System Admin';
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Insert admin user
      await client.query(
        `INSERT INTO users (name, email, password, role, clinic_id) 
         VALUES ($1, $2, $3, $4, $5)`,
        [adminName, adminEmail, hashedPassword, 'admin', clinicId]
      );
      
      console.log(`Admin user created with email: ${adminEmail}`);
    }
    
    await client.query('COMMIT');
    
    console.log('Database tables initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database tables:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  getClient,
  initDatabase,
  pool
}; 