from fastapi import APIRouter, HTTPException, Query
import requests
from typing import Optional
from app.core.config import settings
import redis
import json
from datetime import datetime

router = APIRouter()

class TomTomTrafficService:
    def __init__(self):
        self.api_key = settings.TRAFFIC_API_KEY
        self.base_url = "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        self.incidents_url = "https://api.tomtom.com/traffic/services/5/incidentDetails"
        self.redis = redis.from_url(settings.REDIS_URL)
        
    def get_traffic_flow(self, lat, lon, radius=1000):
        """Get traffic flow data for a specific location"""
        cache_key = f"traffic_flow:{lat}:{lon}:{radius}"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
            
        params = {
            "point": f"{lat},{lon}",
            "unit": "MPH",
            "openLr": "false",
            "key": self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Cache for 5 minutes
            self.redis.setex(cache_key, 5 * 60, json.dumps(data))
            return data
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_traffic_incidents(self, lat, lon, radius=5000):
        """Get traffic incidents around a location"""
        cache_key = f"traffic_incidents:{lat}:{lon}:{radius}"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
            
        params = {
            "bbox": f"{lon-0.1},{lat-0.1},{lon+0.1},{lat+0.1}",
            "fields": "{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory}}}}", 
            "language": "en-US",
            "categoryFilter": "0,1,2,3,4,5,6,7,8,9,10,11",
            "timeValidityFilter": "present",
            "key": self.api_key
        }
        
        try:
            response = requests.get(f"{self.incidents_url}/s2/json", params=params)
            response.raise_for_status()
            data = response.json()
            
            # Cache for 5 minutes
            self.redis.setex(cache_key, 5 * 60, json.dumps(data))
            return data
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/traffic/flow")
async def get_traffic_flow(lat: float, lon: float, radius: Optional[int] = Query(1000)):
    """Get traffic flow data for a specific location"""
    service = TomTomTrafficService()
    return service.get_traffic_flow(lat, lon, radius)

@router.get("/traffic/incidents")
async def get_traffic_incidents(lat: float, lon: float, radius: Optional[int] = Query(5000)):
    """Get traffic incidents around a location"""
    service = TomTomTrafficService()
    return service.get_traffic_incidents(lat, lon, radius)

# Legacy endpoint - keeping for backward compatibility
@router.get("/traffic")
async def get_traffic_data(location: str):
    """Legacy endpoint that accepts a location name"""
    try:
        # Rough geocoding - in production, use a proper geocoding service
        coordinates = {
            "seattle": {"lat": 47.6062, "lon": -122.3321},
            "downtown": {"lat": 47.6050, "lon": -122.3344},
            "university": {"lat": 47.6553, "lon": -122.3035},
            "ballard": {"lat": 47.6668, "lon": -122.3843}
        }
        
        # Default to Seattle if location not found
        location_data = coordinates.get(location.lower(), {"lat": 47.6062, "lon": -122.3321})
        
        service = TomTomTrafficService()
        flow_data = service.get_traffic_flow(location_data["lat"], location_data["lon"])
        incidents_data = service.get_traffic_incidents(location_data["lat"], location_data["lon"])
        
        return {
            "location": location,
            "coordinates": location_data,
            "flow": flow_data,
            "incidents": incidents_data
        }
    except Exception as e:
        return {"error": f"Unable to fetch traffic data: {str(e)}"}