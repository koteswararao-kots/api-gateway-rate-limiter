const pool = require('../src/config/postgres');

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        path VARCHAR(255) NOT NULL,
        rewrite_path VARCHAR(255) NOT NULL,
        method VARCHAR(10) NOT NULL,
        target VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Routes table created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error);
  } finally {
    await pool.end();
  }
};

createTables();