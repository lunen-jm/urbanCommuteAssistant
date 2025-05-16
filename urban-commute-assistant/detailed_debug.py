#!/usr/bin/env python
# detailed_debug.py

import requests
import json
import os
import sys
from urllib.parse import urljoin
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("API Debug")

# Base URL for the API
API_BASE_URL = "http://localhost:8000"

def check_env_vars():
    """Check if environment variables are set correctly"""
    logger.info("Checking environment variables...")
    
    # Check if .env file exists
    env_files = [
        "backend/.env",
        "frontend/.env"
    ]
    
    for env_file in env_files:
        try:
            with open(env_file, 'r') as f:
                content = f.read()
                logger.info(f"{env_file} exists and contains {len(content)} characters")
                
                # Check for common variables
                if "API_KEY" in content and "your_" in content:
                    logger.warning(f"{env_file} contains placeholder API keys that need to be replaced")
        except FileNotFoundError:
            logger.error(f"{env_file} not found")
    
    return True

def check_backend_logs():
    """Check backend logs for errors"""
    logger.info("Checking Docker logs for error patterns...")
    
    try:
        import subprocess
        # Get the logs from the backend container
        result = subprocess.run(["docker", "logs", "urban-commute-assistant-backend-1"], 
                                capture_output=True, text=True)
        
        logs = result.stdout + result.stderr
        
        # Look for common error patterns
        error_patterns = [
            "ImportError",
            "ModuleNotFoundError",
            "KeyError",
            "AttributeError",
            "TypeError",
            "ValueError",
            "SQLALCHEMY_DATABASE_URI",
            "ConnectionError",
            "OperationalError",
            "IntegrityError",
            "ProgrammingError"
        ]
        
        errors_found = False
        for pattern in error_patterns:
            if pattern in logs:
                errors_found = True
                # Find the line containing the error
                lines = logs.split("\n")
                for i, line in enumerate(lines):
                    if pattern in line:
                        # Get context (3 lines before and after)
                        start = max(0, i-3)
                        end = min(len(lines), i+4)
                        context = lines[start:end]
                        logger.error(f"Found {pattern} error in logs:")
                        for ctx_line in context:
                            logger.error(f"  {ctx_line}")
                        break
        
        if not errors_found:
            logger.info("No common error patterns found in the logs")
            
    except Exception as e:
        logger.error(f"Error checking logs: {str(e)}")
    
    return True

def test_api_endpoints():
    """Test various API endpoints"""
    logger.info("Testing API endpoints...")
    
    endpoints = [
        # Basic endpoints
        ("/", "GET", None),
        ("/api", "GET", None),
        ("/api/data/health", "GET", None),
        
        # Auth endpoint
        ("/api/auth/token", "POST", {"username": "test@example.com", "password": "password123"}),
        
        # Data endpoints
        ("/api/data/weather?lat=47.6062&lon=-122.3321&units=metric", "GET", None),
        ("/api/weather/current?lat=47.6062&lon=-122.3321&units=metric", "GET", None),
        ("/api/data/transit?location=47.6062,-122.3321&include_realtime=true", "GET", None),
    ]
    
    results = {}
    auth_token = None
    
    for endpoint, method, data in endpoints:
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
            
            # Add auth token if we have one
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
        
        logger.info(f"Testing: {method} {url}")
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, headers=headers, data=data, timeout=10)
            else:
                logger.error(f"Unsupported method: {method}")
                continue
            
            logger.info(f"Status: {response.status_code}")
            
            # Store auth token if this was a token endpoint
            if endpoint == "/api/auth/token" and response.status_code == 200:
                token_data = response.json()
                if "access_token" in token_data:
                    auth_token = token_data["access_token"]
                    logger.info("Authentication successful, token received")
            
            # Try to parse as JSON and get the error message if there is one
            try:
                response_json = response.json()
                if response.status_code >= 400 and "detail" in response_json:
                    logger.error(f"Error detail: {response_json['detail']}")
            except:
                if response.status_code >= 400:
                    logger.error(f"Response: {response.text[:500]}...")
            
            results[endpoint] = {
                "status": response.status_code,
                "success": response.status_code < 400
            }
            
        except Exception as e:
            logger.error(f"Request error: {str(e)}")
            results[endpoint] = {
                "status": None,
                "success": False,
                "error": str(e)
            }
    
    # Count successes and failures
    successes = sum(1 for result in results.values() if result["success"])
    total = len(results)
    
    logger.info(f"API Tests Summary: {successes}/{total} endpoints working")
    
    return results

def check_config_file():
    """Check the config file for API keys"""
    config_file = "backend/app/core/config.py"
    logger.info(f"Checking {config_file}...")
    
    try:
        with open(config_file, 'r') as f:
            content = f.read()
            
            # Check for environment variable usage
            if "os.getenv" in content:
                logger.info("Config file uses environment variables")
                
                # Look for key environment variables
                required_vars = [
                    "WEATHER_API_KEY",
                    "TRAFFIC_API_KEY",
                    "KC_METRO_GTFS_URL",
                    "DATABASE_URL",
                    "SECRET_KEY"
                ]
                
                for var in required_vars:
                    if var in content:
                        logger.info(f"Config references {var}")
                    else:
                        logger.warning(f"Config might be missing {var}")
    except FileNotFoundError:
        logger.error(f"{config_file} not found")
    
    return True

def main():
    """Run all checks"""
    logger.info("Starting API debugging")
    
    checks = [
        ("Environment Variables", check_env_vars),
        ("Config File", check_config_file),
        ("Backend Logs", check_backend_logs),
        ("API Endpoints", test_api_endpoints)
    ]
    
    results = {}
    
    for name, check_func in checks:
        logger.info(f"Running check: {name}")
        try:
            result = check_func()
            results[name] = {"success": True, "result": result}
        except Exception as e:
            logger.error(f"Check failed: {str(e)}")
            results[name] = {"success": False, "error": str(e)}
    
    logger.info("Debugging complete")
    
    # Check if any API endpoints are working
    if "API Endpoints" in results and results["API Endpoints"]["success"]:
        endpoints = results["API Endpoints"]["result"]
        if any(ep["success"] for ep in endpoints.values()):
            logger.info("Some API endpoints are working, the service is partially functional")
        else:
            logger.error("No API endpoints are working, the service is completely down")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
