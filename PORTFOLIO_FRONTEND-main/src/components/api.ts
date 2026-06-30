import axios, { AxiosInstance } from 'axios';
import { baseUrl } from './url';

/**
 * Pre-configured axios instance for all authenticated API calls.
 * Sets the base URL from environment config and sends cookies with every request.
 */
const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export default api;
