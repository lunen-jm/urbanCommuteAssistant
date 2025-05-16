# API Integration Guide

This document describes how to set up and integrate the external APIs required for the Urban Commute Assistant application.

## Required API Keys

The application uses the following external APIs that require authentication:

1. **OpenWeatherMap API**: Used for weather data
2. **TomTom API**: Used for traffic data
3. **King County Metro GTFS Data**: Used for transit data (no API key required, but URLs need to be configured)

## Setting Up API Keys

### OpenWeatherMap API

1. Go to [OpenWeatherMap](https://openweathermap.org/) and create a free account
2. Navigate to the "API Keys" section in your account dashboard
3. Create a new API key (or use the default one provided)
4. Copy this key and add it to your `.env` file as `WEATHER_API_KEY`

## API Integration Strategy

The Urban Commute Assistant implements a robust API integration strategy with error handling:

### Error Handling Approach

Instead of falling back to sample data when APIs fail, we use these strategies:

- **Placeholders**: Display "Weather data unavailable" or similar messages
- **Graceful Degradation**: Show available components even if some data is missing
- **Error Feedback**: Clearly indicate to users when data couldn't be retrieved
- **Retry Logic**: Automatic retries for transient failures

Note: The free tier allows up to 1,000 calls per day, which is sufficient for development and light usage.

### TomTom API

1. Visit [TomTom Developer Portal](https://developer.tomtom.com/) and create a free account
2. Create a new application in your dashboard
3. This will generate an API key that you can use for different TomTom services
4. Copy this key and add it to your `.env` file as `TRAFFIC_API_KEY`

Note: The free tier includes 2,500 free transactions per day, which is adequate for development.

### King County Metro GTFS Data

For transit data, the application uses:
- GTFS static data (schedules, routes, stops)
- GTFS-RT (real-time updates)

These don't require API keys, but you need to verify the URLs are correct in your `.env` file:

```
KC_METRO_GTFS_URL=https://kingcounty.gov/~/media/depts/metro/schedules/gtfs/current-feed.zip
KC_METRO_GTFS_RT_URL=https://api.pugetsound.onebusaway.org/api/where
```

## Verifying API Integration

After setting up your API keys, you can verify they're working correctly by running:

```bash
# From the backend directory
python check_api_health.py
```

This script will check that:
1. All API keys are properly configured
2. External services are responding
3. The basic data integration is working

## Troubleshooting Common API Issues

### CORS Errors

If experiencing CORS errors when making API requests from the frontend:

1. Ensure `CORS_ORIGINS` in `.env` includes your frontend URL
2. For local development, you can temporarily set `CORS_ORIGINS=*` to allow all origins

### Rate Limiting

If you see errors related to rate limiting:

1. Check your usage against the free tier limits of each service
2. Implement caching to reduce the number of API calls
3. Consider upgrading to a paid tier for higher limits

### API Authentication Failures

If API calls fail with authentication errors:

1. Verify API keys are correctly copied with no extra spaces
2. Ensure API keys are properly loaded in the application
3. Check if the API key has been activated (some services require activation)
