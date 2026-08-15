const express = require('express');
const {userServiceProxy} = require('./modules/routing/routes');
const app = express();
app.use(express.json());

app.use('/api/users', userServiceProxy);


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'API Gateway',
  })
})

module.exports = app;