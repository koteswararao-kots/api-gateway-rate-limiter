const express = require('express');
const app = express();
app.use(express.json());

app.get('/users', (req, res) => {
    res.status(200).json({
        service: 'user-service',
        message: 'Users retrieved successfully'
    });
});

module.exports = app;