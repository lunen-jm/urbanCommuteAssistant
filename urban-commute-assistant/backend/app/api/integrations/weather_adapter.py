import requests
import logging
from typing import Optional, Dict, Any
import redis
import json
import time
from datetime import datetime

from pydantic import BaseModel, Field
from app.core.config import Config
from app.api.integrations.base import DataSourceAdapter
from app.services.circuit_breaker import CircuitBreaker, CircuitBreakerError

logger = logging.getLogger(__name__)

class WeatherQueryParams(BaseModel):
    lat: float = Field(..., description="Latitude coordinate")
    lon: float = Field(..., description="Longitude coordinate")
    units: str = Field("metric", description="Units of measurement (metric, imperial, standard)")

class WeatherResponse(BaseModel):
    temperature: float
    description: str
    humidity: int
    wind_speed: float
    feels_like: Optional[float] = None
    pressure: Optional[int] = None
    clouds: Optional[int] = None
    rain: Optional[float] = None
    snow: Optional[float] = None
    dt: Optional[int] = None
    cached: Optional[bool] = None
    source: str = "openweathermap"

class OpenWeatherMapAdapter(DataSourceAdapter[WeatherQueryParams, WeatherResponse, WeatherResponse]):
    """
    Adapter for OpenWeatherMap API
    """
    def __init__(self):
        self.api_key = Config.WEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
        self.redis = redis.from_url(Config.REDIS_URL)
        self.daily_limit = 900  # Conservative limit (below the free tier 1000 calls/day)
        self.calls_today = 0
        self.circuit_breaker = CircuitBreaker(
            failure_threshold=3,
            recovery_timeout=60,
            name="openweathermap"
        )
    
    def get_cache_key(self, params: WeatherQueryParams) -> str:
        """Generate a cache key for the given parameters"""
        return f"weather:{params.lat}:{params.lon}:{params.units}"
    
    def get_cache_ttl(self) -> int:
        """Weather data TTL: 30 minutes (1800 seconds)"""
        return 1800
    
    @CircuitBreaker(failure_threshold=3, recovery_timeout=60, name="openweathermap_health")
    async def health_check(self) -> bool:
        """Check if the OpenWeatherMap API is responding correctly"""
        try:
            # Use a known location (e.g., Seattle) for the health check
            test_params = WeatherQueryParams(lat=47.6062, lon=-122.3321, units="metric")
            params = {
                "lat": test_params.lat,
                "lon": test_params.lon,
                "units": test_params.units,
                "appid": self.api_key
            }
            
            response = requests.get(self.base_url, params=params, timeout=5)
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"OpenWeatherMap health check failed: {str(e)}")
            return False
    
    @CircuitBreaker(failure_threshold=3, recovery_timeout=60, name="openweathermap_fetch")
    async def fetch_data(self, params: WeatherQueryParams) -> WeatherResponse:
        """Fetch weather data from OpenWeatherMap API with caching and rate limiting"""
        # Check cache first
        cache_key = self.get_cache_key(params)
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            data = json.loads(cached_data)
            # Add cached flag to indicate this is from cache
            data["cached"] = True
            return WeatherResponse(**data)
        
        # Check rate limit before making the API call
        if self.calls_today >= self.daily_limit:
            logger.warning("OpenWeatherMap daily rate limit reached")
            raise Exception("Daily rate limit reached")
        
        # Make API call
        try:
            api_params = {
                "lat": params.lat,
                "lon": params.lon,
                "units": params.units,
                "appid": self.api_key
            }
            
            response = requests.get(self.base_url, params=api_params, timeout=10)
            response.raise_for_status()
            raw_data = response.json()
            
            # Increment counter
            self.calls_today += 1
            
            # Transform the response to our model
            normalized_data = {
                "temperature": raw_data["main"]["temp"],
                "description": raw_data["weather"][0]["description"] if raw_data.get("weather") else "Unknown",
                "humidity": raw_data["main"]["humidity"],
                "wind_speed": raw_data["wind"]["speed"],
                "feels_like": raw_data["main"].get("feels_like"),
                "pressure": raw_data["main"].get("pressure"),
                "clouds": raw_data.get("clouds", {}).get("all"),
                "rain": raw_data.get("rain", {}).get("1h", 0) if "rain" in raw_data else 0,
                "snow": raw_data.get("snow", {}).get("1h", 0) if "snow" in raw_data else 0,
                "dt": raw_data.get("dt"),
                "cached": False,
                "source": "openweathermap"
            }
            
            # Cache the normalized data
            self.redis.setex(cache_key, self.get_cache_ttl(), json.dumps(normalized_data))
            
            return WeatherResponse(**normalized_data)
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            return await self.handle_errors(e)
    
    async def handle_errors(self, error: Any) -> Optional[WeatherResponse]:
        """Handle API errors and provide fallback data if possible"""
        logger.error(f"Weather API error: {str(error)}")
        
        # If circuit breaker is triggered, don't even try to get fallback data
        if isinstance(error, CircuitBreakerError):
            raise error
        
        # Try to get last cached data for any location as a very basic fallback
        try:
            fallback_data = self.redis.get("weather:fallback")
            if fallback_data:
                data = json.loads(fallback_data)
                data["cached"] = True
                data["source"] = "fallback"
                return WeatherResponse(**data)
        except Exception as fallback_error:
            logger.error(f"Error getting fallback weather data: {str(fallback_error)}")
        
        # If no fallback is available, provide a minimal default response
        return WeatherResponse(
            temperature=20.0,
            description="Information temporarily unavailable",
            humidity=50,
            wind_speed=0.0,
            source="default_fallback"
        )
