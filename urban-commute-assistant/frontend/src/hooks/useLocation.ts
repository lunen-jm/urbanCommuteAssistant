import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { locationService } from '../services/locationService';
import {
  setCurrentLocation,
  setLocationLoading,
  setLocationError,
  clearLocationError,
} from '../store/userSlice';
import type { RootState } from '../store';
import type { LocationCoordinates, LocationError } from '../types';

/**
 * Custom hook to manage and provide location data.
 * It integrates with the LocationService and updates the Redux store.
 */
export const useLocation = () => {
  const dispatch = useDispatch();
  const {
    currentLocation,
    locationStatus: reduxLocationStatus, // Renamed for clarity
    locationError,
  } = useSelector((state: RootState) => state.user);

  // Default to 'unknown' if Redux state is initially undefined for locationStatus
  const locationStatus = reduxLocationStatus === undefined ? 'unknown' : reduxLocationStatus;

  const [isLoading, setIsLoading] = useState(locationStatus === 'loading' || locationStatus === 'unknown'); // Initialize isLoading based on Redux state
  const [hasLocation, setHasLocation] = useState(locationStatus === 'success' && !!currentLocation);
  const [hasError, setHasError] = useState(locationStatus === 'error' && !!locationError);

  useEffect(() => {
    // console.log('[useLocation] Derived state effect. Redux state:', { locationStatus, currentLocation, locationError });
    setIsLoading(locationStatus === 'loading' || locationStatus === 'unknown');
    setHasLocation(locationStatus === 'success' && !!currentLocation);
    setHasError(locationStatus === 'error' && !!locationError);
    // console.log('[useLocation] Status derived state updated:', { isLoading, hasLocation, hasError });
  }, [locationStatus, currentLocation, locationError]); // locationStatus here refers to the defaulted one

  useEffect(() => {
    console.log('[useLocation] Main effect running. Effective locationStatus:', locationStatus);
    if (locationStatus === 'unknown' || locationStatus === 'loading') {
      dispatch(setLocationLoading());
      console.log('[useLocation] Dispatched setLocationLoading.');

      const handleLocationUpdate = (location: LocationCoordinates) => {
        console.log('[useLocation] handleLocationUpdate called with:', location);
        dispatch(setCurrentLocation(location));
        dispatch(clearLocationError()); // Ensure error is cleared on new location
      };

      const handleError = (error: LocationError) => {
        console.error('[useLocation] handleError called with:', error);
        dispatch(setLocationError(error));
      };

      console.log('[useLocation] Subscribing to locationService.watchPosition...');
      // Subscribe to location updates. watchPosition returns a cleanup function.
      const cleanupWatch = locationService.watchPosition(handleLocationUpdate, handleError);

      console.log('[useLocation] Calling locationService.getCurrentLocation()...');
      // Initial attempt to get location
      locationService.getCurrentLocation()
        .then(location => {
          console.log('[useLocation] getCurrentLocation success:', location);
          handleLocationUpdate(location);
        })
        .catch(error => {
          console.error('[useLocation] getCurrentLocation error:', error);
          handleError(error);
        });

      // Cleanup on unmount
      return () => {
        console.log('[useLocation] Cleanup: Unsubscribing from watchPosition.');
        cleanupWatch();
      };
    }
  }, [dispatch]); // Keep dispatch as the only dependency to ensure this runs once on mount

  // console.log('[useLocation] Returning state:', { currentLocation, locationStatus, locationError, isLoading, hasLocation, hasError });
  return {
    currentLocation,
    locationStatus,
    locationError,
    isLoading,
    hasLocation,
    hasError,
  };
};