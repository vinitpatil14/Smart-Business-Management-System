import axios from 'axios';
import { mockStore } from './mockStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// Response interceptor: handle static hosting (Vercel / Firebase) where backend API is served via client fallback
api.interceptors.response.use(
  (response) => {
    // Detect if static server returned index.html SPA content instead of JSON API response
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
    // If request failed because no backend server is running on host (404, 502, network offline)
    if (error.config && (!error.response || error.response.status === 404 || error.response.status === 502 || error.code === 'ERR_NETWORK')) {
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
