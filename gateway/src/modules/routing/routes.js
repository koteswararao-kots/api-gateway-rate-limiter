const {createProxyMiddleware} = require('http-proxy-middleware');
const redisClient = require('../../config/redis');
const {USER_SERVICE_URL_1, USER_SERVICE_URL_2, USER_SERVICE_URL_3, PRODUCT_SERVICE_URL, ORDER_SERVICE_URL, NOTIFICATION_SERVICE_URL} = process.env;


const userServices = [USER_SERVICE_URL_1, USER_SERVICE_URL_2, USER_SERVICE_URL_3];

let healthyServices = [...userServices];

const checkServiceHealth = async () => {
  // console.log("checking health service")
  let healthy = []
  for (const service of healthyServices) {
    try {
      const respone = await fetch(`${service}/health`);
      if (respone.ok) {
        healthy.push(service)
      }
    } catch(error) {
      console.log(`service unhealthy:${service}` )
    }
  }
  healthyServices = healthy
}

checkServiceHealth(); 
setInterval(checkServiceHealth, 10000);

let currentService = 0
const getNextUserService = () => {
  if (healthyServices.length === 0) {
    return null
  }
  const service = healthyServices[currentService % healthyServices.length]
  currentService++
  return service;
}
const userServiceProxy = createProxyMiddleware({
  target: USER_SERVICE_URL_1,
  changeOrigin: true,
  selfHandleResponse: true,
  router: () => {
    const service = getNextUserService(); 
    console.log(" Routing to", service);
    return service
  },
  pathRewrite: {
    '^/': '/users',
    },
    on: {
      proxyRes: (proxyRes, req, res) => {

            const chunks = [];

            proxyRes.on('data', (chunk) => {
                chunks.push(chunk);
            });

            proxyRes.on('end', async () => {

                const body = Buffer.concat(chunks).toString();

                console.log('User Service response:', body);
                 const key = `cache:${req.originalUrl}`;

                  await redisClient.set(
                      key,
                      body,
                      { EX: 30 }
                  );

                  console.log('Response cached');

                res.statusCode = proxyRes.statusCode;

                res.setHeader(
                    'Content-Type',
                    proxyRes.headers['content-type']
                );

                res.end(body);
            });
        }
      }
});

const productServiceProxy = createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
        '^/': '/products',
    },
});

const orderServiceProxy = createProxyMiddleware({ 
  target: ORDER_SERVICE_URL, // Order service URL
  changeOrigin: true,
  pathRewrite: {
        '^/': '/orders',
    },
});

const notificationServiceProxy = createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL, // Notification service URL
  changeOrigin: true,
  pathRewrite: {
        '^/': '/notifications',
    },
});

module.exports = {
  userServiceProxy,
  productServiceProxy,
  orderServiceProxy,
  notificationServiceProxy
}