require('dotenv').config();
const express = require('express');
const {userServiceProxy, productServiceProxy, orderServiceProxy} = require('./modules/routing/routes');
const app = express();
app.use(express.json());

app.use('/api/users', userServiceProxy);
app.use('/api/products', productServiceProxy);
app.use('/api/orders', orderServiceProxy);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'API Gateway',
  })
})

module.exports = app;