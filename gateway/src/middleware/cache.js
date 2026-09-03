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

module.exports = { cache };