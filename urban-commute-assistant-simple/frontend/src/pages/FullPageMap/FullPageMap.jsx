import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import MapContainer from '../../components/Map/MapContainer';
import BackButton from '../../components/BackButton/BackButton';
import { selectSavedLocation } from '../../store/userSlice';
import './FullPageMap.css';

const FullPageMap = () => {
  const [eta, setEta] = useState(null);
  const [isRouteInfoExpanded, setIsRouteInfoExpanded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
    // Get destination and commute option from navigation state or Redux
  const destination = location.state?.destination;
  const commuteOption = location.state?.commuteOption;
  const user = useSelector(state => state.user);
  const traffic = useSelector(state => state.traffic?.data);  const transit = useSelector(state => state.transit?.data);

  // Development logging - remove in production
  // console.log('FullPageMap: destination from state:', destination);
  // console.log('FullPageMap: commuteOption from state:', commuteOption);
  // console.log('FullPageMap: selectedTravelMode being passed to MapContainer:', commuteOption?.id);

  // Reset ETA when destination or commute option from route state changes
  useEffect(() => {
    setEta(null);
  }, [destination, commuteOption]);

  // Ensure the destination is set in Redux state for MapContainer
  useEffect(() => {
    if (destination && destination.id !== user.selectedLocation) {
      dispatch(selectSavedLocation(destination.id));
    }
  }, [destination, user.selectedLocation, dispatch]);

  // Use commute option data if available, otherwise fall back to defaults
  const routeData = {
    distance: commuteOption?.distance || '12.3 mi',
    duration: eta || commuteOption?.time || '18 min',
    traffic: traffic?.currentCondition || 'Light',
    fuelCost: commuteOption?.cost || '$3.20',
    tollCost: '$0.00',
    co2: commuteOption?.co2 || '4.2 kg',
    method: commuteOption?.method || 'Drive',
    icon: commuteOption?.icon || '🚗'
  };

  const alternativeRoutes = [
    {
      id: 1,
      name: 'Fastest Route',
      time: '18 min',
      distance: '12.3 mi',
      traffic: 'Light',
      active: true
    },
    {
      id: 2,
      name: 'Avoid Highways',
      time: '24 min',
      distance: '10.8 mi',
      traffic: 'Moderate',
      active: false
    },
    {
      id: 3,
      name: 'Scenic Route',
      time: '28 min',
      distance: '14.1 mi',
      traffic: 'Light',
      active: false
    }
  ];

  const trafficIncidents = traffic?.incidents || [
    { type: 'Construction', location: 'I-5 N', impact: 'Minor' },
    { type: 'Heavy Traffic', location: 'SR-99', impact: 'Moderate' }
  ];

  const handleStartNavigation = () => {
    if (!destination) {
      alert('No destination selected');
      return;
    }
    
    setIsNavigating(true);
    
    // In a real app, this would open a navigation app or start turn-by-turn directions
    // For now, we'll simulate starting navigation
    const confirmStart = window.confirm(
      `Start navigation to ${destination.name}?\n\nEstimated time: ${eta || routeData.duration}\nDistance: ${routeData.distance}`
    );
    
    if (confirmStart) {
      // Could integrate with Google Maps, Apple Maps, or Waze here
      const encodedDestination = encodeURIComponent(`${destination.lat},${destination.lng}`);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`;
      
      // Open in new tab/window
      window.open(googleMapsUrl, '_blank');
    }
    
    setIsNavigating(false);
  };

  const handleCallDestination = () => {
    // In a real app, this might call a business associated with the destination
    alert('Calling destination feature would be implemented here');
  };

  const handleShareRoute = () => {
    if (navigator.share && destination) {      navigator.share({
        title: `Route to ${destination.name}`,
        text: `Check out this route: ${routeData.duration} (${routeData.distance})`,
        url: window.location.href
      }).catch(() => {
        // Handle share error silently in production
      });
    } else {
      // Fallback to copying to clipboard
      const routeInfo = `Route to ${destination?.name || 'destination'}: ${routeData.duration} (${routeData.distance})`;
      navigator.clipboard.writeText(routeInfo).then(() => {
        alert('Route info copied to clipboard!');
      }).catch(() => {
        alert('Unable to share route');
      });
    }
  };

  return (
    <div className="fullpage-map-container">
      {/* Header with back button and destination info */}      <div className="map-header">
        <BackButton variant="neon" to="/" text="Back to Dashboard" />
        <div className="destination-info">
          <h1>{destination?.name || 'Navigation'}</h1>
          <p>
            {destination?.address
              ? typeof destination.address === 'string'
                ? destination.address
                : (destination.address.lat !== undefined && destination.address.lon !== undefined)
                  ? `Lat: ${Number(destination.address.lat).toFixed(4)}, Lon: ${Number(destination.address.lon).toFixed(4)}`
                  : 'Address data unavailable'
              : 'Route Overview'}
          </p>
        </div>
        <div className="header-actions">
          <button className="header-btn">
            <span>🔍</span>
          </button>
          <button className="header-btn">
            <span>⚙️</span>
          </button>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="map-area">
        <MapContainer 
          setEta={setEta} 
          selectedTravelMode={commuteOption?.id} // Pass the travel mode ID
        />
        
        {/* Map Controls */}
        <div className="map-controls">
          <button className="map-control-btn">
            <span>🧭</span>
          </button>
          <button className="map-control-btn">
            <span>📍</span>
          </button>
          <button className="map-control-btn">
            <span>🔍+</span>
          </button>
          <button className="map-control-btn">
            <span>🔍-</span>
          </button>
        </div>

        {/* ETA Display */}
        <div className="eta-overlay">
          <div className="eta-main">
            <span className="eta-time">{eta || '18'}</span>
            <span className="eta-unit">min</span>
          </div>
          <div className="eta-details">
            <span className="eta-distance">{routeData.distance}</span>
            <span className="eta-traffic">• {routeData.traffic} traffic</span>
          </div>
        </div>

        {/* Quick Actions Floating */}
        <div className="floating-actions">
          <button className="floating-btn start-nav" onClick={handleStartNavigation}>
            <span className="btn-icon">▶️</span>
            <span className="btn-text">Start</span>
          </button>
          <button className="floating-btn share-route" onClick={handleShareRoute}>
            <span className="btn-icon">📤</span>
          </button>
        </div>
      </div>

      {/* Bottom Route Information Panel */}
      <div className={`route-info-panel ${isRouteInfoExpanded ? 'expanded' : ''}`}>
        <div className="panel-handle" onClick={() => setIsRouteInfoExpanded(!isRouteInfoExpanded)}>
          <div className="handle-bar"></div>
          <div className="panel-preview">
            <span className="preview-text">Route Details</span>
            <span className="expand-icon">{isRouteInfoExpanded ? '▼' : '▲'}</span>
          </div>
        </div>        <div className="panel-content">
          {/* Transport Method Header */}
          <div className="transport-method-header">
            <div className="transport-info">
              <span className="transport-icon">{routeData.icon}</span>
              <div>
                <h3>{routeData.method}</h3>
                <p>{routeData.duration} • {routeData.distance}</p>
              </div>
            </div>
            <div className="route-traffic">
              <span className={`traffic-indicator ${routeData.traffic.toLowerCase()}`}>
                {routeData.traffic} Traffic
              </span>
            </div>
          </div>

          {/* Route Options */}
          <div className="route-options">
            <h3>Alternative Routes</h3>
            <div className="route-alternatives">
              {alternativeRoutes.map(route => (
                <div key={route.id} className={`route-option ${route.active ? 'active' : ''}`}>
                  <div className="route-option-info">
                    <h4>{route.name}</h4>
                    <p>{route.time} • {route.distance}</p>
                  </div>
                  <div className="route-option-traffic">
                    <span className={`traffic-indicator ${route.traffic.toLowerCase()}`}>
                      {route.traffic}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Details */}
          <div className="route-details-grid">
            <div className="detail-card">
              <div className="detail-icon">⛽</div>
              <div className="detail-info">
                <span className="detail-value">{routeData.fuelCost}</span>
                <span className="detail-label">Fuel Cost</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">🛣️</div>
              <div className="detail-info">
                <span className="detail-value">{routeData.tollCost}</span>
                <span className="detail-label">Tolls</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">🌱</div>
              <div className="detail-info">
                <span className="detail-value">{routeData.co2}</span>
                <span className="detail-label">CO₂ Emissions</span>
              </div>
            </div>
          </div>

          {/* Traffic Incidents */}
          {trafficIncidents.length > 0 && (
            <div className="traffic-incidents">
              <h3>Traffic Incidents</h3>
              <div className="incident-list">
                {trafficIncidents.map((incident, index) => (
                  <div key={index} className="incident-item">
                    <div className="incident-icon">⚠️</div>
                    <div className="incident-info">
                      <h4>{incident.type}</h4>
                      <p>
                        {typeof incident.location === 'string'
                          ? incident.location
                          : incident.location && typeof incident.location.lat === 'number' && typeof incident.location.lon === 'number'
                            ? `Lat: ${incident.location.lat.toFixed(4)}, Lon: ${incident.location.lon.toFixed(4)}`
                            : 'Location data unavailable'}
                        {' • '}
                        {incident.impact} impact
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="navigation-controls">
            <button className="nav-control-btn primary" onClick={handleStartNavigation}>
              <span className="btn-icon">🧭</span>
              <span>Start Navigation</span>
            </button>
            <button className="nav-control-btn secondary" onClick={handleCallDestination}>
              <span className="btn-icon">📞</span>
              <span>Call Destination</span>
            </button>
            <button className="nav-control-btn secondary" onClick={handleShareRoute}>
              <span className="btn-icon">📤</span>
              <span>Share Route</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageMap;
