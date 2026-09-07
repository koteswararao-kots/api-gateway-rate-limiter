const app = require('./app');
const redisClient = require('./config/redis');
const { connectMongoDB } = require('./config/mongodb');

const PORT =  3000;
connectMongoDB();

redisClient.connect() 
.then(() => {
  console.log("Redis connected")
  app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  }) 
})
.catch((error) => {
  console.error("Redis connection failed", error);
})
