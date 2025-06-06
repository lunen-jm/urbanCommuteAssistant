from fastapi import APIRouter, HTTPException, Query
from ..services.weather_service import get_weather_data

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/")
async def get_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get weather data for a specific location."""
    try:
        result = get_weather_data(lat, lon)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
