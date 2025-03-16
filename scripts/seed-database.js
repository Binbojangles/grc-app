const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to create directory structure if it doesn't exist
const createDirectoryIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Create necessary directories
createDirectoryIfNotExists(path.join(__dirname, '../database/seeds'));

// Read domain and control data
const getDomainData = () => {
  try {
    const domainsPath = path.join(__dirname, '../database/seeds/domains.json');
    
    // Check if the file exists
    if (fs.existsSync(domainsPath)) {
      const data = fs.readFileSync(domainsPath, 'utf8');
      return JSON.parse(data);
    } else {
      console.log('Domains data file not found. Using sample data.');
      // Return sample domain data if file doesn't exist
      return [
        { domain_id: 'AC', name: 'Access Control', description: 'Limit system access to authorized users, processes, and devices, and to authorized activities and transactions.' },
        { domain_id: 'SI', name: 'System and Information Integrity', description: 'Ensure system and information integrity through monitoring and timely updates.' }
      ];
    }
  } catch (error) {
    console.error('Error reading domain data:', error);
    return [];
  }
};

const getControlData = () => {
  try {
    const controlsPath = path.join(__dirname, '../database/seeds/controls.json');
    
    // Check if the file exists
    if (fs.existsSync(controlsPath)) {
      const data = fs.readFileSync(controlsPath, 'utf8');
      return JSON.parse(data);
    } else {
      console.log('Controls data file not found. Using sample data.');
      // Return sample control data if file doesn't exist
      return [
        {
          control_id: 'AC.1.001',
          domain_id: 'AC',
          name: 'Limit information system access to authorized users, processes acting on behalf of authorized users, and devices (including other information systems).',
          description: 'Access control policies control access between active entities and passive entities in systems.',
          cmmc_level: '1',
          assessment_objective: 'Limit information system access to authorized users.',
          discussion: 'Access control policies control access between users and systems.'
        }
      ];
    }
  } catch (error) {
    console.error('Error reading control data:', error);
    return [];
  }
};

// Seed domains table
const seedDomains = async (domains) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear existing domains
    await client.query('TRUNCATE domains CASCADE');
    console.log('Cleared domains table');
    
    // Insert domains
    for (const domain of domains) {
      await client.query(
        'INSERT INTO domains(domain_id, name, description) VALUES($1, $2, $3)',
        [domain.domain_id, domain.name, domain.description]
      );
    }
    
    await client.query('COMMIT');
    console.log(`Inserted ${domains.length} domains`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding domains:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Seed controls table
const seedControls = async (controls) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear existing controls
    await client.query('TRUNCATE controls CASCADE');
    console.log('Cleared controls table');
    
    // Insert controls
    for (const control of controls) {
      await client.query(
        `INSERT INTO controls(
          control_id, domain_id, name, description, cmmc_level, 
          assessment_objective, discussion
        ) VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [
          control.control_id, 
          control.domain_id, 
          control.name, 
          control.description, 
          control.cmmc_level,
          control.assessment_objective, 
          control.discussion
        ]
      );
    }
    
    await client.query('COMMIT');
    console.log(`Inserted ${controls.length} controls`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding controls:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Create sample organization and user for testing
const createSampleData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if sample organization exists
    const orgResult = await client.query('SELECT * FROM organizations WHERE name = $1', ['Sample Organization']);
    
    let organizationId;
    if (orgResult.rows.length === 0) {
      // Create sample organization
      const orgInsert = await client.query(
        'INSERT INTO organizations(name, industry, size, cmmc_target_level) VALUES($1, $2, $3, $4) RETURNING id',
        ['Sample Organization', 'Defense', 'Medium', '2']
      );
      organizationId = orgInsert.rows[0].id;
      console.log('Created sample organization');
    } else {
      organizationId = orgResult.rows[0].id;
      console.log('Sample organization already exists');
    }
    
    // Check if sample admin user exists
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    
    if (userResult.rows.length === 0) {
      // Create sample admin user with password 'Password123!'
      await client.query(
        'INSERT INTO users(email, password, name, role, organization_id) VALUES($1, $2, $3, $4, $5)',
        ['admin@example.com', '$2a$10$CT9aOaMHbUZMe7E7eiTyN.4pNIL0P6krGRQaU0aVeZUrf11Cmbzxu', 'Admin User', 'admin', organizationId]
      );
      console.log('Created sample admin user');
    } else {
      console.log('Sample admin user already exists');
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating sample data:', error);
  } finally {
    client.release();
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    const domains = getDomainData();
    const controls = getControlData();
    
    if (domains.length > 0) {
      await seedDomains(domains);
    }
    
    if (controls.length > 0) {
      await seedControls(controls);
    }
    
    await createSampleData();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    pool.end();
  }
};

// Run the seeding process
seedDatabase(); 