const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * @route   GET /api/utility/update-styles
 * @desc    Update the styles in the dist directory
 * @access  Public (for now, will be restricted to admin later)
 */
router.get('/update-styles', async (req, res) => {
  try {
    // Run the update-styles.js script
    exec('node scripts/update-styles.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing style update: ${error.message}`);
        return res.status(500).json({ 
          message: 'Failed to update styles',
          error: error.message,
          stderr
        });
      }
      
      if (stderr) {
        console.warn(`Style update stderr: ${stderr}`);
      }
      
      console.log(`Style update stdout: ${stdout}`);
      return res.json({ 
        message: 'Styles updated successfully',
        details: stdout
      });
    });
  } catch (err) {
    console.error(`Style update exception: ${err.message}`);
    res.status(500).json({ message: 'Error updating styles', error: err.message });
  }
});

/**
 * @route   GET /api/utility/health
 * @desc    Check system health
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 