import { TrafficIncident, WeatherData, TransitSchedule } from '../types';

export const formatTrafficData = (data: TrafficIncident[]): { id: string; status: string; delay: string; location: string; updatedAt: string }[] => {
    return data.map(item => ({
        id: item.id,
        status: item.severity,
        delay: item.description,
        location: item.location,
        updatedAt: new Date().toLocaleTimeString(),
    }));
};

export const formatWeatherData = (data: WeatherData): { temperature: number; description: string; humidity: number; windSpeed: number; updatedAt: string } => {
    return {
        temperature: data.temperature,
        description: data.condition,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        updatedAt: new Date().toLocaleTimeString(),
    };
};

export const formatTransitData = (data: TransitSchedule[]): { id: string; route: string; arrivalTime: string; status: string }[] => {
    return data.map(item => ({
        id: item.line,
        route: item.line,
        arrivalTime: item.arrivalTime.toLocaleTimeString(),
        status: item.status,
    }));
};