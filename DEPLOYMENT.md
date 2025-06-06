# Deployment Guide

This guide covers both local development setup and production deployment for the Urban Commute Assistant.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+ 
- Node.js 16+
- npm

### Setup
1. **Clone and navigate:**
   ```bash
   git clone https://github.com/your-username/urban-commute-assistant.git
   cd TECHIN510-Developer
   ```

2. **Automated setup (recommended):**
   ```powershell
   .\Setup-Environment.ps1    # Install Python dependencies
   .\Start-Urban-Commute.ps1  # Start both servers
   ```

3. **Manual setup:**
   ```powershell
   # Backend
   cd backend
   pip install -r requirements.txt
   python main.py

   # Frontend (new terminal)
   cd frontend
   npm install
   npm run dev
   ```

4. **Configure API keys:**
   - Copy `backend\.env.example` to `backend\.env`
   - Copy `frontend\.env.example` to `frontend\.env`
   - Add your API keys (see Environment Variables section below)

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🌐 Production Deployment

### Backend (Render.com)
1. Connect your GitHub repository to Render
2. Use these settings:
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn api.main:app --host 0.0.0.0 --port $PORT`
3. Set environment variables (see below)

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Use these settings:
   - **Build Command:** `cd frontend && npm run build`
   - **Publish Directory:** `frontend/dist`
3. Set environment variables (see below)

## 🔐 Environment Variables

### Backend (.env)
```
# API Keys
WEATHER_API_KEY=your_openweather_api_key
TRAFFIC_API_KEY=your_tomtom_traffic_api_key
SECRET_KEY=your_jwt_secret_key

# CORS (for production)
CORS_ORIGINS=["https://yourapp.netlify.app"]
```

### Frontend (.env)
```
# API Configuration
VITE_API_URL=http://localhost:8000  # For local dev
# VITE_API_URL=https://yourapp.onrender.com  # For production

# Map & Routing
VITE_TOMTOM_API_KEY=your_tomtom_api_key
```

## 🛠️ API Keys Setup

You'll need accounts and API keys for:

1. **OpenWeatherMap** (weather data)
   - Sign up at https://openweathermap.org/api
   - Free tier: 1,000 calls/day

2. **TomTom** (maps, routing, traffic)
   - Sign up at https://developer.tomtom.com
   - Free tier: 2,500 requests/day

## 🐛 Troubleshooting

### Common Issues
- **Port conflicts:** Ensure ports 5173 and 8000 are available
- **CORS errors:** Check `CORS_ORIGINS` in backend .env
- **API errors:** Verify API keys are correct and have sufficient quota
- **Map not loading:** Check TomTom API key and domain restrictions

### Debug Scripts
```powershell
.\Debug-Application.ps1  # Run diagnostics
```

### Logs
- Frontend: Check browser console
- Backend: Check terminal output
- Production: Check Render/Netlify deployment logs

## 📁 Project Structure
```
├── frontend/           # React + Vite + Redux
├── backend/           # FastAPI + Python 3.11
├── app/              # Render compatibility layer
├── Setup-Environment.ps1
├── Start-Urban-Commute.ps1
└── README.md
```

---

For detailed feature information, see the main [README.md](README.md).
