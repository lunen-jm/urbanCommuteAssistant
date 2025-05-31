import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from './useLocation';
import { fetchWeatherData } from '../store/weatherSlice';
import { fetchTrafficData } from '../store/trafficSlice';
import { getTransitData } from '../store/transitDataSlice'; // Renamed from fetchTransitData
import type { AppDispatch } from '../store'; // Import AppDispatch

const WEATHER_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const TRAFFIC_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TRANSIT_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const useLocationData = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch
  const { currentLocation, locationStatus } = useLocation();

  useEffect(() => {
    if (locationStatus === 'success' && currentLocation) {
      const locationArgs = { lat: currentLocation.lat, lng: currentLocation.lng };
      const transitLocationArgs = { latitude: currentLocation.lat, longitude: currentLocation.lng };

      // Initial fetch for all data types
      dispatch(fetchWeatherData(locationArgs));
      dispatch(fetchTrafficData(locationArgs));
      dispatch(getTransitData(transitLocationArgs));

      // Set up periodic refresh for weather
      const weatherIntervalId = setInterval(() => {
        dispatch(fetchWeatherData(locationArgs));
      }, WEATHER_REFRESH_INTERVAL);

      // Set up periodic refresh for traffic
      const trafficIntervalId = setInterval(() => {
        dispatch(fetchTrafficData(locationArgs));
      }, TRAFFIC_REFRESH_INTERVAL);
      
      // Set up periodic refresh for transit
      const transitIntervalId = setInterval(() => {
        dispatch(getTransitData(transitLocationArgs));
      }, TRANSIT_REFRESH_INTERVAL);

      // Cleanup intervals on unmount or when location changes
      return () => {
        clearInterval(weatherIntervalId);
        clearInterval(trafficIntervalId);
        clearInterval(transitIntervalId);
      };
    }
  }, [currentLocation, locationStatus, dispatch]);

  // Data and loading/error states will be selected from Redux store in components
  return {
    // Components will use useSelector to get data from weatherSlice, trafficSlice, transitDataSlice
  };
};
