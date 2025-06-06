import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/BackButton/BackButton';
import MapContainer from '../../components/Map/MapContainer';
import './Layout3_Material.css';

const Layout3_Material = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  const navItems = [
    { icon: '🏠', label: 'Home', id: 'home' },
    { icon: '🗺️', label: 'Map', id: 'map' },
    { icon: '📍', label: 'Places', id: 'places' },
    { icon: '⚙️', label: 'Settings', id: 'settings' }
  ];

  return (
    <div className="layout3-container">
      <BackButton variant="material" />
      {/* Header */}
      <div className="material-app-bar">
        <div className="app-bar-content">
          <div className="app-bar-title">
            <h1>Commute Assistant</h1>
            <p>Seattle, WA</p>
          </div>
          <div className="app-bar-actions">
            <button className="action-button">
              <span className="material-icon">🔔</span>
            </button>
            <button className="action-button">
              <span className="material-icon">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="material-content">
        {/* Primary Card */}
        <div className="primary-card">
          <div className="card-header">
            <div className="card-title">
              <h2>Your Daily Commute</h2>
              <p>Fremont to Downtown Seattle</p>
            </div>
            <div className="commute-time">
              <span className="time-number">24</span>
              <span className="time-label">minutes</span>
            </div>
          </div>
          
          <div className="commute-options">
            <div className="option-chip selected">
              <span className="chip-icon">🚗</span>
              <span className="chip-label">Drive</span>
            </div>
            <div className="option-chip">
              <span className="chip-icon">🚊</span>
              <span className="chip-label">Transit</span>
            </div>
            <div className="option-chip">
              <span className="chip-icon">🚴</span>
              <span className="chip-label">Bike</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="primary-button">
              <span className="material-icon">🧭</span>
              Start Navigation
            </button>
            <button className="secondary-button">
              <span className="material-icon">⏰</span>
              Set Reminder
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="info-grid">
          {/* Weather Card */}
          <div className="info-card weather-card">
            <div className="card-header-small">
              <span className="card-icon">🌤️</span>
              <h3>Weather</h3>
            </div>
            <div className="weather-content">
              <div className="weather-temp">{mockData.weather.temperature}°F</div>
              <div className="weather-desc">{mockData.weather.description}</div>
              <div className="weather-detail">
                <span>Humidity: 65%</span>
                <span>Wind: 8 mph</span>
              </div>
            </div>
          </div>

          {/* Traffic Card */}
          <div className="info-card traffic-card">
            <div className="card-header-small">
              <span className="card-icon">🚦</span>
              <h3>Traffic</h3>
            </div>
            <div className="traffic-content">
              <div className="traffic-status">
                <div className="status-indicator moderate"></div>
                <span>Moderate</span>
              </div>
              <div className="traffic-detail">
                <span>{mockData.traffic.count} incidents nearby</span>
                <span>15 min delay on I-5</span>
              </div>
            </div>
          </div>

          {/* Transit Card */}
          <div className="info-card transit-card">
            <div className="card-header-small">
              <span className="card-icon">🚊</span>
              <h3>Transit</h3>
            </div>
            <div className="transit-content">
              <div className="transit-status">
                <div className="status-indicator good"></div>
                <span>On Schedule</span>
              </div>
              <div className="transit-detail">
                <span>Next Light Rail: 6 min</span>
                <span>Bus 44: 12 min</span>
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="info-card map-card full-width">
            <div className="card-header-small">
              <span className="card-icon">🗺️</span>
              <h3>Route Overview</h3>
              <button className="expand-button">
                <span className="material-icon">⛶</span>
              </button>
            </div>            <div className="map-content">
              <div className="map-container">
                <MapContainer setEta={setEta} />
                <div className="route-info-overlay">
                  <div className="eta-info">
                    <span className="eta-time">{eta || '--'}</span>
                    <span className="eta-label">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="updates-section">
          <h3>Recent Updates</h3>
          <div className="update-list">
            <div className="update-item">
              <div className="update-icon warning">⚠️</div>
              <div className="update-content">
                <div className="update-title">Construction Alert</div>
                <div className="update-text">Lane closure on I-5 northbound near University Bridge</div>
                <div className="update-time">5 minutes ago</div>
              </div>
            </div>
            
            <div className="update-item">
              <div className="update-icon info">ℹ️</div>
              <div className="update-content">
                <div className="update-title">Transit Update</div>
                <div className="update-text">Light Rail running on schedule. No delays reported</div>
                <div className="update-time">12 minutes ago</div>
              </div>
            </div>
            
            <div className="update-item">
              <div className="update-icon success">✅</div>
              <div className="update-content">
                <div className="update-title">Route Optimization</div>
                <div className="update-text">Faster route found via Aurora Ave N</div>
                <div className="update-time">20 minutes ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="material-bottom-nav">
        {navItems.map((item, index) => (
          <div
            key={item.id}
            className={`nav-item ${selectedIndex === index ? 'active' : ''}`}
            onClick={() => setSelectedIndex(index)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {selectedIndex === index && <div className="nav-indicator"></div>}
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fab">
        <span className="material-icon">➕</span>
      </button>
    </div>
  );
};

export default Layout3_Material;
