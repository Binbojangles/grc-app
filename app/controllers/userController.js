const bcrypt = require('bcryptjs');
const { query } = require('../utils/db');
const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/users.log' })
  ]
});

/**
 * Get all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, role, organization_id, is_active, created_at, updated_at FROM users',
      []
    );
    
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  
  try {
    const result = await query(
      'SELECT id, email, name, role, organization_id, is_active, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only allow users to view their own profile unless they're an admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error fetching user ${userId}:`, error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

/**
 * Create a new user (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createUser = async (req, res) => {
  const { email, password, name, role, organization_id } = req.body;
  
  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }
  
  // Validate roles
  const validRoles = ['admin', 'user', 'auditor', 'manager'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await query(
      'INSERT INTO users (email, password, name, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, organization_id, is_active, created_at, updated_at',
      [email, hashedPassword, name, role || 'user', organization_id || null]
    );
    
    const newUser = result.rows[0];
    
    logger.info(`User created: ${newUser.id} - ${newUser.email}`);
    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

/**
 * Update user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { email, name, role, organization_id, is_active } = req.body;
  
  // Only allow users to update their own profile unless they're an admin
  if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = existingUser.rows[0];
    
    // Prepare update fields
    const updates = {};
    
    if (email) updates.email = email;
    if (name) updates.name = name;
    
    // Role and organization changes are admin-only
    if (req.user.role === 'admin') {
      if (role) updates.role = role;
      if (organization_id !== undefined) updates.organization_id = organization_id;
      if (is_active !== undefined) updates.is_active = is_active;
    }
    
    // If no updates, return the current user
    if (Object.keys(updates).length === 0) {
      const result = await query(
        'SELECT id, email, name, role, organization_id, is_active, created_at, updated_at FROM users WHERE id = $1',
        [userId]
      );
      return res.json(result.rows[0]);
    }
    
    // Build the query
    let setClause = '';
    const values = [];
    let valueIndex = 1;
    
    Object.entries(updates).forEach(([key, value], index) => {
      setClause += `${index > 0 ? ', ' : ''}${key} = $${valueIndex}`;
      values.push(value);
      valueIndex++;
    });
    
    setClause += `, updated_at = CURRENT_TIMESTAMP`;
    values.push(userId);
    
    // Update user
    const result = await query(
      `UPDATE users SET ${setClause} WHERE id = $${valueIndex} RETURNING id, email, name, role, organization_id, is_active, created_at, updated_at`,
      values
    );
    
    logger.info(`User updated: ${userId}`);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error(`Error updating user ${userId}:`, error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.changePassword = async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  
  // Validate required fields
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }
  
  // Only allow users to change their own password unless they're an admin
  if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  try {
    // Get the user with password
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // For non-admin users, verify current password
    if (req.user.role !== 'admin') {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }
    
    // Password validation
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    await query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );
    
    logger.info(`Password changed for user: ${userId}`);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Error changing password for user ${userId}:`, error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
};

/**
 * Delete user by ID (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await query('DELETE FROM users WHERE id = $1', [userId]);
    
    logger.info(`User deleted: ${userId}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting user ${userId}:`, error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
}; 