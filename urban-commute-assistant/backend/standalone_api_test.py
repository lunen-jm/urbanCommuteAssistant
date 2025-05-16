#!/usr/bin/env python
"""
Standalone API test script for Urban Commute Assistant
This script tests API connectivity outside the main application
to verify that all external API services are accessible.
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv
from datetime import datetime

# Add the app directory to the path so we can import from it if possible
sys.path.insert(0, os.path.dirname(__file__))

# Load environment variables from .env file if present
load_dotenv()

# Define colors for console output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    """Print a formatted header"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== {text} ==={Colors.END}\n")

def print_success(text):
    """Print a success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    """Print an error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    """Print a warning message"""
    print(f"{Colors.YELLOW}⚠️ {text}{Colors.END}")

def test_openweathermap():
    """Test OpenWeatherMap API connection"""
    print_header("Testing OpenWeatherMap API")
    
    # Try to get API key from settings if possible
    try:
        from app.core.config import settings
        api_key = settings.WEATHER_API_KEY
        print("Using API key from settings")
    except ImportError:
        # Fall back to environment variable
        api_key = os.getenv("WEATHER_API_KEY")
        print("Using API key from environment variable")
    
    if not api_key:
        print_error("WEATHER_API_KEY not found in environment variables")
        return False
    
    # Mask API key for output
    masked_key = f"{'*' * (len(api_key) - 4)}{api_key[-4:]}" if len(api_key) > 4 else "****"
    print(f"API Key: {masked_key}")
    
    url = f"https://api.openweathermap.org/data/2.5/weather?q=Seattle&appid={api_key}"
    print(f"Testing URL: https://api.openweathermap.org/data/2.5/weather?q=Seattle&appid=[MASKED]")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_success("OpenWeatherMap API works!")
            print(f"Current weather in Seattle: {data['weather'][0]['description']}, {data['main']['temp']}K")
            return True
        else:
            print_error(f"OpenWeatherMap API failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error testing OpenWeatherMap API: {str(e)}")
        return False

def test_tomtom():
    """Test TomTom API connection"""
    print_header("Testing TomTom API")
    
    # Try to get API key from settings if possible
    try:
        from app.core.config import settings
        api_key = settings.TRAFFIC_API_KEY
        print("Using API key from settings")
    except ImportError:
        # Fall back to environment variable
        api_key = os.getenv("TRAFFIC_API_KEY")
        print("Using API key from environment variable")
    
    if not api_key:
        print_error("TRAFFIC_API_KEY not found in environment variables")
        return False
    
    # Mask API key for output
    masked_key = f"{'*' * (len(api_key) - 4)}{api_key[-4:]}" if len(api_key) > 4 else "****"
    print(f"API Key: {masked_key}")
    
    # Seattle coordinates
    lat, lon = 47.6062, -122.3321
    
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={api_key}&point={lat},{lon}"
    print(f"Testing URL: https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=[MASKED]&point={lat},{lon}")
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print_success("TomTom API works!")
            if 'flowSegmentData' in data:
                print(f"Current speed: {data['flowSegmentData'].get('currentSpeed', 'N/A')} km/h")
                print(f"Free flow speed: {data['flowSegmentData'].get('freeFlowSpeed', 'N/A')} km/h")
            return True
        else:
            print_error(f"TomTom API failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error testing TomTom API: {str(e)}")
        return False

def test_king_county_transit():
    """Test King County Transit GTFS data"""
    print_header("Testing King County GTFS data")
    
    # Try to get URLs from settings if possible
    try:
        from app.core.config import settings
        gtfs_url = settings.KC_METRO_GTFS_URL
        print("Using GTFS URL from settings")
    except ImportError:
        # Fall back to environment variable
        gtfs_url = os.getenv("KC_METRO_GTFS_URL")
        print("Using GTFS URL from environment variable")
    
    if not gtfs_url:
        print_error("KC_METRO_GTFS_URL not found in environment variables")
        return False
    
    print(f"GTFS URL: {gtfs_url}")
    try:
        # Use GET instead of HEAD which is more reliable for some servers
        # Add User-Agent to prevent some server blocks
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(
            gtfs_url, 
            timeout=15,  # Give it more time as GTFS files can be large
            headers=headers,
            stream=True  # Stream to avoid downloading the whole file
        )
        # Close the connection immediately to avoid downloading the entire file
        response.close()
        
        gtfs_valid = response.status_code in [200, 302, 307]
        print(f"Status code: {response.status_code}")
        
        if gtfs_valid:
            print_success("King County GTFS URL is accessible!")
            print(f"Content type: {response.headers.get('Content-Type', 'Unknown')}")
            print(f"Content size: {response.headers.get('Content-Length', 'Unknown')} bytes")
            return True
        else:
            print_error(f"King County GTFS URL is inaccessible with status {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            return False
    except Exception as e:
        print_error(f"Error testing King County GTFS URL: {str(e)}")
        return False

def main():
    """Run all API tests"""
    print_header("URBAN COMMUTE ASSISTANT API TESTS")
    print(f"Date/Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    weather = test_openweathermap()
    traffic = test_tomtom()
    transit = test_king_county_transit()
    
    # Print summary
    print_header("SUMMARY")
    print(f"Weather API: {'✅ Working' if weather else '❌ Failed'}")
    print(f"Traffic API: {'✅ Working' if traffic else '❌ Failed'}")
    print(f"Transit API: {'✅ Working' if transit else '❌ Failed'}")
    
    if weather and traffic and transit:
        print_success("\nAll API keys are working correctly!")
        print("You can now proceed with the full application setup.")
        return 0
    else:
        print_warning("\nSome API keys need to be fixed before continuing.")
        print("Check the error messages above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
