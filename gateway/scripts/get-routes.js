const pool = require('../src/config/postgres');

const getRoutes = async () => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM routes
      WHERE active = true
      ORDER BY id;
    `);

    console.log('Routes from PostgreSQL:');
    console.table(result.rows);
  } catch (error) {
    console.error('Failed to fetch routes:', error);
  } finally {
    await pool.end();
  }
};

getRoutes();