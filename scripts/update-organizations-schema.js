const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Update organizations table to support hierarchy
 */
const updateOrganizationsSchema = async () => {
  const client = await pool.connect();
  try {
    console.log('Adding parent_organization_id column to organizations table...');
    
    // Check if the column already exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' AND column_name = 'parent_organization_id'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add parent_organization_id column with foreign key reference
      await client.query(`
        ALTER TABLE organizations
        ADD COLUMN parent_organization_id INTEGER REFERENCES organizations(id);
      `);
      console.log('Successfully added parent_organization_id column to organizations table!');
    } else {
      console.log('Column parent_organization_id already exists in organizations table.');
    }
    
  } catch (error) {
    console.error('Error updating organizations schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the update
updateOrganizationsSchema().catch(err => {
  console.error('Organizations schema update failed:', err);
  process.exit(1);
}); 