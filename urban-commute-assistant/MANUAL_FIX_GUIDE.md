# API Integration Fix Guide

This guide provides step-by-step instructions to fix the API integration issues in your Urban Commute Assistant application while preserving your existing API keys.

## Required Changes

Follow these steps in order:

### 1. Update Redis URL in Backend .env

The Redis URL needs to use the service name `redis` instead of `localhost` for Docker networking to work properly.

```
# Open the backend .env file
notepad c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant\backend\.env

# Find the line:
REDIS_URL=redis://localhost:6379/0

# Change it to:
REDIS_URL=redis://redis:6379/0
```

### 2. Ensure Frontend Environment is Configured

The frontend needs to have the correct API URL to connect to the backend:

```
# Open or create the frontend .env file
notepad c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant\frontend\.env

# Ensure it contains:
VITE_API_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiamRldiIsImEiOiJjbGUxNXc5YmUwMTJqM3Bxa3k1aDVxdGp4In0.1rnW3BKdwHcj-AJoQXYbfg
```

### 3. Restart Docker Services

After making these changes, restart the services:

```powershell
cd "c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant"
docker-compose restart backend frontend
```

### 4. Test API Connections

Test if the API connections are working:

```powershell
cd "c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant"
docker-compose exec backend python check_api_health.py
```

## Additional Fixes if Needed

If you're still experiencing issues after making these changes:

### Fix API Routes in Frontend

Ensure all API calls in the frontend don't include the `/api` prefix in the path since it's already in the base URL:

1. Check `frontend/src/services/api.ts`:
   - All calls should use paths like `/data/weather` and not `/api/data/weather`

### Enable CORS for Development

If you're experiencing CORS issues, update the backend's CORS configuration:

1. Edit `backend/app/main.py`:
   - Find the CORSMiddleware configuration
   - Set `allow_origins=["*"]` temporarily for development

### Check API Key Configuration

The backend expects specific environment variables:

1. `WEATHER_API_KEY` - Your OpenWeatherMap API key
2. `TRAFFIC_API_KEY` - Your TomTom API key
3. `KC_METRO_GTFS_URL` - URL to King County Metro GTFS data
4. `KC_METRO_GTFS_RT_URL` - URL to King County Metro real-time data

All of these should be configured in your backend `.env` file.

## Diagnosing Continued Problems

If you're still having issues:

```powershell
# Check backend logs
docker-compose logs backend

# Test API directly
docker-compose exec backend python direct_api_test.py

# Check database connection
docker-compose exec backend python check_db.py
```

## After Fixing

After making these changes, your application should be able to:

1. Connect to the backend API properly
2. Fetch weather data using your OpenWeatherMap API key
3. Fetch traffic data using your TomTom API key
4. Fetch transit data using the King County Metro GTFS feed

All of this will happen without needing to change your existing API keys.
