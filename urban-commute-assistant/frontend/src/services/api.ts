import axios from 'axios';
import { TransitData } from '../types';

// Define LocationCoordinates interface
interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Use environment variable with fallback
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      if (error.response.status === 429) {
        // Rate limiting
        console.warn('Rate limit exceeded. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response was received - likely CORS or network issue
      console.error('Network Error: No response received', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Enhanced type interfaces for the comprehensive data
interface ComprehensiveDataParams {
  lat: number;
  lon: number;
  radius?: number;
  include_forecast?: boolean;
  normalize?: boolean;
}

export const fetchTrafficData = async (lat: number, lon: number, radius: number = 5000) => {
  try {
    const response = await apiClient.get('/api/data/traffic', {
      params: { lat, lon, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    // Return empty data structure that won't break the UI
    return {
      flowSegments: [],
      incidents: [],
      timestamp: new Date().toISOString(),
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const fetchWeatherData = async (lat: number, lon: number, units: string = 'metric') => {
  try {
    const response = await apiClient.get('/api/data/weather', {
      params: { lat, lon, units }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return empty data structure that won't break the UI
    return {
      temperature: null,
      description: 'Weather data unavailable',
      humidity: null,
      windSpeed: null,
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const fetchTransitData = async (location: LocationCoordinates | string, includeRealtime: boolean = true) => {
  try {
    let params: any = {};
    
    if (typeof location === 'string') {
      params.location = location;
    } else {
      params.lat = location.latitude;
      params.lon = location.longitude;
    }
    
    params.include_realtime = includeRealtime;
    
    const response = await apiClient.get('/api/data/transit', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transit data:', error);
    // Return empty data structure that won't break the UI
    return {
      routes: [],
      stops: [],
      tripUpdates: [],
      vehiclePositions: [],
      serviceAlerts: [],
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Fetch comprehensive data that includes all sources
export const fetchComprehensiveData = async (location: string, options = {
  includeTraffic: true,
  includeWeather: true,
  includeTransit: true
}) => {
  try {
    const response = await apiClient.get('/api/data/comprehensive', { 
      params: {
        location,
        include_traffic: options.includeTraffic,
        include_weather: options.includeWeather,
        include_transit: options.includeTransit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching comprehensive data:', error);
    return {
      weather: { error: true },
      traffic: { error: true },
      transit: { error: true },
      recommendations: [
        {
          type: 'error',
          severity: 'warning', 
          message: 'Unable to load data. Please try again later.'
        }
      ],
      timestamp: new Date().toISOString(),
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const fetchWeatherForecast = async (lat: number, lon: number) => {
  try {
    const response = await apiClient.get('/api/data/weather/forecast', {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};

export const fetchTrafficIncidents = async (lat: number, lon: number, radius: number = 5000) => {
  try {
    const response = await apiClient.get('/api/data/traffic/incidents', {
      params: { lat, lon, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching traffic incidents:', error);
    throw error;
  }
};

export const fetchRealTimeArrivals = async (stopId: string) => {
  try {
    const response = await apiClient.get('/api/data/transit/trips/updates', {
      params: { stop_id: stopId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching real-time arrivals:', error);
    throw error;
  }
};

export const fetchNearbyTransitStops = async (lat: number, lon: number, radius: number = 1000) => {
  try {
    const response = await apiClient.get('/api/data/transit/stops/nearby', {
      params: { lat, lon, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby transit stops:', error);
    throw error;
  }
};

// API usage monitoring endpoints
export const fetchApiUsageStats = async () => {
  try {
    const response = await apiClient.get('/api/monitoring/api-usage');
    return response.data;
  } catch (error) {
    console.error('Error fetching API usage stats:', error);
    throw error;
  }
};

export const invalidateCache = async (dataType: string, subtype?: string) => {
  try {
    const response = await apiClient.post(`/api/cache/invalidate/${dataType}`, {
      subtype
    });
    return response.data;
  } catch (error) {
    console.error('Error invalidating cache:', error);
    throw error;
  }
};

export default apiClient;