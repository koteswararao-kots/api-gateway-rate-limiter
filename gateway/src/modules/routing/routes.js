const { createProxyMiddleware } = require('http-proxy-middleware');
const redisClient = require('../../config/redis');
const postgres = require('../../config/postgres');

const CACHE_TTL_SECONDS =
  Number(process.env.CACHE_TTL_SECONDS) || 30;

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

// Proxies
const proxyTimeoutOptions = {
  timeout: 5000,
  proxyTimeout: 5000,
};


// Circuit Breaker

const circuitBreakerOptions = {
  failureThreshold: 3,
  resetTimeout: 10000,
};

const circuitStates = {
  'product-service': {
    state: 'CLOSED',
    failures: 0,
    openedAt: null,
    halfOpenInProgress: false,
  },
};

const canRequest = (serviceName) => {
  const circuit = circuitStates[serviceName];

  if (!circuit) {
    return true;
  }

  if (circuit.state === 'CLOSED') {
    return true;
  }

  if (circuit.state === 'OPEN') {
    const elapsed = Date.now() - circuit.openedAt;

    if (elapsed >= circuitBreakerOptions.resetTimeout) {
      circuit.state = 'HALF_OPEN';
      circuit.halfOpenInProgress = true;

      console.log(`Circuit HALF_OPEN: ${serviceName}`);

      return true;
    }

    return false;
  }

  // HALF_OPEN
  if (circuit.halfOpenInProgress) {
    return false;
  }

  circuit.halfOpenInProgress = true;

  return true;
};


const recordSuccess = (serviceName) => {
  const circuit = circuitStates[serviceName];

  if (!circuit) {
    return;
  }

  circuit.state = 'CLOSED';
  circuit.failures = 0;
  circuit.openedAt = null;
  circuit.halfOpenInProgress = false;

  console.log(`Circuit CLOSED: ${serviceName}`);
};


const recordFailure = (serviceName) => {
  const circuit = circuitStates[serviceName];

  if (!circuit) {
    return;
  }

  circuit.failures++;
  circuit.halfOpenInProgress = false;

  console.log(
    `Circuit failure: ${serviceName} (${circuit.failures}/${circuitBreakerOptions.failureThreshold})`
  );

  if (circuit.failures >= circuitBreakerOptions.failureThreshold) {
    circuit.state = 'OPEN';
    circuit.openedAt = Date.now();

    console.log(`Circuit OPEN: ${serviceName}`);
  }
};


const circuitBreaker = (serviceName) => {
  return (req, res, next) => {
    if (canRequest(serviceName)) {
      return next();
    }

    console.log(`Circuit OPEN - request blocked: ${serviceName}`);

    return res.status(503).json({
      error: 'Service temporarily unavailable',
      service: serviceName,
    });
  };
};


const userLoginProxy = createProxyMiddleware({
  target: USER_SERVICE_URL_1,
  changeOrigin: true,
  ...proxyTimeoutOptions,

  router: () => {
    const service = getNextUserService();

    console.log('Login routing to', service);

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
    proxyReq: (proxyReq, req) => {
      console.log(
        'Login proxy request:',
        req.method,
        req.originalUrl
      );
    },

    proxyRes: (proxyRes) => {
      console.log(
        'Login proxy response:',
        proxyRes.statusCode
      );
    },

    error: (error) => {
      console.log(
        'Login proxy error:',
        error.code || error.message
      );
    }
  }
});


const userServiceProxy = createProxyMiddleware({
  target: USER_SERVICE_URL_1,
  changeOrigin: true,
  selfHandleResponse: true,
  ...proxyTimeoutOptions,

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

        if (req.method === 'GET') {
          const key = `cache:${req.originalUrl}`;

          await redisClient.set(
            key,
            body,
            { EX: CACHE_TTL_SECONDS }
          );

          console.log('Response cached');
        }

        res.statusCode = proxyRes.statusCode;

        res.setHeader(
          'Content-Type',
          proxyRes.headers['content-type']
        );

        res.end(body);
      });
    },

    error: (error) => {
      console.log(
        'User proxy error:',
        error.code || error.message
      );
    }
  }
});


const productServiceProxy = createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  ...proxyTimeoutOptions,
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

   on: {
    proxyRes: (proxyRes) => {
      if (proxyRes.statusCode >= 500) {
        recordFailure('product-service');
      } else {
        recordSuccess('product-service');
      }
    },

    error: (error) => {
      console.log(
        `Product service proxy error: ${error.code || error.message}`
      );

      recordFailure('product-service');
    },
  },
});


const orderServiceProxy = createProxyMiddleware({
  target: ORDER_SERVICE_URL,
  changeOrigin: true,
  ...proxyTimeoutOptions,
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
  ...proxyTimeoutOptions,
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
  userLoginProxy,
  productServiceProxy,
  orderServiceProxy,
  notificationServiceProxy,
  findRoute,
  circuitBreaker
};