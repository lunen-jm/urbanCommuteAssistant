
from fastapi import APIRouter, Depends, Query
from typing import Optional, Dict, Any
from app.api.integrations.weather_adapter import OpenWeatherMapAdapter, WeatherQueryParams
from app.api.integrations.traffic_adapter import TomTomTrafficAdapter, TrafficQueryParams
from app.api.integrations.transit_adapter import KingCountyMetroAdapter, TransitQueryParams
from app.services.enhanced_data_aggregator import EnhancedDataAggregator
from app.core.config import Config

router = APIRouter()

@router.get("/weather")
async def get_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    units: str = Query("metric", description="Units (metric/imperial)")
):
    """
    Get weather data for a specific location
    """
    adapter = OpenWeatherMapAdapter()
    params = WeatherQueryParams(lat=lat, lon=lon, units=units)
    return await adapter.fetch_data(params)

@router.get("/traffic")
async def get_traffic(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Radius in meters")
):
    """
    Get traffic data for a specific location and radius
    """
    adapter = TomTomTrafficAdapter()
    params = TrafficQueryParams(lat=lat, lon=lon, radius=radius)
    return await adapter.fetch_data(params)

@router.get("/transit")
async def get_transit(
    location: str = Query(..., description="Location name"),
    route_id: Optional[str] = Query(None, description="Filter by route ID"),
    stop_id: Optional[str] = Query(None, description="Filter by stop ID"),
    include_realtime: bool = Query(True, description="Include realtime data")
):
    """
    Get transit data for a specific location
    """
    adapter = KingCountyMetroAdapter()
    params = TransitQueryParams(
        location=location, 
        route_id=route_id,
        stop_id=stop_id,
        include_realtime=include_realtime
    )
    return await adapter.fetch_data(params)

@router.get("/comprehensive")
async def get_comprehensive_data(
    location: str = Query(..., description="Location name"),
    include_traffic: bool = Query(True),
    include_weather: bool = Query(True),
    include_transit: bool = Query(True)
):
    """
    Get comprehensive data that combines weather, traffic, and transit information
    """
    aggregator = EnhancedDataAggregator()
    return await aggregator.get_aggregate_data(
        location_name=location,
        include_traffic=include_traffic,
        include_weather=include_weather,
        include_transit=include_transit
    )

@router.get("/health")
async def health_check():
    """
    Check API keys and connectivity to external services
    """
    weather_adapter = OpenWeatherMapAdapter()
    traffic_adapter = TomTomTrafficAdapter()
    transit_adapter = KingCountyMetroAdapter()
    
    return {
        "weather_api": {
            "key_configured": bool(Config.WEATHER_API_KEY and Config.WEATHER_API_KEY != "your_weather_api_key"),
            "health": await weather_adapter.health_check()
        },
        "traffic_api": {
            "key_configured": bool(Config.TRAFFIC_API_KEY and Config.TRAFFIC_API_KEY != "your_traffic_api_key"),
            "health": await traffic_adapter.health_check()
        },
        "transit_api": {
            "key_configured": bool(Config.KC_METRO_GTFS_URL and Config.KC_METRO_GTFS_URL != "https://kingcounty.gov/en/dept/metro/rider-tools/mobile-and-web-apps/gtfs"),
            "health": await transit_adapter.health_check()
        }
    }
