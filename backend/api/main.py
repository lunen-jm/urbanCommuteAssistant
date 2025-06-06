from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import weather, traffic, transit, users
import sys
import os

# Add the parent directory to sys.path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

app = FastAPI(title="Urban Commute Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather.router, prefix="/api")
app.include_router(traffic.router, prefix="/api")
app.include_router(transit.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Urban Commute Assistant API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
