// API Response Types
// These types match the response format from our backend APIs

export interface ApiWeatherData {
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
  feels_like: number;
  source: string;
}

export interface ApiTrafficData {
  current_speed: number;
  free_flow_speed: number;
  current_travel_time: number;
  free_flow_travel_time: number;
  confidence: number;
  road_closure: boolean;
  congestion_level: string;
  source: string;
}

export interface ApiTransitData {
  routes: ApiTransitRoute[];
  stops: ApiTransitStop[];
  trip_updates: ApiTripUpdate[];
  vehicle_positions: ApiVehiclePosition[];
  service_alerts: ApiServiceAlert[];
  cached: boolean;
  timestamp: string;
  source: string;
}

export interface ApiTransitRoute {
  id: string;
  short_name: string;
  long_name: string;
  color?: string;
  text_color?: string;
  type?: number;
  agency_id?: string;
}

export interface ApiTransitStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  code?: string;
  description?: string;
  wheelchair_boarding?: boolean;
}

export interface ApiTripUpdate {
  trip_id: string;
  route_id: string;
  stop_time_updates: ApiStopTimeUpdate[];
  timestamp?: string;
  vehicle?: ApiVehicleDescriptor;
}

export interface ApiStopTimeUpdate {
  stop_id: string;
  stop_sequence?: number;
  arrival?: {
    time?: string;
    delay?: number;
  };
  departure?: {
    time?: string;
    delay?: number;
  };
}

export interface ApiVehiclePosition {
  trip_id: string;
  route_id?: string;
  vehicle?: ApiVehicleDescriptor;
  position: {
    latitude: number;
    longitude: number;
    bearing?: number;
    speed?: number;
  };
  timestamp?: string;
  occupancy_status?: string;
  congestion_level?: string;
}

export interface ApiVehicleDescriptor {
  id: string;
  label?: string;
  license_plate?: string;
}

export interface ApiServiceAlert {
  id: string;
  effect: string;
  cause?: string;
  header: string;
  description?: string;
  active_until?: string;
  severity?: string;
  url?: string;
  route_ids?: string[];
  stop_ids?: string[];
}

// API Health Check Response
export interface ApiHealthCheckResponse {
  weather_api: {
    key_configured: boolean;
    health: boolean;
  };
  traffic_api: {
    key_configured: boolean;
    health: boolean;
  };
  transit_api: {
    key_configured: boolean;
    health: boolean;
  };
}

// Combined/Integrated Data Response
export interface ApiIntegratedDataResponse {
  weather: ApiWeatherData;
  traffic: ApiTrafficData;
  transit: ApiTransitData;
  timestamp: string;
  source: string;
}
