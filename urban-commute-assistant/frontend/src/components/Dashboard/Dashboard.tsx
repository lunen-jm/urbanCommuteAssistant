import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../types';
import { fetchWeatherData } from '../../store/weatherSlice';
import { fetchTrafficData } from '../../store/trafficSlice';
import WeatherSummary from './WeatherSummary';
import TrafficSummary from './TrafficSummary';
import TransitSummary from './TransitSummary';
import CommuteSuggestions from './CommuteSuggestions';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch();
    const userPreferences = useSelector((state: RootState) => state.user.preferences);
    const mapCenter = useSelector((state: RootState) => state.map.center);
    const username = useSelector((state: RootState) => state.user.name);

    // Fetch data when the component mounts or when location changes
    useEffect(() => {
        // Use the map center as the location for fetching data
        // In a real implementation, we might use the user's current location or a saved home/work location
        if (mapCenter) {
            dispatch(fetchWeatherData(mapCenter));
            dispatch(fetchTrafficData(mapCenter));
            // Transit data would also be fetched here with a similar action
        }
    }, [dispatch, mapCenter]);

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                {username && <p className="welcome-message">Welcome, {username}!</p>}
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
                
                <div className="dashboard-card">
                    <CommuteSuggestions />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;