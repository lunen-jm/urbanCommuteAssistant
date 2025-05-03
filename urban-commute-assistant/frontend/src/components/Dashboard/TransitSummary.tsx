import React from 'react';
import { useSelector } from 'react-redux';
import { RootState, TransitData, TransitDisruption } from '../../types';
import DataCard from './DataCard';

const TransitSummary: React.FC = () => {
    const transitData = useSelector((state: RootState) => state.transitData.data);
    const loading = useSelector((state: RootState) => state.transitData.loading);
    const error = useSelector((state: RootState) => state.transitData.error);

    if (loading) return <div className="loader-container"><div className="loader"></div> Loading transit data...</div>;
    if (error) return <div className="error-message">Error loading transit data: {error}</div>;
    if (!transitData || transitData.length === 0) return <div className="no-data-message">No transit data available</div>;

    // Get all disruptions across transit lines
    const allDisruptions = transitData
        .flatMap(transit => transit.disruptions || [])
        .filter((disruption): disruption is TransitDisruption => !!disruption);

    return (
        <div className="transit-summary">
            <h3>Transit Status</h3>
            
            <div className="transit-lines">
                {transitData.map((transit, index) => (
                    <DataCard
                        key={index}
                        title={transit.line}
                        value={transit.status}
                        icon={getTransitIcon(transit.line)}
                    />
                ))}
            </div>
            
            {allDisruptions.length > 0 && (
                <div className="disruptions-section">
                    <h4>Service Disruptions</h4>
                    <ul className="disruptions-list">
                        {allDisruptions.map(disruption => (
                            <li key={disruption.id} className="disruption-item">
                                <div className="disruption-lines">
                                    Affecting: {disruption.affectedLines.join(', ')}
                                </div>
                                <div className="disruption-description">
                                    {disruption.description}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="upcoming-arrivals">
                <h4>Upcoming Arrivals</h4>
                {transitData.some(transit => transit.schedule && transit.schedule.length > 0) ? (
                    <div className="arrivals-list">
                        {transitData
                            .filter(transit => transit.schedule && transit.schedule.length > 0)
                            .flatMap(transit => 
                                (transit.schedule || []).map((schedule, scheduleIndex) => ({
                                    ...schedule,
                                    line: transit.line
                                }))
                            )
                            .sort((a, b) => new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime())
                            .slice(0, 5) // Show only the next 5 arrivals
                            .map((arrival, index) => (
                                <div key={index} className="arrival-item">
                                    <div className="arrival-line">{arrival.line}</div>
                                    <div className="arrival-time">
                                        {formatArrivalTime(arrival.arrivalTime)}
                                    </div>
                                    <div className={`arrival-status status-${arrival.status.toLowerCase()}`}>
                                        {arrival.status}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                ) : (
                    <p>No upcoming arrivals scheduled.</p>
                )}
            </div>
        </div>
    );
};

// Helper function to get transit icon
const getTransitIcon = (line: string): React.ReactNode => {
    // Determine icon based on transit type
    if (line.toLowerCase().includes('bus')) {
        return '🚌';
    } else if (line.toLowerCase().includes('train') || line.toLowerCase().includes('rail')) {
        return '🚆';
    } else if (line.toLowerCase().includes('subway')) {
        return '🚇';
    } else if (line.toLowerCase().includes('tram')) {
        return '🚊';
    } else if (line.toLowerCase().includes('ferry')) {
        return '⛴️';
    } else {
        return '🚉';
    }
};

// Helper function to format arrival time
const formatArrivalTime = (time: Date | string): string => {
    const date = typeof time === 'string' ? new Date(time) : time;
    
    // Calculate minutes from now
    const minutesFromNow = Math.round((date.getTime() - new Date().getTime()) / 60000);
    
    if (minutesFromNow <= 0) {
        return 'Arriving';
    } else if (minutesFromNow < 60) {
        return `${minutesFromNow} min`;
    } else {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
};

export default TransitSummary;