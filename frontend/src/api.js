import axios from 'axios';

// Use environment variable first, then fallback to hardcoded URLs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://jnanasthan1-production.up.railway.app' // Removed trailing slash
    : 'https://jnanasthan1-production.up.railway.app');

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  // Add your specific endpoints here
  USERS: `${API_BASE_URL}/users`,
  AUTH: `${API_BASE_URL}/auth`,
  CHAT: `${API_BASE_URL}/chat`,
  // Add more endpoints as needed
};

// Main axios instance with default configuration
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}`, // Added /api to base URL for consistency
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Legacy API instance for backward compatibility (if you're using it elsewhere)
export const API = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Apply same interceptors to legacy API instance
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export default for backward compatibility
export default API;