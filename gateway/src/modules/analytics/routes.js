const express = require('express');
const redisClient = require('../../config/redis');

const router = express.Router();

router.get('/', async (req, res) => {

  const totalRequests =
    await redisClient.get('analytics:total_requests');

  const successRequests =
    await redisClient.get('analytics:success_requests');

  const errorRequests =
    await redisClient.get('analytics:error_requests');

  const totalResponseTime =
    await redisClient.get('analytics:total_response_time');

  const averageResponseTime =
    Number(totalRequests) > 0
      ? Number(totalResponseTime) / Number(totalRequests)
      : 0;

   const apiUsage = await redisClient.zRangeWithScores('analytics:api_usage',0,-1);
   const mostUsedApis = apiUsage.sort((a, b) => b.score - a.score).map(item => ({
    endpoint: item.value,
    requests: item.score
  }));
  const activeUsers = await redisClient.sCard('analytics:active_users');
  const trafficKeys = await redisClient.keys('analytics:traffic:*');

  const trafficTrends = [];

  for (const key of trafficKeys) {
    const requests = await redisClient.get(key);

    trafficTrends.push({
      hour: key.replace('analytics:traffic:', ''),
      requests: Number(requests)
    });
  }

  res.json({
    totalRequests: Number(totalRequests || 0),
    successRequests: Number(successRequests || 0),
    errorRequests: Number(errorRequests || 0),
    averageResponseTime,
    mostUsedApis,
    activeUsers,
    trafficTrends
  });
});

module.exports = router;