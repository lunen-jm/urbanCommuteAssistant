"""
Debug script to test the traffic service directly without FastAPI.
This can help identify if the issue is with the TomTom API or with our implementation.

Run this script from the backend directory:
python test_traffic_service.py
"""

import sys
import os
import json
from datetime import datetime

# Add the project to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.services.traffic_service import get_traffic_data
from config import settings

def test_traffic_service():
    """Test the traffic service directly."""
    print(f"Using TRAFFIC_API_KEY: {settings.TRAFFIC_API_KEY}")
    
    # Test coordinates (Downtown Seattle)
    lat, lon = 47.6062, -122.3321
    
    print(f"Testing traffic service for coordinates: {lat}, {lon}")
    
    # Get traffic data
    result = get_traffic_data(lat, lon, 5000)
    
    # Print result
    print("\nTraffic Service Result:")
    print(json.dumps(result, indent=2))
    
    # Check for error
    if "error" in result:
        print(f"\nERROR: {result['error']}")
    else:
        print(f"\nSuccess! Found {result['count']} traffic incidents.")
        
    return result

if __name__ == "__main__":
    test_traffic_service()
