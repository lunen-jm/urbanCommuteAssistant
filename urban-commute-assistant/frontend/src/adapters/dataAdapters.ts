import { 
  TrafficData, 
  TrafficIncident, 
  TransitData, 
  Route, 
  Stop, 
  TripUpdate, 
  VehiclePosition, 
  ServiceAlert, 
  WeatherData,
  FlowSegment
} from '../types';

// Traffic data adapter
export const adaptTrafficData = (data: any): TrafficData => {
  const incidents: TrafficIncident[] = data.incidents?.map((incident: any) => ({
    id: incident.id,
    type: incident.type,
    // Map 'moderate' to 'Medium', 'minor' to 'Low'
    severity: incident.severity === 'moderate' ? 'Medium' : 
              incident.severity === 'minor' ? 'Low' : 'High',
    description: incident.description,
    // Convert location object to string format if needed
    location: typeof incident.location === 'string' 
      ? incident.location 
      : `${incident.location.latitude.toFixed(4)}, ${incident.location.longitude.toFixed(4)}`,
    coordinates: {
      lat: typeof incident.location === 'object' ? incident.location.latitude : 0,
      lng: typeof incident.location === 'object' ? incident.location.longitude : 0
    },
    startTime: incident.startTime || new Date().toISOString(),
    endTime: incident.endTime
  })) || [];

  // Create flow segments if they exist
  const flowSegments: FlowSegment[] = data.flowSegments || [];

  return {
    flowSegments,
    incidents,
    timestamp: data.timestamp || new Date().toISOString()
  };
};

// Transit data adapter
export const adaptTransitData = (data: any): TransitData => {
  // Adapt routes (convert string type to number)
  const routes: Route[] = data.routes?.map((route: any) => ({
    id: route.id,
    shortName: route.shortName,
    longName: route.name || route.longName,
    color: route.color,
    textColor: route.textColor,
    // Convert string type to number (0: tram, 1: subway, 2: rail, 3: bus, etc.)
    type: typeof route.type === 'string' 
      ? (route.type === 'bus' ? 3 : 
         route.type === 'rail' ? 2 : 0)
      : route.type,
    agencyId: route.agencyId
  })) || [];

  // Adapt stops (convert location object to lat/lon properties)
  const stops: Stop[] = data.stops?.map((stop: any) => ({
    id: stop.id,
    name: stop.name,
    lat: stop.location?.latitude || stop.lat,
    lon: stop.location?.longitude || stop.lon,
    code: stop.code,
    description: stop.description,
    wheelchairBoarding: stop.wheelchairBoarding
  })) || [];

  // Adapt trip updates
  const tripUpdates: TripUpdate[] = data.tripUpdates?.map((update: any) => ({
    tripId: update.id || update.tripId,
    routeId: update.routeId,
    stopTimeUpdates: update.stopTimeUpdates || [],
    timestamp: update.timestamp,
    vehicle: update.vehicle
  })) || [];

  // Adapt vehicle positions
  const vehiclePositions: VehiclePosition[] = data.vehiclePositions?.map((vehicle: any) => ({
    vehicle: vehicle.vehicle,
    position: {
      lat: vehicle.position?.latitude || vehicle.position?.lat,
      lon: vehicle.position?.longitude || vehicle.position?.lon,
      bearing: vehicle.bearing,
      speed: vehicle.speed
    },
    timestamp: vehicle.timestamp,
    tripId: vehicle.tripId,
    routeId: vehicle.routeId,
    stopId: vehicle.stopId,
    status: vehicle.status
  })) || [];

  // Adapt service alerts
  const serviceAlerts: ServiceAlert[] = data.serviceAlerts?.map((alert: any) => ({
    id: alert.id,
    effect: alert.effect,
    cause: alert.cause,
    header: alert.header,
    description: alert.description,
    activeUntil: alert.timestamp || alert.activeUntil, // Use timestamp as activeUntil if needed
    severity: alert.severity,
    routeIds: alert.routeIds,
    stopIds: alert.stopIds
  })) || [];

  return {
    routes,
    stops,
    tripUpdates,
    vehiclePositions,
    serviceAlerts,
    error: data.error,
    errorMessage: data.errorMessage
  };
};

// Weather data adapter
export const adaptWeatherData = (data: any): WeatherData => {
  return {
    temperature: data.temperature,
    description: data.description,
    humidity: data.humidity,
    windSpeed: data.windSpeed,
    // Remove feelsLike and icon if they're not in the type definition
    error: data.error,
    errorMessage: data.errorMessage
  };
};
