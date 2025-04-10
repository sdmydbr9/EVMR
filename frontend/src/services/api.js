import axios from 'axios';

// Get the base URL from environment, window location, or default to localhost
const getApiBaseUrl = () => {
  // First try environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // If not available, construct from current window location
  const windowUrl = window.location.origin;
  if (windowUrl && !windowUrl.includes('localhost')) {
    return `${windowUrl}/api`;
  }

  // Fallback to localhost
  return 'http://localhost:3786/api';
};

const baseURL = getApiBaseUrl();

// Configure axios instance
const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (e.g., expired token)
    if (error.response && error.response.status === 401) {
      // Clear stored tokens and reload the page
      localStorage.removeItem('token');
      window.location.href = '/login?session=expired';
    }
    return Promise.reject(error);
  }
);

// Get the backend base URL for accessing uploaded images
export const getBackendUrl = () => {
  // First try environment variable
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }

  // If not available, use window location origin
  const windowUrl = window.location.origin;
  if (windowUrl && !windowUrl.includes('localhost')) {
    return windowUrl;
  }

  // Fallback to localhost
  return 'http://localhost:3786';
};

// Auth service
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  getDemoCredentials: async () => {
    const response = await api.get('/auth/demo-credentials');
    return response.data;
  }
};

// Export the api instance
export default api;