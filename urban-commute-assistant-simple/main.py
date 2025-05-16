"""
Main module for FastAPI application - Used as entry point for Render deployment
"""
# Import sys and os early
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import the FastAPI app from api.main
from backend.api.main import app as application

# Export the application
app = application

# This allows this file to be run directly by Render
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
