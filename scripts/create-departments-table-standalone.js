/**
 * This script creates the departments table if it doesn't exist
 * It can be run independently of the main application
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create a pool for database operations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// SQL to create departments table
const createDepartmentsTableQuery = `
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id INTEGER NOT NULL,
  parent_department_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL
);
`;

// SQL to create indices on departments table
const createIndicesQuery = `
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent_department_id ON departments(parent_department_id);
`;

// SQL to add department_id column to users table if it doesn't exist
const alterUsersTableQuery = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE users ADD COLUMN department_id INTEGER;
    ALTER TABLE users ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END
$$;
`;

async function setupDepartmentsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating departments table...');
    await client.query(createDepartmentsTableQuery);
    console.log('Departments table created or already exists.');

    console.log('Creating indices...');
    await client.query(createIndicesQuery);
    console.log('Indices created or already exist.');

    console.log('Adding department_id column to users table if needed...');
    await client.query(alterUsersTableQuery);
    console.log('Added department_id column to users table.');

    console.log('Departments database setup completed successfully!');
  } catch (err) {
    console.error('Error setting up departments:', err);
    throw err;
  } finally {
    client.release();
    // Close the pool to end the process
    pool.end();
  }
}

// Run the function
setupDepartmentsTable()
  .catch(err => {
    console.error('Failed to set up departments table:', err);
    process.exit(1);
  }); 