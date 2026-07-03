import axios, { AxiosInstance } from 'axios';
import { toast } from 'react-toastify';
import { baseUrl } from './url';

/**
 * Pre-configured axios instance for all authenticated API calls.
 * Sets the base URL from environment config and sends cookies with every request.
 */
const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

/**
 * Global response interceptor — handles common HTTP errors centrally
 * so individual components don't need to repeat this logic.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Don't redirect to login if we are already on a public page
      const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
      const isPublicPath =
        publicPaths.includes(window.location.pathname) ||
        window.location.pathname.startsWith('/p/') ||
        window.location.pathname.startsWith('/portfolio/public/');

      if (!isPublicPath) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 429) {
      toast.warning('Too many requests. Please slow down.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      // Network error (no internet, backend down, etc.)
      toast.error('Network error. Check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;

