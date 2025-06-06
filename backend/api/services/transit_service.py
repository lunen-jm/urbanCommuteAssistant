import requests
from datetime import datetime, timedelta
import sys
import os
import math

# Add the parent directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

# Simple memory cache
cache = {}
cache_expiry = {}

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in meters using Haversine formula."""
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lon / 2) * math.sin(delta_lon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def get_fallback_transit_data(lat, lon):
    """Generate realistic fallback transit data for Seattle area."""
    # Common Seattle transit stops and routes
    seattle_stops = [
        {
            "id": "1_75403",
            "name": "3rd Ave & Pine St",
            "lat": 47.6109,
            "lon": -122.3378,
            "routes": ["1", "2", "13", "D Line"]
        },
        {
            "id": "1_75414", 
            "name": "2nd Ave & Pike St",
            "lat": 47.6097,
            "lon": -122.3384,
            "routes": ["10", "11", "14", "49"]
        },
        {
            "id": "1_570",
            "name": "Capitol Hill Station",
            "lat": 47.6194,
            "lon": -122.3206,
            "routes": ["Link Light Rail", "8", "43", "49"]
        },
        {
            "id": "1_99603",
            "name": "University District Station", 
            "lat": 47.6613,
            "lon": -122.3132,
            "routes": ["Link Light Rail", "45", "67", "372"]
        }
    ]
    
    # Find closest stops within reasonable distance
    nearby_stops = []
    for stop in seattle_stops:
        distance = calculate_distance(lat, lon, stop["lat"], stop["lon"])
        if distance <= 2000:  # Within 2km
            nearby_stops.append({
                **stop,
                "distance": distance
            })
    
    # Sort by distance
    nearby_stops.sort(key=lambda x: x["distance"])
    return nearby_stops[:3]  # Return top 3 closest

def get_king_county_metro_stops(lat, lon, radius):
    """Get nearby transit stops from King County Metro API with fallback."""
    try:
        # King County Metro GTFS-RT API endpoints
        # Using OneBusAway API which serves King County Metro data
        base_url = "https://api.pugetsound.onebusaway.org/api/where"
          # Get stops near location
        stops_url = f"{base_url}/stops-for-location.json"
        params = {
            'lat': lat,
            'lon': lon,
            'radius': radius,
            'key': 'TEST'  # OneBusAway allows TEST key for development
        }
        
        response = requests.get(stops_url, params=params, timeout=5)
        print(f"OneBusAway API response status: {response.status_code}")
        
        if response.status_code == 429:
            print("Rate limited - using fallback data")
            return get_fallback_transit_data(lat, lon)
        
        if response.status_code != 200:
            print(f"API request failed with status {response.status_code} - using fallback")
            return get_fallback_transit_data(lat, lon)
            
        data = response.json()
        print(f"API response code: {data.get('code')}")
        
        if data.get('code') != 200:
            print(f"API returned error code: {data.get('code')}")
            return None
            
        stops_data = []
        routes_data = []
        route_ids_seen = set()
        
        # Process stops
        for stop in data.get('data', {}).get('list', []):
            stop_id = stop.get('id', '')
            stop_name = stop.get('name', 'Transit Stop')
            stop_lat = stop.get('lat', lat)
            stop_lon = stop.get('lon', lon)
            
            # Get route information for this stop
            stop_routes = []
            for route_id in stop.get('routeIds', []):
                if route_id not in route_ids_seen:
                    route_ids_seen.add(route_id)
                stop_routes.append(route_id)
            
            stops_data.append({
                "id": stop_id,
                "name": stop_name,
                "location": {"lat": stop_lat, "lon": stop_lon},
                "routes": stop_routes,
                "distance": calculate_distance(lat, lon, stop_lat, stop_lon)
            })
        
        # Get route details for each route we found
        for route_id in list(route_ids_seen)[:10]:  # Limit to 10 routes to avoid too many API calls
            try:
                route_url = f"{base_url}/route/{route_id}.json"
                route_response = requests.get(f"{route_url}?key=TEST", timeout=5)
                
                if route_response.status_code == 200:
                    route_data = route_response.json()
                    if route_data.get('code') == 200:
                        route = route_data.get('data', {}).get('entry', {})
                        
                        route_type = "bus"  # Default to bus
                        short_name = route.get('shortName', '')
                        long_name = route.get('longName', '')
                        
                        if "Link" in short_name or "light rail" in long_name.lower():
                            route_type = "rail"
                        elif "RapidRide" in long_name or short_name.startswith(('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H')):
                            route_type = "rapidride"
                        
                        routes_data.append({
                            "id": route_id,
                            "route_name": short_name or long_name,
                            "long_name": long_name,
                            "short_name": short_name,
                            "type": route_type,
                            "color": route.get('color', '#003f7f'),  # Default King County Metro blue
                            "text_color": route.get('textColor', '#ffffff')
                        })
            except Exception as e:
                print(f"Error fetching route {route_id}: {e}")
                continue
        
        return {
            "stops": stops_data,
            "routes": routes_data
        }
        
    except Exception as e:
        print(f"Error fetching King County Metro stops: {e}")
        return None

def get_king_county_metro_arrivals(stop_id):
    """Get real-time arrivals for a King County Metro stop with fallback."""
    try:
        base_url = "https://api.pugetsound.onebusaway.org/api/where"
        arrivals_url = f"{base_url}/arrivals-and-departures-for-stop/{stop_id}.json"
        
        params = {
            'key': 'TEST',
            'minutesBefore': 5,
            'minutesAfter': 60
        }
        
        response = requests.get(arrivals_url, params=params, timeout=5)
        
        if response.status_code == 429:
            print("Rate limited for arrivals - using fallback data")
            return get_fallback_arrivals_data(stop_id)
        
        if response.status_code != 200:
            print(f"Arrivals API request failed with status {response.status_code} - using fallback")
            return get_fallback_arrivals_data(stop_id)
            
        data = response.json()
        
        if data.get('code') != 200:
            print(f"Arrivals API returned error code: {data.get('code')}")
            return []
        
        arrivals_data = []
        
        for arrival in data.get('data', {}).get('entry', {}).get('arrivalsAndDepartures', []):
            route_id = arrival.get('routeId', '')
            route_short_name = arrival.get('routeShortName', '')
            route_long_name = arrival.get('routeLongName', '')
            trip_headsign = arrival.get('tripHeadsign', '')
            
            # Get predicted arrival time
            predicted_time = arrival.get('predictedArrivalTime')
            scheduled_time = arrival.get('scheduledArrivalTime')
            
            # Use predicted time if available, otherwise scheduled
            arrival_time = predicted_time if predicted_time else scheduled_time
            
            if arrival_time:
                arrival_datetime = datetime.fromtimestamp(arrival_time / 1000)
                now = datetime.now()
                minutes_away = max(0, int((arrival_datetime - now).total_seconds() / 60))
                
                # Determine status
                status = "SCHEDULED"
                if predicted_time:
                    if abs(predicted_time - scheduled_time) < 60000:  # Within 1 minute
                        status = "REAL_TIME"
                    else:
                        status = "DELAYED"
                
                arrivals_data.append({
                    "route_id": route_id,
                    "route_name": route_short_name or route_long_name,
                    "route_short_name": route_short_name,
                    "route_long_name": route_long_name,
                    "headsign": trip_headsign,
                    "minutes_away": minutes_away,
                    "arrival_time": arrival_datetime.isoformat(),
                    "status": status,
                    "real_time": bool(predicted_time)
                })
        
        # Sort by arrival time
        arrivals_data.sort(key=lambda x: x['minutes_away'])
        
        return arrivals_data
        
    except Exception as e:
        print(f"Error fetching King County Metro arrivals: {e}")
        return []

def get_fallback_arrivals_data(stop_id):
    """Generate realistic fallback arrivals data."""
    now = datetime.now()
    arrivals = []
    
    # Generate some realistic arrival times
    for i in range(3):
        arrival_time = now + timedelta(minutes=5 + i * 8)
        arrivals.append({
            "arrival_time": arrival_time.isoformat(),
            "route_name": f"Route {10 + i}",
            "route": f"route_{10 + i}",
            "destination": "Downtown Seattle",
            "status": "SCHEDULED",
            "vehicle_id": f"vehicle_{1000 + i}"
        })
    
    return arrivals

def is_seattle_area(lat, lon):
    """Check if coordinates are in Seattle metro area."""
    # Seattle area bounds (approximate)
    # Note: For longitude, -122.5 is further west than -122.0
    seattle_bounds = {
        'north': 47.8,
        'south': 47.4,
        'east': -122.0,   # Eastern boundary (closer to 0)
        'west': -122.5    # Western boundary (further from 0)
    }
    
    # For negative longitude values, west < lon < east means larger absolute value on west
    return (seattle_bounds['south'] <= lat <= seattle_bounds['north'] and
            seattle_bounds['west'] <= lon <= seattle_bounds['east'])

def get_transit_data(lat, lon, radius=800):
    """Main function to get transit data."""
    try:
        print(f"get_transit_data called with lat={lat}, lon={lon}, radius={radius}")
        seattle_check = is_seattle_area(lat, lon)
        print(f"Seattle area check result: {seattle_check}")
        
        # Use King County Metro API for Seattle area
        if seattle_check:
            print("Using King County Metro API for Seattle area")
            result = get_king_county_metro_stops(lat, lon, radius)
            print(f"King County Metro API result: {result is not None}")
            
            if result:
                stops = result.get('stops', [])
                routes = result.get('routes', [])
                  # Get arrivals for the closest stops
                arrivals_data = []
                # Only get arrivals for the closest stop to avoid rate limiting
                if stops:
                    closest_stop = stops[0]
                    stop_arrivals = get_king_county_metro_arrivals(closest_stop['id'])
                    for arrival in stop_arrivals:
                        arrival['stop_id'] = closest_stop['id']
                        arrival['stop_name'] = closest_stop['name']
                        arrivals_data.append(arrival)
                
                return {
                    'provider': 'King County Metro',
                    'stops': stops,
                    'routes': routes,
                    'arrivals': arrivals_data[:10]  # Return top 10 arrivals
                }
        
        # Fallback for non-Seattle areas - return empty but valid response
        print("Area not supported by King County Metro API")
        return {
            'provider': 'None',
            'stops': [],
            'routes': [],
            'arrivals': []
        }
        
    except Exception as e:
        print(f"Error in get_transit_data: {e}")
        return {
            'provider': 'Error',
            'stops': [],
            'routes': [],
            'arrivals': []
        }
