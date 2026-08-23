const redisClient = require('../config/redis');
const LIMIT = 5;
const crypto = require('crypto');
const rateLimiter = async (req, res, next) => {
  const userId = req.user.userId;
  const key = `rate:user:${userId}`;
  const now = Date.now();
  const windowStart = now-10000; //last 10 seconds
  await redisClient.zRemRangeByScore(key, '-inf', windowStart); //remove anthing up to windowstart
  const requestCount = await redisClient.zCard(key);
  if (requestCount >= LIMIT) {
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
module.exports = {
  rateLimiter
}