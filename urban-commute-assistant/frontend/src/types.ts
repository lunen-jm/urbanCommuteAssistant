// Transit data types

export interface TransitData {
  routes: Route[];
  stops: Stop[];
  tripUpdates: TripUpdate[];
  vehiclePositions: VehiclePosition[];
  serviceAlerts: ServiceAlert[];
  error?: boolean;
  errorMessage?: string;
}

export interface Route {
  id: string;
  shortName: string;
  longName: string;
  color?: string;
  textColor?: string;
  type?: number;
  agencyId?: string;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  code?: string;
  description?: string;
  wheelchairBoarding?: boolean;
}

export interface TripUpdate {
  tripId: string;
  routeId: string;
  stopTimeUpdates: StopTimeUpdate[];
  timestamp?: string;
  vehicle?: VehicleDescriptor;
}

export interface StopTimeUpdate {
  stopId: string;
  stopSequence?: number;
  arrival?: {
    time?: string;
    delay?: number;
  };
  departure?: {
    time?: string;
    delay?: number;
  };
  scheduleRelationship?: string;
}

export interface VehiclePosition {
  vehicle: VehicleDescriptor;
  position: {
    lat: number;
    lon: number;
    bearing?: number;
    speed?: number;
  };
  timestamp?: string;
  tripId?: string;
  routeId?: string;
  stopId?: string;
  status?: string;
}

export interface VehicleDescriptor {
  id: string;
  label?: string;
  licensePlate?: string;
}

export interface ServiceAlert {
  id: string;
  effect: string;
  cause?: string;
  header: string;
  description?: string;
  activeUntil?: string;
  severity?: string;
  url?: string;
  routeIds?: string[];
  stopIds?: string[];
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'alert' | 'info' | 'success' | 'warning';
  actionUrl?: string;
}

// Transit schedule and disruption types
export interface TransitSchedule {
  stopId: string;
  stopName: string;
  routeId: string;
  routeName: string;
  arrivalTime: string;
  departureTime: string;
  status: string;
  delay?: number;
}

export interface TransitDisruption {
  id: string;
  type: string;
  severity: string;
  description: string;
  affectedLines: string[];
  startTime: string;
  endTime?: string;
  status: string;
}

// Weather data types

export interface WeatherData {
  temperature: number | null;
  description: string;
  humidity: number | null;
  windSpeed: number | null;
  error?: boolean;
  errorMessage?: string;
}

// Weather forecast types
export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
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

// Traffic data types

export interface TrafficData {
  flowSegments: FlowSegment[];
  incidents: TrafficIncident[];
  timestamp: string;
  error?: boolean;
  errorMessage?: string;
}

export interface FlowSegment {
  id: string;
  coordinates: {
    lat: number;
    lon: number;
  }[];
  speed: number;
  freeFlowSpeed: number;
  currentSpeed: number;
  confidence: number;
  roadClosure: boolean;
}

// This file is being deprecated. Please import types from the types directory.
// All types are exported from './types/index.ts'
// export * from './types';

// Combined data and state types

export interface ComprehensiveData {
  weather: WeatherData;
  traffic: TrafficData;
  transit: TransitData;
  recommendations: Recommendation[];
  timestamp: string;
  error?: boolean;
  errorMessage?: string;
}

export interface Recommendation {
  type: string;
  severity: string;
  message: string;
  context?: any;
}

// Redux state types

export interface RootState {
  transitData: TransitDataState;
  auth: AuthState;
  user: UserState;
  map: MapState;
  weather: WeatherState;
  traffic: TrafficState;
  // Add other state slices here as they are implemented
}

export interface TransitDataState {
  data: TransitData | null;
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: any | null;
  error: string | null;
}

// Location-related types (imported from LocationService)
export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export type LocationStatus = 'unknown' | 'loading' | 'success' | 'error';

export interface SavedLocation {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface UserState {
  id: string | null;
  name: string;
  email: string;
  // Location-related state
  currentLocation: LocationCoordinates | null;
  locationStatus: LocationStatus;
  locationError: LocationError | null;
  selectedDestination: SavedLocation | null;
  savedLocations: SavedLocation[];
  // User preferences
  preferences: {
    darkMode: boolean;
    preferredTransportModes: string[];
    notificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    }
  }
}

export interface MapState {
  center: [number, number];
  zoom: number;
  markers: any[];
}

export interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export interface TrafficState {
  data: TrafficData | null;
  loading: boolean;
  error: string | null;
}
