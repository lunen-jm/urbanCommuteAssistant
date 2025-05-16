import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserLocation } from '../../store/userSlice';
import L from 'leaflet';
import './MapContainer.css';

// Fix Leaflet marker icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for Leaflet default icon
// This needs to be done before any rendering occurs
delete L.Icon.Default.prototype._getIconUrl;
  
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Component to handle location update
const LocationMarker = () => {
  const dispatch = useDispatch();
  const map = useMap();
  const [position, setPosition] = useState(null);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);
    dispatch(updateUserLocation({ lat, lng }));
  };

  // Add click event listener to map
  React.useEffect(() => {
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You clicked here</Popup>
    </Marker>
  );
};

const MapContainerComponent = () => {
  const user = useSelector((state) => state.user);
  const traffic = useSelector((state) => state.traffic);
  const transit = useSelector((state) => state.transit);
  
  // Default to Seattle if no user location
  const defaultPosition = [47.6062, -122.3321];
  const center = user.location 
    ? [user.location.lat, user.location.lng] 
    : defaultPosition;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={13} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={center}>
          <Popup>
            Your location
          </Popup>
        </Marker>
        
        {/* Traffic incident markers */}
        {traffic?.data?.incidents?.map((incident, index) => (
          incident.location && (
            <Marker 
              key={incident.id || `incident-${index}`}
              position={[incident.location.lat, incident.location.lon]}
              icon={createCustomIcon('red')}
            >
              <Popup>
                <div>
                  <h4>{incident.type}</h4>
                  <p>{incident.description}</p>
                  {incident.delay && <p>Delay: {Math.round(incident.delay / 60)} minutes</p>}
                </div>
              </Popup>
            </Marker>
          )
        ))}
        
        {/* Transit stop markers */}
        {transit?.data?.stops?.map((stop) => (
          <Marker 
            key={stop.id}
            position={[stop.location.lat, stop.location.lon]}
            icon={createCustomIcon('blue')}
          >
            <Popup>
              <div>
                <h4>{stop.name}</h4>
                <p>Routes: {stop.routes.join(', ')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Click to set location */}
        <LocationMarker />
      </MapContainer>
      
      <div className="map-instructions">
        Click on the map to set your location and get commute information for that area.
      </div>
    </div>
  );
};

// Helper to create custom markers (simplified version without actual custom icons)
const createCustomIcon = (color) => {
  return L.divIcon({
    className: `custom-icon ${color}`,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });
};

export default MapContainerComponent;
