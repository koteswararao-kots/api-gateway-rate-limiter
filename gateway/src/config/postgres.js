const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5433,
  user: process.env.POSTGRES_USER || 'gateway',
  password: process.env.POSTGRES_PASSWORD || 'gateway_password',
  database: process.env.POSTGRES_DB || 'api_gateway',
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (error) => {
  console.error('PostgreSQL error:', error);
});

module.exports = pool;