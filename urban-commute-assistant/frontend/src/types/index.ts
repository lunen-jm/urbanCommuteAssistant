export interface User {
    id: string;
    name: string;
    email: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    notificationsEnabled: boolean;
    preferredTransportModes: string[];
    location?: string;
    notifications?: boolean;
}

export interface Notification {
    id: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

export interface TrafficIncident {
    id: string;
    type: string;
    severity: 'Low' | 'Medium' | 'High';
    description: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    startTime: string;
    endTime?: string;
}

export interface TransitData {
    line: string;
    status: string;
    schedule?: TransitSchedule[];
    disruptions?: TransitDisruption[];
}

export interface TransitSchedule {
    line: string;
    arrivalTime: Date;
    status: string;
}

export interface TransitDisruption {
    id: string;
    description: string;
    affectedLines: string[];
}

// Weather Data Types
export interface WeatherData {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    precipitation: number;
    forecast: WeatherForecast[];
}

export interface WeatherForecast {
    date: string;
    high: number;
    low: number;
    condition: string;
}

// Traffic Data Types
export interface TrafficData {
    congestionLevel: 'Low' | 'Moderate' | 'High';
    incidents: TrafficIncident[];
    lastUpdated: string;
}

// Redux store root state
export interface RootState {
    user: UserState;
    transitData: TransitDataState;
    auth: AuthState;
    map: MapState;
    weather: WeatherState;
    traffic: TrafficState;
}

export interface UserState {
    id: string | null;
    name: string | null;
    email: string | null;
    token: string | null;
    authenticated: boolean;
    preferences: {
        location: string | null;
        notifications: boolean;
        preferredTransportModes: string[];
        notificationChannels?: string[];
        theme?: 'light' | 'dark' | 'system';
        language?: string;
        autoRefresh?: boolean;
        refreshInterval?: number;
    };
}

export interface TransitDataState {
    data: TransitData[] | null;
    loading: boolean;
    error: string | null;
}

export interface MapState {
    zoom: number;
    center: {
        lat: number;
        lng: number;
    };
    bounds: any | null;
    activeLayers: {
        traffic: boolean;
        weather: boolean;
        transit: boolean;
    };
}

export interface WeatherState {
    data: WeatherData | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

export interface TrafficState {
    data: TrafficData | null;
    loading: boolean;
    error: string | null;
}

// Import and re-export auth types
import { AuthUser, AuthToken, AuthState, LoginCredentials, RegisterData } from './auth';

export type {
    AuthUser,
    AuthToken,
    AuthState,
    LoginCredentials,
    RegisterData
};