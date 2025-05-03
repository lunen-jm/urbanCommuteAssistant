import React from 'react';
import { RootState, WeatherForecast } from '../../types';
// Import the store's useAppSelector hook which has proper typing
import { useAppSelector } from '../../store';
import DataCard from './DataCard';

const WeatherSummary: React.FC = () => {
    // Use useAppSelector instead of useSelector
    const weatherData = useAppSelector((state) => state.weather.data);
    const loading = useAppSelector((state) => state.weather.loading);
    const error = useAppSelector((state) => state.weather.error);

    if (loading) return <div className="loader-container"><div className="loader"></div> Loading weather data...</div>;
    if (error) return <div className="error-message">Error loading weather data: {error}</div>;
    if (!weatherData) return <div className="no-data-message">No weather data available</div>;

    return (
        <div className="weather-summary">
            <h3>Weather Conditions</h3>
            <div className="data-cards">
                <DataCard 
                    title="Temperature" 
                    value={`${weatherData.temperature}°F`}
                    icon={getWeatherIcon(weatherData.condition)} 
                />
                <DataCard 
                    title="Condition" 
                    value={weatherData.condition} 
                />
                <DataCard 
                    title="Humidity" 
                    value={`${weatherData.humidity}%`} 
                />
                <DataCard 
                    title="Wind" 
                    value={`${weatherData.windSpeed} mph`} 
                />
            </div>

            <div className="forecast-section">
                <h4>3-Day Forecast</h4>
                <div className="forecast-cards">
                    {weatherData.forecast && weatherData.forecast.map((day: WeatherForecast, index: number): React.ReactNode => (
                        <div key={index} className="forecast-card">
                            <div className="forecast-date">{formatDate(day.date)}</div>
                            <div className="forecast-icon">{getWeatherIcon(day.condition)}</div>
                            <div className="forecast-temps">
                                <span className="high">{day.high}°</span>
                                <span className="low">{day.low}°</span>
                            </div>
                            <div className="forecast-condition">{day.condition}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper function to get appropriate weather icon
const getWeatherIcon = (condition: string): React.ReactNode => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
        return '☀️';
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
        return '☁️';
    } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
        return '🌧️';
    } else if (conditionLower.includes('snow')) {
        return '❄️';
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
        return '⚡';
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
        return '🌫️';
    } else if (conditionLower.includes('wind')) {
        return '💨';
    } else {
        return '🌤️';
    }
};

// Helper function to format date
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default WeatherSummary;