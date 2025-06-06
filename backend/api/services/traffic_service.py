import requests
from datetime import datetime, timedelta
import sys
import os
import json
from math import cos, radians

# Add the parent directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

# Simple memory cache
cache = {}
cache_expiry = {}

def get_traffic_data(lat, lon, radius=5000):
    """
    Get traffic data for a specific location and radius.
    
    Args:
        lat (float): Latitude
        lon (float): Longitude
        radius (int, optional): Radius in meters. Defaults to 5000.
        
    Returns:
        dict: Traffic data for the location
    """
    cache_key = f"traffic_{lat}_{lon}_{radius}"
    
    # Check cache
    if cache_key in cache and cache_expiry.get(cache_key, datetime.min) > datetime.now():
        return cache[cache_key]
    
    # Calculate bounding box - convert radius to approximate degrees
    # Approximately 111,111 meters per degree at the equator for latitude
    # Longitude degrees vary based on latitude (less distance at higher latitudes)
    lat_offset = radius / 111111
    # Adjust for the Earth's curvature at the given latitude
    lon_offset = radius / (111111 * abs(cos(radians(lat))) if lat != 90 and lat != -90 else 1)
    
    min_lat = lat - lat_offset
    max_lat = lat + lat_offset
    min_lon = lon - lon_offset
    max_lon = lon + lon_offset

    # Call TomTom API v5 for traffic incidents (updated version)
    url = f"https://api.tomtom.com/traffic/services/5/incidentDetails"
    params = {
        "key": settings.TRAFFIC_API_KEY,
        "bbox": f"{min_lon},{min_lat},{max_lon},{max_lat}",
        "fields": "{incidents{type,geometry{type,coordinates},properties{id,iconCategory,events{description,code,iconCategory},startTime,endTime,from,to}}}",
        "language": "en-US",
        "timeValidityFilter": "present"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
          # Process the data with the new structure from v5 API
        incidents = []
        if "incidents" in data:
            for incident in data["incidents"]:
                try:
                    properties = incident.get("properties", {})
                    events = properties.get("events", [])
                    geometry = incident.get("geometry", {})
                    
                    # Get description from events if available
                    description = ""
                    event_type = ""
                    if events and len(events) > 0:
                        description = events[0].get("description", "")
                        event_type = str(events[0].get("code", ""))
                    
                    # Extract coordinates from geometry if available
                    coords_lat, coords_lon = lat, lon  # Default to search center
                    if geometry and geometry.get("type") == "Point" and len(geometry.get("coordinates", [])) >= 2:
                        # Point geometry: [lon, lat]
                        coords_lon, coords_lat = geometry["coordinates"][0], geometry["coordinates"][1]
                    elif geometry and geometry.get("type") == "LineString" and len(geometry.get("coordinates", [])) > 0:
                        # LineString geometry: Take the first point [lon, lat]
                        coords_lon, coords_lat = geometry["coordinates"][0][0], geometry["coordinates"][0][1]
                    
                    incident_data = {
                        "id": properties.get("id", f"incident-{len(incidents)}"),
                        "type": event_type,
                        "severity": properties.get("magnitudeOfDelay", 0),
                        "description": description,
                        "location": {
                            "lat": coords_lat,
                            "lon": coords_lon
                        },
                        "start_time": properties.get("startTime", ""),
                        "end_time": properties.get("endTime", ""),
                        "delay": properties.get("delay", 0)
                    }
                    incidents.append(incident_data)
                except Exception as e:
                    print(f"Error processing incident: {e}")
                    continue
                    continue
        
        # Fallback response if no incidents are found
        if not incidents:
            incidents = []
        
        traffic_data = {
            "incidents": incidents,
            "count": len(incidents),
            "timestamp": datetime.now().isoformat(),
            "source": "tomtom"
        }
        
        # Cache the result for 5 minutes
        cache[cache_key] = traffic_data
        cache_expiry[cache_key] = datetime.now() + timedelta(minutes=5)
        
        return traffic_data
    
    except requests.exceptions.RequestException as e:
        print(f"Network error fetching traffic data: {e}")
        return {"error": f"Network error: {str(e)}"}
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return {"error": f"Invalid response from traffic service: {str(e)}"}
    except Exception as e:
        print(f"Unexpected error fetching traffic data: {e}")
        return {"error": f"Unexpected error: {str(e)}"}
