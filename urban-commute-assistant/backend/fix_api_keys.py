#!/usr/bin/env python
"""
Fix API integration issues by testing and updating environment variables.
This script will test API keys and URLs, then update the .env file with correct values.
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv
import re
from datetime import datetime

# Load current environment variables
load_dotenv()

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    """Print a formatted header."""
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== {text} ==={Colors.END}\n")

def print_success(text):
    """Print a success message."""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    """Print an error message."""
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    """Print a warning message."""
    print(f"{Colors.YELLOW}⚠️ {text}{Colors.END}")

def test_openweathermap_api(api_key):
    """Test OpenWeatherMap API key with proper parameters."""
    if not api_key:
        print_error("No OpenWeatherMap API key provided")
        return False
        
    try:
        print("Testing OpenWeatherMap API key...")
        # Use a specific city name to avoid "Nothing to geocode" error
        url = f"https://api.openweathermap.org/data/2.5/weather?q=Seattle&appid={api_key}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print_success("OpenWeatherMap API key is valid!")
            data = response.json()
            print(f"Current weather in Seattle: {data['weather'][0]['description']}")
            return True
        else:
            print_error(f"OpenWeatherMap API key is invalid! Status code: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print_error(f"Error testing OpenWeatherMap API key: {str(e)}")
        return False

def test_tomtom_api(api_key):
    """Test TomTom API key with proper parameters."""
    if not api_key:
        print_error("No TomTom API key provided")
        return False
        
    try:
        print("Testing TomTom API key...")
        # Include the required point parameter (Seattle coordinates)
        lat, lon = 47.6062, -122.3321
        url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key={api_key}&point={lat},{lon}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            print_success("TomTom API key is valid!")
            return True
        else:
            print_error(f"TomTom API key is invalid! Status code: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print_error(f"Error testing TomTom API key: {str(e)}")
        return False

def test_gtfs_url(url):
    """Test GTFS URL with more reliable approach."""
    if not url:
        print_error("No GTFS URL provided")
        return False
        
    try:
        print(f"Testing GTFS URL: {url}")
        # Use GET instead of HEAD which is more reliable for some servers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(
            url, 
            timeout=15,
            headers=headers,
            stream=True
        )
        
        # Close the connection immediately
        response.close()
        
        if response.status_code in [200, 302, 307]:
            print_success(f"GTFS URL is accessible! Status code: {response.status_code}")
            return True
        else:
            print_error(f"GTFS URL failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error testing GTFS URL: {str(e)}")
        return False

def update_env_file(weather_api_key=None, traffic_api_key=None, kc_metro_gtfs_url=None):
    """Update the .env file with corrected values."""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    try:
        # Read current content
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                content = f.read()
        else:
            content = ''
            
        # Update values if provided
        if weather_api_key:
            if 'WEATHER_API_KEY=' in content:
                content = re.sub(r'WEATHER_API_KEY=.*', f'WEATHER_API_KEY={weather_api_key}', content)
            else:
                content += f'\nWEATHER_API_KEY={weather_api_key}'
                
        if traffic_api_key:
            if 'TRAFFIC_API_KEY=' in content:
                content = re.sub(r'TRAFFIC_API_KEY=.*', f'TRAFFIC_API_KEY={traffic_api_key}', content)
            else:
                content += f'\nTRAFFIC_API_KEY={traffic_api_key}'
                
        if kc_metro_gtfs_url:
            if 'KC_METRO_GTFS_URL=' in content:
                content = re.sub(r'KC_METRO_GTFS_URL=.*', f'KC_METRO_GTFS_URL={kc_metro_gtfs_url}', content)
            else:
                content += f'\nKC_METRO_GTFS_URL={kc_metro_gtfs_url}'
        
        # Write updated content
        with open(env_path, 'w') as f:
            f.write(content)
            
        print_success(f"Updated .env file at {env_path}")
        return True
    except Exception as e:
        print_error(f"Error updating .env file: {str(e)}")
        return False

def main():
    """Run API tests and fix environment variables."""
    print_header("URBAN COMMUTE ASSISTANT API TROUBLESHOOTER")
    print(f"Date/Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get current values
    current_weather_key = os.getenv('WEATHER_API_KEY', '')
    current_traffic_key = os.getenv('TRAFFIC_API_KEY', '')
    current_gtfs_url = os.getenv('KC_METRO_GTFS_URL', '')
    
    print("\nCurrent environment variable values:")
    print(f"WEATHER_API_KEY: {'*****' + current_weather_key[-4:] if len(current_weather_key) > 4 else 'Not set'}")
    print(f"TRAFFIC_API_KEY: {'*****' + current_traffic_key[-4:] if len(current_traffic_key) > 4 else 'Not set'}")
    print(f"KC_METRO_GTFS_URL: {current_gtfs_url or 'Not set'}")
    
    # Initialize variables for new values
    new_weather_key = None
    new_traffic_key = None 
    new_gtfs_url = None
    
    # Test current values
    print_header("TESTING CURRENT API KEYS")
    
    # Test OpenWeatherMap API
    weather_valid = test_openweathermap_api(current_weather_key)
    if not weather_valid:
        print_warning("Would you like to update your OpenWeatherMap API key? (y/n)")
        response = input().lower()
        if response == 'y':
            print("Enter your OpenWeatherMap API key:")
            new_weather_key = input().strip()
            if new_weather_key:
                print("Testing the new key...")
                if test_openweathermap_api(new_weather_key):
                    print_success("New OpenWeatherMap API key is valid!")
                else:
                    print_error("New OpenWeatherMap API key is not valid.")
                    new_weather_key = None
    
    # Test TomTom API
    traffic_valid = test_tomtom_api(current_traffic_key)
    if not traffic_valid:
        print_warning("Would you like to update your TomTom API key? (y/n)")
        response = input().lower()
        if response == 'y':
            print("Enter your TomTom API key:")
            new_traffic_key = input().strip()
            if new_traffic_key:
                print("Testing the new key...")
                if test_tomtom_api(new_traffic_key):
                    print_success("New TomTom API key is valid!")
                else:
                    print_error("New TomTom API key is not valid.")
                    new_traffic_key = None
    
    # Test GTFS URL
    gtfs_valid = test_gtfs_url(current_gtfs_url)
    if not gtfs_valid:
        print_warning("Would you like to try a different GTFS URL? (y/n)")
        response = input().lower()
        if response == 'y':
            print("Enter the GTFS URL (or press Enter for default King County Metro URL):")
            input_url = input().strip()
            if input_url:
                new_gtfs_url = input_url
            else:
                # Default URL for King County Metro
                new_gtfs_url = "https://kingcounty.gov/depts/transportation/metro/travel-options/bus/app-center/developer-resources.aspx"
            
            if new_gtfs_url:
                print("Testing the new URL...")
                if test_gtfs_url(new_gtfs_url):
                    print_success("New GTFS URL is accessible!")
                else:
                    print_warning("New GTFS URL is not accessible, but we'll use it anyway as it might require authentication.")
    
    # Update .env file if needed
    if new_weather_key or new_traffic_key or new_gtfs_url:
        print_header("UPDATING ENVIRONMENT VARIABLES")
        update_env_file(
            weather_api_key=new_weather_key,
            traffic_api_key=new_traffic_key,
            kc_metro_gtfs_url=new_gtfs_url
        )
        
        # Print updated values
        final_weather_key = new_weather_key or current_weather_key
        final_traffic_key = new_traffic_key or current_traffic_key
        final_gtfs_url = new_gtfs_url or current_gtfs_url
        
        print("\nUpdated environment variable values:")
        print(f"WEATHER_API_KEY: {'*****' + final_weather_key[-4:] if len(final_weather_key) > 4 else 'Not set'}")
        print(f"TRAFFIC_API_KEY: {'*****' + final_traffic_key[-4:] if len(final_traffic_key) > 4 else 'Not set'}")
        print(f"KC_METRO_GTFS_URL: {final_gtfs_url or 'Not set'}")
        
        print_success("\nEnvironment variables have been updated. Please restart your application.")
    else:
        print_header("NO CHANGES MADE")
        print("No environment variables were updated.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
