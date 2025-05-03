from typing import List, Dict, Any
import requests
import asyncio
from datetime import datetime
import json
import redis

from app.core.config import Config
from app.api.integrations.weather import WeatherService
from app.api.integrations.traffic import TomTomTrafficService
from app.api.integrations.transit import KingCountyMetroService

class DataAggregator:
    def __init__(self, traffic_api_key: str, weather_api_key: str, transit_api_key: str):
        self.traffic_api_key = traffic_api_key
        self.weather_api_key = weather_api_key
        self.transit_api_key = transit_api_key

    def get_traffic_data(self, location: str) -> Dict:
        response = requests.get(f"https://api.traffic.com/data?location={location}&key={self.traffic_api_key}")
        return response.json()

    def get_weather_data(self, location: str) -> Dict:
        response = requests.get(f"https://api.weather.com/data?location={location}&key={self.weather_api_key}")
        return response.json()

    def get_transit_data(self, location: str) -> Dict:
        response = requests.get(f"https://api.transit.com/data?location={location}&key={self.transit_api_key}")
        return response.json()

    def aggregate_data(self, location: str) -> Dict:
        traffic_data = self.get_traffic_data(location)
        weather_data = self.get_weather_data(location)
        transit_data = self.get_transit_data(location)

        aggregated_data = {
            "traffic": traffic_data,
            "weather": weather_data,
            "transit": transit_data
        }

        return aggregated_data

    def get_commuting_suggestions(self, location: str) -> List[str]:
        data = self.aggregate_data(location)
        suggestions = []

        # Example logic for generating suggestions based on aggregated data
        if data['traffic']['congestion_level'] > 5:
            suggestions.append("Consider taking public transport due to heavy traffic.")
        if data['weather']['condition'] == 'rainy':
            suggestions.append("Bring an umbrella as it's going to rain.")
        if not data['transit']['on_time']:
            suggestions.append("Check for alternative transit options due to delays.")

        return suggestions

class EnhancedDataAggregator:
    """Advanced data aggregator with parallel fetching and normalized responses"""
    
    def __init__(self):
        """Initialize with service instances"""
        self.weather_service = WeatherService()
        self.traffic_service = TomTomTrafficService()
        self.transit_service = KingCountyMetroService()
        self.redis = redis.from_url(Config.REDIS_URL)
        
    async def get_comprehensive_data(self, lat: float, lon: float, radius: int = 1000):
        """Get all relevant data for a location concurrently"""
        cache_key = f"comprehensive_data:{lat}:{lon}:{radius}"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            data = json.loads(cached_data)
            data['_cached'] = True
            return data
        
        # Create tasks for parallel execution
        weather_task = asyncio.create_task(self._get_weather_async(lat, lon))
        traffic_task = asyncio.create_task(self._get_traffic_async(lat, lon, radius))
        transit_task = asyncio.create_task(self._get_transit_async(lat, lon))
        
        # Wait for all tasks to complete
        weather_data, traffic_data, transit_data = await asyncio.gather(
            weather_task, traffic_task, transit_task
        )
        
        # Combine the data
        comprehensive_data = {
            "weather": weather_data,
            "traffic": traffic_data,
            "transit": transit_data,
            "timestamp": datetime.now().isoformat(),
            "location": {
                "latitude": lat,
                "longitude": lon,
                "radius": radius
            },
            "_cached": False
        }
        
        # Cache for 1 minute (since this combines multiple frequently changing data sources)
        self.redis.setex(cache_key, 60, json.dumps(comprehensive_data))
        
        return comprehensive_data
    
    async def _get_weather_async(self, lat: float, lon: float):
        """Async wrapper for weather service"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self.weather_service.get_weather_data, lat, lon
        )
    
    async def _get_traffic_async(self, lat: float, lon: float, radius: int):
        """Async wrapper for traffic service"""
        loop = asyncio.get_event_loop()
        
        # Get both flow and incidents in parallel
        flow_task = loop.run_in_executor(
            None, self.traffic_service.get_traffic_flow, lat, lon, radius
        )
        incidents_task = loop.run_in_executor(
            None, self.traffic_service.get_traffic_incidents, lat, lon, radius
        )
        
        flow_data, incidents_data = await asyncio.gather(flow_task, incidents_task)
        
        return {
            "flow": flow_data,
            "incidents": incidents_data
        }
    
    async def _get_transit_async(self, lat: float, lon: float):
        """Async wrapper for transit service"""
        loop = asyncio.get_event_loop()
        
        # Get vehicles, alerts, and updates in parallel
        vehicles_task = loop.run_in_executor(
            None, self.transit_service.get_vehicle_positions
        )
        alerts_task = loop.run_in_executor(
            None, self.transit_service.get_service_alerts
        )
        updates_task = loop.run_in_executor(
            None, self.transit_service.get_trip_updates
        )
        
        vehicles, alerts, updates = await asyncio.gather(
            vehicles_task, alerts_task, updates_task
        )
        
        return {
            "vehicles": vehicles,
            "alerts": alerts,
            "updates": updates
        }
    
    def get_nearby_stops(self, lat: float, lon: float, radius: float = 1000.0):
        """Find transit stops near a given location"""
        # This would typically use spatial querying from a database
        # For now, we'll implement a basic version that filters the stops
        
        try:
            static_data = self.transit_service.get_static_schedules()
            stops = static_data.get('stops', [])
            
            nearby_stops = []
            for stop in stops:
                # Basic distance calculation (would use proper geo functions in production)
                stop_lat = float(stop.get('stop_lat', 0))
                stop_lon = float(stop.get('stop_lon', 0))
                
                # Very simple distance approximation (not accurate for production)
                dist_lat = abs(stop_lat - lat)
                dist_lon = abs(stop_lon - lon)
                
                # Rough conversion to meters (very approximate)
                dist_meters = ((dist_lat**2 + dist_lon**2) ** 0.5) * 111000
                
                if dist_meters <= radius:
                    stop['distance'] = dist_meters
                    nearby_stops.append(stop)
            
            # Sort by distance
            nearby_stops.sort(key=lambda x: x.get('distance', float('inf')))
            return nearby_stops[:20]  # Limit to 20 nearest stops
            
        except Exception as e:
            print(f"Error finding nearby stops: {str(e)}")
            return []