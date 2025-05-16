import requests
import logging
from typing import Optional, Dict, Any, List
import redis
import json
import zipfile
from io import BytesIO
from datetime import datetime
from pydantic import BaseModel, Field

from app.core.config import Config
from app.api.integrations.base import DataSourceAdapter
from app.services.circuit_breaker import CircuitBreaker, CircuitBreakerError
from app.schemas.transit import TransitRoute, TransitStop, TripUpdate, VehiclePosition, ServiceAlert, StopTimeUpdate

logger = logging.getLogger(__name__)

class TransitQueryParams(BaseModel):
    location: str = Field(..., description="Location code or name (e.g., 'seattle', 'king-county', or latitude,longitude)")
    route_id: Optional[str] = Field(None, description="Filter results by route ID")
    stop_id: Optional[str] = Field(None, description="Filter results by stop ID")
    include_realtime: bool = Field(True, description="Whether to include real-time data")
    
    def get_coordinates(self):
        """Extract latitude and longitude if location is in coordinate format"""
        if ',' in self.location:
            try:
                lat, lon = self.location.split(',')
                return float(lat), float(lon)
            except ValueError:
                return None, None
        return None, None

class TransitResponse(BaseModel):
    routes: List[TransitRoute] = []
    stops: List[TransitStop] = []
    trip_updates: List[TripUpdate] = []
    vehicle_positions: List[VehiclePosition] = []
    service_alerts: List[ServiceAlert] = []
    cached: bool = False
    timestamp: datetime = Field(default_factory=datetime.now)
    source: str = "king_county_metro"

class KingCountyMetroAdapter(DataSourceAdapter[TransitQueryParams, TransitResponse, TransitResponse]):
    """
    Adapter for King County Metro transit data
    """
    def __init__(self):
        self.gtfs_url = Config.KC_METRO_GTFS_URL
        self.gtfs_rt_url = Config.KC_METRO_GTFS_RT_URL
        self.redis = redis.from_url(Config.REDIS_URL)
        
        # Feed URLs - these will be constructed from the base URL if needed
        # for the actual data fetching implementation
        
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=3,
            recovery_timeout=300,  # Transit data is less time-sensitive
            name="king_county_metro"
        )
    
    def get_cache_key(self, params: TransitQueryParams) -> str:
        """Generate a cache key for the given parameters"""
        key_parts = [
            "transit",
            params.location,
        ]
        
        if params.route_id:
            key_parts.append(f"route:{params.route_id}")
        
        if params.stop_id:
            key_parts.append(f"stop:{params.stop_id}")
            
        return ":".join(key_parts)
    
    def get_cache_ttl(self) -> int:
        """
        Transit schedule data TTL: 24 hours (86400 seconds)
        Real-time data has a much shorter TTL, handled separately
        """
        return 86400
    
    def get_realtime_cache_ttl(self) -> int:
        """Real-time transit data TTL: 1 minute (60 seconds)"""
        return 60
    
    @CircuitBreaker(failure_threshold=3, recovery_timeout=300, name="kcmetro_health")
    async def health_check(self) -> bool:
        """Check if the King County Metro data sources are responding correctly"""
        try:
            # Check static GTFS data
            response = requests.head(self.gtfs_url, timeout=5)
            response.raise_for_status()
            
            # Success
            return True
        except Exception as e:
            logger.error(f"King County Metro health check failed: {str(e)}")
            return False
    
    @CircuitBreaker(failure_threshold=3, recovery_timeout=300, name="kcmetro_fetch")
    async def fetch_data(self, params: TransitQueryParams) -> TransitResponse:
        """Fetch transit data from King County Metro with caching"""
        # Extract coordinates if provided in the location parameter
        lat, lon = params.get_coordinates()
        
        # Check cache first
        cache_key = self.get_cache_key(params)
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            data = json.loads(cached_data)
            # Add cached flag to indicate this is from cache
            data["cached"] = True
            return TransitResponse(**data)
        
        # For now, return a minimal response
        # In a real implementation, you would fetch and parse GTFS data here
        response = TransitResponse(
            routes=[],
            stops=[],
            trip_updates=[],
            vehicle_positions=[],
            service_alerts=[],
            cached=False,
            source="king_county_metro"
        )
        
        # Cache the response
        self.redis.setex(
            cache_key, 
            self.get_cache_ttl(), 
            json.dumps(response.dict())
        )
        
        return response
    
    async def handle_errors(self, error: Exception) -> TransitResponse:
        """Handle API errors and provide fallback data if possible"""
        logger.error(f"Transit API error: {str(error)}")
        
        # If circuit breaker is triggered, don't even try to get fallback data
        if isinstance(error, CircuitBreakerError):
            raise error
        
        # Return minimal fallback data
        return TransitResponse(
            routes=[],
            stops=[],
            trip_updates=[],
            vehicle_positions=[],
            service_alerts=[
                ServiceAlert(
                    id="fallback-1",
                    effect="NO_SERVICE",
                    header="Transit information temporarily unavailable",
                    description="There was an error retrieving transit data. Please try again later.",
                    cause="UNKNOWN_CAUSE"
                )
            ],
            cached=False,
            source="fallback"
        )
