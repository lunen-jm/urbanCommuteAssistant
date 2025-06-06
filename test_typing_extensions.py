#!/usr/bin/env python
# filepath: c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant-simple\test_typing_extensions.py
"""
Simple script to test typing_extensions compatibility with Python 3.12
"""

import sys
print(f"Python version: {sys.version}")

try:
    import typing_extensions
    print(f"typing_extensions version: {typing_extensions.__version__}")
    print("✅ typing_extensions imported successfully")
except ImportError as e:
    print(f"❌ Error importing typing_extensions: {e}")

try:
    import pydantic
    print(f"pydantic version: {pydantic.__version__}")
    print("✅ pydantic imported successfully")
except ImportError as e:
    print(f"❌ Error importing pydantic: {e}")

try:
    import jwt
    print(f"PyJWT version: {jwt.__version__}")
    print("✅ PyJWT imported successfully")
except ImportError as e:
    print(f"❌ Error importing PyJWT: {e}")

print("\nTest creating a Pydantic model with typing_extensions:")
try:
    from typing_extensions import Annotated
    from pydantic import BaseModel, Field
    
    class User(BaseModel):
        name: str
        age: int = Field(gt=0)
        
    user = User(name="Test User", age=30)
    print(f"✅ Created user: {user}")
except Exception as e:
    print(f"❌ Error creating Pydantic model: {e}")
