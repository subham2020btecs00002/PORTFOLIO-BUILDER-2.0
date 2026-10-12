# 🛡️ Microservice 1: API Gateway (Port 3001)

The **API Gateway** is a NestJS application operating as the single unified ingress point for the entire backend system. It enforces security boundaries, verifies authentication tokens, manages distributed request tracing, and reverse-proxies client traffic to downstream internal microservices.

---

## 🎯 Core Responsibilities

```
                                  ┌─────────────────────────────┐
                                  │      Incoming Request       │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │   CorrelationIdMiddleware   │  ──► Assigns x-correlation-id UUID
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    RateLimiterMiddleware    │  ──► Blocks DDoS / Brute Force
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     JwtVerifyMiddleware     │  ──► Validates JWT & injects x-user-id
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │        Proxy Manager        │  ──► Injects x-internal-secret header
                                  └──────┬───────────────┬──────┘
                                         │               │
                     ┌───────────────────┘               └───────────────────┐
                     ▼                                                       ▼
       ┌───────────────────────────┐                           ┌───────────────────────────┐
       │   Auth Service (:5001)    │                           │ Portfolio Backend (:5000) │
       │      /api/auth/*          │                           │ /api/portfolio/*, /contact│
       └───────────────────────────┘                           └───────────────────────────┘
```

1. **Edge Reverse Proxying:** Powered by `http-proxy-middleware`, mapping incoming endpoints to private microservices without revealing internal ports to the public.
2. **Centralized JWT Authentication:** Decodes and verifies JSON Web Tokens once at the perimeter. Injects standard claims (`x-user-id`, `x-user-role`) into downstream headers so downstream services remain stateless.
3. **Perimeter Defense (`x-internal-secret`):** Injects a shared cryptographically secure secret (`x-internal-secret`) into all proxy headers. Internal services reject any direct public requests lacking this header.
4. **Rate Limiting:** Protects endpoints against brute-force credential stuffing and denial of service.
5. **Distributed Request Tracing:** Generates an RFC-compliant UUID for every request (`x-correlation-id`), propagating it across all microservices for unified log correlation.
6. **Cross-Origin Resource Sharing (CORS):** Manages dynamic origin matching for local development (`localhost:3000`), Vercel edge deployments (`*.vercel.app`), Render backends (`*.onrender.com`), and custom frontend domains.

---

## 🔀 Upstream Routing Table

| Inbound Path Pattern | Destination Upstream | Auth Policy | Injected Headers | Description |
|---|---|---|---|---|
| `/api/auth/*` | `AUTH_SERVICE_URL:5001` | Public / Hybrid | `x-internal-secret`, `x-correlation-id`, `x-user-id` (if logged in) | Registration, login, verification, token refresh, forgot/reset password |
| `/api/portfolio/public/*` | `BACKEND_URL:5000` | **Public** | `x-internal-secret`, `x-correlation-id` | Public portfolio views by username or user ID, and dynamic LinUCB layout policies |
| `/api/portfolio/download/*` | `BACKEND_URL:5000` | **Public** | `x-internal-secret`, `x-correlation-id` | Direct resume PDF binary download endpoint |
| `/api/portfolio/avatar/*` | `BACKEND_URL:5000` | **Public** | `x-internal-secret`, `x-correlation-id` | Direct avatar image binary stream endpoint |
| `/api/portfolio/telemetry` | `BACKEND_URL:5000` | **Public** | `x-internal-secret`, `x-correlation-id` | Closed-loop visitor telemetry beacon for DRL bandit online updating |
| `/api/portfolio/ai/stream/:userId` | `BACKEND_URL:5000` | Authenticated | `x-internal-secret`, `x-correlation-id`, `x-user-id` | Real-time Server-Sent Events (SSE) AI suggestions stream |
| `/api/portfolio/*` | `BACKEND_URL:5000` | Authenticated | `x-internal-secret`, `x-correlation-id`, `x-user-id` | Portfolio CRUD, AI resume parsing, AI bullet rephrasing, intelligence evaluation |
| `/api/contact` | `BACKEND_URL:5000` | **Public** | `x-internal-secret`, `x-correlation-id` | Public contact inquiry form dispatches email to portfolio owner |
| `/api/admin/*` | `BACKEND_URL:5000` | Admin Only (`x-user-role: admin`) | `x-internal-secret`, `x-correlation-id`, `x-user-id`, `x-user-role` | Administrative statistics and user directory management |
| `/health` | Gateway Local | **Public** | N/A | Service health check returning gateway status and uptime |

---

## ⚙️ Middleware Pipeline Deep-Dive

### 1. `JwtVerifyMiddleware` (`src/middleware/jwt-verify.middleware.ts`)
- Inspects incoming HttpOnly cookie `access_token` (or `Authorization: Bearer <token>` fallback).
- Uses `@nestjs/jwt` (`JwtService`) with `JWT_SECRET` to verify token authenticity.
- On valid token: extracts `sub` (user ID) and `role`, attaching them to `req.headers['x-user-id']` and `req.headers['x-user-role']`.
- On public routes: gracefully passes through without halting unauthenticated users:
  - Exact public routes: `/health`, `/`, `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/contact`, `/api/portfolio/telemetry`.
  - Public prefixes: `/api/portfolio/public/`, `/api/portfolio/download/`, `/api/portfolio/avatar/`.

### 2. `ProxyManager` (`src/app.module.ts`)
- Utilizes `createProxyMiddleware` from `http-proxy-middleware`.
- Uses `fixRequestBody` to ensure body payloads parsed by Express middleware are safely re-streamed to upstream services.
- Attaches the sanitized `x-internal-secret`:
  ```typescript
  const addGatewayHeaders = (proxyReq: any, req: any) => {
    proxyReq.setHeader('x-internal-secret', internalSecret);
    if (req.headers['x-correlation-id']) {
      proxyReq.setHeader('x-correlation-id', req.headers['x-correlation-id']);
    }
    if (req.headers['x-user-id']) {
      proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
    }
    if (req.headers['x-user-role']) {
      proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
    }
  };
  ```

---

## 🔐 Environment Variables Specification

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | Number | No | `3001` (or `10000` in prod) | Gateway HTTP listening port |
| `NODE_ENV` | String | Yes | `development` | Runtime environment (`development`, `production`, `test`) |
| `JWT_SECRET` | String | Yes | — | Secret key used to verify access token signatures |
| `INTERNAL_SECRET` | String | Yes | — | Shared key injected into `x-internal-secret` for upstream microservices |
| `AUTH_SERVICE_URL` | String | Yes | `http://localhost:5001` | Upstream URL for Auth Service |
| `BACKEND_URL` | String | Yes | `http://localhost:5000` | Upstream URL for Portfolio Backend |
| `FRONTEND_URL` | String | No | `http://localhost:3000` | Production domain allowed for CORS |

---

## 🛠️ Verification & Testing Commands

```bash
# Navigate to API Gateway directory
cd api-gateway

# Run unit tests
npm run test

# Run end-to-end proxy integration tests
npm run test:e2e

# Run linter
npm run lint

# Start development server
npm run start:dev
```

---

[Explore Auth Service Microservice ➔](Service-Auth)
