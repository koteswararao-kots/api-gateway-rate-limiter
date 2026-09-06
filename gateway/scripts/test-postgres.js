const pool = require('../src/config/postgres');

const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log('PostgreSQL connection successful');
    console.log('Database time:', result.rows[0].now);
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  } finally {
    await pool.end();
  }
};

testConnection();