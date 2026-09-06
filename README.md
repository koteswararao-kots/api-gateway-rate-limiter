# API Gateway & Rate Limiting Platform

A production-style API Gateway built with Node.js and Express that provides authentication, role-based access control, distributed rate limiting, request routing, load balancing, response caching, request logging, analytics, and observability for multiple microservices.

The platform uses Redis for distributed rate limiting, caching, and analytics, and Prometheus + Grafana for monitoring and visualization. The complete system runs using Docker Compose.


## Architecture

The API Gateway acts as the central entry point for client requests. It handles authentication, rate limiting, caching, logging, analytics, and routing before forwarding requests to the appropriate backend microservice.

The complete platform runs using Docker Compose, with all services connected through a shared Docker network.

```text
                              Client
                                │
                                ▼
                       ┌─────────────────┐
                       │   API Gateway   │
                       │      :3000      │
                       └────────┬────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
 ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
 │  User Services  │   │ Product Service │   │  Order Service  │
 │   ×3 instances  │   │      :3004      │   │      :3005      │
 └─────────────────┘   └─────────────────┘   └─────────────────┘
          │
          │
          ▼
 ┌─────────────────────┐
 │ Notification Service│
 │        :3006        │
 └─────────────────────┘


                       ┌───────────────┐
                       │     Redis     │
                       │     :6379     │
                       └───────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        Rate Limiting       Caching          Analytics


                       ┌───────────────┐
                       │  Prometheus   │
                       │     :9090     │
                       └───────┬───────┘
                               │
                               ▼
                       ┌───────────────┐
                       │    Grafana    │
                       │     :3007     │
                       └───────────────┘

## Key Features

- **Authentication & Authorization**
  - JWT-based authentication
  - API Key authentication
  - Role-Based Access Control (RBAC)

- **API Gateway & Routing**
  - Centralized request routing
  - Dynamic service routing
  - Path rewriting
  - Request forwarding

- **Load Balancing**
  - Round-robin distribution across multiple User Service instances
  - Health-based service selection
  - Automatic removal of unhealthy instances

- **Distributed Rate Limiting**
  - Redis-based sliding window rate limiting
  - Per-user rate limits
  - Per-IP rate limits
  - Per-API/path rate limits

- **Response Caching**
  - Redis-based response caching
  - Configurable cache expiration

- **Request Logging**
  - HTTP method
  - Endpoint
  - Status code
  - Response time
  - User information
  - Client IP

- **Analytics**
  - Total requests
  - Success and error requests
  - Average response time
  - Most frequently used APIs
  - Unique users
  - Hourly traffic trends

- **Monitoring & Observability**
  - Prometheus metrics
  - Request rate monitoring
  - Error rate monitoring
  - Average latency
  - P95 and P99 latency
  - Grafana dashboards

- **Containerization**
  - Dockerized microservices
  - Docker Compose orchestration
  - Isolated service-to-service communication


## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | API Gateway and microservices |
| Redis | Rate limiting, response caching, and analytics |
| Prometheus | Metrics collection and monitoring |
| Grafana | Metrics visualization and dashboards |
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| JavaScript | Application development |


> PostgreSQL and MongoDB were part of the original project requirements but are not currently used in the implemented version.



## Request Flow

All client requests enter through the API Gateway, which applies the required middleware before forwarding the request to the appropriate backend service.

```text
Client
  │
  ▼
API Gateway
  │
  ├── Authentication
  │
  ├── Rate Limiting
  │
  ├── Cache Lookup
  │
  ├── Request Logging & Metrics
  │
  └── Route to Backend Service
          │
          ├── User Service
          ├── Product Service
          ├── Order Service
          └── Notification Service


## Rate Limiting

The API Gateway implements distributed rate limiting using Redis and a sliding window approach.

Rate limits can be applied at multiple levels:

- **Per User** — limits requests made by an authenticated user.
- **Per IP** — limits requests originating from the same IP address.
- **Per API/Path** — limits traffic to a specific API endpoint.

### How it works

For each incoming request, the Gateway checks the corresponding rate-limit key in Redis. The sliding window algorithm tracks request timestamps and determines whether the client has exceeded the configured limit.

Because the counters are stored in Redis, the rate-limiting state is shared across Gateway instances rather than being stored only in application memory.

Example middleware configuration:

```js
app.use(
  '/api/users',
  authenticate,
  rateLimiter('user', 5),
  rateLimiter('ip', 10),
  rateLimiter('path', 20),
  cache,
  userServiceProxy
);



## Response Caching

The API Gateway implements response caching using Redis to reduce repeated requests to backend services.

When a request reaches a cache-enabled route:

```text
Client Request
      │
      ▼
  API Gateway
      │
      ▼
 Cache Lookup
      │
   ┌──┴──┐
   │     │
 HIT    MISS
   │     │
   │     ▼
   │  Backend
   │  Service
   │     │
   │     ▼
   │  Response
   │     │
   │     ▼
   └── Redis
      │
      ▼
    Client



## Request Logging & Analytics

The API Gateway records request information and maintains application-level analytics using Redis.

### Request Logging

