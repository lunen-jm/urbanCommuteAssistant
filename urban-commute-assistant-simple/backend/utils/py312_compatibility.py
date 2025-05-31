"""
Compatibility layer for Python 3.12 with FastAPI and Pydantic.

This module provides monkey patches and workarounds for the incompatibilities
between Python 3.12 and older versions of FastAPI (0.95.x) and Pydantic (1.10.x).
"""

import sys
import logging

logger = logging.getLogger(__name__)

def apply_patches():
    """Apply all compatibility patches for Python 3.12."""
    if sys.version_info >= (3, 12):
        logger.info("Python 3.12+ detected, applying compatibility patches...")
        
        # Patch for ForwardRef._evaluate missing 'recursive_guard' parameter
        try:
            import typing
            
            # Store the original _evaluate method
            # original_evaluate = typing.ForwardRef._evaluate # Removing this line
            
            # Define a patched version that handles both call signatures
            # def patched_evaluate(self, globalns, localns, recursive_guard=None): # Removing this line
            #     if recursive_guard is None: # Removing this line
            #         recursive_guard = set() # Removing this line
            #     try: # Removing this line
            #         # Try the Python 3.12 signature first # Removing this line
            #         return original_evaluate(self, globalns, localns, recursive_guard) # Removing this line
            #     except TypeError: # Removing this line
            #         # Fall back to the older signature without recursive_guard # Removing this line
            #         return original_evaluate(self, globalns, localns) # Removing this line
            
            # Apply the patch
            # typing.ForwardRef._evaluate = patched_evaluate # Removing this line
            logger.info("Skipping patch for typing.ForwardRef._evaluate as it may conflict with Pydantic v2")
        except Exception as e:
            logger.error(f"Failed to patch typing.ForwardRef._evaluate: {e}")
            
        # Additional patches can be added here as needed
    else:
        logger.info("Python version < 3.12, no compatibility patches needed.")
