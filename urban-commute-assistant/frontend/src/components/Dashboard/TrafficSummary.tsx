import React from 'react';
import { TrafficIncident, FlowSegment } from '../../types/index';
import { useAppSelector } from '../../store';
import DataCard from './DataCard';

// Helper function to safely access nested objects
const safeAccess = <T extends unknown>(obj: any, path: string, defaultVal: T): T => {
    try {
        const result = path.split('.').reduce((o, key) => o?.[key], obj);
        return (result === undefined || result === null) ? defaultVal : result as T;
    } catch (e) {
        return defaultVal;
    }
};

const TrafficSummary: React.FC = () => {
    const trafficData = useAppSelector((state) => state.traffic.data);
    const loading = useAppSelector((state) => state.traffic.loading);
    const error = useAppSelector((state) => state.traffic.error);

    // Add validation check for traffic data
    const isValidTrafficData = trafficData && 
        Array.isArray(trafficData.incidents) && 
        Array.isArray(trafficData.flowSegments);

    if (loading) return <div className="loader-container"><div className="loader"></div> Loading traffic data...</div>;
    if (error) return <div className="error-message">Error loading traffic data: {error}</div>;
    if (!trafficData) return <div className="no-data-message">No traffic data available</div>;
    if (!isValidTrafficData) return <div className="error-message">Invalid traffic data structure</div>;

    // Function to get color based on congestion level
    const getCongestionColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'high':
                return '#ff4d4d';
            case 'moderate':
                return '#ffaa33';
            case 'low':
                return '#33aa33';
            default:
                return '#4b8bf4';
        }
    };

    // Calculate congestion level based on flow segments
    const congestionLevel = getCongestionLevelFromFlowSegments(trafficData.flowSegments);

    return (
        <div className="traffic-summary">
            <h3>Traffic Conditions</h3>
            
            <DataCard 
                title="Congestion Level" 
                value={congestionLevel} 
                description="Current traffic density in your area"
                icon={
                    <div 
                        className="congestion-indicator" 
                        style={{ backgroundColor: getCongestionColor(congestionLevel) }}
                    />
                }
            />
            
            <div className="incidents-section">
                <h4>Nearby Incidents ({trafficData.incidents.length})</h4>
                
                {trafficData.incidents.length > 0 ? (
                    <ul className="incidents-list">
                        {trafficData.incidents.map((incident: TrafficIncident) => (
                            <li key={incident.id} className={`incident-item severity-${getSeverityLabel(incident.severity)}`}>
                                <div className="incident-header">
                                    <span className="incident-type">{incident.type}</span>
                                    <span className="incident-severity">{getSeverityLabel(incident.severity)}</span>
                                </div>                                <div className="incident-description">{incident.description}</div>
                                <div className="incident-location">
                                    {incident.location || 
                                     (typeof incident.coordinates === 'string' ? 
                                        incident.coordinates : 
                                        formatCoordinates(incident.coordinates)
                                     )}
                                </div>
                                <div className="incident-time">
                                    {formatTime(incident.startTime)}
                                    {incident.endTime && ` - ${formatTime(incident.endTime)}`}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No traffic incidents reported nearby.</p>
                )}
            </div>
        </div>
    );
};

// Helper function to format time
const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatCoordinates = (coordinates: {lat: number, lng: number}): string => {
    if (!coordinates) return 'Unknown location';
    
    // Get latitude value safely
    const lat = typeof coordinates.lat === 'number' ? 
        coordinates.lat.toFixed(4) : 'Unknown';
    
    // Get longitude value safely
    const lng = typeof coordinates.lng === 'number' ? 
        coordinates.lng.toFixed(4) : 'Unknown';
    
    return `${lat}, ${lng}`;
};

// Helper function to get severity label from severity string
const getSeverityLabel = (severity: 'Low' | 'Medium' | 'High'): string => {
    // Handle string severity
    switch (severity) {
        case 'Low': return 'low';
        case 'Medium': return 'moderate';
        case 'High': return 'high';
        default: return 'unknown';
    }
};

// Helper function to derive congestion level from flow segments
const getCongestionLevelFromFlowSegments = (flowSegments: FlowSegment[]): string => {
    if (!flowSegments || !flowSegments.length) return 'Unknown';
    
    const avgRatio = flowSegments.reduce((sum, segment) => {
        const ratio = segment.currentSpeed / segment.freeFlowSpeed;
        return sum + ratio;
    }, 0) / flowSegments.length;
    
    if (avgRatio < 0.4) return 'High';
    if (avgRatio < 0.7) return 'Moderate';
    return 'Low';
};

export default TrafficSummary;
