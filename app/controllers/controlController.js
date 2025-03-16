const { query } = require('../utils/db');

/**
 * Get all controls with optional filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllControls = async (req, res) => {
  const { domain, level } = req.query;
  
  try {
    let queryText = 'SELECT * FROM controls';
    const queryParams = [];
    const conditions = [];
    
    // Apply filters if provided
    if (domain) {
      queryParams.push(domain);
      conditions.push(`domain_id = $${queryParams.length}`);
    }
    
    if (level) {
      queryParams.push(level);
      conditions.push(`cmmc_level = $${queryParams.length}`);
    }
    
    // Add WHERE clause if filters were applied
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add sorting
    queryText += ' ORDER BY domain_id ASC, control_id ASC';
    
    const result = await query(queryText, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching controls:', error);
    res.status(500).json({ error: 'Server error fetching controls' });
  }
};

/**
 * Get a control by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getControlById = async (req, res) => {
  const { id } = req.params;

  try {
    // Try to find by numeric ID first
    let result;
    if (!isNaN(id)) {
      result = await query('SELECT * FROM controls WHERE id = $1', [id]);
    }

    // If not found or ID is not numeric, try control_id
    if (!result || result.rows.length === 0) {
      result = await query('SELECT * FROM controls WHERE control_id = $1', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Control not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching control:', error);
    res.status(500).json({ error: 'Server error fetching control' });
  }
};

/**
 * Create a new control
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createControl = async (req, res) => {
  const { 
    control_id, 
    domain_id, 
    name, 
    description, 
    cmmc_level,
    assessment_objective,
    discussion
  } = req.body;

  // Validate required fields
  if (!control_id || !domain_id || !name || !cmmc_level) {
    return res.status(400).json({ error: 'Control ID, domain ID, name, and CMMC level are required' });
  }

  try {
    // Check if control_id already exists
    const controlCheck = await query('SELECT * FROM controls WHERE control_id = $1', [control_id]);
    
    if (controlCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Control ID already exists' });
    }

    // Check if domain exists
    const domainCheck = await query('SELECT * FROM domains WHERE domain_id = $1', [domain_id]);
    
    if (domainCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Domain not found' });
    }

    // Insert new control
    const result = await query(
      'INSERT INTO controls(control_id, domain_id, name, description, cmmc_level, assessment_objective, discussion) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [control_id, domain_id, name, description, cmmc_level, assessment_objective, discussion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating control:', error);
    res.status(500).json({ error: 'Server error creating control' });
  }
};

/**
 * Update a control
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateControl = async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    cmmc_level,
    assessment_objective,
    discussion
  } = req.body;

  try {
    // Check if control exists
    const controlCheck = await query('SELECT * FROM controls WHERE id = $1 OR control_id = $1', [id]);
    
    if (controlCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Control not found' });
    }

    const control = controlCheck.rows[0];
    
    // Update control
    const result = await query(
      `UPDATE controls SET 
        name = $1, 
        description = $2, 
        cmmc_level = $3,
        assessment_objective = $4,
        discussion = $5,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $6 RETURNING *`,
      [
        name || control.name, 
        description || control.description, 
        cmmc_level || control.cmmc_level,
        assessment_objective || control.assessment_objective,
        discussion || control.discussion,
        control.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating control:', error);
    res.status(500).json({ error: 'Server error updating control' });
  }
};

/**
 * Delete a control
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteControl = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if control exists
    const controlCheck = await query('SELECT * FROM controls WHERE id = $1 OR control_id = $1', [id]);
    
    if (controlCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Control not found' });
    }

    // Delete control
    await query('DELETE FROM controls WHERE id = $1', [controlCheck.rows[0].id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting control:', error);
    res.status(500).json({ error: 'Server error deleting control' });
  }
}; 