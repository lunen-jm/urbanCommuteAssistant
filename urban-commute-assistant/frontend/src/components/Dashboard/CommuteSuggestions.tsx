import React from 'react';
import { RootState } from '../../types';
import { useAppSelector } from '../../store';
import DataCard from './DataCard';

interface CommuteSuggestion {
    id: string;
    mode: string;
    route: string;
    duration: number;
    departureTime: string;
    arrivalTime: string;
    congestion: 'Low' | 'Moderate' | 'High';
    weatherImpact: 'Low' | 'Moderate' | 'High';
    score: number;
}

const CommuteSuggestions: React.FC = () => {
    // In a real implementation, these would come from the Redux store
    // For now we'll use mock data for the UI implementation
    const userPreferences = useAppSelector((state) => state.user.preferences);
    const weatherData = useAppSelector((state) => state.weather?.data);
    const trafficData = useAppSelector((state) => state.traffic?.data);
    
    // Helper function to get weather description safely handling different property names
    const getWeatherDescription = (): string => {
        if (!weatherData) return '';
        // Handle both possible property names from different interface versions
        return (weatherData as any).description || (weatherData as any).condition || '';
    };
    
    // Helper function to check if weather mentions rain
    const isRainyWeather = (): boolean => {
        const description = getWeatherDescription();
        return description.toLowerCase().includes('rain');
    };
    
    // Mock suggestions based on current conditions
    const suggestions: CommuteSuggestion[] = [
        {
            id: '1',
            mode: 'Bus',
            route: 'Express 545',
            duration: 25,
            departureTime: '08:15 AM',
            arrivalTime: '08:40 AM',
            congestion: 'Low',
            weatherImpact: 'Low',
            score: 95
        },
        {
            id: '2',
            mode: 'Car',
            route: 'I-5 North → SR 520',
            duration: 18,
            departureTime: '08:20 AM',
            arrivalTime: '08:38 AM',
            congestion: 'Moderate',
            weatherImpact: 'Low',
            score: 88
        },
        {
            id: '3',
            mode: 'Train',
            route: 'Link Light Rail',
            duration: 32,
            departureTime: '08:10 AM',
            arrivalTime: '08:42 AM',
            congestion: 'Low',
            weatherImpact: 'Low',
            score: 82
        },
        {
            id: '4',
            mode: 'Bicycle',
            route: 'Burke-Gilman Trail',
            duration: 42,
            departureTime: '08:00 AM',
            arrivalTime: '08:42 AM',
            congestion: 'Low',
            weatherImpact: isRainyWeather() ? 'High' : 'Low',
            score: isRainyWeather() ? 55 : 78
        }
    ];

    // Filter out modes that don't match user preferences
    const filteredSuggestions = userPreferences.preferredTransportModes?.length > 0
        ? suggestions.filter(
            (suggestion: CommuteSuggestion) => userPreferences.preferredTransportModes.some(
                (mode: string) => suggestion.mode.toLowerCase().includes(mode.toLowerCase())
            )
          )
        : suggestions;

    // Sort by score descending
    const sortedSuggestions = [...filteredSuggestions].sort((a, b) => b.score - a.score);

    return (
        <div className="commute-suggestions">
            <h3>Commute Recommendations</h3>
            
            {sortedSuggestions.length > 0 ? (
                <div className="suggestions-list">
                    {sortedSuggestions.map(suggestion => (
                        <div key={suggestion.id} className="suggestion-card">
                            <div className="suggestion-header">
                                <div className="suggestion-mode">
                                    {getModeIcon(suggestion.mode)} {suggestion.mode}
                                </div>
                                <div className="suggestion-score" style={{ backgroundColor: getScoreColor(suggestion.score) }}>
                                    {suggestion.score}
                                </div>
                            </div>
                            
                            <div className="suggestion-details">
                                <div className="suggestion-route">{suggestion.route}</div>
                                <div className="suggestion-time">
                                    <span className="departure">{suggestion.departureTime}</span>
                                    <span className="duration">{suggestion.duration} min</span>
                                    <span className="arrival">{suggestion.arrivalTime}</span>
                                </div>
                            </div>
                            
                            <div className="suggestion-factors">
                                <div className={`factor traffic-factor impact-${suggestion.congestion.toLowerCase()}`}>
                                    Traffic: {suggestion.congestion}
                                </div>
                                <div className={`factor weather-factor impact-${suggestion.weatherImpact.toLowerCase()}`}>
                                    Weather: {suggestion.weatherImpact}
                                </div>
                            </div>
                            
                            <button className="select-route-btn">Select This Route</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No commute suggestions match your preferences. Try adjusting your preferred transport modes.</p>
            )}
        </div>
    );
};

// Helper function to get icon for transport mode
const getModeIcon = (mode: string): React.ReactNode => {
    const modeLower = mode.toLowerCase();
    if (modeLower.includes('bus')) {
        return '🚌';
    } else if (modeLower.includes('car')) {
        return '🚗';
    } else if (modeLower.includes('train') || modeLower.includes('rail')) {
        return '🚆';
    } else if (modeLower.includes('subway')) {
        return '🚇';
    } else if (modeLower.includes('walk')) {
        return '🚶';
    } else if (modeLower.includes('bicycle') || modeLower.includes('bike')) {
        return '🚲';
    } else {
        return '🚐';
    }
};

// Helper function to get color based on score
const getScoreColor = (score: number): string => {
    if (score >= 90) return '#33aa33'; // Green
    if (score >= 75) return '#66bb33'; // Light green
    if (score >= 60) return '#ffaa33'; // Orange
    return '#ff4d4d'; // Red
};

export default CommuteSuggestions;
