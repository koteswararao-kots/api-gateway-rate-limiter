const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const app = express();
app.use(express.json());

app.use(
    '/api',
    createProxyMiddleware({
        target: 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: {
            '^/api/users': '/users',
        },
    })
);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'API Gateway',
  })
})

module.exports = app;