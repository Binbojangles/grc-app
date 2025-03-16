const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  
  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // Add the user info to the request object
    req.user = user;
    next();
  });
};

/**
 * Middleware to check admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.requireAdmin = (req, res, next) => {
  // User should be set by the authenticateToken middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  next();
}; 