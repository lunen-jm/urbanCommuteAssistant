#!/usr/bin/env python
"""
Validate environment variables before starting the application.
This script checks that all required environment variables are set
and have valid values.
"""

import sys
from pydantic import ValidationError
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import settings after loading environment variables
try:
    from app.core.config import get_settings
except ImportError:
    print("❌ Could not import settings. Check your Python path.")
    sys.exit(1)

def test_openweathermap_api(api_key):
    """Test OpenWeatherMap API key with proper parameters."""
    try:
        print("Testing OpenWeatherMap API key...")
        # Use a specific city name to avoid "Nothing to geocode" error
        url = f"https://api.openweathermap.org/data/2.5/weather?q=Seattle&appid={api_key}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print(f"✅ OpenWeatherMap API key is valid!")
            data = response.json()
            print(f"Current weather in Seattle: {data['weather'][0]['description']}")
            return True
        else:
            print(f"❌ OpenWeatherMap API key is invalid! Status code: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ Error testing OpenWeatherMap API key: {str(e)}")
        return False

def test_tomtom_api(api_key):
    """Test TomTom API key with proper parameters."""
    try:
        print("Testing TomTom API key...")
        # Include the required point parameter (Seattle coordinates)
        lat, lon = 47.6062, -122.3321
        url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={api_key}&point={lat},{lon}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print(f"✅ TomTom API key is valid!")
            return True
        else:
            print(f"❌ TomTom API key is invalid! Status code: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ Error testing TomTom API key: {str(e)}")
        return False

def test_gtfs_url(url):
    """Test GTFS URL with more reliable approach."""
    try:
        print(f"Testing KC Metro GTFS URL...")
        # Use GET instead of HEAD which is more reliable for some servers
        # Add User-Agent to prevent some server blocks
        headers = {'User-Agent': 'Urban-Commute-Assistant/1.0'}
        response = requests.get(
            url, 
            timeout=15,  # Give it more time as GTFS files can be large
            headers=headers,
            stream=True  # Stream to avoid downloading the whole file
        )
        # Close the connection immediately to avoid downloading the entire file
        response.close()
        
        gtfs_valid = response.status_code in [200, 302, 307]
        print(f"{'✅' if gtfs_valid else '❌'} KC Metro GTFS URL is {'accessible' if gtfs_valid else 'inaccessible'}!")
        if not gtfs_valid:
            print(f"Status code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
        return gtfs_valid
    except Exception as e:
        print(f"❌ Error testing KC Metro GTFS URL: {str(e)}")
        return False

def main():
    """Validate environment and API keys."""
    print("\n=== Validating Environment Variables ===\n")
    
    try:
        settings = get_settings()
        print("✅ Basic environment validation passed!")
        
        # Test OpenWeatherMap API key with fixed function
        weather_key_valid = test_openweathermap_api(settings.WEATHER_API_KEY)
        
        # Test TomTom API key with fixed function
        traffic_key_valid = test_tomtom_api(settings.TRAFFIC_API_KEY)
        
        # Check GTFS URL accessibility with fixed function
        gtfs_valid = test_gtfs_url(settings.KC_METRO_GTFS_URL)
    except Exception as e:
        print(f"❌ Error testing KC Metro GTFS URL: {str(e)}")
        gtfs_valid = False
        
        # Summary
        print("\n=== Environment Validation Summary ===")
        print(f"OpenWeatherMap API key: {'✅ Valid' if weather_key_valid else '❌ Invalid'}")
        print(f"TomTom API key: {'✅ Valid' if traffic_key_valid else '❌ Invalid'}")
        print(f"KC Metro GTFS URL: {'✅ Accessible' if gtfs_valid else '❌ Inaccessible'}")
        
        all_valid = weather_key_valid and traffic_key_valid and gtfs_valid
        
        if all_valid:
            print("\n✅ All environment checks passed! The application should run correctly.")
            return 0
        else:
            print("\n⚠️ Some environment checks failed.")
            print("The application may not function correctly with missing or invalid API keys.")
            
            # Ask if we should continue despite errors (useful for development)
            if os.environ.get("FORCE_START", "").lower() != "true":
                response = input("Do you want to continue anyway? (y/n): ").lower()
                if response != 'y':
                    print("Application startup cancelled.")
                    return 1
            
            print("Continuing with application startup despite validation errors...")
            return 0
        
    except ValidationError as e:
        print(f"❌ Environment validation failed:")
        for error in json.loads(e.json()):
            field_name = ".".join(error["loc"])
            message = error["msg"]
            print(f"  - {field_name}: {message}")
        return 1
    except Exception as e:
        print(f"❌ Unexpected error during validation: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
