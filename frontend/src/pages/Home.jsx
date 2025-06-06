import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Dashboard from '../components/Dashboard/Dashboard';
import MapContainerComponent from '../components/Map/MapContainer';
import RecommendedRouteMobile from '../components/Dashboard/RecommendedRouteMobile';
import './Home.css';

const Home = () => {
  const [eta, setEta] = useState(null);
  useEffect(() => {
    const handler = () => {
      setEta(localStorage.getItem('route_eta'));
    };
    window.addEventListener('storage', handler);
    handler();
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="home-container">
      <div className="mobile-recommended-route">
        <RecommendedRouteMobile eta={eta} />
      </div>
      <div className="map-section">
        <MapContainerComponent setEta={setEta} />
      </div>
      <div className="dashboard-section">
        <Dashboard />
      </div>
    </div>
  );
};

export default Home;
