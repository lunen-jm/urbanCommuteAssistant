#!/usr/bin/env python
# check_test_user.py - Verify if the test user exists and can be used for login

import requests
import json
import os
import sys

def check_test_user():
    """Check if the test user exists and can be used for login"""
    
    print("=== Testing Test User Login ===")
    
    # Login endpoint
    login_url = "http://localhost:8000/api/auth/token"
    
    # Test with both username and email for thoroughness
    test_credentials = [
        {"username": "testuser", "password": "password123"},
        {"username": "test@example.com", "password": "password123"}
    ]
    
    for cred in test_credentials:
        print(f"\nAttempting login with: {cred['username']}")
        
        try:
            # Create form data for login
            login_data = {
                "username": cred["username"],
                "password": cred["password"]
            }
            
            # Send login request
            response = requests.post(login_url, data=login_data)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Login successful! Got access token: {data['access_token'][:10]}...")
                print(f"User: {data['user']['username']} ({data['user']['email']})")
                return True
            else:
                print(f"❌ Login failed with status code {response.status_code}")
                if response.headers.get("content-type") == "application/json":
                    print(f"Error details: {response.json()}")
                else:
                    print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ Error testing login: {str(e)}")
    
    print("\nLogin failed with all test credentials.")
    print("Please make sure:")
    print("1. The backend service is running (docker-compose ps)")
    print("2. The database has been initialized (docker-compose exec backend python -m app.db.init_db)")
    print("3. The backend .env file has a valid SECRET_KEY")
    return False

if __name__ == "__main__":
    success = check_test_user()
    sys.exit(0 if success else 1)
