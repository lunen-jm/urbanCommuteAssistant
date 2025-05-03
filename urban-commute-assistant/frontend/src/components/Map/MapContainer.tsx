import React from 'react';
import Map from './Map';
import MapControls from './MapControls';
import './Map.css';

// MapContainer component to organize all map-related UI elements
const MapContainer: React.FC = () => {
  return (
    <div className="map-container">
      <Map />
      <MapControls />
      <div className="map-overlay-controls">
        <MapLayers />
        <MapLegend />
      </div>
    </div>
  );
};

// MapLayers component for toggling different data layers on the map
const MapLayers: React.FC = () => {
  const [activeLayers, setActiveLayers] = React.useState({
    traffic: true,
    weather: true,
    transit: true
  });

  const handleToggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div className="map-layers">
      <h3>Map Layers</h3>
      <div className="layer-toggles">
        <label>
          <input 
            type="checkbox" 
            checked={activeLayers.traffic} 
            onChange={() => handleToggleLayer('traffic')} 
          />
          Traffic
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={activeLayers.weather} 
            onChange={() => handleToggleLayer('weather')} 
          />
          Weather
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={activeLayers.transit} 
            onChange={() => handleToggleLayer('transit')} 
          />
          Transit
        </label>
      </div>
    </div>
  );
};

// MapLegend component to display map color coding and symbols
const MapLegend: React.FC = () => {
  return (
    <div className="map-legend">
      <h3>Legend</h3>
      <div className="legend-items">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff4d4d' }}></span>
          <span>Heavy Traffic</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ffaa33' }}></span>
          <span>Moderate Traffic</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#33aa33' }}></span>
          <span>Light Traffic</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🚌</span>
          <span>Transit Stop</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">⚠️</span>
          <span>Incident</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">🌧️</span>
          <span>Weather Alert</span>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;