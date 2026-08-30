const client  = require('prom-client');
const register = new client.Registry();

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestsTotal)
register.registerMetric(httpRequestDuration);

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration
}