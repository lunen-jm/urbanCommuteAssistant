import React from 'react';
import { useSelector } from 'react-redux';

const RecommendedRouteMobile = () => {
  const weather = useSelector((state) => state.weather.data);
  const traffic = useSelector((state) => state.traffic.data);
  const transit = useSelector((state) => state.transit.data);

  // Determine optimal commute method (same logic as CommuteSuggestions)
  let recommendation = 'Driving';
  if (traffic && traffic.incidents && traffic.incidents.length > 3) {
    recommendation = 'Public Transit';
  } else if (weather && weather.description && weather.description.toLowerCase().includes('rain')) {
    recommendation = 'Public Transit';
  } else if (weather && weather.description && weather.description.toLowerCase().includes('clear')) {
    recommendation = 'Walking';
  }

  return (
    <div className="recommended-route-mobile">
      <span className="label">Recommended:</span>
      <span className="mode">{recommendation}</span>
    </div>
  );
};

export default RecommendedRouteMobile;