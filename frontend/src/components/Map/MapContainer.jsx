import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import L from 'leaflet';
import './MapContainer.css';
import { getRouteTomTom } from '../../services/routeService';
import { useLocation } from '../../hooks/useLocation';
import { useLocationData } from '../../hooks/useLocationData';
import { debounce } from '../../utils/debounce'; // Import debounce
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

const ROUTE_CACHE_EXPIRY_DURATION = 5 * 60 * 1000; // 5 minutes

const generateRouteCacheKey = (from, to, travelMode) => {
  if (!from || !to || !travelMode) return null;
  // Ensure consistent order and stringification for object keys if 'from' or 'to' were objects
  const fromStr = Array.isArray(from) ? from.join(',') : String(from);
  const toStr = Array.isArray(to) ? to.join(',') : String(to);
  return `routeCache_${fromStr}_${toStr}_${travelMode}`;
};

// Component to handle browser geolocation (always active, always shows current location)
// This component might be simplified or removed if useLocation provides all necessary info directly to MapContainerComponent
const CurrentLocationMarker = () => {
  const map = useMap();
  const { currentLocation, locationStatus, locationError } = useLocation(); // Use the hook here

  useEffect(() => {
    console.log('CurrentLocationMarker: useLocation status:', locationStatus, 'currentLocation:', currentLocation);
    if (locationStatus === 'success' && currentLocation) {
      const newPosition = [currentLocation.lat, currentLocation.lng];
      map.flyTo(newPosition, map.getZoom());
    } else if (locationStatus === 'error') {
      console.error('CurrentLocationMarker: Location error from useLocation:', locationError);
    }
    // No need to explicitly call navigator.geolocation here, useLocation handles it.
  }, [currentLocation, locationStatus, locationError, map]);

  if (locationStatus === 'success' && currentLocation) {
    return (
      <Marker position={[currentLocation.lat, currentLocation.lng]} icon={createCustomIcon('green')}>
        <Popup>Your current location</Popup>
      </Marker>
    );
  }
  return null; // Don't render marker if no location or error
};

