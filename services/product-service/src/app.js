const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.get('/products', (req, res) => {
    // Logic to fetch products from the database or service
    
    res.status(200).json({
      service: 'product-service',
      message:' Products fetched successfully',
    });
});

module.exports = app;