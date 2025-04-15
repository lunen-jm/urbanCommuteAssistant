import axios from 'axios';
import { TransitData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
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