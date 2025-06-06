from fastapi import APIRouter, HTTPException, Query
from ..services.transit_service import get_transit_data

router = APIRouter(prefix="/transit", tags=["transit"])

@router.get("/")
async def get_transit(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(500, description="Radius in meters")
):
    """Get transit data for a specific location."""
    try:
        result = get_transit_data(lat, lon, radius)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
