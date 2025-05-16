# Urban Commute Assistant - Simplified

A simplified version of the Urban Commute Assistant application with a cleaner architecture that's easy to understand and modify.

## Features

- **Weather Information**: Get real-time weather data for your location
- **Traffic Updates**: View traffic incidents and conditions in your area
- **Transit Options**: Explore nearby public transit options
- **Commute Recommendations**: Receive smart commute suggestions based on current conditions

## Project Structure

```
urban-commute-assistant-simple/
├── frontend/                 # React frontend application
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── store/            # Redux store
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── backend/                  # FastAPI backend application
│   ├── api/                  # API routes and services
│   │   ├── routes/           # API endpoints
│   │   └── services/         # Service implementations
│   ├── config.py             # Configuration settings
│   └── requirements.txt      # Python dependencies
├── Setup-Environment.ps1     # Script to set up Python 3.11.5 environment
├── Start-Urban-Commute.ps1   # Script to start both frontend and backend
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.11.5 (specifically required due to compatibility issues with Python 3.12)
- Node.js 14+
- npm or yarn
- pyenv-win (recommended for managing Python versions)

### Setup with Python 3.11.5 (Recommended)

We've created a streamlined setup process to ensure compatibility:

1. **Install Python 3.11.5 using pyenv**:
   ```
   pyenv install 3.11.5
   ```

2. **Run the automated setup script**:
   ```
   .\Setup-Environment.ps1
   ```
   This script will:
   - Create a Python 3.11.5 virtual environment
   - Install all backend dependencies
   - Install all frontend dependencies

3. **Start the application**:
   ```
   .\Start-Urban-Commute.ps1
   ```
   This will start both the backend and frontend in separate windows.

### Alternative Manual Setup

If you prefer to set things up manually:

1. Navigate to the backend directory:
   ```
   cd urban-commute-assistant-simple/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies (ensuring correct versions):
   ```
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. Create a `.env` file based on `.env.example` and update with your API keys.

6. Run the backend server:
   ```
   python run.py
   ```

> **Note:** If you encounter Pydantic-related errors, make sure you have the exact version specified in requirements.txt. You may need to uninstall Pydantic first with `pip uninstall pydantic` and then reinstall with the correct version.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd urban-commute-assistant-simple/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`.

4. Run the frontend development server:
   ```
   npm run dev
   ```

5. Open your browser to the URL shown in the terminal (typically `http://localhost:3000` or `http://localhost:3001`)

## Running the Application

To run the complete application, you have multiple options:

### Option 1: Use the convenience scripts (recommended)

**Windows users:**
- Run either `Start-Urban-Commute.cmd` (Command Prompt) or `Start-Urban-Commute.ps1` (PowerShell)
- These scripts will check compatibility, start the backend with patching for Python 3.12, and launch the frontend

### Option 2: Manual startup

1. Start the backend server first in one terminal:
   ```
   cd urban-commute-assistant-simple/backend
   python run.py  # Or use run_with_patching.py for Python 3.12
   ```

2. Then start the frontend development server in another terminal:
   ```
   cd urban-commute-assistant-simple/frontend
   npm run dev
   ```

3. The application should now be accessible at the URL shown in the frontend terminal.

4. Use the following test credentials to log in:
   - Username: testuser
   - Password: testpassword123

## API Keys

This project uses the following APIs:

- **OpenWeatherMap API**: For weather data
- **TomTom API**: For traffic data

You can obtain free API keys from:
- [OpenWeatherMap](https://openweathermap.org/api)
- [TomTom Developer Portal](https://developer.tomtom.com/)

## Troubleshooting

If you encounter issues with the application not displaying correctly in your browser:

### Common Issues and Solutions

1. **Blank Page on Frontend**:
   - Check that both the backend (port 8000) and frontend (port 3000+) servers are running
   - Verify that your browser console doesn't show any JavaScript errors
   - Ensure the `.env` file exists in the `frontend` directory with `VITE_API_URL=http://localhost:8000`
   - Try accessing the API directly in your browser: http://localhost:8000/api/health

2. **API Connection Errors**:
   - Verify that the backend is running on port 8000
   - Check that your frontend `.env` file has the correct API URL
   - Ensure you have the necessary API keys in the backend `.env` file

3. **Python 3.12 Compatibility Issues**:
   - We've found that this project has compatibility issues with Python 3.12
   - Use the provided `Setup-Environment.ps1` script to create a Python 3.11.5 environment
   - Always use the `temp_env` virtual environment when running the backend

### Debugging Tools

We've provided several tools to help diagnose issues:

- **Debug-Application.ps1**: Checks the environment setup, ports, and API connectivity
- **check_compatibility.py**: Validates your Python environment and package compatibility
- **Start-Urban-Commute.ps1**: Properly starts both backend and frontend with the correct environment

Run the debug script if you're having issues:
```
.\Debug-Application.ps1
```

### Python 3.12 Compatibility

Due to compatibility issues between Python 3.12 and some of the dependencies (particularly typing_extensions and pydantic), we recommend using Python 3.11 or earlier for this project.

If you must use Python 3.12, try the following solutions:

1. **Use the patched runner**: Instead of using `run.py`, use `run_with_patching.py` which includes monkey patches for the compatibility issues:
   ```
   cd backend
   python run_with_patching.py
   ```

2. **Downgrade to Python 3.11**: This is the most reliable solution as all packages are fully compatible with Python 3.11.

3. **Install specific package versions**: If you're using Python 3.12, make sure to install these exact versions:
   ```
   pip install fastapi==0.95.0 uvicorn==0.21.1 pydantic==1.10.7 typing-extensions==4.5.0
   ```

4. **Run the compatibility checker**: Use the compatibility checker to diagnose issues:
   ```
   python check_compatibility.py
   ```

### Common Backend Issues

1. **Python 3.12 Compatibility**: If you're using Python 3.12, the application has been updated to work with the latest versions of typing_extensions and pydantic. The following versions are now supported:
   ```
   pydantic>=1.10.7,<2.0.0
   typing-extensions>=4.7.0,<5.0.0
   ```

2. **Pydantic Version Errors**: If you see errors related to Pydantic (e.g., `ForwardRef._evaluate() missing 1 required keyword-only argument: 'recursive_guard'`), make sure you have the correct version:
   ```
   pip uninstall -y pydantic
   pip install pydantic==1.10.7
   ```

3. **JWT Authentication Issues**: If you experience authentication issues, make sure your `SECRET_KEY` is correctly set in your environment variables. The default tokenUrl has been fixed to `/api/users/token`.

4. **Import Errors**: If you encounter import errors related to the config module, the code has been fixed to use absolute imports.

5. **API Key Issues**: If API calls fail, check that your API keys are correctly set in your `.env` file.

### Common Frontend Issues

1. **CORS Errors**: If the frontend can't connect to the backend, check that the backend CORS settings allow requests from your frontend URL.

2. **API Connection**: Make sure your `.env` file has the correct backend URL in `VITE_API_URL`.

## Deployment

### Backend

The backend can be deployed to any Python-compatible hosting service like:
- Heroku
- Render
- DigitalOcean
- AWS Lambda (with some modifications)

### Frontend

The frontend can be deployed to:
- Netlify
- Vercel
- GitHub Pages

## License

This project is licensed under the MIT License - see the LICENSE file for details.
