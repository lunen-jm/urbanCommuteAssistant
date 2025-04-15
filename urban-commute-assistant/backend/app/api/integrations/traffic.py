from fastapi import APIRouter
import requests

router = APIRouter()

@router.get("/traffic")
async def get_traffic_data(location: str):
    # Replace with your actual traffic API endpoint and parameters
    api_url = f"https://api.trafficdata.com/v1/conditions?location={location}&apikey=YOUR_API_KEY"
    
    response = requests.get(api_url)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Unable to fetch traffic data"}