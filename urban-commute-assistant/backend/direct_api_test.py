#!/usr/bin/env python
# direct_api_test.py - Test API endpoints directly without FastAPI overhead

import sys
import os
import requests
import json
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("DirectAPITest")

# Load environment variables from .env file if present
load_dotenv()

def test_openweathermap():
    """Test OpenWeatherMap API directly using API key from environment"""
    api_key = os.environ.get("WEATHER_API_KEY")
    if not api_key:
        logger.error("WEATHER_API_KEY not found in environment variables")
        return False
        
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": 47.6062,
        "lon": -122.3321,
        "units": "metric",
        "appid": api_key
    }
    
    logger.info(f"Testing OpenWeatherMap API with key: {api_key[:4]}...{api_key[-4:] if len(api_key) > 8 else ''}")
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            logger.info(f"OpenWeatherMap API test successful: {data.get('name', 'Unknown')} - {data.get('main', {}).get('temp')}°C")
            return True
        else:
            logger.error(f"OpenWeatherMap API returned status code {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error testing OpenWeatherMap API: {str(e)}")
        return False

def test_tomtom():
    """Test TomTom API directly using API key from environment"""
    api_key = os.environ.get("TRAFFIC_API_KEY")
    if not api_key:
        logger.error("TRAFFIC_API_KEY not found in environment variables")
        return False
        
    # Example endpoint for traffic incidents
    lat, lon = 47.6062, -122.3321
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
    params = {
        "key": api_key,
        "point": f"{lat},{lon}"
    }
    
    logger.info(f"Testing TomTom API with key: {api_key[:4]}...{api_key[-4:] if len(api_key) > 8 else ''}")
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            logger.info(f"TomTom API test successful: Flow segment data retrieved")
            return True
        else:
            logger.error(f"TomTom API returned status code {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Error testing TomTom API: {str(e)}")
        return False

def test_transit():
    """Test King County Metro GTFS data directly"""
    gtfs_url = os.environ.get("KC_METRO_GTFS_URL")
    if not gtfs_url:
        logger.error("KC_METRO_GTFS_URL not found in environment variables")
        return False
        
    logger.info(f"Testing King County Metro GTFS URL: {gtfs_url}")
    
    try:
        # Just check if the URL is accessible - we don't download the full ZIP file
        response = requests.head(gtfs_url, timeout=10)
        if response.status_code == 200:
            logger.info(f"Transit GTFS data is accessible")
            return True
        else:
            logger.error(f"Transit GTFS URL returned status code {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"Error testing Transit GTFS URL: {str(e)}")
        return False

def update_env_file(api_keys):
    """Update the .env file with API keys"""
    env_file_path = "backend/.env"
    
    # First read the current content
    try:
        with open(env_file_path, "r") as f:
            lines = f.readlines()
    except FileNotFoundError:
        logger.error(f"Environment file not found: {env_file_path}")
        # Create a minimal file
        lines = [
            "# Database\n",
            "DATABASE_URL=postgresql://postgres:postgres@db:5432/urban_commute\n",
            "POSTGRES_USER=postgres\n",
            "POSTGRES_PASSWORD=postgres\n",
            "POSTGRES_DB=urban_commute\n\n",
            "# API Keys\n",
            "WEATHER_API_KEY=your_weather_api_key\n",
            "TRAFFIC_API_KEY=your_traffic_api_key\n",
            "KC_METRO_GTFS_URL=your_transit_api_key\n\n",
            "# Security\n",
            "SECRET_KEY=your_secret_key_for_jwt\n"
        ]
    
    # Update with provided keys
    new_lines = []
    for line in lines:
        if line.startswith("WEATHER_API_KEY=") and "WEATHER_API_KEY" in api_keys:
            new_lines.append(f"WEATHER_API_KEY={api_keys['WEATHER_API_KEY']}\n")
        elif line.startswith("TRAFFIC_API_KEY=") and "TRAFFIC_API_KEY" in api_keys:
            new_lines.append(f"TRAFFIC_API_KEY={api_keys['TRAFFIC_API_KEY']}\n")
        elif line.startswith("KC_METRO_GTFS_URL=") and "KC_METRO_GTFS_URL" in api_keys:
            new_lines.append(f"KC_METRO_GTFS_URL={api_keys['KC_METRO_GTFS_URL']}\n")
        else:
            new_lines.append(line)
    
    # Write updated content
    with open(env_file_path, "w") as f:
        f.writelines(new_lines)
    
    logger.info(f"Updated {env_file_path} with API keys")

def main():
    """Run direct API tests"""
    logger.info("Running direct API tests...")
    
    test_results = {
        "OpenWeatherMap": test_openweathermap(),
        "TomTom": test_tomtom(),
        "King County Metro": test_transit()
    }
    
    success_count = sum(1 for result in test_results.values() if result)
    total = len(test_results)
    
    logger.info(f"API Tests Summary: {success_count}/{total} APIs working")
    
    # If the API keys were modified in memory, update the .env file
    if "WEATHER_API_KEY" in os.environ or "TRAFFIC_API_KEY" in os.environ or "KC_METRO_GTFS_URL" in os.environ:
        api_keys = {
            "WEATHER_API_KEY": os.environ.get("WEATHER_API_KEY", "your_weather_api_key"),
            "TRAFFIC_API_KEY": os.environ.get("TRAFFIC_API_KEY", "your_traffic_api_key"),
            "KC_METRO_GTFS_URL": os.environ.get("KC_METRO_GTFS_URL", "https://kingcounty.gov/~/media/depts/metro/schedules/gtfs/current-feed.zip")
        }
        update_env_file(api_keys)
    
    return 0 if success_count == total else 1

if __name__ == "__main__":
    sys.exit(main())
