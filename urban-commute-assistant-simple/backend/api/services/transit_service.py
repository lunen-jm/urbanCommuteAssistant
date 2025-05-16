import requests
from datetime import datetime, timedelta
import sys
import os

# Add the parent directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

# Simple memory cache
cache = {}
cache_expiry = {}

def get_transit_data(lat, lon, radius=500):
    """
    Get transit data for a specific location and radius.
    
    Args:
        lat (float): Latitude
        lon (float): Longitude
        radius (int, optional): Radius in meters. Defaults to 500.
        
    Returns:
        dict: Transit data for the location
    """
    cache_key = f"transit_{lat}_{lon}_{radius}"
    
    # Check cache
    if cache_key in cache and cache_expiry.get(cache_key, datetime.min) > datetime.now():
        return cache[cache_key]
    
    # For this simplified version, we'll return mock data
    # In a real application, you would connect to transit APIs
    try:
        # Simulate a delay for realism
        import time
        time.sleep(0.5)
        
        # Mock transit data
        current_time = datetime.now()
        transit_data = {
            "stops": [
                {
                    "id": "1_10914",
                    "name": "Pike St & 3rd Ave",
                    "location": {"lat": lat + 0.001, "lon": lon - 0.001},
                    "routes": ["40", "62", "Link"]
                },
                {
                    "id": "1_10915",
                    "name": "Pike St & 5th Ave",
                    "location": {"lat": lat + 0.002, "lon": lon - 0.002},
                    "routes": ["10", "11", "49"]
                }
            ],
            "routes": [
                {"id": "40", "shortName": "40", "longName": "Downtown Seattle - Northgate", "type": "bus"},
                {"id": "62", "shortName": "62", "longName": "Downtown Seattle - Fremont", "type": "bus"},
                {"id": "Link", "shortName": "Link", "longName": "Light Rail", "type": "rail"}
            ],
            "arrivals": [
                {
                    "route": "40", 
                    "stop_id": "1_10914",
                    "arrival_time": (current_time + timedelta(minutes=5)).isoformat(), 
                    "status": "ON_TIME"
                },
                {
                    "route": "62", 
                    "stop_id": "1_10914",
                    "arrival_time": (current_time + timedelta(minutes=10)).isoformat(), 
                    "status": "DELAYED"
                },
                {
                    "route": "Link", 
                    "stop_id": "1_10915",
                    "arrival_time": (current_time + timedelta(minutes=8)).isoformat(), 
                    "status": "ON_TIME"
                }
            ],
            "timestamp": current_time.isoformat(),
            "source": "mock_data"
        }
        
        # Cache the result for 2 minutes
        cache[cache_key] = transit_data
        cache_expiry[cache_key] = current_time + timedelta(minutes=2)
        
        return transit_data
    
    except Exception as e:
        print(f"Error generating transit data: {e}")
        return {"error": str(e)}
