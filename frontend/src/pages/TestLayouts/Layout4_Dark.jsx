import React from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/BackButton/BackButton';
import MapContainer from '../../components/Map/MapContainer';
import './Layout4_Dark.css';

const Layout4_Dark = () => {
  // Get data from Redux store with fallbacks
  const [eta, setEta] = React.useState(null);
  const weather = useSelector(state => state.weather?.data || {
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8
  });
  
  const traffic = useSelector(state => state.traffic?.data || {
    currentCondition: 'Moderate',
    averageSpeed: 45,
    incidents: 2,
    travelTime: '25 min'
  });
  
  const transit = useSelector(state => state.transit?.data || {
    nextArrival: '12 min',
    status: 'On Time',
    delays: 0,
    route: 'Route 44'
  });

  const user = useSelector(state => state.user?.data || {
    name: 'Alex',
    homeLocation: 'Downtown',
    workLocation: 'Tech District'
  });

  return (
    <div className="layout4-container">
      <BackButton variant="neon" />
      {/* Header with neon accent */}
      <header className="layout4-header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="user-greeting">
            <h1>Welcome back, <span className="neon-text">{user.name}</span></h1>
            <p>Your commute status</p>
          </div>
          <div className="header-actions">
            <button className="neon-button">
              <span className="button-glow"></span>
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main status grid */}
      <div className="status-grid">
        {/* Weather card */}
        <div className="status-card weather-card">
          <div className="card-glow weather-glow"></div>
          <div className="card-header">
            <div className="card-icon weather-icon">🌤️</div>
            <h3>Weather</h3>
          </div>
          <div className="card-content">
            <div className="primary-stat">
              <span className="stat-value neon-text">{weather.temperature}°</span>
              <span className="stat-label">{weather.condition}</span>
            </div>
            <div className="secondary-stats">
              <div className="stat-item">
                <span className="stat-icon">💧</span>
                <span>{weather.humidity}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💨</span>
                <span>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic card */}
        <div className="status-card traffic-card">
          <div className="card-glow traffic-glow"></div>
          <div className="card-header">
            <div className="card-icon traffic-icon">🚗</div>
            <h3>Traffic</h3>
          </div>
          <div className="card-content">
            <div className="primary-stat">
              <span className="stat-value neon-text">{traffic.travelTime}</span>
              <span className="stat-label">{traffic.currentCondition}</span>
            </div>
            <div className="secondary-stats">
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <span>{traffic.averageSpeed} km/h</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⚠️</span>
                <span>{traffic.incidents} incidents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transit card */}
        <div className="status-card transit-card">
          <div className="card-glow transit-glow"></div>
          <div className="card-header">
            <div className="card-icon transit-icon">🚌</div>
            <h3>Transit</h3>
          </div>
          <div className="card-content">
            <div className="primary-stat">
              <span className="stat-value neon-text">{transit.nextArrival}</span>
              <span className="stat-label">{transit.route}</span>
            </div>
            <div className="secondary-stats">
              <div className="stat-item">
                <span className="stat-icon">✅</span>
                <span>{transit.status}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <span>{transit.delays} delays</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route planning section */}
      <div className="route-section">
        <div className="section-glow"></div>
        <h2 className="section-title">
          <span className="neon-text">Route Planning</span>
        </h2>
        <div className="route-card">
          <div className="route-endpoints">
            <div className="endpoint">
              <div className="endpoint-icon">🏠</div>
              <span>{user.homeLocation}</span>
            </div>
            <div className="route-line">
              <div className="route-dots">
                <div className="dot active"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot active"></div>
              </div>
            </div>
            <div className="endpoint">
              <div className="endpoint-icon">🏢</div>
              <span>{user.workLocation}</span>
            </div>
          </div>
          <button className="route-button neon-button">
            <span className="button-glow"></span>
            Optimize Route
          </button>        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="map-section">
        <div className="section-glow"></div>
        <h2 className="section-title">
          <span className="neon-text">Live Route Map</span>
        </h2>
        <div className="map-card">
          <div className="map-container-wrapper">
            <MapContainer setEta={setEta} />
            <div className="map-overlay">
              <div className="eta-display">
                <span className="eta-value neon-text">{eta || '--'}</span>
                <span className="eta-label">minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button className="action-button">
          <div className="action-glow"></div>
          <span className="action-icon">📍</span>
          <span>Save Location</span>
        </button>
        <button className="action-button">
          <div className="action-glow"></div>
          <span className="action-icon">🔔</span>
          <span>Set Alert</span>
        </button>
        <button className="action-button">
          <div className="action-glow"></div>
          <span className="action-icon">📊</span>
          <span>View Stats</span>
        </button>
        <button className="action-button">
          <div className="action-glow"></div>
          <span className="action-icon">🚀</span>
          <span>Quick Route</span>
        </button>
      </div>

      {/* Bottom navigation */}
      <nav className="bottom-nav">
        <div className="nav-glow"></div>
        <div className="nav-items">
          <div className="nav-item active">
            <div className="nav-icon">🏠</div>
            <span>Home</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">🗺️</div>
            <span>Map</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">📈</div>
            <span>Analytics</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">👤</div>
            <span>Profile</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout4_Dark;
