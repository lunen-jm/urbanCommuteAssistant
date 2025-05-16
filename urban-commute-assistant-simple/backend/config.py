import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings with validation and typing."""
    
    # Database configuration - Using SQLite for simplicity
    DATABASE_URL: str = "sqlite:///./site.db"
    
    # API keys
    WEATHER_API_KEY: str = os.environ.get("WEATHER_API_KEY", "32aa402c1136ae5ad8c7413f1abbadc6")
    TRAFFIC_API_KEY: str = os.environ.get("TRAFFIC_API_KEY", "AVPo4UqcZGSIMpKFcnj4C8whF9Gab1U0")
    
    # Transit data sources
    KC_METRO_GTFS_URL: str = "https://kingcounty.gov/~/media/depts/metro/schedules/gtfs/current-feed.zip"
    KC_METRO_GTFS_RT_URL: str = "https://api.pugetsound.onebusaway.org/api/where"
    
    # Security
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "your-secret-key-for-dev-replace-in-production")
      # CORS
    CORS_ORIGINS: list = ["*", "https://urbancommuteassistant.netlify.app"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create a singleton instance for the application to use
settings = Settings()
