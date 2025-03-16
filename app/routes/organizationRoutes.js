const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/organizations - Get all organizations
router.get('/', authenticateToken, organizationController.getAllOrganizations);

// GET /api/organizations/:id - Get organization by ID
router.get('/:id', authenticateToken, organizationController.getOrganizationById);

// POST /api/organizations - Create a new organization (admin only)
router.post('/', authenticateToken, requireAdmin, organizationController.createOrganization);

// PUT /api/organizations/:id - Update organization (admin only)
router.put('/:id', authenticateToken, requireAdmin, organizationController.updateOrganization);

// DELETE /api/organizations/:id - Delete organization (admin only)
router.delete('/:id', authenticateToken, requireAdmin, organizationController.deleteOrganization);

// GET /api/organizations/:id/users - Get users belonging to an organization
router.get('/:id/users', authenticateToken, organizationController.getOrganizationUsers);

// POST /api/organizations/:id/users - Add user to organization (admin only)
router.post('/:id/users', authenticateToken, requireAdmin, organizationController.addUserToOrganization);

// PUT /api/organizations/:id/users/:userId - Update user role in organization (admin only)
router.put('/:id/users/:userId', authenticateToken, requireAdmin, organizationController.updateUserRole);

// DELETE /api/organizations/:id/users/:userId - Remove user from organization (admin only)
router.delete('/:id/users/:userId', authenticateToken, requireAdmin, organizationController.removeUserFromOrganization);

module.exports = router; 