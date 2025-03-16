const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully:', res.rows[0]);
  }
});

// API routes
app.use('/api/auth', require('./app/routes/authRoutes'));
app.use('/api/domains', require('./app/routes/domainRoutes'));
app.use('/api/controls', require('./app/routes/controlRoutes'));
app.use('/api/users', require('./app/routes/userRoutes'));
app.use('/api/organizations', require('./app/routes/organizationRoutes'));
// app.use('/api/assets', require('./app/routes/assets'));
// app.use('/api/policies', require('./app/routes/policies'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Serve Angular app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the Angular app
  app.use(express.static(path.join(__dirname, 'client/dist/grc-cmmc-client')));

  // Handle Angular routing
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'client/dist/grc-cmmc-client/index.html'));
  });
} else {
  // In development, serve static files too (so we can run everything in one container for testing)
  app.use(express.static(path.join(__dirname, 'client/dist/grc-cmmc-client')));
  
  // Handle Angular routing in development
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'client/dist/grc-cmmc-client/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 