import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WeatherSummary from './WeatherSummary';
import TrafficSummary from './TrafficSummary';
import TransitSummary from './TransitSummary';
import CommuteSuggestions from './CommuteSuggestions';
import { fetchWeatherData } from '../../store/weatherSlice';
import { fetchTrafficData } from '../../store/trafficSlice';
import { fetchTransitData } from '../../store/transitSlice';
import './Dashboard.css';

function getCardOrder(recommendation) {
  // Returns an array of card names in order
  if (recommendation === 'Public Transit') {
    return ['Transit', 'Weather', 'Traffic'];
  }
  if (recommendation === 'Walking') {
    return ['Weather', 'Transit', 'Traffic'];
  }
  // Default to Driving
  return ['Traffic', 'Transit', 'Weather'];
}

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const weather = useSelector((state) => state.weather.data);
  const traffic = useSelector((state) => state.traffic.data);
  const transit = useSelector((state) => state.transit.data);
  
  // Default location (Seattle)
  const defaultLocation = { lat: 47.6062, lng: -122.3321 };
  
  // Use user location if available, otherwise use default
  const location = user.location || defaultLocation;
  
  useEffect(() => {
    // Fetch all data when component mounts
    // Always use user's current location for transit, not destination
    const currentLocation = user.location || defaultLocation;
    dispatch(fetchWeatherData(currentLocation));
    dispatch(fetchTrafficData(currentLocation));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          dispatch(fetchTransitData({ lat: latitude, lng: longitude }));
        },
        () => {
          // Fallback to stored location if geolocation fails
          dispatch(fetchTransitData(currentLocation));
        }
      );
    } else {
      dispatch(fetchTransitData(currentLocation));
    }

    // Optional: Set up periodic refresh
    const refreshInterval = setInterval(() => {
      dispatch(fetchWeatherData(currentLocation));
      dispatch(fetchTrafficData(currentLocation));
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            dispatch(fetchTransitData({ lat: latitude, lng: longitude }));
          },
          () => {
            dispatch(fetchTransitData(currentLocation));
          }
        );
      } else {
        dispatch(fetchTransitData(currentLocation));
      }
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [dispatch, user.location]);

  // Determine optimal commute method (same logic as CommuteSuggestions)
  let recommendation = 'Driving';
  if (traffic && traffic.incidents && traffic.incidents.length > 3) {
    recommendation = 'Public Transit';
  } else if (weather && weather.description && weather.description.toLowerCase().includes('rain')) {
    recommendation = 'Public Transit';
  } else if (weather && weather.description && weather.description.toLowerCase().includes('clear')) {
    recommendation = 'Walking';
  }
  const cardOrder = getCardOrder(recommendation);

  // Card components map
  const cardComponents = {
    'Weather': <WeatherSummary />,
    'Traffic': <TrafficSummary />,
    'Transit': <TransitSummary />,
  };
  
  return (
    <div className="dashboard-vertical">
      <div className="dashboard-card commute-card">
        <CommuteSuggestions />
      </div>
      {cardOrder.map((name) => (
        <div className="dashboard-card" key={name}>
          {cardComponents[name]}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
