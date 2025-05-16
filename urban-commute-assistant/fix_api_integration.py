#!/usr/bin/env python
# fix_api_integration.py - Reset configuration and fix API issues

import os
import sys
import subprocess
import json
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("APIFixer")

# API Key Constants - these are example keys only, replace with real ones in production
DEFAULT_KEYS = {
    "WEATHER_API_KEY": "a123456789b123456789c123456789d1",  # OpenWeatherMap example
    "TRAFFIC_API_KEY": "abcdefghijklmnopqrstuvwxyzABCDEFG",  # TomTom example
    "KC_METRO_GTFS_URL": "https://kingcounty.gov/~/media/depts/metro/schedules/gtfs/current-feed.zip",  # GTFS static data
    "KC_METRO_GTFS_RT_URL": "https://s3.amazonaws.com/kcm-alerts-realtime-prod"  # GTFS real-time data
}

def get_project_root():
    """Get the project root directory"""
    return Path(__file__).parent.parent

def update_env_files():
    """Update the .env files in backend and frontend while preserving existing API keys"""
    root_dir = get_project_root()
    backend_env = root_dir / "backend" / ".env"
    frontend_env = root_dir / "frontend" / ".env"
    
    # Read existing keys
    existing_keys = {}
    if backend_env.exists():
        try:
            with open(backend_env, "r") as f:
                for line in f:
                    if "=" in line:
                        parts = line.strip().split("=", 1)
                        if len(parts) == 2:
                            key, value = parts
                            if key in ["WEATHER_API_KEY", "TRAFFIC_API_KEY", "KC_METRO_GTFS_URL", "KC_METRO_GTFS_RT_URL"]:
                                existing_keys[key] = value
        except Exception as e:
            logger.error(f"Error reading backend .env file: {e}")
    
    # Use existing keys or defaults
    weather_key = existing_keys.get("WEATHER_API_KEY", DEFAULT_KEYS["WEATHER_API_KEY"])
    traffic_key = existing_keys.get("TRAFFIC_API_KEY", DEFAULT_KEYS["TRAFFIC_API_KEY"])
    kc_metro_url = existing_keys.get("KC_METRO_GTFS_URL", DEFAULT_KEYS["KC_METRO_GTFS_URL"])
    kc_metro_rt_url = existing_keys.get("KC_METRO_GTFS_RT_URL", DEFAULT_KEYS["KC_METRO_GTFS_RT_URL"])
    
    # Backend .env
    backend_env_content = f"""# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/urban_commute
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=urban_commute

# API Keys
WEATHER_API_KEY={weather_key}
TRAFFIC_API_KEY={traffic_key}
KC_METRO_GTFS_URL={kc_metro_url}
KC_METRO_GTFS_RT_URL={kc_metro_rt_url}

# Redis Cache - updated to use Docker service name instead of localhost
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=supersecretkey1234567890

# CORS Settings
CORS_ORIGINS=*
"""
      # Check if frontend .env exists and read any existing values
    frontend_env_content = ""
    mapbox_token = "pk.eyJ1IjoiamRldiIsImEiOiJjbGUxNXc5YmUwMTJqM3Bxa3k1aDVxdGp4In0.1rnW3BKdwHcj-AJoQXYbfg"  # Default token
    
    if frontend_env.exists():
        try:
            with open(frontend_env, "r") as f:
                for line in f:
                    if line.startswith("VITE_MAPBOX_TOKEN="):
                        parts = line.strip().split("=", 1)
                        if len(parts) == 2:
                            mapbox_token = parts[1]
        except Exception as e:
            logger.error(f"Error reading frontend .env file: {e}")
    
    # Update frontend .env - always use the correct API URL
    frontend_env_content = f"""VITE_API_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN={mapbox_token}
"""
    
    logger.info(f"Updating backend .env file at {backend_env}")
    with open(backend_env, "w") as f:
        f.write(backend_env_content)
    
    logger.info(f"Updating frontend .env file at {frontend_env}")
    with open(frontend_env, "w") as f:
        f.write(frontend_env_content)

def restart_docker_services():
    """Restart the Docker services"""
    root_dir = get_project_root()
    
    try:
        logger.info("Stopping all containers...")
        subprocess.run(["docker-compose", "down"], cwd=root_dir, check=True)
        
        logger.info("Rebuilding and starting containers...")
        subprocess.run(["docker-compose", "up", "--build", "-d"], cwd=root_dir, check=True)
        
        logger.info("Containers successfully restarted")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error restarting Docker services: {e}")
        return False

def init_database():
    """Initialize the database with test data"""
    root_dir = get_project_root()
    
    try:
        logger.info("Initializing database with test user...")
        subprocess.run(
            ["docker-compose", "exec", "-T", "backend", "python", "-m", "app.db.init_db"],
            cwd=root_dir,
            check=True
        )
        logger.info("Database initialized successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Error initializing database: {e}")
        return False

def verify_fixes():
    """Verify if the fixes were applied successfully"""
    root_dir = get_project_root()
    
    try:
        logger.info("Testing API endpoints...")
        result = subprocess.run(
            ["docker-compose", "exec", "-T", "backend", "python", "direct_api_test.py"],
            cwd=root_dir,
            capture_output=True,
            text=True,
            check=False
        )
        
        if result.returncode == 0:
            logger.info("API tests passed successfully")
            return True
        else:
            logger.error(f"API tests failed: {result.stdout}\n{result.stderr}")
            return False
    except subprocess.CalledProcessError as e:
        logger.error(f"Error verifying fixes: {e}")
        return False

def main():
    """Main function to fix API issues"""
    logger.info("Starting API integration fix process")
    
    steps = [
        ("Updating environment files", update_env_files),
        ("Restarting Docker services", restart_docker_services),
        ("Initializing database", init_database),
        ("Verifying fixes", verify_fixes)
    ]
    
    results = {}
    
    for name, func in steps:
        logger.info(f"Step: {name}")
        try:
            result = func()
            results[name] = result
            if not result:
                logger.warning(f"Step '{name}' did not complete successfully")
        except Exception as e:
            logger.error(f"Error in step '{name}': {str(e)}")
            results[name] = False
    
    # Print summary
    logger.info("\n=== Summary ===")
    for name, result in results.items():
        logger.info(f"{name}: {'✅ Success' if result else '❌ Failed'}")
    
    success = all(results.values())
    
    if success:
        logger.info("\n🎉 All fixes applied successfully! The application should now be working.")
        logger.info("\nYou can access the application at:")
        logger.info("- Frontend: http://localhost:3000")
        logger.info("- Backend API: http://localhost:8000")
        logger.info("- API Documentation: http://localhost:8000/docs")
    else:
        logger.warning("\n⚠️ Some fixes did not apply successfully. Check the logs for details.")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
