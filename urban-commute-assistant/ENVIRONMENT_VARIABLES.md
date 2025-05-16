# Environment Variables Guide

This document explains how environment variables are used across the Urban Commute Assistant application.

## Standardized Approach

The application uses a centralized configuration approach with Pydantic settings to ensure type safety and validation.

### Backend Environment Variables

The backend uses Pydantic's `BaseSettings` class to load and validate environment variables. The main configuration class is in `app/core/config.py`. To update your environment:

1. Copy `.env.example` to `.env` in the backend directory
2. Update the values with your own API keys and configuration
3. Restart the application to load the new values

### Frontend Environment Variables

The frontend uses a TypeScript configuration service to manage environment variables:

1. Copy `.env.example` to `.env` in the frontend directory
2. Set your frontend environment variables, primarily `VITE_API_URL`
3. Restart the development server to load the new values

## Environment Variables Access Pattern

Always use the following pattern to access environment variables:

### Backend (Python)

```python
from app.core.config import settings

# Then use settings.VARIABLE_NAME
api_key = settings.WEATHER_API_KEY
database_url = settings.DATABASE_URL
```

### Frontend (TypeScript)

```typescript
import configService from '../services/config';

// Use the config service to get environment variables
const apiUrl = configService.getApiUrl('/endpoints/resource');
const isDevelopment = configService.isDevelopment();
```

## Required API Keys

To run the application successfully, you need to obtain the following API keys:

1. **OpenWeatherMap API Key**:
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Set as `WEATHER_API_KEY` in backend `.env`

2. **TomTom Traffic API Key**:
   - Sign up at [TomTom Developers](https://developer.tomtom.com/)
   - Set as `TRAFFIC_API_KEY` in backend `.env`

3. **Mapbox Access Token** (frontend only):
   - Sign up at [Mapbox](https://www.mapbox.com/)
   - Set as `VITE_MAPBOX_ACCESS_TOKEN` in frontend `.env`

## Validation

You can validate your environment variables by running:

```bash
# For backend
python validate_env.py

# For standalone API testing
python standalone_api_test.py
```

## Troubleshooting

If you encounter API issues, check:

1. That your API keys are correctly set in the `.env` files
2. That the environment variables are being loaded correctly
3. Run the validation scripts to verify connectivity
4. Check if you've reached any API rate limits

For more detailed API troubleshooting, see `API_TROUBLESHOOTING.md`.
