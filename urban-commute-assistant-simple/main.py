"""
Entry point for the FastAPI application for Render deployment.
This file loads the app from backend/api/main.py using importlib, bypassing module path issues.
"""
import importlib.util
import os
import sys

api_main_path = os.path.join(os.path.dirname(__file__), 'backend', 'api', 'main.py')
if not os.path.exists(api_main_path):
    raise RuntimeError(f"Could not find backend/api/main.py at {api_main_path}")

spec = importlib.util.spec_from_file_location("api.main", api_main_path)
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load spec for backend/api/main.py")

api_main = importlib.util.module_from_spec(spec)
sys.modules["api.main"] = api_main
spec.loader.exec_module(api_main)
app = api_main.app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