const MapContainerComponent = ({ setEta, selectedTravelMode }) => {
  const dispatch = useDispatch();
  const { selectedLocation: selectedLocationId, savedLocations } = useSelector((state) => state.user);
  const traffic = useSelector((state) => state.traffic);
  const transit = useSelector((state) => state.transit);

  const { currentLocation: liveCurrentLocation, locationStatus: liveLocationStatus, locationError: liveLocationError } = useLocation();
  useLocationData();

  const [routeCoords, setRouteCoords] = useState(null);
  const [routeError, setRouteError] = useState(null);

  const selectedDest = savedLocations.find(loc => loc.id === selectedLocationId);
  const destPos = selectedDest && typeof selectedDest.lat === 'number' && typeof selectedDest.lng === 'number'
                  ? [selectedDest.lat, selectedDest.lng]
                  : null;

  // Ref to hold the latest setEta function, to be used by the debounced function
  const setEtaRef = useRef(setEta);
  useEffect(() => {
    setEtaRef.current = setEta;
  }, [setEta]);

  // Ref to hold the latest selectedTravelMode
  const selectedTravelModeRef = useRef(selectedTravelMode);
  useEffect(() => {
    selectedTravelModeRef.current = selectedTravelMode;
  }, [selectedTravelMode]);

  // The actual function that fetches data and updates state
  const executeRouteSearch = useCallback(async (from, to, travelModeForApi, componentCancelled) => {
    console.log('[MapContainer] EXECUTE_ROUTE_SEARCH: Attempting to fetch route.', { from, to, travelModeForApi, componentCancelled });
    if (componentCancelled) {
      console.log('[MapContainer] EXECUTE_ROUTE_SEARCH: Cancelled before fetch.');
      return;
    }
    const cacheKey = generateRouteCacheKey(from, to, travelModeForApi);

    try {
      const { coords, etaSeconds } = await getRouteTomTom(from, to, travelModeForApi);
      if (!componentCancelled) {
        setRouteCoords(coords);
        const currentSetEta = setEtaRef.current;
        if (currentSetEta) {
          let etaStr = '';
          if (etaSeconds != null) {
            const min = Math.round(etaSeconds / 60);
            etaStr = min < 1 ? '<1 min' : `${min} min`;
          } else {
            etaStr = 'N/A';
          }
          console.log('[MapContainer] EXECUTE_ROUTE_SEARCH: Successfully fetched route. Calling setEta with:', etaStr);
          currentSetEta(etaStr);
          // Store in cache
          if (cacheKey) {
            const cacheData = { coords, etaSeconds, timestamp: Date.now() };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log('[MapContainer] EXECUTE_ROUTE_SEARCH: Route data cached.', cacheKey);
          }
        }
      } else {
        console.log('[MapContainer] EXECUTE_ROUTE_SEARCH: Cancelled after fetch, before state update.');
      }
    } catch (err) {
      console.error('[MapContainer] EXECUTE_ROUTE_SEARCH: Error fetching route:', err);
      if (!componentCancelled) {
        setRouteError('Could not fetch route. ' + (err.message || ''));
        // Optionally, clear cache for this key if fetch fails
        if (cacheKey) localStorage.removeItem(cacheKey);
      }
    }
  }, []); // No dependencies needed here as it uses refs or passed-in values

  // Create a stable debounced version of executeRouteSearch using useRef
  const debouncedExecuteRouteSearchRef = useRef(
    debounce((...args) => {
      // The last argument to executeRouteSearch is 'componentCancelled', which is managed by the useEffect cleanup
      // We need to ensure the debounced function receives it correctly.
      // However, the 'cancelled' flag is specific to the useEffect instance.
      // The debounced function will execute later, potentially after the component unmounts or dependencies change.
      // So, the 'cancelled' flag passed here might be stale.
      // The executeRouteSearch itself handles the 'componentCancelled' flag passed by the effect.
      console.log('[MapContainer] DEBOUNCED_CALL_SCHEDULED: Debounced function is about to call executeRouteSearch.');
      executeRouteSearch(...args);
    }, 1200) // 1200ms debounce delay
  );


  useEffect(() => {
    console.log('[MapContainer] RENDER/EFFECT: MapContainerComponent rendered or dependencies changed.');
    let cancelled = false;
    console.log('[MapContainer] EFFECT[routeCalc]: liveLocationStatus:', liveLocationStatus, 'liveCurrentLocation:', liveCurrentLocation, 'destPos:', destPos, 'selectedTravelMode:', selectedTravelModeRef.current);

    const currentSetEta = setEtaRef.current;

    // Clear previous route data immediately when inputs change, unless we load from cache
    // setRouteCoords(null); // Moved later, after cache check
    // setRouteError(null);

    if (liveLocationStatus === 'success' && liveCurrentLocation && destPos) {
      let travelModeForApi;
      const currentSelectedTravelMode = selectedTravelModeRef.current;
      switch (currentSelectedTravelMode) {
        case 'drive': travelModeForApi = 'car'; break;
        case 'bike': travelModeForApi = 'bicycle'; break;
        case 'walk': travelModeForApi = 'pedestrian'; break;
        case 'transit':
          console.warn("[MapContainer] EFFECT[routeCalc]: 'transit' mode selected. TomTom may not provide accurate transit routes. Defaulting to 'car' for polyline.");
          travelModeForApi = 'car';
          break;
        case 'rideshare': travelModeForApi = 'car'; break;
        default: travelModeForApi = 'car';
      }

      const cacheKey = generateRouteCacheKey([liveCurrentLocation.lat, liveCurrentLocation.lng], destPos, travelModeForApi);
      if (cacheKey) {
        const cachedRouteItem = localStorage.getItem(cacheKey);
        if (cachedRouteItem) {
          try {
            const parsedCache = JSON.parse(cachedRouteItem);
            if (parsedCache && parsedCache.coords && (Date.now() - parsedCache.timestamp < ROUTE_CACHE_EXPIRY_DURATION)) {
              console.log('[MapContainer] EFFECT[routeCalc]: Using cached route data.', cacheKey);
              setRouteCoords(parsedCache.coords);
              if (currentSetEta) {
                let etaStr = 'N/A';
                if (parsedCache.etaSeconds != null) {
                  const min = Math.round(parsedCache.etaSeconds / 60);
                  etaStr = min < 1 ? '<1 min' : `${min} min`;
                }
                currentSetEta(etaStr);
              }
              setRouteError(null); // Clear any previous error
              return; // Exit early as we used cached data
            } else {
              console.log('[MapContainer] EFFECT[routeCalc]: Cached route data found but stale or invalid. Removing.', cacheKey);
              localStorage.removeItem(cacheKey); // Remove stale cache
            }
          } catch (e) {
            console.error('[MapContainer] EFFECT[routeCalc]: Error parsing cached route data. Removing.', e);
            localStorage.removeItem(cacheKey); // Remove corrupted cache
          }
        }
      }
      
      // If cache not used, clear previous route and error, then fetch
      setRouteCoords(null);
      setRouteError(null);
      if (currentSetEta) {
        // currentSetEta('N/A'); // Optionally clear ETA, or let debounced call update it
      }

      console.log(`
        [MapContainer] EFFECT[routeCalc]: Conditions met. Scheduling debounced route search from ${liveCurrentLocation.lat},${liveCurrentLocation.lng} to ${destPos} with mode: ${currentSelectedTravelMode} (API mode: ${travelModeForApi})
      `);
      debouncedExecuteRouteSearchRef.current([liveCurrentLocation.lat, liveCurrentLocation.lng], destPos, travelModeForApi, cancelled);

    } else {
      console.log('[MapContainer] EFFECT[routeCalc]: Conditions NOT met for route search. Clearing route and ETA.');
      setRouteCoords(null);
      setRouteError(null);
      if (currentSetEta) currentSetEta('N/A');
    }

    return () => {
      console.log('[MapContainer] EFFECT_CLEANUP[routeCalc]: Cleaning up route effect.');
      cancelled = true;
      // It's important to note that cancelling the debounced function itself (i.e., clearTimeout)
      // should ideally happen within the debounce utility if it supports cancellation,
      // or by managing the timer ID here if the debounce function exposes it.
      // For this simple debounce, 'cancelled = true' helps prevent state updates if the component unmounts
      // or dependencies change before the debounced function executes.
    };
  }, [liveCurrentLocation, liveLocationStatus, destPos, executeRouteSearch]); // executeRouteSearch is stable due to useCallback with empty deps

  // Default to Bellevue if no user location initially, but liveCurrentLocation will be updated by useLocation.
  const defaultPosition = [47.6101, -122.2015];
  // Center should prioritize liveCurrentLocation once available.
  const center = liveCurrentLocation ? [liveCurrentLocation.lat, liveCurrentLocation.lng] : defaultPosition;

  // Show loading if location is still loading
  if (liveLocationStatus === 'loading') {
    return <div className="map-loading-overlay">Initializing map and fetching your location...</div>;
  }

  // Show error if location fetching failed
  if (liveLocationStatus === 'error') {
    return (
      <div className="map-error-overlay">
        <p>Error fetching your location: {liveLocationError?.message || 'Unknown error'}</p>
        <p>Map functionality will be limited. Please check location permissions.</p>
        {/* Optionally, render a map centered on default with no current location marker */}
        <MapContainer center={defaultPosition} zoom={13} className="map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {destPos && (
            <Marker position={destPos} icon={createCustomIcon('orange')}>
              <Popup>Your selected destination</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer center={center} zoom={13} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* CurrentLocationMarker now uses useLocation internally. No onLocationUpdate prop needed here. */}
        <CurrentLocationMarker /> 

        {/* Only render markers and route if location is successfully obtained */}
        {liveLocationStatus === 'success' && (
          <>
            {destPos && (
              <Marker position={destPos} icon={createCustomIcon('orange')}>
                <Popup>Your selected destination</Popup>
              </Marker>
            )}
            {routeCoords && <Polyline positions={routeCoords} color="#1976d2" weight={5} opacity={0.7} />}
            {/* Traffic incident markers */}
            {traffic?.data?.incidents?.map((incident, index) => 
              incident.location && incident.location.lat && incident.location.lon ? (
                <Marker 
                  key={incident.id || `incident-${index}`}
                  position={[parseFloat(incident.location.lat), parseFloat(incident.location.lon)]}
                  icon={createCustomIcon('red')}
                >
                  <Popup>
                    <div>
                      <h4>{incident.type || 'Traffic Incident'}</h4>
                      <p>{incident.description || 'Traffic disruption'}</p>
                      {incident.delay && <p>Delay: {Math.round(incident.delay / 60)} minutes</p>}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
            {/* Transit stop markers */}
            {transit?.data?.stops?.map((stop) => 
              stop.location && stop.location.lat && stop.location.lon ? (
                <Marker 
                  key={stop.id}
                  position={[parseFloat(stop.location.lat), parseFloat(stop.location.lon)]}
                  icon={createCustomIcon('blue')}
                >
                  <Popup>
                    <div>
                      <h4>{stop.name || 'Transit Stop'}</h4>
                      <p>Routes: {stop.routes?.join(', ') || 'No route info'}</p>
                      {transit?.data?.arrivals?.filter(arrival => arrival.stop_id === stop.id).length > 0 && (
                        <div className="popup-arrivals">
                          <p><strong>Next arrivals:</strong></p>
                          <ul style={{padding: '0 0 0 15px', margin: '5px 0'}}>
                            {transit?.data?.arrivals
                              ?.filter(arrival => arrival.stop_id === stop.id)
                              .map((arrival, idx) => (
                                <li key={idx}>
                                  {arrival.route} - {arrival.arrival_time ? new Date(arrival.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                  {arrival.status === 'DELAYED' ? ' (Delayed)' : ''}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}
          </>
        )}
      </MapContainer>
      {/* Removed isMapReady based loading, now handled by liveLocationStatus */}
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
