import axios from 'axios';

// Define API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service object
const apiService = {
  // Weather endpoints
  getWeather: (lat, lon) => api.get('/api/weather', { params: { lat, lon } }),
  
  // Traffic endpoints
  getTraffic: (lat, lon, radius = 5000) => 
    api.get('/api/traffic', { params: { lat, lon, radius } }),
  
  // Transit endpoints
  getTransit: (lat, lon, radius = 500) => 
    api.get('/api/transit', { params: { lat, lon, radius } }),
  // User endpoints
  login: (username, password) => 
    api.post('/api/users/token', { username, password }),
  
  getUserProfile: () => api.get('/api/users/me'),
  
  // Helper method for handling API errors
  handleError: (error) => {
    const errorResponse = {
      message: 'An unexpected error occurred',
      status: 500,
    };
    
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      errorResponse.message = error.response.data.detail || error.response.data.message || 'Server error';
      errorResponse.status = error.response.status;
    } else if (error.request) {
      // The request was made but no response was received
      errorResponse.message = 'No response from server. Please check your connection.';
      errorResponse.status = 0;
    }
    
    return errorResponse;
  },
};

export default apiService;
