const redisClient = require('../config/redis');

const cache = async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    const cachedResponse = await redisClient.get(key);

    if (cachedResponse) {
        console.log('CACHE HIT');
        return res.json(JSON.parse(cachedResponse));
    }

    console.log('CACHE MISS');

    const originalJson = res.json;

    res.json = function (body) {
        // console.log('res.json called');
        redisClient.set(
            key,
            JSON.stringify(body),
            { EX: 30 }
        );

        return originalJson.call(this, body);
    };

    next();
};

const invalidateCache = async (path) => {
  const keys = [];

  for await (const key of redisClient.scanIterator({
    MATCH: `cache:${path}*`,
    COUNT: 100,
  })) {
    keys.push(key);
  }

  if (keys.length > 0) {
    await redisClient.del(keys);
    console.log(`Cache invalidated: ${keys.length} keys`);
  }
};

module.exports = { cache, invalidateCache };