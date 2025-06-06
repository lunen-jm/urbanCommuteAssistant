# Local Deployment Guide for Urban Commute Assistant

This guide provides instructions for deploying the Urban Commute Assistant project locally for development and testing purposes.

## Prerequisites

Ensure you have the following installed on your system:

- [Git](https://git-scm.com/downloads)
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 16+](https://nodejs.org/downloads/)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
- A text editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
```

## Step 2: Set Up Environment Variables

Create `.env` files for both frontend and backend:

```powershell
# Create backend .env file
Copy-Item backend\.env.example backend\.env

# Create frontend .env file  
Copy-Item frontend\.env.example frontend\.env
```

Edit these files to include necessary API keys and configuration:

Backend `.env`:

```
# API Keys
WEATHER_API_KEY=your_weather_api_key
TRAFFIC_API_KEY=your_traffic_api_key
TRANSIT_API_KEY=your_transit_api_key

# Security
SECRET_KEY=your_secret_key_for_jwt

# CORS settings
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]
```

Frontend `.env`:

```
VITE_API_URL=http://localhost:8000
VITE_TOMTOM_API_KEY=your_tomtom_api_key
```

## Step 3: Configure External API Services

You'll need to obtain API keys for the following services:

* Weather data (e.g., OpenWeatherMap, WeatherAPI)
* Traffic data (e.g., TomTom, Here Maps)
* Transit data (e.g., local transit authority API or Transit Land)
* TomTom for map visualization and routing

## Step 4: Install Dependencies and Run the Application

### Option 1: Use the Setup Scripts (Recommended)

The project includes PowerShell scripts to automate the setup:

```powershell
# Set up the environment (installs Python dependencies)
.\Setup-Environment.ps1

# Start both frontend and backend servers
.\Start-Urban-Commute.ps1
```

### Option 2: Manual Setup

#### Backend Setup:
```powershell
cd backend
pip install -r requirements.txt
python main.py
```

#### Frontend Setup (in a new terminal):
```powershell
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Step 5: Troubleshooting

If you encounter issues:

### Common Problems:
- **Port conflicts**: Make sure ports 5173 (frontend) and 8000 (backend) are available
- **API key errors**: Verify your API keys are correctly set in the `.env` files
- **CORS errors**: Ensure the backend CORS_ORIGINS includes your frontend URL
- **Module not found**: Run `pip install -r requirements.txt` in the backend directory

### Stopping the Application:
- Press `Ctrl+C` in both terminal windows
- Or use the `Stop-Process` commands if running in background

## Step 6: Access the Application

Once both servers are running:

* Frontend: http://localhost:5173
* Backend API: http://localhost:8000
* API Documentation: http://localhost:8000/docs

* Backend API: http://localhost:8000

The application should now be fully functional with:
- Real-time weather data
- Traffic information 
- Transit options
- Interactive map with routing
- Smart commute recommendations

## Step 7: First-time Setup

1. Open the application in your browser
2. Configure your location preferences
3. Add common destinations (Home, Work, etc.)
4. Test the real-time commute recommendations

## Development Tips

### Making Changes:
- Frontend changes are automatically reloaded (Vite hot reload)
- Backend changes require restarting the Python server (`Ctrl+C` and run `python main.py` again)
- Environment variable changes require restarting both servers

### Testing API Endpoints:
- Visit http://localhost:8000/docs for Swagger API documentation
- Use the interactive API explorer to test endpoints

### Local Storage:
- User preferences and ML data are stored in browser localStorage
- No database is required for basic functionality

### API Integration Problems

If external APIs aren't working:

1. Verify API keys are correctly set in the .env file
2. Check API request logs in the backend container
3. Ensure the external services allow requests from localhost

### Frontend Not Loading

If the frontend isn't loading or connecting to the backend:

1. Verify the VITE_API_URL in frontend .env matches your backend URL
2. Check browser console for CORS errors or connection issues  
3. Ensure the backend server is running on port 8000

## Development Workflow

### For active development:

1. Make changes to the code
2. The frontend will auto-reload when files are saved (Vite hot reload)
3. For backend changes, restart the Python server (`Ctrl+C` and run `python main.py` again)

### Stopping the Application:

- Press `Ctrl+C` in both terminal windows to stop the servers
- No additional cleanup required

### Running Tests

```powershell
# Run backend tests (if available)
cd backend
python -m pytest

# Run frontend tests (if available)
cd frontend  
npm test
```

This setup provides a complete local development environment using native Python and Node.js, making it easy for rapid development and testing without Docker complexity.