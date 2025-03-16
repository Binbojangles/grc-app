const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

// Refresh token route
router.post('/refresh-token', authController.refreshToken);

// Validate token route
router.get('/validate', authController.validateToken);

// Logout route
router.post('/logout', authController.logout);

module.exports = router; 