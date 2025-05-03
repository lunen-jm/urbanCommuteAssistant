## Open WeatherMap

Limiting to 1000 calls for Open Weather Map

Implementation Approaches:

1. Aggressive Caching
    * Cache weather data for longer periods (3-6 hours) since weather doesn't change that frequently
    * Store data in Redis with appropriate TTL values
2. Request Consolidation
    * Batch weather requests for multiple locations when possible
    * Update all user locations in periodic batches rather than individual requests
3. Rate Limiting
    * Implement a token bucket system to control API call frequency
    * Track daily usage and adjust caching strategy dynamically
4. Call Budgeting
    * Set a daily budget (e.g., 900 calls to allow buffer)
    * Distribute this budget across hours (e.g., ~37 calls per hour)

### Code Example:

```
import time
import redis
import requests
from datetime import datetime
from app.core.config import settings

class WeatherService:
    def __init__(self):
        self.api_key = settings.WEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
        self.redis = redis.from_url(settings.REDIS_URL)
        self.daily_limit = 900  # Conservative limit (below 1000)
        
    def get_weather_data(self, lat, lon):
        """Get weather data with caching and rate limiting"""
        cache_key = f"weather:{lat}:{lon}"
        
        # Check cache first
        cached_data = self.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        # Check if we've exceeded our daily limit
        current_date = datetime.now().strftime("%Y-%m-%d")
        counter_key = f"weather_api_counter:{current_date}"
        
        # Get current count or set to 0 if not exists
        daily_count = int(self.redis.get(counter_key) or 0)
        
        if daily_count >= self.daily_limit:
            # Return last cached data or default values if limit reached
            fallback_data = self.get_fallback_weather(lat, lon)
            return fallback_data
        
        # Make API request
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric"
        }
        
        response = requests.get(self.base_url, params=params)
        if response.status_code == 200:
            data = response.json()
            
            # Cache for 3 hours (weather doesn't change that frequently)
            self.redis.setex(cache_key, 3 * 60 * 60, json.dumps(data))
            
            # Increment counter and set 24hr expiration if it's new
            pipe = self.redis.pipeline()
            pipe.incr(counter_key)
            pipe.expire(counter_key, 24 * 60 * 60)
            pipe.execute()
            
            return data
        else:
            # Handle error
            return {"error": f"API error: {response.status_code}"}
    
    def get_fallback_weather(self, lat, lon):
        """Get the last known weather data or provide defaults"""
        cache_key = f"weather:{lat}:{lon}"
        last_data = self.redis.get(cache_key)
        
        if last_data:
            data = json.loads(last_data)
            # Flag that this is cached data
            data['cached'] = True
            return data
        
        # Return minimal default data
        return {
            "main": {"temp": None, "humidity": None},
            "weather": [{"main": "Unknown", "description": "Data unavailable"}],
            "cached": True,
            "limited": True
        }
```