# Urban Commute Assistant

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

## Project Structure

```
├── frontend/                 # React app (Vite, Redux, Leaflet for maps)
│   ├── src/
│   │   ├── components/       # UI components (Map, Header, Dashboard, etc.)
│   │   ├── pages/            # Page components (Home, Analytics, SmartFavorites, Settings)
│   │   ├── services/         # API and routing logic
│   │   ├── utils/            # Utility functions (including ML learning system)
│   │   └── store/            # Redux slices (user, weather, traffic, transit)
│   └── package.json          # Frontend dependencies
├── backend/                  # FastAPI backend (Python 3.11+)
│   ├── api/                  # API routes (weather, traffic, transit, users)
│   ├── services/             # External API integrations
│   └── requirements.txt      # Python dependencies
├── app/                      # Render.com compatibility layer
├── ML_FEATURES.md           # Machine learning features documentation
├── DEPLOYMENT.md            # Setup and deployment guide
├── Setup-Environment.ps1    # Automated Python environment setup
├── Start-Urban-Commute.ps1  # Start both frontend and backend servers
└── README.md               # Main project documentation
```

## Getting Started

### Prerequisites
- Python 3.11.5 (backend)
- Node.js 14+ (frontend)
- npm or yarn

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/urban-commute-assistant.git
   cd TECHIN510-Developer
   ```
2. **Quick start (recommended):**
   ```powershell
   .\Setup-Environment.ps1    # Install dependencies
   .\Start-Urban-Commute.ps1  # Start both servers
   ```
3. **Configure API Keys:**
   - Copy `.env.example` to `.env` in both `frontend/` and `backend/`
   - Add your API keys (see [DEPLOYMENT.md](DEPLOYMENT.md) for details)
4. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

> 📖 **Need more help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup, troubleshooting, and production deployment instructions.

## How to Add or Edit Locations

- The app includes four default locations:
  - **Home:** House in Bellevue
  - **Work:** Microsoft Redmond Campus
  - **Gym:** Crossroads Planet Fitness, Bellevue
  - **School:** Global Innovation Exchange (GIX), Bellevue
- To change these, edit the `savedLocations` array in `frontend/src/store/userSlice.js` and restart the frontend.
- Transit options always use your current location (via browser geolocation) for accuracy.

## Machine Learning Features

The app includes intelligent learning capabilities that adapt to your commute patterns:

### 🧠 Smart Learning System
- **Smart Defaults:** Remembers your preferred transport method for each destination
- **Usage Patterns:** Tracks destination frequency and shows star icons for favorites  
- **Weather Adaptation:** Learns transport preferences based on weather conditions
- **Analytics Dashboard:** View detailed statistics and commute patterns

### 🔒 Privacy-First Design
- **Local Storage Only:** All learning data stays on your device
- **Transparent Recommendations:** See why each suggestion was made
- **User Control:** Clear all ML data anytime from the Analytics page

### 📱 Easy Access
Use the footer navigation to access:
- **Smart Favorites (⭐):** ML-curated destination suggestions
- **Analytics (📊):** Detailed insights and patterns
- **Settings (⚙️):** Manage preferences and clear data

> 🧠 **Learn more:** See [ML_FEATURES.md](ML_FEATURES.md) for technical details and implementation information.

## Next Steps
- **Enhanced ML Features:** Advanced route optimization and predictive analytics
- **Design System:** Comprehensive UI/UX improvements and theming
- **Performance Optimization:** Caching, API optimization, and mobile performance
- **Backend ML Integration:** Optional cloud sync and advanced analytics
- **Multi-user Support:** User accounts and profile management

## Troubleshooting
- **Map issues:** Check TomTom API key and domain restrictions
- **CORS errors:** Verify frontend/backend URLs in `.env` files  
- **API errors:** Confirm API keys have sufficient quota
- **General issues:** Run `.\Debug-Application.ps1` for diagnostics

> 🔧 **Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting and setup assistance.

## Documentation

- **[README.md](README.md)** - Main project overview (this file)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Setup, deployment, and troubleshooting
- **[ML_FEATURES.md](ML_FEATURES.md)** - Machine learning implementation details
- **[app/README.md](app/README.md)** - Render.com compatibility notes

---

Built with ❤️ for Seattle commuters. Responsive design, privacy-first ML, and real-time data integration.
