const bcrypt = require('bcryptjs');
const { pool } = require('../utils/db');

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, organization_id, is_active, created_at, updated_at FROM users ORDER BY name'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * Get user by ID
 * Users can view their own profile, admins can view any profile
 */
const getUserById = async (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check if user is requesting their own profile or is an admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to view this profile' });
  }
  
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, organization_id, is_active, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

/**
 * Create a new user (admin only)
 */
const createUser = async (req, res) => {
  const { name, email, password, role, organization_id, is_active } = req.body;
  
  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  
  try {
    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, organization_id, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, role, organization_id, is_active, created_at, updated_at`,
      [name, email, hashedPassword, role || 'user', organization_id || null, is_active !== undefined ? is_active : true]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

/**
 * Update user
 * Users can update their own profile, admins can update any profile
 */
const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, role, organization_id, is_active } = req.body;
  
  // Check if user is updating their own profile or is an admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to update this profile' });
  }
  
  // Regular users cannot change their role or active status
  if (req.user.id === userId && req.user.role !== 'admin') {
    if (role && role !== req.user.role) {
      return res.status(403).json({ message: 'Regular users cannot change their role' });
    }
    if (is_active !== undefined && is_active !== req.user.is_active) {
      return res.status(403).json({ message: 'Regular users cannot change their active status' });
    }
  }
  
  try {
    // Check if email already exists (if changing email)
    if (email) {
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    
    if (role && req.user.role === 'admin') {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }
    
    if (organization_id !== undefined) {
      updates.push(`organization_id = $${paramIndex++}`);
      values.push(organization_id === null ? null : organization_id);
    }
    
    if (is_active !== undefined && req.user.role === 'admin') {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // Add userId to values array
    values.push(userId);
    
    // Execute update query
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex} 
       RETURNING id, name, email, role, organization_id, is_active, created_at, updated_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

/**
 * Change password
 * Users can change their own password, admins can change any password
 */
const changePassword = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { currentPassword, newPassword } = req.body;
  
  // Check if user is changing their own password or is an admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized to change this password' });
  }
  
  // Validate new password
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' });
  }
  
  try {
    // Get current user data
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is changing their own password, verify current password
    if (req.user.id === userId) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

/**
 * Delete user (admin only)
 */
const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Prevent deleting own account
  if (req.user.id === userId) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/**
 * Search users by name or email
 */
const searchUsers = async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  
  try {
    // Search for users by name or email, excluding the current user
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, organization_id FROM users 
       WHERE (name ILIKE $1 OR email ILIKE $1) AND id != $2 
       ORDER BY name LIMIT 10`,
      [`%${query}%`, req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  deleteUser,
  searchUsers
}; 