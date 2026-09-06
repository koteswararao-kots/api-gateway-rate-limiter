const { createProxyMiddleware } = require('http-proxy-middleware');
const redisClient = require('../../config/redis');
const postgres = require('../../config/postgres');

const {
  USER_SERVICE_URL_1,
  USER_SERVICE_URL_2,
  USER_SERVICE_URL_3,
  PRODUCT_SERVICE_URL,
  ORDER_SERVICE_URL,
  NOTIFICATION_SERVICE_URL
} = process.env;


// ============================================
// Dynamic Route Configuration
// ============================================

let routeConfig = [];

const loadRoutes = async () => {
  try {
    const result = await postgres.query(`
      SELECT path, method, target, rewrite_path
      FROM routes
      WHERE active = true
      ORDER BY id;
    `);

    routeConfig = result.rows;

  } catch (error) {
    console.error('Failed to load routes:', error);
  }
};

loadRoutes();

setInterval(loadRoutes, 10000);


const findRoute = (path, method) => {
  return routeConfig.find(
    route =>
      route.path === path &&
      route.method === method
  );
};


const resolveTarget = (target) => {
  switch (target) {
    case 'product-service':
      return PRODUCT_SERVICE_URL;

    case 'order-service':
      return ORDER_SERVICE_URL;

    case 'notification-service':
      return NOTIFICATION_SERVICE_URL;

    default:
      return null;
  }
};


// ============================================
// User Service Load Balancing
// ============================================

const userServices = [
  USER_SERVICE_URL_1,
  USER_SERVICE_URL_2,
  USER_SERVICE_URL_3
];

let healthyServices = [...userServices];


const checkServiceHealth = async () => {
  const healthy = [];

  for (const service of healthyServices) {
    try {
      const response = await fetch(`${service}/health`);

      if (response.ok) {
        healthy.push(service);
      }
    } catch (error) {
      console.log(`service unhealthy: ${service}`);
    }
  }

  healthyServices = healthy;
};


checkServiceHealth();

setInterval(checkServiceHealth, 10000);


let currentService = 0;


const getNextUserService = () => {
  if (healthyServices.length === 0) {
    return null;
  }

  const service =
    healthyServices[currentService % healthyServices.length];

  currentService++;

  return service;
};


// ============================================
// Proxies
// ============================================

const userServiceProxy = createProxyMiddleware({
  target: USER_SERVICE_URL_1,
  changeOrigin: true,
  selfHandleResponse: true,

  router: () => {
    const service = getNextUserService();

    console.log('Routing to', service);

    return service;
  },

  pathRewrite: (path, req) => {
    const route = findRoute(
      req.originalUrl.split('?')[0],
      req.method
    );

    return route?.rewrite_path || path;
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

  router: (req) => {
    const route = findRoute(
      req.originalUrl.split('?')[0],
      req.method
    );

    return resolveTarget(route?.target);
  },

  pathRewrite: (path, req) => {
    const route = findRoute(
      req.originalUrl.split('?')[0],
      req.method
    );

    return route?.rewrite_path || path;
  },
});


const orderServiceProxy = createProxyMiddleware({
  target: ORDER_SERVICE_URL,
  changeOrigin: true,

  router: (req) => {
    const route = findRoute(
      req.originalUrl.split('?')[0],
      req.method
    );

    return resolveTarget(route?.target);
  },

  pathRewrite: (path, req) => {
    const route = findRoute(
      req.originalUrl.split('?')[0],
      req.method
    );

    return route?.rewrite_path || path;
  },
});


const notificationServiceProxy = createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,

  router: (req) => {
    const route = findRoute(
      req.originalUrl.split('?')[0],
      req.method
    );

    return resolveTarget(route?.target);
  },

  pathRewrite: (path, req) => {
    const route = findRoute(
      req.originalUrl.split('?')[0],
      req.method
    );

    return route?.rewrite_path || path;
  },
});


module.exports = {
  userServiceProxy,
  productServiceProxy,
  orderServiceProxy,
  notificationServiceProxy,
  findRoute
};