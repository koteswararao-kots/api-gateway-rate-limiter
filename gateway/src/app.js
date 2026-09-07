require('dotenv').config();

const express = require('express');

const {
  userServiceProxy,
  productServiceProxy,
  orderServiceProxy,
  notificationServiceProxy,
  circuitBreaker
} = require('./modules/routing/routes');

const { authenticate } = require('./modules/authentication/auth.middleware');
const { authorize } = require('./modules/authentication/authorization.middleware');
const { authenticateApiKey } = require('./modules/authentication/apikey.middleware');

const { rateLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/requestLogger');
const { cache } = require('./middleware/cache');

const analyticsRoutes = require('./modules/analytics/routes');
const { register } = require('./metrics/metrics');
const helmet = require('helmet');
const cors = require('cors');


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({limit: '1mb'}));

app.use(requestLogger);


// Metrics

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


// API Routes

app.use('/api/users',authenticate, rateLimiter('user', 5), rateLimiter('ip', 10), rateLimiter('path', 20), cache,
  userServiceProxy
);

app.use('/api/products',authenticateApiKey,  circuitBreaker('product-service'), productServiceProxy);

app.use('/api/orders',
  authenticate,
  authorize('admin'),
  orderServiceProxy
);

app.use(
  '/api/notifications',
  notificationServiceProxy
);

// Analytics

app.use('/analytics', analyticsRoutes);


// Gateway Health

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'API Gateway'
  });
});


module.exports = app;