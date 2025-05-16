import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import MapContainerComponent from '../components/Map/MapContainer';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="map-section">
        <MapContainerComponent />
      </div>
      
      <div className="dashboard-section">
        <Dashboard />
      </div>
    </div>
  );
};

export default Home;
