"""
This file serves as a bridge to the actual application structure.
It's created to make Render's default configuration work with our project structure.
"""
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app from the real location
from backend.api.main import app

# No need to create a new variable, just use the imported app directly
