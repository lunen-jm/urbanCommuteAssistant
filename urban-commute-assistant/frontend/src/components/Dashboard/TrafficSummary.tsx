import React from 'react';
import { RootState, TrafficIncident } from '../../types';
import { useAppSelector } from '../../store';
import DataCard from './DataCard';

const TrafficSummary: React.FC = () => {
    const trafficData = useAppSelector((state) => state.traffic.data);
    const loading = useAppSelector((state) => state.traffic.loading);
    const error = useAppSelector((state) => state.traffic.error);

    if (loading) return <div className="loader-container"><div className="loader"></div> Loading traffic data...</div>;
    if (error) return <div className="error-message">Error loading traffic data: {error}</div>;
    if (!trafficData) return <div className="no-data-message">No traffic data available</div>;

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

    return (
        <div className="traffic-summary">
            <h3>Traffic Conditions</h3>
            
            <DataCard 
                title="Congestion Level" 
                value={trafficData.congestionLevel} 
                description="Current traffic density in your area"
                icon={
                    <div 
                        className="congestion-indicator" 
                        style={{ backgroundColor: getCongestionColor(trafficData.congestionLevel) }}
                    />
                }
            />
            
            <div className="incidents-section">
                <h4>Nearby Incidents ({trafficData.incidents.length})</h4>
                
                {trafficData.incidents.length > 0 ? (
                    <ul className="incidents-list">
                        {trafficData.incidents.map((incident: TrafficIncident) => (
                            <li key={incident.id} className={`incident-item severity-${incident.severity.toLowerCase()}`}>
                                <div className="incident-header">
                                    <span className="incident-type">{incident.type}</span>
                                    <span className="incident-severity">{incident.severity}</span>
                                </div>
                                <div className="incident-description">{incident.description}</div>
                                <div className="incident-location">{incident.location}</div>
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

export default TrafficSummary;