For each completed request, the Gateway records:

- HTTP method
- Endpoint
- Client IP address
- User ID
- HTTP status code
- Response time

This information is currently logged by the Gateway and can be used for debugging and request analysis.

### Analytics

The Gateway maintains aggregate analytics in Redis, including:

- Total requests
- Successful requests
- Error requests
- Average response time
- Most frequently used APIs
- Unique users
- Hourly traffic trends

The analytics are exposed through an analytics endpoint, allowing the collected information to be retrieved as a JSON response.

### Redis Analytics Structure

The Gateway uses Redis data structures according to the type of information being tracked:

| Redis Data Structure | Purpose |
|---|---|
| String | Request and response-time counters |
| Sorted Set | API usage ranking |
| Set | Unique users |
| String keys | Hourly traffic counters |


## Monitoring & Observability

The API Gateway exposes Prometheus metrics for monitoring request traffic and latency.

### Metrics

The Gateway records:

- Total HTTP requests
- Request rate
- Error rate
- Average request latency
- P95 latency
- P99 latency
- Request rate by route

The metrics are exposed through:

```text
GET /metrics


API Request
     │
     ▼
API Gateway
     │
     ├── Request Counter
     └── Request Duration Histogram
               │
               ▼
          /metrics
               │
               ▼
          Prometheus
               │
               ▼
            Grafana


## Docker & Deployment Architecture

The complete platform is containerized and orchestrated using Docker Compose.

Each backend service runs in its own container, allowing the Gateway to communicate with services through the Docker Compose network.

### Services

| Service | Port | Purpose |
|---|---:|---|
| API Gateway | 3000 | Central entry point and request processing |
| User Service 1 | 3001 | User microservice instance |
| User Service 2 | 3002 | User microservice instance |
| User Service 3 | 3003 | User microservice instance |
| Product Service | 3004 | Product operations |
| Order Service | 3005 | Order operations |
| Notification Service | 3006 | Notification operations |
| Grafana | 3007 | Monitoring dashboards |
| Prometheus | 9090 | Metrics collection |
| Redis | 6379 | Rate limiting, caching, and analytics |

### Service-to-Service Communication

Services communicate using Docker Compose service names rather than `localhost`.

For example:

```text
API Gateway
     │
     ├── http://user-service-1:3001
     ├── http://user-service-2:3001
     ├── http://user-service-3:3001
     ├── http://product-service:3004
     ├── http://order-service:3005
     └── http://notification-service:3006

### Running the Platform

Start the complete platform with:

```bash
docker compose up -d --build

Check the running containers with:

docker compose ps

To stop the platform:

docker compose down


### Access Points

- API Gateway: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3007`



## API Endpoints

All client requests are routed through the API Gateway at:

http://localhost:3000

User APIs
Method	Endpoint	Description
GET	/api/users	Retrieve users

Product APIs
Method	Endpoint	Description
GET	/api/products	Retrieve products

Order APIs
Method	Endpoint	Description
GET	/api/orders	Retrieve orders

Notification APIs
Method	Endpoint	Description
GET	/api/notifications	Access notification service

Analytics
Method	Endpoint	Description
GET	/analytics	Retrieve application analytics

Monitoring
Method	Endpoint	Description
GET	/metrics	Prometheus metrics


## Engineering Decisions

### Why Redis?

Redis is used as the shared data store for rate limiting, response caching, and application analytics.

Using Redis allows rate-limit state to be shared across multiple Gateway instances instead of keeping counters only in application memory.

### Why Sliding Window Rate Limiting?

A sliding window provides more precise request control than a simple fixed time window by considering requests within a continuously moving time period.

The implementation supports different limits based on:

- User
- IP address
- API/path

### Why Multiple User Service Instances?

Three User Service instances are used to demonstrate load balancing and service health checking.

The Gateway performs periodic health checks and distributes requests using round-robin selection among healthy instances.

### Why Prometheus and Grafana?

Prometheus is used for collecting time-series operational metrics from the Gateway, while Grafana provides dashboards for visualizing those metrics.

Application analytics and operational monitoring are kept separate:

- Redis → application analytics
- Prometheus → operational metrics
- Grafana → visualization

### Why Docker Compose?

Docker Compose provides a simple way to run the Gateway, microservices, Redis, Prometheus, and Grafana together with consistent networking and configuration.

Services communicate using Docker Compose service names rather than relying on `localhost`.

### Why Middleware-Based Design?

Gateway responsibilities such as authentication, rate limiting, caching, and request logging are implemented as middleware.

This keeps cross-cutting concerns separate from the individual service implementations and allows middleware to be composed for different API routes.


## Future Improvements

- Add PostgreSQL and MongoDB integration for persistent service data.
- Add automated unit and integration tests.
- Add service readiness/health checks to Docker Compose.
- Improve Redis analytics using more efficient key-scanning and aggregation strategies.
- Add centralized log storage and visualization.
- Add CI/CD pipelines for automated testing and deployment.
- Add Kubernetes deployment for production orchestration.
- Improve cache invalidation and cache-key strategies.
- Add more comprehensive failure handling and retry mechanisms.