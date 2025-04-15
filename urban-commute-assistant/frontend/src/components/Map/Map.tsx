import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTransitData } from '../../hooks/useTransitData';
import useLocation from '../../hooks/useLocation';
import L from 'leaflet'; 

// Ensure Icon assets are properly loaded for leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Define a type for the markers
interface MapMarker {
    position: L.LatLngExpression;
    message: string;
}

interface LocationCoordinates {
    latitude: number;
    longitude: number;
}

// Type for extended MapContainer props
interface ExtendedMapContainerProps extends MapContainerProps {
    center: L.LatLngExpression;
}

// Default center coordinates if user location is null
const DEFAULT_CENTER: L.LatLngExpression = [51.505, -0.09]; // Example: London

const Map: React.FC = () => {
    const { userLocation } = useLocation();
    const { transitData } = useTransitData(userLocation as LocationCoordinates | null);
    const [markers, setMarkers] = useState<MapMarker[]>([]);

    useEffect(() => {
        if (transitData) {
            const newMarkers = transitData.map((data: any) => ({
                position: [data.latitude, data.longitude] as L.LatLngExpression,
                message: data.message,
            }));
            setMarkers(newMarkers);
        }
    }, [transitData]);

    // Determine map center, use default if userLocation is null
    const mapCenter = userLocation
        ? [userLocation.latitude, userLocation.longitude] as L.LatLngExpression
        : DEFAULT_CENTER;

    return (
        <MapContainer 
            key={mapCenter.toString()} 
            center={mapCenter} 
            zoom={13} 
            style={{ height: '100vh', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {markers.map((marker, index) => (
                <Marker key={index} position={marker.position}>
                    <Popup>{marker.message}</Popup>
                </Marker>
            ))}
            {userLocation && (
                <Marker position={[userLocation.latitude, userLocation.longitude]}>
                    <Popup>Your Location</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default Map;