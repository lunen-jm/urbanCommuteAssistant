"""
A compatible version of the run.py script that uses manually configured imports
to work around the ForwardRef._evaluate() issue in Python 3.12.
"""
import os
import sys
import uvicorn

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Load API inside the function to prevent import issues
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
