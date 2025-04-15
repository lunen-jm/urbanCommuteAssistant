import React from 'react';
import useLocation from '../hooks/useLocation';
import { useTransitData } from '../hooks/useTransitData';
import Dashboard from '../components/Dashboard/Dashboard';
import Map from '../components/Map/Map';
import NotificationPanel from '../components/Notifications/NotificationPanel';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

const Home: React.FC = () => {
    const { userLocation } = useLocation();
    const { transitData, loading, error } = useTransitData(userLocation as LocationCoordinates | null);

    return (
        <div className="home-container">
            <h1>Welcome to the Urban Commute Assistant</h1>
            <Map />
            <Dashboard />
            <NotificationPanel />
        </div>
    );
};

export default Home;