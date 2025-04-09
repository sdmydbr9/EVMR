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

// Create a random alphanumeric string of specified length
const generateRandomString = (length = 8) => {
  return require('crypto')
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
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
      DROP TABLE IF EXISTS schedules CASCADE;
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

    // Create weight tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS weight_records (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        weight NUMERIC(5,2) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create quality of life assessment table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quality_of_life (
        id SERIAL PRIMARY KEY,
        pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        mobility INTEGER NOT NULL CHECK (mobility BETWEEN 1 AND 5),
        comfort INTEGER NOT NULL CHECK (comfort BETWEEN 1 AND 5),
        happiness INTEGER NOT NULL CHECK (happiness BETWEEN 1 AND 5),
        appetite INTEGER NOT NULL CHECK (appetite BETWEEN 1 AND 5),
        hygiene INTEGER NOT NULL CHECK (hygiene BETWEEN 1 AND 5),
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

    // Create doctors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        current_quantity INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 0,
        cost_price DECIMAL(10,2),
        selling_price DECIMAL(10,2),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create schedules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES users(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        recurrence_type VARCHAR(20),
        recurrence_interval INTEGER,
        recurrence_end_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create service types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        clinic_id INTEGER REFERENCES clinics(id),
        created_by INTEGER REFERENCES users(id),
        requiresDoctor BOOLEAN DEFAULT TRUE,
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add other necessary indices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
      CREATE INDEX IF NOT EXISTS idx_patients_owner_id ON patients(owner_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON appointments(vet_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
      CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
      CREATE INDEX IF NOT EXISTS idx_schedules_doctor_id ON schedules(doctor_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON schedules(start_time);
    `);

    // Insert default clinic if it doesn't exist
    const clinicResult = await client.query(`
      INSERT INTO clinics (name, address, phone, email)
      VALUES ('Main Clinic', '123 Pet Street', '555-1234', 'clinic@example.com')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    const clinicId = clinicResult.rows[0]?.id || 1;

    // Create a demo clinic
    const demoClinicResult = await client.query(`
      INSERT INTO clinics (name, address, phone, email)
      VALUES ('Demo Veterinary Clinic', '123 Demo Street, Demo City', '555-DEMO-123', 'demo@veterinaryclinic.com')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);

    const demoClinicId = demoClinicResult.rows[0]?.id || clinicId;

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

    // Add demo users if they don't exist
    const demoEmailPrefix = ['petparent_demo', 'vet_demo', 'org_demo'];
    const demoPassword = 'demodemo';
    const salt = await bcrypt.genSalt(10);
    const hashedDemoPassword = await bcrypt.hash(demoPassword, salt);
    
    // Generate IDs for the vet and org admin
    const vetId = 'VET-' + generateRandomString(8);
    const orgId = 'ORG-' + generateRandomString(8);

    // Check if demo users exist
    const demoUsersCheckResult = await client.query(
      "SELECT email FROM users WHERE email LIKE '%_demo@evmr.com'"
    );

    if (demoUsersCheckResult.rowCount === 0) {
      // 1. Create PET PARENT demo user
      const petParentDetails = {
        phone: '555-1111-DEMO',
        subscribe: true,
        registrationDate: new Date().toISOString(),
        petTypes: ['Dog', 'Cat', 'Bird'],
        preferredClinic: 'Demo Veterinary Clinic'
      };
      
      const petParentResult = await client.query(
        `INSERT INTO users
         (name, email, password, role, status, details, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          'Demo Pet Parent',
          'petparent_demo@evmr.com',
          hashedDemoPassword,
          'client',
          'active',
          JSON.stringify(petParentDetails)
        ]
      );
      const petParentId = petParentResult.rows[0].id;
      
      // Add demo pets for the pet parent
      try {
        await client.query(
          `INSERT INTO pets
           (name, species, breed, color, date_of_birth, gender, is_neutered, microchip_id, owner_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            'Buddy',
            'Dog',
            'Golden Retriever',
            'Golden',
            '2020-01-15', // Date of birth
            'Male',
            true, // is_neutered
            'DEMO-CHIP-001',
            petParentId
          ]
        );
      } catch (petError) {
        console.warn('Could not create demo pet - table may not exist or have a different schema:', petError.message);
      }
      
      // 2. Create VET demo user
      const vetDetails = {
        phone: '555-2222-DEMO',
        subscribe: true,
        registrationDate: new Date().toISOString(),
        specialties: ['General Practice', 'Surgery', 'Cardiology'],
        yearsOfExperience: '10',
        licenseNumber: 'DEMO-LICENSE-12345',
        unique_id: vetId
      };
      
      await client.query(
        `INSERT INTO users
         (name, email, password, role, clinic_id, status, details, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          'Demo Veterinarian',
          'vet_demo@evmr.com',
          hashedDemoPassword,
          'veterinarian',
          demoClinicId,
          'active',
          JSON.stringify(vetDetails)
        ]
      );
      
      // 3. Create ORGANIZATION ADMIN demo user
      const orgDetails = {
        phone: '555-3333-DEMO',
        subscribe: true,
        registrationDate: new Date().toISOString(),
        country: 'Demo Country',
        teamSize: '15-30',
        organisation_id: orgId,
        clinicDetails: {
          name: 'Demo Veterinary Clinic',
          address: '123 Demo Street, Demo City',
          phone: '555-DEMO-123',
          email: 'demo@veterinaryclinic.com'
        }
      };
      
      await client.query(
        `INSERT INTO users
         (name, email, password, role, clinic_id, status, details, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          'Demo Organization Admin',
          'org_demo@evmr.com',
          hashedDemoPassword,
          'admin',
          demoClinicId,
          'active',
          JSON.stringify(orgDetails)
        ]
      );
      
      console.log('Demo users created successfully:');
      console.log('- Pet Parent: petparent_demo@evmr.com / demodemo');
      console.log(`- Veterinarian: vet_demo@evmr.com / demodemo (VET ID: ${vetId})`);
      console.log(`- Organization Admin: org_demo@evmr.com / demodemo (ORG ID: ${orgId})`);
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