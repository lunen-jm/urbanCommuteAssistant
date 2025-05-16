# Urban Commute Assistant - Simplified

A modern, mobile-friendly commute assistant for the Seattle/Eastside area, featuring real-time weather, traffic, transit, and smart commute recommendations. The UI is responsive and optimized for both desktop and mobile.

## Features

- **Weather Information:** Real-time weather for your current or selected location
- **Traffic Updates:** Live traffic incidents and congestion
- **Transit Options:** Nearby public transit stops and arrivals (uses your current location)
- **Commute Recommendations:** Smart suggestions based on weather, traffic, and transit
- **Interactive Map:** View your location, select a destination, and see recommended routes
- **ETA Calculation:** See estimated travel time for the recommended route
- **Mobile-First Design:** Fully responsive layout
- **Custom Locations:** Home, Work, Gym, and School (all set to real local addresses)

## Current Architecture

```
urban-commute-assistant-simple/
├── frontend/                 # React app (Vite, Redux, Leaflet for maps)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # UI components (Map, Header, Dashboard, etc.)
│   │   ├── pages/            # Page components (Home, Login, Settings)
│   │   ├── services/         # API and routing logic
│   │   └── store/            # Redux slices (user, weather, traffic, transit)
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite config
├── backend/                  # FastAPI backend (Python 3.11+)
│   ├── api/                  # API routes (weather, traffic, transit)
│   ├── models/               # Database models (if used)
│   ├── utils/                # Utility functions
│   ├── config.py             # Settings
│   └── requirements.txt      # Python dependencies
├── Setup-Environment.ps1     # Script to set up Python environment
├── Start-Urban-Commute.ps1   # Script to start both frontend and backend
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites
- Python 3.11.5 (backend)
- Node.js 14+ (frontend)
- npm or yarn

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

## How to Add or Edit Locations

- The app includes four default locations:
  - **Home:** House in Bellevue
  - **Work:** Microsoft Redmond Campus
  - **Gym:** Crossroads Planet Fitness, Bellevue
  - **School:** Global Innovation Exchange (GIX), Bellevue
- To change these, edit the `savedLocations` array in `frontend/src/store/userSlice.js` and restart the frontend.
- Transit options always use your current location (via browser geolocation) for accuracy.

## Next Steps
- Add user profiles instead of one default user
- Add in styling and create an overall design & creative direction
- Make it work faster, optimize API usage
- Allow more profile customization
- Add in functinoality and user preferences LLM in the backend

## Troubleshooting
- If the map or routing does not work, check your TomTom API key and domain restrictions.
- If you see CORS or API errors, ensure both frontend and backend URLs are correct in your `.env` files.
- For more help, see the troubleshooting section in this README or run `./Debug-Application.ps1`.

---

For more details, see the inline comments in the code and the documentation in each folder.
