import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocationLoading, setCurrentLocation, setLocationError } from '../store/userSlice'; // Changed setLocationSuccess to setCurrentLocation
import { LocationService } from '../services/locationService.js';

const locationServiceInstance = LocationService.getInstance();

export const useLocation = () => {
  const dispatch = useDispatch();

  const reduxLocationStatus = useSelector(state => state.user.locationStatus);
  const reduxCurrentLocation = useSelector(state => state.user.currentLocation);
  const reduxLocationError = useSelector(state => state.user.locationError);
  const handleLocationUpdate = useCallback((location) => {
    // Development logging - remove in production
    // console.log('[useLocation] handleLocationUpdate received:', location);
    dispatch(setCurrentLocation(location)); // Changed to use setCurrentLocation
  }, [dispatch]);

  const handleLocationError = useCallback((error) => {
    // Development logging - remove in production
    // console.error('[useLocation] handleLocationError received:', error);
    dispatch(setLocationError(error.message || 'Unknown location error'));
  }, [dispatch]);
  useEffect(() => {
    // Development logging - remove in production
    // console.log('[useLocation] Main location fetching effect running. Effective locationStatus:', reduxLocationStatus);

    if (reduxLocationStatus === 'unknown') {
      // console.log('[useLocation] Dispatched setLocationLoading because status was unknown.');
      dispatch(setLocationLoading());
      // console.log('[useLocation] Calling locationService.getCurrentLocation() for initial fetch...');
      locationServiceInstance.getCurrentLocation() // Use the instance
        .then(handleLocationUpdate)
        .catch(handleLocationError);
    }

    // console.log('[useLocation] Subscribing to locationService.watchPosition...');
    const unsubscribe = locationServiceInstance.watchPosition(handleLocationUpdate, handleLocationError); // Use the instance

    return () => {
      // console.log('[useLocation] Cleanup: Unsubscribing from watchPosition.');
      unsubscribe();
    };
  }, [dispatch, reduxLocationStatus, handleLocationUpdate, handleLocationError]);

  const isLoadingDerived = reduxLocationStatus === 'loading' || reduxLocationStatus === 'unknown';
  const hasLocationDerived = !!reduxCurrentLocation && reduxLocationStatus === 'success';
  const hasErrorDerived = reduxLocationStatus === 'error';
  const fetchCurrentLocation = useCallback(() => {
    // Development logging - remove in production
    // console.log('[useLocation] Manual fetchCurrentLocation called.');
    dispatch(setLocationLoading());
    locationServiceInstance.getCurrentLocation() // Use the instance
      .then(handleLocationUpdate)
      .catch(handleLocationError);
  }, [dispatch, handleLocationUpdate, handleLocationError]);

  const returnState = {
    currentLocation: reduxCurrentLocation,
    locationStatus: reduxLocationStatus,
    locationError: reduxLocationError,
    isLoading: isLoadingDerived,
    hasLocation: hasLocationDerived,
    hasError: hasErrorDerived,
    fetchCurrentLocation,
  };

  // Development logging - remove in production
  // console.log(
  //   `[useLocation] Returning state. Redux Status: ${reduxLocationStatus}, ` +
  //   `Redux Location: ${reduxCurrentLocation ? 'Exists' : 'null'}, ` +
  //   `Redux Error: ${reduxLocationError || 'null'}. ` +
  //   `Derived isLoading: ${isLoadingDerived}, Derived hasLocation: ${hasLocationDerived}, Derived hasError: ${hasErrorDerived}`
  // );

  return returnState;
};
