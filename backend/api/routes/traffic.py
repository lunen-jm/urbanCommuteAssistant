from fastapi import APIRouter, HTTPException, Query, status
from ..services.traffic_service import get_traffic_data
import logging

# Set up logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/traffic", tags=["traffic"])

@router.get("/")
async def get_traffic(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Radius in meters")
):
    """Get traffic data for a specific location."""
    try:
        # Validate input parameters
        if not (-90 <= lat <= 90):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude must be between -90 and 90"
            )
        
        if not (-180 <= lon <= 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Longitude must be between -180 and 180"
            )
            
        result = get_traffic_data(lat, lon, radius)
        
        if "error" in result:
            logger.error(f"Traffic service error: {result['error']}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Traffic service error: {result['error']}"
            )
            
        return result
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in traffic endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Unexpected error: {str(e)}"
        )
