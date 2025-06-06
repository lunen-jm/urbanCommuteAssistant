import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/BackButton/BackButton';
import MapContainer from '../../components/Map/MapContainer';
import './Layout2_iOS.css';

const Layout2_iOS = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
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
    <div className="layout2-container">
      <BackButton variant="ios" />
      {/* Status Bar */}
      <div className="status-bar">
        <div className="time">9:41</div>
        <div className="status-icons">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="ios-header">
        <div className="header-content">
          <div className="location-chip">
            <span className="location-icon">📍</span>
            <span>Fremont → Downtown</span>
          </div>
          <div className="profile-button">
            <div className="profile-avatar"></div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="content-container">
        {/* Quick Summary Section */}
        <div className="summary-section">
          <div className="summary-card">
            <div className="summary-header">
              <h2>Your Commute</h2>
              <div className="summary-time">
                <span className="time-value">22</span>
                <span className="time-unit">min</span>
              </div>
            </div>
            <div className="summary-details">
              <div className="detail-item">
                <span className="detail-icon">🚗</span>
                <span className="detail-text">Drive via I-5</span>
                <span className="detail-badge">Fastest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="segmented-control">
          <div 
            className={`segment ${selectedTab === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedTab('overview')}
          >
            Overview
          </div>
          <div 
            className={`segment ${selectedTab === 'routes' ? 'active' : ''}`}
            onClick={() => setSelectedTab('routes')}
          >
            Routes
          </div>
          <div 
            className={`segment ${selectedTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setSelectedTab('alerts')}
          >
            Alerts
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {selectedTab === 'overview' && (
            <div className="overview-content">
              {/* Weather Card */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon weather-icon">☀️</div>
                  <div className="card-title">Weather</div>
                </div>
                <div className="card-content">
                  <div className="weather-main">
                    <span className="temp">{mockData.weather.temperature}°</span>
                    <span className="condition">{mockData.weather.description}</span>
                  </div>
                </div>
              </div>

              {/* Traffic Card */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon traffic-icon">🚦</div>
                  <div className="card-title">Traffic</div>
                </div>
                <div className="card-content">
                  <div className="traffic-status">
                    <span className="status-level moderate">Moderate</span>
                    <span className="incidents-count">{mockData.traffic.count} incidents</span>
                  </div>
                </div>
              </div>

              {/* Transit Card */}
              <div className="info-card">
                <div className="card-header">
                  <div className="card-icon transit-icon">🚊</div>
                  <div className="card-title">Transit</div>
                </div>
                <div className="card-content">
                  <div className="transit-status">
                    <span className="status-level good">On Time</span>
                    <span className="next-arrival">Next: 8 min</span>
                  </div>
                </div>
              </div>

              {/* Map Section */}              <div className="map-section">
                <div className="map-container">
                  <div className="map-placeholder">
                    <MapContainer setEta={setEta} />
                    <div className="route-overlay">
                      <div className="eta-display">
                        {eta || '--'} min
                      </div>
                    </div>
                  </div>
                  <div className="map-controls">
                    <button className="map-control">🔍+</button>
                    <button className="map-control">🔍-</button>
                    <button className="map-control">📍</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'routes' && (
            <div className="routes-content">
              <div className="route-option recommended">
                <div className="route-header">
                  <div className="route-icon">🚗</div>
                  <div className="route-info">
                    <div className="route-name">Drive</div>
                    <div className="route-details">Via I-5 North</div>
                  </div>
                  <div className="route-time">22 min</div>
                </div>
                <div className="route-badge">Recommended</div>
              </div>

              <div className="route-option">
                <div className="route-header">
                  <div className="route-icon">🚊</div>
                  <div className="route-info">
                    <div className="route-name">Transit</div>
                    <div className="route-details">Light Rail + Walk</div>
                  </div>
                  <div className="route-time">28 min</div>
                </div>
              </div>

              <div className="route-option">
                <div className="route-header">
                  <div className="route-icon">🚴</div>
                  <div className="route-info">
                    <div className="route-name">Bike</div>
                    <div className="route-details">Burke-Gilman Trail</div>
                  </div>
                  <div className="route-time">35 min</div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="alerts-content">
              <div className="alert-item">
                <div className="alert-header">
                  <div className="alert-icon warning">⚠️</div>
                  <div className="alert-title">Traffic Alert</div>
                  <div className="alert-time">5m ago</div>
                </div>
                <div className="alert-message">
                  Construction on I-5 causing delays. Consider alternate route.
                </div>
              </div>

              <div className="alert-item">
                <div className="alert-header">
                  <div className="alert-icon info">ℹ️</div>
                  <div className="alert-title">Transit Update</div>
                  <div className="alert-time">12m ago</div>
                </div>
                <div className="alert-message">
                  Light Rail services running on schedule. No delays reported.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* iOS-style Home Indicator */}
      <div className="home-indicator"></div>
    </div>
  );
};

export default Layout2_iOS;
