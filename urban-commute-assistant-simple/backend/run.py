import uvicorn
import sys
import os

# Add the current directory to path to make imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Apply Python 3.12 compatibility patches if needed
if sys.version_info >= (3, 12):
    try:
        # Try absolute import
        from backend.utils.py312_compatibility import apply_patches
    except ImportError:
        # Try relative import
        from utils.py312_compatibility import apply_patches
    apply_patches()

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
