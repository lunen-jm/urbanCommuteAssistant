from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.integrated_data import router as integrated_data_router
from app.api.routes import router as routes_router
from app.api.routes.debug import router as debug_router
from app.api.auth import router as auth_router
from app.api.integrations.traffic import router as traffic_router
from app.api.integrations.weather import router as weather_router
from app.api.integrations.transit import router as transit_router
from app.core.config import settings
from app.db.init_db import init_database
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="Urban Commute Assistant API",
    description="API for integrating traffic, weather, and transit data",
    version="1.0.0",
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()

# Parse allowed origins from config
allowed_origins = settings.CORS_ORIGINS
if isinstance(allowed_origins, str):
    # If it's a string, split by comma
    allowed_origins = [origin.strip() for origin in allowed_origins.split(",")]
    # If wildcard is present, just use that
    if "*" in allowed_origins:
        allowed_origins = ["*"]

# Middleware to allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Use the parsed allowed_origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routers with the /api prefix
main_router = APIRouter(prefix="/api")

# Include auth router
main_router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Include integration routers
main_router.include_router(traffic_router)
main_router.include_router(weather_router)
main_router.include_router(transit_router)

# Include integrated_data_router with the /data prefix
main_router.include_router(integrated_data_router, prefix="/data", tags=["integrated-data"])

# Include debug router
main_router.include_router(debug_router, prefix="/debug", tags=["debug"])

# Include routes_router which may have additional routes
main_router.include_router(routes_router)

app.include_router(main_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Urban Commute Assistant API!"}