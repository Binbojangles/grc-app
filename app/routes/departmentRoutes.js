const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/departments - Get all departments for an organization
router.get('/', authenticateToken, departmentController.getDepartments);

// GET /api/departments/:id - Get department by ID
router.get('/:id', authenticateToken, departmentController.getDepartmentById);

// POST /api/departments - Create a new department (admin only)
router.post('/', authenticateToken, requireAdmin, departmentController.createDepartment);

// PUT /api/departments/:id - Update department (admin only)
router.put('/:id', authenticateToken, requireAdmin, departmentController.updateDepartment);

// DELETE /api/departments/:id - Delete department (admin only)
router.delete('/:id', authenticateToken, requireAdmin, departmentController.deleteDepartment);

// GET /api/departments/:id/users - Get users in a department
router.get('/:id/users', authenticateToken, departmentController.getDepartmentUsers);

// GET /api/departments/:id/children - Get child departments
router.get('/:id/children', authenticateToken, departmentController.getChildDepartments);

// POST /api/departments/:id/users - Assign a user to a department (admin only)
router.post('/:id/users', authenticateToken, requireAdmin, departmentController.assignUserToDepartment);

// DELETE /api/departments/:id/users/:userId - Remove a user from a department (admin only)
router.delete('/:id/users/:userId', authenticateToken, requireAdmin, departmentController.removeUserFromDepartment);

module.exports = router; 