const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Create departments table
 */
const createDepartmentsTable = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating departments table...');
    
    // Check if the table already exists
    const checkResult = await client.query(`
      SELECT to_regclass('public.departments') as exists;
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('Departments table already exists.');
      return;
    }
    
    // Create departments table
    await client.query(`
      CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        organization_id INTEGER REFERENCES organizations(id) NOT NULL,
        parent_department_id INTEGER REFERENCES departments(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indices
    await client.query(`
      CREATE INDEX idx_departments_organization ON departments(organization_id);
      CREATE INDEX idx_departments_parent ON departments(parent_department_id);
    `);
    
    // Add department_id column to users table
    const checkUserColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'department_id'
    `);
    
    if (checkUserColumn.rows.length === 0) {
      await client.query(`
        ALTER TABLE users
        ADD COLUMN department_id INTEGER REFERENCES departments(id);
      `);
      console.log('Added department_id column to users table.');
    }
    
    console.log('Successfully created departments table!');
    
  } catch (error) {
    console.error('Error creating departments table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the creation
createDepartmentsTable().catch(err => {
  console.error('Department table creation failed:', err);
  process.exit(1);
}); 