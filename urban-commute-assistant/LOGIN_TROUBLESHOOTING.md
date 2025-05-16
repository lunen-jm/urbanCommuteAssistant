# Login System Troubleshooting Guide

This guide explains why you were experiencing login issues and how to fix them in the Urban Commute Assistant application.

## Understanding the Issue

The login system was failing due to several interconnected issues:

1. **Docker Compose Configuration**: The docker-compose.yml file was using hardcoded environment variables instead of reading from the .env files
2. **Database Initialization**: The test user wasn't being created when the app first started
3. **Frontend API URL**: The auth service in the frontend was using an incorrect environment variable reference
4. **Secret Key**: The JWT secret key needs to be properly set for authentication to work

## Fixed Issues

I've made the following changes to resolve these problems:

1. **Updated Docker Compose**:
   - Modified to use env_file instead of hardcoded environment variables
   - Added automatic database initialization on startup

2. **Fixed Environment Variables**:
   - Updated SECRET_KEY in backend/.env
   - Ensured frontend/.env has the correct API URL with /api prefix

3. **Created Reset Scripts**:
   - Reset-App.ps1: A PowerShell script that fully resets and initializes the app
   - check_test_user.py: A Python script to verify the test user login

## How to Fix Login Issues

To fix the login issues, follow these steps:

1. **Reset the Application**:
   ```powershell
   cd "c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant"
   ./Reset-App.ps1
   ```

   This script will:
   - Stop all containers and remove volumes
   - Start the services with a clean state
   - Initialize the database with the test user

2. **Verify Test User Login**:
   ```powershell
   python check_test_user.py
   ```

3. **Check Application Logs** if issues persist:
   ```powershell
   docker-compose logs backend
   ```

## Test User Credentials

Use these credentials to log in:

- **Email**: test@example.com
- **Username**: testuser
- **Password**: password123

You can use either the email address or username to log in.

## Manual Database Reset

If you need to manually reset just the database:

```powershell
# Remove database container and volume
docker-compose down -v

# Start services
docker-compose up -d

# Wait for services to start (about 10 seconds)
Start-Sleep -Seconds 10

# Initialize the database
docker-compose exec backend python -m app.db.init_db
```

## Understanding the Authentication Flow

1. The frontend makes a POST request to `/api/auth/token` with username/password
2. The backend validates the credentials against the database
3. If valid, the backend generates JWT tokens and returns them
4. The frontend stores these tokens and includes them in subsequent API requests

## Security Considerations

- The SECRET_KEY in the backend .env file is used to sign JWT tokens
- In production, you would use a strong, randomly generated key
- For local development, we're using a simple key for testing
