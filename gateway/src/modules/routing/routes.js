const {createProxyMiddleware} = require('http-proxy-middleware');
const redisClient = require('../../config/redis');
const {USER_SERVICE_URL, PRODUCT_SERVICE_URL, ORDER_SERVICE_URL, NOTIFICATION_SERVICE_URL} = process.env;

const userServiceProxy = createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  selfHandleResponse: true,
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