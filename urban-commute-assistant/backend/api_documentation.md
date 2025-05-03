# Urban Commute Assistant - Integration API Documentation

This document provides detailed information about the data integration services used in the Urban Commute Assistant application. These APIs fetch and process traffic, weather, and public transit data.

## Table of Contents
1. [Weather Service API](#weather-service-api)
2. [Traffic Service API](#traffic-service-api)
3. [Transit Service API](#transit-service-api)
4. [Data Aggregation Service](#data-aggregation-service)
5. [Caching Strategy](#caching-strategy)
6. [Error Handling](#error-handling)
7. [Performance Considerations](#performance-considerations)

## Weather Service API

The `WeatherService` class integrates with the OpenWeatherMap API to fetch current weather conditions and forecasts.

### Methods

#### `get_current_weather(lat: float, lon: float) -> Dict[str, Any]`

Fetches current weather conditions for a specific location.

**Parameters:**
- `lat`: Latitude coordinate
- `lon`: Longitude coordinate

**Returns:**
```json
{
  "data_available": true,
  "condition": "Clear",
  "description": "clear sky",
  "temperature": 75.2,
  "feels_like": 76.1,
  "humidity": 65,
  "wind_speed": 5.82,
  "wind_direction": 220,
  "timestamp": "2023-04-15T14:30:00"
}
```

**Cache Duration:** 30 minutes

#### `get_weather_forecast(lat: float, lon: float, hours: int = 24) -> List[Dict[str, Any]]`

Fetches hourly weather forecast for a specific location.

**Parameters:**
- `lat`: Latitude coordinate
- `lon`: Longitude coordinate
- `hours`: Number of hours to forecast (default: 24)

**Returns:**
```json
[
  {
    "condition": "Clouds",
    "description": "few clouds",
    "temperature": 76.5,
    "timestamp": "2023-04-15T17:00:00",
    "probability_precipitation": 0.1
  },
  {
    "condition": "Rain",
    "description": "light rain",
    "temperature": 72.1,
    "timestamp": "2023-04-15T20:00:00",
    "probability_precipitation": 0.6
  }
]
```

**Cache Duration:** 1 hour

## Traffic Service API

The `TomTomTrafficService` class integrates with the TomTom API to fetch traffic flow information and incident reports.

### Methods

#### `get_traffic_flow(lat: float, lon: float, radius: int = 1000) -> Dict[str, Any]`

Fetches traffic flow data for a specific location.

**Parameters:**
- `lat`: Latitude coordinate
- `lon`: Longitude coordinate
- `radius`: Search radius in meters (default: 1000)

**Returns:**
```json
{
  "data_available": true,
  "currentSpeed": 52,
  "freeFlowSpeed": 65,
  "currentTravelTime": 124,
  "freeFlowTravelTime": 92,
  "speedRatio": 0.8,
  "congestion_level": "moderate",
  "road_closure": false,
  "timestamp": "2023-04-15T14:30:00"
}
```

**Cache Duration:** 2 minutes

#### `get_traffic_incidents(lat: float, lon: float, radius: int = 1000) -> List[Dict[str, Any]]`

Fetches traffic incidents for a specific location.

**Parameters:**
- `lat`: Latitude coordinate
- `lon`: Longitude coordinate
- `radius`: Search radius in meters (default: 1000)

**Returns:**
```json
[
  {
    "type": "ACCIDENT",
    "description": "Accident on I-5 northbound",
    "comments": "Multiple vehicles involved",
    "coordinates": {
      "longitude": -122.3311,
      "latitude": 47.6052
    },
    "magnitude": 4,
    "start_time": "2023-04-15T14:30:00Z",
    "end_time": "2023-04-15T16:30:00Z",
    "duration_minutes": 120,
    "probability": 90
  }
]
```

**Cache Duration:** 2 minutes

## Transit Service API

The `KingCountyMetroService` class integrates with GTFS and GTFS-RT feeds to provide transit data for King County Metro.

### Methods

#### `get_static_schedules() -> Dict[str, Any]`

Fetches static transit schedule data.

**Returns:** A dictionary containing stops, routes, trips, and other GTFS static data.

**Cache Duration:** 24 hours

#### `get_trip_updates() -> List[Dict[str, Any]]`

Fetches real-time trip updates from GTFS-RT feed.

**Returns:** A list of trip updates with information about delays, cancellations, etc.

**Cache Duration:** 30 seconds

#### `get_vehicle_positions() -> List[Dict[str, Any]]`

Fetches real-time vehicle positions from GTFS-RT feed.

**Returns:** A list of vehicle positions with coordinates, bearing, speed, etc.

**Cache Duration:** 30 seconds

#### `get_service_alerts() -> List[Dict[str, Any]]`

Fetches service alerts from GTFS-RT feed.

**Returns:**
```json
[
  {
    "id": "alert-123",
    "header": "Route 40 Detour",
    "description": "Route 40 is detouring due to construction on 3rd Ave",
    "url": "https://kingcounty.gov/alerts/123",
    "cause": "CONSTRUCTION",
    "effect": "DETOUR",
    "start_time": "2023-04-15T08:00:00",
    "end_time": "2023-04-17T18:00:00",
    "affected_routes": ["40"],
    "affected_stops": ["1234", "5678"],
    "severity": "medium"
  }
]
```

**Cache Duration:** 60 seconds

## Data Aggregation Service

The `EnhancedDataAggregator` class coordinates fetching and combining data from various sources.

### Methods

#### `async get_comprehensive_data(lat: float, lon: float, radius: int = 1000) -> Dict[str, Any]`

Fetches and combines data from all sources for a specific location.

**Parameters:**
- `lat`: Latitude coordinate
- `lon`: Longitude coordinate
- `radius`: Search radius in meters (default: 1000)

**Returns:** Combined and normalized data from all sources with additional derived insights:
```json
{
  "timestamp": "2023-04-15T14:30:00",
  "data_sources": {
    "weather": true,
    "traffic_flow": true,
    "traffic_incidents": true,
    "transit_alerts": true
  },
  "weather": { ... },
  "traffic": {
    "flow": { ... },
    "incidents": [ ... ]
  },
  "transit": {
    "alerts": [ ... ]
  },
  "commute_impact": {
    "overall_level": "affected",
    "factors": [
      {
        "type": "weather",
        "description": "Rain may affect commute",
        "severity": "medium"
      },
      {
        "type": "traffic_incident",
        "description": "1 major traffic incident",
        "severity": "medium"
      }
    ]
  }
}
```

**Cache Duration:** 1 minute

## Caching Strategy

All API responses are cached using Redis to minimize API requests and improve response times:

| Data Type | Cache Duration | Reason |
|-----------|----------------|--------|
| Current Weather | 30 minutes | Weather changes slowly |
| Weather Forecast | 1 hour | Forecasts update hourly |
| Traffic Flow | 2 minutes | Traffic conditions change rapidly |
| Traffic Incidents | 2 minutes | New incidents can occur suddenly |
| Transit Schedules | 24 hours | Schedules rarely change intraday |
| Trip Updates | 30 seconds | Real-time data changes frequently |
| Vehicle Positions | 30 seconds | Vehicles are constantly moving |
| Service Alerts | 60 seconds | Alerts may need prompt display |
| Comprehensive Data | 1 minute | Compromise between freshness and performance |

## Error Handling

All integration services implement a robust error handling approach:

1. **Circuit Breaker Pattern**: Prevents repeated calls to failing services with automatic recovery
   - `failure_threshold`: 5 failed calls
   - `recovery_timeout`: 30 seconds

2. **Graceful Degradation**: Services return partial data when complete data is unavailable
   - Response includes `data_available: false` flag when a source is unreachable
   - Other data sources remain available when one source fails

3. **Standardized Error Format**:
```json
{
  "data_available": false,
  "error": "Description of the error",
  "timestamp": "2023-04-15T14:30:00"
}
```

## Performance Considerations

1. **Parallel Data Fetching**: Uses `asyncio` to fetch from multiple sources concurrently
2. **Optimized Cache Keys**: Designed to maximize cache hits for similar requests
3. **Compression**: Large responses are compressed before caching
4. **Metrics Collection**: Records API call statistics to identify bottlenecks
   - Call counts
   - Response times
   - Error rates
   - Cache hit/miss ratio