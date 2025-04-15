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

export interface TrafficData {
    congestionLevel: string;
    incidents: TrafficIncident[];
}

export interface TrafficIncident {
    id: string;
    description: string;
    severity: string;
    location: string;
}

export interface WeatherData {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
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

// Redux store root state
export interface RootState {
    user: UserState;
    transitData: TransitDataState;
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
    };
}

export interface TransitDataState {
    data: TransitData[] | null;
    loading: boolean;
    error: string | null;
}