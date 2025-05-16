import axios, { AxiosError } from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:8000/api';

// Default empty/error state responses
const DEFAULT_WEATHER_DATA = {
  temperature: 0,
  description: 'Weather data unavailable',
  humidity: 0,
  wind_speed: 0,
  feels_like: 0,
  source: 'error'
};

const DEFAULT_TRAFFIC_DATA = {
  current_speed: 0,
  free_flow_speed: 0,
  current_travel_time: 0,
  free_flow_travel_time: 0,
  confidence: 0,
  road_closure: false,
  congestion_level: 'Unknown',
  source: 'error'
};

const DEFAULT_TRANSIT_DATA = {
  routes: [],
  stops: [],
  trip_updates: [],
  vehicle_positions: [],
  service_alerts: [
    {
      id: 'error-1',
      effect: 'NO_SERVICE',
      header: 'Transit information unavailable',
      description: 'Unable to retrieve transit data. Please try again later.',
      cause: 'UNKNOWN_CAUSE'
    }
  ],
  source: 'error'
};

// API service with error handling
const apiService = {
  // Health check endpoint to test API connectivity
  async checkHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
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
  async getWeatherData(lat: number, lon: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/weather`, {
        params: { lat, lon, units: 'metric' },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Weather API error:', error);
      return DEFAULT_WEATHER_DATA;
    }
  },
  // Traffic data endpoint
  async getTrafficData(lat: number, lon: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/traffic`, {
        params: { lat, lon },
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Traffic API error:', error);
      return DEFAULT_TRAFFIC_DATA;
    }
  },  // Transit data endpoint
  async getTransitData(location: string, options = {}) {
    try {
      // Convert location to a location parameter if it's an object
      let params: any = {};
      
      if (typeof location === 'object' && location !== null) {
        // Assuming location is something like {latitude: x, longitude: y}
        const locObj = location as any;
        if (locObj.latitude !== undefined && locObj.longitude !== undefined) {
          params.location = `${locObj.latitude},${locObj.longitude}`;
        } else if (locObj.lat !== undefined && locObj.lon !== undefined) {
          params.location = `${locObj.lat},${locObj.lon}`;
        } else {
          params.location = 'seattle'; // Default fallback
        }
      } else {
        params.location = location;
      }
      
      params = { ...params, ...options, include_realtime: true };
      
      const response = await axios.get(`${API_BASE_URL}/data/transit`, {
        params,
        timeout: 7000 // Transit data might take longer to fetch
      });
      return response.data;
    } catch (error) {
      console.error('Transit API error:', error);
      return DEFAULT_TRANSIT_DATA;
    }
  },

  // Integrated data endpoint (gets all data in one call)
  async getIntegratedData(lat: number, lon: number, location: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/integrated`, {
        params: {
          lat,
          lon,
          location,
          include_weather: true,
          include_traffic: true,
          include_transit: true
        },
        timeout: 10000 // Higher timeout for the combined endpoint
      });
      return response.data;
    } catch (error) {
      const errorResponse: any = error;
      console.error('Integrated API error:', errorResponse.message || error);
      
      // Return a combined data structure with all default values
      return {
        weather: DEFAULT_WEATHER_DATA,
        traffic: DEFAULT_TRAFFIC_DATA,
        transit: DEFAULT_TRANSIT_DATA,
        timestamp: new Date().toISOString(),
        source: 'error'
      };
    }
  }
};

export default apiService;
