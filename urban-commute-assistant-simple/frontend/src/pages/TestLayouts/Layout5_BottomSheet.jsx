import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '../../components/BackButton/BackButton';
import MapContainer from '../../components/Map/MapContainer';
import './Layout5_BottomSheet.css';

const Layout5_BottomSheet = () => {
  const [activeSheet, setActiveSheet] = useState(null);
  const [sheetHeight, setSheetHeight] = useState('partial');
  const [eta, setEta] = useState(null);

  // Get data from Redux store with fallbacks
  const weather = useSelector(state => state.weather?.data || {
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    uvIndex: 3
  });
  
  const traffic = useSelector(state => state.traffic?.data || {
    currentCondition: 'Moderate',
    averageSpeed: 45,
    incidents: 2,
    travelTime: '25 min',
    congestionLevel: 'Medium'
  });
  
  const transit = useSelector(state => state.transit?.data || {
    nextArrival: '12 min',
    status: 'On Time',
    delays: 0,
    route: 'Route 44',
    platform: 'A'
  });

  const user = useSelector(state => state.user?.data || {
    name: 'Alex',
    homeLocation: 'Downtown',
    workLocation: 'Tech District'
  });

  const openSheet = (sheetType) => {
    setActiveSheet(sheetType);
    setSheetHeight('partial');
  };

  const closeSheet = () => {
    setActiveSheet(null);
  };

  const toggleSheetHeight = () => {
    setSheetHeight(prev => prev === 'partial' ? 'full' : 'partial');
  };
  return (
    <div className={`layout5-container ${activeSheet ? 'sheet-active' : ''} ${activeSheet ? `sheet-${sheetHeight}` : ''}`}>
      <BackButton variant="default" />
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="time">9:42</span>
        </div>
        <div className="status-right">
          <span className="battery">85%</span>
          <span className="signal">•••</span>
        </div>
      </div>

      {/* Main Map/Content Area */}
      <div className="main-content">        <div className="map-placeholder">
          <MapContainer setEta={setEta} />
          <div className="map-overlay">
            <h1>Your Commute</h1>
            <p>Tap cards below for details</p>
            {eta && (
              <div className="eta-display">
                <span className="eta-time">{eta}</span>
                <span className="eta-label">min ETA</span>
              </div>
            )}
          </div>
          
          {/* Floating status indicators */}
          <div className="floating-indicators">
            <div className="indicator weather-indicator" onClick={() => openSheet('weather')}>
              <span className="indicator-icon">🌤️</span>
              <span className="indicator-value">{weather.temperature}°</span>
            </div>
            <div className="indicator traffic-indicator" onClick={() => openSheet('traffic')}>
              <span className="indicator-icon">🚗</span>
              <span className="indicator-value">{traffic.travelTime}</span>
            </div>
            <div className="indicator transit-indicator" onClick={() => openSheet('transit')}>
              <span className="indicator-icon">🚌</span>
              <span className="indicator-value">{transit.nextArrival}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="quick-cards">
        <div className="card-row">
          <div className="quick-card" onClick={() => openSheet('weather')}>
            <div className="card-icon">🌤️</div>
            <div className="card-info">
              <span className="card-title">Weather</span>
              <span className="card-value">{weather.temperature}° {weather.condition}</span>
            </div>
            <div className="card-arrow">›</div>
          </div>
          
          <div className="quick-card" onClick={() => openSheet('traffic')}>
            <div className="card-icon">🚗</div>
            <div className="card-info">
              <span className="card-title">Traffic</span>
              <span className="card-value">{traffic.travelTime}</span>
            </div>
            <div className="card-arrow">›</div>
          </div>
        </div>
        
        <div className="card-row">
          <div className="quick-card" onClick={() => openSheet('transit')}>
            <div className="card-icon">🚌</div>
            <div className="card-info">
              <span className="card-title">Transit</span>
              <span className="card-value">{transit.nextArrival}</span>
            </div>
            <div className="card-arrow">›</div>
          </div>
          
          <div className="quick-card" onClick={() => openSheet('route')}>
            <div className="card-icon">🗺️</div>
            <div className="card-info">
              <span className="card-title">Route</span>
              <span className="card-value">Optimize</span>
            </div>
            <div className="card-arrow">›</div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Overlay */}
      {activeSheet && (
        <div className="sheet-overlay" onClick={closeSheet}>
          <div 
            className={`bottom-sheet ${sheetHeight}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" onClick={toggleSheetHeight}>
              <div className="handle-bar"></div>
            </div>
            
            <div className="sheet-content">
              {activeSheet === 'weather' && (
                <div className="sheet-section">
                  <h2>Weather Details</h2>
                  <div className="weather-details">
                    <div className="weather-main">
                      <div className="temp-display">
                        <span className="temp-large">{weather.temperature}°</span>
                        <span className="condition">{weather.condition}</span>
                      </div>
                      <div className="weather-icon-large">🌤️</div>
                    </div>
                    
                    <div className="weather-stats">
                      <div className="stat-row">
                        <div className="stat-item">
                          <span className="stat-label">Humidity</span>
                          <span className="stat-value">{weather.humidity}%</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Wind Speed</span>
                          <span className="stat-value">{weather.windSpeed} km/h</span>
                        </div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-item">
                          <span className="stat-label">UV Index</span>
                          <span className="stat-value">{weather.uvIndex}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Visibility</span>
                          <span className="stat-value">Good</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSheet === 'traffic' && (
                <div className="sheet-section">
                  <h2>Traffic Information</h2>
                  <div className="traffic-details">
                    <div className="traffic-main">
                      <div className="travel-time">
                        <span className="time-large">{traffic.travelTime}</span>
                        <span className="condition">{traffic.currentCondition}</span>
                      </div>
                    </div>
                    
                    <div className="traffic-stats">
                      <div className="stat-row">
                        <div className="stat-item">
                          <span className="stat-label">Average Speed</span>
                          <span className="stat-value">{traffic.averageSpeed} km/h</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Congestion</span>
                          <span className="stat-value">{traffic.congestionLevel}</span>
                        </div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-item">
                          <span className="stat-label">Incidents</span>
                          <span className="stat-value">{traffic.incidents}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Alternative</span>
                          <span className="stat-value">+8 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSheet === 'transit' && (
                <div className="sheet-section">
                  <h2>Transit Details</h2>
                  <div className="transit-details">
                    <div className="transit-main">
                      <div className="arrival-time">
                        <span className="time-large">{transit.nextArrival}</span>
                        <span className="route-info">{transit.route} - Platform {transit.platform}</span>
                      </div>
                    </div>
                    
                    <div className="transit-stats">
                      <div className="stat-row">
                        <div className="stat-item">
                          <span className="stat-label">Status</span>
                          <span className="stat-value">{transit.status}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Delays</span>
                          <span className="stat-value">{transit.delays}</span>
                        </div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-item">
                          <span className="stat-label">Next After</span>
                          <span className="stat-value">25 min</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Capacity</span>
                          <span className="stat-value">Medium</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSheet === 'route' && (
                <div className="sheet-section">
                  <h2>Route Planning</h2>
                  <div className="route-details">
                    <div className="route-endpoints">
                      <div className="endpoint-item">
                        <div className="endpoint-icon">🏠</div>
                        <div className="endpoint-info">
                          <span className="endpoint-label">From</span>
                          <span className="endpoint-name">{user.homeLocation}</span>
                        </div>
                      </div>
                      
                      <div className="route-swap">
                        <button className="swap-button">⇅</button>
                      </div>
                      
                      <div className="endpoint-item">
                        <div className="endpoint-icon">🏢</div>
                        <div className="endpoint-info">
                          <span className="endpoint-label">To</span>
                          <span className="endpoint-name">{user.workLocation}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="route-options">
                      <button className="route-option active">
                        <span className="option-icon">🚗</span>
                        <span className="option-name">Drive</span>
                        <span className="option-time">25 min</span>
                      </button>
                      <button className="route-option">
                        <span className="option-icon">🚌</span>
                        <span className="option-name">Transit</span>
                        <span className="option-time">32 min</span>
                      </button>
                      <button className="route-option">
                        <span className="option-icon">🚶</span>
                        <span className="option-name">Walk</span>
                        <span className="option-time">1h 15m</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-item active">
          <div className="nav-icon">🏠</div>
          <span>Home</span>
        </div>
        <div className="nav-item">
          <div className="nav-icon">🗺️</div>
          <span>Map</span>
        </div>
        <div className="nav-item">
          <div className="nav-icon">📊</div>
          <span>Stats</span>
        </div>
        <div className="nav-item">
          <div className="nav-icon">👤</div>
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
};

export default Layout5_BottomSheet;
