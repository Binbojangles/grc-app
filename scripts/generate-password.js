const bcrypt = require('bcryptjs');

// Password to hash
const password = 'Password123!';

// Generate a salt
bcrypt.genSalt(10)
  .then(salt => {
    // Hash password
    return bcrypt.hash(password, salt);
  })
  .then(hash => {
    console.log('Password:', password);
    console.log('Hash:', hash);
  })
  .catch(err => {
    console.error('Error generating hash:', err);
  }); 