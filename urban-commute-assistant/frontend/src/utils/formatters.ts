// filepath: c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant\frontend\src\utils\formatters.ts
import { TrafficIncident, WeatherData, TransitSchedule } from '../types';

// Helper function to get severity label from numeric severity
export const getSeverityLabel = (severity: number | 'Low' | 'Medium' | 'High'): string => {
    if (typeof severity === 'string') {
        switch (severity) {
            case 'Low':
                return 'low';
            case 'Medium':
                return 'moderate';
            case 'High':
                return 'high';
            default:
                return 'unknown';
        }
    } else {
        // Handle numeric severity
        switch (severity) {
            case 1:
                return 'low';
            case 2:
                return 'moderate';
            case 3:
                return 'high';
            case 4:
                return 'severe';
            default:
                return 'unknown';
        }
    }
};

// Helper function to format location coordinates
export const formatLocation = (location?: { lat?: number, lon?: number } | string): string => {
    if (!location) return 'Unknown location';
    
    // If location is already a string, just return it
    if (typeof location === 'string') return location;
    
    // Handle location as coordinates object
    const lat = typeof location.lat === 'number' ? location.lat.toFixed(4) : 'Unknown';
    const lon = typeof location.lon === 'number' ? location.lon.toFixed(4) : 'Unknown';
    return `${lat}, ${lon}`;
};

// Helper function to format arrival time
export const formatArrivalTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Format traffic data for display
export const formatTrafficData = (data: TrafficIncident[]): { id: string; status: string; delay: string; location: string; updatedAt: string }[] => {
    return data.map(item => ({
        id: item.id,
        status: getSeverityLabel(item.severity),
        delay: item.description,
        location: typeof item.location === 'string' 
            ? item.location 
            : formatLocation(item.coordinates ? { lat: item.coordinates.lat, lon: item.coordinates.lng } : undefined),
        updatedAt: new Date().toLocaleTimeString(),
    }));
};

// Format weather data for display
export const formatWeatherData = (data: WeatherData): { temperature: number | null; description: string; humidity: number | null; windSpeed: number | null; updatedAt: string } => {
    return {
        temperature: data.temperature,
        description: (data as any).description || (data as any).condition || '',
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        updatedAt: new Date().toLocaleTimeString(),
    };
};

// Format transit data for display
export const formatTransitData = (data: any[]): { id: string; route: string; arrivalTime: string; status: string }[] => {
    return data.map(item => ({
        id: (item.stopId || '') + (item.routeId || ''),
        route: item.routeName || item.line || '',
        arrivalTime: typeof item.arrivalTime === 'string' 
            ? item.arrivalTime 
            : item.arrivalTime instanceof Date 
                ? item.arrivalTime.toLocaleTimeString() 
                : '',
        status: item.status || 'Unknown',
    }));
};
