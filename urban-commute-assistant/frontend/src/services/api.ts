import axios from 'axios';
import { TransitData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Enhanced type interfaces for the comprehensive data
interface ComprehensiveDataParams {
  lat: number;
  lon: number;
  radius?: number;
  include_forecast?: boolean;
  normalize?: boolean;
}

export const fetchTrafficData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/integrations/traffic`);
        return response.data;
    } catch (error) {
        console.error('Error fetching traffic data:', error);
        throw error;
    }
};

export const fetchWeatherData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/integrations/weather`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

export const fetchTransitData = async (location?: LocationCoordinates): Promise<TransitData[]> => {
  try {
    const params = location ? { lat: location.latitude, lng: location.longitude } : {};
    const response = await axios.get(`${API_BASE_URL}/api/transit`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transit data:', error);
    throw error;
  }
};

// New methods for Sprint 2 integration

export const fetchComprehensiveData = async (params: ComprehensiveDataParams) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/comprehensive-data`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching comprehensive data:', error);
    throw error;
  }
};

export const fetchWeatherForecast = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather/forecast`, {
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
    const response = await axios.get(`${API_BASE_URL}/traffic/incidents`, {
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
    const response = await axios.get(`${API_BASE_URL}/transit/trips/updates`, {
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
    // This would need to be implemented in the backend
    const response = await axios.get(`${API_BASE_URL}/transit/stops/nearby`, {
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
    const response = await axios.get(`${API_BASE_URL}/monitoring/api-usage`);
    return response.data;
  } catch (error) {
    console.error('Error fetching API usage stats:', error);
    throw error;
  }
};

export const invalidateCache = async (dataType: string, subtype?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/cache/invalidate/${dataType}`, {
      subtype
    });
    return response.data;
  } catch (error) {
    console.error('Error invalidating cache:', error);
    throw error;
  }
};