const {createProxyMiddleware} = require('http-proxy-middleware');
const {USER_SERVICE_URL, PRODUCT_SERVICE_URL, ORDER_SERVICE_URL, NOTIFICATION_SERVICE_URL} = process.env;

const userServiceProxy = createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
 pathRewrite: {
        '^/': '/users',
    },
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