const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes for user management
// GET /api/users - Get all users (admin only)
router.get('/', authenticate, requireAdmin, userController.getAllUsers);

// GET /api/users/:id - Get user by ID (user can view own profile, admin can view any)
router.get('/:id', authenticate, userController.getUserById);

// POST /api/users - Create a new user (admin only)
router.post('/', authenticate, requireAdmin, userController.createUser);

// PUT /api/users/:id - Update user (user can update own profile, admin can update any)
router.put('/:id', authenticate, userController.updateUser);

// PUT /api/users/:id/change-password - Change password
router.put('/:id/change-password', authenticate, userController.changePassword);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

// GET /api/users/search - Search users by name or email
router.get('/search', authenticate, userController.searchUsers);

module.exports = router; 