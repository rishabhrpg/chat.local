import axios, { type AxiosInstance } from 'axios';

// Get API base URL based on environment
const getApiBaseUrl = (): string => {
  const serverPort = import.meta.env.VITE_SERVER_PORT || '80';
  
  if (window.location.hostname === 'localhost') {
    return `http://localhost:${serverPort}`;
  }
  
  // When served by Express, use the same domain
  return '';
};

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

