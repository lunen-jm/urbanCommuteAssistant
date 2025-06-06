import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/BackButton/BackButton';
import MapContainer from '../../components/Map/MapContainer';
import './Layout1_Modern.css';

const Layout1_Modern = () => {
  const [eta, setEta] = useState(null);
  const weather = useSelector((state) => state.weather.data);
  const traffic = useSelector((state) => state.traffic.data);
  const transit = useSelector((state) => state.transit.data);

  // Mock data for demonstration
  const mockData = {
    weather: weather || {
      temperature: 68,
      description: 'Partly cloudy',
      icon: '02d'
    },
    traffic: traffic || {
      incidents: [
        { type: 'Construction', description: 'I-5 lane closure', severity: 'medium' },
        { type: 'Accident', description: 'Minor fender bender on SR-99', severity: 'low' }
      ],
      count: 2
    },
    transit: transit || {
      stops: [
        { name: 'University District Station', routes: ['Link Light Rail'] },
        { name: 'Capitol Hill Station', routes: ['Link Light Rail'] }
      ]
    }
  };

  return (
    <div className="layout1-container">
      <BackButton variant="default" />
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <div className="status-icon">🌤️</div>
          <div className="status-info">
            <div className="status-temp">{mockData.weather.temperature}°</div>
            <div className="status-desc">{mockData.weather.description}</div>
          </div>
        </div>
        
        <div className="status-item">
          <div className="status-icon">🚗</div>
          <div className="status-info">
            <div className="status-traffic">{mockData.traffic.count} Incidents</div>
            <div className="status-severity">Medium</div>
          </div>
        </div>
        
        <div className="status-item">
          <div className="status-icon">🚌</div>
          <div className="status-info">
            <div className="status-transit">On Time</div>
            <div className="status-line">Link Light Rail</div>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="layout1-header">
        <div className="greeting-section">
          <h1>Good Morning</h1>
          <p>Your commute overview for today</p>
        </div>
        <div className="profile-icon">
          <div className="avatar">JD</div>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="quick-status-grid">
        <div className="status-card weather-card">
          <div className="card-icon">🌤️</div>
          <div className="card-content">
            <h3>{mockData.weather.temperature}°</h3>
            <p>{mockData.weather.description}</p>
          </div>
        </div>
        
        <div className="status-card traffic-card">
          <div className="card-icon">🚗</div>
          <div className="card-content">
            <h3>{mockData.traffic.count}</h3>
            <p>Incidents</p>
          </div>
        </div>
        
        <div className="status-card transit-card">
          <div className="card-icon">🚌</div>
          <div className="card-content">
            <h3>On Time</h3>
            <p>Transit Status</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content-grid">
        {/* Map Section */}
        <div className="map-card">
          <div className="card-header">
            <h2>Route Overview</h2>
            <button className="expand-btn">⛶</button>
          </div>          <div className="map-placeholder">
            <div className="map-content">
              <div className="route-info">
                <div className="route-time">{eta || '-- min'}</div>
                <div className="route-method">Recommended: Driving</div>
              </div>
              <div className="map-visual">
                <MapContainer setEta={setEta} />
              </div>
            </div>
          </div>
        </div>

        {/* Commute Suggestions */}
        <div className="suggestions-card">
          <div className="card-header">
            <h2>Smart Suggestions</h2>
          </div>
          <div className="suggestions-list">
            <div className="suggestion-item recommended">
              <div className="suggestion-icon">🚗</div>
              <div className="suggestion-content">
                <h4>Drive via I-5</h4>
                <p>Fastest route today</p>
                <span className="eta">25 min</span>
              </div>
              <div className="recommendation-badge">Best</div>
            </div>
            
            <div className="suggestion-item">
              <div className="suggestion-icon">🚊</div>
              <div className="suggestion-content">
                <h4>Light Rail + Walk</h4>
                <p>Eco-friendly option</p>
                <span className="eta">32 min</span>
              </div>
            </div>
            
            <div className="suggestion-item">
              <div className="suggestion-icon">🚴</div>
              <div className="suggestion-content">
                <h4>Bike + Transit</h4>
                <p>Active commute</p>
                <span className="eta">28 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Updates */}
        <div className="alerts-card">
          <div className="card-header">
            <h2>Live Updates</h2>
          </div>
          <div className="alerts-list">
            <div className="alert-item traffic-alert">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>I-5 Construction</h4>
                <p>Lane closure until 3 PM</p>
                <span className="alert-time">15 min ago</span>
              </div>
            </div>
            
            <div className="alert-item transit-alert">
              <div className="alert-icon">🚊</div>
              <div className="alert-content">
                <h4>Light Rail On Time</h4>
                <p>All services running normally</p>
                <span className="alert-time">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active">
          <div className="nav-icon">🏠</div>
          <span>Home</span>
        </div>
        <div className="nav-item">
          <div className="nav-icon">🗺️</div>
          <span>Routes</span>
        </div>
        <div className="nav-item">
          <div className="nav-icon">📍</div>
          <span>Saved</span>
        </div>
        <div className="nav-item">
          <div className="nav-icon">⚙️</div>
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Layout1_Modern;
