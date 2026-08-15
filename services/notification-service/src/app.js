const express = require('express');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.get('/notifications', (req, res) => {
  res.status(200).json({
    service: 'notification-service',
    message: 'Notifications fetched successfully',
  });
});

module.exports = app;