# Configuration settings for the Urban Commute Assistant application

from pydantic import BaseSettings, validator, Field
from typing import List, Union, Optional
import os
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with validation and typing."""
    
    # Database configuration
    DATABASE_URL: str = Field(
        ..., 
        description="PostgreSQL connection string",
        env="DATABASE_URL"
    )
    SQLALCHEMY_DATABASE_URI: str = Field(
        ..., 
        description="SQLAlchemy database URI",
        env="DATABASE_URL"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = Field(
        False, 
        description="SQLAlchemy track modifications setting"
    )
    POSTGRES_USER: str = Field(
        "postgres", 
        description="PostgreSQL username"
    )
    POSTGRES_PASSWORD: str = Field(
        "postgres", 
        description="PostgreSQL password"
    )
    POSTGRES_DB: str = Field(
        "urban_commute", 
        description="PostgreSQL database name"
    )
    
    # API keys
    WEATHER_API_KEY: str = Field(
        os.environ.get("WEATHER_API_KEY", "abcd1234efgh5678ijkl9012mnop3456"), 
        description="OpenWeatherMap API key"
    )
    TRAFFIC_API_KEY: str = Field(
        os.environ.get("TRAFFIC_API_KEY", "abcdefghijklmnop1234567890"), 
        description="TomTom API key"
    )
    TRANSIT_API_KEY: Optional[str] = Field(
        None, 
        description="Transit API key (if needed)"
    )
    
    # Transit data sources
    KC_METRO_GTFS_URL: str = Field(
        "https://kingcounty.gov/~/media/depts/metro/schedules/gtfs/current-feed.zip",
        description="King County Metro GTFS static data URL"
    )
    KC_METRO_GTFS_RT_URL: str = Field(
        "https://api.pugetsound.onebusaway.org/api/where",
        description="King County Metro GTFS-RT data URL"
    )
    
    # Redis configuration
    REDIS_URL: str = Field(
        "redis://localhost:6379/0",
        description="Redis connection string"
    )
    
    # Security
    SECRET_KEY: str = Field(
        ..., 
        description="Secret key for JWT tokens"
    )
    
    # Notification settings
    NOTIFICATION_SERVICE_URL: str = Field(
        "http://localhost:5000/notifications",
        description="Notification service URL"
    )
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = Field(
        "*",
        description="Comma-separated list of allowed origins or * for all"
    )
    
    # Logging
    LOG_LEVEL: str = Field(
        "INFO", 
        description="Logging level"
    )
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS into a list of strings."""
        if isinstance(v, str) and not v.startswith("["):
            if v == "*":
                return ["*"]
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("SQLALCHEMY_DATABASE_URI", pre=True, always=True)
    def set_sqlalchemy_database_uri(cls, v, values):
        """Set SQLALCHEMY_DATABASE_URI from DATABASE_URL if not explicitly set."""
        if v:
            return v
        return values.get("DATABASE_URL", "sqlite:///site.db")
    
    @validator("DATABASE_URL", "SECRET_KEY", pre=True)
    def validate_required(cls, v, values, **kwargs):
        """Validate required fields."""
        field_name = kwargs["field"].name
        if not v:
            raise ValueError(f"{field_name} is required but not provided or empty")
        return v
        
    @validator("WEATHER_API_KEY", "TRAFFIC_API_KEY", pre=True)
    def validate_api_keys(cls, v, values, **kwargs):
        """Validate API keys but with fallback values."""
        field_name = kwargs["field"].name
        if not v:
            # Log a warning instead of raising an error
            import logging
            logging.warning(f"{field_name} is not provided or empty, using default value")
            # Return the default value from the field
            return getattr(cls, field_name).default
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        
        # For backward compatibility with the old Config class
        @classmethod
        def parse_env_var(cls, field_name, raw_val):
            """Parse environment variables to appropriate types."""
            if field_name == "CORS_ORIGINS" and raw_val == "*":
                return ["*"]
            return raw_val


@lru_cache()
def get_settings():
    """Get settings singleton instance with caching to avoid repeated env file reads."""
    return Settings()

# Create a singleton instance for the application to use
settings = get_settings()

# For backward compatibility with existing code
class Config:
    """Legacy Config class that delegates to the Settings instance.
    This provides backward compatibility for code that uses Config.VARIABLE_NAME.
    New code should use settings.VARIABLE_NAME instead.
    """
    # Make Config attributes delegate to settings
    SECRET_KEY = settings.SECRET_KEY
    SQLALCHEMY_DATABASE_URI = settings.SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = settings.SQLALCHEMY_TRACK_MODIFICATIONS
    TRAFFIC_API_KEY = settings.TRAFFIC_API_KEY
    WEATHER_API_KEY = settings.WEATHER_API_KEY
    TRANSIT_API_KEY = settings.TRANSIT_API_KEY
    KC_METRO_GTFS_URL = settings.KC_METRO_GTFS_URL
    KC_METRO_GTFS_RT_URL = settings.KC_METRO_GTFS_RT_URL
    REDIS_URL = settings.REDIS_URL
    NOTIFICATION_SERVICE_URL = settings.NOTIFICATION_SERVICE_URL
    CORS_ORIGINS = settings.CORS_ORIGINS
