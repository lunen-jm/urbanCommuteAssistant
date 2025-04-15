from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()

@router.get("/transit/schedule/{location}")
async def get_transit_schedule(location: str):
    try:
        # Replace with actual API endpoint and parameters
        response = requests.get(f"https://api.transit.com/schedule?location={location}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        raise HTTPException(status_code=response.status_code, detail=str(http_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

@router.get("/transit/disruptions/{location}")
async def get_transit_disruptions(location: str):
    try:
        # Replace with actual API endpoint and parameters
        response = requests.get(f"https://api.transit.com/disruptions?location={location}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        raise HTTPException(status_code=response.status_code, detail=str(http_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))