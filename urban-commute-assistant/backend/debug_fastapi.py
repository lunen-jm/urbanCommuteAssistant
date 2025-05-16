"""
Simple FastAPI server for API integration testing
"""

import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Urban Commute Debug API",
    description="Debug API for testing external integrations",
    version="0.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Urban Commute Debug API is running"}

@app.get("/health")
async def health_check():
    """
    Check API keys and connectivity to external services
    """
    # Debug environment variables
    weather_api_key = os.getenv("WEATHER_API_KEY")
    traffic_api_key = os.getenv("TRAFFIC_API_KEY")
    kc_metro_gtfs_url = os.getenv("KC_METRO_GTFS_URL")
    
    logger.info(f"WEATHER_API_KEY: {'*' * 5 + weather_api_key[-4:] if weather_api_key else 'Not set'}")
    logger.info(f"TRAFFIC_API_KEY: {'*' * 5 + traffic_api_key[-4:] if traffic_api_key else 'Not set'}")
    logger.info(f"KC_METRO_GTFS_URL: {kc_metro_gtfs_url or 'Not set'}")
    
    # Weather API health check
    weather_health = False
    if weather_api_key:
        try:
            params = {
                "lat": 47.6062,
                "lon": -122.3321,
                "units": "metric",
                "appid": weather_api_key
            }
            response = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params, timeout=5)
            weather_health = response.status_code == 200
            if weather_health:
                logger.info(f"Weather API is operational: {response.status_code}")
            else:
                logger.error(f"Weather API returned error: {response.status_code}")
        except Exception as e:
            logger.error(f"Weather API health check failed: {str(e)}")
    
    # Traffic API health check
    traffic_health = False
    if traffic_api_key:
        try:
            base_url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
            params = {
                "point": "47.608013,-122.335167",
                "unit": "MPH",
                "key": traffic_api_key
            }
            response = requests.get(base_url, params=params, timeout=5)
            traffic_health = response.status_code == 200
            if traffic_health:
                logger.info(f"Traffic API is operational: {response.status_code}")
            else:
                logger.error(f"Traffic API returned error: {response.status_code}")
        except Exception as e:
            logger.error(f"Traffic API health check failed: {str(e)}")
    
    # Transit API health check
    transit_health = False
    if kc_metro_gtfs_url:
        try:
            response = requests.head(kc_metro_gtfs_url, timeout=5)
            transit_health = response.status_code == 200
            if transit_health:
                logger.info(f"Transit API is operational: {response.status_code}")
            else:
                logger.error(f"Transit API returned error: {response.status_code}")
        except Exception as e:
            logger.error(f"Transit API health check failed: {str(e)}")
    
    # Construct response
    return {
        "weather_api": {
            "key_configured": bool(weather_api_key and len(weather_api_key) > 10),
            "health": weather_health
        },
        "traffic_api": {
            "key_configured": bool(traffic_api_key and len(traffic_api_key) > 10),
            "health": traffic_health
        },
        "transit_api": {
            "key_configured": bool(kc_metro_gtfs_url and kc_metro_gtfs_url.endswith(".zip")),
            "health": transit_health
        }    }

@app.get("/weather")
async def get_weather():
    """
    Get real-time weather data for Seattle from OpenWeatherMap API
    """
    weather_api_key = os.getenv("WEATHER_API_KEY")
    
    if not weather_api_key:
        return {"error": "Weather API key not configured"}
    
    try:
        params = {
            "lat": 47.6062,
            "lon": -122.3321,
            "units": "metric",
            "appid": weather_api_key
        }
        
        response = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"Received weather data: {json.dumps(data, indent=2)}")
        
        return {
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "description": data["weather"][0]["description"] if "weather" in data and len(data["weather"]) > 0 else "",
            "icon": data["weather"][0]["icon"] if "weather" in data and len(data["weather"]) > 0 else "",
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind_speed": data["wind"]["speed"],
            "wind_direction": data["wind"]["deg"],
            "clouds": data["clouds"]["all"] if "clouds" in data else None,
            "timestamp": data["dt"],
            "city": data["name"],
            "source": "openweathermap"
        }
    except Exception as e:
        logger.error(f"Error fetching weather data: {str(e)}")        return {"error": f"Failed to fetch weather data: {str(e)}"}

@app.get("/traffic")
async def get_traffic():
    """
    Get real-time traffic data for Seattle from TomTom Traffic API
    """
    traffic_api_key = os.getenv("TRAFFIC_API_KEY")
    
    if not traffic_api_key:
        return {"error": "Traffic API key not configured"}
    
    try:
        base_url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        params = {
            "point": "47.608013,-122.335167",
            "unit": "MPH",
            "key": traffic_api_key
        }
        
        response = requests.get(base_url, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"Received traffic data: {json.dumps(data, indent=2)}")
        
        flow_data = data["flowSegmentData"]
        
        return {
            "current_speed": flow_data.get("currentSpeed", 0),
            "free_flow_speed": flow_data.get("freeFlowSpeed", 0),
            "current_travel_time": flow_data.get("currentTravelTime", 0),
            "free_flow_travel_time": flow_data.get("freeFlowTravelTime", 0),
            "confidence": flow_data.get("confidence", 0),
            "road_closure": flow_data.get("roadClosure", False),
            "timestamp": data.get("timestamp", ""),
            "source": "tomtom"
        }
    except Exception as e:
        logger.error(f"Error fetching traffic data: {str(e)}")
        return {"error": f"Failed to fetch traffic data: {str(e)}"}

# Run the server directly if script is executed
if __name__ == "__main__":
    import uvicorn
    print("Starting debug API server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
