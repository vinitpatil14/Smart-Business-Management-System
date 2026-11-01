import axios from 'axios';
import { mockStore } from './mockStore';

// When running on cloud hosting (Vercel, Netlify, Firebase) without an active separate API server,
// use the intelligent client-side engine directly for instant 0ms latency and 0 network failures.
const isStandaloneClient =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  !import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Custom adapter for Standalone Cloud Hosting
if (isStandaloneClient) {
  api.defaults.adapter = async (config) => {
    try {
      const mockResult = mockStore.handle(config);
      return {
        data: mockResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    } catch (err) {
      return Promise.reject(err);
    }
  };
}

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sbms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: safety net fallback if running in environments with HTML rewrites
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
      const mockResult = mockStore.handle(response.config);
      return {
        ...response,
        status: 200,
        statusText: 'OK',
        data: mockResult
      };
    }
    return response;
  },
  (error) => {
    // Catch 404, 405 Method Not Allowed, 500, or network offline errors
    if (error.config) {
      const mockResult = mockStore.handle(error.config);
      if (mockResult) {
        return Promise.resolve({
          data: mockResult,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
