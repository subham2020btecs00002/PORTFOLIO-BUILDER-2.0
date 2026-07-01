/**
 * Route configuration for the API Gateway.
 *
 * PUBLIC_ROUTES  — exact path+method combos that bypass JWT verification.
 * PUBLIC_PREFIXES — path prefixes whose ALL methods bypass JWT verification.
 */

export interface RouteDefinition {
  path: string;
  method: string;
}

/** Exact routes that do NOT require a JWT access token */
export const PUBLIC_ROUTES: RouteDefinition[] = [
  { path: '/api/auth/register', method: 'POST' },
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/refresh', method: 'POST' },
  { path: '/api/contact', method: 'POST' },
];

/** Route prefixes where ALL methods are public (no JWT needed) */
export const PUBLIC_PREFIXES: string[] = [
  '/api/portfolio/public/',
  '/api/portfolio/download/',
];

/**
 * Upstream service URLs — consumed by the proxy middleware.
 * Override via environment variables for different environments.
 */
export const UPSTREAM = {
  AUTH_SERVICE: process.env.AUTH_SERVICE_URL ?? 'http://localhost:5001',
  BACKEND: process.env.BACKEND_URL ?? 'http://localhost:5000',
};
