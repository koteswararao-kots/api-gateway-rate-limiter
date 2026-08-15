const {createProxyMiddleware} = require('http-proxy-middleware');
const userServiceProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
 pathRewrite: {
        '^/': '/users',
    },
});

module.exports = {
  userServiceProxy,
}