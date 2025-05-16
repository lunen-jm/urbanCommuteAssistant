"""
Script to check the health of API integrations
Run this script to verify that all API keys are configured correctly
and external API services are accessible.
"""

import asyncio
import sys
import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# Check if we're running the server locally
SERVER_URL = os.getenv("API_URL", "http://localhost:8000")

async def check_api_health():
    """Check the health of all API integrations"""
    print(f"Checking API health at {SERVER_URL}...")
    try:
        # Check backend service first
        url = f"{SERVER_URL}/api/data/health"
        print(f"Requesting: {url}")
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        response.raise_for_status()
        health_data = response.json()
        
        print("\n=== API Health Check Results ===\n")
        
        # Weather API
        weather = health_data.get("weather_api", {})
        weather_key = weather.get("key_configured", False)
        weather_health = weather.get("health", False)
        
        print(f"Weather API:")
        print(f"  - API Key Configured: {'✅' if weather_key else '❌'}")
        print(f"  - API Health: {'✅' if weather_health else '❌'}")
        if not weather_key:
            print(f"  - Fix: Add WEATHER_API_KEY to your environment variables")
        if not weather_health and weather_key:
            print(f"  - Warning: API key is configured but service is not responding")
        
        # Traffic API
        traffic = health_data.get("traffic_api", {})
        traffic_key = traffic.get("key_configured", False)
        traffic_health = traffic.get("health", False)
        
        print(f"\nTraffic API:")
        print(f"  - API Key Configured: {'✅' if traffic_key else '❌'}")
        print(f"  - API Health: {'✅' if traffic_health else '❌'}")
        if not traffic_key:
            print(f"  - Fix: Add TRAFFIC_API_KEY to your environment variables")
        if not traffic_health and traffic_key:
            print(f"  - Warning: API key is configured but service is not responding")
        
        # Transit API
        transit = health_data.get("transit_api", {})
        transit_key = transit.get("key_configured", False)
        transit_health = transit.get("health", False)
        
        print(f"\nTransit API:")
        print(f"  - API Key Configured: {'✅' if transit_key else '❌'}")
        print(f"  - API Health: {'✅' if transit_health else '❌'}")
        if not transit_key:
            print(f"  - Fix: Verify KC_METRO_GTFS_URL in your environment variables")
        if not transit_health and transit_key:
            print(f"  - Warning: Transit URLs are configured but service is not responding")
        
        print("\n=== Summary ===")
        all_configured = weather_key and traffic_key and transit_key
        all_healthy = weather_health and traffic_health and transit_health
        
        if all_configured and all_healthy:
            print("✅ All APIs are properly configured and responding")
        elif all_configured and not all_healthy:
            print("⚠️  All APIs are configured but some are not responding")
        elif not all_configured:
            print("❌ Some API keys are missing or not configured correctly")
        
        print("\nNote: If any APIs are not responding, check your internet connection or try again later.")
        
    except Exception as e:
        print(f"Error checking API health: {str(e)}")
        print("\nTroubleshooting steps:")
        print("1. Make sure the backend server is running")
        print("2. Check that the SERVER_URL is correct")
        print("3. Verify network connectivity")
        print("4. Check console logs for more details")
        return False
    
    return all_configured and all_healthy

if __name__ == "__main__":
    result = asyncio.run(check_api_health())
    sys.exit(0 if result else 1)
