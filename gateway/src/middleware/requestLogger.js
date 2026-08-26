const redisClient = require('../config/redis');

const requestLogger = (req, res, next) => {

  const startTime = Date.now();

  res.on('finish', async () => {

    const responseTime = Date.now() - startTime;
    const method = req.method;
    const endpoint = req.originalUrl;
    const ip = req.ip;
    const statusCode = res.statusCode;
    const userId = req.user?.userId || 'anonymous';

   await redisClient.incr('analytics:total_requests');
    const log = {
      method,
      endpoint,
      ip,
      userId,
      statusCode,
      responseTime,
    };

    console.log(log);
  });

  next();
};

module.exports = {
  requestLogger
};