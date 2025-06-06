import React from 'react';
import { useSelector } from 'react-redux';

const TrafficSummary = () => {
  const { data, loading, error } = useSelector((state) => state.traffic);

  if (loading) return <div className="loading">Loading traffic data...</div>;
  
  // Improved error handling to handle both string and object errors
  if (error) {
    const errorMessage = typeof error === 'object' ? 
      (error.detail || JSON.stringify(error)) : 
      error.toString();
    return <div className="error">Error: {errorMessage}</div>;
  }
  
  if (!data) return <div className="no-data">No traffic data available</div>;

  const { incidents, count } = data;

  return (
    <div className="traffic-summary">
      <h3>Traffic Conditions</h3>
      
      <div className="traffic-overview">
        <div className="traffic-count">
          <span className="label">Incidents</span>
          <span className="value">{count}</span>
        </div>
      </div>
      
      {incidents.length > 0 ? (
        <div className="traffic-incidents">
          <h4>Nearby Incidents</h4>
          <ul className="incident-list">
            {incidents.slice(0, 3).map((incident, index) => (
              <li key={incident.id || index} className={`incident-item severity-${incident.severity}`}>
                <div className="incident-type">{incident.type}</div>
                <div className="incident-description">{incident.description}</div>
              </li>
            ))}
          </ul>
          {incidents.length > 3 && (
            <div className="more-incidents">
              +{incidents.length - 3} more incidents
            </div>
          )}
        </div>
      ) : (
        <div className="no-incidents">
          <p>No traffic incidents reported in your area.</p>
        </div>
      )}
    </div>
  );
};

export default TrafficSummary;
