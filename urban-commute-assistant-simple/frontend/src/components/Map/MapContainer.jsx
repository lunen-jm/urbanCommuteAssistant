import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import L from 'leaflet';
import './MapContainer.css';
import { getRouteTomTom } from '../../services/routeService';

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

// Component to handle browser geolocation (always active, always shows current location)
const CurrentLocationMarker = ({ onLocation }) => {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          map.flyTo([latitude, longitude], 13);
          if (onLocation) onLocation([latitude, longitude]);
        },
        (error) => {
          setPosition(null);
          if (onLocation) onLocation(null);
        }
      );
    }
  }, [map, onLocation]);

  if (!position) return null;
  return (
    <Marker position={position} icon={createCustomIcon('green')}>
      <Popup>Your current location</Popup>
    </Marker>
  );
};

const MapContainerComponent = ({ setEta }) => {
  const user = useSelector((state) => state.user);
  const traffic = useSelector((state) => state.traffic);
  const transit = useSelector((state) => state.transit);
  const [currentPos, setCurrentPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeError, setRouteError] = useState(null);

  // Find selected destination
  const selectedDest = user.savedLocations.find(loc => loc.id === user.selectedLocation);
  const destPos = selectedDest ? [selectedDest.lat, selectedDest.lng] : null;

  // Fetch route when both positions are available, but only once per change
  useEffect(() => {
    let cancelled = false;
    setRouteCoords(null);
    setRouteError(null);
    if (currentPos && destPos) {
      getRouteTomTom(currentPos, destPos)
        .then(({ coords, etaSeconds }) => {
          if (!cancelled) {
            setRouteCoords(coords);
            if (setEta) {
              let etaStr = '';
              if (etaSeconds != null) {
                const min = Math.round(etaSeconds / 60);
                etaStr = min < 1 ? '<1 min' : `${min} min`;
              } else {
                etaStr = 'N/A';
              }
              localStorage.setItem('route_eta', etaStr);
              setEta(etaStr);
            }
          }
        })
        .catch(err => {
          if (!cancelled) setRouteError('Could not fetch route.');
        });
    }
    return () => { cancelled = true; };
  }, [currentPos?.[0], currentPos?.[1], destPos?.[0], destPos?.[1]]);

  // Default to Seattle if no user location
  const defaultPosition = [47.6062, -122.3321];
  const center = currentPos || defaultPosition;

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={13} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Current location marker */}
        <CurrentLocationMarker onLocation={setCurrentPos} />
        {/* Destination marker */}
        {destPos && (
          <Marker position={destPos} icon={createCustomIcon('orange')}>
            <Popup>Your selected destination</Popup>
          </Marker>
        )}
        {/* Real route polyline */}
        {routeCoords && <Polyline positions={routeCoords} color="#1976d2" weight={5} opacity={0.7} />}
        {/* Error message if route fails */}
        {routeError && <div className="route-error">{routeError}</div>}
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
      </MapContainer>
      <div className="map-instructions">
        Select a destination above to see the recommended route from your current location.
      </div>
      {routeError && <div className="route-error">{routeError}</div>}
    </div>
  );
};

// Helper to create custom markers (add orange for saved, green for current)
const createCustomIcon = (color) => {
  let bgColor = '#ff9800'; // orange default
  if (color === 'green') bgColor = '#4caf50';
  if (color === 'red') bgColor = '#e74c3c';
  if (color === 'blue') bgColor = '#3498db';
  return L.divIcon({
    className: `custom-icon ${color}`,
    html: `<div style='background:${bgColor};width:20px;height:20px;border-radius:50%;border:2px solid #fff;'></div>` ,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });
};

export default MapContainerComponent;
