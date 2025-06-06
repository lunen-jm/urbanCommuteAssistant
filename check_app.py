#!/usr/bin/env python
"""
Simple script to check if the Urban Commute Assistant application is running correctly.
This script tests the backend API endpoints and verifies that they return valid responses.
"""

import requests
import sys
import time
import json

def check_api_health(base_url="http://localhost:8000"):
    """Check if the API is up and running."""
    try:
        response = requests.get(f"{base_url}/api/health")
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'healthy':
            print("✅ API health check passed.")
            return True
        else:
            print("❌ API health check failed: Unexpected response.")
            print(f"Response: {data}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API health check failed: {e}")
        return False

def check_weather_api(base_url="http://localhost:8000"):
    """Check if the weather API endpoint is working."""
    try:
        # Seattle coordinates
        params = {
            'lat': 47.6062,
            'lon': -122.3321
        }
        response = requests.get(f"{base_url}/api/weather/current", params=params)
        response.raise_for_status()
        data = response.json()
        
        if 'temp' in data:
            print("✅ Weather API check passed.")
            return True
        else:
            print("❌ Weather API check failed: Missing expected data.")
            print(f"Response: {data}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Weather API check failed: {e}")
        return False

def check_traffic_api(base_url="http://localhost:8000"):
    """Check if the traffic API endpoint is working."""
    try:
        # Seattle coordinates
        params = {
            'lat': 47.6062,
            'lon': -122.3321,
            'radius': 5
        }
        response = requests.get(f"{base_url}/api/traffic/incidents", params=params)
        response.raise_for_status()
        data = response.json()
        
        if isinstance(data, list):
            print("✅ Traffic API check passed.")
            return True
        else:
            print("❌ Traffic API check failed: Unexpected response format.")
            print(f"Response: {data}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Traffic API check failed: {e}")
        return False

def check_transit_api(base_url="http://localhost:8000"):
    """Check if the transit API endpoint is working."""
    try:
        # Seattle coordinates
        params = {
            'lat': 47.6062,
            'lon': -122.3321
        }
        response = requests.get(f"{base_url}/api/transit/nearby", params=params)
        response.raise_for_status()
        data = response.json()
        
        if isinstance(data, list):
            print("✅ Transit API check passed.")
            return True
        else:
            print("❌ Transit API check failed: Unexpected response format.")
            print(f"Response: {data}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Transit API check failed: {e}")
        return False

def check_authentication(base_url="http://localhost:8000"):
    """Check if the authentication endpoint is working."""
    try:
        # Test user credentials
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = requests.post(f"{base_url}/api/users/token", data=data)
        response.raise_for_status()
        token_data = response.json()
        
        if 'access_token' in token_data:
            print("✅ Authentication check passed.")
            
            # Test user profile endpoint with the token
            headers = {
                'Authorization': f"Bearer {token_data['access_token']}"
            }
            user_response = requests.get(f"{base_url}/api/users/me", headers=headers)
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                print(f"  ✅ User profile check passed. Username: {user_data.get('username')}")
                return True
            else:
                print(f"  ❌ User profile check failed: {user_response.status_code}")
                print(f"  Response: {user_response.text}")
                return False
        else:
            print("❌ Authentication check failed: No access token received.")
            print(f"Response: {token_data}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Authentication check failed: {e}")
        return False

def main():
    base_url = "http://localhost:8000"
    
    print("🔍 Checking Urban Commute Assistant Application")
    print(f"  Backend URL: {base_url}")
    print("-" * 50)
    
    # Wait a bit for the server to be fully up
    time.sleep(1)
    
    # Run all the checks
    health_ok = check_api_health(base_url)
    weather_ok = check_weather_api(base_url)
    traffic_ok = check_traffic_api(base_url)
    transit_ok = check_transit_api(base_url)
    auth_ok = check_authentication(base_url)
    
    # Summary
    print("\n📊 Summary:")
    all_checks = [
        ("API Health", health_ok),
        ("Weather API", weather_ok),
        ("Traffic API", traffic_ok),
        ("Transit API", transit_ok),
        ("Authentication", auth_ok)
    ]
    
    for name, status in all_checks:
        status_str = "✅ PASS" if status else "❌ FAIL"
        print(f"  {status_str} - {name}")
    
    # Overall result
    if all(status for _, status in all_checks):
        print("\n🎉 All checks passed! The application is working correctly.")
        return 0
    else:
        failed_count = sum(1 for _, status in all_checks if not status)
        print(f"\n⚠️ {failed_count} check(s) failed. Please check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
