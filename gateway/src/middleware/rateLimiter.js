const redisClient = require('../config/redis');
// const LIMIT = 5;
const crypto = require('crypto');

const rateLimiter = (type, limit) => {
  return  async (req, res, next) => {
    let key;
    if (type == 'user') {
      key = `rate:user:${req.user.userId}`;
    }

    if (type === 'ip') {
      key = `rate:ip:${req.ip}`
    }

    if (type === 'path') {
      key = `rate:path:${req.path}`
    }

    if (!key) {
      return res.status(500).json({
          error: 'Invalid rate limiter type'
      });
    }

    const now = Date.now();
    const windowStart = now-10000; //last 10 seconds
    await redisClient.zRemRangeByScore(key, '-inf', windowStart); //remove anthing up to windowstart
    const requestCount = await redisClient.zCard(key);
    if (requestCount >= limit) {
      return res.status(429).json({
        error: 'Too many requests'
      })
    }
    const requestId = crypto.randomUUID()
    await redisClient.zAdd(key, {
      score: now,
      value: requestId
    })
    next()
  }
}
module.exports = {
  rateLimiter
}