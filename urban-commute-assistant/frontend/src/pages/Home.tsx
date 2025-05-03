import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useLocation from '../hooks/useLocation';
import { useTransitData } from '../hooks/useTransitData';
import Dashboard from '../components/Dashboard/Dashboard';
import MapContainer from '../components/Map/MapContainer';
import NotificationPanel from '../components/Notifications/NotificationPanel';
import { setCenter } from '../store/mapSlice';
import './Home.css';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

const Home: React.FC = () => {
    const dispatch = useDispatch();
    const { userLocation } = useLocation();
    const { transitData, loading, error } = useTransitData(userLocation as LocationCoordinates | null);

    // When user location is available, set it as the map center
    useEffect(() => {
        if (userLocation) {
            dispatch(setCenter({
                lat: userLocation.latitude,
                lng: userLocation.longitude
            }));
        }
    }, [userLocation, dispatch]);

    return (
        <div className="home-container">
            <div className="content-grid">
                <div className="map-section">
                    <MapContainer />
                </div>
                
                <div className="dashboard-section">
                    <Dashboard />
                </div>
                
                <div className="notifications-section">
                    <NotificationPanel />
                </div>
            </div>
        </div>
    );
};

export default Home;