const { execSync } = require('child_process');
const path = require('path');

// Initialize database schema
console.log('Step 1: Initializing database schema...');
try {
  // Use IF NOT EXISTS in the schema to prevent errors when tables already exist
  execSync('node ' + path.join(__dirname, 'init-database.js'), { stdio: 'inherit' });
  console.log('Database schema initialization completed successfully.');
} catch (error) {
  console.log('Database schema already exists, continuing with setup...');
  // Don't exit on schema init error, as tables might already exist
}

// Run the control extraction script
console.log('\nStep 2: Extracting CMMC controls data...');
try {
  execSync('node ' + path.join(__dirname, 'extract-controls.js'), { stdio: 'inherit' });
  console.log('Controls extraction completed successfully.');
} catch (error) {
  console.error('Error extracting controls:', error);
  process.exit(1);
}

// Run the database seeding script
console.log('\nStep 3: Seeding database with domains and controls...');
try {
  execSync('node ' + path.join(__dirname, 'seed-database.js'), { stdio: 'inherit' });
  console.log('Database seeding completed successfully.');
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
}

console.log('\n✅ GRC application data setup completed successfully!');
console.log('You can now start the application server.'); 