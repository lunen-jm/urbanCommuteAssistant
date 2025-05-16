# Render Dev Guide

This file contains instructions for deploying the Urban Commute Assistant to Render.com.

## Project Structure

The application consists of:
- A FastAPI backend (`backend/`)
- A React frontend (`frontend/`)

## Deployment Steps

1. Use the `render.yaml` configuration in this repository
2. Create a new Web Service on Render from your GitHub repository
3. Set the build command: `pip install -r backend/requirements.txt`
4. Set the start command: `cd backend && uvicorn api.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables (see below)

## Environment Variables

Required environment variables:
- `WEATHER_API_KEY` - OpenWeatherMap API key
- `TRAFFIC_API_KEY` - TomTom Traffic API key
- `SECRET_KEY` - Secret for JWT tokens

## Deployment URL

The application will be available at your Render URL.

## Troubleshooting

If you encounter module import errors, verify that the start command points to the correct path in your project structure.
