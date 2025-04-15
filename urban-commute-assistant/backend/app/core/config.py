# Configuration settings for the Urban Commute Assistant application

import os

class Config:
    # General configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///site.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # API keys for external services
    TRAFFIC_API_KEY = os.getenv('TRAFFIC_API_KEY', 'your_traffic_api_key')
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', 'your_weather_api_key')
    TRANSIT_API_KEY = os.getenv('TRANSIT_API_KEY', 'your_transit_api_key')

    # Notification settings
    NOTIFICATION_SERVICE_URL = os.getenv('NOTIFICATION_SERVICE_URL', 'http://localhost:5000/notifications')

    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')  # Allow all origins by default

    # Other settings can be added as needed
