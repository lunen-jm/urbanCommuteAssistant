import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import { selectSavedLocation, updateUserLocation } from '../../store/userSlice'; // updateUserLocation will be handled by useLocation
import { selectSavedLocation } from '../../store/userSlice';
// Data fetching actions are now called by useLocationData hook
// import { fetchWeatherData } from '../../store/weatherSlice';
// import { fetchTrafficData } from '../../store/trafficSlice';
// import { fetchTransitData } from '../../store/transitSlice';
import mlUtils from '../../utils/mlUtils';
import './Dashboard.css';
import { useLocation } from '../../hooks/useLocation';
import { useLocationData } from '../../hooks/useLocationData';

const Dashboard = () => {
  // Development only - remove in production
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     console.log('Dashboard Diagnostics: navigator.geolocation IS available.');
  //   } else {
  //     console.error('Dashboard Diagnostics: navigator.geolocation IS NOT available. Location services will not work.');
  //   }
  // }, []);
  const {
    currentLocation: liveCurrentLocation,
    locationStatus: liveLocationStatus,
    locationError: liveLocationError,
    isLoading: isLocationLoading,
    hasLocation,
    hasError: hasLocationError,
  } = useLocation();
  useLocationData(); // Initialize data fetching based on location

  // Development only - remove in production
  // useEffect(() => {
  //   console.log('Dashboard Diagnostics: Location Hook Status Update:', {
  //     status: liveLocationStatus,
  //     currentLocation: liveCurrentLocation,
  //     error: liveLocationError,
  //     isLoading: isLocationLoading,
  //     hasLocation,
  //     hasError: hasLocationError,
  //   });
  // }, [liveLocationStatus, liveCurrentLocation, liveLocationError, isLocationLoading, hasLocation, hasLocationError]);

  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedCommuteOption, setSelectedCommuteOption] = useState('drive'); // Default to recommended option
  const [expandedCards, setExpandedCards] = useState({}); // State to track which accordion cards are expanded
  const [mlRecommendations, setMlRecommendations] = useState({}); // ML-based recommendations
  const [isInitialized, setIsInitialized] = useState(false); // Track if we've initialized from Redux store
  // const [locationLoading, setLocationLoading] = useState(true); // Replaced by useLocation's status
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(state => state.user);
  const currentLocation = liveCurrentLocation; // Use live location from the hook
  const locationStatus = liveLocationStatus; // Use live status from the hook
  const locationError = liveLocationError; // Use live error from the hook

  const weather = useSelector(state => state.weather?.data);
  const traffic = useSelector(state => state.traffic?.data);
  const transit = useSelector(state => state.transit?.data);
  
  // Loading states from individual data slices
  const weatherLoading = useSelector(state => state.weather.loading);
  const trafficLoading = useSelector(state => state.traffic.loading);
  const transitLoading = useSelector(state => state.transit.loading);
  // Overall loading should primarily reflect data fetching status for the dashboard's core content.
  // Location loading is handled by isLocationLoading from useLocation.
  const dataLoading = weatherLoading || trafficLoading || transitLoading;
  
  // Error states from individual data slices
  const weatherError = useSelector(state => state.weather.error);
  const trafficError = useSelector(state => state.traffic.error);
  const transitError = useSelector(state => state.transit.error);
  
  // Helper function to get weather icon based on condition
  const getWeatherIcon = (condition) => {
    if (!condition) return '❓';
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return '☀️';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain')) return '🌧️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('fog')) return '🌫️';
    if (conditionLower.includes('night')) return '🌙';
    return '🌤️';
  };

  // Helper function to get traffic condition from data
  const getTrafficCondition = (trafficData) => {
    if (!trafficData) return 'Unknown';
    // Consider trafficError as well
    if (trafficError) return 'Error';
    if (trafficData.incidents && trafficData.incidents.length > 3) return 'Heavy';
    if (trafficData.incidents && trafficData.incidents.length > 1) return 'Moderate';
    return 'Light';
  };

  // Helper function to calculate travel time estimate
  const calculateTravelTime = (trafficData) => {
    if (!trafficData || !trafficData.flowSegments || trafficData.flowSegments.length === 0) {
      return '15-20 min'; // Default estimate
    }
    // Consider trafficError
    if (trafficError) return 'Unavailable';
    
    // Simple calculation based on average speed from flow segments
    const avgSpeed = trafficData.flowSegments.reduce((sum, segment) => 
      sum + (segment.currentSpeed || segment.speed || 30), 0) / trafficData.flowSegments.length;
    
    // Assume average distance of 10 miles for commute
    const estimatedTime = Math.round((10 / avgSpeed) * 60);
    return `${estimatedTime}-${estimatedTime + 5} min`;
  };  // Helper function to get next transit arrival
  const getNextArrival = (transitData) => {
    if (transitError) return { time: 'Error', status: 'Error' };
    if (!transitData || !transitData.arrivals || transitData.arrivals.length === 0) {
      return { time: 'No data', status: 'Unknown' };
    }
    
    // Get the soonest arrival - create a copy before sorting to avoid mutating read-only arrays
    const sortedArrivals = [...transitData.arrivals].sort((a, b) => 
      new Date(a.arrival_time) - new Date(b.arrival_time)
    );
    
    const nextArrival = sortedArrivals[0];
    const arrivalTime = new Date(nextArrival.arrival_time);
    const now = new Date();
    const minutesUntil = Math.round((arrivalTime - now) / (1000 * 60));
    
    // Map King County Metro status to display status
    let displayStatus = 'On Time';
    if (nextArrival.status === 'DELAYED') {
      displayStatus = 'Delayed';
    } else if (nextArrival.status === 'REAL_TIME') {
      displayStatus = 'Real-time';
    } else if (nextArrival.status === 'SCHEDULED') {
      displayStatus = 'Scheduled';
    }
    
    return {
      time: minutesUntil > 0 ? `${minutesUntil} min` : 'Now',
      status: displayStatus,
      route: nextArrival.route_name || nextArrival.route,
      destination: nextArrival.destination
    };
  };// Process real API data with intelligent fallbacks and error handling
  const processedData = {    weather: {
      temperature: weatherError || locationError ? 'N/A' : (weather?.temperature ?? 'Loading...'),
      condition: weatherError || locationError ? 'Data unavailable' : (weather?.description || weather?.condition || 'Loading...'),
      icon: weatherError || locationError ? '❌' : getWeatherIcon(weather?.description || weather?.condition),
      humidity: weatherError || locationError ? 'N/A' : (weather?.conditions?.humidity ?? weather?.humidity ?? '...'),
      windSpeed: weatherError || locationError ? 'N/A' : ((weather?.conditions?.wind_speed || weather?.wind_speed || weather?.windSpeed) ?? '...'),
      feelsLike: weatherError || locationError ? 'N/A' : ((weather?.feels_like || weather?.feelsLike || weather?.temperature) ?? '...'),
      visibility: '10 mi', // API might not provide this
      uvIndex: 0, // API might not provide this
      // Generate basic hourly forecast based on current conditions
      hourlyForecast: weatherError || !weather ? [] : [
        { time: new Date(Date.now() + 1*60*60*1000).toLocaleTimeString('en-US', {hour: 'numeric'}), 
          temp: `${Math.round((weather?.temperature || 20) + Math.random() * 2 - 1)}°`, 
          condition: weather?.description || 'Clear', 
          icon: getWeatherIcon(weather?.description) },
        { time: new Date(Date.now() + 2*60*60*1000).toLocaleTimeString('en-US', {hour: 'numeric'}), 
          temp: `${Math.round((weather?.temperature || 20) + Math.random() * 2 - 1)}°`, 
          condition: weather?.description || 'Clear', 
          icon: getWeatherIcon(weather?.description) },
        { time: new Date(Date.now() + 3*60*60*1000).toLocaleTimeString('en-US', {hour: 'numeric'}), 
          temp: `${Math.round((weather?.temperature || 20) + Math.random() * 2 - 1)}°`, 
          condition: weather?.description || 'Clear', 
          icon: getWeatherIcon(weather?.description) }
      ]
    },
    traffic: {
      currentCondition: trafficError ? 'Unknown' : getTrafficCondition(traffic),
      incidentCount: trafficError ? 'N/A' : (traffic?.incidents?.length ?? '...'),
      travelTime: trafficError ? 'Unavailable' : calculateTravelTime(traffic),
      congestionLevel: trafficError ? 'Unknown' : getTrafficCondition(traffic),
      incidents: trafficError || !traffic ? [] : (traffic?.incidents?.map(incident => ({
        type: incident.type || 'Unknown',
        location: typeof incident.location === 'string' 
          ? incident.location 
          : incident.location && typeof incident.location.lat === 'number' && typeof incident.location.lon === 'number'
            ? `Lat: ${incident.location.lat.toFixed(4)}, Lon: ${incident.location.lon.toFixed(4)}`
            : 'Unknown location',
        delay: incident.delay || '5-10 min',
        icon: incident.type === 'Construction' ? '🚧' : 
              incident.type === 'Accident' ? '🚗' : '⚠️'
      })) || []),
      averageSpeed: trafficError || !traffic ? 'N/A' : (traffic?.flowSegments?.length > 0 ? 
        `${Math.round(traffic.flowSegments.reduce((sum, seg) => sum + (seg.currentSpeed || seg.speed || 35), 0) / traffic.flowSegments.length)} mph` 
        : '35 mph'),
      alternativeRoute: trafficError ? 'Data unavailable' : 'Alternative routes available'
    },    transit: {
      nextArrival: transitError ? 'No data' : getNextArrival(transit).time,
      status: transitError ? 'Unknown' : getNextArrival(transit).status,
      route: transitError || !transit ? 'No route data' : getNextArrival(transit).route,      upcomingTrains: transitError || !transit ? [] : (transit?.arrivals?.map((arrival, index) => {
        const arrivalTime = new Date(arrival.arrival_time);
        const now = new Date();
        const minutesUntil = Math.round((arrivalTime - now) / (1000 * 60));
        
        // Map King County Metro status to display status
        let displayStatus = 'On Time';
        if (arrival.status === 'DELAYED') {
          displayStatus = 'Delayed';
        } else if (arrival.status === 'REAL_TIME') {
          displayStatus = 'Real-time';
        } else if (arrival.status === 'SCHEDULED') {
          displayStatus = 'Scheduled';
        }
        
        return {
          line: arrival.route_name || arrival.route,
          destination: arrival.destination || 'Unknown',
          time: minutesUntil > 0 ? `${minutesUntil} min` : 'Now',
          status: displayStatus
        };
      }).slice(0, 3) || []),
      serviceAlerts: transitError || !transit ? [] : (transit?.serviceAlerts?.map(alert => ({
        type: alert.effect || 'Info',
        message: alert.header || alert.description || 'Service information'
      })) || []),
      nearbyStops: transitError || !transit ? [] : (transit?.stops?.slice(0, 2).map(stop => ({
        name: stop.name || 'Transit Stop',
        distance: '0.3 mi',
        walkTime: '4 min'
      })) || [
        { name: 'Nearby Transit Stop', distance: '0.3 mi', walkTime: '4 min' }
      ])
    }
  };  // Saved locations with actual Bellevue/Seattle area destinations
  const savedLocations = user.savedLocations?.length > 0 ? user.savedLocations : [
    { id: 1, name: 'Home (Bellevue)', address: '123 Main St, Bellevue, WA', lat: 47.6101, lng: -122.2015 },
    { id: 2, name: 'Microsoft (Redmond)', address: 'Microsoft Campus, Redmond, WA', lat: 47.6423, lng: -122.1373 },
    { id: 3, name: 'GIX (Global Innovation Exchange)', address: '2795 Elliott Ave, Seattle, WA', lat: 47.6281, lng: -122.3567 },
    { id: 4, name: 'Planet Fitness (Bellevue)', address: '15600 NE 8th St, Bellevue, WA', lat: 47.6200, lng: -122.1326 },
    { id: 5, name: 'University of Washington', address: 'University of Washington, Seattle, WA', lat: 47.6553, lng: -122.3035 },
    { id: 6, name: 'Bellevue Square', address: 'Bellevue Square, Bellevue, WA', lat: 47.6164, lng: -122.2034 },
    { id: 7, name: 'Airport', address: 'Seattle-Tacoma International Airport', lat: 47.4502, lng: -122.3088 }
  ];  // Generate dynamic commute options based on real data
  const generateCommuteOptions = (destination) => {
    // Development logging - remove in production
    // console.log('[Dashboard] generateCommuteOptions called. Destination:', destination, 'Location Status:', locationStatus, 'Current Location:', currentLocation);
    
    if (!destination || locationStatus !== 'success' || !currentLocation) {
      // console.log('[Dashboard] Conditions not met for generating options. Returning default. Dest:', !!destination, 'Status:', locationStatus, 'Loc:', !!currentLocation);
      return [
        {
          id: 'drive',
          icon: '🚗',
          method: 'Drive',
          time: 'Select destination',
          distance: '--',
          cost: '--',
          co2: '--',
          recommended: true
        },
        {
          id: 'transit',
          icon: '🚊',
          method: 'Transit',
          time: 'Select destination',
          distance: '--',
          cost: '--',
          co2: '--',
          recommended: false
        },
        {
          id: 'bike',
          icon: '🚴',
          method: 'Bike',
          time: 'Select destination',
          distance: '--',
          cost: '--',
          co2: '--',
          recommended: false
        },
        {
          id: 'rideshare',
          icon: '🚙',
          method: 'Rideshare',
          time: 'Select destination',
          distance: '--',
          cost: '--',
          co2: '--',
          recommended: false
        }
      ];
    }    // Calculate base distance (using actual current location from useLocation hook)
    // const currentLocation = user.location || { lat: 47.6101, lng: -122.2015 }; // Old way
    
    // Development logging - remove in production
    // console.log('[Dashboard] Current location for distance calc:', currentLocation);
    // console.log('[Dashboard] Destination location for distance calc:', { lat: destination.lat, lng: destination.lng });
    
    // Prevent calculating distance if current location equals destination
    if (currentLocation.lat === destination.lat && currentLocation.lng === destination.lng) {
      // console.warn('[Dashboard] Current location equals destination!');
      // Return options indicating no travel needed or minimal values
      return [
        { id: 'drive', icon: '🚗', method: 'Drive', time: '0 min', distance: '0 mi', cost: '$0.00', co2: '0.0 kg', recommended: true },
        { id: 'transit', icon: '🚊', method: 'Transit', time: '0 min', distance: '0 mi', cost: '$0.00', co2: '0.0 kg', recommended: false },
        { id: 'bike', icon: '🚴', method: 'Bike', time: '0 min', distance: '0 mi', cost: '$0.00', co2: '0.0 kg', recommended: false },
        { id: 'rideshare', icon: '🚙', method: 'Rideshare', time: '0 min', distance: '0 mi', cost: '$0.00', co2: '0.0 kg', recommended: false },
      ];
    }
    
    const distance = Math.sqrt(
      Math.pow(destination.lat - currentLocation.lat, 2) + 
      Math.pow(destination.lng - currentLocation.lng, 2)    ) * 69; // Rough conversion to miles
    
    // Development logging - remove in production
    // console.log('[Dashboard] Calculated distance:', distance, 'miles');
    
    // Ensure distance is reasonable (greater than 0.01 miles to avoid issues with very small distances)
    const adjustedDistance = Math.max(distance, 0.01);
    // console.log('[Dashboard] Adjusted distance:', adjustedDistance, 'miles');
    
    // Use traffic data to adjust driving time
    const baseTime = Math.max(adjustedDistance * 2.5, 1); // Base time estimate, min 1 min
    const trafficMultiplier = getTrafficCondition(traffic) === 'Heavy' ? 1.5 :                             getTrafficCondition(traffic) === 'Moderate' ? 1.2 : 1.0;
    const drivingTime = Math.round(baseTime * trafficMultiplier);
    
    // Development logging - remove in production
    // console.log('[Dashboard] Base time:', baseTime, 'Traffic multiplier:', trafficMultiplier, 'Final driving time:', drivingTime);
    
    // Weather impact on different transport modes
    const weatherCondition = weather?.description?.toLowerCase() || '';
    const isWeatherBad = weatherCondition.includes('rain') || weatherCondition.includes('snow');
    const temperature = weather?.temperature || 20;
    const isCold = temperature < 5; // Below 5°C
    
    const options = [
      {
        id: 'drive',
        icon: '🚗',
        method: 'Drive',
        time: `${Math.max(1, drivingTime)}-${Math.max(2, drivingTime + 5)} min`, // Ensure time is at least 1-2 min
        distance: `${adjustedDistance.toFixed(1)} mi`,
        cost: `$${(adjustedDistance * 0.26).toFixed(2)}`, // Rough gas cost estimate
        co2: `${(adjustedDistance * 0.34).toFixed(1)} kg`, // CO2 estimate
        recommended: isWeatherBad || isCold
      },
      {
        id: 'transit',
        icon: '🚊',
        method: transit?.routes?.[0]?.longName || 'Transit',
        time: `${Math.max(1, Math.round(drivingTime * 1.4))}-${Math.max(2, Math.round(drivingTime * 1.6))} min`,
        distance: `${(adjustedDistance * 0.2).toFixed(1)} mi walk`,
        cost: '$3.50',
        co2: `${(adjustedDistance * 0.08).toFixed(1)} kg`,
        recommended: !isWeatherBad && adjustedDistance > 3
      },
      {
        id: 'bike',
        icon: '🚴',
        method: 'Bike',
        time: `${Math.max(1, Math.round(adjustedDistance * 4))}-${Math.max(2, Math.round(adjustedDistance * 5))} min`,
        distance: `${adjustedDistance.toFixed(1)} mi`,
        cost: '$0.00',
        co2: '0.0 kg',
        recommended: !isWeatherBad && !isCold && adjustedDistance < 8
      },
      {
        id: 'rideshare',
        icon: '🚙',
        method: 'Rideshare',
        time: `${Math.max(1, drivingTime + 3)}-${Math.max(2, drivingTime + 8)} min`,
        distance: `${adjustedDistance.toFixed(1)} mi`,
        cost: `$${(8 + adjustedDistance * 1.5).toFixed(2)}`, // Base fare + distance
        co2: `${(adjustedDistance * 0.30).toFixed(1)} kg`,
        recommended: isWeatherBad && adjustedDistance > 2      }
    ];
    
    // Development logging - remove in production
    // console.log('[Dashboard] Generated commute options:', options);
    return options;
  };

  // IMPORTANT: commuteOptions must be memoized or managed with useState/useEffect
  // to prevent re-calculation on every render if selectedDestination hasn't changed.
  // For now, it's recalculated on each render, which is fine if generateCommuteOptions is pure
  // and its dependencies (selectedDestination, locationStatus, currentLocation, traffic, weather) are stable
  // or their changes are intended to trigger a re-calculation.
  const [commuteOptions, setCommuteOptions] = useState(generateCommuteOptions(selectedDestination));

  useEffect(() => {
    // Development logging - remove in production
    // console.log('[Dashboard] useEffect for commuteOptions update. Deps:', selectedDestination, locationStatus, currentLocation, traffic, weather);
    const newOptions = generateCommuteOptions(selectedDestination);
    setCommuteOptions(newOptions);
  }, [selectedDestination, locationStatus, currentLocation, traffic, weather]); // Add all dependencies of generateCommuteOptions


  // Enhanced commute options with ML-based recommendations
  const getEnhancedCommuteOptions = () => {
    if (!selectedDestination) return commuteOptions; // Reverted this line

    // Determine if this is a user-defined core location
    const coreLocationNames = ['home', 'work', 'gym', 'school'];
    const isUserDefinedCore = coreLocationNames.some(core => 
      selectedDestination.name.toLowerCase().includes(core)
    );

    const context = {
      weather: processedData.weather.condition,
      timeOfDay: new Date().getHours(),
      temperature: processedData.weather.temperature
    };

    // For core locations, minimize ML interference
    if (isUserDefinedCore) {
      return commuteOptions.map(option => ({
        ...option,
        // Keep original recommendations for core locations
        mlReason: option.recommended ? 'Recommended for current conditions' : ''
      }));
    }

    // For non-core locations, apply full ML recommendations
    const smartDefault = mlUtils.getSmartDefault(selectedDestination.id);
    const recommendedMethod = mlUtils.getRecommendedTransport(context);

    return commuteOptions.map(option => {
      let isRecommended = option.recommended; // Keep original recommendations
      let mlReason = '';

      // Apply ML-based recommendations for non-core locations
      if (smartDefault === option.id) {
        isRecommended = true;
        mlReason = 'Your usual choice';
      } else if (recommendedMethod === option.id) {
        isRecommended = true;
        mlReason = 'Smart suggestion';
      }

      return {
        ...option,
        recommended: isRecommended,
        mlReason
      };
    });
  };

  // Get enhanced saved locations with frequency indicators
  const getEnhancedSavedLocations = () => {
    const frequentDestinations = mlUtils.getFrequentDestinations();
    const frequentIds = new Set(frequentDestinations.slice(0, 2).map(d => d.destinationId));

    return savedLocations.map(location => ({
      ...location,
      isFrequent: frequentIds.has(location.id),
      visitCount: frequentDestinations.find(d => d.destinationId === location.id)?.count || 0
    }));  };

  // Initialize selectedDestination from Redux store on mount
  useEffect(() => {
    // Ensure user.savedLocations is available before proceeding
    if (!isInitialized && user.savedLocations && user.savedLocations.length > 0 && user.selectedLocation) {
      const initialLocation = user.savedLocations.find(loc => loc.id === user.selectedLocation);
      if (initialLocation) {
        setSelectedDestination(initialLocation);
        setIsInitialized(true);
        
        // Only apply ML smart default for non-essential locations (not Home, Work, Gym, School)
        // These are the user's core locations that should remain as user-defined defaults
        const coreLocationNames = ['home', 'work', 'gym', 'school'];
        const isUserDefinedCore = coreLocationNames.some(core => 
          initialLocation.name.toLowerCase().includes(core)
        );
        
        if (!isUserDefinedCore) {
          // Only apply ML recommendations for other locations
          const smartDefault = mlUtils.getSmartDefault(initialLocation.id);
          if (smartDefault) {
            setSelectedCommuteOption(smartDefault);
          }
        }
      }
    }  }, [user.savedLocations, user.selectedLocation, isInitialized]);

  // Initialize ML recommendations when data is available
  useEffect(() => {
    // Wait for at least weather data to be available and location to be successful
    if (locationStatus === 'success' && weather && !weatherLoading) {
      const context = {
        weather: processedData.weather.condition,
        timeOfDay: new Date().getHours(),
        temperature: processedData.weather.temperature
      };

      setMlRecommendations({
        frequentDestinations: mlUtils.getFrequentDestinations(),
        recommendedTransport: mlUtils.getRecommendedTransport(context),
        insights: mlUtils.getUserInsights()
      });    }
  }, [weather, weatherLoading, processedData.weather.condition, processedData.weather.temperature, locationStatus]);

  // REMOVED: useEffect that was forcing recalculation by updating expandedCards
  // useEffect(() => {
  //   console.log('Dashboard: useEffect triggered by destination or currentLocation change:', selectedDestination, currentLocation);
  //   if (selectedDestination && currentLocation) {
  //     console.log('Dashboard: Forcing commute options recalculation');
  //     setExpandedCards(prev => ({ ...prev })); 
  //   }
  // }, [selectedDestination, currentLocation]);
  // This useEffect is primarily for logging and ensuring dependencies are clear.
  // The actual re-render and recalculation of commuteOptions happens because
  // selectedDestination is state and generateCommuteOptions is called in the render path.
  useEffect(() => {
    // Development logging - remove in production
    // console.log('[Dashboard Effect] Destination or Current Location changed. ', {
    //   newDestination: selectedDestination,
    //   newCurrentLocation: currentLocation,
    //   locationStatus 
    // });
    // Commute options will be recalculated on this re-render if selectedDestination or currentLocation changed.
    // No need to manually trigger anything here for commuteOptions themselves.
  }, [selectedDestination, currentLocation, locationStatus]);
  const handleLocationSelect = (location) => {
    // Development logging - remove in production
    // console.log('Dashboard: handleLocationSelect called with:', location);
    // console.log('Dashboard: Previous selectedDestination:', selectedDestination);
    
    setSelectedDestination(location);
    dispatch(selectSavedLocation(location.id));
    
    // Clear any stale ETA data from localStorage when switching destinations
    localStorage.removeItem('route_eta');
    
    // console.log('Dashboard: New selectedDestination set to:', location);
    
    // Reset to default commute option when switching destinations to avoid confusion
    const defaultOption = 'drive'; // Always start with drive as default
    setSelectedCommuteOption(defaultOption);
    // console.log('Dashboard: Reset selectedCommuteOption to default:', defaultOption);
    
    // Only apply ML smart defaults for non-core locations after a brief delay
    // Core locations (Home, Work, Gym, School) should preserve user's preferred defaults
    const coreLocationNames = ['home', 'work', 'gym', 'school'];
    const isUserDefinedCore = coreLocationNames.some(core => 
      location.name.toLowerCase().includes(core)
    );
    
    if (!isUserDefinedCore) {      // Apply smart default for other locations (restaurants, shopping, etc.) after a delay
      setTimeout(() => {
        const smartDefault = mlUtils.getSmartDefault(location.id);
        if (smartDefault) {
          // console.log('Dashboard: Applying ML smart default after delay:', smartDefault);
          setSelectedCommuteOption(smartDefault);
        }
      }, 100); // Small delay to ensure destination update is processed
        }
    // For core locations, keep the default selection
  };
  const handleCommuteOptionSelect = (optionId) => {
    // Development logging - remove in production
    // console.log('Dashboard: handleCommuteOptionSelect called with:', optionId);
    // console.log('Dashboard: Previous selectedCommuteOption:', selectedCommuteOption);
    
    setSelectedCommuteOption(optionId);
    
    // console.log('Dashboard: New selectedCommuteOption set to:', optionId);
    
    // Track user choice for ML learning
    if (selectedDestination) {
      const choice = {
        destinationId: selectedDestination.id,
        destinationName: selectedDestination.name,
        transportMethod: optionId,
        weather: processedData.weather.condition,
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };

      const context = {
        temperature: processedData.weather.temperature,
        condition: processedData.weather.condition
      };

      mlUtils.trackUserChoice(choice, context);
    }
  };
  const toggleAccordionCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };  const openFullMap = () => {
    // Development logging - remove in production
    // console.log('Dashboard: openFullMap called');
    // console.log('Dashboard: selectedDestination:', selectedDestination);
    // console.log('Dashboard: selectedCommuteOption:', selectedCommuteOption);
    
    if (selectedDestination) {
      // Force a fresh calculation of commute options to ensure we have the latest data
      const freshCommuteOptions = generateCommuteOptions(selectedDestination);
      // console.log('Dashboard: freshCommuteOptions:', freshCommuteOptions);
      
      // Get the currently selected option from fresh data
      const selectedOption = freshCommuteOptions.find(option => option.id === selectedCommuteOption) || freshCommuteOptions[0];
      
      // console.log('Dashboard: selectedOption being passed to map:', selectedOption);
      
      navigate('/map', { 
        state: { 
          destination: selectedDestination,
          commuteOption: selectedOption
        } 
      });
    } else {
      // console.warn('Dashboard: No destination selected, cannot open map');
    }
  };

  // Get the currently selected commute option for preview
  const getSelectedCommuteData = () => {
    const options = getEnhancedCommuteOptions(); // Ensure we use enhanced options
    return options.find(option => option.id === selectedCommuteOption) || options[0];
  };

  return (
    <div className="dashboard-container">
      {/* Header */}      <div className="dashboard-header">
        <div className="greeting-section">
          <h1>{locationStatus === 'loading' ? 'Locating...' : locationStatus === 'error' ? 'Location Error' : 'Good Evening'}</h1>
          <p>Plan your commute</p>
        </div>
        <div className="profile-section">
          <div className="avatar">JD</div>
        </div>      </div>

      {/* Accordion Status Cards */}
      <div className="status-accordion-container">        {/* Weather Card */}
        <div className={`accordion-card ${expandedCards.weather ? 'expanded' : ''}`}>
          <div 
            className="accordion-header"
            onClick={() => toggleAccordionCard('weather')}
          >            <div className="accordion-main-info">              <div className="accordion-icon">{weatherLoading || locationStatus === 'loading' ? '⏳' : (weatherError || locationError) ? '❌' : processedData.weather.icon}</div>
              <div className="accordion-content">
                <div className="accordion-title">Weather {(weatherError || locationError) && <span style={{color: '#ff6b6b'}}>⚠</span>}</div>
                <div className="accordion-summary">
                  {weatherLoading || locationStatus === 'loading' ? (
                    <>
                      <span className="primary-value">--°</span>
                      <span className="secondary-info">Loading...</span>
                    </>
                  ) : (weatherError || locationError) ? (
                    <>
                      <span className="primary-value">--°</span>
                      <span className="secondary-info">Error</span>
                    </>
                  ) : (
                    <>
                      <span className="primary-value">{processedData.weather.temperature}°</span>
                      <span className="secondary-info">{processedData.weather.condition}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`accordion-toggle ${expandedCards.weather ? 'expanded' : ''}`}>
              <span>▼</span>
            </div>
          </div>

          {expandedCards.weather && (
            <div className="accordion-body">
              <div className="weather-details">
                <div className="weather-header">
                  <div className="weather-main">
                    <span className="large-temp">{processedData.weather.temperature}°</span>
                    <span className="feels-like">Feels like {processedData.weather.feelsLike}</span>
                  </div>
                </div>
                
                <div className="weather-stats">
                  <div className="weather-stat">
                    <span className="stat-icon">💧</span>
                    <span className="stat-label">Humidity</span>
                    <span className="stat-value">{processedData.weather.humidity}%</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-icon">💨</span>
                    <span className="stat-label">Wind</span>
                    <span className="stat-value">{processedData.weather.windSpeed} mph</span>
                  </div>
                  <div className="weather-stat">
                    <span className="stat-icon">👁️</span>
                    <span className="stat-label">Visibility</span>
                    <span className="stat-value">{processedData.weather.visibility}</span>
                  </div>
                </div>

                <div className="hourly-forecast">
                  <h4>Hourly Forecast</h4>
                  <div className="forecast-items">
                    {processedData.weather.hourlyForecast.map((hour, index) => (
                      <div key={index} className="forecast-item">
                        <span className="forecast-time">{hour.time}</span>
                        <span className="forecast-icon">{hour.icon}</span>
                        <span className="forecast-temp">{hour.temp}</span>
                        <span className="forecast-condition">{hour.condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>        {/* Traffic Card */}
        <div className={`accordion-card ${expandedCards.traffic ? 'expanded' : ''}`}>
          <div 
            className="accordion-header"
            onClick={() => toggleAccordionCard('traffic')}
          >
            <div className="accordion-main-info">              <div className="accordion-icon">{trafficLoading || locationStatus === 'loading' ? '⏳' : trafficError ? '❌' : '🚦'}</div>
              <div className="accordion-content">
                <div className="accordion-title">Traffic {trafficError && <span style={{color: '#ff6b6b'}}>⚠</span>}</div>
                <div className="accordion-summary">
                  {trafficLoading || locationStatus === 'loading' ? (
                    <>
                      <span className="primary-value">Loading...</span>
                      <span className="secondary-info">--</span>
                    </>
                  ) : trafficError ? (
                    <>
                      <span className="primary-value">Error</span>
                      <span className="secondary-info">--</span>
                    </>
                  ) : (
                    <>
                      <span className="primary-value">{processedData.traffic.currentCondition}</span>
                      <span className="secondary-info">{processedData.traffic.travelTime}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`accordion-toggle ${expandedCards.traffic ? 'expanded' : ''}`}>
              <span>▼</span>
            </div>
          </div>

          {expandedCards.traffic && (
            <div className="accordion-body">
              <div className="traffic-details">
                <div className="traffic-header">
                  <div className="traffic-overview">
                    <span className="traffic-status">{processedData.traffic.currentCondition}</span>
                    <span className="average-speed">Avg Speed: {processedData.traffic.averageSpeed}</span>
                  </div>
                </div>

                <div className="traffic-incidents">
                  <h4>Current Incidents</h4>
                  {processedData.traffic.incidents.map((incident, index) => (
                    <div key={index} className="incident-item">
                      <span className="incident-icon">{incident.icon}</span>
                      <div className="incident-info">
                        <span className="incident-type">{incident.type}</span>
                        <span className="incident-location">{incident.location}</span>
                        <span className="incident-delay">Delay: {incident.delay}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="traffic-alternative">
                  <h4>Alternative Route</h4>
                  <div className="alternative-item">
                    <span className="alt-icon">🛣️</span>
                    <span className="alt-text">{processedData.traffic.alternativeRoute}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>        {/* Transit Card */}
        <div className={`accordion-card ${expandedCards.transit ? 'expanded' : ''}`}>
          <div 
            className="accordion-header"
            onClick={() => toggleAccordionCard('transit')}
          >
            <div className="accordion-main-info">              <div className="accordion-icon">{transitLoading || locationStatus === 'loading' ? '⏳' : transitError ? '❌' : '🚊'}</div>
              <div className="accordion-content">
                <div className="accordion-title">Transit {transitError && <span style={{color: '#ff6b6b'}}>⚠</span>}</div>
                <div className="accordion-summary">
                  {transitLoading || locationStatus === 'loading' ? (
                    <>
                      <span className="primary-value">Loading...</span>
                      <span className="secondary-info">--</span>
                    </>
                  ) : transitError ? (
                    <>
                      <span className="primary-value">Error</span>
                      <span className="secondary-info">--</span>
                    </>
                  ) : (
                    <>
                      <span className="primary-value">{processedData.transit.nextArrival}</span>
                      <span className="secondary-info">Next Train</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`accordion-toggle ${expandedCards.transit ? 'expanded' : ''}`}>
              <span>▼</span>
            </div>
          </div>

          {expandedCards.transit && (
            <div className="accordion-body">
              <div className="transit-details">
                <div className="transit-header">
                  <div className="next-arrival">
                    <span className="arrival-time">{processedData.transit.nextArrival}</span>
                    <span className="arrival-status">{processedData.transit.status}</span>
                  </div>
                </div>

                <div className="upcoming-trains">
                  <h4>Upcoming Trains</h4>
                  {processedData.transit.upcomingTrains.map((train, index) => (
                    <div key={index} className="train-item">
                      <span className="train-icon">🚊</span>
                      <div className="train-info">
                        <span className="train-line">{train.line}</span>
                        <span className="train-destination">to {train.destination}</span>
                        <span className="train-time">{train.time} • {train.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="nearby-stops">
                  <h4>Nearby Stops</h4>
                  {processedData.transit.nearbyStops.map((stop, index) => (
                    <div key={index} className="stop-item">
                      <span className="stop-icon">🚶</span>
                      <div className="stop-info">
                        <span className="stop-name">{stop.name}</span>
                        <span className="stop-distance">{stop.distance} • {stop.walkTime} walk</span>
                      </div>
                    </div>
                  ))}
                </div>

                {processedData.transit.serviceAlerts.length > 0 && (
                  <div className="service-alerts">
                    <h4>Service Alerts</h4>
                    {processedData.transit.serviceAlerts.map((alert, index) => (
                      <div key={index} className="alert-item">
                        <span className="alert-icon">ℹ️</span>
                        <span className="alert-message">{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>      {/* Destination Selection */}
      <div className="destination-section">
        <h2>Where are you going?</h2>
        {locationStatus === 'error' && (
          <p className="error-message">Could not retrieve your current location. Please check permissions. Destination features may be limited.</p>
        )}
        <div className="destination-grid">
          {getEnhancedSavedLocations().map(location => (
            <div 
              key={location.id}
              className={`destination-card ${selectedDestination?.id === location.id ? 'selected' : ''} ${location.isFrequent ? 'frequent' : ''}`}
              onClick={() => handleLocationSelect(location)}
            >
              <div className="destination-icon">
                {location.isFrequent ? '⭐' : '📍'}
              </div>
              <div className="destination-info">
                <h3>
                  {location.name}
                  {location.isFrequent && <span className="frequent-badge">Frequent</span>}
                </h3>
                <p>{location.address}</p>
                {location.visitCount > 0 && (
                  <p className="visit-count">{location.visitCount} recent visits</p>
                )}
              </div>
              {selectedDestination?.id === location.id && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>      {/* Commute Options */}
      {selectedDestination && locationStatus === 'success' && ( // Ensure location is success before showing commute options
        <div className="commute-section" key={`commute-${selectedDestination.id}-${selectedCommuteOption}-${currentLocation?.lat}-${currentLocation?.lng}`}>
          <h2>How do you want to get there?</h2>          <div className="commute-options">
            {getEnhancedCommuteOptions().map(option => (
              <div 
                key={`${option.id}-${selectedDestination.id}`} 
                className={`commute-card ${option.recommended ? 'recommended' : ''} ${selectedCommuteOption === option.id ? 'selected' : ''}`}
                onClick={() => handleCommuteOptionSelect(option.id)}
              >
                <div className="commute-header">
                  <div className="commute-icon">{option.icon}</div>
                  <div className="commute-method">
                    <h3>{option.method}</h3>
                    {option.recommended && (
                      <span className="badge">
                        {option.mlReason || 'Recommended'}
                      </span>
                    )}
                  </div>
                  <div className="commute-time">{option.time}</div>
                </div>
                
                <div className="commute-details">
                  <div className="detail-item">
                    <span className="detail-icon">📏</span>
                    <span>{option.distance}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">💰</span>
                    <span>{option.cost}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">🌱</span>
                    <span>{option.co2} CO₂</span>
                  </div>
                </div>
                {selectedCommuteOption === option.id && (
                  <div className="selected-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}      {/* Route Preview Button */}
      {selectedDestination && locationStatus === 'success' && ( // Ensure location is success
        <div className="route-preview-section">
          <button className="route-preview-button" onClick={openFullMap} disabled={locationStatus !== 'success'}>
            <div className="button-content">
              <div className="button-icon">
                <span className="map-icon">🗺️</span>
                <span className="transport-icon">{getSelectedCommuteData().icon}</span>
              </div>
              <div className="button-text">
                <span className="button-title">View Route Preview Map</span>
                <span className="button-subtitle">
                  {getSelectedCommuteData().method} to {selectedDestination.name}
                </span>
              </div>
              <div className="button-arrow">→</div>
            </div>
          </button>
        </div>
      )}      {/* Footer Bar */}
      <div className="footer-bar">
        <button className="footer-button" onClick={() => navigate('/favorites')}>
          <span className="footer-icon">⭐</span>
          <span className="footer-label">Smart Favorites</span>
        </button>
        <button className="footer-button" onClick={() => navigate('/analytics')}>
          <span className="footer-icon">📊</span>
          <span className="footer-label">Analytics</span>
        </button>
        <button className="footer-button" onClick={() => navigate('/settings')}>
          <span className="footer-icon">⚙️</span>
          <span className="footer-label">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
