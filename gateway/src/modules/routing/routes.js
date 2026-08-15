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


module.exports = {
  userServiceProxy,
  productServiceProxy
}