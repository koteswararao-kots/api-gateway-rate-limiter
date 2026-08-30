require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/users', (req, res) => {
    res.status(200).json({
        service: 'user-service',
        // res: process.env.PORT || 3001,
        message: 'Users retrieved successfully'
    });
});

app.post('/login', (req, res) => {
    const { userId, role } = req.body;

    if (!userId || !role) {
        return res.status(400).json({ error: 'User ID and role are required.' });
    }

    const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

module.exports = app;