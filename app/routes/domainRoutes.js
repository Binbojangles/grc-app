const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET all domains
router.get('/', domainController.getAllDomains);

// GET domain by ID
router.get('/:id', domainController.getDomainById);

// GET controls for a domain
router.get('/:id/controls', domainController.getDomainControls);

// POST create new domain
router.post('/', domainController.createDomain);

// PUT update domain
router.put('/:id', domainController.updateDomain);

// DELETE domain
router.delete('/:id', domainController.deleteDomain);

module.exports = router; 