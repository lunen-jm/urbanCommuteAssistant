import React from 'react';
import { RootState, WeatherData, WeatherForecast } from '../../types';
import { useAppSelector } from '../../store';
import DataCard from './DataCard';

const WeatherSummary: React.FC = () => {
    const weatherData = useAppSelector((state) => state.weather.data);
    const loading = useAppSelector((state) => state.weather.loading);
    const error = useAppSelector((state) => state.weather.error);    if (loading) return <div className="loader-container"><div className="loader"></div> Loading weather data...</div>;
    if (error) return <div className="error-message">Error loading weather data: {error}</div>;
    if (!weatherData) return <div className="no-data-message">No weather data available</div>;

    return (
        <div className="weather-summary">
            <h3>Weather Conditions</h3>
            <div className="data-cards">
                <DataCard 
                    title="Temperature" 
                    value={weatherData.temperature ? `${weatherData.temperature}°F` : 'N/A'}
                    icon={getWeatherIcon(weatherData.description)} 
                />
                <DataCard 
                    title="Condition" 
                    value={weatherData.description} 
                />
                <DataCard 
                    title="Humidity" 
                    value={weatherData.humidity ? `${weatherData.humidity}%` : 'N/A'} 
                />
                <DataCard 
                    title="Wind" 
                    value={weatherData.windSpeed ? `${weatherData.windSpeed} mph` : 'N/A'}                />
            </div>
        </div>
    );
};

// Helper function to get weather icon based on condition
const getWeatherIcon = (condition: string = ''): string => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
        return '🌧️';
    } else if (lowerCondition.includes('snow')) {
        return '❄️';
    } else if (lowerCondition.includes('cloud')) {
        return '☁️';
    } else if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) {
        return '⛈️';
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
        return '🌫️';
    } else if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
        return '☀️';
    } else if (lowerCondition.includes('partly')) {
        return '⛅';
    } else {
        return '🌤️';
    }
};

export default WeatherSummary;
