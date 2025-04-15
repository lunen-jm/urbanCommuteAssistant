from fastapi import APIRouter
import requests
from pydantic import BaseModel

router = APIRouter()

class WeatherResponse(BaseModel):
    temperature: float
    description: str
    humidity: int
    wind_speed: float

@router.get("/weather/{location}", response_model=WeatherResponse)
async def get_weather(location: str):
    api_key = "YOUR_API_KEY"  # Replace with your actual API key
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    
    response = requests.get(url)
    data = response.json()
    
    if response.status_code != 200:
        return WeatherResponse(temperature=0, description="Error fetching weather data", humidity=0, wind_speed=0)

    weather_data = WeatherResponse(
        temperature=data["main"]["temp"],
        description=data["weather"][0]["description"],
        humidity=data["main"]["humidity"],
        wind_speed=data["wind"]["speed"]
    )
    
    return weather_data