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
            original_evaluate = typing.ForwardRef._evaluate
            
            # Define a patched version that handles both call signatures
            def patched_evaluate(self, globalns, localns, recursive_guard=None):
                if recursive_guard is None:
                    recursive_guard = set()
                try:
                    # Try the Python 3.12 signature first
                    return original_evaluate(self, globalns, localns, recursive_guard)
                except TypeError:
                    # Fall back to the older signature without recursive_guard
                    return original_evaluate(self, globalns, localns)
            
            # Apply the patch
            typing.ForwardRef._evaluate = patched_evaluate
            logger.info("Successfully patched typing.ForwardRef._evaluate")
        except Exception as e:
            logger.error(f"Failed to patch typing.ForwardRef._evaluate: {e}")
            
        # Additional patches can be added here as needed
    else:
        logger.info("Python version < 3.12, no compatibility patches needed.")
