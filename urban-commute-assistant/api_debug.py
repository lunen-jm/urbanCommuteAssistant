#!/usr/bin/env python
# api_debug.py

import requests
import json
import os
import sys
from urllib.parse import urljoin

# Base URL for the API
API_BASE_URL = "http://localhost:8000"

# Test endpoints
TEST_ENDPOINTS = [
    # Auth endpoints
    ("/api/auth/token", "POST", {"username": "test@example.com", "password": "password123"}),
    
    # Weather endpoints
    ("/api/data/weather?lat=47.62131966750041&lon=-122.17687087229456&units=metric", "GET", None),
    
    # Transit endpoints
    ("/api/data/transit?location=47.62131966750041,-122.17687087229456&include_realtime=true", "GET", None),
    
    # Health check
    ("/api/data/health", "GET", None),
]

def test_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint and return the result"""
    url = urljoin(API_BASE_URL, endpoint)
    headers = {}
    
    if endpoint.startswith("/api/auth"):
        # For auth endpoints
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        
        # Convert data to form format
        if data:
            data = "&".join([f"{key}={value}" for key, value in data.items()])
    else:
        # For other endpoints that use JSON
        headers["Content-Type"] = "application/json"
        
        # Auth token if needed
        auth_token = os.environ.get("API_AUTH_TOKEN")
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
    
    print(f"\n{'-' * 40}")
    print(f"Testing: {method} {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    if data:
        print(f"Data: {json.dumps(data, indent=2) if isinstance(data, dict) else data}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, data=data, timeout=10)
        else:
            print(f"Unsupported method: {method}")
            return
        
        print(f"Status: {response.status_code}")
        
        # Store auth token if this was a token endpoint
        if endpoint == "/api/auth/token" and response.status_code == 200:
            token_data = response.json()
            if "access_token" in token_data:
                os.environ["API_AUTH_TOKEN"] = token_data["access_token"]
                print("✅ Stored authentication token")
        
        # Try to parse as JSON
        try:
            response_json = response.json()
            print(f"Response: {json.dumps(response_json, indent=2)}")
        except:
            print(f"Response: {response.text[:500]}...")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def run_tests():
    """Run all the tests in sequence"""
    success_count = 0
    
    for endpoint, method, data in TEST_ENDPOINTS:
        if test_endpoint(endpoint, method, data):
            success_count += 1
            print("✅ Test passed")
        else:
            print("❌ Test failed")
    
    print(f"\n{'-' * 40}")
    print(f"Summary: {success_count}/{len(TEST_ENDPOINTS)} tests passed")
    
    return success_count == len(TEST_ENDPOINTS)

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
