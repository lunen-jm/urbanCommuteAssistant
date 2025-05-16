#!/usr/bin/env python
"""
Environment Variable Checker Script

This script checks if critical environment variables are properly set.
Run this script to verify your environment configuration.
"""

import os
import sys
from dotenv import load_dotenv

# Try to load .env file
load_dotenv()

# Critical environment variables to check
CRITICAL_VARS = [
    "DATABASE_URL",
    "WEATHER_API_KEY",
    "TRAFFIC_API_KEY",
    "REDIS_URL",
    "SECRET_KEY"
]

# Optional environment variables to check
OPTIONAL_VARS = [
    "TRANSIT_API_KEY",
    "KC_METRO_GTFS_URL",
    "KC_METRO_GTFS_RT_URL",
    "CORS_ORIGINS"
]

def format_value(var_name, value):
    """Format the value for display, masking sensitive information."""
    if not value:
        return "---"
    
    # Mask API keys and secrets for security
    if any(keyword in var_name.upper() for keyword in ["API_KEY", "SECRET", "PASSWORD"]):
        if len(value) > 8:
            return f"{value[:4]}...{value[-4:]}"
        else:
            return "******"
    return value

def check_vars(variables, required=True):
    """Check a list of environment variables."""
    missing = []
    print(f"\n{'CRITICAL' if required else 'OPTIONAL'} ENVIRONMENT VARIABLES:")
    print("-" * 50)
    
    for var in variables:
        value = os.environ.get(var)
        if required and not value:
            missing.append(var)
            status = "❌ MISSING"
        elif value:
            status = "✅ SET" 
        else:
            status = "⚠️ NOT SET (optional)"
            
        print(f"{var:25} {status:15} {format_value(var, value)}")
    
    return missing

def main():
    """Main function to check environment variables."""
    print("=" * 50)
    print("ENVIRONMENT VARIABLE CHECKER")
    print("=" * 50)
    
    missing_critical = check_vars(CRITICAL_VARS, required=True)
    check_vars(OPTIONAL_VARS, required=False)
    
    print("\nENVIRONMENT INFO:")
    print("-" * 50)
    print(f"Python version:      {sys.version.split()[0]}")
    print(f"Working directory:   {os.getcwd()}")
    env_files = [f for f in os.listdir() if '.env' in f]
    print(f"Found .env files:    {', '.join(env_files) if env_files else 'None'}")
    
    if missing_critical:
        print("\n❌ ERROR: Missing critical environment variables:")
        for var in missing_critical:
            print(f"  - {var}")
        print("\nPlease set these variables in your .env file or environment.")
        return 1
    else:
        print("\n✅ All critical environment variables are set!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
