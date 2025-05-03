from fastapi import APIRouter, HTTPException, Query
import requests
from pydantic import BaseModel
from typing import Optional, List
from app.core.config import Config
import redis
import json
import time
from datetime import datetime

router = APIRouter()

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

class WeatherForecastItem(BaseModel):
    dt: int
    temperature: float
    description: str
    humidity: int
    wind_speed: float
    feels_like: Optional[float] = None
    pressure: Optional[int] = None
    clouds: Optional[int] = None
    rain: Optional[float] = None
    snow: Optional[float] = None
    
class WeatherService:
    def __init__(self):
        self.api_key = Config.WEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.redis = redis.from_url(Config.REDIS_URL)
        self.daily_limit = 900  # Conservative limit (below 1000)
        
    def get_weather_data(self, lat, lon):
        """Get current weather data with caching and rate limiting"""
        cache_key = f"weather:{lat}:{lon}"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            data = json.loads(cached_data)
            data['cached'] = True
            return data
        
        # Check if we've exceeded our daily limit
        current_date = datetime.now().strftime("%Y-%m-%d")
        counter_key = f"weather_api_counter:{current_date}"
        
        # Get current count or set to 0 if not exists
        daily_count = int(self.redis.get(counter_key) or 0)
        
        if daily_count >= self.daily_limit:
            # Return fallback data if limit reached
            return self.get_fallback_weather(lat, lon)
        
        # Make API request
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric"
        }
        
        try:
            response = requests.get(f"{self.base_url}/weather", params=params)
            response.raise_for_status()
            data = response.json()
            
            # Transform to our format
            weather_data = {
                "temperature": data["main"]["temp"],
                "description": data["weather"][0]["description"],
                "humidity": data["main"]["humidity"],
                "wind_speed": data["wind"]["speed"],
                "feels_like": data["main"]["feels_like"],
                "pressure": data["main"]["pressure"],
                "clouds": data["clouds"]["all"] if "clouds" in data else None,
                "rain": data["rain"]["1h"] if "rain" in data and "1h" in data["rain"] else None,
                "snow": data["snow"]["1h"] if "snow" in data and "1h" in data["snow"] else None,
                "dt": data["dt"],
                "cached": False
            }
            
            # Cache for 30 minutes (weather doesn't change that frequently)
            self.redis.setex(cache_key, 30 * 60, json.dumps(weather_data))
            
            # Increment counter and set 24hr expiration if it's new
            pipe = self.redis.pipeline()
            pipe.incr(counter_key)
            pipe.expire(counter_key, 24 * 60 * 60)
            pipe.execute()
            
            return weather_data
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_weather_forecast(self, lat, lon):
        """Get 5-day forecast with caching and rate limiting"""
        cache_key = f"weather_forecast:{lat}:{lon}"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        
        # Check if we've exceeded our daily limit
        current_date = datetime.now().strftime("%Y-%m-%d")
        counter_key = f"weather_api_counter:{current_date}"
        
        # Get current count or set to 0 if not exists
        daily_count = int(self.redis.get(counter_key) or 0)
        
        if daily_count >= self.daily_limit:
            # Return empty data if limit reached
            return []
        
        # Make API request
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric"
        }
        
        try:
            response = requests.get(f"{self.base_url}/forecast", params=params)
            response.raise_for_status()
            data = response.json()
            
            # Transform to our format
            forecast_data = []
            for item in data["list"]:
                forecast_item = {
                    "dt": item["dt"],
                    "temperature": item["main"]["temp"],
                    "description": item["weather"][0]["description"],
                    "humidity": item["main"]["humidity"],
                    "wind_speed": item["wind"]["speed"],
                    "feels_like": item["main"]["feels_like"],
                    "pressure": item["main"]["pressure"],
                    "clouds": item["clouds"]["all"] if "clouds" in item else None,
                    "rain": item["rain"]["3h"] if "rain" in item and "3h" in item["rain"] else None,
                    "snow": item["snow"]["3h"] if "snow" in item and "3h" in item["snow"] else None
                }
                forecast_data.append(forecast_item)
            
            # Cache for 1 hour
            self.redis.setex(cache_key, 60 * 60, json.dumps(forecast_data))
            
            # Increment counter and set 24hr expiration if it's new
            pipe = self.redis.pipeline()
            pipe.incr(counter_key)
            pipe.expire(counter_key, 24 * 60 * 60)
            pipe.execute()
            
            return forecast_data
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_fallback_weather(self, lat, lon):
        """Get the last known weather data or provide defaults"""
        cache_key = f"weather:{lat}:{lon}"
        last_data = self.redis.get(cache_key)
        
        if last_data:
            data = json.loads(last_data)
            # Flag that this is cached data
            data['cached'] = True
            return data
        
        # Return minimal default data if no cache available
        return {
            "temperature": None,
            "description": "Data unavailable due to API limits",
            "humidity": None,
            "wind_speed": None,
            "feels_like": None,
            "cached": True,
            "limited": True
        }

@router.get("/weather/current", response_model=WeatherResponse)
async def get_current_weather(lat: float, lon: float):
    """Get current weather for a specific location by coordinates"""
    service = WeatherService()
    return service.get_weather_data(lat, lon)

@router.get("/weather/forecast", response_model=List[WeatherForecastItem])
async def get_weather_forecast(lat: float, lon: float):
    """Get 5-day forecast for a specific location"""
    service = WeatherService()
    return service.get_weather_forecast(lat, lon)

# Legacy endpoint - keeping for backward compatibility
@router.get("/weather/{location}", response_model=WeatherResponse)
async def get_weather(location: str):
    """Legacy endpoint that accepts a location name"""
    # Simple mapping of locations to coordinates - in production use a geocoding service
    coordinates = {
        "seattle": {"lat": 47.6062, "lon": -122.3321},
        "downtown": {"lat": 47.6050, "lon": -122.3344},
        "university": {"lat": 47.6553, "lon": -122.3035},
        "ballard": {"lat": 47.6668, "lon": -122.3843}
    }
    
    # Default to Seattle if location not found
    location_data = coordinates.get(location.lower(), {"lat": 47.6062, "lon": -122.3321})
    
    service = WeatherService()
    return service.get_weather_data(location_data["lat"], location_data["lon"])