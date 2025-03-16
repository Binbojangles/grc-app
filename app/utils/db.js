const { Pool } = require('pg');
const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/db.log' })
  ]
});

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Event listeners for pool
pool.on('connect', () => {
  logger.info('Connected to the database');
});

pool.on('error', (err) => {
  logger.error('Database error', { error: err.message, stack: err.stack });
});

/**
 * Execute a query with error handling
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} - Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Query error', { 
      text, 
      error: err.message, 
      stack: err.stack 
    });
    throw err;
  }
};

/**
 * Get a client from the connection pool
 * @returns {Object} - Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Extend client with logging
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  // Override release method
  client.release = () => {
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

module.exports = {
  query,
  getClient,
  pool
}; 