const {createProxyMiddleware} = require('http-proxy-middleware');
const {USER_SERVICE_URL, PRODUCT_SERVICE_URL} = process.env;

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
  target: 'http://localhost:3003', // Order service URL
  changeOrigin: true,
  pathRewrite: {
        '^/': '/orders',
    },
});

module.exports = {
  userServiceProxy,
  productServiceProxy,
  orderServiceProxy
}