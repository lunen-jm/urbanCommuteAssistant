import React from 'react';
import { useSelector } from 'react-redux';

const TransitSummary = () => {
  const { data, loading, error } = useSelector((state) => state.transit);

  if (loading) return <div className="loading">Loading transit data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div className="no-data">No transit data available</div>;

  const { stops, routes, arrivals } = data;

  // Function to format time from ISO string or timestamp
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid time';
    }
  };

  return (
    <div className="transit-summary">
      <h3>Transit Options</h3>
      
      {stops.length > 0 ? (
        <div className="transit-stops">
          <h4>Nearby Stops</h4>
          <ul className="stop-list">
            {stops.map((stop) => (
              <li key={stop.id} className="stop-item">
                <div className="stop-name">{stop.name}</div>
                <div className="stop-routes">
                  {stop.routes.map((routeId) => (
                    <span key={routeId} className="route-badge">
                      {routeId}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="no-stops">
          <p>No transit stops found nearby.</p>
        </div>
      )}
      
      {arrivals.length > 0 && (
        <div className="transit-arrivals">
          <h4>Upcoming Arrivals</h4>
          <ul className="arrival-list">
            {arrivals.map((arrival, index) => (
              <li key={index} className={`arrival-item status-${arrival.status.toLowerCase()}`}>
                <div className="arrival-route">{arrival.route}</div>
                <div className="arrival-time">
                  {formatTime(arrival.arrival_time)}
                </div>
                <div className="arrival-status">
                  {arrival.status === 'ON_TIME' ? 'On Time' : 'Delayed'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TransitSummary;
