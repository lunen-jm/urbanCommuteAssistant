import React from 'react';
import { useSelector } from 'react-redux';

const WeatherSummary = () => {
  const { data, loading, error } = useSelector((state) => state.weather);

  if (loading) return <div className="loading">Loading weather data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data) return <div className="no-data">No weather data available</div>;

  return (
    <div className="weather-summary">
      <h3>Weather Conditions</h3>
      <div className="weather-details">
        <div className="weather-main">
          <div className="weather-icon">
            {data.icon && (
              <img
                src={`http://openweathermap.org/img/wn/${data.icon}@2x.png`}
                alt={data.description}
              />
            )}
          </div>
          <div className="weather-temp">
            <span className="temperature">{Math.round(data.temperature)}°F</span>
            <span className="description">{data.description}</span>
          </div>
        </div>
        
        <div className="weather-conditions">
          <div className="condition">
            <span className="label">Feels Like</span>
            <span className="value">{Math.round(data.feels_like)}°F</span>
          </div>
          <div className="condition">
            <span className="label">Humidity</span>
            <span className="value">{data.conditions.humidity}%</span>
          </div>
          <div className="condition">
            <span className="label">Wind</span>
            <span className="value">{Math.round(data.conditions.wind_speed)} mph</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherSummary;
