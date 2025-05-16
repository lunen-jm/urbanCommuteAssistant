"""
Entry point for the FastAPI application for Render deployment.
This file imports the app from backend/api/main.py and exposes it for uvicorn.
"""
import sys
import os

# Add backend/api directory to Python path
base_dir = os.path.dirname(__file__)
api_dir = os.path.join(base_dir, 'backend', 'api')
sys.path.insert(0, api_dir)

# Import the FastAPI app
def get_app():
    from main import app
    return app

app = get_app()

del get_app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
