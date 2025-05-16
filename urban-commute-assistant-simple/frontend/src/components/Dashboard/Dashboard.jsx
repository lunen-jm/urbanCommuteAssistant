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

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  
  // Default location (Seattle)
  const defaultLocation = { lat: 47.6062, lng: -122.3321 };
  
  // Use user location if available, otherwise use default
  const location = user.location || defaultLocation;
  
  useEffect(() => {
    // Fetch all data when component mounts
    dispatch(fetchWeatherData(location));
    dispatch(fetchTrafficData(location));
    dispatch(fetchTransitData(location));
    
    // Optional: Set up periodic refresh
    const refreshInterval = setInterval(() => {
      dispatch(fetchWeatherData(location));
      dispatch(fetchTrafficData(location));
      dispatch(fetchTransitData(location));
    }, 300000); // Refresh every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [dispatch, location]);
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Urban Commute Dashboard</h2>
        {user.name && <p className="welcome-message">Welcome, {user.name}!</p>}
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <WeatherSummary />
        </div>
        
        <div className="dashboard-card">
          <TrafficSummary />
        </div>
        
        <div className="dashboard-card">
          <TransitSummary />
        </div>
        
        <div className="dashboard-card wide-card">
          <CommuteSuggestions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
