const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.get('/orders', (req, res) => {  
  res.status(200).json({
    service: 'order-service',
    message: 'Orders fetched successfully',
  })  
})

module.exports = app;