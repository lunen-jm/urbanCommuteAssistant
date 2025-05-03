import React from 'react';

const MapControls: React.FC = () => {
    const handleZoomIn = () => {
        // Logic for zooming in on the map
        console.log('Zooming in');
        // In the future, this will dispatch a Redux action to update map zoom
    };

    const handleZoomOut = () => {
        // Logic for zooming out on the map
        console.log('Zooming out');
        // In the future, this will dispatch a Redux action to update map zoom
    };

    const handleResetView = () => {
        // Logic for resetting the map view to the default
        console.log('Resetting view');
        // In the future, this will dispatch a Redux action to reset map view
    };

    const handleFindMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Current location:', position.coords);
                    // In the future, this will dispatch a Redux action to center the map
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    return (
        <div className="map-controls">
            <button onClick={handleZoomIn} title="Zoom In" className="map-control-btn">
                <span>+</span>
            </button>
            <button onClick={handleZoomOut} title="Zoom Out" className="map-control-btn">
                <span>-</span>
            </button>
            <button onClick={handleResetView} title="Reset View" className="map-control-btn">
                <span>↻</span>
            </button>
            <button onClick={handleFindMe} title="Find My Location" className="map-control-btn">
                <span>📍</span>
            </button>
        </div>
    );
};

export default MapControls;