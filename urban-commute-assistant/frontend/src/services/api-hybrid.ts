import axios from 'axios';
import { 
  ApiWeatherData, 
  ApiTrafficData, 
  ApiTransitData, 
  ApiHealthCheckResponse,
  ApiIntegratedDataResponse
} from '../types/api';
import { TrafficData, TransitData, WeatherData } from '../types';
import { adaptTrafficData, adaptTransitData, adaptWeatherData } from '../adapters/dataAdapters';

// API Base URL - can be switched between the simple debug API and the full FastAPI server
const API_BASE_URL = 'http://localhost:8000/api';

// Default error state responses with placeholders instead of sample data
const DEFAULT_WEATHER_DATA: ApiWeatherData = {
  temperature: 0,
  description: 'Weather data unavailable',
  humidity: 0,
  wind_speed: 0,
  feels_like: 0,
  source: 'error'
};

const DEFAULT_TRAFFIC_DATA: ApiTrafficData = {
  current_speed: 0,
  free_flow_speed: 0,
  current_travel_time: 0,
  free_flow_travel_time: 0,
  confidence: 0,
  road_closure: false,
  congestion_level: 'Data unavailable',
  source: 'error'
};

const DEFAULT_TRANSIT_DATA: ApiTransitData = {
  routes: [],
  stops: [],
  trip_updates: [],
  vehicle_positions: [],
  service_alerts: [
    {
      id: 'error-1',
      effect: 'NO_SERVICE',
      header: 'Transit information unavailable',
      description: 'Unable to retrieve transit data at this time.',
      cause: 'UNKNOWN_CAUSE'
    }
  ],
  cached: false,
  timestamp: new Date().toISOString(),
  source: 'error'
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication (if needed)
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

// API service with error handling
const apiService = {  // Health check endpoint to test API connectivity
  async checkHealth(): Promise<ApiHealthCheckResponse> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('API Health check failed:', error);
      return {
        weather_api: { key_configured: false, health: false },
        traffic_api: { key_configured: false, health: false },
        transit_api: { key_configured: false, health: false }
      };
    }
  },  // Weather data endpoint
  async getWeatherData(lat: number, lon: number): Promise<ApiWeatherData> {
    try {
      const response = await apiClient.get('/data/weather', {
        params: { lat, lon, units: 'metric' }
      });
      return response.data;
    } catch (error) {
      console.error('Weather API error:', error);
      return DEFAULT_WEATHER_DATA;
    }
  },
  // Traffic data endpoint
  async getTrafficData(lat: number, lon: number): Promise<ApiTrafficData> {
    try {
      const response = await apiClient.get('/data/traffic', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Traffic API error:', error);
      return DEFAULT_TRAFFIC_DATA;
    }
  },  // Transit data endpoint
  async getTransitData(location: string | any, options = {}): Promise<ApiTransitData> {
    try {
      // Convert location to a location parameter if it's an object
      let params: any = {};
      
      if (typeof location === 'object' && location !== null) {
        // Assuming location is something like {latitude: x, longitude: y}
        if (location.latitude !== undefined && location.longitude !== undefined) {
          params.location = `${location.latitude},${location.longitude}`;
        } else if (location.lat !== undefined && location.lon !== undefined) {
          params.location = `${location.lat},${location.lon}`;
        } else {
          params.location = 'seattle'; // Default fallback
        }
      } else {
        params.location = location;
      }
      
      params = { ...params, ...options, include_realtime: true };
      
      // This endpoint might not be available in the simple Flask app
      const response = await apiClient.get('/data/transit', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Transit API error:', error);
      return DEFAULT_TRANSIT_DATA;
    }
  },
  // Integrated data endpoint (gets all data in one call)
  async getIntegratedData(lat: number, lon: number, location: string): Promise<ApiIntegratedDataResponse> {
    try {
      // This endpoint might not be available in the simple Flask app
      const response = await apiClient.get('/data/integrated', {
        params: {
          lat,
          lon,
          location,
          include_weather: true,
          include_traffic: true,
          include_transit: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Integrated API error:', error);
      
      // If integrated endpoint fails, try to fetch individual endpoints in parallel
      try {
        const [weatherData, trafficData] = await Promise.all([
          this.getWeatherData(lat, lon),
          this.getTrafficData(lat, lon)
        ]);
        
        // Return a combined data structure with available data and defaults for missing data
        return {
          weather: weatherData || DEFAULT_WEATHER_DATA,
          traffic: trafficData || DEFAULT_TRAFFIC_DATA,
          transit: DEFAULT_TRANSIT_DATA, // Transit might not be available in simple API
          timestamp: new Date().toISOString(),
          source: 'hybrid'
        };
      } catch (fallbackError) {
        console.error('Fallback API calls failed:', fallbackError);
        
        // Return a combined data structure with all default values
        return {
          weather: DEFAULT_WEATHER_DATA,
          traffic: DEFAULT_TRAFFIC_DATA,
          transit: DEFAULT_TRANSIT_DATA,
          timestamp: new Date().toISOString(),
          source: 'error'
        };
      }
    }  }
};

// Create consistent interfaces for location parameters
export interface LocationParams {
  latitude: number;
  longitude: number;
}

// Export fetchHealthCheck and fetchIntegratedData wrappers for the apiService methods
export const fetchHealthCheck = async (): Promise<ApiHealthCheckResponse> => {
  return apiService.checkHealth();
};

export const fetchIntegratedData = async (lat: number, lon: number, location: string): Promise<ApiIntegratedDataResponse> => {
  return apiService.getIntegratedData(lat, lon, location);
};

// Export these functions explicitly for Redux slices
export const fetchTrafficData = async (location: LocationParams): Promise<TrafficData> => {
  try {
    // TODO: Implement actual traffic API integration
    // This should call a real traffic service with the provided location
    throw new Error('Traffic API integration not implemented');
  } catch (error) {
    console.error('Error fetching traffic data:', error);
    // Return an empty traffic data structure in case of error
    return {
      flowSegments: [],
      incidents: [],
      timestamp: new Date().toISOString(),
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const fetchTransitData = async (location: LocationParams): Promise<TransitData> => {
  try {
    // TODO: Implement actual transit API integration
    // This should call a real transit service with the provided location
    throw new Error('Transit API integration not implemented');
  } catch (error) {
    console.error('Error fetching transit data:', error);
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

export const fetchWeatherData = async (location: LocationParams): Promise<WeatherData> => {
  try {
    // TODO: Implement actual weather API integration
    // This should call a real weather service with the provided location
    throw new Error('Weather API integration not implemented');
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: null,
      description: 'Weather data unavailable',
      humidity: null,
      windSpeed: null,
      error: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };  }
};

// You can add other API functions here

// Export the API service as the default export
export default apiService;
