const {createProxyMiddleware} = require('http-proxy-middleware');

const userServiceProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
 pathRewrite: {
        '^/': '/users',
    },
});

const productServiceProxy = createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
        '^/': '/products',
    },
});


module.exports = {
  userServiceProxy,
  productServiceProxy
}