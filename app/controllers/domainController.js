const { query } = require('../utils/db');

/**
 * Get all domains
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllDomains = async (req, res) => {
  try {
    const result = await query('SELECT * FROM domains ORDER BY domain_id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: 'Server error fetching domains' });
  }
};

/**
 * Get a domain by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDomainById = async (req, res) => {
  const { id } = req.params;

  try {
    // Try to find by numeric ID first
    let result;
    if (!isNaN(id)) {
      result = await query('SELECT * FROM domains WHERE id = $1', [id]);
    }

    // If not found or ID is not numeric, try domain_id
    if (!result || result.rows.length === 0) {
      result = await query('SELECT * FROM domains WHERE domain_id = $1', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching domain:', error);
    res.status(500).json({ error: 'Server error fetching domain' });
  }
};

/**
 * Get controls for a domain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDomainControls = async (req, res) => {
  const { id } = req.params;
  const { level } = req.query;

  try {
    let query = 'SELECT * FROM controls WHERE domain_id = $1';
    const queryParams = [id];

    // Add filter for CMMC level if provided
    if (level) {
      query += ' AND cmmc_level = $2';
      queryParams.push(level);
    }

    query += ' ORDER BY control_id ASC';
    
    const result = await query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching domain controls:', error);
    res.status(500).json({ error: 'Server error fetching domain controls' });
  }
};

/**
 * Create a new domain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createDomain = async (req, res) => {
  const { domain_id, name, description } = req.body;

  // Validate required fields
  if (!domain_id || !name) {
    return res.status(400).json({ error: 'Domain ID and name are required' });
  }

  try {
    // Check if domain_id already exists
    const domainCheck = await query('SELECT * FROM domains WHERE domain_id = $1', [domain_id]);
    
    if (domainCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Domain ID already exists' });
    }

    // Insert new domain
    const result = await query(
      'INSERT INTO domains(domain_id, name, description) VALUES($1, $2, $3) RETURNING *',
      [domain_id, name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating domain:', error);
    res.status(500).json({ error: 'Server error creating domain' });
  }
};

/**
 * Update a domain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateDomain = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if domain exists
    const domainCheck = await query('SELECT * FROM domains WHERE id = $1 OR domain_id = $1', [id]);
    
    if (domainCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    const domain = domainCheck.rows[0];
    
    // Update domain
    const result = await query(
      'UPDATE domains SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name || domain.name, description || domain.description, domain.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating domain:', error);
    res.status(500).json({ error: 'Server error updating domain' });
  }
};

/**
 * Delete a domain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteDomain = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if domain exists
    const domainCheck = await query('SELECT * FROM domains WHERE id = $1 OR domain_id = $1', [id]);
    
    if (domainCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    // Delete domain
    await query('DELETE FROM domains WHERE id = $1', [domainCheck.rows[0].id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting domain:', error);
    res.status(500).json({ error: 'Server error deleting domain' });
  }
}; 