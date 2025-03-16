const { pool } = require('../utils/db');

/**
 * Get all organizations
 */
const getAllOrganizations = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, industry, size, cmmc_target_level, parent_organization_id, created_at, updated_at FROM organizations ORDER BY name'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Failed to fetch organizations' });
  }
};

/**
 * Get organization by ID
 */
const getOrganizationById = async (req, res) => {
  const orgId = parseInt(req.params.id);
  
  try {
    const result = await pool.query(
      'SELECT id, name, industry, size, cmmc_target_level, parent_organization_id, created_at, updated_at FROM organizations WHERE id = $1',
      [orgId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Failed to fetch organization' });
  }
};

/**
 * Create a new organization (admin only)
 */
const createOrganization = async (req, res) => {
  const { name, industry, size, cmmc_target_level, parent_organization_id } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Organization name is required' });
  }
  
  if (!cmmc_target_level) {
    return res.status(400).json({ message: 'CMMC target level is required' });
  }
  
  try {
    // Validate parent organization if provided
    if (parent_organization_id) {
      const parentCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [parent_organization_id]);
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Parent organization not found' });
      }
    }
    
    // Insert new organization
    const result = await pool.query(
      `INSERT INTO organizations (name, industry, size, cmmc_target_level, parent_organization_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, industry, size, cmmc_target_level, parent_organization_id, created_at, updated_at`,
      [name, industry || null, size || null, cmmc_target_level, parent_organization_id || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Failed to create organization' });
  }
};

/**
 * Update organization
 */
const updateOrganization = async (req, res) => {
  const orgId = parseInt(req.params.id);
  const { name, industry, size, cmmc_target_level, parent_organization_id } = req.body;
  
  try {
    // Prevent circular references in hierarchy
    if (parent_organization_id) {
      if (parent_organization_id === orgId) {
        return res.status(400).json({ message: 'Organization cannot be its own parent' });
      }
      
      // Check if parent exists
      const parentCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [parent_organization_id]);
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Parent organization not found' });
      }
      
      // Check for circular reference in the hierarchy
      let currentParentId = parent_organization_id;
      while (currentParentId) {
        if (currentParentId === orgId) {
          return res.status(400).json({ message: 'Circular reference detected in organization hierarchy' });
        }
        
        const parentResult = await pool.query('SELECT parent_organization_id FROM organizations WHERE id = $1', [currentParentId]);
        if (parentResult.rows.length === 0 || !parentResult.rows[0].parent_organization_id) {
          break;
        }
        currentParentId = parentResult.rows[0].parent_organization_id;
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
    
    if (industry !== undefined) {
      updates.push(`industry = $${paramIndex++}`);
      values.push(industry);
    }
    
    if (size !== undefined) {
      updates.push(`size = $${paramIndex++}`);
      values.push(size);
    }
    
    if (cmmc_target_level !== undefined) {
      updates.push(`cmmc_target_level = $${paramIndex++}`);
      values.push(cmmc_target_level);
    }
    
    if (parent_organization_id !== undefined) {
      updates.push(`parent_organization_id = $${paramIndex++}`);
      values.push(parent_organization_id === null ? null : parent_organization_id);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // Add orgId to values array
    values.push(orgId);
    
    // Execute update query
    const result = await pool.query(
      `UPDATE organizations SET ${updates.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex} 
       RETURNING id, name, industry, size, cmmc_target_level, parent_organization_id, created_at, updated_at`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Failed to update organization' });
  }
};

/**
 * Delete organization (admin only)
 */
const deleteOrganization = async (req, res) => {
  const orgId = parseInt(req.params.id);
  
  try {
    // Check if organization has associated users
    const userCheck = await pool.query('SELECT COUNT(*) FROM users WHERE organization_id = $1', [orgId]);
    if (parseInt(userCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete organization with associated users. Reassign or delete users first.' 
      });
    }
    
    // Check if organization has child organizations
    const childCheck = await pool.query('SELECT COUNT(*) FROM organizations WHERE parent_organization_id = $1', [orgId]);
    if (parseInt(childCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete organization with child organizations. Update or delete child organizations first.' 
      });
    }
    
    const result = await pool.query('DELETE FROM organizations WHERE id = $1 RETURNING id', [orgId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Failed to delete organization' });
  }
};

/**
 * Get users belonging to an organization
 */
const getOrganizationUsers = async (req, res) => {
  const orgId = parseInt(req.params.id);
  
  try {
    // Check if organization exists
    const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    const result = await pool.query(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE organization_id = $1 ORDER BY name',
      [orgId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching organization users:', error);
    res.status(500).json({ message: 'Failed to fetch organization users' });
  }
};

/**
 * Add a user to an organization (admin only)
 */
const addUserToOrganization = async (req, res) => {
  const orgId = parseInt(req.params.id);
  const { userId, role } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  const validRoles = ['admin', 'manager', 'auditor', 'user'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    // Check if organization exists
    const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id, organization_id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already in an organization
    if (userCheck.rows[0].organization_id !== null) {
      if (userCheck.rows[0].organization_id === orgId) {
        return res.status(400).json({ message: 'User is already a member of this organization' });
      } else {
        return res.status(400).json({ message: 'User is already a member of another organization' });
      }
    }
    
    // Add user to organization
    const result = await pool.query(
      'UPDATE users SET organization_id = $1, role = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, is_active, created_at, updated_at',
      [orgId, role || 'user', userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user to organization:', error);
    res.status(500).json({ message: 'Failed to add user to organization' });
  }
};

/**
 * Update a user's role in an organization (admin only)
 */
const updateUserRole = async (req, res) => {
  const orgId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);
  const { role } = req.body;
  
  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }
  
  const validRoles = ['admin', 'manager', 'auditor', 'user'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  try {
    // Check if organization exists
    const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Check if user belongs to the organization
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND organization_id = $2', [userId, orgId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found in this organization' });
    }
    
    // Update user role
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 AND organization_id = $3 RETURNING id, name, email, role, is_active, created_at, updated_at',
      [role, userId, orgId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

/**
 * Remove a user from an organization (admin only)
 */
const removeUserFromOrganization = async (req, res) => {
  const orgId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);
  
  try {
    // Check if organization exists
    const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Check if user belongs to the organization
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND organization_id = $2', [userId, orgId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found in this organization' });
    }
    
    // Remove user from organization
    await pool.query(
      'UPDATE users SET organization_id = NULL, role = $1, updated_at = NOW() WHERE id = $2 AND organization_id = $3',
      ['user', userId, orgId]
    );
    
    res.json({ message: 'User removed from organization successfully' });
  } catch (error) {
    console.error('Error removing user from organization:', error);
    res.status(500).json({ message: 'Failed to remove user from organization' });
  }
};

/**
 * Get child organizations of a parent organization
 */
const getChildOrganizations = async (req, res) => {
  const parentOrgId = parseInt(req.params.id);
  
  try {
    // Check if parent organization exists
    const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [parentOrgId]);
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Parent organization not found' });
    }
    
    const result = await pool.query(
      'SELECT id, name, industry, size, cmmc_target_level, parent_organization_id, created_at, updated_at FROM organizations WHERE parent_organization_id = $1 ORDER BY name',
      [parentOrgId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching child organizations:', error);
    res.status(500).json({ message: 'Failed to fetch child organizations' });
  }
};

/**
 * Get organization hierarchy
 */
const getOrganizationHierarchy = async (req, res) => {
  try {
    // Get all organizations
    const result = await pool.query(
      'SELECT id, name, industry, size, cmmc_target_level, parent_organization_id, created_at, updated_at FROM organizations ORDER BY name'
    );
    
    // Build hierarchy
    const organizations = result.rows;
    const orgMap = {};
    const rootOrgs = [];
    
    // First pass: create map of all organizations
    organizations.forEach(org => {
      org.children = [];
      orgMap[org.id] = org;
    });
    
    // Second pass: establish parent-child relationships
    organizations.forEach(org => {
      if (org.parent_organization_id) {
        if (orgMap[org.parent_organization_id]) {
          orgMap[org.parent_organization_id].children.push(org);
        }
      } else {
        rootOrgs.push(org);
      }
    });
    
    res.json(rootOrgs);
  } catch (error) {
    console.error('Error fetching organization hierarchy:', error);
    res.status(500).json({ message: 'Failed to fetch organization hierarchy' });
  }
};

module.exports = {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  addUserToOrganization,
  updateUserRole,
  removeUserFromOrganization,
  getChildOrganizations,
  getOrganizationHierarchy
}; 