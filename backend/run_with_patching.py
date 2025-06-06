"""
Run script that applies monkey patches before importing FastAPI.
This specifically fixes the ForwardRef._evaluate() issue in Python 3.12.
"""
import sys
import os
import typing
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the project root to the Python path to enable imports
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append(PROJECT_ROOT)

if sys.version_info >= (3, 12):
    logger.info("Python 3.12+ detected, applying compatibility patches...")
    
    # Patch ForwardRef._evaluate to handle the new 'recursive_guard' parameter
    original_evaluate = typing.ForwardRef._evaluate
    
    def patched_evaluate(self, globalns, localns, recursive_guard=None):
        if recursive_guard is None:
            recursive_guard = set()
        return original_evaluate(self, globalns, localns, recursive_guard)
    
    # Apply the monkey patch
    typing.ForwardRef._evaluate = patched_evaluate
    logger.info("Patched typing.ForwardRef._evaluate to handle recursive_guard parameter")

# Now import and run the application
import uvicorn

if __name__ == "__main__":
    logger.info("Starting Urban Commute Assistant API server...")
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
