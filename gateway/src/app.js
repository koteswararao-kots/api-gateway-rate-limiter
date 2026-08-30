require('dotenv').config();
const express = require('express');
const {userServiceProxy, 
  productServiceProxy, 
  orderServiceProxy, 
  notificationServiceProxy} = require('./modules/routing/routes');

const {authenticate} = require('./modules/authentication/auth.middleware');
const {authorize} = require('./modules/authentication/authorization.middleware');
const {authenticateApiKey} = require('./modules/authentication/apikey.middleware');
const {rateLimiter} = require('./middleware/rateLimiter')
const {requestLogger} = require('./middleware/requestLogger')
const {cache} = require('./middleware/cache')
const analyticsRoutes = require('./modules/analytics/routes');
const {register} = require('./metrics/metrics');


const app = express();
app.use(express.json());

app.use(requestLogger);

app.get('/metrics', async(req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());

})

app.use('/api/users', authenticate, cache, rateLimiter('user', 5), rateLimiter('ip', 10), rateLimiter('path',20),  userServiceProxy);
app.use('/api/products', authenticateApiKey, productServiceProxy);
app.use('/api/orders',authenticate, authorize('admin'), orderServiceProxy);
app.use('/api/notifications', notificationServiceProxy);
app.use('/analytics', analyticsRoutes)


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'API Gateway',
  })
})

module.exports = app;