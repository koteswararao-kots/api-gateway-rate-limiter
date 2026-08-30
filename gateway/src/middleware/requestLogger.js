const redisClient = require('../config/redis');
const {httpRequestsTotal, httpRequestDuration} = require('../metrics/metrics')

const requestLogger = (req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', async () => {

    const responseTime = Date.now() - startTime;
    await redisClient.incrBy('analytics:total_response_time', responseTime);
    const method = req.method;
    const endpoint = req.originalUrl;
    const ip = req.ip;
    const statusCode = res.statusCode;
    const userId = req.user?.userId || 'anonymous';

   await redisClient.incr('analytics:total_requests');

   if (statusCode >= 200 && statusCode < 400) {
    await redisClient.incr('analytics:success_requests')
   } else {
    await redisClient.incr('analytics:error_requests')
   }

   await redisClient.zIncrBy('analytics:api_usage',1,endpoint);
   await redisClient.sAdd('analytics:active_users', userId);
   const hour = new Date().toISOString().slice(0, 13);
   await redisClient.incr(`analytics:traffic:${hour}`);  

   httpRequestsTotal.inc({
    method,
    route: req.path,
    status_code: statusCode.toString()
   }); 

   httpRequestDuration.observe(
    responseTime/1000,
    {
      method,
      route: req.path,
      status_code: statusCode.toString()
    }
   );

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