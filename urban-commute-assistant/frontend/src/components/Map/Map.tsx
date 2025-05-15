import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useLocation from '../../hooks/useLocation';
import { useTransitData } from '../../hooks/useTransitData';
import './Map.css';

// Define types
interface MapMarker {
    position: L.LatLngExpression;
    message: string;
}

interface LocationCoordinates {
    latitude: number;
    longitude: number;
}

const Map: React.FC = () => {
    const initialCenter: [number, number] = [47.6062, -122.3321]; // Seattle
    const initialZoom = 12;
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
    
    const { userLocation, error } = useLocation();
    const { transitData } = useTransitData(userLocation as LocationCoordinates | null);
    const [markers, setMarkers] = useState<MapMarker[]>([]);

    useEffect(() => {
        if (transitData) {
            // Check if transitData is an array and process transit stops
            const newMarkers: MapMarker[] = [];
            
            if (Array.isArray(transitData)) {
                // Handle array format (each item represents a transit point)
                transitData.forEach((data: any) => {
                    if (data.latitude && data.longitude) {
                        newMarkers.push({
                            position: [data.latitude, data.longitude] as L.LatLngExpression,
                            message: data.name || 'Transit Stop',
                        });
                    }
                });
            } else if (transitData.stops && Array.isArray(transitData.stops)) {
                // Handle object format with stops array
                transitData.stops.forEach((stop: any) => {
                    if (stop.lat && stop.lon) {
                        newMarkers.push({
                            position: [stop.lat, stop.lon] as L.LatLngExpression,
                            message: stop.name || 'Transit Stop',
                        });
                    }
                });
            }
            
            setMarkers(newMarkers);
        }
    }, [transitData]);

    useEffect(() => {
        if (userLocation) {
            setMapCenter([userLocation.latitude, userLocation.longitude]);
        }
    }, [userLocation]);

    return (
        <div className="map-container">
            <MapContainer 
                center={mapCenter} 
                zoom={initialZoom} 
                style={{ height: '100%', width: '100%' }}
                key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render on center change
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {userLocation && (
                    <Marker position={[userLocation.latitude, userLocation.longitude]}>
                        <Popup>You are here</Popup>
                    </Marker>
                )}
                
                {markers.map((marker, index) => (
                    <Marker key={index} position={marker.position}>
                        <Popup>{marker.message}</Popup>
                    </Marker>
                ))}
            </MapContainer>
            
            {error && (
                <div className="map-error">
                    Error getting location: {error}
                </div>
            )}        </div>
    );
};

export default Map;
