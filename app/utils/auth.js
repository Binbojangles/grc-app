const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('./db');

/**
 * Generate a JWT token for authenticated users
 * @param {Object} user - User object (without sensitive data)
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organization_id
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '8h' }
  );
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password to check
 * @param {string} hash - Stored password hash
 * @returns {Promise<boolean>} - Whether the password matches
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Authentication middleware for Express
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    
    // Log the authentication event
    logAuthEvent(decoded.userId, req.ip, 'authentication', 'success');
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Authorization middleware for role-based access control
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} - Express middleware
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Log authentication events
 * @param {number} userId - User ID
 * @param {string} ipAddress - User's IP address
 * @param {string} action - Authentication action
 * @param {string} result - Action result
 */
const logAuthEvent = async (userId, ipAddress, action, result) => {
  try {
    await query(
      'INSERT INTO audit_logs (user_id, action, entity_type, details, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, 'authentication', { result }, ipAddress]
    );
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  authenticate,
  authorize,
  logAuthEvent
}; 