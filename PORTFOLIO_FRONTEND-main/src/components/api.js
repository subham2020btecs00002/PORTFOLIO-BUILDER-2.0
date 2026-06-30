import axios from 'axios';
import { baseUrl } from './url';

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export default api;
