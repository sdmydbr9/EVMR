const { Pool } = require('pg');

// Create a new PostgreSQL connection pool
// This will use the same database as the main service
const pool = new Pool({
  // Use the DATABASE_URL if provided, otherwise construct from individual params
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
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

// Initialize admin database tables if they don't exist
const initAdminDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create pending_registrations table if it doesn't exist
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
    
    await client.query('COMMIT');
    console.log('Admin service database tables initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing admin database tables:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  query,
  getClient,
  pool,
  initAdminDatabase
}; 