import requests
from datetime import datetime, timedelta
import json
import os
import sys

# Add the parent directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

# Simple memory cache
cache = {}
cache_expiry = {}

def get_weather_data(lat, lon):
    """
    Get weather data for a specific location.
    
    Args:
        lat (float): Latitude
        lon (float): Longitude
        
    Returns:
        dict: Weather data for the location
    """
    cache_key = f"weather_{lat}_{lon}"
    
    # Check cache
    if cache_key in cache and cache_expiry.get(cache_key, datetime.min) > datetime.now():
        return cache[cache_key]
    
    # Call OpenWeatherMap API
    url = f"https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.WEATHER_API_KEY,
        "units": "imperial"  # Use imperial units for US (Fahrenheit)
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        # Process the data into a simpler format
        weather_data = {
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "conditions": {
                "humidity": data["main"]["humidity"],
                "wind_speed": data["wind"]["speed"],
                "wind_direction": data["wind"]["deg"],
                "pressure": data["main"]["pressure"]
            },
            "location": {
                "name": data["name"],
                "country": data["sys"]["country"]
            },
            "timestamp": datetime.now().isoformat(),
            "source": "openweathermap"
        }
        
        # Cache the result for 15 minutes
        cache[cache_key] = weather_data
        cache_expiry[cache_key] = datetime.now() + timedelta(minutes=15)
        
        return weather_data
    
    except Exception as e:
        print(f"Error fetching weather data: {e}")
        return {"error": str(e)}
