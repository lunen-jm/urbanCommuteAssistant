"""
Simple health check for API connections
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("\n=== API Environment Variables Check ===\n")

# OpenWeatherMap API
weather_api_key = os.getenv("WEATHER_API_KEY")
if weather_api_key:
    print(f"✅ WEATHER_API_KEY is set: {'*' * 5 + weather_api_key[-4:]}")
    
    # Test the API
    print("Testing OpenWeatherMap API...")
    try:
        params = {
            "lat": 47.6062,
            "lon": -122.3321,
            "units": "metric",
            "appid": weather_api_key
        }
        response = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params, timeout=5)
        if response.status_code == 200:
            print(f"✅ OpenWeatherMap API is working: {response.status_code}")
            data = response.json()
            if "main" in data and "temp" in data["main"]:
                print(f"   Current temperature in Seattle: {data['main']['temp']}°C")
        else:
            print(f"❌ OpenWeatherMap API returned error: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing OpenWeatherMap API: {str(e)}")
else:
    print("❌ WEATHER_API_KEY is not set")

print("\n---\n")

# TomTom Traffic API
traffic_api_key = os.getenv("TRAFFIC_API_KEY")
if traffic_api_key:
    print(f"✅ TRAFFIC_API_KEY is set: {'*' * 5 + traffic_api_key[-4:]}")
    
    # Test the API
    print("Testing TomTom Traffic API...")
    try:
        # Test with Seattle coordinates
        base_url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        params = {
            "point": "47.608013,-122.335167",
            "unit": "MPH",
            "key": traffic_api_key
        }
        response = requests.get(base_url, params=params, timeout=5)
        if response.status_code == 200:
            print(f"✅ TomTom Traffic API is working: {response.status_code}")
            data = response.json()
            if "flowSegmentData" in data:
                print(f"   Traffic flow data received successfully")
        else:
            print(f"❌ TomTom Traffic API returned error: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error testing TomTom Traffic API: {str(e)}")
else:
    print("❌ TRAFFIC_API_KEY is not set")

print("\n---\n")

# King County Metro GTFS
kc_metro_gtfs_url = os.getenv("KC_METRO_GTFS_URL")
if kc_metro_gtfs_url:
    print(f"✅ KC_METRO_GTFS_URL is set: {kc_metro_gtfs_url}")
    
    # Test the URL
    print("Testing King County Metro GTFS URL...")
    try:
        response = requests.head(kc_metro_gtfs_url, timeout=5)
        if response.status_code == 200:
            print(f"✅ KC Metro GTFS URL is accessible: {response.status_code}")
        else:
            print(f"❌ KC Metro GTFS URL returned error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing KC Metro GTFS URL: {str(e)}")
else:
    print("❌ KC_METRO_GTFS_URL is not set")

print("\n=== Summary ===\n")
all_set = bool(weather_api_key and traffic_api_key and kc_metro_gtfs_url)
if all_set:
    print("✅ All API keys are configured")
else:
    print("❌ Some API keys are missing or not configured")
