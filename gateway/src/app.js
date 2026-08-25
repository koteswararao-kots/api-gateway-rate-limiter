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
const {requesLogger} = require('./middleware/requestLogger')


const app = express();
app.use(express.json());

app.use(requesLogger);

app.use('/api/users', authenticate, rateLimiter('user', 5), rateLimiter('ip', 10), rateLimiter('path',20),  userServiceProxy);
app.use('/api/products', authenticateApiKey, productServiceProxy);
app.use('/api/orders',authenticate, authorize('admin'), orderServiceProxy);
app.use('/api/notifications', notificationServiceProxy);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'API Gateway',
  })
})

module.exports = app;