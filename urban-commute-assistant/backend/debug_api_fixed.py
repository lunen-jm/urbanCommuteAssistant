"""
Debug script to check the API connectivity with timeouts
"""

import requests
import os
import sys
from dotenv import load_dotenv

# Add the app directory to the path so we can import from it
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables
load_dotenv()

# Try to import settings, fallback to direct environment variables if not possible
try:
    from app.core.config import settings
    
    # Print environment variables using settings
    print("Environment Variables (from settings):")
    print(f"WEATHER_API_KEY: {'*' * 5 + settings.WEATHER_API_KEY[-4:] if settings.WEATHER_API_KEY else 'Not set'}")
    print(f"TRAFFIC_API_KEY: {'*' * 5 + settings.TRAFFIC_API_KEY[-4:] if settings.TRAFFIC_API_KEY else 'Not set'}")
    print(f"KC_METRO_GTFS_URL: {settings.KC_METRO_GTFS_URL or 'Not set'}")
    print(f"KC_METRO_GTFS_RT_URL: {settings.KC_METRO_GTFS_RT_URL or 'Not set'}")
except ImportError:
    # Fallback to direct access of environment variables
    print("Could not import settings, using environment variables directly:")
    print(f"WEATHER_API_KEY: {'*' * 5 + os.getenv('WEATHER_API_KEY')[-4:] if os.getenv('WEATHER_API_KEY') else 'Not set'}")
    print(f"TRAFFIC_API_KEY: {'*' * 5 + os.getenv('TRAFFIC_API_KEY')[-4:] if os.getenv('TRAFFIC_API_KEY') else 'Not set'}")
    print(f"KC_METRO_GTFS_URL: {os.getenv('KC_METRO_GTFS_URL') or 'Not set'}")
    print(f"KC_METRO_GTFS_RT_URL: {os.getenv('KC_METRO_GTFS_RT_URL') or 'Not set'}")

# Server URL
SERVER_URL = "http://localhost:8000"

# Test server connection
print("\nTesting server connection...")
try:
    response = requests.get(f"{SERVER_URL}/", timeout=5)
    print(f"Root endpoint status: {response.status_code}")
    print(f"Response: {response.text}")
except requests.exceptions.Timeout:
    print("Error: Connection to server timed out after 5 seconds")
except Exception as e:
    print(f"Error connecting to server: {str(e)}")

# Test health endpoint
print("\nTesting health endpoint...")
try:
    response = requests.get(f"{SERVER_URL}/api/data/health", timeout=5)
    print(f"Health endpoint status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
    else:
        print(f"Response: {response.text}")
except requests.exceptions.Timeout:
    print("Error: Connection to health endpoint timed out after 5 seconds")
except Exception as e:
    print(f"Error connecting to health endpoint: {str(e)}")

# List all available endpoints
print("\nListing all available endpoints...")
try:
    response = requests.get(f"{SERVER_URL}/openapi.json", timeout=5)
    if response.status_code == 200:
        paths = response.json().get('paths', {})
        print("Available endpoints:")
        for path in sorted(paths.keys()):
            methods = list(paths[path].keys())
            print(f"  {path} - Methods: {', '.join(methods)}")
    else:
        print(f"Could not get OpenAPI schema: {response.status_code}")
except requests.exceptions.Timeout:
    print("Error: Connection to OpenAPI endpoint timed out after 5 seconds")
except Exception as e:
    print(f"Error getting OpenAPI schema: {str(e)}")
