/**
 * Base URL for all API requests.
 * Override at build time via the REACT_APP_BASE_URL environment variable.
 */
export const baseUrl: string =
  process.env.REACT_APP_BASE_URL ?? 'http://localhost:5000';
