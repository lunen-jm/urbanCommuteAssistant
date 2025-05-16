from fastapi import APIRouter, Depends, Query, HTTPException
import redis
from typing import Optional
import asyncio

from app.api.integrations.traffic import router as traffic_router
from app.api.integrations.weather import router as weather_router
from app.api.integrations.transit import router as transit_router
from app.api.auth import router as auth_router
from app.api.routes.integrated_data import router as integrated_data_router
from app.core.config import settings
from app.services.data_aggregator import EnhancedDataAggregator
from app.services.normalizer import DataNormalizer
from app.services.rate_limiter import ApiRateLimiter
from app.services.cache_service import CacheService

router = APIRouter()

# Include auth router
router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Include integration routers
router.include_router(traffic_router)
router.include_router(weather_router)
router.include_router(transit_router)

# Include enhanced data router with modern adapter pattern implementation
router.include_router(integrated_data_router, prefix="/data", tags=["integrated-data"])

# Helper function to get Redis connection
def get_redis():
    return redis.from_url(settings.REDIS_URL)

@router.get("/commute-suggestions")
async def get_commute_suggestions(location: str, destination: str):
    # This endpoint would use the individual services
    # Logic to generate suggestions based on the data will be implemented
    
    return {
        "message": "Commute suggestions are being processed",
        "location": location,
        "destination": destination
    }

@router.get("/comprehensive-data")
async def get_comprehensive_data(
    lat: float, 
    lon: float, 
    radius: int = Query(1000, description="Radius in meters for searching nearby features"),
    include_forecast: bool = Query(False, description="Include weather forecast data"),
    normalize: bool = Query(True, description="Normalize data for consistent formatting")
):
    """
    Get comprehensive data from all services for a specific location.
    
    This endpoint aggregates data from weather, traffic, and transit services
    to provide a complete view of conditions at a specific location.
    """
    redis_client = get_redis()
    
    # Create service instances
    aggregator = EnhancedDataAggregator()
    normalizer = DataNormalizer() if normalize else None
    cache_service = CacheService(redis_client)
    
    # Check if we have this in cache
    cache_key = f"comprehensive:{lat}:{lon}:{radius}:{include_forecast}:{normalize}"
    cached_data = cache_service.get(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        # Get raw data from all services
        raw_data = await aggregator.get_comprehensive_data(lat, lon, radius)
        
        # Normalize data if requested
        if normalize and normalizer:
            result = normalizer.normalize_comprehensive_data(raw_data)
        else:
            result = raw_data
            
        # Add weather forecast if requested
        if include_forecast:
            from app.api.integrations.weather import WeatherService
            weather_service = WeatherService()
            forecast_data = weather_service.get_weather_forecast(lat, lon)
            result["forecast"] = forecast_data
        
        # Cache the result
        cache_service.set(
            cache_key, 
            result, 
            "composite", 
            "comprehensive"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching comprehensive data: {str(e)}")

@router.get("/monitoring/api-usage")
async def get_api_usage_stats(redis=Depends(get_redis)):
    """Get API usage statistics for monitoring purposes"""
    rate_limiter = ApiRateLimiter(redis)
    cache_service = CacheService(redis)
    
    # Get statistics
    rate_limit_stats = rate_limiter.get_usage_stats()
    cache_stats = cache_service.get_stats()
    
    return {
        "api_usage": rate_limit_stats,
        "cache_stats": cache_stats
    }

@router.post("/cache/invalidate/{data_type}")
async def invalidate_cache(
    data_type: str, 
    subtype: Optional[str] = None,
    redis=Depends(get_redis)
):
    """Invalidate cache entries of a specific type"""
    cache_service = CacheService(redis)
    count = cache_service.invalidate_by_type(data_type, subtype)
    
    return {
        "status": "success",
        "invalidated_keys": count,
        "type": data_type,
        "subtype": subtype
    }