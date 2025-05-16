# Urban Commute Assistant - Simplified

A simplified version of the Urban Commute Assistant application with a modern, mobile-friendly UI and a clear, modular architecture.

## Features

- **Weather Information**: Get real-time weather data for your location
- **Traffic Updates**: View traffic incidents and conditions in your area
- **Transit Options**: Explore nearby public transit options
- **Commute Recommendations**: Receive smart commute suggestions based on current conditions
- **Interactive Map**: See your current location, select a destination, and view recommended routes
- **Mobile-First Design**: Responsive layout for both desktop and mobile

## Project Structure

```
urban-commute-assistant-simple/
├── frontend/                 # React frontend application
│   ├── public/               # Static assets
│   ├── src/                  # React source code
│   │   ├── components/       # React components (Map, Header, Dashboard, etc.)
│   │   ├── pages/            # Page components (Home, Login, Settings)
│   │   ├── services/         # API and routing services
│   │   └── store/            # Redux store
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
├── backend/                  # FastAPI backend application
│   ├── api/                  # API routes and services
│   ├── models/               # Database models
│   ├── utils/                # Utility functions
│   ├── config.py             # Configuration settings
│   └── requirements.txt      # Python dependencies
├── Setup-Environment.ps1     # Script to set up Python 3.11.5 environment
├── Start-Urban-Commute.ps1   # Script to start both frontend and backend
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Python 3.11.5 (recommended for backend)
- Node.js 14+
- npm or yarn
- pyenv-win (optional, for managing Python versions)

### Setup

1. **Clone the repository:**
   ```
   git clone https://github.com/your-username/urban-commute-assistant-simple.git
   cd urban-commute-assistant-simple
   ```

2. **Install dependencies and set up environments:**
   - Run the setup script (recommended):
     ```
     .\Setup-Environment.ps1
     ```
   - Or follow manual setup instructions in the README for backend and frontend.

3. **Configure API Keys:**
   - Copy `.env.example` to `.env` in both `frontend/` and `backend/`.
   - Add your API keys:
     - `VITE_TOMTOM_API_KEY` (frontend) for routing and map features
     - `WEATHER_API_KEY` and `TRAFFIC_API_KEY` (backend) for weather and traffic
   - Restrict your TomTom API key to your Netlify or production domain for security.

4. **Start the application:**
   ```
   .\Start-Urban-Commute.ps1
   ```
   This will launch both frontend and backend servers.

## How to Add Your Own Locations

By default, the app includes a few sample locations (Home, Work, Gym in Seattle). To add your own saved locations:

1. **In the App UI:**
   - Use the location dropdown at the top to select a destination.
   - If the UI supports adding locations (look for an "+" or "Add Location" button), use it to input a name and coordinates.
   - If not, you can edit the initial locations in the Redux store:
     - Open `frontend/src/store/userSlice.js`.
     - Find the `testUser.savedLocations` array and add your own objects:
       ```js
       savedLocations: [
         { id: '1', name: 'Home', lat: 47.6062, lng: -122.3321 },
         { id: '2', name: 'Work', lat: 47.6097, lng: -122.3331 },
         { id: '3', name: 'Gym', lat: 47.6205, lng: -122.3493 },
         // Add your own:
         { id: '4', name: 'School', lat: 47.65, lng: -122.35 }
       ]
       ```
     - Save and restart the frontend server to see your changes.

2. **(Optional) Implement a UI for adding/removing locations:**
   - The Redux store and actions support adding locations. You can build a form or button in the UI to dispatch the `addSavedLocation` action.

## Next Steps

- Deploy the app to Netlify (frontend) and Render or another service (backend).
- Set your production API keys and domain restrictions.
- Invite users to log in and try the commute assistant.
- For further customization, see the `src/components/` directory for UI and logic, and `src/store/` for state management.

## Troubleshooting

- If the map or routing does not work, check your TomTom API key and domain restrictions.
- If you see CORS or API errors, ensure both frontend and backend URLs are correct in your `.env` files.
- For more help, see the troubleshooting section in this README or run `.\Debug-Application.ps1`.

---

For more details, see the inline comments in the code and the documentation in each folder.
