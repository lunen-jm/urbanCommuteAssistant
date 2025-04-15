# Local Deployment Guide for Urban Commute Assistant

This guide provides instructions for deploying the Urban Commute Assistant project locally for development and testing purposes.

## Prerequisites

Ensure you have the following installed on your system:

- [Git](https://git-scm.com/downloads)
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
- A text editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
```

## Step 2: Set Up Environment Variables

Create `.env` files for both frontend and backend:

```cli
# Create backend .env file
cp backend/.env.example backend/.env

# Create frontend .env file
cp frontend/.env.example frontend/.env
```

Edit these files to include necessary API keys and configuration:

Backend `.env`:

```
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/urban_commute
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=urban_commute

# API Keys
WEATHER_API_KEY=your_weather_api_key
TRAFFIC_API_KEY=your_traffic_api_key
TRANSIT_API_KEY=your_transit_api_key

# Security
SECRET_KEY=your_secret_key_for_jwt
```

Frontend `.env`:

```
VITE_API_URL=http://localhost:8000/api
VITE_MAPBOX_TOKEN=your_mapbox_token
```

## Step 3: Configure External API Services

You'll need to obtain API keys for the following services:

* Weather data (e.g., OpenWeatherMap, WeatherAPI)
* Traffic data (e.g., TomTom, Here Maps)
* Transit data (e.g., local transit authority API or Transit Land)
* Mapbox for map visualization

## Step 4: Run with Docker Compose

Start the entire application stack:

```
docker-compose up --build
```

This command will:

* Build all necessary Docker images
* Create and initialize the PostgreSQL database
* Start the Redis cache server
* Launch the FastAPI backend service
* Start the React frontend development server
* Run any required database migrations

## Step 5: Access the Application

Once all containers are running:

* Frontend: http://localhost:3000
* Backend API: http://localhost:8000
* API Documentation: http://localhost:8000/docs

## Step 6: First-time Setup

1. Create a test account using the registration page
2. Configure your notification preferences
3. Add common routes or destinations
4. Test the real-time commute recommendations

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:

```
# Check database logs
docker-compose logs db

# Access PostgreSQL container
docker-compose exec db psql -U postgres -d
```

### API Integration Problems

If external APIs aren't working:

1. Verify API keys are correctly set in the .env file
2. Check API request logs in the backend container
3. Ensure the external services allow requests from localhost

### Frontend Not Loading

If the frontend isn't loading or connecting to the backend:

1. Verify the VITE_API_URL in frontend .env matches your backend URL
2. Check browser console for CORS errors or connection issues
3. Ensure the backend container is running correctly

## Development Workflow

### For active development:

1. Make changes to the code
2. The frontend will auto-reload when files are saved
3. For backend changes, you may need to restart the service: `docker-compose restart backend`

### Stopping the Application:

To stop all services: `docker-compose down`
To completely reset (including database volume): `docker-compose down -v`

### Running Tests

```
# Run backend tests
docker-compose exec backend pytest

# Run frontend tests
docker-compose exec frontend npm test
```

This setup provides a complete local development environment that mimics the production deployment while allowing for rapid development and testing.