import requests
import logging
from typing import Optional, Dict, Any, List
import redis
import json
from datetime import datetime

from pydantic import BaseModel, Field
from app.core.config import Config
from app.api.integrations.base import DataSourceAdapter
from app.services.circuit_breaker import CircuitBreaker, CircuitBreakerError

logger = logging.getLogger(__name__)

class TrafficQueryParams(BaseModel):
    lat: float = Field(..., description="Latitude coordinate")
    lon: float = Field(..., description="Longitude coordinate")
    radius: int = Field(1000, description="Radius in meters to search for traffic data")

class TrafficIncident(BaseModel):
    id: str
    type: str
    severity: int
    description: str
    location: Dict[str, float]
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    affected_roads: Optional[List[str]] = None

class TrafficFlowSegment(BaseModel):
    id: str
    current_speed: float
    free_flow_speed: float
    current_travel_time: float
    free_flow_travel_time: float
    confidence: float
    road_closure: bool

class TrafficResponse(BaseModel):
    flow_segments: List[TrafficFlowSegment] = []
    incidents: List[TrafficIncident] = []
    cached: bool = False
    timestamp: datetime = Field(default_factory=datetime.now)
    source: str = "tomtom"

class TomTomTrafficAdapter(DataSourceAdapter[TrafficQueryParams, TrafficResponse, TrafficResponse]):
    """
    Adapter for TomTom Traffic API
    """
    def __init__(self):
        self.api_key = Config.TRAFFIC_API_KEY
        self.flow_url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        self.incidents_url = "https://api.tomtom.com/traffic/services/5/incidentDetails"
        self.redis = redis.from_url(Config.REDIS_URL)
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=3,
            recovery_timeout=30,  # Traffic data changes rapidly, so short recovery time
            name="tomtom_traffic"
        )
    
    def get_cache_key(self, params: TrafficQueryParams) -> str:
        """Generate a cache key for the given parameters"""
        return f"traffic:{params.lat}:{params.lon}:{params.radius}"
    
    def get_cache_ttl(self) -> int:
        """Traffic data TTL: 2 minutes (120 seconds)"""
        return 120
    
    @CircuitBreaker(failure_threshold=3, recovery_timeout=30, name="tomtom_health")
    async def health_check(self) -> bool:
        """Check if the TomTom Traffic API is responding correctly"""
        try:
            # Use a known location (e.g., downtown Seattle) for the health check
            test_params = TrafficQueryParams(lat=47.6062, lon=-122.3321, radius=500)
            params = {
                "point": f"{test_params.lat},{test_params.lon}",
                "unit": "MPH",
                "key": self.api_key
            }
            
            response = requests.get(self.flow_url, params=params, timeout=5)
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"TomTom Traffic health check failed: {str(e)}")
            return False
    
    @CircuitBreaker(failure_threshold=3, recovery_timeout=30, name="tomtom_fetch")
    async def fetch_data(self, params: TrafficQueryParams) -> TrafficResponse:
        """Fetch traffic data from TomTom API with caching"""
        # Check cache first
        cache_key = self.get_cache_key(params)
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            data = json.loads(cached_data)
            # Convert string timestamps back to datetime objects
            if "timestamp" in data:
                data["timestamp"] = datetime.fromisoformat(data["timestamp"])
            if "incidents" in data:
                for incident in data["incidents"]:
                    if "start_time" in incident and incident["start_time"]:
                        incident["start_time"] = datetime.fromisoformat(incident["start_time"])
                    if "end_time" in incident and incident["end_time"]:
                        incident["end_time"] = datetime.fromisoformat(incident["end_time"])
            
            # Add cached flag to indicate this is from cache
            data["cached"] = True
            return TrafficResponse(**data)
        
        # Fetch both flow and incident data in parallel (in a real implementation, we would use asyncio.gather)
        try:
            # Fetch flow data
            flow_response = await self._fetch_flow_data(params)
            
            # Fetch incident data
            incident_response = await self._fetch_incident_data(params)
            
            # Combine the results
            normalized_data = {
                "flow_segments": flow_response,
                "incidents": incident_response,
                "cached": False,
                "timestamp": datetime.now(),
                "source": "tomtom"
            }
            
            # Serialize datetime objects to ISO format for caching
            cache_data = normalized_data.copy()
            cache_data["timestamp"] = cache_data["timestamp"].isoformat()
            for incident in cache_data["incidents"]:
                if "start_time" in incident and incident["start_time"]:
                    incident["start_time"] = incident["start_time"].isoformat()
                if "end_time" in incident and incident["end_time"]:
                    incident["end_time"] = incident["end_time"].isoformat()
            
            # Cache the normalized data
            self.redis.setex(cache_key, self.get_cache_ttl(), json.dumps(cache_data))
            
            return TrafficResponse(**normalized_data)
            
        except Exception as e:
            logger.error(f"Error fetching traffic data: {str(e)}")
            return await self.handle_errors(e)
    
    async def _fetch_flow_data(self, params: TrafficQueryParams) -> List[TrafficFlowSegment]:
        """Helper method to fetch traffic flow data"""
        api_params = {
            "point": f"{params.lat},{params.lon}",
            "unit": "MPH",
            "openLr": "false",
            "key": self.api_key
        }
        
        response = requests.get(self.flow_url, params=api_params, timeout=10)
        response.raise_for_status()
        raw_data = response.json()
        
        flow_segments = []
        for segment in raw_data.get("flowSegmentData", {}).get("flowSegments", []):
            flow_segments.append(TrafficFlowSegment(
                id=segment.get("id", f"segment_{len(flow_segments)}"),
                current_speed=segment.get("currentSpeed", 0),
                free_flow_speed=segment.get("freeFlowSpeed", 0),
                current_travel_time=segment.get("currentTravelTime", 0),
                free_flow_travel_time=segment.get("freeFlowTravelTime", 0),
                confidence=segment.get("confidence", 0),
                road_closure=segment.get("roadClosure", False)
            ))
        
        return flow_segments
    
    async def _fetch_incident_data(self, params: TrafficQueryParams) -> List[TrafficIncident]:
        """Helper method to fetch traffic incident data"""
        api_params = {
            "bbox": f"{params.lat-0.1},{params.lon-0.1},{params.lat+0.1},{params.lon+0.1}",
            "fields": "{incidents{type,geometry,properties}}",
            "language": "en-US",
            "categoryFilter": "0,1,2,3,4,5,6,7,8,9,10,11",
            "key": self.api_key
        }
        
        response = requests.get(self.incidents_url, params=api_params, timeout=10)
        response.raise_for_status()
        raw_data = response.json()
        
        incidents = []
        for incident in raw_data.get("incidents", []):
            properties = incident.get("properties", {})
            
            # Convert timestamps if available
            start_time = None
            end_time = None
            if "startTime" in properties:
                try:
                    start_time = datetime.fromisoformat(properties["startTime"].replace("Z", "+00:00"))
                except:
                    pass
            if "endTime" in properties:
                try:
                    end_time = datetime.fromisoformat(properties["endTime"].replace("Z", "+00:00"))
                except:
                    pass
            
            incidents.append(TrafficIncident(
                id=properties.get("id", f"incident_{len(incidents)}"),
                type=properties.get("iconCategory", "unknown"),
                severity=properties.get("magnitudeOfDelay", 0),
                description=properties.get("description", ""),
                location={
                    "lat": incident.get("geometry", {}).get("coordinates", [0, 0])[1],
                    "lon": incident.get("geometry", {}).get("coordinates", [0, 0])[0]
                },
                start_time=start_time,
                end_time=end_time,
                affected_roads=properties.get("roadNumbers", [])
            ))
        
        return incidents
    
    async def handle_errors(self, error: Any) -> Optional[TrafficResponse]:
        """Handle API errors and provide fallback data if possible"""
        logger.error(f"Traffic API error: {str(error)}")
        
        # If circuit breaker is triggered, don't even try to get fallback data
        if isinstance(error, CircuitBreakerError):
            raise error
        
        # Try to get last cached data for any location as a very basic fallback
        try:
            fallback_data = self.redis.get("traffic:fallback")
            if fallback_data:
                data = json.loads(fallback_data)
                # Convert string timestamps back to datetime objects
                if "timestamp" in data:
                    data["timestamp"] = datetime.fromisoformat(data["timestamp"])
                if "incidents" in data:
                    for incident in data["incidents"]:
                        if "start_time" in incident and incident["start_time"]:
                            incident["start_time"] = datetime.fromisoformat(incident["start_time"])
                        if "end_time" in incident and incident["end_time"]:
                            incident["end_time"] = datetime.fromisoformat(incident["end_time"])
                
                data["cached"] = True
                data["source"] = "fallback"
                return TrafficResponse(**data)
        except Exception as fallback_error:
            logger.error(f"Error getting fallback traffic data: {str(fallback_error)}")
        
        # If no fallback is available, provide an empty response
        return TrafficResponse(
            flow_segments=[],
            incidents=[],
            source="default_fallback"
        )
