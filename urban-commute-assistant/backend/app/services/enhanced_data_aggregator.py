import asyncio
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import redis
import json

from app.core.config import Config
from app.api.integrations.weather_adapter import OpenWeatherMapAdapter, WeatherQueryParams
from app.api.integrations.traffic_adapter import TomTomTrafficAdapter, TrafficQueryParams
from app.api.integrations.transit_adapter import KingCountyMetroAdapter, TransitQueryParams
from app.services.normalizer import DataNormalizer

logger = logging.getLogger(__name__)

class EnhancedDataAggregator:
    """
    Enhanced data aggregator that uses the adapter pattern to fetch, normalize, and aggregate
    data from multiple sources with proper error handling and fallback mechanisms.
    """
    def __init__(self):
        # Initialize adapters
        self.weather_adapter = OpenWeatherMapAdapter()
        self.traffic_adapter = TomTomTrafficAdapter()
        self.transit_adapter = KingCountyMetroAdapter()
        
        # Initialize Redis for caching aggregated results
        self.redis = redis.from_url(Config.REDIS_URL)
        
        # Map of common locations (can be expanded)
        self.known_locations = {
            "downtown_seattle": {"lat": 47.6062, "lon": -122.3321},
            "university_district": {"lat": 47.6553, "lon": -122.3035},
            "bellevue": {"lat": 47.6101, "lon": -122.2015},
            "tacoma": {"lat": 47.2529, "lon": -122.4443}
        }
    
    async def get_aggregate_data(self, 
                               location_name: str,
                               include_traffic: bool = True,
                               include_weather: bool = True,
                               include_transit: bool = True) -> Dict[str, Any]:
        """
        Get aggregated data for a specific location.
        Handles fetching, caching, and combining data from multiple sources.
        """
        # Check if we have a known location
        location_coords = self.known_locations.get(location_name.lower())
        if not location_coords:
            logger.warning(f"Unknown location: {location_name}, using downtown Seattle as default")
            location_coords = self.known_locations["downtown_seattle"]
        
        # Check if we have cached aggregated data
        cache_key = f"aggregated:{location_name}"
        cached_data = self.redis.get(cache_key)
        
        if cached_data:
            logger.info(f"Using cached aggregated data for {location_name}")
            return json.loads(cached_data)
        
        # Fetch data from all sources in parallel
        tasks = []
        
        if include_weather:
            weather_params = WeatherQueryParams(
                lat=location_coords["lat"], 
                lon=location_coords["lon"],
                units="metric"
            )
            tasks.append(self.weather_adapter.fetch_data(weather_params))
        
        if include_traffic:
            traffic_params = TrafficQueryParams(
                lat=location_coords["lat"], 
                lon=location_coords["lon"],
                radius=5000  # 5km radius
            )
            tasks.append(self.traffic_adapter.fetch_data(traffic_params))
        
        if include_transit:
            transit_params = TransitQueryParams(
                location="seattle",  # This should be derived from location_name in a real implementation
                include_realtime=True
            )
            tasks.append(self.transit_adapter.fetch_data(transit_params))
        
        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        aggregated_data = {
            "timestamp": datetime.now().isoformat(),
            "location": {
                "name": location_name,
                "coordinates": location_coords
            }
        }
        
        result_index = 0
        if include_weather:
            weather_result = results[result_index]
            result_index += 1
            
            if isinstance(weather_result, Exception):
                logger.error(f"Error fetching weather data: {str(weather_result)}")
                aggregated_data["weather"] = {"error": str(weather_result), "available": False}
            else:
                # Process and normalize the weather data
                weather_data = weather_result.dict()
                normalized_weather = DataNormalizer.normalize_weather_data(weather_data)
                aggregated_data["weather"] = normalized_weather
        
        if include_traffic:
            traffic_result = results[result_index]
            result_index += 1
            
            if isinstance(traffic_result, Exception):
                logger.error(f"Error fetching traffic data: {str(traffic_result)}")
                aggregated_data["traffic"] = {"error": str(traffic_result), "available": False}
            else:
                # Process and normalize the traffic data
                traffic_data = traffic_result.dict()
                normalized_traffic = DataNormalizer.normalize_traffic_data(traffic_data)
                aggregated_data["traffic"] = normalized_traffic
        
        if include_transit:
            transit_result = results[result_index]
            
            if isinstance(transit_result, Exception):
                logger.error(f"Error fetching transit data: {str(transit_result)}")
                aggregated_data["transit"] = {"error": str(transit_result), "available": False}
            else:
                # Process and normalize the transit data
                transit_data = transit_result.dict()
                normalized_transit = DataNormalizer.normalize_transit_data(transit_data)
                aggregated_data["transit"] = normalized_transit
        
        # Generate commute recommendations based on aggregated data
        recommendations = self.generate_recommendations(aggregated_data)
        aggregated_data["recommendations"] = recommendations
        
        # Cache the aggregated results (short TTL - 2 minutes)
        self.redis.setex(cache_key, 120, json.dumps(aggregated_data))
        
        return aggregated_data
    
    def generate_recommendations(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate commute recommendations based on the aggregated data.
        This is a simple implementation that can be expanded with more complex logic.
        """
        recommendations = []
        
        # Check for severe weather
        if "weather" in data and data["weather"].get("available", False):
            weather = data["weather"]
            
            # Rain or snow recommendation
            if weather.get("condition") in ["Rain", "Snow", "Thunderstorm"]:
                recommendations.append({
                    "type": "weather",
                    "severity": "warning",
                    "message": f"{weather.get('condition')} detected. Allow extra travel time and drive carefully."
                })
            
            # Extreme temperatures
            if weather.get("temperature") is not None:
                temp = weather.get("temperature")
                if temp > 30:  # Hot weather (Celsius)
                    recommendations.append({
                        "type": "weather",
                        "severity": "info",
                        "message": f"High temperature ({temp}°C). Consider using air-conditioned transport."
                    })
                elif temp < 0:  # Cold weather
                    recommendations.append({
                        "type": "weather",
                        "severity": "warning",
                        "message": f"Below freezing temperature ({temp}°C). Watch for icy conditions."
                    })
        
        # Check for traffic incidents
        if "traffic" in data and data["traffic"].get("available", False):
            traffic = data["traffic"]
            incidents = traffic.get("incidents", [])
            
            if len(incidents) > 0:
                severe_incidents = [i for i in incidents if i.get("severity", 0) >= 3]
                if severe_incidents:
                    recommendations.append({
                        "type": "traffic",
                        "severity": "alert",
                        "message": f"{len(severe_incidents)} major traffic incidents detected. Consider alternate routes."
                    })
                else:
                    recommendations.append({
                        "type": "traffic",
                        "severity": "info",
                        "message": f"{len(incidents)} minor traffic incidents detected."
                    })
            
            # Check congestion levels
            congestion = traffic.get("congestion_level", 0)
            if congestion > 7:
                recommendations.append({
                    "type": "traffic",
                    "severity": "alert",
                    "message": "Heavy traffic congestion. Public transit recommended."
                })
            elif congestion > 4:
                recommendations.append({
                    "type": "traffic",
                    "severity": "warning",
                    "message": "Moderate traffic congestion. Allow extra travel time."
                })
        
        # Check for transit service alerts
        if "transit" in data and data["transit"].get("available", False):
            transit = data["transit"]
            alerts = transit.get("service_alerts", [])
            
            if len(alerts) > 0:
                service_disruptions = [a for a in alerts if a.get("effect") in ["NO_SERVICE", "REDUCED_SERVICE", "SIGNIFICANT_DELAYS"]]
                if service_disruptions:
                    recommendations.append({
                        "type": "transit",
                        "severity": "alert",
                        "message": f"{len(service_disruptions)} major transit disruptions. Check schedules before traveling."
                    })
                else:
                    recommendations.append({
                        "type": "transit",
                        "severity": "info",
                        "message": f"{len(alerts)} transit service notices."
                    })
        
        # If no specific recommendations, provide a general one
        if not recommendations:
            recommendations.append({
                "type": "general",
                "severity": "info",
                "message": "No significant issues affecting your commute at this time."
            })
        
        return recommendations
