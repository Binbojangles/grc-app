const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Initialize database schema
 */
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Initializing database schema...');
    
    // Read SQL schema file
    const schemaPath = path.join(__dirname, '../app/utils/database.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Modify CREATE TABLE statements to include IF NOT EXISTS
    schema = schema.replace(/CREATE TABLE (?!IF NOT EXISTS)/g, 'CREATE TABLE IF NOT EXISTS ');
    
    // Modify CREATE INDEX statements to include IF NOT EXISTS
    schema = schema.replace(/CREATE INDEX (?!IF NOT EXISTS)/g, 'CREATE INDEX IF NOT EXISTS ');
    
    // Execute SQL schema
    await client.query(schema);
    
    console.log('Database schema initialized successfully!');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the initialization
initializeDatabase().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
}); 