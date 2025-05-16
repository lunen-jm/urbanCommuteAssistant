"""
Debug API routes to inspect API values
"""

from fastapi import APIRouter, Depends, Query
from app.core.config import Config

router = APIRouter()

@router.get("/debug-config")
async def debug_config():
    """
    Debug endpoint to check the configuration values
    """
    return {
        "weather_api_key": bool(Config.WEATHER_API_KEY) and len(Config.WEATHER_API_KEY) > 10,
        "weather_api_key_value": Config.WEATHER_API_KEY[:5] + "..." + Config.WEATHER_API_KEY[-4:] if Config.WEATHER_API_KEY else None,
        "traffic_api_key": bool(Config.TRAFFIC_API_KEY) and len(Config.TRAFFIC_API_KEY) > 10,
        "traffic_api_key_value": Config.TRAFFIC_API_KEY[:5] + "..." + Config.TRAFFIC_API_KEY[-4:] if Config.TRAFFIC_API_KEY else None,
        "kc_metro_gtfs_url": Config.KC_METRO_GTFS_URL,
        "kc_metro_gtfs_url_zip": Config.KC_METRO_GTFS_URL.endswith(".zip") if Config.KC_METRO_GTFS_URL else False,
    }
