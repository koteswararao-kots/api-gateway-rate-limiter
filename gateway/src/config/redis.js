const {createClient} = require('redis');
require('dotenv').config()
const redisClient = createClient({
  url: process.env.REDIS_URL
})
console.log('REDIS URL:', process.env.REDIS_URL);

redisClient.on('error', (error) => {
  console.error('Redis Client Error:', error);
});

redisClient.on('connect', () => {
  console.log('Redis socket connected');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

module.exports = redisClient;