# API Integration Troubleshooting Guide

This guide provides detailed steps for troubleshooting and fixing API integration issues in the Urban Commute Assistant application.

## Common Issues and Solutions

### 1. Missing API Keys

**Symptoms:**
- 500 Internal Server errors on `/api/data/weather` or other endpoints
- The `/api/data/health` endpoint shows `"health": false` for specific APIs
- Error logs show authentication failures

**Solutions:**
- Update the backend `.env` file with valid API keys:

```sh
# Backend .env file
WEATHER_API_KEY=your_openweathermap_api_key
TRAFFIC_API_KEY=your_tomtom_api_key
KC_METRO_GTFS_URL=https://kingcounty.gov/~/media/depts/metro/schedules/gtfs/current-feed.zip
```

- For testing, you can use the `fix_api_integration.py` script:

```sh
python fix_api_integration.py
```

### 2. Frontend/Backend API Path Mismatch

**Symptoms:**
- Frontend makes requests to wrong endpoints
- 404 Not Found errors in backend logs
- Console network errors in browser

**Solutions:**
- Ensure the frontend API base URL is configured correctly in `frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

- Verify API call paths in `frontend/src/services/api.ts` don't include `/api` since it's already in the base URL:

```typescript
// Correct:
const response = await apiClient.get('/data/weather', { params });

// Incorrect:
const response = await apiClient.get('/api/data/weather', { params });
```

### 3. Transit API Parameter Issues

**Symptoms:**
- 422 Unprocessable Entity errors when calling transit endpoints
- Wrong parameter format in frontend requests

**Solutions:**
- When using coordinates, format them as a single location string:

```typescript
// Correct format
params.location = `${latitude},${longitude}`;

// Incorrect format
params.lat = latitude;
params.lon = longitude;
```

- Check transit endpoints for proper parameter validation:
  - Both location-based and coordinate-based parameters should be accepted

### 4. Docker Container Issues

**Symptoms:**
- Services are unreachable
- Database connection errors
- Redis cache errors

**Solutions:**
- Reset the Docker environment and rebuild:

```sh
docker-compose down
docker-compose up --build
```

- Initialize the database:

```sh
docker-compose exec backend python -m app.db.init_db
```

## Debugging Tools

### 1. API Debug Scripts

The project includes several debugging scripts:

- **api_debug.py**: Tests API endpoints with auth handling
  ```sh
  python api_debug.py
  ```

- **direct_api_test.py**: Tests external APIs directly (bypassing the backend)
  ```sh
  cd backend
  python direct_api_test.py
  ```

- **detailed_debug.py**: Performs comprehensive checks of the entire system
  ```sh
  python detailed_debug.py
  ```

### 2. Docker Logs

Check Docker logs for specific errors:

```sh
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f backend
```

### 3. Backend Health Check

The backend provides a health endpoint to verify API configurations:

```sh
curl http://localhost:8000/api/data/health
```

## Maintaining API Integrations

### 1. Regular Testing

Set up a schedule to verify APIs are working:

```sh
# Run automated tests
docker-compose exec backend pytest

# Check API health
python backend/check_api_health.py
```

### 2. API Key Rotation

Periodically rotate API keys for security:

1. Generate new keys on the provider websites
2. Update the `.env` files with new keys
3. Restart the backend service: `docker-compose restart backend`

### 3. Error Handling

Ensure the code has proper error handling:

- Implement graceful fallbacks when APIs fail
- Use circuit breakers to prevent cascading failures
- Cache responses to reduce API calls

## API Validation Issues

### Common Validation Errors

These errors may appear during container startup or when using the validation scripts:

1. **OpenWeatherMap API: "Nothing to geocode" (Status 400)**
   - Cause: The API validation request doesn't include a location parameter
   - Solution: When testing the API manually, include a city name parameter:
     ```
     https://api.openweathermap.org/data/2.5/weather?q=Seattle&appid=YOUR_API_KEY
     ```

2. **TomTom API: "Missing point parameter" (Status 400)**
   - Cause: The API validation request doesn't include required coordinates
   - Solution: When testing the API manually, include a point parameter:
     ```
     https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=YOUR_API_KEY&point=47.6062,-122.3321
     ```

3. **KC Metro GTFS URL: "URL inaccessible"**
   - Cause: Using HEAD requests or insufficient timeouts for large GTFS datasets
   - Solution: Use GET requests with proper headers and longer timeouts:
     ```python
     headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
     response = requests.get(url, timeout=15, headers=headers, stream=True)
     ```

### Testing API Keys with Proper Parameters

The API validation scripts have been updated to include proper parameters when testing API keys. If your container was failing because of these validation issues, you can use the following methods to fix them:

1. **Run the fixed validation script manually**:
   ```powershell
   cd "c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant\backend"
   python fix_api_keys.py
   ```
   This interactive script will test your API keys with proper parameters and update your .env file.

2. **Update your docker-compose.yml**:
   If the container fails during startup, you can modify the command to skip validation:
   ```yaml
   command: >
     bash -c "python -m app.db.init_db && 
              uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
   ```

3. **Use the standalone API test script**:
   ```powershell
   cd "c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant\backend"
   python standalone_api_test.py
   ```
   This script includes proper parameters for all API requests.
