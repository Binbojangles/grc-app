const express = require('express');
const router = express.Router();
const controlController = require('../controllers/controlController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET all controls with optional filtering
router.get('/', controlController.getAllControls);

// GET control by ID
router.get('/:id', controlController.getControlById);

// POST create new control
router.post('/', controlController.createControl);

// PUT update control
router.put('/:id', controlController.updateControl);

// DELETE control
router.delete('/:id', controlController.deleteControl);

module.exports = router; 