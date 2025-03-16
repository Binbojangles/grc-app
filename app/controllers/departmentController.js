const { pool } = require('../utils/db');

/**
 * Get all departments for an organization
 */
const getDepartments = async (req, res) => {
  const organizationId = parseInt(req.query.organizationId);
  
  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required' });
  }
  
  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.description, d.organization_id, d.parent_department_id, 
              d.created_at, d.updated_at,
              o.name as organization_name,
              pd.name as parent_department_name,
              (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id) as user_count
       FROM departments d
       LEFT JOIN organizations o ON d.organization_id = o.id
       LEFT JOIN departments pd ON d.parent_department_id = pd.id
       WHERE d.organization_id = $1
       ORDER BY d.name`,
      [organizationId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  
  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.description, d.organization_id, d.parent_department_id, 
              d.created_at, d.updated_at,
              o.name as organization_name,
              pd.name as parent_department_name
       FROM departments d
       LEFT JOIN organizations o ON d.organization_id = o.id
       LEFT JOIN departments pd ON d.parent_department_id = pd.id
       WHERE d.id = $1`,
      [departmentId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Failed to fetch department' });
  }
};

/**
 * Create a new department
 */
const createDepartment = async (req, res) => {
  const { name, description, organization_id, parent_department_id } = req.body;
  
  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: 'Department name is required' });
  }
  
  if (!organization_id) {
    return res.status(400).json({ message: 'Organization ID is required' });
  }
  
  try {
    // Validate organization exists
    const orgCheck = await pool.query('SELECT id FROM organizations WHERE id = $1', [organization_id]);
    if (orgCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Organization not found' });
    }
    
    // Validate parent department if provided
    if (parent_department_id) {
      const parentCheck = await pool.query(
        'SELECT id, organization_id FROM departments WHERE id = $1', 
        [parent_department_id]
      );
      
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Parent department not found' });
      }
      
      // Ensure parent department belongs to the same organization
      if (parentCheck.rows[0].organization_id !== organization_id) {
        return res.status(400).json({ 
          message: 'Parent department must belong to the same organization' 
        });
      }
    }
    
    // Insert new department
    const result = await pool.query(
      `INSERT INTO departments (name, description, organization_id, parent_department_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, description, organization_id, parent_department_id, created_at, updated_at`,
      [name, description || null, organization_id, parent_department_id || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Failed to create department' });
  }
};

/**
 * Update department
 */
const updateDepartment = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  const { name, description, parent_department_id } = req.body;
  
  try {
    // Check if department exists and get its organization_id
    const departmentCheck = await pool.query(
      'SELECT id, organization_id FROM departments WHERE id = $1',
      [departmentId]
    );
    
    if (departmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const organization_id = departmentCheck.rows[0].organization_id;
    
    // Validate parent department if provided
    if (parent_department_id) {
      // Prevent circular references
      if (parent_department_id === departmentId) {
        return res.status(400).json({ message: 'Department cannot be its own parent' });
      }
      
      const parentCheck = await pool.query(
        'SELECT id, organization_id FROM departments WHERE id = $1', 
        [parent_department_id]
      );
      
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Parent department not found' });
      }
      
      // Ensure parent department belongs to the same organization
      if (parentCheck.rows[0].organization_id !== organization_id) {
        return res.status(400).json({ 
          message: 'Parent department must belong to the same organization' 
        });
      }
      
      // Check for circular reference in the hierarchy
      let currentParentId = parent_department_id;
      while (currentParentId) {
        if (currentParentId === departmentId) {
          return res.status(400).json({ 
            message: 'Circular reference detected in department hierarchy' 
          });
        }
        
        const parentResult = await pool.query(
          'SELECT parent_department_id FROM departments WHERE id = $1',
          [currentParentId]
        );
        
        if (parentResult.rows.length === 0 || !parentResult.rows[0].parent_department_id) {
          break;
        }
        
        currentParentId = parentResult.rows[0].parent_department_id;
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
    
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    
    if (parent_department_id !== undefined) {
      updates.push(`parent_department_id = $${paramIndex++}`);
      values.push(parent_department_id === null ? null : parent_department_id);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    
    // Add departmentId to values array
    values.push(departmentId);
    
    // Execute update query
    const result = await pool.query(
      `UPDATE departments 
       SET ${updates.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex} 
       RETURNING id, name, description, organization_id, parent_department_id, created_at, updated_at`,
      values
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Failed to update department' });
  }
};

/**
 * Delete department
 */
const deleteDepartment = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  
  try {
    // Check if department has associated users
    const userCheck = await pool.query('SELECT COUNT(*) FROM users WHERE department_id = $1', [departmentId]);
    if (parseInt(userCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with associated users. Reassign users first.' 
      });
    }
    
    // Check if department has child departments
    const childCheck = await pool.query('SELECT COUNT(*) FROM departments WHERE parent_department_id = $1', [departmentId]);
    if (parseInt(childCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete department with child departments. Update or delete child departments first.' 
      });
    }
    
    const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [departmentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Failed to delete department' });
  }
};

/**
 * Get users in a department
 */
const getDepartmentUsers = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, is_active, created_at, updated_at 
       FROM users 
       WHERE department_id = $1 
       ORDER BY name`,
      [departmentId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching department users:', error);
    res.status(500).json({ message: 'Failed to fetch department users' });
  }
};

/**
 * Get child departments
 */
const getChildDepartments = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  
  try {
    const result = await pool.query(
      `SELECT id, name, description, organization_id, parent_department_id, created_at, updated_at 
       FROM departments 
       WHERE parent_department_id = $1 
       ORDER BY name`,
      [departmentId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching child departments:', error);
    res.status(500).json({ message: 'Failed to fetch child departments' });
  }
};

/**
 * Assign a user to a department
 */
const assignUserToDepartment = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    // Check if department exists
    const departmentCheck = await pool.query('SELECT id, organization_id FROM departments WHERE id = $1', [departmentId]);
    if (departmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const organizationId = departmentCheck.rows[0].organization_id;
    
    // Check if user exists and belongs to the same organization
    const userCheck = await pool.query(
      'SELECT id, organization_id FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (userCheck.rows[0].organization_id !== organizationId) {
      return res.status(400).json({
        message: 'User must belong to the same organization as the department'
      });
    }
    
    // Update user's department
    await pool.query(
      'UPDATE users SET department_id = $1, updated_at = NOW() WHERE id = $2',
      [departmentId, userId]
    );
    
    res.json({ message: 'User assigned to department successfully' });
  } catch (error) {
    console.error('Error assigning user to department:', error);
    res.status(500).json({ message: 'Failed to assign user to department' });
  }
};

/**
 * Remove a user from a department
 */
const removeUserFromDepartment = async (req, res) => {
  const departmentId = parseInt(req.params.id);
  const userId = parseInt(req.params.userId);
  
  try {
    // Check if user belongs to the department
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND department_id = $2',
      [userId, departmentId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found in this department' });
    }
    
    // Remove user from department
    await pool.query(
      'UPDATE users SET department_id = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );
    
    res.json({ message: 'User removed from department successfully' });
  } catch (error) {
    console.error('Error removing user from department:', error);
    res.status(500).json({ message: 'Failed to remove user from department' });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentUsers,
  getChildDepartments,
  assignUserToDepartment,
  removeUserFromDepartment
}; 