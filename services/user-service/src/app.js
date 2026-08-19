require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;
console.log('JWT_SECRET:', JWT_SECRET); // Log the JWT_SECRET to verify it's being read correctly
const app = express();
app.use(express.json());

app.get('/users', (req, res) => {
    res.status(200).json({
        service: 'user-service',
        message: 'Users retrieved successfully'
    });
});

app.post('/login', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

module.exports = app;