import React from 'react';
import { useSelector } from 'react-redux';

const CommuteSuggestions = () => {
  const weather = useSelector((state) => state.weather.data);
  const traffic = useSelector((state) => state.traffic.data);
  const transit = useSelector((state) => state.transit.data);

  if (!weather || !traffic || !transit) {
    return <div className="loading">Generating commute suggestions...</div>;
  }

  // Generate commute suggestions based on weather, traffic, and transit data
  const generateSuggestions = () => {
    const suggestions = [];
    
    // Weather-based suggestions
    if (weather) {
      const temp = weather.temperature;
      const description = weather.description.toLowerCase();
      
      if (temp < 32) {
        suggestions.push('Very cold temperatures today. Consider working from home if possible.');
      } else if (temp < 45) {
        suggestions.push('Cold weather today. Dress warmly and allow extra time for your commute.');
      }
      
      if (description.includes('rain') || description.includes('shower')) {
        suggestions.push('Rainy conditions expected. Take an umbrella and consider public transit.');
      }
      
      if (description.includes('snow') || description.includes('blizzard')) {
        suggestions.push('Snowy conditions expected. Consider working from home or taking public transit.');
      }

      if (description.includes('thunderstorm')) {
        suggestions.push('Thunderstorms in the forecast. Exercise caution and consider delaying travel.');
      }
    }
    
    // Traffic-based suggestions
    if (traffic && traffic.incidents && traffic.incidents.length > 0) {
      if (traffic.incidents.length > 5) {
        suggestions.push('Heavy traffic incidents reported. Consider alternate routes or public transit.');
      } else {
        suggestions.push('Some traffic incidents reported. Check your route before departing.');
      }
      
      // Check for severe incidents
      const severeIncidents = traffic.incidents.filter(i => i.severity > 3);
      if (severeIncidents.length > 0) {
        suggestions.push('Severe traffic disruptions reported. Consider working from home or delaying travel.');
      }
    } else if (traffic) {
      suggestions.push('No significant traffic incidents reported. Good time for driving.');
    }
    
    // Transit-based suggestions
    if (transit && transit.arrivals && transit.arrivals.length > 0) {
      const delayedArrivals = transit.arrivals.filter(a => a.status === 'DELAYED');
      
      if (delayedArrivals.length > 0) {
        suggestions.push('Some transit services are experiencing delays. Check schedules before departing.');
      } else {
        suggestions.push('Transit services are running on time. Good option for your commute.');
      }
    }
    
    // If we have few suggestions, add some generic ones
    if (suggestions.length < 2) {
      suggestions.push('Traffic is generally light at this time. Good time for commuting.');
    }
    
    return suggestions;
  };

  const suggestions = generateSuggestions();

  return (
    <div className="commute-suggestions">
      <h3>Commute Recommendations</h3>
      
      <div className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="suggestion-item">
            {suggestion}
          </div>
        ))}
      </div>
      
      <div className="optimal-commute">
        <h4>Optimal Commute Method</h4>
        <div className="commute-option">
          {traffic && traffic.incidents && traffic.incidents.length > 3 
            ? 'Public Transit' 
            : weather && weather.description.toLowerCase().includes('rain')
              ? 'Public Transit'
              : 'Driving'}
        </div>
      </div>
    </div>
  );
};

export default CommuteSuggestions;
