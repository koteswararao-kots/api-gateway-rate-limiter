const pool = require('../src/config/postgres');

const seedRoutes = async () => {
  try {
    await pool.query(`
      INSERT INTO routes (path, method, target, rewrite_path)
      VALUES
        ('/api/users', 'GET', 'user-service', '/users'),
        ('/api/products', 'GET', 'product-service', '/products'),
        ('/api/orders', 'GET', 'order-service', '/orders'),
        ('/api/notifications', 'GET', 'notification-service', '/notifications');
    `);

    console.log('Routes inserted successfully');
  } catch (error) {
    console.error('Failed to insert routes:', error);
  } finally {
    await pool.end();
  }
};

seedRoutes();