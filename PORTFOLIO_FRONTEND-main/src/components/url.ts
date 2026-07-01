/**
 * Base URL for all API requests.
 * All traffic is routed through the API Gateway (port 3001).
 * The gateway handles JWT verification, rate limiting, and proxying
 * to the appropriate upstream service.
 *
 * Override at build time via the REACT_APP_BASE_URL environment variable.
 */
export const baseUrl: string =
  process.env.REACT_APP_BASE_URL ?? 'http://localhost:3001';

