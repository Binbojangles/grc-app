/**
 * Middleware to check if the user is an admin
 * This should be used after the auth middleware
 */

module.exports = (req, res, next) => {
  // The auth middleware should have already set req.user
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if the user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // User is authenticated and is an admin
  next();
}; 