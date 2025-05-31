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

### 🧠 Machine Learning Features (NEW!)

- **Smart Defaults:** Remembers your preferred transport method for each destination
- **Frequency-based Suggestions:** Promotes your most visited destinations with star icons
- **Weather Adaptation:** Learns your transport preferences for different weather conditions
- **Time-based Learning:** Adapts recommendations based on your commute patterns throughout the day
- **Smart Favorites Page:** Curated suggestions based on your usage patterns with feedback options
- **Analytics Dashboard:** Detailed insights into your commute patterns, transport usage, and trends
- **Privacy-First:** All ML data is stored locally on your device - nothing is shared or uploaded

## Current Architecture

```
urban-commute-assistant-simple/
├── frontend/                 # React app (Vite, Redux, Leaflet for maps)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # UI components (Map, Header, Dashboard, etc.)
│   │   ├── pages/            # Page components (Home, Login, Settings, SmartFavorites, Analytics)
│   │   ├── services/         # API and routing logic
│   │   ├── utils/            # Utility functions (including ML learning system)
│   │   └── store/            # Redux slices (user, weather, traffic, transit)
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite config
├── backend/                  # FastAPI backend (Python 3.11+)
│   ├── api/                  # API routes (weather, traffic, transit)
│   ├── models/               # Database models (if used)
│   ├── utils/                # Utility functions
│   ├── config.py             # Settings
│   └── requirements.txt      # Python dependencies
├── ML_IMPLEMENTATION_PROGRESS.md  # ML features implementation roadmap
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

## Machine Learning Features

The app now includes intelligent learning capabilities that adapt to your commute patterns:

### Smart Learning System
- **Destination Memory:** Automatically remembers your preferred transport method for each destination
- **Usage Patterns:** Tracks which destinations you visit most frequently
- **Weather Adaptation:** Learns how you adapt your transport choices based on weather conditions
- **Time-based Preferences:** Recognizes your commute patterns throughout different times of day

### User Interface
- **Smart Defaults:** When you select a destination, the app automatically suggests your usual transport method
- **Frequent Destinations:** Your most visited locations are marked with star icons and show visit counts
- **Enhanced Recommendations:** Transport options show personalized reasons like "Your usual choice" or "Smart suggestion"
- **Smart Favorites Page:** Access curated recommendations and insights about your commute patterns
- **Analytics Dashboard:** View detailed statistics about your transport usage, top destinations, and behavioral patterns

### Privacy & Control
- **Local Storage Only:** All learning data is stored locally on your device - nothing is shared externally
- **Transparent Recommendations:** The app shows you why it made each suggestion
- **User Feedback:** Provide feedback on recommendations to improve accuracy
- **Data Control:** Clear all learning data anytime from the Analytics page

### Navigation
Use the footer buttons to access:
- **Smart Favorites (⭐):** View ML-curated destination suggestions and commute insights
- **Analytics (📊):** See detailed statistics and patterns about your commute behavior
- **Settings (⚙️):** Manage app preferences and account settings

## Next Steps
- **Enhanced ML Features:** Continue implementing Phase 2 and Phase 3 features from the ML roadmap
- **User Profiles:** Add multi-user support instead of single default user
- **Design System:** Develop comprehensive styling and creative direction
- **Performance Optimization:** Improve speed and optimize API usage
- **Personalization:** Allow deeper profile customization and preferences
- **Backend ML Integration:** Add server-side ML capabilities and user preference synchronization

## Troubleshooting
- If the map or routing does not work, check your TomTom API key and domain restrictions.
- If you see CORS or API errors, ensure both frontend and backend URLs are correct in your `.env` files.
- For more help, see the troubleshooting section in this README or run `./Debug-Application.ps1`.

---

For more details, see the inline comments in the code and the documentation in each folder.
